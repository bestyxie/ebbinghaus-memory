import { describe, it, expect } from 'vitest'
import {
  transcriptSentenceSchema,
  transcriptSchema,
  rawTranscriptionSentenceSchema,
  updateCourseProgressSchema,
} from '../zod'

describe('transcriptSentenceSchema', () => {
  const valid = {
    idx: 0,
    text: 'Hello world.',
    startMs: 0,
    endMs: 1200,
    words: [
      { text: 'Hello', isProperNoun: false },
      { text: 'world.', isProperNoun: false },
    ],
  }

  it('accepts a valid sentence', () => {
    expect(transcriptSentenceSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects negative timestamps', () => {
    const r = transcriptSentenceSchema.safeParse({ ...valid, startMs: -1 })
    expect(r.success).toBe(false)
  })

  it('rejects empty words array entries missing fields', () => {
    const r = transcriptSentenceSchema.safeParse({ ...valid, words: [{ text: 'x' }] })
    expect(r.success).toBe(false)
  })
})

describe('transcriptSchema', () => {
  it('accepts array of sentences', () => {
    const r = transcriptSchema.safeParse([
      { idx: 0, text: 'A.', startMs: 0, endMs: 100, words: [{ text: 'A.', isProperNoun: false }] },
    ])
    expect(r.success).toBe(true)
  })

  it('rejects non-array', () => {
    expect(transcriptSchema.safeParse({}).success).toBe(false)
  })
})

describe('rawTranscriptionSentenceSchema', () => {
  it('accepts raw model output', () => {
    const r = rawTranscriptionSentenceSchema.safeParse({ text: 'Hi.', startMs: 10, endMs: 500 })
    expect(r.success).toBe(true)
  })

  it('rejects empty text', () => {
    expect(rawTranscriptionSentenceSchema.safeParse({ text: '', startMs: 0, endMs: 1 }).success).toBe(false)
  })
})

describe('updateCourseProgressSchema', () => {
  it('accepts valid payload', () => {
    const r = updateCourseProgressSchema.safeParse({
      sentenceIndex: 3,
      completedSentenceIds: [0, 1, 2],
      status: 'IN_PROGRESS',
    })
    expect(r.success).toBe(true)
  })

  it('rejects unknown status', () => {
    const r = updateCourseProgressSchema.safeParse({
      sentenceIndex: 0,
      completedSentenceIds: [],
      status: 'PAUSED',
    })
    expect(r.success).toBe(false)
  })

  it('rejects negative ids', () => {
    const r = updateCourseProgressSchema.safeParse({
      sentenceIndex: 0,
      completedSentenceIds: [-1],
      status: 'COMPLETED',
    })
    expect(r.success).toBe(false)
  })
})
