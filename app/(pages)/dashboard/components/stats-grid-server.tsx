import { auth } from '@/auth';
import { prisma } from '@/app/lib/prisma';
import { StatsCard } from './stats-card';

async function getStats(userId: string) {
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

  return {
    totalCards,
    dueToday,
    retentionRate,
  };
}

export async function StatsGridServer() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">Unauthorized</p>
      </div>
    );
  }

  try {
    const stats = await getStats(session.user.id);

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Knowledge"
          value={stats.totalCards.toLocaleString()}
          subtitle="Points tracked this year"
          trend={{ value: '+12%', type: 'up' }}
        />

        <StatsCard
          title="Due for Review"
          value={stats.dueToday}
          subtitle="Requires your attention"
          variant="accent"
        />

        <StatsCard
          title="Retention Rate"
          value={`${stats.retentionRate}%`}
          subtitle="Based on review history"
          trend={{ value: 'Stable', type: 'stable' }}
          progress={stats.retentionRate}
        />
      </div>
    );
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">Failed to load statistics</p>
      </div>
    );
  }
}
