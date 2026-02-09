/**
 * Performance Diagnosis Script
 * Run with: npx tsx scripts/diagnose-performance.ts
 */

import { prisma } from '../app/lib/prisma';

async function diagnose() {
  console.log('🔍 Starting performance diagnosis...\n');

  // 1. Simple count queries
  console.log('📊 Table Row Counts:');
  const [userCount, deckCount, cardCount, reviewLogCount] = await Promise.all([
    prisma.user.count(),
    prisma.deck.count(),
    prisma.card.count(),
    prisma.reviewLog.count(),
  ]);

  console.log(`  User: ${userCount.toLocaleString()} rows`);
  console.log(`  Deck: ${deckCount.toLocaleString()} rows`);
  console.log(`  Card: ${cardCount.toLocaleString()} rows`);
  console.log(`  ReviewLog: ${reviewLogCount.toLocaleString()} rows`);
  console.log(`  ReviewLog/Card ratio: ${(reviewLogCount / cardCount).toFixed(2)}x`);

  // 2. Get sample user data
  console.log('\n📈 Sample User Analysis:');
  const sampleUser = await prisma.user.findFirst({
    select: { id: true, email: true }
  });

  if (!sampleUser) {
    console.log('  No users found in database');
    await prisma.$disconnect();
    return;
  }

  console.log(`  Testing with user: ${sampleUser.email} (${sampleUser.id})`);

  const userId = sampleUser.id;

  // Count cards for this user
  const userCards = await prisma.card.count({
    where: { userId }
  });
  console.log(`  Cards: ${userCards.toLocaleString()}`);

  // Count reviews for this user
  const userReviews = await prisma.reviewLog.count({
    where: { userId }
  });
  console.log(`  Reviews: ${userReviews.toLocaleString()}`);

  if (userReviews > 0) {
    console.log(`  Average reviews per card: ${(userReviews / userCards).toFixed(2)}`);
  }

  // 3. Test actual query performance
  console.log('\n⏱️  Query Performance Tests:');

  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Test totalCards query
  console.log('  Testing totalCards query...');
  const start1 = performance.now();
  const totalCards = await prisma.card.count({ where: { userId } });
  const time1 = performance.now() - start1;
  console.log(`    Result: ${totalCards} cards in ${time1.toFixed(2)}ms`);

  // Test dueToday query
  console.log('  Testing dueToday query...');
  const start2 = performance.now();
  const dueToday = await prisma.card.count({
    where: {
      userId,
      nextReviewAt: { lte: tomorrow }
    }
  });
  const time2 = performance.now() - start2;
  console.log(`    Result: ${dueToday} cards in ${time2.toFixed(2)}ms`);

  // Test reviewStats query (old way - 2 separate queries)
  console.log('  Testing reviewStats query (2 separate counts)...');
  const start3 = performance.now();
  const [totalReviews, successfulReviews] = await Promise.all([
    prisma.reviewLog.count({ where: { userId } }),
    prisma.reviewLog.count({ where: { userId, rating: { gte: 3 } } })
  ]);
  const time3 = performance.now() - start3;
  console.log(`    Result: ${successfulReviews}/${totalReviews} in ${time3.toFixed(2)}ms`);

  // Test reviewStats query (new way - single SQL query)
  console.log('  Testing reviewStats query (single aggregation)...');
  const start4 = performance.now();
  const result = await prisma.$queryRaw<Array<{ total_reviews: bigint; successful_reviews: bigint }>>`
    SELECT
      COUNT(*)::int as total_reviews,
      COUNT(CASE WHEN rating >= 3 THEN 1 END)::int as successful_reviews
    FROM "ReviewLog"
    WHERE "userId" = ${userId}
  `;
  const time4 = performance.now() - start4;
  console.log(`    Result: ${result[0]?.successful_reviews}/${result[0]?.total_reviews} in ${time4.toFixed(2)}ms`);

  // Test ULTRA-OPTIMIZED single query for ALL stats
  console.log('  Testing ULTRA-OPTIMIZED query (all stats in one query)...');
  const start5 = performance.now();
  const allStats = await prisma.$queryRaw<Array<{
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
  const time5 = performance.now() - start5;
  console.log(`    Result: All stats in ${time5.toFixed(2)}ms`);
  console.log(`    Data:`, allStats[0]);

  // 4. Performance comparison and recommendations
  console.log('\n📈 Performance Comparison:');

  const oldTotal = time1 + time2 + time3;
  console.log(`  Old approach (4 separate queries): ${oldTotal.toFixed(2)}ms`);
  console.log(`    - totalCards: ${time1.toFixed(2)}ms`);
  console.log(`    - dueToday: ${time2.toFixed(2)}ms`);
  console.log(`    - reviewStats (2 queries): ${time3.toFixed(2)}ms`);

  console.log(`\n  Optimized approach #1 (single reviewStats): ${(time1 + time2 + time4).toFixed(2)}ms`);
  console.log(`    - Speedup: ${(oldTotal / (time1 + time2 + time4)).toFixed(2)}x faster`);

  console.log(`\n  Optimized approach #2 (single query for all): ${time5.toFixed(2)}ms`);
  console.log(`    - Speedup: ${(oldTotal / time5).toFixed(2)}x faster`);
  console.log(`    - Reduction: ${((1 - time5 / oldTotal) * 100).toFixed(1)}% time saved`);

  console.log('\n⚠️  Analysis:');

  if (time5 < 100) {
    console.log(`  ✅ ULTRA-OPTIMIZED query is excellent (<100ms)`);
  } else if (time5 < 500) {
    console.log(`  ✅ ULTRA-OPTIMIZED query is good (<500ms)`);
  } else if (time5 < 1000) {
    console.log(`  ⚠️  ULTRA-OPTIMIZED query is acceptable but could be better (<1s)`);
  } else {
    console.log(`  ❌ ULTRA-OPTIMIZED query is slow (>1s) - investigate database/network issues`);
  }

  if (time3 > 5000) {
    console.log(`  ❌ CRITICAL: Separate count queries are extremely slow (${(time3/1000).toFixed(1)}s)`);
    console.log(`     This suggests network latency or connection pool issues`);
  }

  if (userReviews > 100000) {
    console.log(`  ⚠️  User has ${userReviews.toLocaleString()} reviews - consider archiving old data`);
  }

  console.log('\n💡 Recommendations:');
  console.log('  1. ✅ Use the ULTRA-OPTIMIZED single query (already implemented)');
  console.log('  2. ✅ Enable caching (already implemented - 5 minute TTL)');
  if (time5 > 500) {
    console.log('  3. ⚠️  Check database connection settings and network latency');
    console.log('  4. ⚠️  Consider adding database indexes if not already present');
    console.log('  5. ⚠️  Review Prisma connection pool configuration');
  }

  console.log('\n✅ Diagnosis complete!');
  await prisma.$disconnect();
}

diagnose().catch(console.error);
