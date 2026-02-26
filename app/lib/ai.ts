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
 * console.log(result.text); // AI-generated memory text
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
      prompt: `你是一个语言学习专家。以下是 ${cardFronts.length} 个需要记忆的单词/知识点，请生成一段辅助记忆的文本：

${wordsList}

要求：
1. 将这些单词按照语义或用法进行分组
2. 为每个单词提供记忆技巧或联想方法
3. 创造一个简短的故事或场景来帮助记忆
4. 输出格式清晰，易于阅读
5. 使用markdown格式进行排版，包含适当的标题、列表和强调

请用英文回答回答。`,
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
 * Fetch overdue vocabulary cards for AI memory assistance
 *
 * @param userId - Current user ID
 * @returns Array of overdue cards from vocabulary deck (max 10)
 */
export async function getOverdueVocabularyCards(userId: string) {
  try {
    // First, find the "vocabulary" deck for the user
    const vocabularyDeckData = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/decks`, {
      cache: 'no-store',
    }).then(res => res.json());

    const deck = vocabularyDeckData.decks.find((d: { title: string }) => d.title === 'vocabulary');

    if (!deck) {
      return { cards: [], error: 'No vocabulary deck found. Please create a deck named "vocabulary" first.' };
    }

    // Fetch overdue cards for the vocabulary deck
    const response = await fetch(
      `/api/dashboard/cards?deckId=${deck.id}&sortBy=nextReviewAt&page=1`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch cards');
    }

    const data = await response.json();

    // Filter overdue cards and limit to 10
    const overdueCards = data.cards
      .filter((card: { nextReviewAt: string }) => new Date(card.nextReviewAt) <= new Date())
      .slice(0, 10);

    if (overdueCards.length === 0) {
      return {
        cards: [],
        error: 'No overdue cards found in the vocabulary deck. Cards that are not yet due will not be included.',
      };
    }

    return { cards: overdueCards };
  } catch (error) {
    console.error('Error fetching overdue vocabulary cards:', error);
    return {
      cards: [],
      error: error instanceof Error ? error.message : 'Failed to fetch overdue vocabulary cards',
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
