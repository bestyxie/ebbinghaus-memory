import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/app/lib/prisma';
import { calculateReview } from '@/app/lib/srs-algorithm';
import { ReviewSession, CardWithDeck } from '@/app/lib/types';

// GET - Fetch cards for review session
export async function GET(request: NextRequest): Promise<NextResponse<ReviewSession | { error: string }>> {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'all-due';
    const startCardId = searchParams.get('startCardId');
    const deckId = searchParams.get('deckId');
    const sortBy = searchParams.get('sortBy') || 'nextReviewAt';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    const userId = session.user.id;

    let where: { userId: string; cardDecks?: any; nextReviewAt?: any } = { userId };

    if (mode === 'all-due') {
      // Fetch all cards that are due for review
      where.nextReviewAt = { lte: new Date() };
    } else if (mode === 'filtered') {
      // Fetch cards based on filters (from card list)
      if (deckId) {
        where.cardDecks = {
          some: {
            deckId,
            deck: {
              deletedAt: null,
            },
          },
        };
      }
    }

    // Build orderBy object
    let orderBy: Record<string, 'asc' | 'desc'> = { nextReviewAt: 'asc' };
    if (sortBy === 'createdAt') {
      orderBy = { createdAt: sortOrder as 'asc' | 'desc' };
    } else if (sortBy === 'easeFactor') {
      orderBy = { easeFactor: sortOrder as 'asc' | 'desc' };
    } else if (sortBy === 'nextReviewAt') {
      orderBy = { nextReviewAt: sortOrder as 'asc' | 'desc' };
    }

    const cards = await prisma.card.findMany({
      where,
      orderBy,
      include: {
        cardDecks: {
          where: {
            deck: {
              deletedAt: null, // Only include non-deleted decks
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
    const transformedCards = cards.map(card => ({
      ...card,
      deck: card.cardDecks[0]?.deck || null, // Take first deck, or null
    }));

    // If startCardId is provided, reorder to start from that card
    let sessionCards = transformedCards;
    if (startCardId) {
      const startIndex = transformedCards.findIndex(c => c.id === startCardId);
      if (startIndex !== -1) {
        sessionCards = [
          transformedCards[startIndex],
          ...transformedCards.slice(0, startIndex),
          ...transformedCards.slice(startIndex + 1)
        ];
      }
    }

    return NextResponse.json({
      cards: sessionCards,
      total: sessionCards.length,
      mode,
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
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cardId, quality } = body;

    // 1. 从数据库获取当前卡片状态
    const card = await prisma.card.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // 2. 运行核心算法
    const result = calculateReview({
      interval: card.interval,
      repetitions: card.repetitions,
      easeFactor: card.easeFactor,
      quality: quality,
    });

    // 3. 事务更新：同时更新 卡片状态 和 插入 复习日志
    await prisma.$transaction([
      // A. 更新卡片主表
      prisma.card.update({
        where: { id: cardId },
        data: {
          interval: result.interval,
          repetitions: result.repetitions,
          easeFactor: result.easeFactor,
          nextReviewAt: result.nextReviewDate,
          state: quality < 3 ? 'RELEARNING' : 'REVIEW',
        },
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
    ]);

    return NextResponse.json({ success: true, nextReview: result.nextReviewDate });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Review failed' }, { status: 500 });
  }
}
