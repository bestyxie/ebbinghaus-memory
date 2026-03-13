import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/api-helpers';

export async function GET(request: NextRequest) {
  const userId = await requireAuth(request);
  if (userId instanceof NextResponse) return userId;

  try {
    // Get total cards count
    const totalCards = await prisma.card.count({
      where: { userId },
    });

    // Get cards due for review today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueToday = await prisma.card.count({
      where: {
        userId,
        nextReviewAt: {
          lte: tomorrow,
        },
      },
    });

    // Calculate retention rate from review logs
    const reviewLogs = await prisma.reviewLog.findMany({
      where: { userId },
      select: { rating: true },
    });

    const retentionRate = reviewLogs.length > 0
      ? Math.round(
        (reviewLogs.filter((log) => log.rating >= 3).length / reviewLogs.length) * 100
      )
      : 100;

    return NextResponse.json({
      totalCards,
      dueToday,
      retentionRate,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
