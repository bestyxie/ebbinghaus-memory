import { NextRequest, NextResponse } from 'next/server'
import { createReadStream } from 'fs'
import { stat } from 'fs/promises'
import { Readable } from 'stream'
import { prisma } from '@/app/lib/prisma'
import { requireAuth } from '@/app/lib/api-helpers'
import { absoluteMediaPath } from '@/app/lib/course-media'

const MIME_BY_EXT: Record<string, string> = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  webm: 'audio/webm',
  ogg: 'audio/ogg',
  m4a: 'audio/mp4',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  mkv: 'video/x-matroska',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

function contentTypeFor(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() ?? ''
  return MIME_BY_EXT[ext] ?? 'application/octet-stream'
}

/** fs stream → web ReadableStream，按 Uint8Array 分块 */
function toWebStream(absolute: string, options?: { start: number; end: number }): ReadableStream<Uint8Array> {
  const stream = options ? createReadStream(absolute, options) : createReadStream(absolute)
  const web = Readable.toWeb(stream)
  // Readable.toWeb 返回 ReadableStream<any>；按 Node 语义它就是 Uint8Array 流
  const reader = web.getReader()
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await reader.read()
      if (done) {
        controller.close()
        return
      }
      controller.enqueue(value)
    },
    cancel(reason) {
      return reader.cancel(reason)
    },
  })
}

/**
 * GET /api/courses/[id]/media — 流式返回媒体文件，支持 HTTP Range（按句 seek 必需）
 * GET /api/courses/[id]/media?type=cover — 返回封面图
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await requireAuth(request)
  if (userId instanceof NextResponse) return userId

  const { id } = await params
  const course = await prisma.course.findUnique({ where: { id } })
  if (!course || course.userId !== userId) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }

  const isCover = request.nextUrl.searchParams.get('type') === 'cover'
  const relative = isCover ? course.coverPath : course.mediaPath
  if (!relative) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const absolute = absoluteMediaPath(relative)
  let size: number
  try {
    size = (await stat(absolute)).size
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
  const contentType = contentTypeFor(relative)

  const range = request.headers.get('range')
  // 封面无需 Range
  if (range && !isCover) {
    const match = /bytes=(\d*)-(\d*)/.exec(range)
    if (match) {
      const start = match[1] ? Number(match[1]) : 0
      const end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1
      if (start >= size || start > end) {
        return new NextResponse(null, {
          status: 416,
          headers: { 'Content-Range': `bytes */${size}` },
        })
      }
      return new NextResponse(toWebStream(absolute, { start, end }), {
        status: 206,
        headers: {
          'Content-Type': contentType,
          'Content-Length': String(end - start + 1),
          'Content-Range': `bytes ${start}-${end}/${size}`,
          'Accept-Ranges': 'bytes',
        },
      })
    }
  }

  return new NextResponse(toWebStream(absolute), {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Length': String(size),
      'Accept-Ranges': 'bytes',
    },
  })
}
