import { describe, it, expect } from 'vitest'
import {
  normalizeWord,
  tokenizeSentence,
  compareWord,
  sentencePlayRange,
  sentenceIndexAtMs,
} from '@/app/lib/course-words'

describe('normalizeWord', () => {
  it('strips leading/trailing punctuation and lowercases', () => {
    expect(normalizeWord('  "Hello!"')).toBe('hello')
    expect(normalizeWord("don't")).toBe("don't")
  })
})

describe('tokenizeSentence', () => {
  it('splits on whitespace and drops empties', () => {
    expect(tokenizeSentence('  Hello   world ')).toEqual(['Hello', 'world'])
  })
})

describe('compareWord', () => {
  it('compares ignoring case and edge punctuation', () => {
    expect(compareWord('hello', 'Hello!')).toBe(true)
    expect(compareWord('hell', 'hello')).toBe(false)
    expect(compareWord('', '')).toBe(false)
  })
})

describe('sentencePlayRange', () => {
  const sentence = {
    startMs: 1000,
    endMs: 5000,
    words: [
      { startMs: null, endMs: null },
      { startMs: 1200, endMs: 2000 },
      { startMs: 2200, endMs: 4600 },
    ],
  }

  it('uses word-level timestamps when available', () => {
    expect(sentencePlayRange(sentence)).toEqual({ startMs: 1200, endMs: 4600 })
  })

  it('falls back to sentence-level range when no word timestamps', () => {
    const s = { startMs: 1000, endMs: 5000, words: [{ startMs: null, endMs: null }] }
    expect(sentencePlayRange(s)).toEqual({ startMs: 1000, endMs: 5000 })
  })
})

describe('sentenceIndexAtMs', () => {
  const sentences = [
    { startMs: 1000, endMs: 3000 },
    { startMs: 3000, endMs: 6000 },
    { startMs: 8000, endMs: 10000 },
  ]

  it('returns the sentence containing the timestamp', () => {
    expect(sentenceIndexAtMs(sentences, 1000)).toBe(0)
    expect(sentenceIndexAtMs(sentences, 2999)).toBe(0)
    expect(sentenceIndexAtMs(sentences, 3000)).toBe(1)
    expect(sentenceIndexAtMs(sentences, 5500)).toBe(1)
    expect(sentenceIndexAtMs(sentences, 9999)).toBe(2)
  })

  it('returns null before the first sentence', () => {
    expect(sentenceIndexAtMs(sentences, 0)).toBe(null)
    expect(sentenceIndexAtMs(sentences, 999)).toBe(null)
  })

  it('returns null inside a gap between sentences', () => {
    expect(sentenceIndexAtMs(sentences, 6001)).toBe(null)
    expect(sentenceIndexAtMs(sentences, 7999)).toBe(null)
  })

  it('returns null after the last sentence end', () => {
    expect(sentenceIndexAtMs(sentences, 10000)).toBe(null)
    expect(sentenceIndexAtMs(sentences, 20000)).toBe(null)
  })

  it('returns null for an empty transcript', () => {
    expect(sentenceIndexAtMs([], 5000)).toBe(null)
  })

  it('back-to-back sentences pick the later one at the shared boundary', () => {
    const backToBack = [
      { startMs: 1000, endMs: 3000 },
      { startMs: 3000, endMs: 6000 },
    ]
    expect(sentenceIndexAtMs(backToBack, 3000)).toBe(1)
  })

  it('single sentence transcript highlights only inside its window', () => {
    const single = [{ startMs: 500, endMs: 1500 }]
    expect(sentenceIndexAtMs(single, 500)).toBe(0)
    expect(sentenceIndexAtMs(single, 1499)).toBe(0)
    expect(sentenceIndexAtMs(single, 1500)).toBe(null)
  })
})
