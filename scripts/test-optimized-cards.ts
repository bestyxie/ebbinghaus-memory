/**
 * Test optimized getCardsData function
 * Run with: npx tsx scripts/test-optimized-cards.ts
 */

import { prisma } from '../app/lib/prisma';

// Simulated optimized getCardsData (without React.cache)
async function getCardsDataOptimized(
  userId: string,
  sortBy: 'nextReviewAt' | 'createdAt' | 'easeFactor',
  deckId: string | null,
  page: number,
  limit: number = 10
) {
  const startTime = performance.now();
  const skip = (page - 1) * limit;

  type RawCardResult = {
    id: string;
    front: string;
    note: string | null;
    nextReviewAt: Date;
    interval: number;
    easeFactor: number;
    repetitions: number;
    state: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    deckId: string | null;
    deckTitle: string | null;
    deckColor: string | null;
    total_count: number;
  };

  let rawCards: RawCardResult[];

  // Build query based on filters and sort options
  if (deckId) {
    // Query with deck filter
    if (sortBy === 'createdAt') {
      rawCards = await prisma.$queryRaw<RawCardResult[]>`
        SELECT
          c.id, c.front, c.note, c."nextReviewAt", c.interval, c."easeFactor",
          c.repetitions, c.state, c."userId", c."createdAt", c."updatedAt",
          d.id as "deckId", d.title as "deckTitle", d.color as "deckColor",
          COUNT(*) OVER()::int as total_count
        FROM "Card" c
        INNER JOIN "CardDeck" cd ON cd."cardId" = c.id AND cd."deckId" = ${deckId}
        LEFT JOIN "Deck" d ON d.id = cd."deckId" AND d."deletedAt" IS NULL
        WHERE c."userId" = ${userId}
        ORDER BY c."createdAt" ASC
        LIMIT ${limit} OFFSET ${skip}
      `;
    } else if (sortBy === 'easeFactor') {
      rawCards = await prisma.$queryRaw<RawCardResult[]>`
        SELECT
          c.id, c.front, c.note, c."nextReviewAt", c.interval, c."easeFactor",
          c.repetitions, c.state, c."userId", c."createdAt", c."updatedAt",
          d.id as "deckId", d.title as "deckTitle", d.color as "deckColor",
          COUNT(*) OVER()::int as total_count
        FROM "Card" c
        INNER JOIN "CardDeck" cd ON cd."cardId" = c.id AND cd."deckId" = ${deckId}
        LEFT JOIN "Deck" d ON d.id = cd."deckId" AND d."deletedAt" IS NULL
        WHERE c."userId" = ${userId}
        ORDER BY c."easeFactor" ASC
        LIMIT ${limit} OFFSET ${skip}
      `;
    } else {
      rawCards = await prisma.$queryRaw<RawCardResult[]>`
        SELECT
          c.id, c.front, c.note, c."nextReviewAt", c.interval, c."easeFactor",
          c.repetitions, c.state, c."userId", c."createdAt", c."updatedAt",
          d.id as "deckId", d.title as "deckTitle", d.color as "deckColor",
          COUNT(*) OVER()::int as total_count
        FROM "Card" c
        INNER JOIN "CardDeck" cd ON cd."cardId" = c.id AND cd."deckId" = ${deckId}
        LEFT JOIN "Deck" d ON d.id = cd."deckId" AND d."deletedAt" IS NULL
        WHERE c."userId" = ${userId}
        ORDER BY c."nextReviewAt" ASC
        LIMIT ${limit} OFFSET ${skip}
      `;
    }
  } else {
    // Query without deck filter
    if (sortBy === 'createdAt') {
      rawCards = await prisma.$queryRaw<RawCardResult[]>`
        SELECT
          c.id, c.front, c.note, c."nextReviewAt", c.interval, c."easeFactor",
          c.repetitions, c.state, c."userId", c."createdAt", c."updatedAt",
          d.id as "deckId", d.title as "deckTitle", d.color as "deckColor",
          COUNT(*) OVER()::int as total_count
        FROM "Card" c
        LEFT JOIN "CardDeck" cd ON cd."cardId" = c.id
        LEFT JOIN "Deck" d ON d.id = cd."deckId" AND d."deletedAt" IS NULL
        WHERE c."userId" = ${userId}
        ORDER BY c."createdAt" ASC
        LIMIT ${limit} OFFSET ${skip}
      `;
    } else if (sortBy === 'easeFactor') {
      rawCards = await prisma.$queryRaw<RawCardResult[]>`
        SELECT
          c.id, c.front, c.note, c."nextReviewAt", c.interval, c."easeFactor",
          c.repetitions, c.state, c."userId", c."createdAt", c."updatedAt",
          d.id as "deckId", d.title as "deckTitle", d.color as "deckColor",
          COUNT(*) OVER()::int as total_count
        FROM "Card" c
        LEFT JOIN "CardDeck" cd ON cd."cardId" = c.id
        LEFT JOIN "Deck" d ON d.id = cd."deckId" AND d."deletedAt" IS NULL
        WHERE c."userId" = ${userId}
        ORDER BY c."easeFactor" ASC
        LIMIT ${limit} OFFSET ${skip}
      `;
    } else {
      rawCards = await prisma.$queryRaw<RawCardResult[]>`
        SELECT
          c.id, c.front, c.note, c."nextReviewAt", c.interval, c."easeFactor",
          c.repetitions, c.state, c."userId", c."createdAt", c."updatedAt",
          d.id as "deckId", d.title as "deckTitle", d.color as "deckColor",
          COUNT(*) OVER()::int as total_count
        FROM "Card" c
        LEFT JOIN "CardDeck" cd ON cd."cardId" = c.id
        LEFT JOIN "Deck" d ON d.id = cd."deckId" AND d."deletedAt" IS NULL
        WHERE c."userId" = ${userId}
        ORDER BY c."nextReviewAt" ASC
        LIMIT ${limit} OFFSET ${skip}
      `;
    }
  }

  const elapsed = performance.now() - startTime;
  const total = rawCards[0]?.total_count ?? 0;

  return { cards: rawCards, total, elapsed };
}

async function test() {
  console.log('🧪 Testing optimized getCardsData...\n');

  const user = await prisma.user.findFirst();
  if (!user) {
    console.log('❌ No users found');
    return;
  }

  const userId = user.id;
  console.log(`Testing with user: ${user.email}\n`);

  // Test 1: Default sort (nextReviewAt)
  console.log('📋 Test 1: Sort by nextReviewAt (default)');
  const result1 = await getCardsDataOptimized(userId, 'nextReviewAt', null, 1, 10);
  console.log(`  ✅ ${result1.cards.length} cards, total ${result1.total}`);
  console.log(`  ⏱️  Time: ${result1.elapsed.toFixed(2)}ms\n`);

  // Test 2: Sort by createdAt
  console.log('📋 Test 2: Sort by createdAt');
  const result2 = await getCardsDataOptimized(userId, 'createdAt', null, 1, 10);
  console.log(`  ✅ ${result2.cards.length} cards, total ${result2.total}`);
  console.log(`  ⏱️  Time: ${result2.elapsed.toFixed(2)}ms\n`);

  // Test 3: Sort by easeFactor
  console.log('📋 Test 3: Sort by easeFactor');
  const result3 = await getCardsDataOptimized(userId, 'easeFactor', null, 1, 10);
  console.log(`  ✅ ${result3.cards.length} cards, total ${result3.total}`);
  console.log(`  ⏱️  Time: ${result3.elapsed.toFixed(2)}ms\n`);

  // Test 4: With deck filter (if decks exist)
  const deck = await prisma.deck.findFirst({ where: { userId } });
  if (deck) {
    console.log('📋 Test 4: Filter by deck');
    const result4 = await getCardsDataOptimized(userId, 'nextReviewAt', deck.id, 1, 10);
    console.log(`  ✅ ${result4.cards.length} cards, total ${result4.total}`);
    console.log(`  ⏱️  Time: ${result4.elapsed.toFixed(2)}ms\n`);
  }

  // Test 5: Page 2
  if (result1.total > 10) {
    console.log('📋 Test 5: Page 2');
    const result5 = await getCardsDataOptimized(userId, 'nextReviewAt', null, 2, 10);
    console.log(`  ✅ ${result5.cards.length} cards, total ${result5.total}`);
    console.log(`  ⏱️  Time: ${result5.elapsed.toFixed(2)}ms\n`);
  }

  // Summary
  const avgTime = (result1.elapsed + result2.elapsed + result3.elapsed) / 3;
  console.log('📊 Performance Summary:');
  console.log(`  Average query time: ${avgTime.toFixed(2)}ms`);

  if (avgTime < 50) {
    console.log('  ✅ Excellent performance (<50ms)');
  } else if (avgTime < 100) {
    console.log('  ✅ Good performance (<100ms)');
  } else if (avgTime < 500) {
    console.log('  ⚠️  Acceptable performance (<500ms)');
  } else {
    console.log('  ❌ Needs further optimization (>500ms)');
  }

  console.log('\n✨ Test completed!');
  await prisma.$disconnect();
}

test().catch(console.error);
