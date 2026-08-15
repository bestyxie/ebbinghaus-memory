/**
 * 课程听力转写模块
 * 音视频 → GLM-4.6-Flash 逐句转写（带时间戳）→ glm-5.1 标记专有名词
 */

import { generateText } from 'ai'
import { aiProvider, AI_MODEL } from './ai-provider'
import {
  rawTranscriptionSentenceSchema,
  transcriptWordSchema,
  type TranscriptSentence,
} from '@ebbinghaus/shared'

/** 转写模型（opencode.ai 端点免费音频转写） */
const TRANSCRIBE_MODEL = process.env.AI_TRANSCRIBE_MODEL ?? 'glm-4.6-flash'

/** 专有名词标记分批大小 */
const PROPER_NOUN_BATCH_SIZE = 40

/** 转写模型返回的原始句（无 words） */
export interface RawSentence {
  text: string
  startMs: number
  endMs: number
}

// === 纯函数（单测覆盖） ===

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

/** 剥掉模型输出外层 markdown 代码围栏 */
function stripCodeFence(raw: string): string {
  return raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
}

/** 从 unknown JSON 解析出对象字段（非对象返回 undefined） */
function jsonField(data: unknown, key: string): unknown {
  if (typeof data === 'object' && data !== null && key in data) {
    const record: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(data)) {
      record[k] = v
    }
    return record[key]
  }
  return undefined
}

/**
 * 解析转写模型返回的 JSON 文本为句数组，按 startMs 排序
 * 解析失败返回 error
 */
export function parseTranscriptionResponse(raw: string): { sentences: RawSentence[]; error?: string } {
  let data: unknown
  try {
    data = JSON.parse(stripCodeFence(raw))
  } catch {
    return { sentences: [], error: 'Transcription response is not valid JSON' }
  }
  const list = jsonField(data, 'sentences')
  if (!Array.isArray(list)) {
    return { sentences: [], error: 'Transcription response missing "sentences" array' }
  }
  const parsed: RawSentence[] = []
  for (const item of list) {
    const result = rawTranscriptionSentenceSchema.safeParse(item)
    if (result.success) parsed.push(result.data)
  }
  if (parsed.length === 0) {
    return { sentences: [], error: 'Transcription response has no valid sentences' }
  }
  parsed.sort((a, b) => a.startMs - b.startMs)
  return { sentences: parsed }
}

/**
 * 解析专有名词标记模型返回的 JSON，组装最终 TranscriptSentence 数组
 * 模型需返回 { marks: [{ text, isProperNoun }[]] }（与输入句一一对应）
 */
export function parseProperNounResponse(raw: string, sentences: RawSentence[]): { result: TranscriptSentence[]; error?: string } {
  let data: unknown
  try {
    data = JSON.parse(stripCodeFence(raw))
  } catch {
    return { result: [], error: 'Proper noun response is not valid JSON' }
  }
  const marks = jsonField(data, 'marks')
  if (!Array.isArray(marks) || marks.length !== sentences.length) {
    return { result: [], error: 'Proper noun response sentence count mismatch' }
  }
  const result: TranscriptSentence[] = sentences.map((sentence, i) => {
    const words: TranscriptSentence['words'] = []
    const markList = Array.isArray(marks[i]) ? marks[i] : []
    for (const w of markList) {
      const parsed = transcriptWordSchema.safeParse(w)
      if (parsed.success) words.push(parsed.data)
    }
    // 模型漏词时按原文兜底全部标记为非专有名词
    if (words.length === 0) {
      return {
        idx: i,
        text: sentence.text,
        startMs: sentence.startMs,
        endMs: sentence.endMs,
        words: tokenizeSentence(sentence.text).map((text) => ({ text, isProperNoun: false })),
      }
    }
    return { idx: i, text: sentence.text, startMs: sentence.startMs, endMs: sentence.endMs, words }
  })
  return { result }
}

// === 模型调用 ===

/**
 * 调用转写模型：媒体文件 base64 → 逐句时间戳
 */
export async function callTranscriptionModel(
  base64: string,
  mediaType: 'AUDIO' | 'VIDEO',
): Promise<{ sentences: RawSentence[]; error?: string }> {
  const mime = mediaType === 'VIDEO' ? 'video/mp4' : 'audio/mpeg'
  try {
    const result = await generateText({
      model: aiProvider(TRANSCRIBE_MODEL),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'file',
              data: base64,
              mediaType: mime,
            },
            {
              type: 'text',
              text: `Transcribe this ${mediaType.toLowerCase()} to text. Return ONLY a JSON object: {"sentences": [{"text": "...", "startMs": 123, "endMs": 456}]}. Split into natural sentences. Timestamps in milliseconds from file start. No markdown, no explanations.`,
            },
          ],
        },
      ],
      temperature: 0,
    })
    return parseTranscriptionResponse(result.text)
  } catch (e) {
    return { sentences: [], error: e instanceof Error ? e.message : 'Transcription model call failed' }
  }
}

/**
 * 调用 glm-5.1 分批标记专有名词，返回完整 transcript
 */
export async function markProperNouns(
  sentences: RawSentence[],
): Promise<{ result: TranscriptSentence[]; error?: string }> {
  try {
    const batches: RawSentence[][] = []
    for (let i = 0; i < sentences.length; i += PROPER_NOUN_BATCH_SIZE) {
      batches.push(sentences.slice(i, i + PROPER_NOUN_BATCH_SIZE))
    }
    const allMarks: unknown[] = []
    for (const batch of batches) {
      const numbered = batch.map((s, i) => `${i + 1}. ${s.text}`).join('\n')
      const result = await generateText({
        model: aiProvider(AI_MODEL),
        prompt: `For each sentence below, split it into words (whitespace-separated, keep original form). Mark proper nouns (person names, place names, brand/organization names) with isProperNoun=true; all other words false.

Sentences:
${numbered}

Return ONLY JSON: {"marks": [[{"text":"word","isProperNoun":false}], ...]} — one inner array per sentence, same order, words in original order. No markdown.`,
        temperature: 0,
      })
      const data: unknown = JSON.parse(stripCodeFence(result.text))
      const marks = jsonField(data, 'marks')
      if (!Array.isArray(marks)) {
        return { result: [], error: 'Proper noun batch response invalid' }
      }
      allMarks.push(...marks)
    }
    return parseProperNounResponse(JSON.stringify({ marks: allMarks }), sentences)
  } catch (e) {
    return { result: [], error: e instanceof Error ? e.message : 'Proper noun marking failed' }
  }
}
