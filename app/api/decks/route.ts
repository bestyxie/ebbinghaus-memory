import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/app/lib/prisma';
import { z } from 'zod';

const createDeckSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  isPublic: z.boolean().optional().default(false),
});

// GET - Fetch all user's decks with card counts
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decks = await prisma.deck.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null,
      },
      include: {
        _count: {
          select: { cardDecks: true }, // Count relations instead of cards
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ decks });
  } catch (error) {
    console.error('Error fetching decks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch decks' },
      { status: 500 }
    );
  }
}

// POST - Create new deck
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, color, isPublic } = createDeckSchema.parse(body);

    // Check for existing active deck
    const existing = await prisma.deck.findFirst({
      where: {
        userId: session.user.id,
        title: title,
        deletedAt: null,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Deck name already exists' },
        { status: 409 }
      );
    }

    // Permanently delete any soft-deleted deck with the same name
    // This will cascade delete CardDeck relations (cards are preserved)
    await prisma.deck.deleteMany({
      where: {
        userId: session.user.id,
        title: title,
        deletedAt: { not: null },
      },
    });

    const deck = await prisma.deck.create({
      data: {
        title,
        description,
        color: color || '#137fec',
        isPublic,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ deck }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating deck:', error);
    return NextResponse.json(
      { error: 'Failed to create deck' },
      { status: 500 }
    );
  }
}
