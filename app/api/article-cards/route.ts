import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { createArticleCardSchema } from '@/app/lib/zod'
import { requireAuth } from '@/app/lib/api-helpers'
import { calculateWordCount, calculateReadTime } from '@/app/lib/text-analysis'
import { z } from 'zod'

/**
 * POST - Create a new article card
 */
export async function POST(request: NextRequest) {
  const userId = await requireAuth(request)
  if (userId instanceof NextResponse) return userId

  try {
    const body = await request.json()
    const validatedData = createArticleCardSchema.parse(body)

    // Calculate word count and read time
    const wordCount = calculateWordCount(validatedData.articleContent)
    const readTimeMins = calculateReadTime(wordCount)

    // Create the article card with default SM-2 values
    const card = await prisma.card.create({
      data: {
        cardType: 'ARTICLE',
        articleTitle: validatedData.articleTitle,
        articleContent: validatedData.articleContent,
        recallBlocks: validatedData.recallBlocks || [],
        wordCount,
        readTimeMins,
        userId,
        front: validatedData.articleTitle, // Used for list display
        back: `Article with ${wordCount} words`, // Used for list display
        // SM-2 initial values
        nextReviewAt: new Date(),
        interval: 0,
        easeFactor: 2.5,
        repetitions: 0,
        state: 'NEW',
        totalStudyTimeMs: 0,
      },
    })

    // If deckId is provided, create the CardDeck relation
    if (validatedData.deckId) {
      await prisma.cardDeck.create({
        data: {
          cardId: card.id,
          deckId: validatedData.deckId,
        },
      })
    }

    return NextResponse.json({ card }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.message },
        { status: 400 }
      )
    }
    console.error('Error creating article card:', error)
    return NextResponse.json(
      { error: 'Failed to create article card' },
      { status: 500 }
    )
  }
}

/**
 * GET - Fetch all article cards for the current user
 */
export async function GET(request: NextRequest) {
  const userId = await requireAuth(request)
  if (userId instanceof NextResponse) return userId

  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const [cards, total] = await Promise.all([
      prisma.card.findMany({
        where: {
          userId,
          cardType: 'ARTICLE',
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
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
      }),
      prisma.card.count({
        where: {
          userId,
          cardType: 'ARTICLE',
        },
      }),
    ])

    // Transform cards to include deck info
    const cardsWithDeck = cards.map((card) => ({
      ...card,
      deck: card.cardDecks.length > 0 ? card.cardDecks[0].deck : null,
    }))

    return NextResponse.json({
      cards: cardsWithDeck,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching article cards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch article cards' },
      { status: 500 }
    )
  }
}
