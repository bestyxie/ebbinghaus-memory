/**
 * AI Configuration Module
 * Provides utilities for AI-powered memory assistance using Vercel AI SDK
 */

import { generateText } from 'ai';
import { zhipu } from 'zhipu-ai-provider';

/**
 * Memory text generation request
 */
export interface GenerateMemoryTextRequest {
  cardFronts: string[];
}

/**
 * Memory text generation response
 */
export interface GenerateMemoryTextResponse {
  text: string;
  error?: string;
}

/**
 * Generate memory assistance text for a list of vocabulary words
 *
 * @param cardFronts - Array of card front text (vocabulary words/concepts)
 * @returns AI-generated memory assistance text
 *
 * @example
 * const result = await generateMemoryText(['abandon', 'ability', 'abnormal']);
 * console.log(result.text);
 */
export async function generateMemoryText(cardFronts: string[]): Promise<GenerateMemoryTextResponse> {
  if (!cardFronts || cardFronts.length === 0) {
    return {
      text: '',
      error: 'No vocabulary words provided',
    };
  }

  const wordsList = cardFronts.map((word, index) => `${index + 1}. ${word}`).join('\n');

  try {
    const result = await generateText({
      model: zhipu('glm-4'),
      prompt: `你是一个语言学习专家。以下是 ${cardFronts.length} 个需要记忆的单词/知识点，请生成辅助记忆的文本：

${wordsList}

要求：
1. **首先，在开头创造一个简短、有趣的故事或场景**来帮助记忆这些单词
2. 在故事之后，将这些单词按照语义或用法进行分组
3. 为每个单词提供美式音标、记忆技巧或联想方法、及同义可替换词汇
4. 输出格式清晰，易于阅读
5. 使用markdown格式进行排版，包含适当的标题、列表和强调

重要：故事必须在最前面，然后才是其他内容。请用英文回答回答。`,
      temperature: 0.7,
    });

    return {
      text: result.text,
    };
  } catch (error) {
    console.error('Error generating memory text:', error);
    return {
      text: '',
      error: error instanceof Error ? error.message : 'Failed to generate memory text',
    };
  }
}

/**
 * Card type for AI memory modal
 */
export interface AIMemoryCard {
  id: string;
  front: string;
  back: string;
  note: string | null;
  nextReviewAt: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
  state: 'NEW' | 'LEARNING' | 'REVIEW' | 'RELEARNING';
  deck: {
    id: string;
    title: string;
    color: string;
  } | null;
}
