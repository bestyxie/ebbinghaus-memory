import { describe, it, expect } from 'vitest'
import {
  mediaTypeForMime,
  validateMediaFile,
  mediaFileName,
  absoluteMediaPath,
  MAX_MEDIA_BYTES,
} from '@/app/lib/course-media'

describe('mediaTypeForMime', () => {
  it('maps audio mimes to AUDIO', () => {
    expect(mediaTypeForMime('audio/mpeg')).toBe('AUDIO')
    expect(mediaTypeForMime('audio/wav')).toBe('AUDIO')
  })

  it('maps video mimes to VIDEO', () => {
    expect(mediaTypeForMime('video/mp4')).toBe('VIDEO')
    expect(mediaTypeForMime('video/webm')).toBe('VIDEO')
  })

  it('rejects non-allowlisted mimes', () => {
    expect(mediaTypeForMime('application/pdf')).toBeNull()
    expect(mediaTypeForMime('')).toBeNull()
  })
})

describe('validateMediaFile', () => {
  it('accepts valid audio and returns extension', () => {
    const result = validateMediaFile('audio/mpeg', 1024, new Set(['audio/mpeg']), MAX_MEDIA_BYTES)
    expect(result).toEqual({ ext: 'mp3' })
  })

  it('rejects disallowed type', () => {
    const result = validateMediaFile('application/zip', 1024, new Set(['audio/mpeg']), MAX_MEDIA_BYTES)
    expect('error' in result && result.error).toContain('Unsupported')
  })

  it('rejects empty file', () => {
    const result = validateMediaFile('audio/mpeg', 0, new Set(['audio/mpeg']), MAX_MEDIA_BYTES)
    expect('error' in result && result.error).toContain('empty')
  })

  it('rejects oversize file', () => {
    const result = validateMediaFile('audio/mpeg', MAX_MEDIA_BYTES + 1, new Set(['audio/mpeg']), MAX_MEDIA_BYTES)
    expect('error' in result && result.error).toContain('size limit')
  })
})

describe('mediaFileName / absoluteMediaPath', () => {
  it('builds safe file names', () => {
    expect(mediaFileName('abc123', 'mp3')).toBe('abc123.mp3')
    expect(mediaFileName('abc', 'weird/ext')).toBe('abc.weirdext')
  })

  it('resolves relative paths under media root and blocks traversal', () => {
    expect(absoluteMediaPath('x.mp3')).toContain('/media/x.mp3')
    expect(absoluteMediaPath('../../etc/passwd')).not.toContain('..')
  })
})
