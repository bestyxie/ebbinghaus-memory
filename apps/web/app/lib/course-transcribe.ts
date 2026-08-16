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

/** 转写模型（opencode.ai 端点实测唯一支持音频输入的模型） */
const TRANSCRIBE_MODEL = process.env.AI_TRANSCRIBE_MODEL ?? 'mimo-v2.5'

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
 * 时间戳校准：转写模型（mimo-v2.5）的时间戳存在系统性漂移（实测整体压缩 ~8%），
 * 导致句子音频被提前切断、要求听写的词没播出来。
 * 用媒体真实时长把模型时间轴线性缩放到真实时间轴：
 * scale = realDuration / modelLastEnd。偏差 <5% 视为噪声不校准。
 */
export function calibrateTimestamps(
  sentences: RawSentence[],
  realDurationMs: number | null | undefined,
): RawSentence[] {
  if (!realDurationMs || realDurationMs <= 0 || sentences.length === 0) return sentences
  const lastEnd = sentences[sentences.length - 1].endMs
  if (lastEnd <= 0) return sentences
  const scale = realDurationMs / lastEnd
  // 实测漂移为时间轴整体压缩（模型 < 真实），只校准压缩侧；偏差 <5% 视为噪声
  if (scale <= 1 || scale > 1.5) return sentences
  if (scale - 1 < 0.05) return sentences
  return sentences.map((s) => ({
    ...s,
    startMs: Math.round(s.startMs * scale),
    endMs: Math.round(s.endMs * scale),
  }))
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
 * 从模型回复文本中提取第一个完整 JSON 对象（容错：思考通道混入叙述文字、代码围栏）
 */
export function extractJsonObject(raw: string): { json: string; error?: string } {
  const start = raw.indexOf('{')
  if (start === -1) return { json: '', error: 'No JSON object in response' }
  let depth = 0
  let inString = false
  let escaped = false
  for (let i = start; i < raw.length; i++) {
    const ch = raw[i]
    if (escaped) {
      escaped = false
      continue
    }
    if (ch === '\\') {
      escaped = true
      continue
    }
    if (ch === '"') {
      inString = !inString
      continue
    }
    if (inString) continue
    if (ch === '{') depth++
    if (ch === '}') {
      depth--
      if (depth === 0) {
        return { json: raw.slice(start, i + 1) }
      }
    }
  }
  return { json: '', error: 'Unterminated JSON object in response' }
}

/**
 * 调用转写模型：媒体文件 base64 → 逐句时间戳
 * 直接 fetch 端点（不走 ai SDK）：mimo-v2.5 是推理模型，长音频时转写结果可能
 * 全部落在 reasoning_content 通道而 content 为空，ai SDK 只读 content 会丢失。
 */
export async function callTranscriptionModel(
  base64: string,
  mediaType: 'AUDIO' | 'VIDEO',
): Promise<{ sentences: RawSentence[]; error?: string }> {
  const format = mediaType === 'VIDEO' ? 'mp4' : 'mp3'
  try {
    const res = await fetch(`${process.env.AI_BASE_URL ?? 'https://opencode.ai/zen/go/v1'}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.AI_API_KEY ?? ''}`,
      },
      body: JSON.stringify({
        model: TRANSCRIBE_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'input_audio', input_audio: { data: base64, format } },
              {
                type: 'text',
                text: `Transcribe this ${mediaType.toLowerCase()} to text. Return ONLY a JSON object: {"sentences": [{"text": "...", "startMs": 123, "endMs": 456}]}. Split into natural sentences. Timestamps in milliseconds from file start. No markdown, no explanations.`,
              },
            ],
          },
        ],
        temperature: 0,
        max_tokens: 8000,
      }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      return { sentences: [], error: `Transcription API ${res.status}: ${body.slice(0, 200)}` }
    }
    const text = await res.text()
    let data: unknown
    try {
      data = JSON.parse(text)
    } catch {
      return {
        sentences: [],
        error: `Transcription API returned invalid JSON body (${text.length} bytes): ${text.slice(0, 150)}`,
      }
    }
    const message = readMessage(data)
    // content 优先；为空时回落 reasoning_content（mimo 推理通道）
    const raw = message.content || message.reasoning || ''
    if (!raw) {
      return { sentences: [], error: 'Transcription model returned empty content' }
    }
    const extracted = extractJsonObject(raw)
    if (extracted.error) {
      return { sentences: [], error: `Transcription response is not valid JSON: ${extracted.error}` }
    }
    return parseTranscriptionResponse(extracted.json)
  } catch (e) {
    return { sentences: [], error: e instanceof Error ? e.message : 'Transcription model call failed' }
  }
}

/** 从 unknown 读取一层对象字段（非对象/字段缺失返回 undefined） */
function field(data: unknown, key: string): unknown {
  if (typeof data !== 'object' || data === null) return undefined
  const record: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(data)) {
    record[k] = v
  }
  return record[key]
}

/** 从 chat completions 响应中安全读取 content / reasoning 文本 */
function readMessage(data: unknown): { content: string; reasoning: string } {
  const choices = field(data, 'choices')
  if (!Array.isArray(choices) || choices.length === 0) return { content: '', reasoning: '' }
  const msg = field(choices[0], 'message')
  const content = field(msg, 'content')
  const reasoning = field(msg, 'reasoning_content')
  return {
    content: typeof content === 'string' ? content : '',
    reasoning: typeof reasoning === 'string' ? reasoning : '',
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
      const extracted = extractJsonObject(result.text)
      const data: unknown = extracted.error ? undefined : JSON.parse(extracted.json)
      const marks = jsonField(data, 'marks')
      if (!Array.isArray(marks) || marks.length !== batch.length) {
        // 该批解析失败/截断/数量不符：降级为全 false 标记（parseProperNounResponse 对
        // 空数组有逐句兜底），不让整门课程失败
        console.warn(
          `Proper noun batch degraded (${extracted.error ?? `marks ${Array.isArray(marks) ? marks.length : 'n/a'}/${batch.length}`}); head: ${stripCodeFence(result.text).slice(0, 120)}`,
        )
        for (let i = 0; i < batch.length; i++) {
          allMarks.push([])
        }
        continue
      }
      allMarks.push(...marks)
    }
    return parseProperNounResponse(JSON.stringify({ marks: allMarks }), sentences)
  } catch (e) {
    return { result: [], error: e instanceof Error ? e.message : 'Proper noun marking failed' }
  }
}
