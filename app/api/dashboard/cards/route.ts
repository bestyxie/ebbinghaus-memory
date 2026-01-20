import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'nextReviewAt';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const deckId = searchParams.get('deckId');

    const userId = session.user.id;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    // Add deck filter if provided
    if (deckId) {
      where.deckId = deckId;
    }

    const [cards, total] = await Promise.all([
      prisma.card.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          deck: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.card.count({ where }),
    ]);

    return NextResponse.json({
      cards,
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
