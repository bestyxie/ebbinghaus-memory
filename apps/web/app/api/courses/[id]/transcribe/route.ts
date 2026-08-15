import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { prisma } from '@/app/lib/prisma'
import { requireAuth } from '@/app/lib/api-helpers'
import { absoluteMediaPath } from '@/app/lib/course-media'
import { callTranscriptionModel, markProperNouns } from '@/app/lib/course-transcribe'
import { transcriptSchema } from '@ebbinghaus/shared'

export const maxDuration = 300 // 转写可能耗时 1-2 分钟

/**
 * POST /api/courses/[id]/transcribe — 触发转写（同步等待完成）
 * 读媒体文件 → GLM-4.6-Flash 逐句转写 → glm-5.1 标记专有名词 → 写 transcript
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

    // 读文件 → base64 → 转写
    const buffer = await readFile(absoluteMediaPath(course.mediaPath))
    const base64 = buffer.toString('base64')
    const transcription = await callTranscriptionModel(base64, course.mediaType)
    if (transcription.error || transcription.sentences.length === 0) {
      const error = transcription.error ?? 'Empty transcription'
      await prisma.course.update({ where: { id }, data: { status: 'FAILED', error } })
      return NextResponse.json({ error }, { status: 502 })
    }

    // 标记专有名词
    const marked = await markProperNouns(transcription.sentences)
    if (marked.error || marked.result.length === 0) {
      const error = marked.error ?? 'Proper noun marking returned nothing'
      await prisma.course.update({ where: { id }, data: { status: 'FAILED', error } })
      return NextResponse.json({ error }, { status: 502 })
    }

    const durationMs = marked.result[marked.result.length - 1].endMs
    await prisma.course.update({
      where: { id },
      data: {
        transcript: marked.result,
        durationMs,
        status: 'READY',
        error: null,
      },
    })

    const parsed = transcriptSchema.safeParse(marked.result)
    return NextResponse.json({
      sentenceCount: parsed.success ? parsed.data.length : marked.result.length,
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
