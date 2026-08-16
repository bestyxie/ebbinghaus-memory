import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { tmpdir } from 'os'
import path from 'path'
import { prisma } from '@/app/lib/prisma'
import { requireAuth } from '@/app/lib/api-helpers'
import { absoluteMediaPath } from '@/app/lib/course-media'
import { callGroqTranscription, callTranscriptionModel, markProperNouns, calibrateTimestamps, tokenizeSentence } from '@/app/lib/course-transcribe'
import { transcriptSchema } from '@ebbinghaus/shared'

const execFileAsync = promisify(execFile)

export const maxDuration = 300 // 转写可能耗时 1-2 分钟

/**
 * ffmpeg 转标准 16kHz 单声道 wav（分块转写的输入）。
 * ffmpeg 不可用或失败返回 null（调用方回落整段上传模式）。
 */
async function toStandardWav(inputPath: string): Promise<Buffer | null> {
  const out = path.join(tmpdir(), `asr-${Date.now()}-${Math.random().toString(36).slice(2)}.wav`)
  try {
    await execFileAsync('ffmpeg', ['-i', inputPath, '-ar', '16000', '-ac', '1', '-y', out], {
      timeout: 120_000,
    })
    return await readFile(out)
  } catch {
    return null
  } finally {
    execFileAsync('rm', ['-f', out]).catch(() => {})
  }
}

/** 从 unknown 读取对象字段 */
function fieldOf(data: unknown, key: string): unknown {
  if (typeof data !== 'object' || data === null) return undefined
  const record: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(data)) {
    record[k] = v
  }
  return record[key]
}

/**
 * POST /api/courses/[id]/transcribe — 触发转写（同步等待完成）
 * 读媒体文件 → Groq Whisper（句级时间戳精确）→ glm-5.1 标记专有名词 → 写 transcript
 * 未配置 GROQ_API_KEY 时回落 mimo-v2.5（时间戳不可靠，仅保底）
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
    if (course.status === 'READY') {
      return NextResponse.json({ error: 'Course already transcribed' }, { status: 409 })
    }

    await prisma.course.update({
      where: { id },
      data: { status: 'PROCESSING', error: null },
    })

    // 读文件 → Groq Whisper 转写（真实句级时间戳）；未配置/失败回落 mimo
    const buffer = await readFile(absoluteMediaPath(course.mediaPath))
    const mime = course.mediaType === 'VIDEO' ? 'video/mp4' : 'audio/mpeg'
    // ffmpeg 转标准 16kHz wav：分块转写需要可按字节切的 PCM（也规避 Whisper 整段跳读）
    const wav = await toStandardWav(absoluteMediaPath(course.mediaPath))
    let transcription = await callGroqTranscription({ buffer, mime }, wav ?? undefined)
    let engine = 'groq'
    let groqError: string | null = null
    if (transcription.error) {
      groqError = transcription.error
      console.warn(`Groq transcription unavailable (${groqError}); falling back to mimo`)
      engine = 'mimo-fallback'
      const base64 = buffer.toString('base64')
      transcription = await callTranscriptionModel(base64, course.mediaType)
    }
    if (transcription.error || transcription.sentences.length === 0) {
      // 保留 Groq 原始错误，避免回落层错误掩盖真实原因（如代理未开 403）
      const error = groqError
        ? `Groq: ${groqError}（回落 mimo 也失败: ${transcription.error ?? 'empty'}）`
        : transcription.error ?? 'Empty transcription'
      await prisma.course.update({ where: { id }, data: { status: 'FAILED', error } })
      return NextResponse.json({ error }, { status: 502 })
    }

    // Groq 时间戳真实对齐无需校准；仅 mimo 回落路径做线性校准（可选 body: { durationMs }）
    let reportedDurationMs: number | null = null
    try {
      const body: unknown = await request.json()
      const d = fieldOf(body, 'durationMs')
      reportedDurationMs = typeof d === 'number' && d > 0 ? d : null
    } catch {
      // 无 body（如列表页重试）时跳过校准
    }
    const calibrated =
      engine === 'groq'
        ? transcription.sentences
        : calibrateTimestamps(transcription.sentences, reportedDurationMs ?? (course.durationMs || null))

    // 标记专有名词；失败时降级为全 false（界面变为所有词都要输入），不让整门课失败
    const marked = await markProperNouns(calibrated)
    let finalResult = marked.result
    if (marked.error || marked.result.length === 0) {
      console.warn(`Proper noun marking failed (${marked.error}); degrading to all-false marks`)
      finalResult = calibrated.map((s, i) => ({
        idx: i,
        text: s.text,
        startMs: s.startMs,
        endMs: s.endMs,
        words: tokenizeSentence(s.text).map((text) => ({ text, isProperNoun: false })),
      }))
    }

    // 课程时长优先真实上报值；时间轴已按它校准，末句 endMs 与之接近
    const durationMs = reportedDurationMs ?? finalResult[finalResult.length - 1].endMs
    await prisma.course.update({
      where: { id },
      data: {
        transcript: finalResult,
        durationMs,
        status: 'READY',
        error: null,
      },
    })

    const parsed = transcriptSchema.safeParse(finalResult)
    return NextResponse.json({
      sentenceCount: parsed.success ? parsed.data.length : finalResult.length,
      durationMs,
    })
  } catch (error) {
    console.error('Error transcribing course:', error)
    const { id } = await params
    await prisma.course
      .update({ where: { id }, data: { status: 'FAILED', error: 'Unexpected server error' } })
      .catch(() => {})
    return NextResponse.json({ error: 'Failed to transcribe course' }, { status: 500 })
  }
}
