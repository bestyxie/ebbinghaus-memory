/**
 * 课程词级纯函数（客户端/服务端共用）
 * 与 course-transcribe.ts 分离：后者含 child_process 等 Node 依赖，不可进客户端 bundle
 */

/** 去除首尾标点并 lowercase，用于答案比对 */
export function normalizeWord(word: string): string {
  return word.replace(/^[^\w']+|[^\w']+$/g, '').toLowerCase()
}

/** 按空白切词 */
export function tokenizeSentence(text: string): string[] {
  return text.split(/\s+/).filter(Boolean)
}

/** 比对用户输入与预期单词（忽略大小写与首尾标点） */
export function compareWord(input: string, expected: string): boolean {
  return normalizeWord(input) === normalizeWord(expected) && normalizeWord(expected) !== ''
}

/**
 * 句子播放区间：优先用词级时间戳（首词 start → 末词 end），
 * 避免句级 start 滞后导致首词被切/单词语句只播到后半部分；
 * 无词级时间戳时回落句级时间
 */
export function sentencePlayRange(s: {
  startMs: number
  endMs: number
  words: { startMs?: number | null; endMs?: number | null }[]
}): { startMs: number; endMs: number } {
  const timed: { startMs: number; endMs: number }[] = []
  for (const w of s.words) {
    if (typeof w.startMs === 'number' && typeof w.endMs === 'number') {
      timed.push({ startMs: w.startMs, endMs: w.endMs })
    }
  }
  if (timed.length > 0) {
    const starts = timed.map((w) => w.startMs)
    const ends = timed.map((w) => w.endMs)
    return { startMs: Math.min(...starts), endMs: Math.max(...ends) }
  }
  return { startMs: s.startMs, endMs: s.endMs }
}