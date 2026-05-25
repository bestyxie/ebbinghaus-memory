import { createOpenAI } from '@ai-sdk/openai';

export const aiProvider = createOpenAI({
  baseURL: process.env.AI_BASE_URL ?? 'https://open.bigmodel.cn/api/paas/v4',
  apiKey: process.env.AI_API_KEY,
}).chat;

export const AI_MODEL = process.env.AI_MODEL ?? 'glm-4';
