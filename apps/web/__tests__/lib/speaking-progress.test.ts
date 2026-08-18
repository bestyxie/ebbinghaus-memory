import { describe, it, expect } from 'vitest'
import { applySpeakingResult, type SpeakingProgressState } from '@/app/lib/speaking-progress'

const empty = (): SpeakingProgressState => ({
  bestScores: [],
  completedSentenceIds: [],
  sentenceIndex: 0,
  status: 'IN_PROGRESS',
})

describe('applySpeakingResult', () => {
  it('records first score and advances to next uncompleted sentence', () => {
    const next = applySpeakingResult(empty(), 3, 0, 80)
    expect(next.bestScores).toEqual([80, null, null])
    expect(next.completedSentenceIds).toEqual([0])
    expect(next.sentenceIndex).toBe(1)
    expect(next.status).toBe('IN_PROGRESS')
  })

  it('keeps the higher score on re-record (best-score retention)', () => {
    const first = applySpeakingResult(empty(), 3, 1, 60)
    const second = applySpeakingResult(first, 3, 1, 90)
    expect(second.bestScores).toEqual([null, 90, null])
    const lower = applySpeakingResult(first, 3, 1, 40)
    expect(lower.bestScores).toEqual([null, 60, null])
  })

  it('marks COMPLETED only when all sentences recorded at least once', () => {
    let state = empty()
    for (let i = 0; i < 3; i++) {
      state = applySpeakingResult(state, 3, i, 70 + i)
    }
    expect(state.status).toBe('COMPLETED')
    expect(state.completedSentenceIds).toEqual([0, 1, 2])
    expect(state.bestScores).toEqual([70, 71, 72])
  })

  it('does not complete with a gap in sentence ids', () => {
    const state = applySpeakingResult(applySpeakingResult(empty(), 3, 0, 80), 3, 2, 85)
    expect(state.status).toBe('IN_PROGRESS')
    expect(state.completedSentenceIds).toEqual([0, 2])
    expect(state.sentenceIndex).toBe(1)
  })

  it('handles out-of-order recording (later sentence first)', () => {
    const state = applySpeakingResult(empty(), 3, 2, 88)
    expect(state.completedSentenceIds).toEqual([2])
    expect(state.sentenceIndex).toBe(0)
  })

  it('tolerates zero-total guard', () => {
    expect(applySpeakingResult(empty(), 0, 0, 80)).toEqual(empty())
  })
})