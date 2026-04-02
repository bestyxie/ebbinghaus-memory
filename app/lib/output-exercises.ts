/**
 * Output Exercises Module
 * AI-powered exercise generation and evaluation for output-based learning
 */

import { generateObject } from 'ai';
import { zhipu } from 'zhipu-ai-provider';
import { z } from 'zod';
import type { OutputLevel } from './types';

// === 输出练习生成接口 ===

export interface GenerateExerciseInput {
  targetWord: string;
  definition: string;
  note?: string | null;
}

export interface GenerateExerciseOutput {
  targetWord: string;
  englishSentence: string;
  chineseSentence: string;
  fillBlankTemplate: string;
  wordList: string[];
  standardAnswer: string;
  contextPrompt: string;
}

// 定义生成练习的 Zod schema
const exerciseGenerationSchema = z.object({
  englishSentence: z.string().min(1, 'English sentence is required'),
  chineseSentence: z.string().min(1, 'Chinese sentence is required'),
  fillBlankTemplate: z.string().min(1, 'Fill blank template is required'),
  wordList: z.array(z.string()).min(2, 'Word list must have at least 2 words'),
  standardAnswer: z.string().min(1, 'Standard answer is required'),
  contextPrompt: z.string().min(1, 'Context prompt is required'),
});

/**
 * 生成输出练习数据
 *
 * @param input - 目标词汇和定义
 * @returns 练习数据
 */
export async function generateOutputExercise(
  input: GenerateExerciseInput
): Promise<{ data: GenerateExerciseOutput | null; error?: string }> {
  const { targetWord, definition, note } = input;

  try {
    const result = await generateObject({
      model: zhipu('glm-4'),
      temperature: 0.7,
      schema: exerciseGenerationSchema,
      prompt: `你是一个英语学习专家。请为以下词汇生成输出练习内容。

目标词汇: ${targetWord}
释义: ${definition}
${note ? `助记提示: ${note}` : ''}

请生成以下内容并以JSON格式返回:

1. englishSentence: 使用该词汇的自然英文句子（不要太简单，也不要太复杂，适合中级学习者）
2. chineseSentence: 该句子的中文翻译
3. fillBlankTemplate: 英文句子的填空版本，将目标词汇替换为 _____（只替换目标词）
4. wordList: 英文句子的单词数组，包含每个单词和标点符号（按句子顺序）
5. standardAnswer: 标准的英文句子（作为参考答案）
6. contextPrompt: 一个有趣的情景描述，用中文，引导学生用该词汇造句

要求:
- 英文句子要自然、地道
- 中文翻译要准确
- 填空模板只替换目标词汇
- wordList 保持原句顺序，包含标点
- contextPrompt 要有趣且具有启发性

示例:
目标词: ephemeral
释义: 短暂的，瞬息万变的

{
  "englishSentence": "The beauty of cherry blossoms is ephemeral, lasting only a few days each spring.",
  "chineseSentence": "樱花的美丽是短暂的，每年春天只持续几天。",
  "fillBlankTemplate": "The beauty of cherry blossoms is _____, lasting only a few days each spring.",
  "wordList": ["The", "beauty", "of", "cherry", "blossoms", "is", "ephemeral", ",", "lasting", "only", "a", "few", "days", "each", "spring", "."],
  "standardAnswer": "The beauty of cherry blossoms is ephemeral, lasting only a few days each spring.",
  "contextPrompt": "想象你正在向朋友描述樱花季节的短暂美好。请用 ephemeral 这个词来写一个句子。"
}`,
    });

    const parsed = exerciseGenerationSchema.safeParse(result.object);

    if (!parsed.success) {
      console.error('Failed to parse AI response:', parsed.error);
      return {
        data: null,
        error: 'Failed to parse exercise data from AI',
      };
    }

    return {
      data: {
        targetWord,
        ...parsed.data,
      },
    };
  } catch (error) {
    console.error('Error generating output exercise:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to generate exercise',
    };
  }
}

// === AI 评估接口 ===

export interface EvaluateAnswerInput {
  targetWord: string;
  standardAnswer: string;
  userAnswer: string;
  level: OutputLevel;
}

export interface EvaluateAnswerOutput {
  vocabScore: number;
  grammarScore: number;
  nativeScore: number;
  feedback: string;
  suggestedAnswer: string;
  overall: 'correct' | 'partial' | 'incorrect';
}

// 定义评估的 Zod schema
const evaluationSchema = z.object({
  vocabScore: z.number().int().min(0).max(100),
  grammarScore: z.number().int().min(0).max(100),
  nativeScore: z.number().int().min(0).max(100),
  feedback: z.string().min(1),
  suggestedAnswer: z.string().min(1),
  overall: z.enum(['correct', 'partial', 'incorrect']),
});

/**
 * 评估用户答案（Level 3-4 的自由作答）
 *
 * @param input - 用户答案和标准答案
 * @returns AI 评估结果
 */
export async function evaluateOutputAnswer(
  input: EvaluateAnswerInput
): Promise<{ data: EvaluateAnswerOutput | null; error?: string }> {
  const { targetWord, standardAnswer, userAnswer, level } = input;

  const levelName = level === 3 ? '翻译练习' : '情景造句';

  try {
    const result = await generateObject({
      model: zhipu('glm-4'),
      temperature: 0.3,
      schema: evaluationSchema,
      prompt: `你是一个英语教学专家。请评估学生的英语答案。

目标词汇: ${targetWord}
练习类型: ${levelName}
标准参考: ${standardAnswer}
学生答案: ${userAnswer}

请从以下三个维度评分（0-100分）:

1. vocabScore: 词汇使用评分
   - 是否正确使用了目标词汇 "${targetWord}"
   - 词汇搭配是否合理
   - 用词是否准确

2. grammarScore: 语法正确性评分
   - 时态是否正确
   - 主谓一致
   - 介词使用
   - 句型结构

3. nativeScore: 地道表达评分
   - 是否像母语者的表达
   - 是否有明显的中式英语
   - 表达是否自然流畅

然后给出:
- feedback: 简洁的反馈（中文，100字以内），指出优点和需要改进的地方
- suggestedAnswer: 一个更好的参考答案（如果学生答案已经很好，可以写"你的答案已经很好了！"）
- overall: 总体评价 (correct=完全正确, partial=部分正确, incorrect=错误较多)

评分标准:
- correct: 所有维度 >= 80分
- partial: 至少一个维度在 50-79分
- incorrect: 所有维度 < 50分

请以JSON格式返回评估结果。`,
    });

    const parsed = evaluationSchema.safeParse(result.object);

    if (!parsed.success) {
      console.error('Failed to parse AI evaluation:', parsed.error);
      return {
        data: null,
        error: 'Failed to parse evaluation from AI',
      };
    }

    return {
      data: parsed.data,
    };
  } catch (error) {
    console.error('Error evaluating answer:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to evaluate answer',
    };
  }
}

// === 工具函数 ===

/**
 * 根据卡片的复习次数和输出练习次数，确定应该显示的输出练习级别
 *
 * @param repetitions - 卡片的连续正确次数（标准SRS）
 * @param outputRepetitions - 输出练习的连续正确次数
 * @returns 练习级别或 null（表示不显示输出练习）
 */
export function getOutputLevel(
  repetitions: number,
  outputRepetitions: number
): OutputLevel | null {
  // 0-1次正确复习：标准闪卡
  if (repetitions <= 1) {
    return null;
  }

  // 2-3次正确复习：Level 1（填空）
  if (repetitions <= 3) {
    return 1;
  }

  // 4次以上：根据输出练习次数进阶
  if (outputRepetitions <= 1) return 1;
  if (outputRepetitions <= 3) return 2;
  if (outputRepetitions <= 5) return 3;
  return 4;
}

/**
 * 从卡片内容提取目标词汇
 * 通常是 card.front，但如果是句子则取第一个单词
 *
 * @param front - 卡片正面内容
 * @returns 提取的目标词汇
 */
export function extractTargetWord(front: string): string {
  const trimmed = front.trim();
  // 如果是单个单词（没有空格），直接返回
  if (!trimmed.includes(' ')) {
    return trimmed;
  }
  // 否则提取第一个单词
  const firstWord = trimmed.split(/\s+/)[0];
  // 去除标点符号
  return firstWord.replace(/^[^\w]+|[^\w]+$/g, '');
}
