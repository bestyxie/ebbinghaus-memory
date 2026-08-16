import { describe, it, expect } from 'vitest'
import {
  normalizeWord,
  tokenizeSentence,
  compareWord,
  parseTranscriptionResponse,
  parseProperNounResponse,
  extractJsonObject,
  calibrateTimestamps,
} from '@/app/lib/course-transcribe'

describe('normalizeWord', () => {
  it('strips leading/trailing punctuation and lowercases', () => {
    expect(normalizeWord('Hello,')).toBe('hello')
    expect(normalizeWord('(World')).toBe('world')
    expect(normalizeWord('Sentense!')).toBe('sentense')
  })

  it('keeps internal apostrophes and hyphens', () => {
    expect(normalizeWord("Don't")).toBe("don't")
    expect(normalizeWord('Well-known.')).toBe('well-known')
  })

  it('handles punctuation-only input', () => {
    expect(normalizeWord('!!!')).toBe('')
    expect(normalizeWord('—')).toBe('')
  })
})

describe('tokenizeSentence', () => {
  it('splits on whitespace and drops empties', () => {
    expect(tokenizeSentence('  the   quick brown  ')).toEqual(['the', 'quick', 'brown'])
  })

  it('returns empty array for blank text', () => {
    expect(tokenizeSentence('   ')).toEqual([])
  })
})

describe('compareWord', () => {
  it('matches ignoring case and trailing punctuation', () => {
    expect(compareWord('Sentence', 'sentence.')).toBe(true)
    expect(compareWord('HELLO,', 'hello')).toBe(true)
  })

  it('rejects single-letter misspelling', () => {
    expect(compareWord('sentense', 'sentence')).toBe(false)
  })

  it('rejects empty expected', () => {
    expect(compareWord('', '!!!')).toBe(false)
  })
})

describe('parseTranscriptionResponse', () => {
  it('parses valid JSON and sorts by startMs', () => {
    const raw = JSON.stringify({
      sentences: [
        { text: 'Second.', startMs: 2000, endMs: 3000 },
        { text: 'First.', startMs: 0, endMs: 1000 },
      ],
    })
    const { sentences, error } = parseTranscriptionResponse(raw)
    expect(error).toBeUndefined()
    expect(sentences).toHaveLength(2)
    expect(sentences[0].text).toBe('First.')
  })

  it('strips markdown code fences', () => {
    const raw = '```json\n{"sentences":[{"text":"Hi.","startMs":0,"endMs":500}]}\n```'
    const { sentences, error } = parseTranscriptionResponse(raw)
    expect(error).toBeUndefined()
    expect(sentences[0].text).toBe('Hi.')
  })

  it('drops invalid sentence entries but keeps valid ones', () => {
    const raw = JSON.stringify({
      sentences: [
        { text: 'Valid.', startMs: 0, endMs: 100 },
        { text: '', startMs: 200, endMs: 300 },
        { text: 'Bad timestamps.', startMs: -5, endMs: 100 },
      ],
    })
    const { sentences } = parseTranscriptionResponse(raw)
    expect(sentences).toHaveLength(1)
    expect(sentences[0].text).toBe('Valid.')
  })

  it('errors on non-JSON input', () => {
    const { error } = parseTranscriptionResponse('not json at all')
    expect(error).toContain('not valid JSON')
  })

  it('errors when sentences array missing', () => {
    const { error } = parseTranscriptionResponse('{"foo": 1}')
    expect(error).toContain('missing "sentences"')
  })
})

describe('parseProperNounResponse', () => {
  const sentences = [
    { text: 'Mary went to Paris.', startMs: 0, endMs: 1000 },
    { text: 'She liked it.', startMs: 1000, endMs: 2000 },
  ]

  it('assembles transcript with idx and marks', () => {
    const raw = JSON.stringify({
      marks: [
        [
          { text: 'Mary', isProperNoun: true },
          { text: 'went', isProperNoun: false },
          { text: 'to', isProperNoun: false },
          { text: 'Paris.', isProperNoun: true },
        ],
        [
          { text: 'She', isProperNoun: false },
          { text: 'liked', isProperNoun: false },
          { text: 'it.', isProperNoun: false },
        ],
      ],
    })
    const { result, error } = parseProperNounResponse(raw, sentences)
    expect(error).toBeUndefined()
    expect(result).toHaveLength(2)
    expect(result[0].idx).toBe(0)
    expect(result[0].words[0]).toEqual({ text: 'Mary', isProperNoun: true })
    expect(result[1].idx).toBe(1)
    expect(result[1].words.every((w) => !w.isProperNoun)).toBe(true)
  })

  it('falls back to plain words when a sentence has no valid marks', () => {
    const raw = JSON.stringify({
      marks: [
        [{ text: 'Mary', isProperNoun: true }],
        [],
      ],
    })
    const { result } = parseProperNounResponse(raw, sentences)
    expect(result[1].words).toEqual([
      { text: 'She', isProperNoun: false },
      { text: 'liked', isProperNoun: false },
      { text: 'it.', isProperNoun: false },
    ])
  })

  it('errors on sentence count mismatch', () => {
    const raw = JSON.stringify({ marks: [[{ text: 'x', isProperNoun: false }]] })
    const { error } = parseProperNounResponse(raw, sentences)
    expect(error).toContain('mismatch')
  })
})

describe('extractJsonObject', () => {
  it('extracts JSON from plain response', () => {
    const { json, error } = extractJsonObject('{"sentences":[]}')
    expect(error).toBeUndefined()
    expect(JSON.parse(json)).toEqual({ sentences: [] })
  })

  it('extracts JSON from reasoning-style narration with prose around it', () => {
    const raw = 'Let me transcribe. {"sentences":[{"text":"Hi.","startMs":0,"endMs":100}]} Done.'
    const { json, error } = extractJsonObject(raw)
    expect(error).toBeUndefined()
    expect(JSON.parse(json).sentences).toHaveLength(1)
  })

  it('handles braces inside string values', () => {
    const raw = 'note {"sentences":[{"text":"a {b} c","startMs":0,"endMs":1}]} end'
    const { json, error } = extractJsonObject(raw)
    expect(error).toBeUndefined()
    expect(JSON.parse(json).sentences[0].text).toBe('a {b} c')
  })

  it('handles escaped quotes in strings', () => {
    const raw = '{"sentences":[{"text":"say \\"hi\\"","startMs":0,"endMs":1}]}'
    const { json, error } = extractJsonObject(raw)
    expect(error).toBeUndefined()
    expect(JSON.parse(json).sentences[0].text).toBe('say "hi"')
  })

  it('errors when no JSON present', () => {
    const { error } = extractJsonObject('no json here')
    expect(error).toContain('No JSON')
  })

  it('errors on unterminated JSON', () => {
    const { error } = extractJsonObject('{"sentences": [')
    expect(error).toContain('Unterminated')
  })
})

describe('calibrateTimestamps', () => {
  const sentences = [
    { text: 'First.', startMs: 1000, endMs: 2000 },
    { text: 'Second.', startMs: 2500, endMs: 8000 },
  ]

  it('scales timestamps when model drift is significant', () => {
    // model says 8s end, real audio 10s → scale 1.25
    const out = calibrateTimestamps(sentences, 10000)
    expect(out[0].startMs).toBe(1250)
    expect(out[1].endMs).toBe(10000)
  })

  it('no-op when drift under 5%', () => {
    const out = calibrateTimestamps(sentences, 8200)
    expect(out[0].startMs).toBe(1000)
    expect(out[1].endMs).toBe(8000)
  })

  it('no-op on missing/invalid duration', () => {
    expect(calibrateTimestamps(sentences, null)).toEqual(sentences)
    expect(calibrateTimestamps(sentences, 0)).toEqual(sentences)
    expect(calibrateTimestamps(sentences, undefined)).toEqual(sentences)
  })

  it('no-op on absurd scale (guard against bad input)', () => {
    // 100x → model completely misread; raw values safer than trusting either
    const out = calibrateTimestamps(sentences, 800000)
    expect(out).toEqual(sentences)
  })
})
