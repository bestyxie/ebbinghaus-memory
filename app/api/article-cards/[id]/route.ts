import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { requireAuth } from '@/app/lib/api-helpers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth(request)
    if (userId instanceof NextResponse) return userId

    const { id } = await params

    const card = await prisma.card.findUnique({
      where: {
        id,
        userId,
      },
      include: {
        cardDecks: {
          include: {
            deck: true,
          },
        },
      },
    })

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    // Transform cardDecks to deck (single deck per card for now)
    const transformedCard = {
      ...card,
      deck: card.cardDecks[0]?.deck || null,
    }

    // For article cards, parse recallBlocks from JSON
    if (card.cardType === 'ARTICLE' && card.recallBlocks) {
      const recallBlocksData = Array.isArray(card.recallBlocks)
        ? card.recallBlocks
        : []

      return NextResponse.json({
        ...transformedCard,
        recallBlocks: recallBlocksData,
      })
    }

    return NextResponse.json(transformedCard)
  } catch (error) {
    console.error('Error fetching card:', error)
    return NextResponse.json({ error: 'Failed to fetch card' }, { status: 500 })
  }
}
