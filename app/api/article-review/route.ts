import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { requireAuth } from '@/app/lib/api-helpers'
import { calculateReview } from '@/app/lib/srs-algorithm'
import { z } from 'zod'

// Validation schema for article review submission
const submitReviewSchema = z.object({
  cardId: z.string().cuid(),
  quality: z.number().int().min(0).max(5),
  studyTimeMs: z.number().int().min(0),
})

/**
 * GET - Fetch article cards due for review
 */
export async function GET(request: NextRequest) {
  const userId = await requireAuth(request)
  if (userId instanceof NextResponse) return userId

  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')

    const cards = await prisma.card.findMany({
      where: {
        userId,
        cardType: 'ARTICLE',
        nextReviewAt: { lte: new Date() },
      },
      take: limit,
      orderBy: { nextReviewAt: 'asc' },
      include: {
        cardDecks: {
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
    })

    // Transform cards to include deck info
    const cardsWithDeck = cards.map((card) => ({
      ...card,
      deck: card.cardDecks.length > 0 ? card.cardDecks[0].deck : null,
    }))

    return NextResponse.json({
      cards: cardsWithDeck,
      total: cardsWithDeck.length,
    })
  } catch (error) {
    console.error('Error fetching articles for review:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles for review' },
      { status: 500 }
    )
  }
}

/**
 * POST - Submit article review rating
 */
export async function POST(request: NextRequest) {
  const userId = await requireAuth(request)
  if (userId instanceof NextResponse) return userId

  try {
    const body = await request.json()
    const validatedData = submitReviewSchema.parse(body)

    // Fetch the current card state
    const card = await prisma.card.findFirst({
      where: {
        id: validatedData.cardId,
        userId,
        cardType: 'ARTICLE',
      },
    })

    if (!card) {
      return NextResponse.json(
        { error: 'Article card not found' },
        { status: 404 }
      )
    }

    // Calculate new SM-2 values
    const reviewResult = calculateReview({
      interval: card.interval,
      repetitions: card.repetitions,
      easeFactor: card.easeFactor,
      quality: validatedData.quality,
    })

    // Update card state and log the review
    await prisma.$transaction([
      // Update the card
      prisma.card.update({
        where: { id: validatedData.cardId },
        data: {
          interval: reviewResult.interval,
          repetitions: reviewResult.repetitions,
          easeFactor: reviewResult.easeFactor,
          nextReviewAt: reviewResult.nextReviewDate,
          totalStudyTimeMs: (card.totalStudyTimeMs || 0) + validatedData.studyTimeMs,
          lastStudyAt: new Date(),
          // Update state based on quality
          state: validatedData.quality < 3 ? 'RELEARNING' :
                 validatedData.quality === 3 ? 'LEARNING' :
                 reviewResult.repetitions > 0 ? 'REVIEW' : 'LEARNING',
        },
      }),
      // Create review log
      prisma.reviewLog.create({
        data: {
          cardId: validatedData.cardId,
          userId,
          rating: validatedData.quality,
          reviewTime: validatedData.studyTimeMs,
          reviewedAt: new Date(),
          scheduledDays: card.interval,
          elapsedDays: Math.floor(
            (new Date().getTime() - new Date(card.nextReviewAt).getTime()) / (1000 * 60 * 60 * 24)
          ),
          lastEaseFactor: card.easeFactor,
          newEaseFactor: reviewResult.easeFactor,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      nextReviewDate: reviewResult.nextReviewDate,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.message },
        { status: 400 }
      )
    }
    console.error('Error submitting article review:', error)
    return NextResponse.json(
      { error: 'Failed to submit article review' },
      { status: 500 }
    )
  }
}
