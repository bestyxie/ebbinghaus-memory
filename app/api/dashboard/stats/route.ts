import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = session.user.id;

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
      select: { quality: true },
    });

    const retentionRate = reviewLogs.length > 0
      ? Math.round(
          (reviewLogs.filter((log) => log.quality >= 3).length / reviewLogs.length) * 100
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
