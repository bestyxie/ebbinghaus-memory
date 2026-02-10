/**
 * Diagnose /api/decks endpoint performance
 * Run with: npx tsx scripts/diagnose-decks-api.ts
 */

import { prisma } from '../app/lib/prisma';

async function diagnose() {
  console.log('🔍 Diagnosing /api/decks performance...\n');

  // Get sample user
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log('❌ No users found');
    return;
  }

  const userId = user.id;
  console.log(`Testing with user: ${user.email}\n`);

  // ========================================
  // Test GET /api/decks
  // ========================================
  console.log('📊 GET /api/decks Performance Tests\n');

  // Test 1: Current Prisma implementation
  console.log('Test 1: Current Prisma implementation (with _count)');
  const start1 = performance.now();

  const decks1 = await prisma.deck.findMany({
    where: {
      userId,
      deletedAt: null,
    },
    include: {
      _count: {
        select: { cardDecks: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const time1 = performance.now() - start1;
  console.log(`  Result: ${decks1.length} decks`);
  console.log(`  Time: ${time1.toFixed(2)}ms\n`);

  // Test 2: Optimized raw SQL with aggregation
  console.log('Test 2: Optimized raw SQL with LEFT JOIN COUNT');
  const start2 = performance.now();

  const decks2 = await prisma.$queryRaw<Array<{
    id: string;
    title: string;
    description: string | null;
    color: string;
    isPublic: boolean;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    cardCount: number;
  }>>`
    SELECT
      d.id,
      d.title,
      d.description,
      d.color,
      d."isPublic",
      d."deletedAt",
      d."createdAt",
      d."updatedAt",
      d."userId",
      COUNT(cd."cardId")::int as "cardCount"
    FROM "Deck" d
    LEFT JOIN "CardDeck" cd ON cd."deckId" = d.id
    WHERE d."userId" = ${userId}
      AND d."deletedAt" IS NULL
    GROUP BY d.id
    ORDER BY d."createdAt" ASC
  `;

  const time2 = performance.now() - start2;
  console.log(`  Result: ${decks2.length} decks`);
  console.log(`  Time: ${time2.toFixed(2)}ms\n`);

  // Verify results match
  console.log('Verification:');
  if (decks1.length === decks2.length) {
    console.log(`  ✅ Same number of decks: ${decks1.length}`);
  } else {
    console.log(`  ❌ Different results: ${decks1.length} vs ${decks2.length}`);
  }

  // Compare card counts
  for (let i = 0; i < Math.min(decks1.length, decks2.length); i++) {
    const count1 = decks1[i]._count.cardDecks;
    const count2 = decks2[i].cardCount;
    if (count1 !== count2) {
      console.log(`  ⚠️  Deck "${decks1[i].title}": ${count1} vs ${count2}`);
    }
  }

  console.log('\n📈 GET Performance Comparison:');
  console.log(`  Prisma with _count: ${time1.toFixed(2)}ms`);
  console.log(`  Raw SQL with GROUP BY: ${time2.toFixed(2)}ms`);

  if (time1 > time2) {
    console.log(`  Speedup: ${(time1 / time2).toFixed(2)}x faster`);
  } else {
    console.log(`  Note: Raw SQL is ${(time2 / time1).toFixed(2)}x slower (may be margin of error)`);
  }

  // ========================================
  // Test POST /api/decks logic
  // ========================================
  console.log('\n📊 POST /api/decks Logic Analysis\n');

  const testTitle = 'Test Deck ' + Date.now();

  // Test 3: Check existing deck (current approach)
  console.log('Test 3: Check for existing deck (current approach)');
  const start3 = performance.now();

  const existing = await prisma.deck.findFirst({
    where: {
      userId,
      title: testTitle,
      deletedAt: null,
    },
  });

  const time3 = performance.now() - start3;
  console.log(`  Result: ${existing ? 'Found' : 'Not found'}`);
  console.log(`  Time: ${time3.toFixed(2)}ms\n`);

  // Test 4: Combined check using raw SQL
  console.log('Test 4: Combined existence check with raw SQL');
  const start4 = performance.now();

  const existingRaw = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS(
      SELECT 1 FROM "Deck"
      WHERE "userId" = ${userId}
        AND title = ${testTitle}
        AND "deletedAt" IS NULL
    ) as exists
  `;

  const time4 = performance.now() - start4;
  console.log(`  Result: ${existingRaw[0]?.exists ? 'Found' : 'Not found'}`);
  console.log(`  Time: ${time4.toFixed(2)}ms\n`);

  console.log('📈 POST Check Performance Comparison:');
  console.log(`  Prisma findFirst: ${time3.toFixed(2)}ms`);
  console.log(`  Raw SQL EXISTS: ${time4.toFixed(2)}ms`);

  if (time3 > time4) {
    console.log(`  Speedup: ${(time3 / time4).toFixed(2)}x faster`);
  }

  // ========================================
  // Summary
  // ========================================
  console.log('\n📊 Summary:');

  if (time1 < 50 && time2 < 50) {
    console.log('  ✅ GET performance is excellent (<50ms)');
  } else if (time1 < 100 && time2 < 100) {
    console.log('  ✅ GET performance is good (<100ms)');
  } else {
    console.log('  ⚠️  GET performance could be improved');
  }

  if (time3 < 50) {
    console.log('  ✅ POST check performance is excellent (<50ms)');
  } else if (time3 < 100) {
    console.log('  ✅ POST check performance is good (<100ms)');
  } else {
    console.log('  ⚠️  POST check performance could be improved');
  }

  console.log('\n💡 Recommendations:');

  if (time2 < time1 * 0.8) {
    console.log('  - Consider using raw SQL for GET /api/decks');
  } else {
    console.log('  - Current Prisma approach for GET is acceptable');
  }

  if (time4 < time3 * 0.8) {
    console.log('  - Consider using SQL EXISTS for POST duplicate check');
  } else {
    console.log('  - Current Prisma findFirst for POST is acceptable');
  }

  console.log('\n✅ Diagnosis complete!');
  await prisma.$disconnect();
}

diagnose().catch(console.error);
