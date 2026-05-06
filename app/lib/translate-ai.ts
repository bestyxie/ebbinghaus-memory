/**
 * Translation AI Module
 * AI-powered translation task generation and evaluation
 */

import { generateObject, generateText } from 'ai';
import { zhipu } from 'zhipu-ai-provider';
import { z } from 'zod';

// === 类型定义 ===

export type TranslationDifficulty = 'basic' | 'advanced' | 'expert';

export interface GenerateTranslationInput {
  topic: string;
  difficulty: TranslationDifficulty;
}

export interface GenerateTranslationOutput {
  sourceText: string;
  hintWords: string[];
}

export interface EvaluateTranslationOutput {
  score: number;
  accuracyScore: number;
  fluencyScore: number;
  vocabScore: number;
  feedback: string;
  polished: string;
  nativeAlt: string;
  annotations: Array<{
    segment: string;
    type: 'good' | 'bad';
    comment: string;
  }>;
  nativeAnnotations: Array<{
    segment: string;
    comment: string;
  }>;
}

// === Zod Schemas ===

const generationSchema = z.object({
  sourceText: z.string().min(1),
  hintWords: z.array(z.string()).min(2).max(5),
});

const evaluationSchema = z.object({
  score: z.number().int().min(0).max(100),
  accuracyScore: z.number().int().min(0).max(100),
  fluencyScore: z.number().int().min(0).max(100),
  vocabScore: z.number().int().min(0).max(100),
  feedback: z.string().min(1),
  polished: z.string().min(1),
  nativeAlt: z.string().min(1),
  annotations: z.array(z.object({
    segment: z.string(),
    type: z.enum(['good', 'bad']),
    comment: z.string(),
  })),
  nativeAnnotations: z.array(z.object({
    segment: z.string(),
    comment: z.string(),
  })),
});

// === 难度描述映射 ===

const difficultyDescriptions: Record<TranslationDifficulty, string> = {
  basic: '基础表达 — 短句，常见词汇，适合初学者',
  advanced: '进阶长句 — 复杂句式，领域专业术语，适合中级学习者',
  expert: '骨灰级难度 — 长难句，高级表达和修辞，适合高级学习者',
};

// === 生成翻译源文本 ===

export async function generateTranslationSource(
  input: GenerateTranslationInput
): Promise<{ data: GenerateTranslationOutput | null; error?: string }> {
  const { topic, difficulty } = input;

  try {
    const result = await generateObject({
      model: zhipu('glm-4'),
      temperature: 0.8,
      schema: generationSchema,
      prompt: `你是一个专业的中文场景翻译出题专家。请为以下主题和难度生成一个中文句子，供用户翻译成英文。

主题: ${topic}
难度: ${difficultyDescriptions[difficulty]}

要求:
1. 生成一句与主题密切相关的中文句子（${difficulty === 'basic' ? '15-25字' : difficulty === 'advanced' ? '25-40字' : '35-60字'}）
2. 句子要自然、真实，像是实际工作或生活中会说的话
3. 包含与主题相关的专业术语或表达
4. hintWords: 提供 2-5 个翻译这句话时可能用到的英文关键词汇（用户求助时展示）

以 JSON 格式返回:
- sourceText: 中文源文本
- hintWords: 英文关键词数组`,
    });

    const parsed = generationSchema.safeParse(result.object);
    if (!parsed.success) {
      return { data: null, error: 'Failed to parse AI response' };
    }

    return { data: parsed.data };
  } catch (error) {
    console.error('Error generating translation source:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to generate',
    };
  }
}

// === 评估用户翻译 ===

export async function evaluateTranslation(
  sourceText: string,
  userTranslation: string,
  difficulty: TranslationDifficulty
): Promise<{ data: EvaluateTranslationOutput | null; error?: string }> {
  try {
    const result = await generateText({
      model: zhipu('glm-4'),
      temperature: 0.3,
      prompt: `你是一个资深的英语翻译教学专家。请评估学生的中译英翻译。

中文原文: ${sourceText}
学生翻译: ${userTranslation}
难度: ${difficultyDescriptions[difficulty]}

请严格按以下 JSON 格式返回评估结果，不要输出任何其他内容:

{
  "score": <综合评分 0-100, 三个维度加权平均>,
  "accuracyScore": <准确度 0-100>,
  "fluencyScore": <流利度 0-100>,
  "vocabScore": <词汇量 0-100>,
  "feedback": "<简洁的中文评价, 200字以内>",
  "polished": "<在学生翻译基础上的润色版本>",
  "nativeAlt": "<更地道、更专业的母语者替代版本>",
  "annotations": [
    {"segment": "<用户翻译中的确切词组>", "type": "good|bad", "comment": "<简短中文评论>"}
  ],
  "nativeAnnotations": [
    {"segment": "<nativeAlt中的地道表达片段>", "comment": "<解释为什么地道，相比普通表达好在哪里>"}
  ]
}

评分维度:
1. accuracyScore: 翻译是否准确传达了原文含义，是否有遗漏或曲解
2. fluencyScore: 英文表达是否流畅自然，语法是否正确
3. vocabScore: 词汇选择是否恰当、丰富，是否符合该主题的专业用法

注意事项:
- annotations 中的 segment 必须是用户翻译原文中的确切片段（词组或短语）
- annotations 数组包含 2-4 个批注即可，标出好的用法(good)和有问题的地方(bad)
- nativeAnnotations 中的 segment 必须是 nativeAlt 文本中的确切片段（词组、短语或搭配）
- nativeAnnotations 包含 2-4 个批注，聚焦最值得学习的地道表达点，解释其地道之处
- comment 用中文
- 只输出 JSON，不要输出 markdown 代码块或其他格式`,
    });

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = result.text.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const raw = JSON.parse(jsonStr);
    const parsed = evaluationSchema.safeParse(raw);
    if (!parsed.success) {
      return { data: null, error: 'Failed to parse evaluation' };
    }

    return { data: parsed.data };
  } catch (error) {
    console.error('Error evaluating translation:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to evaluate',
    };
  }
}
