import { describe, it, expect } from 'vitest'
import { mockProvider, getScoreProvider } from '@/app/lib/score-provider'

describe('mockProvider', () => {
  it('scores each word within 70-95 and overall within range', async () => {
    const result = await mockProvider.scoreRecording({
      audio: new Blob([]),
      mime: 'audio/webm',
      referenceText: 'Hello world. This is a test.',
      durationMs: 4000,
    })
    expect(result.words.length).toBe(6)
    for (const w of result.words) {
      expect(w.score).toBeGreaterThanOrEqual(70)
      expect(w.score).toBeLessThanOrEqual(95)
    }
    expect(result.overall).toBeGreaterThanOrEqual(70)
    expect(result.overall).toBeLessThanOrEqual(95)
  })

  it('lays out word offsets to fill the recording duration', async () => {
    const durationMs = 3000
    const result = await mockProvider.scoreRecording({
      audio: new Blob([]),
      mime: 'audio/webm',
      referenceText: 'one two three',
      durationMs,
    })
    expect(result.words).toHaveLength(3)
    expect(result.words[0].startMs).toBe(0)
    expect(result.words[result.words.length - 1].endMs).toBeLessThanOrEqual(durationMs)
    for (const w of result.words) {
      expect(w.endMs).toBeGreaterThan(w.startMs ?? 0)
    }
  })

  it('is deterministic for the same input', async () => {
    const a = await mockProvider.scoreRecording({ audio: new Blob([]), mime: 'audio/webm', referenceText: 'Deterministic scores', durationMs: 2000 })
    const b = await mockProvider.scoreRecording({ audio: new Blob([]), mime: 'audio/webm', referenceText: 'Deterministic scores', durationMs: 2000 })
    expect(a).toEqual(b)
  })

  it('handles empty reference text', async () => {
    const result = await mockProvider.scoreRecording({ audio: new Blob([]), mime: 'audio/webm', referenceText: '   ', durationMs: 1000 })
    expect(result.words).toEqual([])
    expect(result.overall).toBe(0)
  })
})

describe('getScoreProvider', () => {
  it('returns a provider (mock default)', () => {
    const provider = getScoreProvider()
    expect(provider).toBeDefined()
    expect(provider.scoreRecording).toBeTypeOf('function')
  })
})