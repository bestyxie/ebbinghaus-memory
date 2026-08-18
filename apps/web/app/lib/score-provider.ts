import type { ScoreResult } from '@ebbinghaus/shared'

/**
 * 发音评分引擎抽象（ADR 0001）。
 * 输入一段录音 + 目标文本 + 录音时长，输出每词评分与录音内起止偏移 + 综合评分。
 * 转写置信度 ≠ 发音准确度：具体引擎（Azure Pronunciation Assessment / Qwen-Omni）后续接入，
 * 由 SCORE_PROVIDER 环境变量选型，本实现先以 mock 打通全链路。
 */
export interface ScoreProvider {
  readonly id: string
  scoreRecording(input: {
    audio: Blob | Buffer
    mime: string
    referenceText: string
    durationMs: number
  }): Promise<ScoreResult>
}

/** 按环境变量选型；未知/未配置回落 mock，保证可演示 */
export function getScoreProvider(): ScoreProvider {
  const name = process.env.SCORE_PROVIDER ?? 'mock'
  return name === 'mock' ? mockProvider : mockProvider
}

/** 拆分单词（保留原文形态，供 mock 按词生成分数） */
function tokenize(text: string): string[] {
  return text.split(/\s+/).filter(Boolean)
}

/** 稳定字符串哈希（同一词同一分数，便于重测复现） */
function hashText(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0
  }
  return h
}

/**
 * mock 评分引擎：确定性分数（按词哈希 70-95），偏移按归一化字符占比铺满录音时长。
 * 真实引擎接入后替换：mock 不分析音频，仅用于 UI 联调与端到端验证。
 */
export const mockProvider: ScoreProvider = {
  id: 'mock',
  async scoreRecording({ referenceText, durationMs }) {
    const words = tokenize(referenceText)
    const totalChars = words.reduce((acc, w) => acc + w.length, 0)
    const duration = Math.max(1, durationMs)
    let cursor = 0
    const scored = words.map((text) => {
      const share = totalChars > 0 ? (text.length / totalChars) * duration : duration / words.length
      const startMs = Math.round(cursor)
      cursor += share
      const endMs = Math.round(cursor)
      const score = 70 + (hashText(text.toLowerCase()) % 26)
      return { text, score, startMs, endMs }
    })
    const overall = scored.length > 0 ? Math.round(scored.reduce((acc, w) => acc + w.score, 0) / scored.length) : 0
    return { overall, words: scored }
  },
}