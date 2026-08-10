import { describe, it, expect } from 'vitest'
import { sourceAnchorSchema, cardSourceSchema, createCardSchema } from '../zod'

describe('sourceAnchorSchema', () => {
  const validAnchor = {
    sel: 'article > p:nth-child(7)',
    ctx: 'the ephemeral nature of',
    occ: 2,
  }

  it('accepts a valid anchor', () => {
    const result = sourceAnchorSchema.safeParse(validAnchor)
    expect(result.success).toBe(true)
  })

  it('rejects empty sel', () => {
    const result = sourceAnchorSchema.safeParse({ ...validAnchor, sel: '' })
    expect(result.success).toBe(false)
  })

  it('rejects empty ctx', () => {
    const result = sourceAnchorSchema.safeParse({ ...validAnchor, ctx: '' })
    expect(result.success).toBe(false)
  })

  it('rejects occ of 0', () => {
    const result = sourceAnchorSchema.safeParse({ ...validAnchor, occ: 0 })
    expect(result.success).toBe(false)
  })

  it('rejects negative occ', () => {
    const result = sourceAnchorSchema.safeParse({ ...validAnchor, occ: -1 })
    expect(result.success).toBe(false)
  })

  it('rejects non-integer occ', () => {
    const result = sourceAnchorSchema.safeParse({ ...validAnchor, occ: 1.5 })
    expect(result.success).toBe(false)
  })

  it('rejects missing occ', () => {
    const result = sourceAnchorSchema.safeParse({ sel: 'p', ctx: 'text' })
    expect(result.success).toBe(false)
  })
})

describe('cardSourceSchema', () => {
  const validSource = {
    sourceUrl: 'https://example.com/article#:~:text=ephemeral',
    sourceWord: 'ephemeral',
    sourceAnchor: {
      sel: 'article > p:nth-child(3)',
      ctx: 'the ephemeral nature of',
      occ: 1,
    },
    sourceTitle: 'The Ephemeral Self',
    capturedAt: '2026-08-10T12:00:00Z',
  }

  it('accepts a valid complete source', () => {
    const result = cardSourceSchema.safeParse(validSource)
    expect(result.success).toBe(true)
  })

  it('rejects invalid URL', () => {
    const result = cardSourceSchema.safeParse({ ...validSource, sourceUrl: 'not-a-url' })
    expect(result.success).toBe(false)
  })

  it('rejects empty sourceWord', () => {
    const result = cardSourceSchema.safeParse({ ...validSource, sourceWord: '' })
    expect(result.success).toBe(false)
  })

  it('rejects empty sourceTitle', () => {
    const result = cardSourceSchema.safeParse({ ...validSource, sourceTitle: '' })
    expect(result.success).toBe(false)
  })

  it('rejects non-ISO datetime for capturedAt', () => {
    const result = cardSourceSchema.safeParse({ ...validSource, capturedAt: '2026-08-10' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid nested anchor', () => {
    const result = cardSourceSchema.safeParse({
      ...validSource,
      sourceAnchor: { sel: '', ctx: 'text', occ: 1 },
    })
    expect(result.success).toBe(false)
  })
})

describe('createCardSchema source fields', () => {
  const baseCard = {
    front: 'ephemeral',
    back: 'lasting for a very short time',
    quality: '4' as const,
  }

  it('accepts card without any source fields', () => {
    const result = createCardSchema.safeParse(baseCard)
    expect(result.success).toBe(true)
  })

  it('accepts card with all five source fields', () => {
    const result = createCardSchema.safeParse({
      ...baseCard,
      sourceUrl: 'https://example.com/art#:~:text=ephemeral',
      sourceWord: 'ephemeral',
      sourceAnchor: { sel: 'p', ctx: 'the ephemeral nature', occ: 1 },
      sourceTitle: 'Article Title',
      capturedAt: '2026-08-10T12:00:00Z',
    })
    expect(result.success).toBe(true)
  })

  it('accepts card with sourceProvenance only', () => {
    const result = createCardSchema.safeParse({
      ...baseCard,
      sourceProvenance: 'chrome-extension',
    })
    expect(result.success).toBe(true)
  })

  it('accepts card with source fields and provenance together', () => {
    const result = createCardSchema.safeParse({
      ...baseCard,
      sourceUrl: 'https://example.com/art',
      sourceWord: 'ephemeral',
      sourceAnchor: { sel: 'p', ctx: 'the ephemeral', occ: 1 },
      sourceTitle: 'Title',
      capturedAt: '2026-08-10T12:00:00Z',
      sourceProvenance: 'chrome-extension',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid sourceUrl in createCard', () => {
    const result = createCardSchema.safeParse({
      ...baseCard,
      sourceUrl: 'not-a-url',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid sourceAnchor in createCard', () => {
    const result = createCardSchema.safeParse({
      ...baseCard,
      sourceAnchor: { sel: '', ctx: 'text', occ: 0 },
    })
    expect(result.success).toBe(false)
  })
})
