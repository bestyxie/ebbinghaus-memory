/**
 * Diagnose getCardsData performance
 * Run with: npx tsx scripts/diagnose-cards-query.ts
 */

import { prisma } from '../app/lib/prisma';

async function diagnose() {
  console.log('🔍 Diagnosing getCardsData performance...\n');

  // Get sample user
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log('❌ No users found');
    return;
  }

  const userId = user.id;
  const limit = 10;
  const skip = 0;

  console.log(`Testing with user: ${user.email}\n`);

  // Test 1: Current Prisma implementation
  console.log('📊 Test 1: Current Prisma implementation');
  const start1 = performance.now();

  const where = { userId };
  const orderBy = { nextReviewAt: 'asc' as const };

  const [cards, total] = await Promise.all([
    prisma.card.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      select: {
        id: true,
        front: true,
        note: true,
        nextReviewAt: true,
        interval: true,
        easeFactor: true,
        repetitions: true,
        state: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        cardDecks: {
          where: {
            deck: {
              deletedAt: null,
            },
          },
          include: {
            deck: {
              select: {
                id: true,
                title: true,
                color: true,
              },
            },
          },
        },
      },
    }),
    prisma.card.count({ where }),
  ]);

  const time1 = performance.now() - start1;
  console.log(`  Result: ${cards.length} cards, total ${total}`);
  console.log(`  Time: ${time1.toFixed(2)}ms\n`);

  // Test 2: Optimized raw SQL approach
  console.log('📊 Test 2: Optimized raw SQL approach');
  const start2 = performance.now();

  // Get cards with deck info in a single query
  const cardsRaw = await prisma.$queryRaw<Array<{
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
  }>>`
    SELECT
      c.id,
      c.front,
      c.note,
      c."nextReviewAt",
      c.interval,
      c."easeFactor",
      c.repetitions,
      c.state,
      c."userId",
      c."createdAt",
      c."updatedAt",
      d.id as "deckId",
      d.title as "deckTitle",
      d.color as "deckColor"
    FROM "Card" c
    LEFT JOIN "CardDeck" cd ON cd."cardId" = c.id
    LEFT JOIN "Deck" d ON d.id = cd."deckId" AND d."deletedAt" IS NULL
    WHERE c."userId" = ${userId}
    ORDER BY c."nextReviewAt" ASC
    LIMIT ${limit}
    OFFSET ${skip}
  `;

  // Get total count
  const totalRaw = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*)::int as count
    FROM "Card"
    WHERE "userId" = ${userId}
  `;

  const time2 = performance.now() - start2;
  console.log(`  Result: ${cardsRaw.length} cards, total ${totalRaw[0]?.count}`);
  console.log(`  Time: ${time2.toFixed(2)}ms\n`);

  // Test 3: Single query with window function for total
  console.log('📊 Test 3: Ultra-optimized single query with COUNT OVER()');
  const start3 = performance.now();

  const allData = await prisma.$queryRaw<Array<{
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
  }>>`
    SELECT
      c.id,
      c.front,
      c.note,
      c."nextReviewAt",
      c.interval,
      c."easeFactor",
      c.repetitions,
      c.state,
      c."userId",
      c."createdAt",
      c."updatedAt",
      d.id as "deckId",
      d.title as "deckTitle",
      d.color as "deckColor",
      COUNT(*) OVER()::int as total_count
    FROM "Card" c
    LEFT JOIN "CardDeck" cd ON cd."cardId" = c.id
    LEFT JOIN "Deck" d ON d.id = cd."deckId" AND d."deletedAt" IS NULL
    WHERE c."userId" = ${userId}
    ORDER BY c."nextReviewAt" ASC
    LIMIT ${limit}
    OFFSET ${skip}
  `;

  const time3 = performance.now() - start3;
  const totalCount = allData[0]?.total_count ?? 0;
  console.log(`  Result: ${allData.length} cards, total ${totalCount}`);
  console.log(`  Time: ${time3.toFixed(2)}ms\n`);

  // Performance comparison
  console.log('📈 Performance Comparison:');
  console.log(`  Prisma approach: ${time1.toFixed(2)}ms`);
  console.log(`  Raw SQL (2 queries): ${time2.toFixed(2)}ms`);
  console.log(`    Speedup: ${(time1 / time2).toFixed(2)}x faster`);
  console.log(`  Raw SQL (single query): ${time3.toFixed(2)}ms`);
  console.log(`    Speedup: ${(time1 / time3).toFixed(2)}x faster`);
  console.log(`    vs Test 2: ${(time2 / time3).toFixed(2)}x faster`);

  if (time3 < 100) {
    console.log('\n✅ Ultra-optimized query is excellent (<100ms)');
  } else if (time3 < 500) {
    console.log('\n✅ Ultra-optimized query is good (<500ms)');
  } else {
    console.log('\n⚠️  Query could be further optimized');
  }

  console.log('\n✅ Diagnosis complete!');
  await prisma.$disconnect();
}

diagnose().catch(console.error);
