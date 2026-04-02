import { z } from 'zod'
import {
  cardBaseSchema,
  deckBaseSchema,
  createCardSchema,
  createDeckSchema,
  updateCardSchema,
  updateDeckSchema,
  editCardSchema,
  recallBlockSchema,
  createArticleCardSchema,
  updateArticleCardSchema,
} from './zod'

// === 基础类型 (从 Zod 派生) ===
export type Card = z.infer<typeof cardBaseSchema>
export type Deck = z.infer<typeof deckBaseSchema>

// === 输入类型 (用于创建/更新) ===
export type CreateCardInput = z.infer<typeof createCardSchema>
export type UpdateCardInput = z.infer<typeof updateCardSchema>
export type EditCardInput = z.infer<typeof editCardSchema>
export type CreateDeckInput = z.infer<typeof createDeckSchema>
export type UpdateDeckInput = z.infer<typeof updateDeckSchema>

// === 响应类型 (API 返回，包含关系) ===
export type DeckWithCount = Deck & {
  _count: {
    cardDecks: number
  }
}

export type DeckMinimal = Pick<Deck, 'id' | 'title' | 'color'>

export type CardWithDeck = Card & {
  deck: DeckMinimal | null
}

// === 列表响应类型 ===
export interface CardsResponse {
  cards: CardWithDeck[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface DecksResponse {
  decks: DeckWithCount[]
}

// === Review Session 类型 ===
export interface ReviewSession {
  cards: CardWithDeck[]
  total: number
  hasMore: boolean
  nextCursor?: string
}

// === 工具类型 ===
export type CardState = Card['state']
export type CardStatus = 'new' | 'due' | 'overdue' | 'scheduled'

// === Article Card 类型 ===

// 主动回忆记忆块
export type RecallBlock = z.infer<typeof recallBlockSchema>

// 文章卡片类型 (扩展 Card 模型)
export type ArticleCard = Card & {
  cardType: 'ARTICLE'
  articleTitle: string
  articleContent: string
  recallBlocks: RecallBlock[] | null
  wordCount: number | null
  readTimeMins: number | null
  totalStudyTimeMs: number | null
  lastStudyAt: Date | null
}

// 文章卡片输入类型
export type CreateArticleCardInput = z.infer<typeof createArticleCardSchema>
export type UpdateArticleCardInput = z.infer<typeof updateArticleCardSchema>

// 带卡组的文章卡片
export type ArticleCardWithDeck = ArticleCard & {
  deck: DeckMinimal | null
}

// === 输出练习类型 ===

// 输出练习级别
export type OutputLevel = 1 | 2 | 3 | 4

// 输出练习数据
export interface OutputExercise {
  id: string
  cardId: string
  targetWord: string
  englishSentence: string
  chineseSentence: string
  fillBlankTemplate: string
  wordList: string[]
  standardAnswer: string
  contextPrompt: string
  createdAt: Date
  updatedAt: Date
}

// 带输出练习的卡片
export interface CardWithOutput extends CardWithDeck {
  outputRepetitions: number
  outputExercise: OutputExercise | null
}

// AI 评估结果
export interface AIEvaluationResult {
  vocabScore: number // 0-100
  grammarScore: number // 0-100
  nativeScore: number // 0-100
  feedback: string
  suggestedAnswer: string
  overall: 'correct' | 'partial' | 'incorrect'
}

// 输出练习日志
export interface OutputPracticeLog {
  id: string
  cardId: string
  exerciseId: string
  userId: string
  level: OutputLevel
  isCorrect: boolean
  userAnswer: string
  aiVocabScore: number | null
  aiGrammarScore: number | null
  aiNativeScore: number | null
  aiFeedback: string | null
  aiSuggestedAnswer: string | null
  practicedAt: Date
}
