import { z } from 'zod'

export const signSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Not a valid email'),
  name: z
    .string()
    .max(32, 'Name must be less than 32 characters')
    .optional(),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be more than 8 characters')
    .max(32, 'Password must be less than 32 characters'),
  // 来自 formData/credentials 的字符串 'true' | 'false'
  register: z.enum(['true', 'false']).optional(),
})

export const memoryItemSchema = z.object({
  content: z.string(),
  review_count: z.number(),
  next_review: z.number(),
})

// 来源定位载荷 —— CSS 路径 + 上下文 + 父块内出现序号
export const sourceAnchorSchema = z.object({
  sel: z.string().min(1, "CSS selector is required"),
  ctx: z.string().min(1, "Context text is required"),
  occ: z.number().int().positive("Occurrence must be a positive integer"),
})

// 卡片来源 —— 五字段原子化：全有或全无
export const cardSourceSchema = z.object({
  sourceUrl: z.string().url("Source URL must be a valid URL"),
  sourceWord: z.string().min(1, "Source word is required"),
  sourceAnchor: sourceAnchorSchema,
  sourceTitle: z.string().min(1, "Source title is required"),
  capturedAt: z.string().datetime("Captured at must be an ISO 8601 datetime"),
})

// 卡片创建验证
export const createCardSchema = z.object({
  front: z.string().min(1, "Title is required"),
  back: z.string().min(1, "Content is required"),
  note: z.string().optional(),
  deckId: z.string().optional(),
  quality: z.enum(["5", "4", "3"]),
  // 来源定位（五字段原子化）
  sourceUrl: z.string().url().optional(),
  sourceWord: z.string().optional(),
  sourceAnchor: sourceAnchorSchema.optional(),
  sourceTitle: z.string().optional(),
  capturedAt: z.string().datetime().optional(),
  // provenance 标识（独立可空）
  sourceProvenance: z.string().optional(),
})

// 卡片编辑验证
export const editCardSchema = z.object({
  cardId: z.string().min(1, "Card ID required"),
  front: z.string().min(1, "Title required"),
  back: z.string().min(1, "Content required"),
  note: z.string().optional(),
  deckId: z.string().optional(),
})

// 根据 SM-2 算法计算初始 easeFactor
// quality 5 (Easy) → 2.6
// quality 4 (Medium) → 2.5
// quality 3 (Hard) → 2.36
export function calculateInitialEaseFactor(quality: number): number {
  const baseEF = 2.5;
  return baseEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
}

// Card schemas
export const cardBaseSchema = z.object({
  id: z.string().cuid(),
  cardType: z.enum(['FLASHCARD', 'ARTICLE']).default('FLASHCARD'),
  front: z.string().min(1),
  back: z.string().min(1),
  note: z.string().nullable(),
  // 来源定位（五字段原子化：全有或全无）
  sourceUrl: z.string().nullable().optional(),
  sourceWord: z.string().nullable().optional(),
  sourceAnchor: z.any().nullable().optional(), // JSON field, Prisma returns JsonValue
  sourceTitle: z.string().nullable().optional(),
  capturedAt: z.date().nullable().optional(),
  // provenance 标识（独立可空）
  sourceProvenance: z.string().nullable().optional(),
  nextReviewAt: z.date(),
  interval: z.number().int().min(0),
  easeFactor: z.number().min(1.3),
  repetitions: z.number().int().min(0),
  outputRepetitions: z.number().int().min(0).default(0),
  outputInterval: z.number().int().min(0).default(0),
  outputEaseFactor: z.number().min(1.3).default(2.5),
  outputNextReviewAt: z.date().nullable().optional(),
  state: z.enum(['NEW', 'LEARNING', 'REVIEW', 'RELEARNING']),
  userId: z.string().cuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  // Article card fields
  articleTitle: z.string().nullable().optional(),
  articleContent: z.string().nullable().optional(),
  recallBlocks: z.any().nullable().optional(), // JSON field
  wordCount: z.number().int().nullable().optional(),
  readTimeMins: z.number().int().nullable().optional(),
  totalStudyTimeMs: z.number().int().nullable().optional(),
  lastStudyAt: z.date().nullable().optional(),
})

export const updateCardSchema = z.object({
  front: z.string().min(1).optional(),
  back: z.string().min(1).optional(),
  note: z.string().nullable().optional(),
})

// Deck schemas
export const deckBaseSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1).max(100),
  description: z.string().max(500).nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/), // 必填字段
  isPublic: z.boolean(),
  deletedAt: z.date().nullable(),
  userId: z.string().cuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const createDeckSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  isPublic: z.boolean().optional().default(false),
})

export const updateDeckSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  isPublic: z.boolean().optional(),
})

// AI Memory Text Generation schemas
export const generateMemoryTextSchema = z.object({
  cardFronts: z.array(z.string().min(1)).min(1, 'At least one card front is required').max(20, 'Maximum 20 card fronts allowed'),
})

// Recall Block schema for article cards
export const recallBlockSchema = z.object({
  id: z.string(),
  startIndex: z.number().int().min(0),
  endIndex: z.number().int().min(0),
  content: z.string().min(1),
  hint: z.string().optional(),
})

// Article card creation validation
export const createArticleCardSchema = z.object({
  articleTitle: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  articleContent: z.string().min(1, "Content is required"),
  deckId: z.string().optional(),
  recallBlocks: z.array(recallBlockSchema).optional(),
})

// Article card update validation
export const updateArticleCardSchema = z.object({
  cardId: z.string().cuid(),
  articleTitle: z.string().min(1).max(200).optional(),
  articleContent: z.string().min(1).optional(),
  recallBlocks: z.array(recallBlockSchema).optional(),
})

// Update recall blocks validation
export const updateRecallBlocksSchema = z.object({
  cardId: z.string().cuid(),
  recallBlocks: z.array(recallBlockSchema),
})

// === 课程学习（听力 + 口语） ===

// 转写句内单词
// isProperNoun = 地名/人名，听力页免输、口语页照常评分
// phonetic = 口语逐词弹窗的音标（IPA，转写富化生成；专有名词可缺省）
// startMs/endMs = 词级原音频时间戳（mimo 回落无词级时间戳为 null）
export const transcriptWordSchema = z.object({
  text: z.string().min(1),
  isProperNoun: z.boolean(),
  phonetic: z.string().nullable().optional(),
  startMs: z.number().int().min(0).nullable().optional(),
  endMs: z.number().int().min(0).nullable().optional(),
})

// 转写句（带毫秒时间戳，用于按句 seek 播放；translation = 中译文，口语困难难度提示）
export const transcriptSentenceSchema = z.object({
  idx: z.number().int().min(0),
  text: z.string().min(1),
  startMs: z.number().int().min(0),
  endMs: z.number().int().min(0),
  words: z.array(transcriptWordSchema),
  translation: z.string().nullable().optional(),
})

export const transcriptSchema = z.array(transcriptSentenceSchema)

// 转写模型返回的原始句（无 words，需后续标记专有名词）
export const rawTranscriptionSentenceSchema = z.object({
  text: z.string().min(1),
  startMs: z.number().int().min(0),
  endMs: z.number().int().min(0),
})

// 学习进度更新
export const updateCourseProgressSchema = z.object({
  sentenceIndex: z.number().int().min(0),
  completedSentenceIds: z.array(z.number().int().min(0)),
  status: z.enum(['IN_PROGRESS', 'COMPLETED']),
})

// === 课程口语学习 ===

// 口语难度
export const speakingDifficultySchema = z.enum(['EASY', 'MEDIUM', 'HARD'])

// 口语评分：单个词的得分与在录音内的起止偏移（startMs/endMs = 录音内毫秒位置）
export const scoreWordResultSchema = z.object({
  text: z.string().min(1),
  score: z.number().min(0).max(100),
  startMs: z.number().int().min(0).nullable().optional(),
  endMs: z.number().int().min(0).nullable().optional(),
})

// 一句录音的整体评分结果（overall = 综合评分 0-100）
export const scoreResultSchema = z.object({
  overall: z.number().min(0).max(100),
  words: z.array(scoreWordResultSchema),
})

// 口语进度（每用户每课程每难度；bestScores 按句 idx 对齐，null = 该句未录）
export const speakingProgressSchema = z.object({
  difficulty: speakingDifficultySchema,
  sentenceIndex: z.number().int().min(0),
  completedSentenceIds: z.array(z.number().int().min(0)),
  status: z.enum(['IN_PROGRESS', 'COMPLETED']),
  bestScores: z.array(z.number().min(0).max(100).nullable()).nullable().optional(),
})
