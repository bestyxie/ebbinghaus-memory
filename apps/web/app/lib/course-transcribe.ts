/**
 * 课程听力转写模块
 * 音视频 → Groq Whisper（词/句级时间戳）转写 → glm-5.1 标记专有名词
 * 无 GROQ_API_KEY 时回落 mimo-v2.5（时间戳不可靠，仅保底）
 */

import { generateText } from 'ai'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { tmpdir } from 'os'
import path from 'path'
import { readFile } from 'fs/promises'
import { aiProvider, AI_MODEL } from './ai-provider'
import { normalizeWord, tokenizeSentence } from './course-words'
export { normalizeWord, tokenizeSentence, compareWord } from './course-words'
import {
  rawTranscriptionSentenceSchema,
  transcriptWordSchema,
  type TranscriptSentence,
} from '@ebbinghaus/shared'

const execFileAsync = promisify(execFile)

/**
 * ffmpeg 转标准 16kHz 单声道 wav（分块转写与词级时间戳重转的输入）。
 * ffmpeg 不可用或失败返回 null（调用方回落整段上传模式）。
 */
export async function toStandardWav(inputPath: string): Promise<Buffer | null> {
  const out = path.join(tmpdir(), `asr-${Date.now()}-${Math.random().toString(36).slice(2)}.wav`)
  try {
    await execFileAsync('ffmpeg', ['-i', inputPath, '-ar', '16000', '-ac', '1', '-y', out], {
      timeout: 120_000,
    })
    return await readFile(out)
  } catch {
    return null
  } finally {
    execFileAsync('rm', ['-f', out]).catch(() => {})
  }
}

/** 回落转写模型（opencode.ai 端点） */
const FALLBACK_TRANSCRIBE_MODEL = process.env.AI_TRANSCRIBE_MODEL ?? 'mimo-v2.5'

/** Groq Whisper 模型（免费档，句级时间戳精确） */
const GROQ_MODEL = process.env.GROQ_TRANSCRIBE_MODEL ?? 'whisper-large-v3-turbo'

/** Groq 单文件上限 25MB */
const GROQ_MAX_BYTES = 25 * 1024 * 1024

/** 专有名词标记分批大小 */
// 20 句/批：输出为逐词 JSON，40 句时输出 token 轻松超 6k（TPM 8k 上限）
const PROPER_NOUN_BATCH_SIZE = 20

/** 转写模型返回的原始句（无 words） */
export interface RawSentence {
  text: string
  startMs: number
  endMs: number
  /** Groq word granularity 返回的词级时间戳（相对媒体起点）；mimo 回落无 */
  words?: { text: string; startMs: number; endMs: number }[]
}

// === 纯函数（单测覆盖） ===

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
 * 时间戳校准：mimo 回落模型的时间轴存在系统性漂移，方向不固定——实测可整体压缩
 * （模型 < 真实，句子音频被提前切断、要听写的词没播出来），也可整体扩展
 * （模型 > 真实，末句会超出媒体时长，超出部分播放为静音/空）。
 * 用媒体真实时长把模型时间轴线性缩放到真实时间轴：
 * scale = realDuration / modelLastEnd。
 * 双向都校准（0.5~1.5 之外视为模型不可信，保持原值）；偏差 <5% 视为噪声不校准。
 * 校准后 clamp 到 [0, 真实时长]，保证任何句子不会播到文件结束之后。
 */
export function calibrateTimestamps(
  sentences: RawSentence[],
  realDurationMs: number | null | undefined,
): RawSentence[] {
  if (!realDurationMs || realDurationMs <= 0 || sentences.length === 0) return sentences
  const lastEnd = sentences[sentences.length - 1].endMs
  if (lastEnd <= 0) return sentences
  const scale = realDurationMs / lastEnd
  if (scale < 0.5 || scale > 1.5) return sentences
  if (Math.abs(scale - 1) < 0.05) return sentences
  return sentences.map((s) => ({
    ...s,
    startMs: Math.min(Math.max(0, Math.round(s.startMs * scale)), realDurationMs),
    endMs: Math.min(Math.max(0, Math.round(s.endMs * scale)), realDurationMs),
  }))
}

/**
 * 解析专有名词标记模型返回的 JSON，组装最终 TranscriptSentence 数组
 * 模型需返回 { marks: [{ text, isProperNoun }[]] }（与输入句一一对应）
 * Groq 词级时间戳按归一化文本贪心匹配进 words（匹配不上为 null）
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
    const markList = Array.isArray(marks[i]) ? marks[i] : []
    const marked: { text: string; isProperNoun: boolean }[] = []
    for (const w of markList) {
      const parsed = transcriptWordSchema.safeParse(w)
      if (parsed.success) marked.push(parsed.data)
    }
    // 模型漏词时按原文兜底全部标记为非专有名词
    if (marked.length === 0) {
      return {
        idx: i,
        text: sentence.text,
        startMs: sentence.startMs,
        endMs: sentence.endMs,
        words: attachWordTimestamps(tokenizeSentence(sentence.text).map((text) => ({ text, isProperNoun: false })), sentence.words),
      }
    }
    return {
      idx: i,
      text: sentence.text,
      startMs: sentence.startMs,
      endMs: sentence.endMs,
      words: attachWordTimestamps(marked, sentence.words),
    }
  })
  return { result }
}

/** 把 Groq 词级时间戳按归一化文本贪心匹配到标记词（匹配不上省略字段，保持存量 transcript 干净） */
function attachWordTimestamps(
  marked: { text: string; isProperNoun: boolean }[],
  rawWords: NonNullable<RawSentence['words']> | undefined,
): TranscriptSentence['words'] {
  const used = new Set<number>()
  return marked.map((mw) => {
    const norm = normalizeWord(mw.text)
    if (rawWords && norm) {
      const idx = rawWords.findIndex((rw, i) => !used.has(i) && normalizeWord(rw.text) === norm)
      if (idx !== -1) {
        used.add(idx)
        return { ...mw, startMs: rawWords[idx].startMs, endMs: rawWords[idx].endMs }
      }
    }
    return mw
  })
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
 * 解析 Groq verbose_json（segments + 顶层 words 数组），组装 RawSentence[]
 * word granularity 的词级时间戳在顶层 `words`（[{word,start,end}]），不在 segment 内；
 * 按时间包含关系把词归属到句子。
 */
function parseGroqResponse(data: unknown): { sentences: RawSentence[]; error?: string } {
  const segments = field(data, 'segments')
  if (!Array.isArray(segments)) {
    return { sentences: [], error: 'Groq returned no segments' }
  }
  const sentences: RawSentence[] = []
  for (const seg of segments) {
    const rawText = field(seg, 'text')
    const text = typeof rawText === 'string' ? rawText.trim() : ''
    const start = field(seg, 'start')
    const end = field(seg, 'end')
    if (!text || typeof start !== 'number' || typeof end !== 'number') continue
    sentences.push({ text, startMs: Math.round(start * 1000), endMs: Math.round(end * 1000) })
  }
  const topWords = field(data, 'words')
  if (Array.isArray(topWords) && topWords.length > 0 && sentences.length > 0) {
    const words: NonNullable<RawSentence['words']> = []
    for (const w of topWords) {
      const raw = field(w, 'word')
      const start = field(w, 'start')
      const end = field(w, 'end')
      if (typeof raw === 'string' && raw && typeof start === 'number' && typeof end === 'number') {
        words.push({ text: raw, startMs: Math.round(start * 1000), endMs: Math.round(end * 1000) })
      }
    }
    return { sentences: assignWordsToSentences(sentences, words) }
  }
  return { sentences }
}

/** 按时间包含关系把词级时间戳归属到句子（词起点落在句区间内） */
export function assignWordsToSentences(
  sentences: RawSentence[],
  words: NonNullable<RawSentence['words']>,
): RawSentence[] {
  return sentences.map((s) => {
    const matched = words.filter((w) => w.startMs >= s.startMs && w.startMs < s.endMs)
    return matched.length > 0 ? { ...s, words: matched } : s
  })
}

/**
 * 调用 Groq Whisper：媒体文件 Buffer（mp3/m4a/wav 原格式）→ 句级时间戳
 *
 * 分块策略（~25s/块）：Whisper 对含片头静音+重复内容的整段音频会整块跳读
 * （实测 englishpod 整段上传丢掉 2.5-30s 的对话），分块后每块独立解码无此问题。
 * 原始 Buffer 无法在服务端安全切片 → 要求调用方提供 wav PCM 才能按字节切；
 * 非 wav 输入走整段上传（多数文件 OK，个别片头静音文件可能跳读）。
 */
export async function callGroqTranscription(
  file: { buffer: Buffer; mime: string },
  chunkedWav?: Buffer,
): Promise<{ sentences: RawSentence[]; error?: string }> {
  const key = process.env.GROQ_API_KEY
  if (!key) return { sentences: [], error: 'GROQ_API_KEY not configured' }
  if (file.buffer.length > GROQ_MAX_BYTES && !chunkedWav) {
    return { sentences: [], error: `File exceeds Groq 25MB limit (${(file.buffer.length / 1024 / 1024).toFixed(1)}MB)` }
  }
  try {
    if (!chunkedWav) {
      // 整段上传（原格式）
      const ext = file.mime.includes('wav') ? 'wav' : file.mime.includes('mp4') && file.mime.startsWith('video') ? 'mp4' : 'mp3'
      const form = new FormData()
      form.append('file', new Blob([new Uint8Array(file.buffer)], { type: file.mime }), `audio.${ext}`)
      form.append('model', GROQ_MODEL)
      form.append('response_format', 'verbose_json')
      form.append('timestamp_granularities[]', 'segment')
      form.append('timestamp_granularities[]', 'word')
      return await groqTranscribe(form, key)
    }

    // 分块路径：16kHz 单声道 wav，按采样字节切 ~25s 块，块间 2s 重叠去重
    const SAMPLE_RATE = 16000
    const BYTES_PER_SAMPLE = 2
    const HEADER = 44 // 标准 RIFF 头
    const dataLen = chunkedWav.length - HEADER
    const totalSec = dataLen / (SAMPLE_RATE * BYTES_PER_SAMPLE)
    const CHUNK_SEC = 25
    const OVERLAP_SEC = 2

    const all: RawSentence[] = []
    let cursorSec = 0
    let chunkIndex = 0
    // Groq 免费档 20 RPM：连续分块会触顶（429）。块间间隔 3.2s 匀速发送；
    // groqTranscribe 内对 429 等 60s 自动重试
    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
    while (cursorSec < totalSec - 0.5) {
      const chunkEnd = Math.min(cursorSec + CHUNK_SEC, totalSec)
      const startByte = HEADER + Math.round(cursorSec * SAMPLE_RATE * BYTES_PER_SAMPLE)
      const endByte = HEADER + Math.round(chunkEnd * SAMPLE_RATE * BYTES_PER_SAMPLE)
      const wav = makeWavHeader(endByte - startByte)
      const chunk = Buffer.concat([wav, chunkedWav.subarray(startByte, endByte)])

      if (chunkIndex > 0) await sleep(3200)
      const form = new FormData()
      form.append('file', new Blob([new Uint8Array(chunk)], { type: 'audio/wav' }), 'chunk.wav')
      form.append('model', GROQ_MODEL)
      form.append('response_format', 'verbose_json')
      form.append('timestamp_granularities[]', 'segment')
      form.append('timestamp_granularities[]', 'word')
      const result = await groqTranscribe(form, key)
      if (result.error) return { sentences: [], error: result.error }

      const overlapMs = chunkIndex === 0 ? 0 : OVERLAP_SEC * 1000
      const offsetMs = Math.round(cursorSec * 1000)
      for (const s of result.sentences) {
        const absStart = offsetMs + s.startMs
        // 跳过与上一块重叠区的句子（上一块已覆盖）
        if (absStart < offsetMs + overlapMs - 300 && chunkIndex > 0) continue
        const words = s.words?.map((w) => ({ ...w, startMs: offsetMs + w.startMs, endMs: offsetMs + w.endMs }))
        all.push({ text: s.text, startMs: absStart, endMs: offsetMs + s.endMs, words })
      }
      cursorSec = chunkEnd - OVERLAP_SEC
      if (chunkEnd >= totalSec) break
      chunkIndex++
    }

    if (all.length === 0) {
      return { sentences: [], error: 'Groq chunked transcription returned nothing' }
    }
    all.sort((a, b) => a.startMs - b.startMs)
    return { sentences: dedupeOverlapSentences(all) }
  } catch (e) {
    return { sentences: [], error: e instanceof Error ? e.message : 'Groq transcription failed' }
  }
}

/**
 * Groq 转写调用（带自动重试）：429（免费档 20 RPM 触顶）等 60s 重试，
 * 5xx/网络错误等 5s 重试，各最多 2 次。整段与分块路径共用。
 */
async function groqTranscribe(
  form: FormData,
  key: string,
): Promise<{ sentences: RawSentence[]; error?: string }> {
  for (let attempt = 0; ; attempt++) {
    let res: Response
    try {
      res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}` },
        body: form,
      })
    } catch (e) {
      if (attempt < 2) {
        await new Promise<void>((r) => setTimeout(r, 5_000))
        continue
      }
      return { sentences: [], error: e instanceof Error ? e.message : 'Groq transcription network error' }
    }
    if (res.ok) {
      const data: unknown = await res.json()
      const parsed = parseGroqResponse(data)
      if (parsed.error || parsed.sentences.length === 0) {
        return { sentences: [], error: parsed.error ?? 'Groq returned no usable segments' }
      }
      return { sentences: parsed.sentences }
    }
    const bodyText = await res.text().catch(() => '')
    const err = `Groq API ${res.status}: ${bodyText.slice(0, 200)}`
    if (res.status === 429 && attempt < 2) {
      await new Promise<void>((r) => setTimeout(r, 60_000)) // RPM 窗口重置
      continue
    }
    if (res.status >= 500 && res.status < 600 && attempt < 2) {
      await new Promise<void>((r) => setTimeout(r, 5_000))
      continue
    }
    return { sentences: [], error: err }
  }
}

/** 构造 16kHz 单声道 16bit wav 头 */
function makeWavHeader(dataBytes: number): Buffer {
  const header = Buffer.alloc(44)
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + dataBytes, 4)
  header.write('WAVE', 8)
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20) // PCM
  header.writeUInt16LE(1, 22) // mono
  header.writeUInt32LE(16000, 24)
  header.writeUInt32LE(32000, 28) // byte rate
  header.writeUInt16LE(2, 32)
  header.writeUInt16LE(16, 34)
  header.write('data', 36)
  header.writeUInt32LE(dataBytes, 40)
  return header
}

/** 去掉块重叠产生的重复/近似句子（按起始时间+文本前缀） */
function dedupeOverlapSentences(sentences: RawSentence[]): RawSentence[] {
  const out: RawSentence[] = []
  for (const s of sentences) {
    const dup = out.some(
      (kept) =>
        Math.abs(kept.startMs - s.startMs) < 1500 &&
        (kept.text.slice(0, 20).toLowerCase() === s.text.slice(0, 20).toLowerCase() ||
          kept.text.includes(s.text) ||
          s.text.includes(kept.text)),
    )
    if (!dup) out.push(s)
  }
  return out
}

/**
 * 回落转写（mimo-v2.5）：时间戳不可靠（系统性漂移），仅在未配置 Groq 时使用
 * 直接 fetch 端点（不走 ai SDK）：mimo 是推理模型，结果可能全落在 reasoning_content
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
        model: FALLBACK_TRANSCRIBE_MODEL,
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
 * 多级 LLM 链调用：Groq gpt-oss-120b（免费）主 → zen 免费 deepseek 回落 → glm-5.1 兜底
 * 返回模型文本内容；全链路失败返回空串
 */
async function runLLMChain(prompt: string, maxTokens: number): Promise<string> {
  const model = process.env.GROQ_MARK_MODEL ?? 'openai/gpt-oss-120b'
  let resultText = ''
  const groqKey = process.env.GROQ_API_KEY
  if (groqKey) {
    const body = JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
      // gpt-oss-120b 免费档 TPM=8000，max_tokens 计入 TPM，必须留 prompt 余量
      max_tokens: maxTokens,
    })
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
      body,
    })
    if (res.ok) {
      const data: unknown = await res.json()
      resultText = readMessage(data).content
    } else if (res.status === 429 || res.status === 413) {
      // TPM 等限流：等窗口重置后重试一次（max_tokens 计入 TPM，需给足余量）
      await new Promise<void>((r) => setTimeout(r, 60_000))
      const retry = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
        body,
      })
      if (retry.ok) {
        const data: unknown = await retry.json()
        resultText = readMessage(data).content
      } else {
        console.warn(`Groq LLM retry failed (${retry.status}); falling back`)
      }
    } else {
      console.warn(`Groq LLM unavailable (${res.status}); falling back`)
    }
  }
  if (!resultText) {
    // 回落 1：opencode zen 免费 deepseek（共享池，偶发限流 → 重试一次）
    const zenKey = process.env.AI_API_KEY
    for (let attempt = 0; attempt < 2 && !resultText; attempt++) {
      if (attempt > 0) await new Promise<void>((r) => setTimeout(r, 15_000))
      try {
        const zen = await fetch('https://opencode.ai/zen/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${zenKey ?? ''}` },
          body: JSON.stringify({
            model: process.env.ZEN_MARK_MODEL ?? 'deepseek-v4-flash-free',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0,
            max_tokens: maxTokens,
          }),
        })
        if (zen.ok) {
          const data: unknown = await zen.json()
          resultText = readMessage(data).content
        } else {
          console.warn(`zen LLM attempt ${attempt + 1} failed (${zen.status})`)
        }
      } catch (e) {
        console.warn(`zen LLM attempt ${attempt + 1} error: ${e instanceof Error ? e.message : 'unknown'}`)
      }
    }
  }
  if (!resultText) {
    // 回落 2：opencode glm-5.1
    try {
      const result = await generateText({
        model: aiProvider(AI_MODEL),
        prompt,
        temperature: 0,
      })
      resultText = result.text
    } catch (e) {
      console.warn(`glm LLM fallback error: ${e instanceof Error ? e.message : 'unknown'}`)
    }
  }
  return resultText
}

/**
 * 调用 LLM 分批标记专有名词，返回完整 transcript
 * 主通道：Groq gpt-oss-120b（免费，与转写共用 key）；失败回落 opencode glm-5.1
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
      const prompt = `For each numbered sentence, list EVERY word in order as JSON objects with isProperNoun=true only for person/place/organization/brand names; all other words false. Keep original word form.

Sentences:
${numbered}

Return ONLY JSON: {"marks": [[{"text":"word","isProperNoun":false}], ...]} — one inner array per sentence, same order, words in original order. No markdown.`
      const resultText = await runLLMChain(prompt, 6000)
      const extracted = extractJsonObject(resultText)
      const data: unknown = extracted.error ? undefined : JSON.parse(extracted.json)
      const marks = jsonField(data, 'marks')
      if (!Array.isArray(marks) || marks.length !== batch.length) {
        // 该批解析失败/截断/数量不符：降级为全 false 标记（parseProperNounResponse 对
        // 空数组有逐句兜底），不让整门课程失败
        console.warn(
          `Proper noun batch degraded (${extracted.error ?? `marks ${Array.isArray(marks) ? marks.length : 'n/a'}/${batch.length}`}); head: ${stripCodeFence(resultText).slice(0, 120)}`,
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

/** 口语富化批量大小（中译 + 逐词音标，输出 token 量大于专有名词标记） */
const ENRICH_BATCH_SIZE = 8

/**
 * 富化 transcript：逐句中译 + 逐词 IPA 音标
 * 输出合并进 TranscriptSentence（translation / word.phonetic），失败降级字段留空
 */
export async function enrichTranscript(
  sentences: TranscriptSentence[],
): Promise<{ result: TranscriptSentence[]; error?: string }> {
  if (sentences.length === 0) return { result: sentences }
  try {
    const result = sentences.map((s) => ({ ...s, words: s.words.map((w) => ({ ...w })) }))
    const batches: TranscriptSentence[][] = []
    for (let i = 0; i < sentences.length; i += ENRICH_BATCH_SIZE) {
      batches.push(sentences.slice(i, i + ENRICH_BATCH_SIZE))
    }
    for (const batch of batches) {
      const numbered = batch
        .map((s, i) => {
          const words = s.words.map((w) => w.text).join(' ')
          return `${i + 1}. ${s.text}\n   words: ${words}`
        })
        .join('\n\n')
      const prompt = `For each numbered English sentence: (1) give a natural Simplified-Chinese translation; (2) give IPA phonetics for EVERY word, in the exact order of the sentence's words.

Sentences:
${numbered}

Return ONLY JSON: {"translations": ["中文翻译1", ...], "words": [[{"text":"word","phonetic":"/həˈləʊ/"}], ...]} — translations one per sentence; words one inner array per sentence, same order as the sentence's words, every word has a phonetic. No markdown.`
      const resultText = await runLLMChain(prompt, 6000)
      const extracted = extractJsonObject(resultText)
      const data: unknown = extracted.error ? undefined : JSON.parse(extracted.json)
      const translations = jsonField(data, 'translations')
      const wordMarks = jsonField(data, 'words')
      const translationsOk = Array.isArray(translations) && translations.length === batch.length
      const wordsOk = Array.isArray(wordMarks) && wordMarks.length === batch.length
      if (!translationsOk && !wordsOk) {
        console.warn(
          `Enrich batch degraded (${extracted.error ?? `translations ${Array.isArray(translations) ? translations.length : 'n/a'}/${batch.length}, words ${Array.isArray(wordMarks) ? wordMarks.length : 'n/a'}/${batch.length}`}); head: ${stripCodeFence(resultText).slice(0, 120)}`,
        )
        continue
      }
      const batchIdxStart = batch[0].idx
      const batchSlice = result.slice(batchIdxStart, batchIdxStart + batch.length)
      const merged = applyEnrichment(batchSlice, translations, wordMarks)
      result.splice(batchIdxStart, batch.length, ...merged)
    }
    return { result }
  } catch (e) {
    return { result: sentences, error: e instanceof Error ? e.message : 'Transcript enrichment failed' }
  }
}

/**
 * 把 LLM 富化输出（translations + words[][{text,phonetic}]）合并进 transcript（纯函数）
 * 数量不符的字段跳过，不影响其他句
 */
export function applyEnrichment(
  sentences: TranscriptSentence[],
  translations: unknown,
  wordMarks: unknown,
): TranscriptSentence[] {
  const result = sentences.map((s) => ({ ...s, words: s.words.map((w) => ({ ...w })) }))
  const translationsOk = Array.isArray(translations) && translations.length === sentences.length
  const wordsOk = Array.isArray(wordMarks) && wordMarks.length === sentences.length
  for (let i = 0; i < sentences.length; i++) {
    if (translationsOk) {
      const tr = translations[i]
      if (typeof tr === 'string') {
        result[i].translation = tr
      }
    }
    if (wordsOk) {
      result[i].words = attachPhonetics(result[i].words, Array.isArray(wordMarks[i]) ? wordMarks[i] : [])
    }
  }
  return result
}

/** 把 LLM 音标按归一化文本贪心匹配到 transcript 词（匹配不上保留 phonetic 为 null） */
function attachPhonetics(
  words: TranscriptSentence['words'],
  marks: unknown[],
): TranscriptSentence['words'] {
  const used = new Set<number>()
  return words.map((w) => {
    const norm = normalizeWord(w.text)
    let phonetic: string | null = null
    for (let i = 0; i < marks.length; i++) {
      if (used.has(i)) continue
      const m = marks[i]
      if (typeof m !== 'object' || m === null) continue
      const entries = Object.entries(m)
      const text = entries.find(([k]) => k === 'text')?.[1]
      const ph = entries.find(([k]) => k === 'phonetic')?.[1]
      const textOk = typeof text === 'string' ? text : ''
      const phOk = typeof ph === 'string' ? ph : ''
      if (norm && textOk && normalizeWord(textOk) === norm) {
        used.add(i)
        if (phOk) phonetic = phOk
        break
      }
    }
    return phonetic ? { ...w, phonetic } : w
  })
}

/**
 * 把重新转写的词级时间戳合并进已存 transcript（按句起点对齐匹配）
 * 用于存量课程 enrich：老 transcript 无词级时间戳，重跑 Groq word granularity 补齐
 */
export function mergeWordTimestamps(
  sentences: TranscriptSentence[],
  raw: RawSentence[],
): TranscriptSentence[] {
  return sentences.map((s) => {
    const matches = raw.filter((r) => Math.abs(r.startMs - s.startMs) < 1500)
    const match = matches.find((r) => r.words && r.words.length > 0)
    if (!match) return s
    return { ...s, words: attachWordTimestamps(s.words, match.words) }
  })
}
