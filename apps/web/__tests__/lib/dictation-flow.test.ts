import { describe, it, expect } from 'vitest'
import {
  initDictation,
  handleSpace,
  handleBackspace,
  compareAll,
  unlockWord,
  revealAll,
  nextEditable,
  wrongCount,
} from '@/app/lib/dictation-flow'

const WORDS = [
  { text: 'Mary', isProperNoun: true },
  { text: 'went', isProperNoun: false },
  { text: 'to', isProperNoun: false },
  { text: 'Paris.', isProperNoun: true },
  { text: 'yesterday', isProperNoun: false },
]

describe('initDictation', () => {
  it('pre-fills proper nouns as locked revealed', () => {
    const s = initDictation(WORDS)
    expect(s.words[0].input).toBe('Mary')
    expect(s.words[0].locked).toBe(true)
    expect(s.words[0].verdict).toBe('revealed')
    expect(s.words[1].input).toBe('')
    expect(s.cursor).toBe(1)
  })

  it('all proper noun sentence is immediately complete-able', () => {
    const s = initDictation([{ text: 'Paris.', isProperNoun: true }])
    expect(s.cursor).toBe(0)
    expect(nextEditable(s, 0)).toBe(-1)
  })
})

describe('handleSpace', () => {
  it('advances to next editable word', () => {
    const s = initDictation(WORDS)
    const filled = { ...s, words: s.words.map((w, i) => (i === 1 ? { ...w, input: 'went' } : w)) }
    const r = handleSpace(filled, 1)
    expect(r.shouldCheck).toBe(false)
    expect(r.state.cursor).toBe(2)
  })

  it('skips locked words', () => {
    const s = initDictation(WORDS)
    const filled = { ...s, words: s.words.map((w, i) => (i === 2 ? { ...w, input: 'to' } : w)) }
    const r = handleSpace(filled, 2)
    expect(r.state.cursor).toBe(4)
  })

  it('on last editable word triggers check', () => {
    const s = initDictation(WORDS)
    const filled = { ...s, words: s.words.map((w, i) => (i === 4 ? { ...w, input: 'yesterday' } : w)) }
    const r = handleSpace(filled, 4)
    expect(r.shouldCheck).toBe(true)
    expect(r.state.phase).toBe('checking')
  })

  it('does nothing on empty input', () => {
    const s = initDictation(WORDS)
    const r = handleSpace(s, 1)
    expect(r.shouldCheck).toBe(false)
    expect(r.state.cursor).toBe(1)
  })
})

describe('handleBackspace', () => {
  it('moves back when current box empty', () => {
    const s = initDictation(WORDS)
    const at3 = { ...s, cursor: 2 }
    const r = handleBackspace(at3, 2)
    expect(r.moved).toBe(true)
    expect(r.state.cursor).toBe(1)
  })

  it('no move when input present', () => {
    const s = initDictation(WORDS)
    const filled = { ...s, words: s.words.map((w, i) => (i === 1 ? { ...w, input: 'x' } : w)) }
    const r = handleBackspace(filled, 1)
    expect(r.moved).toBe(false)
  })
})

describe('compareAll', () => {
  function typeAll(inputs: Record<number, string>) {
    const s = initDictation(WORDS)
    return {
      ...s,
      words: s.words.map((w, i) => (i in inputs ? { ...w, input: inputs[i] } : w)),
    }
  }

  it('all correct locks everything and finishes', () => {
    const s = typeAll({ 1: 'Went', 2: 'to,', 4: 'Yesterday' })
    const r = compareAll(s)
    expect(r.allCorrect).toBe(true)
    expect(r.state.phase).toBe('done')
    expect(r.state.words.every((w) => w.locked)).toBe(true)
  })

  it('wrong words stay editable-red, focus jumps to first wrong', () => {
    const s = typeAll({ 1: 'goed', 2: 'to', 4: 'yesterday' })
    const r = compareAll(s)
    expect(r.allCorrect).toBe(false)
    expect(r.state.cursor).toBe(1)
    expect(r.state.words[1].verdict).toBe('wrong')
    expect(r.state.words[1].input).toBe('goed')
    expect(r.state.words[2].locked).toBe(true)
    expect(r.state.words[2].verdict).toBe('correct')
  })

  it('unlockWord reopens a wrong box', () => {
    const s = typeAll({ 1: 'goed', 2: 'to', 4: 'yesterday' })
    const after = compareAll(s).state
    const unlocked = unlockWord(after, 1)
    expect(unlocked.words[1].locked).toBe(false)
    expect(unlocked.cursor).toBe(1)
  })

  it('re-check after fix only compares unlocked boxes', () => {
    const s = typeAll({ 1: 'goed', 2: 'to', 4: 'yesterday' })
    let st = compareAll(s).state
    st = unlockWord(st, 1)
    st = { ...st, words: st.words.map((w, i) => (i === 1 ? { ...w, input: 'went' } : w)) }
    const r = compareAll(st)
    expect(r.allCorrect).toBe(true)
    expect(r.state.phase).toBe('done')
  })
})

describe('revealAll', () => {
  it('fills correct words, marks differing positions wrong', () => {
    const s = initDictation(WORDS)
    const typed = { ...s, words: s.words.map((w, i) => (i === 1 ? { ...w, input: 'goed' } : w)) }
    const r = revealAll(typed)
    expect(r.phase).toBe('done')
    expect(r.words[1].input).toBe('went')
    expect(r.words[1].verdict).toBe('wrong')
    expect(r.words[2].input).toBe('to')
    expect(r.words[2].verdict).toBe('revealed')
  })

  it('empty boxes revealed without wrong mark', () => {
    const s = initDictation(WORDS)
    const r = revealAll(s)
    expect(r.words[2].verdict).toBe('revealed')
  })
})

describe('wrongCount', () => {
  it('counts wrong verdicts (empty boxes also count as wrong)', () => {
    const s = initDictation(WORDS)
    const typed = { ...s, words: s.words.map((w, i) => (i === 1 ? { ...w, input: 'goed' } : w)) }
    // word 1 wrong + words 2/4 empty → 3 wrong
    expect(wrongCount(compareAll(typed).state)).toBe(3)
  })
})
