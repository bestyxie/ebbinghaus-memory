import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { prisma } from '@/app/lib/prisma'
import { requireAuth } from '@/app/lib/api-helpers'
import { absoluteMediaPath } from '@/app/lib/course-media'
import {
  enrichTranscript,
  mergeWordTimestamps,
  callGroqTranscription,
  toStandardWav,
} from '@/app/lib/course-transcribe'
import { transcriptSchema } from '@ebbinghaus/shared'

export const maxDuration = 300 // 富化可能重跑转写，耗时可达 1-2 分钟

/**
 * POST /api/courses/[id]/enrich — 存量 READY 课程补富化（口语学习需要）
 * 幂等：transcript 已含 translation/phonetic 且词级时间戳齐备时直接返回 { enriched: false }
 * 步骤：LLM 补中译+音标（enrichTranscript）→ 缺词级时间戳时重跑 Groq word granularity 合并
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

    const parsed = transcriptSchema.safeParse(course.transcript)
    if (!parsed.success || parsed.data.length === 0) {
      return NextResponse.json({ error: 'No valid transcript to enrich' }, { status: 400 })
    }

    let sentences = parsed.data
    const needsLlm = sentences.some(
      (s) => !s.translation || s.words.some((w) => !w.phonetic),
    )
    // 词级时间戳是"重跑一次即算补齐"：个别词匹配不上属正常降级（客户端按比例估算），
    // 只要有任何词已有时间戳就不再重跑，保证幂等
    const anyWordTs = sentences.some((s) => s.words.some((w) => w.startMs != null))
    const needsWordTs = !anyWordTs
    if (!needsLlm && !needsWordTs) {
      return NextResponse.json({ enriched: false })
    }

    if (needsLlm) {
      const enriched = await enrichTranscript(sentences)
      if (enriched.error) {
        console.warn(`Enrich LLM degraded (${enriched.error}); keeping existing fields`)
      }
      sentences = enriched.result
    }

    if (needsWordTs) {
      // 重跑 Groq word granularity 补齐词级时间戳；无 key/失败时跳过，客户端按比例估算兜底
      try {
        const buffer = await readFile(absoluteMediaPath(course.mediaPath))
        const mime = course.mediaType === 'VIDEO' ? 'video/mp4' : 'audio/mpeg'
        const wav = await toStandardWav(absoluteMediaPath(course.mediaPath))
        const trans = await callGroqTranscription({ buffer, mime }, wav ?? undefined)
        if (!trans.error && trans.sentences.length > 0) {
          sentences = mergeWordTimestamps(sentences, trans.sentences)
        } else {
          console.warn(`Word timestamp backfill skipped (${trans.error ?? 'empty'})`)
        }
      } catch (e) {
        console.warn(`Word timestamp backfill error: ${e instanceof Error ? e.message : 'unknown'}`)
      }
    }

    await prisma.course.update({
      where: { id },
      data: { transcript: sentences },
    })
    return NextResponse.json({ enriched: true })
  } catch (error) {
    console.error('Error enriching course:', error)
    return NextResponse.json({ error: 'Failed to enrich course' }, { status: 500 })
  }
}