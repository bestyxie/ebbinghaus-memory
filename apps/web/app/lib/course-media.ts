/**
 * 课程媒体文件落盘与校验
 * 文件存 apps/web/media/，数据库存相对路径
 */

import { mkdir } from 'fs/promises'
import path from 'path'

/** 媒体根目录（apps/web/media/） */
export const MEDIA_ROOT = path.join(process.cwd(), 'media')

export const MAX_MEDIA_BYTES = 100 * 1024 * 1024 // 100MB

/** 允许的媒体 MIME 白名单 */
export const MEDIA_MIME_ALLOWLIST = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/webm',
  'audio/ogg',
  'audio/mp4',
  'audio/x-m4a',
  'audio/m4a',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-matroska',
])

/** 允许的封面 MIME 白名单 */
export const COVER_MIME_ALLOWLIST = new Set(['image/jpeg', 'image/png', 'image/webp'])

const EXT_BY_MIME: Record<string, string> = {
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/mp4': 'm4a',
  'audio/x-m4a': 'm4a',
  'audio/m4a': 'm4a',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
  'video/x-matroska': 'mkv',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

/** MIME → 媒体类型；不在白名单返回 null */
export function mediaTypeForMime(mime: string): 'AUDIO' | 'VIDEO' | null {
  if (MEDIA_MIME_ALLOWLIST.has(mime)) {
    return mime.startsWith('video/') ? 'VIDEO' : 'AUDIO'
  }
  return null
}

/** 校验上传文件：类型白名单 + 大小限制；通过返回扩展名，否则返回 error */
export function validateMediaFile(mime: string, size: number, allowlist: Set<string>, maxBytes: number): { ext: string } | { error: string } {
  if (!allowlist.has(mime)) {
    return { error: `Unsupported file type: ${mime || 'unknown'}` }
  }
  if (size <= 0) {
    return { error: 'File is empty' }
  }
  if (size > maxBytes) {
    return { error: `File exceeds size limit of ${Math.floor(maxBytes / 1024 / 1024)}MB` }
  }
  const ext = EXT_BY_MIME[mime]
  if (!ext) {
    return { error: `Unknown extension for type: ${mime}` }
  }
  return { ext }
}

/** 确保媒体目录存在 */
export async function ensureMediaDir(): Promise<void> {
  await mkdir(MEDIA_ROOT, { recursive: true })
}

/** 生成落盘文件名（防遍历：仅使用生成的 id + 白名单扩展名） */
export function mediaFileName(id: string, ext: string): string {
  const safeExt = ext.replace(/[^a-z0-9]/gi, '')
  return `${id}.${safeExt}`
}

/** 媒体文件绝对路径（mediaPath 为相对路径） */
export function absoluteMediaPath(relativePath: string): string {
  return path.join(MEDIA_ROOT, path.basename(relativePath))
}
