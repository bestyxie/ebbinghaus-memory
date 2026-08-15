import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { randomUUID } from 'crypto'
import { prisma } from '@/app/lib/prisma'
import { requireAuth } from '@/app/lib/api-helpers'
import {
  ensureMediaDir,
  mediaFileName,
  mediaTypeForMime,
  validateMediaFile,
  MAX_MEDIA_BYTES,
  MEDIA_MIME_ALLOWLIST,
  COVER_MIME_ALLOWLIST,
  absoluteMediaPath,
} from '@/app/lib/course-media'
import { transcriptSchema, type CourseSummary } from '@ebbinghaus/shared'

/**
 * POST /api/courses — multipart 上传创建课程
 * fields: media (file, 必填), cover (file, 可选), title (string, 必填)
 */
export async function POST(request: NextRequest) {
  const userId = await requireAuth(request)
  if (userId instanceof NextResponse) return userId

  try {
    const form = await request.formData()
    const media = form.get('media')
    const cover = form.get('cover')
    const title = String(form.get('title') ?? '').trim()

    if (!(media instanceof File)) {
      return NextResponse.json({ error: 'media file is required' }, { status: 400 })
    }
    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    const mediaType = mediaTypeForMime(media.type)
    if (!mediaType) {
      return NextResponse.json({ error: `Unsupported media type: ${media.type || 'unknown'}` }, { status: 400 })
    }
    const mediaCheck = validateMediaFile(media.type, media.size, MEDIA_MIME_ALLOWLIST, MAX_MEDIA_BYTES)
    if ('error' in mediaCheck) {
      return NextResponse.json({ error: mediaCheck.error }, { status: 400 })
    }

    let coverFileName: string | null = null
    if (cover instanceof File && cover.size > 0) {
      const coverCheck = validateMediaFile(cover.type, cover.size, COVER_MIME_ALLOWLIST, 5 * 1024 * 1024)
      if ('error' in coverCheck) {
        return NextResponse.json({ error: coverCheck.error }, { status: 400 })
      }
      coverFileName = mediaFileName(randomUUID(), coverCheck.ext)
      await ensureMediaDir()
      await writeFile(absoluteMediaPath(coverFileName), Buffer.from(await cover.arrayBuffer()))
    }

    const mediaFileId = randomUUID()
    const mediaRelative = mediaFileName(mediaFileId, mediaCheck.ext)
    await ensureMediaDir()
    await writeFile(absoluteMediaPath(mediaRelative), Buffer.from(await media.arrayBuffer()))

    const course = await prisma.course.create({
      data: {
        userId,
        title: title.slice(0, 200),
        mediaType,
        mediaPath: mediaRelative,
        coverPath: coverFileName,
        durationMs: 0,
        status: 'PROCESSING',
      },
    })

    return NextResponse.json(
      { course: toSummary(course, null) },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 })
  }
}

/**
 * GET /api/courses — 当前用户课程列表
 */
export async function GET(request: NextRequest) {
  const userId = await requireAuth(request)
  if (userId instanceof NextResponse) return userId

  try {
    const courses = await prisma.course.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { progress: true },
    })
    return NextResponse.json({ courses: courses.map((c) => toSummary(c, c.progress)) })
  } catch (error) {
    console.error('Error listing courses:', error)
    return NextResponse.json({ error: 'Failed to list courses' }, { status: 500 })
  }
}

// Prisma Course + progress → CourseSummary
function toSummary(
  course: {
    id: string
    title: string
    mediaType: 'AUDIO' | 'VIDEO'
    coverPath: string | null
    durationMs: number
    status: 'PROCESSING' | 'READY' | 'FAILED'
    error: string | null
    transcript: unknown
    createdAt: Date
  },
  progress: {
    sentenceIndex: number
    completedSentenceIds: number[]
    status: 'IN_PROGRESS' | 'COMPLETED'
  } | null,
): CourseSummary {
  const parsed = transcriptSchema.safeParse(course.transcript)
  return {
    id: course.id,
    title: course.title,
    mediaType: course.mediaType,
    coverPath: course.coverPath,
    durationMs: course.durationMs,
    status: course.status,
    error: course.error,
    sentenceCount: parsed.success ? parsed.data.length : 0,
    createdAt: course.createdAt.toISOString(),
    progress: progress
      ? {
          sentenceIndex: progress.sentenceIndex,
          completedSentenceIds: progress.completedSentenceIds,
          status: progress.status,
        }
      : null,
  }
}
