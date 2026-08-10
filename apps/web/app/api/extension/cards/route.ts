import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/app/lib/api-helpers'
import { prisma } from '@/app/lib/prisma'
import { calculateInitialEaseFactor, sourceAnchorSchema } from '@ebbinghaus/shared'
import { z } from 'zod'

const createExtensionCardSchema = z.object({
  front: z.string().min(1, 'Front is required'),
  back: z.string().min(1, 'Back is required'),
  note: z.string().optional(),
  deckId: z.string().optional(),
  quality: z.number().int().min(3).max(5).default(4),
  sourceUrl: z.string().url().optional(),
  sourceWord: z.string().optional(),
  sourceAnchor: sourceAnchorSchema.optional(),
  sourceTitle: z.string().optional(),
  capturedAt: z.string().datetime().optional(),
  sourceProvenance: z.string().optional(),
})

const createExtensionCardsSchema = z.array(createExtensionCardSchema).min(1, 'At least one card is required')

export async function GET(request: NextRequest) {
  const userId = await requireAuth(request)
  if (userId instanceof NextResponse) return userId

  const { searchParams } = new URL(request.url)
  const source = searchParams.get('source')

  if (!source) {
    return NextResponse.json({ error: 'Missing required query parameter: source' }, { status: 400 })
  }

  const isUrl = /^https?:\/\//.test(source)
  const where = isUrl
    ? { userId, sourceUrl: { startsWith: source } }
    : { userId, sourceProvenance: source }

  const cards = await prisma.card.findMany({
    where,
    select: { id: true, front: true, back: true, sourceUrl: true, sourceTitle: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ cards })
}

export async function POST(request: NextRequest) {
  const userId = await requireAuth(request)
  if (userId instanceof NextResponse) return userId

  const body = await request.json()

  // Check if body is an array or single object
  const isArray = Array.isArray(body)

  if (isArray) {
    // Handle array of cards
    const parsed = createExtensionCardsSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    }

    const cardsData = parsed.data

    // Validate deck IDs for all cards
    for (const cardData of cardsData) {
      if (cardData.deckId) {
        const deck = await prisma.deck.findFirst({
          where: { id: cardData.deckId, userId, deletedAt: null }
        })
        if (!deck) {
          return NextResponse.json({ error: 'Invalid deck' }, { status: 400 })
        }
      }
    }

    // Create all cards
    const createdCards = await Promise.all(
      cardsData.map((cardData) => {
        const { front, back, note, deckId, quality, sourceUrl, sourceWord, sourceAnchor, sourceTitle, capturedAt, sourceProvenance } = cardData
        return prisma.card.create({
          data: {
            front,
            back,
            note: note ?? null,
            sourceUrl: sourceUrl ?? null,
            sourceWord: sourceWord ?? null,
            ...(sourceAnchor && { sourceAnchor }),
            sourceTitle: sourceTitle ?? null,
            capturedAt: capturedAt ? new Date(capturedAt) : null,
            sourceProvenance: sourceProvenance ?? null,
            userId,
            nextReviewAt: new Date(),
            interval: 0,
            easeFactor: calculateInitialEaseFactor(quality),
            repetitions: 0,
            state: 'NEW',
            ...(deckId && { cardDecks: { create: { deckId } } }),
          },
          select: { id: true, front: true, back: true, createdAt: true },
        })
      })
    )

    return NextResponse.json({ cards: createdCards }, { status: 201 })
  } else {
    // Handle single card
    const parsed = createExtensionCardSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    }

    const { front, back, note, deckId, quality, sourceUrl, sourceWord, sourceAnchor, sourceTitle, capturedAt, sourceProvenance } = parsed.data

    if (deckId) {
      const deck = await prisma.deck.findFirst({
        where: { id: deckId, userId, deletedAt: null }
      })
      if (!deck) {
        return NextResponse.json({ error: 'Invalid deck' }, { status: 400 })
      }
    }

    const card = await prisma.card.create({
      data: {
        front,
        back,
        note: note ?? null,
        sourceUrl: sourceUrl ?? null,
        sourceWord: sourceWord ?? null,
        ...(sourceAnchor && { sourceAnchor }),
        sourceTitle: sourceTitle ?? null,
        capturedAt: capturedAt ? new Date(capturedAt) : null,
        sourceProvenance: sourceProvenance ?? null,
        userId,
        nextReviewAt: new Date(),
        interval: 0,
        easeFactor: calculateInitialEaseFactor(quality),
        repetitions: 0,
        state: 'NEW',
        ...(deckId && { cardDecks: { create: { deckId } } }),
      },
      select: { id: true, front: true, back: true, createdAt: true },
    })

    return NextResponse.json({ card }, { status: 201 })
  }
}
