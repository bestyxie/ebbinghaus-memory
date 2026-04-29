import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/api-helpers';
import { prisma } from '@/app/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireAuth(request);
  if (userId instanceof NextResponse) return userId;

  try {
    const { id: taskId } = await params;
    const body = await request.json();
    const { front, back, deckId } = body;

    if (!front || typeof front !== 'string') {
      return NextResponse.json({ error: 'front is required' }, { status: 400 });
    }
    if (!back || typeof back !== 'string') {
      return NextResponse.json({ error: 'back is required' }, { status: 400 });
    }

    // Verify task belongs to user
    const task = await prisma.translationTask.findUnique({ where: { id: taskId } });
    if (!task || task.userId !== userId) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // If deckId provided, verify it belongs to user
    if (deckId) {
      const deck = await prisma.deck.findUnique({ where: { id: deckId } });
      if (!deck || deck.userId !== userId) {
        return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
      }
    }

    const card = await prisma.card.create({
      data: {
        userId,
        cardType: 'FLASHCARD',
        front,
        back,
        source: 'translate',
        state: 'NEW',
      },
    });

    // Link to deck if specified
    if (deckId) {
      await prisma.cardDeck.create({
        data: { cardId: card.id, deckId },
      });
    }

    return NextResponse.json({ card });
  } catch (error) {
    console.error('Error in POST /api/translate/[id]/create-card:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
