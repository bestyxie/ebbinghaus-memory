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

// 卡片创建验证
export const createCardSchema = z.object({
  front: z.string().min(1, "Title is required"),
  back: z.string().min(1, "Content is required"),
  note: z.string().optional(),
  deckId: z.string().optional(),
  quality: z.enum(["5", "4", "3"]),
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
  front: z.string().min(1),
  back: z.string().min(1),
  note: z.string().nullable(),
  nextReviewAt: z.date(),
  interval: z.number().int().min(0),
  easeFactor: z.number().min(1.3),
  repetitions: z.number().int().min(0),
  state: z.enum(['NEW', 'LEARNING', 'REVIEW', 'RELEARNING']),
  userId: z.string().cuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
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
