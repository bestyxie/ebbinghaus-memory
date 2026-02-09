/**
 * Quick test for optimized stats query
 * Run with: npx tsx scripts/test-optimized-stats.ts
 */

import { prisma } from '../app/lib/prisma';

async function testOptimizedQuery() {
  console.log('🧪 Testing optimized stats query...\n');

  // Get sample user
  const user = await prisma.user.findFirst();

  if (!user) {
    console.log('❌ No users found in database');
    return;
  }

  console.log(`Testing with user: ${user.email}\n`);

  const userId = user.id;
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Test the optimized query
  console.log('Running optimized query...');
  const start = performance.now();

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

  const elapsed = performance.now() - start;

  const stats = result[0];
  const totalCards = stats?.total_cards ?? 0;
  const dueToday = stats?.due_today ?? 0;
  const totalReviews = stats?.total_reviews ?? 0;
  const successfulReviews = stats?.successful_reviews ?? 0;

  const retentionRate = totalReviews > 0
    ? Math.round((successfulReviews / totalReviews) * 100)
    : 100;

  console.log(`✅ Query completed in ${elapsed.toFixed(2)}ms\n`);

  console.log('📊 Results:');
  console.log(`  Total Cards: ${totalCards}`);
  console.log(`  Due Today: ${dueToday}`);
  console.log(`  Total Reviews: ${totalReviews}`);
  console.log(`  Successful Reviews: ${successfulReviews}`);
  console.log(`  Retention Rate: ${retentionRate}%`);

  console.log('\n✨ Test completed successfully!');

  await prisma.$disconnect();
}

testOptimizedQuery().catch(console.error);
