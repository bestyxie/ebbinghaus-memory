import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/api-helpers';

// GET - Fetch a single article card for review
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireAuth(request);
  if (userId instanceof NextResponse) return userId;

  try {
    const { id } = await params;

    const card = await prisma.card.findFirst({
      where: {
        id,
        userId,
        cardType: 'ARTICLE',
      },
      include: {
        cardDecks: {
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

    if (!card) {
      return NextResponse.json(
        { error: 'Article card not found' },
        { status: 404 }
      );
    }

    // Transform cardDecks to deck (single deck per card for now)
    const transformedCard = {
      ...card,
      deck: card.cardDecks.length > 0 ? card.cardDecks[0].deck : null,
    };

    return NextResponse.json(transformedCard);
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}
