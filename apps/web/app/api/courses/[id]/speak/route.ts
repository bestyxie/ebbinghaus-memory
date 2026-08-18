import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { requireAuth } from '@/app/lib/api-helpers'
import { getScoreProvider } from '@/app/lib/score-provider'
import { applySpeakingResult, type SpeakingProgressState } from '@/app/lib/speaking-progress'
import { speakingDifficultySchema, transcriptSchema, speakingProgressSchema } from '@ebbinghaus/shared'
import type { SpeakingDifficultyValue, SpeakingProgress } from '@ebbinghaus/shared'

export const maxDuration = 60 // 评分可能等待真实引擎返回

const DIFFICULTIES: SpeakingDifficultyValue[] = ['EASY', 'MEDIUM', 'HARD']

/** Prisma Json → (number|null)[]（非法元素按 null 处理） */
function bestScoresFromJson(value: unknown): (number | null)[] {
  if (!Array.isArray(value)) return []
  return value.map((v) => (typeof v === 'number' && Number.isFinite(v) ? v : null))
}

/** SpeakingProgress 行 → 响应类型 */
function toProgress(row: {
  difficulty: SpeakingDifficultyValue
  sentenceIndex: number
  completedSentenceIds: number[]
  status: 'IN_PROGRESS' | 'COMPLETED'
  bestScores: unknown
}): SpeakingProgress {
  const parsed = speakingProgressSchema.safeParse({
    difficulty: row.difficulty,
    sentenceIndex: row.sentenceIndex,
    completedSentenceIds: row.completedSentenceIds,
    status: row.status,
    bestScores: Array.isArray(row.bestScores) ? row.bestScores : null,
  })
  return parsed.success
    ? parsed.data
    : {
        difficulty: row.difficulty,
        sentenceIndex: row.sentenceIndex,
        completedSentenceIds: row.completedSentenceIds,
        status: row.status,
        bestScores: null,
      }
}

/**
 * GET /api/courses/[id]/speak — 三难度口语进度（弹窗展示与续学用）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await requireAuth(request)
  if (userId instanceof NextResponse) return userId

  try {
    const { id } = await params
    const course = await prisma.course.findUnique({ where: { id }, select: { userId: true } })
    if (!course || course.userId !== userId) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const rows = await prisma.speakingProgress.findMany({
      where: { courseId: id, userId },
    })
    const byDifficulty = new Map(rows.map((r) => [r.difficulty, r]))
    const progress = DIFFICULTIES.map((d) => {
      const row = byDifficulty.get(d)
      return row ? toProgress(row) : { difficulty: d, sentenceIndex: 0, completedSentenceIds: [], status: 'IN_PROGRESS' as const, bestScores: null }
    })
    return NextResponse.json({ progress })
  } catch (error) {
    console.error('Error fetching speaking progress:', error)
    return NextResponse.json({ error: 'Failed to fetch speaking progress' }, { status: 500 })
  }
}

/**
 * POST /api/courses/[id]/speak — 评分一次录音并更新该难度进度
 * multipart: audio (file) + sentenceIdx + difficulty + durationMs
 * 目标文本取自服务端 transcript（不信客户端），返回评分结果 + 更新后进度
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await requireAuth(request)
  if (userId instanceof NextResponse) return userId

  try {
    const { id } = await params
    const course = await prisma.course.findUnique({ where: { id } })
    if (!course || course.userId !== userId) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    if (course.status !== 'READY') {
      return NextResponse.json({ error: 'Course is not READY' }, { status: 409 })
    }

    const form = await request.formData()
    const audio = form.get('audio')
    const sentenceIdxRaw = String(form.get('sentenceIdx') ?? '').trim()
    const difficultyRaw = String(form.get('difficulty') ?? '').trim()
    const durationRaw = String(form.get('durationMs') ?? '').trim()
    if (!(audio instanceof File) || audio.size === 0) {
      return NextResponse.json({ error: 'audio file is required' }, { status: 400 })
    }
    const difficulty = speakingDifficultySchema.safeParse(difficultyRaw)
    if (!difficulty.success) {
      return NextResponse.json({ error: 'Invalid difficulty' }, { status: 400 })
    }
    const sentenceIdx = Number(sentenceIdxRaw)
    const durationMs = Number(durationRaw)
    if (!Number.isInteger(sentenceIdx) || sentenceIdx < 0 || !Number.isFinite(durationMs) || durationMs <= 0) {
      return NextResponse.json({ error: 'Invalid sentenceIdx or durationMs' }, { status: 400 })
    }

    const parsed = transcriptSchema.safeParse(course.transcript)
    if (!parsed.success || parsed.data.length === 0) {
      return NextResponse.json({ error: 'No transcript available' }, { status: 400 })
    }
    const sentence = parsed.data[sentenceIdx]
    if (!sentence) {
      return NextResponse.json({ error: 'Sentence index out of range' }, { status: 400 })
    }

    const provider = getScoreProvider()
    const result = await provider.scoreRecording({
      audio: Buffer.from(await audio.arrayBuffer()),
      mime: audio.type || 'audio/webm',
      referenceText: sentence.text,
      durationMs,
    })

    const existing = await prisma.speakingProgress.findUnique({
      where: { userId_courseId_difficulty: { userId, courseId: id, difficulty: difficulty.data } },
    })
    const state: SpeakingProgressState = existing
      ? {
          bestScores: bestScoresFromJson(existing.bestScores),
          completedSentenceIds: existing.completedSentenceIds,
          sentenceIndex: existing.sentenceIndex,
          status: existing.status,
        }
      : { bestScores: [], completedSentenceIds: [], sentenceIndex: 0, status: 'IN_PROGRESS' }
    const next = applySpeakingResult(state, parsed.data.length, sentenceIdx, result.overall)

    const row = await prisma.speakingProgress.upsert({
      where: { userId_courseId_difficulty: { userId, courseId: id, difficulty: difficulty.data } },
      create: {
        userId,
        courseId: id,
        difficulty: difficulty.data,
        sentenceIndex: next.sentenceIndex,
        bestScores: next.bestScores,
        completedSentenceIds: next.completedSentenceIds,
        status: next.status,
      },
      update: {
        sentenceIndex: next.sentenceIndex,
        bestScores: next.bestScores,
        completedSentenceIds: next.completedSentenceIds,
        status: next.status,
      },
    })

    return NextResponse.json({ result, progress: toProgress(row) })
  } catch (error) {
    console.error('Error scoring speaking recording:', error)
    return NextResponse.json({ error: 'Failed to score recording' }, { status: 500 })
  }
}