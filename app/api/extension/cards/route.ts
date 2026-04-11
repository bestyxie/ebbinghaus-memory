import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/app/lib/api-helpers'
import { prisma } from '@/app/lib/prisma'
import { withCors, handleOptions } from '@/app/lib/cors'
import { calculateInitialEaseFactor } from '@/app/lib/zod'
import { z } from 'zod'

const createExtensionCardSchema = z.object({
  front: z.string().min(1, 'Front is required'),
  back: z.string().min(1, 'Back is required'),
  note: z.string().optional(),
  deckId: z.string().optional(),
  quality: z.number().int().min(3).max(5).default(4),
})

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('Origin')
  const userId = await requireAuth(request)
  if (userId instanceof NextResponse) return withCors(userId, origin)

  const body = await request.json()
  const parsed = createExtensionCardSchema.safeParse(body)
  if (!parsed.success) {
    return withCors(
      NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 }),
      origin
    )
  }

  const { front, back, note, deckId, quality } = parsed.data

  if (deckId) {
    const deck = await prisma.deck.findFirst({ where: { id: deckId, userId, deletedAt: null } })
    if (!deck) {
      return withCors(NextResponse.json({ error: 'Invalid deck' }, { status: 400 }), origin)
    }
  }

  const card = await prisma.card.create({
    data: {
      front,
      back,
      note: note ?? null,
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

  return withCors(NextResponse.json({ card }, { status: 201 }), origin)
}
