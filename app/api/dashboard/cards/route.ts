import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { CardsResponse } from '@/app/lib/types';
import { requireAuth } from '@/app/lib/api-helpers';

export async function GET(request: NextRequest): Promise<NextResponse<CardsResponse | { error: string }>> {
  const userId = await requireAuth(request);
  if (userId instanceof NextResponse) return userId;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'nextReviewAt';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const deckId = searchParams.get('deckId');

    const skip = (page - 1) * limit;

    const source = searchParams.get('source');

    const where: {
      userId: string;
      cardDecks?: { some: { deckId: string; deck?: { deletedAt: null } } };
      source?: string;
    } = { userId };

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

    if (source) {
      where.source = source;
    }

    // Build orderBy object based on sortBy parameter
    let orderBy: Record<string, 'asc' | 'desc'> = { nextReviewAt: 'asc' };
    if (sortBy === 'createdAt') {
      orderBy = { createdAt: sortOrder as 'asc' | 'desc' };
    } else if (sortBy === 'easeFactor') {
      orderBy = { easeFactor: sortOrder as 'asc' | 'desc' };
    } else if (sortBy === 'nextReviewAt') {
      orderBy = { nextReviewAt: sortOrder as 'asc' | 'desc' };
    }

    // Run queries sequentially to avoid PrismaPg connection pool issue
    // Parallel execution with Promise.all causes 10+ second delays
    const cards = await prisma.card.findMany({
      where,
      skip,
      take: limit,
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

    const total = await prisma.card.count({ where });

    // Transform cardDecks to deck (single deck per card for now)
    const transformedCards = cards.map((card) => ({
      ...card,
      deck: card.cardDecks[0]?.deck || null, // Take first deck, or null
    }));

    return NextResponse.json({
      cards: transformedCards,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching dashboard cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cards' },
      { status: 500 }
    );
  }
}
