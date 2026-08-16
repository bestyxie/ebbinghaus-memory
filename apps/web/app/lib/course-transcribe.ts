/**
 * 课程听力转写模块
 * 音视频 → Groq Whisper（词/句级时间戳）转写 → glm-5.1 标记专有名词
 * 无 GROQ_API_KEY 时回落 mimo-v2.5（时间戳不可靠，仅保底）
 */

import { generateText } from 'ai'
import { aiProvider, AI_MODEL } from './ai-provider'
import {
  rawTranscriptionSentenceSchema,
  transcriptWordSchema,
  type TranscriptSentence,
} from '@ebbinghaus/shared'

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
 * Groq 单次转写调用：音频片段 Buffer → 句级时间戳（相对片段起点）
 */
async function groqTranscribeChunk(
  chunk: Buffer,
  key: string,
): Promise<{ sentences: RawSentence[]; error?: string }> {
  const form = new FormData()
  form.append('file', new Blob([new Uint8Array(chunk)], { type: 'audio/wav' }), 'chunk.wav')
  form.append('model', GROQ_MODEL)
  form.append('response_format', 'verbose_json')
  form.append('timestamp_granularities[]', 'segment')

  const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    return { sentences: [], error: `Groq API ${res.status}: ${body.slice(0, 200)}` }
  }
  const data: unknown = await res.json()
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
  return { sentences }
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
      const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}` },
        body: form,
      })
      if (!res.ok) {
        const body = await res.text().catch(() => '')
        return { sentences: [], error: `Groq API ${res.status}: ${body.slice(0, 200)}` }
      }
      const data: unknown = await res.json()
      const segments = field(data, 'segments')
      const sentences = parseGroqSegments(segments)
      if (sentences.error || sentences.sentences.length === 0) {
        return { sentences: [], error: sentences.error ?? 'Groq returned no usable segments' }
      }
      return { sentences: sentences.sentences }
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
    // 429 时按 Retry-After 退避一次
    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
    while (cursorSec < totalSec - 0.5) {
      const chunkEnd = Math.min(cursorSec + CHUNK_SEC, totalSec)
      const startByte = HEADER + Math.round(cursorSec * SAMPLE_RATE * BYTES_PER_SAMPLE)
      const endByte = HEADER + Math.round(chunkEnd * SAMPLE_RATE * BYTES_PER_SAMPLE)
      const wav = makeWavHeader(endByte - startByte)
      const chunk = Buffer.concat([wav, chunkedWav.subarray(startByte, endByte)])

      if (chunkIndex > 0) await sleep(3200)
      let result = await groqTranscribeChunk(chunk, key)
      if (result.error && result.error.includes('429')) {
        await sleep(60_000) // RPM 窗口重置
        result = await groqTranscribeChunk(chunk, key)
      }
      if (result.error) return { sentences: [], error: result.error }

      const overlapMs = chunkIndex === 0 ? 0 : OVERLAP_SEC * 1000
      const offsetMs = Math.round(cursorSec * 1000)
      for (const s of result.sentences) {
        const absStart = offsetMs + s.startMs
        // 跳过与上一块重叠区的句子（上一块已覆盖）
        if (absStart < offsetMs + overlapMs - 300 && chunkIndex > 0) continue
        all.push({ text: s.text, startMs: absStart, endMs: offsetMs + s.endMs })
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

/** 解析 Groq verbose_json 的 segments 数组 */
function parseGroqSegments(segments: unknown): { sentences: RawSentence[]; error?: string } {
  if (!Array.isArray(segments)) return { sentences: [], error: 'Groq returned no segments' }
  const sentences: RawSentence[] = []
  for (const seg of segments) {
    const rawText = field(seg, 'text')
    const text = typeof rawText === 'string' ? rawText.trim() : ''
    const start = field(seg, 'start')
    const end = field(seg, 'end')
    if (!text || typeof start !== 'number' || typeof end !== 'number') continue
    sentences.push({ text, startMs: Math.round(start * 1000), endMs: Math.round(end * 1000) })
  }
  return { sentences }
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
      let resultText = ''
      const groqKey = process.env.GROQ_API_KEY
      if (groqKey) {
        // 主通道：Groq 免费 LLM（与转写共用额度体系）
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
          body: JSON.stringify({
            model: process.env.GROQ_MARK_MODEL ?? 'openai/gpt-oss-120b',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0,
            // gpt-oss-120b 免费档 TPM=8000，max_tokens 计入 TPM，必须留 prompt 余量
            max_tokens: 6000,
          }),
        })
        if (res.ok) {
          const data: unknown = await res.json()
          const content = readMessage(data).content
          resultText = content
        } else if (res.status === 429 || res.status === 413) {
          // TPM 等限流：等窗口重置后重试一次（max_tokens 计入 TPM，需给足余量）
          await new Promise<void>((r) => setTimeout(r, 60_000))
          const retry = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
            body: JSON.stringify({
              model: process.env.GROQ_MARK_MODEL ?? 'openai/gpt-oss-120b',
              messages: [{ role: 'user', content: prompt }],
              temperature: 0,
              max_tokens: 6000,
            }),
          })
          if (retry.ok) {
            const data: unknown = await retry.json()
            resultText = readMessage(data).content
          } else {
            console.warn(`Groq mark model retry failed (${retry.status}); falling back to glm`)
          }
        } else {
          console.warn(`Groq mark model unavailable (${res.status}); falling back to glm`)
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
                max_tokens: 6000,
              }),
            })
            if (zen.ok) {
              const data: unknown = await zen.json()
              resultText = readMessage(data).content
            } else {
              console.warn(`zen mark attempt ${attempt + 1} failed (${zen.status})`)
            }
          } catch (e) {
            console.warn(`zen mark attempt ${attempt + 1} error: ${e instanceof Error ? e.message : 'unknown'}`)
          }
        }
      }
      if (!resultText) {
        // 回落 2：opencode glm-5.1
        const result = await generateText({
          model: aiProvider(AI_MODEL),
          prompt,
          temperature: 0,
        })
        resultText = result.text
      }
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
