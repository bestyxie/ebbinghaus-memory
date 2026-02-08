import { auth } from '@/auth';
import { prisma } from '@/app/lib/prisma';
import { StatsCard } from './stats-card';

async function getStats(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Run all queries in parallel for better performance
  const [totalCards, dueToday, totalReviews, successfulReviews] = await Promise.all([
    // Get total cards count
    prisma.card.count({
      where: { userId },
    }),

    // Get cards due for review today
    prisma.card.count({
      where: {
        userId,
        nextReviewAt: {
          lte: tomorrow,
        },
      },
    }),

    // Get total review count
    prisma.reviewLog.count({
      where: { userId },
    }),

    // Get successful reviews count (rating >= 3) using aggregation
    prisma.reviewLog.count({
      where: {
        userId,
        rating: { gte: 3 },
      },
    }),
  ]);

  const retentionRate = totalReviews > 0
    ? Math.round((successfulReviews / totalReviews) * 100)
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
