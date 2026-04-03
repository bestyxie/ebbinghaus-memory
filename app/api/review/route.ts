import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { calculateReview, OUTPUT_TRACK_ACTIVATION_THRESHOLD, OUTPUT_TRACK_INITIAL } from '@/app/lib/srs-algorithm';
import { ReviewSession, ReviewItem } from '@/app/lib/types';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/app/lib/api-helpers';
import { REVIEW_BATCH_SIZE } from '@/app/lib/constants';

// GET - Fetch cards for review session
export async function GET(request: NextRequest): Promise<NextResponse<ReviewSession | { error: string }>> {
  const userId = await requireAuth(request);
  if (userId instanceof NextResponse) return userId;

  try {
    const { searchParams } = new URL(request.url);

    const cursor = searchParams.get('cursor');
    const isFirstBatch = !cursor;

    const now = new Date();

    // 两个轨道任意一个到期即需要复习
    const where = {
      userId,
      cardType: 'FLASHCARD' as const,
      OR: [
        { nextReviewAt: { lte: now } },
        { outputNextReviewAt: { lte: now } },
      ],
    };

    const cards = await prisma.card.findMany({
      where,
      orderBy: { nextReviewAt: 'asc' },
      take: REVIEW_BATCH_SIZE + 1,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      include: {
        cardDecks: {
          where: { deck: { deletedAt: null } },
          include: {
            deck: {
              select: { id: true, title: true, color: true },
            },
          },
        },
      },
    });

    // 展开为 ReviewItem：两轨都到期时产生两个项（input 在前，output 在后）
    const allItems: ReviewItem[] = [];
    for (const card of cards) {
      const base = { ...card, deck: card.cardDecks[0]?.deck || null };
      if (card.nextReviewAt <= now) {
        allItems.push({ ...base, mode: 'input' });
      }
      if (card.outputNextReviewAt && card.outputNextReviewAt <= now) {
        allItems.push({ ...base, mode: 'output' });
      }
    }

    // 分页：以 ReviewItem 数量为准
    const hasMore = allItems.length > REVIEW_BATCH_SIZE;
    const batchItems = hasMore ? allItems.slice(0, REVIEW_BATCH_SIZE) : allItems;

    // cursor 仍然以卡片 id 为基准（取最后一个不同卡片的 id）
    const lastCard = hasMore ? cards[REVIEW_BATCH_SIZE - 1] : undefined;
    const nextCursor = lastCard?.id;

    // 总数：计算 ReviewItem 总数
    let total = batchItems.length;
    if (isFirstBatch) {
      const allCards = await prisma.card.findMany({
        where,
        select: {
          nextReviewAt: true,
          outputNextReviewAt: true,
        },
      });
      total = allCards.reduce((sum, c) => {
        let count = 0;
        if (c.nextReviewAt <= now) count++;
        if (c.outputNextReviewAt && c.outputNextReviewAt <= now) count++;
        return sum + count;
      }, 0);
    }

    return NextResponse.json({
      items: batchItems,
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
    const { cardId, quality, mode, exerciseId, outputLevel, userAnswer, isOutputCorrect } = body;

    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: {
        outputExercise: { select: { id: true } },
      },
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }
    if (card.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (mode === 'output') {
      // === 输出轨道 ===
      const result = calculateReview({
        interval: card.outputInterval,
        repetitions: card.outputRepetitions,
        easeFactor: card.outputEaseFactor,
        quality,
      });

      const newOutputRepetitions = (isOutputCorrect ?? quality >= 3)
        ? card.outputRepetitions + 1
        : 0;

      const cardUpdateData = {
        outputInterval: result.interval,
        outputRepetitions: newOutputRepetitions,
        outputEaseFactor: result.easeFactor,
        outputNextReviewAt: result.nextReviewDate,
        // 输入轨道字段保持不变
      };

      // 解析 exerciseId（支持传入或从 card 查找）
      const actualExerciseId = exerciseId || card.outputExercise?.id;

      const operations = [
        prisma.card.update({ where: { id: cardId }, data: cardUpdateData }),
        prisma.reviewLog.create({
          data: {
            cardId,
            userId: card.userId,
            rating: quality,
            reviewTime: 0,
            scheduledDays: card.outputInterval,
            elapsedDays: result.interval,
            lastEaseFactor: card.outputEaseFactor,
            newEaseFactor: result.easeFactor,
          },
        }),
        ...(actualExerciseId && outputLevel && userAnswer
          ? [prisma.outputPracticeLog.create({
              data: {
                cardId,
                exerciseId: actualExerciseId,
                userId: card.userId,
                level: outputLevel,
                isCorrect: isOutputCorrect ?? quality >= 3,
                userAnswer,
              },
            })]
          : []),
      ];

      await prisma.$transaction(operations);
      revalidatePath('/dashboard');

      return NextResponse.json({
        success: true,
        nextReview: result.nextReviewDate,
        newOutputRepetitions,
      });

    } else {
      // === 输入轨道 ===
      const result = calculateReview({
        interval: card.interval,
        repetitions: card.repetitions,
        easeFactor: card.easeFactor,
        quality,
      });

      const cardUpdateData: Parameters<typeof prisma.card.update>[0]['data'] = {
        interval: result.interval,
        repetitions: result.repetitions,
        easeFactor: result.easeFactor,
        nextReviewAt: result.nextReviewDate,
        state: quality < 3 ? 'RELEARNING' : 'REVIEW',
      };

      // 激活输出轨道：首次达到阈值且尚未激活
      if (
        result.repetitions >= OUTPUT_TRACK_ACTIVATION_THRESHOLD &&
        !card.outputNextReviewAt
      ) {
        cardUpdateData.outputInterval = OUTPUT_TRACK_INITIAL.interval;
        cardUpdateData.outputRepetitions = OUTPUT_TRACK_INITIAL.repetitions;
        cardUpdateData.outputEaseFactor = OUTPUT_TRACK_INITIAL.easeFactor;
        cardUpdateData.outputNextReviewAt = tomorrow;
      }

      await prisma.$transaction([
        prisma.card.update({ where: { id: cardId }, data: cardUpdateData }),
        prisma.reviewLog.create({
          data: {
            cardId,
            userId: card.userId,
            rating: quality,
            reviewTime: 0,
            scheduledDays: card.interval,
            elapsedDays: result.interval,
            lastEaseFactor: card.easeFactor,
            newEaseFactor: result.easeFactor,
          },
        }),
      ]);

      revalidatePath('/dashboard');

      return NextResponse.json({
        success: true,
        nextReview: result.nextReviewDate,
        outputTrackActivated: !card.outputNextReviewAt && result.repetitions >= OUTPUT_TRACK_ACTIVATION_THRESHOLD,
      });
    }

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Review failed' }, { status: 500 });
  }
}
