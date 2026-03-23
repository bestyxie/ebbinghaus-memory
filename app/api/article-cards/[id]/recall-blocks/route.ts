import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { updateRecallBlocksSchema } from '@/app/lib/zod'
import { requireAuth } from '@/app/lib/api-helpers'
import { z } from 'zod'

/**
 * POST - Update recall blocks for an article card
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const userId = await requireAuth(request)
  if (userId instanceof NextResponse) return userId

  const params = await context.params

  try {
    const body = await request.json()
    const validatedData = updateRecallBlocksSchema.parse({
      ...body,
      cardId: params.id,
    })

    // Verify the card exists and belongs to the user
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

    // Update the recall blocks
    const updatedCard = await prisma.card.update({
      where: { id: validatedData.cardId },
      data: {
        recallBlocks: validatedData.recallBlocks,
      },
    })

    return NextResponse.json({ card: updatedCard })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.message },
        { status: 400 }
      )
    }
    console.error('Error updating recall blocks:', error)
    return NextResponse.json(
      { error: 'Failed to update recall blocks' },
      { status: 500 }
    )
  }
}

/**
 * GET - Fetch recall blocks for an article card
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const userId = await requireAuth(request)
  if (userId instanceof NextResponse) return userId

  const params = await context.params

  try {
    const card = await prisma.card.findFirst({
      where: {
        id: params.id,
        userId,
        cardType: 'ARTICLE',
      },
      select: {
        id: true,
        recallBlocks: true,
        articleContent: true,
        articleTitle: true,
      },
    })

    if (!card) {
      return NextResponse.json(
        { error: 'Article card not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: card.id,
      recallBlocks: card.recallBlocks,
      articleContent: card.articleContent,
      articleTitle: card.articleTitle,
    })
  } catch (error) {
    console.error('Error fetching recall blocks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recall blocks' },
      { status: 500 }
    )
  }
}
