import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/app/lib/prisma';

// DELETE - Soft delete a deck
// BENEFIT: Prisma automatically cascades delete to CardDeck relations
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify deck exists and belongs to user
    const deck = await prisma.deck.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        deletedAt: null,
      },
      include: {
        _count: {
          select: { cardDecks: true },
        },
      },
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    const relationCount = deck._count.cardDecks;

    // Soft delete the deck
    // Prisma will automatically cascade delete CardDeck relations
    // due to onDelete: Cascade in the schema
    await prisma.deck.update({
      where: { id: params.id },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: relationCount > 0
        ? `Deck "${deck.title}" deleted. ${relationCount} card-deck relations removed.`
        : `Deck "${deck.title}" deleted.`,
      removedRelationCount: relationCount,
    });
  } catch (error) {
    console.error('Error deleting deck:', error);
    return NextResponse.json(
      { error: 'Failed to delete deck' },
      { status: 500 }
    );
  }
}
