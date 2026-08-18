/**
 * 口语进度纯函数：一次评分结果 → 更新的进度字段
 * 规则：重录记最高综合分（bestScores 按句 idx 对齐）；全部句子至少录过一遍即 COMPLETED；
 * sentenceIndex 推进到第一个未录的句子。
 */
export interface SpeakingProgressState {
  bestScores: (number | null)[]
  completedSentenceIds: number[]
  sentenceIndex: number
  status: 'IN_PROGRESS' | 'COMPLETED'
}

export function applySpeakingResult(
  current: SpeakingProgressState,
  total: number,
  sentenceIdx: number,
  score: number,
): SpeakingProgressState {
  if (total <= 0) return current
  const bestScores = Array.from(current.bestScores, (v) => (typeof v === 'number' ? v : null))
  while (bestScores.length < total) bestScores.push(null)
  const prev = bestScores[sentenceIdx]
  bestScores[sentenceIdx] = prev == null ? score : Math.max(prev, score)

  const completed = new Set(current.completedSentenceIds)
  completed.add(sentenceIdx)
  const completedSentenceIds = [...completed].sort((a, b) => a - b)

  const status = completedSentenceIds.length >= total ? 'COMPLETED' : 'IN_PROGRESS'
  let next = completedSentenceIds.length
  for (let i = 0; i < total; i++) {
    if (!completed.has(i)) {
      next = i
      break
    }
  }
  return { bestScores, completedSentenceIds, sentenceIndex: next, status }
}