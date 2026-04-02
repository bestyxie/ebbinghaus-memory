import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { generateOutputExercise, extractTargetWord } from '@/app/lib/output-exercises';
import { requireAuth } from '@/app/lib/api-helpers';

/**
 * POST /api/output-exercises/generate
 *
 * 为指定卡片生成或获取输出练习
 *
 * Request body:
 * {
 *   cardId: string
 * }
 *
 * Response:
 * {
 *   exercise: OutputExercise
 * }
 */
export async function POST(req: NextRequest) {
  const userId = await requireAuth(req);
  if (userId instanceof NextResponse) return userId;

  try {
    const body = await req.json();
    const { cardId } = body;

    if (!cardId) {
      return NextResponse.json(
        { error: 'cardId is required' },
        { status: 400 }
      );
    }

    // 获取卡片信息
    const card = await prisma.card.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    if (card.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 检查是否已有练习数据
    const existing = await prisma.outputExercise.findUnique({
      where: { cardId },
    });

    if (existing) {
      return NextResponse.json({
        exercise: {
          id: existing.id,
          cardId: existing.cardId,
          targetWord: existing.targetWord,
          englishSentence: existing.englishSentence,
          chineseSentence: existing.chineseSentence,
          fillBlankTemplate: existing.fillBlankTemplate,
          wordList: existing.wordList as string[],
          standardAnswer: existing.standardAnswer,
          contextPrompt: existing.contextPrompt,
          createdAt: existing.createdAt,
          updatedAt: existing.updatedAt,
        },
      });
    }

    // 生成新练习
    const targetWord = extractTargetWord(card.front);
    const result = await generateOutputExercise({
      targetWord,
      definition: card.back,
      note: card.note,
    });

    if (!result.data || result.error) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate exercise' },
        { status: 500 }
      );
    }

    // 保存到数据库
    const exercise = await prisma.outputExercise.create({
      data: {
        cardId,
        targetWord: result.data.targetWord,
        englishSentence: result.data.englishSentence,
        chineseSentence: result.data.chineseSentence,
        fillBlankTemplate: result.data.fillBlankTemplate,
        wordList: result.data.wordList,
        standardAnswer: result.data.standardAnswer,
        contextPrompt: result.data.contextPrompt,
      },
    });

    return NextResponse.json({
      exercise: {
        id: exercise.id,
        cardId: exercise.cardId,
        targetWord: exercise.targetWord,
        englishSentence: exercise.englishSentence,
        chineseSentence: exercise.chineseSentence,
        fillBlankTemplate: exercise.fillBlankTemplate,
        wordList: exercise.wordList as string[],
        standardAnswer: exercise.standardAnswer,
        contextPrompt: exercise.contextPrompt,
        createdAt: exercise.createdAt,
        updatedAt: exercise.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error in generate exercise route:', error);
    return NextResponse.json(
      { error: 'Failed to generate exercise' },
      { status: 500 }
    );
  }
}
