import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { prisma } from '@/app/lib/prisma'
import { requireAuth } from '@/app/lib/api-helpers'
import { absoluteMediaPath } from '@/app/lib/course-media'
import { callTranscriptionModel, markProperNouns, calibrateTimestamps } from '@/app/lib/course-transcribe'
import { transcriptSchema } from '@ebbinghaus/shared'

export const maxDuration = 300 // 转写可能耗时 1-2 分钟

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

    // 用客户端上报的真实时长校准模型时间戳漂移（可选 body: { durationMs }）
    let reportedDurationMs: number | null = null
    try {
      const body: unknown = await request.json()
      const d = fieldOf(body, 'durationMs')
      reportedDurationMs = typeof d === 'number' && d > 0 ? d : null
    } catch {
      // 无 body（如列表页重试）时跳过校准
    }
    const calibrated = calibrateTimestamps(transcription.sentences, reportedDurationMs ?? (course.durationMs || null))

    // 标记专有名词
    const marked = await markProperNouns(calibrated)
    if (marked.error || marked.result.length === 0) {
      const error = marked.error ?? 'Proper noun marking returned nothing'
      await prisma.course.update({ where: { id }, data: { status: 'FAILED', error } })
      return NextResponse.json({ error }, { status: 502 })
    }

    // 课程时长优先真实上报值；时间轴已按它校准，末句 endMs 与之接近
    const durationMs = reportedDurationMs ?? marked.result[marked.result.length - 1].endMs
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
