import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/api-helpers';

// DELETE - Batch delete cards
export async function DELETE(request: NextRequest) {
  const userId = await requireAuth(request);
  if (userId instanceof NextResponse) return userId;

  try {
    const body = await request.json();
    const { ids } = body as { ids: string[] };

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No card IDs provided' }, { status: 400 });
    }

    // Verify all cards belong to the user
    const cards = await prisma.card.findMany({
      where: {
        id: { in: ids },
        userId,
      },
      select: { id: true },
    });

    const ownedIds = cards.map((c) => c.id);

    if (ownedIds.length === 0) {
      return NextResponse.json({ error: 'No valid cards found' }, { status: 404 });
    }

    // Delete all owned cards (cascade handles CardDeck and ReviewLog)
    const result = await prisma.card.deleteMany({
      where: {
        id: { in: ownedIds },
        userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${result.count} card(s) deleted.`,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error('Error batch deleting cards:', error);
    return NextResponse.json(
      { error: 'Failed to delete cards' },
      { status: 500 }
    );
  }
}
