import { cache } from 'react';
import { prisma } from './prisma';
import { CardsResponse, CardWithDeck } from './types';

type SortOption = 'nextReviewAt' | 'createdAt' | 'easeFactor';

interface GetCardsOptions {
  sortBy: SortOption;
  deckId: string | null;
  page: number;
  limit?: number;
}

/**
 * Get paginated cards for dashboard
 * Server-side data fetching function with React.cache for request deduplication
 * Extracted from app/api/dashboard/cards/route.ts
 */
export const getCardsData = cache(async (
  userId: string,
  { sortBy, deckId, page, limit = 10 }: GetCardsOptions
): Promise<CardsResponse> => {
  const skip = (page - 1) * limit;

  const where: {
    userId: string;
    cardDecks?: { some: { deckId: string; deck?: { deletedAt: null } } };
  } = { userId };

  // Add deck filter if provided
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

  // Build orderBy object based on sortBy parameter
  let orderBy: Record<string, 'asc' | 'desc'> = { nextReviewAt: 'asc' };
  if (sortBy === 'createdAt') {
    orderBy = { createdAt: 'asc' };
  } else if (sortBy === 'easeFactor') {
    orderBy = { easeFactor: 'asc' };
  } else if (sortBy === 'nextReviewAt') {
    orderBy = { nextReviewAt: 'asc' };
  }

  // Run queries in parallel for better performance
  const [cards, total] = await Promise.all([
    prisma.card.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      select: {
        id: true,
        front: true,
        note: true,
        // Exclude 'back' field to reduce payload size (not needed in list view)
        nextReviewAt: true,
        interval: true,
        easeFactor: true,
        repetitions: true,
        state: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
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
    }),
    prisma.card.count({ where }),
  ]);

  // Transform cardDecks to deck (single deck per card for now)
  const transformedCards: CardWithDeck[] = cards.map((card) => ({
    ...card,
    back: '',
    deck: card.cardDecks[0]?.deck || null,
  }));

  return {
    cards: transformedCards,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
});
