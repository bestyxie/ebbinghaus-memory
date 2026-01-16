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
