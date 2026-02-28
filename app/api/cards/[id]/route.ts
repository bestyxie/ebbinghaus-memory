import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/api-helpers';

// DELETE - Delete a card (hard delete)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const userId = await requireAuth();
  if (userId instanceof NextResponse) return userId;

  const params = await context.params;

  try {
    // Verify card exists and belongs to user
    const card = await prisma.card.findFirst({
      where: {
        id: params.id,
        userId,
      },
      include: {
        _count: {
          select: { cardDecks: true },
        },
      },
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    const relationCount = card._count.cardDecks;

    // Hard delete the card
    // Prisma will automatically cascade delete CardDeck relations and ReviewLog
    // due to onDelete: Cascade in the schema
    await prisma.card.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: relationCount > 0
        ? `Card deleted. ${relationCount} card-deck relations removed.`
        : 'Card deleted.',
      removedRelationCount: relationCount,
    });
  } catch (error) {
    console.error('Error deleting card:', error);
    return NextResponse.json(
      { error: 'Failed to delete card' },
      { status: 500 }
    );
  }
}
