// Re-export server and client components
export { StatsGridServer } from './stats-grid-server';

// Helper function to get stats (can be used in page components)
export async function getStatsData(userId: string) {
  const { prisma } = await import('@/app/lib/prisma');

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
