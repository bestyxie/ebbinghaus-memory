import { auth } from '@/auth';
import { prisma } from '@/app/lib/prisma';
import { StatsCard } from './stats-card';
import { unstable_cache } from 'next/cache';

// Internal function that performs the actual database queries
async function getStatsUncached(userId: string) {
  const startTime = performance.now();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // ULTRA-OPTIMIZED: Use a single raw SQL query to get all stats in one database round-trip
  const queryStart = performance.now();

  const result = await prisma.$queryRaw<Array<{
    total_cards: number;
    due_today: number;
    total_reviews: number;
    successful_reviews: number;
  }>>`
    SELECT
      (SELECT COUNT(*)::int FROM "Card" WHERE "userId" = ${userId}) as total_cards,
      (SELECT COUNT(*)::int FROM "Card" WHERE "userId" = ${userId} AND "nextReviewAt" <= ${tomorrow}) as due_today,
      (SELECT COUNT(*)::int FROM "ReviewLog" WHERE "userId" = ${userId}) as total_reviews,
      (SELECT COUNT(*)::int FROM "ReviewLog" WHERE "userId" = ${userId} AND rating >= 3) as successful_reviews
  `;

  const queryTime = performance.now() - queryStart;
  const totalTime = performance.now() - startTime;

  const stats = result[0];
  const totalCards = stats?.total_cards ?? 0;
  const dueToday = stats?.due_today ?? 0;
  const totalReviews = stats?.total_reviews ?? 0;
  const successfulReviews = stats?.successful_reviews ?? 0;

  const retentionRate = totalReviews > 0
    ? Math.round((successfulReviews / totalReviews) * 100)
    : 100;

  return {
    totalCards,
    dueToday,
    retentionRate,
  };
}

// Cached version with 5-minute revalidation
// unstable_cache will automatically differentiate cache entries by userId parameter
const getStats = unstable_cache(
  async (userId: string) => getStatsUncached(userId),
  ['dashboard-stats'], // Cache key prefix
  {
    revalidate: 300, // Cache for 5 minutes (300 seconds)
    tags: ['dashboard-stats'], // Tag for cache invalidation
  }
);

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
