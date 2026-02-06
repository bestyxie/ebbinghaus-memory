// Re-export server and client components
export { StatsGridServer } from './stats-grid-server';

// Helper function to get stats (can be used in page components)
export async function getStatsData(userId: string) {
  const { prisma } = await import('@/app/lib/prisma');

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
