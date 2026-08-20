import { describe, it, expect } from 'vitest'
import {
  normalizeWord,
  tokenizeSentence,
  compareWord,
  parseTranscriptionResponse,
  parseProperNounResponse,
  extractJsonObject,
  calibrateTimestamps,
  applyEnrichment,
  mergeWordTimestamps,
  assignWordsToSentences,
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

  it('attaches Groq word timestamps matched by normalized text', () => {
    const rawSentences = [
      { text: 'Mary went to Paris.', startMs: 0, endMs: 1000,
        words: [
          { text: 'Mary', startMs: 0, endMs: 200 },
          { text: 'went', startMs: 210, endMs: 400 },
          { text: 'to', startMs: 410, endMs: 480 },
          { text: 'Paris.', startMs: 490, endMs: 900 },
        ] },
      { text: 'She liked it.', startMs: 1000, endMs: 2000 },
    ]
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
    const { result } = parseProperNounResponse(raw, rawSentences)
    expect(result[0].words[0]).toEqual({ text: 'Mary', isProperNoun: true, startMs: 0, endMs: 200 })
    expect(result[0].words[3]).toEqual({ text: 'Paris.', isProperNoun: true, startMs: 490, endMs: 900 })
    // 无词级时间戳的句子不掺入 startMs/endMs
    expect(result[1].words[0]).toEqual({ text: 'She', isProperNoun: false })
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

  it('scales timestamps down when model timeline overruns real duration (expansion)', () => {
    // model says 10s end, real audio 8s → scale 0.8（此前只校准压缩侧，扩展侧会跳过）
    const expanded = [
      { text: 'First.', startMs: 1250, endMs: 2500 },
      { text: 'Second.', startMs: 3125, endMs: 10000 },
    ]
    const out = calibrateTimestamps(expanded, 8000)
    expect(out[0].startMs).toBe(1000)
    expect(out[1].endMs).toBe(8000)
  })

  it('clamps sentence timestamps to the real duration', () => {
    // 校准后仍可能因取整超出时长，clamp 到文件末尾（保证不播到文件结束之后）
    const over = [{ text: 'Last.', startMs: 9000, endMs: 11000 }]
    const out = calibrateTimestamps(over, 10000)
    expect(out[0].startMs).toBe(8182)
    expect(out[0].endMs).toBe(10000)
  })

  it('no-op on absurd small scale (guard against bad input)', () => {
    // 模型时间轴远超媒体时长（scale < 0.5）视为不可信，保持原值
    const out = calibrateTimestamps(sentences, 2000)
    expect(out).toEqual(sentences)
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

describe('applyEnrichment', () => {
  const transcript = [
    {
      idx: 0,
      text: 'Hello world.',
      startMs: 0,
      endMs: 1200,
      words: [
        { text: 'Hello', isProperNoun: false },
        { text: 'world.', isProperNoun: false },
      ],
    },
    {
      idx: 1,
      text: 'I like apples.',
      startMs: 1300,
      endMs: 2500,
      words: [
        { text: 'I', isProperNoun: false },
        { text: 'like', isProperNoun: false },
        { text: 'apples.', isProperNoun: false },
      ],
    },
  ]

  it('merges translations and per-word phonetics from LLM output', () => {
    const translations = ['你好世界。', '我喜欢苹果。']
    const wordMarks = [
      [{ text: 'Hello', phonetic: '/həˈləʊ/' }, { text: 'world.', phonetic: '/wɜːld/' }],
      [{ text: 'I', phonetic: '/aɪ/' }, { text: 'like', phonetic: '/laɪk/' }, { text: 'apples.', phonetic: '/ˈæp.əlz/' }],
    ]
    const result = applyEnrichment(transcript, translations, wordMarks)
    expect(result[0].translation).toBe('你好世界。')
    expect(result[1].translation).toBe('我喜欢苹果。')
    expect(result[0].words[0]).toEqual({ text: 'Hello', isProperNoun: false, phonetic: '/həˈləʊ/' })
    expect(result[1].words[2]).toEqual({ text: 'apples.', isProperNoun: false, phonetic: '/ˈæp.əlz/' })
  })

  it('keeps fields untouched when counts mismatch', () => {
    const result = applyEnrichment(transcript, ['只有一句'], [])
    expect(result[0].translation).toBeUndefined()
    expect(result[0].words[0]).toEqual({ text: 'Hello', isProperNoun: false })
    expect(result[1].translation).toBeUndefined()
  })

  it('matches phonetics by normalized text (order-tolerant)', () => {
    const result = applyEnrichment(
      transcript,
      ['你好世界。', '我喜欢苹果。'],
      [
        [{ text: 'world.', phonetic: '/wɜːld/' }, { text: 'Hello', phonetic: '/həˈləʊ/' }],
        [],
      ],
    )
    // 顺序打乱也能按归一化文本对上
    expect(result[0].words[0].phonetic).toBe('/həˈləʊ/')
    expect(result[0].words[1].phonetic).toBe('/wɜːld/')
    // 空词标记数组不污染
    expect(result[1].words[0]).toEqual({ text: 'I', isProperNoun: false })
  })

  it('does not mutate the input', () => {
    const copy = JSON.parse(JSON.stringify(transcript)) as typeof transcript
    applyEnrichment(transcript, ['你好世界。', '我喜欢苹果。'], [])
    expect(transcript).toEqual(copy)
  })
})

describe('mergeWordTimestamps', () => {
  const sentences = [
    {
      idx: 0,
      text: 'Hello world.',
      startMs: 0,
      endMs: 1200,
      words: [
        { text: 'Hello', isProperNoun: false },
        { text: 'world.', isProperNoun: false },
      ],
    },
    {
      idx: 1,
      text: 'No match here.',
      startMs: 5000,
      endMs: 6000,
      words: [{ text: 'No', isProperNoun: false }],
    },
  ]

  it('merges word timestamps from re-transcribed raw sentences by start proximity', () => {
    const raw = [
      { text: 'Hello world.', startMs: 10, endMs: 1200,
        words: [
          { text: 'Hello', startMs: 10, endMs: 300 },
          { text: 'world.', startMs: 310, endMs: 1100 },
        ] },
      { text: 'Something else.', startMs: 7000, endMs: 8000 },
    ]
    const merged = mergeWordTimestamps(sentences, raw)
    expect(merged[0].words[0]).toEqual({ text: 'Hello', isProperNoun: false, startMs: 10, endMs: 300 })
    expect(merged[0].words[1].startMs).toBe(310)
    // 无匹配句保持原样
    expect(merged[1].words[0]).toEqual({ text: 'No', isProperNoun: false })
  })

  it('leaves sentences untouched when no raw match', () => {
    const merged = mergeWordTimestamps(sentences, [])
    expect(merged).toEqual(sentences)
  })
})

describe('assignWordsToSentences', () => {
  const sentences: { text: string; startMs: number; endMs: number }[] = [
    { text: 'Hello world.', startMs: 0, endMs: 1200 },
    { text: 'Second sentence.', startMs: 1300, endMs: 2500 },
  ]

  it('assigns words to sentences by start-time containment', () => {
    const words = [
      { text: 'Hello', startMs: 100, endMs: 400 },
      { text: 'world.', startMs: 450, endMs: 1100 },
      { text: 'Second', startMs: 1400, endMs: 1800 },
      { text: 'sentence.', startMs: 1850, endMs: 2400 },
    ]
    const out = assignWordsToSentences(sentences, words)
    expect(out[0].words).toHaveLength(2)
    expect(out[1].words).toHaveLength(2)
    expect(out[0].words?.[0]).toEqual({ text: 'Hello', startMs: 100, endMs: 400 })
  })

  it('skips sentences with no matching words', () => {
    const out = assignWordsToSentences(sentences, [])
    expect(out[0].words).toBeUndefined()
  })
})
