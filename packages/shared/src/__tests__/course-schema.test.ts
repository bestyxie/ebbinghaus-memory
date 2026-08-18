import { describe, it, expect } from 'vitest'
import {
  transcriptWordSchema,
  transcriptSentenceSchema,
  transcriptSchema,
  rawTranscriptionSentenceSchema,
  updateCourseProgressSchema,
  speakingDifficultySchema,
  scoreWordResultSchema,
  scoreResultSchema,
  speakingProgressSchema,
} from '../zod'

describe('transcriptWordSchema', () => {
  it('accepts a minimal word (legacy transcript)', () => {
    const r = transcriptWordSchema.safeParse({ text: 'Hello', isProperNoun: false })
    expect(r.success).toBe(true)
  })

  it('accepts enriched word with phonetic + timestamps', () => {
    const r = transcriptWordSchema.safeParse({
      text: 'Hello',
      isProperNoun: false,
      phonetic: 'həˈləʊ',
      startMs: 10,
      endMs: 380,
    })
    expect(r.success).toBe(true)
  })

  it('rejects missing isProperNoun', () => {
    expect(transcriptWordSchema.safeParse({ text: 'x' }).success).toBe(false)
  })

  it('rejects out-of-range timestamps', () => {
    const r = transcriptWordSchema.safeParse({ text: 'x', isProperNoun: false, startMs: -1 })
    expect(r.success).toBe(false)
  })
})

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

  it('accepts sentence with translation (legacy transcripts lack it)', () => {
    const r = transcriptSentenceSchema.safeParse({ ...valid, translation: '你好世界。' })
    expect(r.success).toBe(true)
  })

  it('accepts sentence without translation (backward compat)', () => {
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

describe('speakingDifficultySchema', () => {
  it('accepts the three difficulties', () => {
    for (const d of ['EASY', 'MEDIUM', 'HARD']) {
      expect(speakingDifficultySchema.safeParse(d).success).toBe(true)
    }
  })

  it('rejects unknown difficulty', () => {
    expect(speakingDifficultySchema.safeParse('INSANE').success).toBe(false)
  })
})

describe('scoreResultSchema', () => {
  it('accepts overall + per-word scores with offsets', () => {
    const r = scoreResultSchema.safeParse({
      overall: 88,
      words: [
        { text: 'Hello', score: 92, startMs: 0, endMs: 400 },
        { text: 'world.', score: 84, startMs: 420, endMs: 980 },
      ],
    })
    expect(r.success).toBe(true)
  })

  it('accepts missing word offsets (engine without offsets)', () => {
    const r = scoreResultSchema.safeParse({
      overall: 75,
      words: [{ text: 'Hello', score: 75 }],
    })
    expect(r.success).toBe(true)
  })

  it('rejects score out of range', () => {
    const r = scoreResultSchema.safeParse({
      overall: 100,
      words: [{ text: 'Hello', score: 101 }],
    })
    expect(r.success).toBe(false)
  })

  it('rejects overall out of range', () => {
    const r = scoreResultSchema.safeParse({ overall: -1, words: [] })
    expect(r.success).toBe(false)
  })
})

describe('speakingProgressSchema', () => {
  it('accepts a valid progress row', () => {
    const r = speakingProgressSchema.safeParse({
      difficulty: 'MEDIUM',
      sentenceIndex: 2,
      completedSentenceIds: [0, 1],
      status: 'IN_PROGRESS',
      bestScores: [80, 91],
    })
    expect(r.success).toBe(true)
  })

  it('accepts missing bestScores (nothing recorded yet)', () => {
    const r = speakingProgressSchema.safeParse({
      difficulty: 'EASY',
      sentenceIndex: 0,
      completedSentenceIds: [],
      status: 'IN_PROGRESS',
    })
    expect(r.success).toBe(true)
  })

  it('accepts null entries in bestScores (sparse by sentence idx)', () => {
    const r = speakingProgressSchema.safeParse({
      difficulty: 'EASY',
      sentenceIndex: 1,
      completedSentenceIds: [0],
      status: 'IN_PROGRESS',
      bestScores: [90, null, null],
    })
    expect(r.success).toBe(true)
  })

  it('rejects unknown difficulty', () => {
    const r = speakingProgressSchema.safeParse({
      difficulty: 'XXX',
      sentenceIndex: 0,
      completedSentenceIds: [],
      status: 'IN_PROGRESS',
    })
    expect(r.success).toBe(false)
  })
})
