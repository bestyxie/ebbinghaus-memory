/**
 * Test POST /api/decks performance with full workflow
 * Run with: npx tsx scripts/test-decks-post-performance.ts
 */

import { prisma } from '../app/lib/prisma';

async function testPost() {
  console.log('🧪 Testing POST /api/decks full workflow performance...\n');

  // Get sample user
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log('❌ No users found');
    return;
  }

  const userId = user.id;
  const testTitle = 'Performance Test Deck ' + Date.now();

  console.log(`Testing with user: ${user.email}`);
  console.log(`Test deck title: ${testTitle}\n`);

  // ========================================
  // Test 1: Current POST workflow
  // ========================================
  console.log('📊 Test 1: Current POST workflow (3 operations)\n');

  const start1 = performance.now();

  // Step 1: Check for existing active deck
  const checkStart = performance.now();
  const existing = await prisma.deck.findFirst({
    where: {
      userId,
      title: testTitle,
      deletedAt: null,
    },
  });
  const checkTime = performance.now() - checkStart;
  console.log(`  Step 1 (Check existing): ${checkTime.toFixed(2)}ms`);

  // Step 2: Delete soft-deleted deck (if any)
  const deleteStart = performance.now();
  await prisma.deck.deleteMany({
    where: {
      userId,
      title: testTitle,
      deletedAt: { not: null },
    },
  });
  const deleteTime = performance.now() - deleteStart;
  console.log(`  Step 2 (Delete soft-deleted): ${deleteTime.toFixed(2)}ms`);

  // Step 3: Create new deck
  const createStart = performance.now();
  const deck1 = await prisma.deck.create({
    data: {
      title: testTitle,
      description: 'Test description',
      color: '#137fec',
      isPublic: false,
      userId,
    },
  });
  const createTime = performance.now() - createStart;
  console.log(`  Step 3 (Create deck): ${createTime.toFixed(2)}ms`);

  const time1 = performance.now() - start1;
  console.log(`  Total time: ${time1.toFixed(2)}ms\n`);

  // Clean up test deck 1
  await prisma.deck.delete({ where: { id: deck1.id } });

  // ========================================
  // Test 2: Optimized workflow with transaction
  // ========================================
  console.log('📊 Test 2: Optimized workflow (transaction)\n');

  const start2 = performance.now();

  const deck2 = await prisma.$transaction(async (tx) => {
    // Step 1: Check for existing active deck
    const txCheckStart = performance.now();
    const existingInTx = await tx.deck.findFirst({
      where: {
        userId,
        title: testTitle + '_tx',
        deletedAt: null,
      },
    });
    const txCheckTime = performance.now() - txCheckStart;
    console.log(`  Step 1 (Check in tx): ${txCheckTime.toFixed(2)}ms`);

    if (existingInTx) {
      throw new Error('Deck already exists');
    }

    // Step 2 & 3 combined: Delete and create in same transaction
    const txDeleteStart = performance.now();
    await tx.deck.deleteMany({
      where: {
        userId,
        title: testTitle + '_tx',
        deletedAt: { not: null },
      },
    });
    const txDeleteTime = performance.now() - txDeleteStart;
    console.log(`  Step 2 (Delete in tx): ${txDeleteTime.toFixed(2)}ms`);

    const txCreateStart = performance.now();
    const newDeck = await tx.deck.create({
      data: {
        title: testTitle + '_tx',
        description: 'Test description',
        color: '#137fec',
        isPublic: false,
        userId,
      },
    });
    const txCreateTime = performance.now() - txCreateStart;
    console.log(`  Step 3 (Create in tx): ${txCreateTime.toFixed(2)}ms`);

    return newDeck;
  });

  const time2 = performance.now() - start2;
  console.log(`  Total time: ${time2.toFixed(2)}ms\n`);

  // Clean up test deck 2
  await prisma.deck.delete({ where: { id: deck2.id } });

  // ========================================
  // Test 3: Using upsert (if possible)
  // ========================================
  console.log('📊 Test 3: Alternative approach with raw SQL\n');

  const start3 = performance.now();

  // Use raw SQL to handle the logic in database
  const result = await prisma.$queryRaw<Array<{ id: string }>>`
    WITH deleted AS (
      DELETE FROM "Deck"
      WHERE "userId" = ${userId}
        AND title = ${testTitle + '_sql'}
        AND "deletedAt" IS NOT NULL
    )
    INSERT INTO "Deck" (id, title, description, color, "isPublic", "userId", "createdAt", "updatedAt")
    SELECT
      gen_random_uuid()::text,
      ${testTitle + '_sql'},
      ${'Test description'},
      ${'#137fec'},
      false,
      ${userId},
      NOW(),
      NOW()
    WHERE NOT EXISTS (
      SELECT 1 FROM "Deck"
      WHERE "userId" = ${userId}
        AND title = ${testTitle + '_sql'}
        AND "deletedAt" IS NULL
    )
    RETURNING id
  `;

  const time3 = performance.now() - start3;

  if (result.length > 0) {
    console.log(`  Created deck in single query: ${time3.toFixed(2)}ms\n`);
    // Clean up
    await prisma.deck.delete({ where: { id: result[0].id } });
  } else {
    console.log(`  Deck already exists (check worked): ${time3.toFixed(2)}ms\n`);
  }

  // ========================================
  // Performance Comparison
  // ========================================
  console.log('📈 Performance Comparison:');
  console.log(`  Current approach (3 ops): ${time1.toFixed(2)}ms`);
  console.log(`  Transaction approach: ${time2.toFixed(2)}ms`);
  console.log(`  Single SQL query: ${time3.toFixed(2)}ms\n`);

  if (time2 < time1) {
    console.log(`  Transaction speedup: ${(time1 / time2).toFixed(2)}x faster`);
  }

  if (time3 < time1) {
    console.log(`  Single query speedup: ${(time1 / time3).toFixed(2)}x faster`);
  }

  // ========================================
  // Summary
  // ========================================
  console.log('\n📊 Summary:');

  const fastest = Math.min(time1, time2, time3);
  if (fastest === time1) {
    console.log('  Current approach is already optimal');
  } else if (fastest === time2) {
    console.log('  ✅ Transaction approach is fastest');
    console.log(`     Improvement: ${((time1 - time2) / time1 * 100).toFixed(1)}% faster`);
  } else {
    console.log('  ✅ Single SQL query is fastest');
    console.log(`     Improvement: ${((time1 - time3) / time1 * 100).toFixed(1)}% faster`);
  }

  if (time1 < 50) {
    console.log('  Note: All approaches are very fast (<50ms), optimization may not be necessary');
  }

  console.log('\n✅ Test complete!');
  await prisma.$disconnect();
}

testPost().catch(console.error);
