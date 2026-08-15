import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { prisma } from '@/app/lib/prisma'
import { requireAuth } from '@/app/lib/api-helpers'
import { absoluteMediaPath } from '@/app/lib/course-media'
import { updateCourseProgressSchema, transcriptSchema } from '@ebbinghaus/shared'

/**
 * GET /api/courses/[id] — 课程详情（transcript + progress）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await requireAuth(request)
  if (userId instanceof NextResponse) return userId

  try {
    const { id } = await params
    const course = await prisma.course.findUnique({
      where: { id },
      include: { progress: { where: { userId } } },
    })
    if (!course || course.userId !== userId) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const parsed = transcriptSchema.safeParse(course.transcript)
    const progressRow = Array.isArray(course.progress) ? course.progress[0] : null
    return NextResponse.json({
      course: {
        id: course.id,
        title: course.title,
        mediaType: course.mediaType,
        coverPath: course.coverPath,
        durationMs: course.durationMs,
        status: course.status,
        error: course.error,
        createdAt: course.createdAt.toISOString(),
        transcript: parsed.success ? parsed.data : [],
        progress: progressRow
          ? {
              sentenceIndex: progressRow.sentenceIndex,
              completedSentenceIds: progressRow.completedSentenceIds,
              status: progressRow.status,
            }
          : null,
      },
    })
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 })
  }
}

/**
 * DELETE /api/courses/[id] — 删除课程（级联进度 + 删除媒体/封面文件）
 */
export async function DELETE(
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

    await prisma.course.delete({ where: { id } })
    // 文件删除失败不阻断（文件可能已被手动清理）
    await Promise.allSettled([
      unlink(absoluteMediaPath(course.mediaPath)),
      course.coverPath ? unlink(absoluteMediaPath(course.coverPath)) : Promise.resolve(),
    ])
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 })
  }
}

/**
 * PUT /api/courses/[id]/progress 语义合并到此路由：PUT /api/courses/[id] 保存进度
 */
export async function PUT(
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

    const body = await request.json()
    const parsed = updateCourseProgressSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.message }, { status: 400 })
    }

    const progress = await prisma.courseProgress.upsert({
      where: { userId_courseId: { userId, courseId: id } },
      create: {
        userId,
        courseId: id,
        sentenceIndex: parsed.data.sentenceIndex,
        completedSentenceIds: parsed.data.completedSentenceIds,
        status: parsed.data.status,
      },
      update: {
        sentenceIndex: parsed.data.sentenceIndex,
        completedSentenceIds: parsed.data.completedSentenceIds,
        status: parsed.data.status,
      },
    })
    return NextResponse.json({
      progress: {
        sentenceIndex: progress.sentenceIndex,
        completedSentenceIds: progress.completedSentenceIds,
        status: progress.status,
      },
    })
  } catch (error) {
    console.error('Error updating course progress:', error)
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
  }
}
