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

    const where: { userId: string; deckId?: string } = { userId };

    // Add deck filter if provided
    if (deckId) {
      where.deckId = deckId;
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
        deck: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    const total = await prisma.card.count({ where });

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
