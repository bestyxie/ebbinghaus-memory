/**
 * 听写状态机纯逻辑
 * 单词框状态流转：input → locked-correct | locked-wrong；空格键推进与比对
 */

import { compareWord } from './course-words'

export interface DictationWordState {
  /** 预期单词（原文形式） */
  expected: string
  isProperNoun: boolean
  /** 用户当前输入 */
  input: string
  /** 已判定锁定（正确的词或揭示后） */
  locked: boolean
  /** 锁定时的判定结果 */
  verdict: 'correct' | 'wrong' | 'revealed' | null
}

export type SentencePhase = 'typing' | 'checking' | 'done'

export interface DictationState {
  words: DictationWordState[]
  /** 当前焦点框索引（仅未锁定框有效） */
  cursor: number
  phase: SentencePhase
}

export function initDictation(
  words: Array<{ text: string; isProperNoun: boolean }>,
): DictationState {
  return {
    words: words.map((w) => ({
      expected: w.text,
      isProperNoun: w.isProperNoun,
      input: w.isProperNoun ? w.text : '',
      locked: w.isProperNoun,
      verdict: w.isProperNoun ? ('revealed' as const) : null,
    })),
    cursor: firstEditableIndex(words),
    phase: 'typing',
  }
}

function firstEditableIndex(words: Array<{ isProperNoun: boolean }>): number {
  const i = words.findIndex((w) => !w.isProperNoun)
  return i === -1 ? 0 : i
}

/** 下一个未锁定的框索引；无则 -1 */
export function nextEditable(state: DictationState, from: number): number {
  for (let i = from + 1; i < state.words.length; i++) {
    if (!state.words[i].locked) return i
  }
  return -1
}

/** 上一个未锁定的框索引；无则 -1 */
export function prevEditable(state: DictationState, from: number): number {
  for (let i = from - 1; i >= 0; i--) {
    if (!state.words[i].locked) return i
  }
  return -1
}

/**
 * 空格键处理：返回新状态 + 是否触发比对
 * - 非末框：跳到下一个未锁定框
 * - 末框（无下一个）：触发比对（由调用方执行 compareAll）
 */
export function handleSpace(state: DictationState, index: number): { state: DictationState; shouldCheck: boolean } {
  const word = state.words[index]
  if (!word || word.locked || !word.input.trim()) {
    return { state, shouldCheck: false }
  }
  const next = nextEditable(state, index)
  if (next === -1) {
    return { state: { ...state, phase: 'checking' }, shouldCheck: true }
  }
  return { state: { ...state, cursor: next }, shouldCheck: false }
}

/**
 * Backspace 在空框时：回退到上一个未锁定框
 */
export function handleBackspace(state: DictationState, index: number): { state: DictationState; moved: boolean } {
  const word = state.words[index]
  if (!word || word.locked || word.input !== '') {
    return { state, moved: false }
  }
  const prev = prevEditable(state, index)
  if (prev === -1) {
    return { state, moved: false }
  }
  return { state: { ...state, cursor: prev }, moved: true }
}

/**
 * 比对全部未锁定框：
 * - 全对：全部锁定为 correct，phase=done，返回 allCorrect=true
 * - 有错：错词标 wrong 但保持可编辑（locked=false）；对词锁定 correct；焦点移到第一个错词，phase=typing
 */
export function compareAll(state: DictationState): { state: DictationState; allCorrect: boolean } {
  let firstWrong = -1
  let wrongCount = 0
  const words = state.words.map((w, i) => {
    if (w.locked || w.isProperNoun) return w
    const ok = compareWord(w.input, w.expected)
    if (ok) {
      return { ...w, locked: true, verdict: 'correct' as const }
    }
    wrongCount++
    if (firstWrong === -1) firstWrong = i
    return { ...w, locked: false, verdict: 'wrong' as const }
  })
  if (wrongCount === 0) {
    return { state: { words, cursor: -1, phase: 'done' }, allCorrect: true }
  }
  return { state: { words, cursor: firstWrong, phase: 'typing' }, allCorrect: false }
}

/**
 * 解锁错词框供修改（用户开始改某个 wrong 框时调用）
 */
export function unlockWord(state: DictationState, index: number): DictationState {
  const word = state.words[index]
  if (!word || word.verdict !== 'wrong') return state
  const words = state.words.map((w, i) =>
    i === index ? { ...w, locked: false, verdict: null } : w,
  )
  return { ...state, words, cursor: index, phase: 'typing' }
}

/**
 * 显示正确答案：所有未 correct 的可输入框填入正确词并标记差异
 */
export function revealAll(state: DictationState): DictationState {
  const words = state.words.map((w) => {
    if (w.isProperNoun) return w
    const wasWrong = w.input !== '' && !compareWord(w.input, w.expected)
    const verdict: DictationWordState['verdict'] = wasWrong ? 'wrong' : 'revealed'
    return {
      ...w,
      input: w.expected,
      locked: true,
      verdict,
    }
  })
  return { words, cursor: -1, phase: 'done' }
}

/** 是否所有可输入框都已锁定且正确（用于判定句子完成） */
export function isSentenceComplete(state: DictationState): boolean {
  return state.phase === 'done'
}

/** 统计：错词数（含已改对前的记录语义：仅当前状态） */
export function wrongCount(state: DictationState): number {
  return state.words.filter((w) => w.verdict === 'wrong').length
}
