import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { calculateReview } from '@/app/lib/srs-algorithm';
import { ReviewSession } from '@/app/lib/types';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/app/lib/api-helpers';
import { REVIEW_BATCH_SIZE } from '@/app/lib/constants';

// GET - Fetch cards for review session
export async function GET(request: NextRequest): Promise<NextResponse<ReviewSession | { error: string }>> {
  const userId = await requireAuth(request);
  if (userId instanceof NextResponse) return userId;

  try {
    const { searchParams } = new URL(request.url);

    // Support batched fetching with pagination
    const cursor = searchParams.get('cursor');
    const isFirstBatch = !cursor;

    // Fetch due flashcards
    const where = {
      userId,
      cardType: 'FLASHCARD' as const,
      nextReviewAt: { lte: new Date() },
    };

    const cards = await prisma.card.findMany({
      where,
      orderBy: { nextReviewAt: 'asc' },
      take: REVIEW_BATCH_SIZE + 1, // Fetch one extra to check if there are more
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      include: {
        cardDecks: {
          where: {
            deck: {
              deletedAt: null,
            },
          },
          include: {
            deck: {
              select: {
                id: true,
                title: true,
                color: true,
              },
            },
          },
        },
      },
    });

    // Transform cardDecks to deck (single deck per card for now)
    const transformedCards = cards.map((card) => ({
      ...card,
      deck: card.cardDecks[0]?.deck || null, // Take first deck, or null
    }));

    // Handle pagination
    const hasMore = transformedCards.length > REVIEW_BATCH_SIZE;
    const batchCards = hasMore ? transformedCards.slice(0, REVIEW_BATCH_SIZE) : transformedCards;
    const nextCursor = hasMore ? batchCards[REVIEW_BATCH_SIZE - 1].id : undefined;

    const sessionCards = batchCards;

    // Get total count for progress bar (only on first request)
    let total = sessionCards.length;
    if (isFirstBatch) {
      total = await prisma.card.count({ where });
    }

    return NextResponse.json({
      cards: sessionCards,
      total,
      hasMore,
      nextCursor,
    });
  } catch (error) {
    console.error('Error fetching review cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cards for review' },
      { status: 500 }
    );
  }
}

// POST - Submit a card rating
export async function POST(req: NextRequest) {
  const userId = await requireAuth(req);
  if (userId instanceof NextResponse) return userId;

  try {
    const body = await req.json();
    const { cardId, quality, exerciseId, isOutputCorrect, outputLevel, userAnswer } = body;

    // 1. 从数据库获取当前卡片状态
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: {
        outputExercise: {
          select: { id: true },
        },
      },
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Verify card belongs to user
    if (card.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 2. 运行核心算法
    const result = calculateReview({
      interval: card.interval,
      repetitions: card.repetitions,
      easeFactor: card.easeFactor,
      quality: quality,
    });

    // 3. 计算输出练习次数更新
    const outputRepetitionsIncrement = isOutputCorrect ? 1 : 0;
    const newOutputRepetitions = (card.outputRepetitions || 0) + outputRepetitionsIncrement;

    // 4. 准备更新数据
    const cardUpdateData: {
      interval: number;
      repetitions: number;
      easeFactor: number;
      nextReviewAt: Date;
      state: 'RELEARNING' | 'REVIEW';
      outputRepetitions?: number;
    } = {
      interval: result.interval,
      repetitions: result.repetitions,
      easeFactor: result.easeFactor,
      nextReviewAt: result.nextReviewDate,
      state: quality < 3 ? 'RELEARNING' : 'REVIEW',
    };

    // 如果是输出练习，更新 outputRepetitions
    if (exerciseId && typeof isOutputCorrect === 'boolean') {
      cardUpdateData.outputRepetitions = newOutputRepetitions;
    }

    // 5. 事务更新：同时更新 卡片状态 和 插入 复习日志
    const operations: (
      | ReturnType<typeof prisma.card.update>
      | ReturnType<typeof prisma.reviewLog.create>
      | ReturnType<typeof prisma.outputPracticeLog.create>
    )[] = [
      // A. 更新卡片主表
      prisma.card.update({
        where: { id: cardId },
        data: cardUpdateData,
      }),

      // B. 插入历史记录 (用于统计)
      prisma.reviewLog.create({
        data: {
          cardId: cardId,
          userId: card.userId,
          rating: quality,
          reviewTime: 0,
          scheduledDays: card.interval,
          elapsedDays: result.interval,
          lastEaseFactor: card.easeFactor,
          newEaseFactor: result.easeFactor,
        },
      }),
    ];

    // C. 如果是输出练习，插入输出练习日志
    // 如果 exerciseId 为 null，尝试通过 cardId 查找
    let actualExerciseId = exerciseId;
    if (!actualExerciseId && card.outputExercise) {
      actualExerciseId = card.outputExercise.id;
    }

    if (actualExerciseId && outputLevel && userAnswer) {
      operations.push(
        prisma.outputPracticeLog.create({
          data: {
            cardId: cardId,
            exerciseId: actualExerciseId,
            userId: card.userId,
            level: outputLevel,
            isCorrect: isOutputCorrect ?? false,
            userAnswer: userAnswer,
          },
        })
      );
    }

    await prisma.$transaction(operations);

    // Revalidate dashboard to refresh stats (retention rate, due cards)
    revalidatePath('/dashboard');

    return NextResponse.json({
      success: true,
      nextReview: result.nextReviewDate,
      newOutputRepetitions: exerciseId ? newOutputRepetitions : undefined,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Review failed' }, { status: 500 });
  }
}
