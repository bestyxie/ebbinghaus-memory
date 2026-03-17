import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { Deck } from '@/app/lib/types';
import { requireAuth } from '@/app/lib/api-helpers';

interface DeckWithCount extends Deck {
  cardCount: number;
}

// GET - Fetch all user's decks with card count
export async function GET(request: NextRequest): Promise<NextResponse<DeckWithCount[] | { error: string }>> {
  const userId = await requireAuth(request);
  if (userId instanceof NextResponse) return userId;

  try {
    const decks = await prisma.deck.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        _count: {
          select: { cardDecks: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const response = NextResponse.json(
      decks.map((deck) => ({
        ...deck,
        cardCount: deck._count.cardDecks,
      }))
    );

    return response;
  } catch (error) {
    console.error('Error fetching decks with count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch decks with count' },
      { status: 500 }
    );
  }
}