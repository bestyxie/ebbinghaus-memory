import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/app/lib/api-helpers'
import { prisma } from '@/app/lib/prisma'

export async function GET(request: NextRequest) {
  const userId = await requireAuth(request)
  if (userId instanceof NextResponse) return userId

  const decks = await prisma.deck.findMany({
    where: { userId, deletedAt: null },
    select: { id: true, title: true, color: true },
    orderBy: { title: 'asc' },
  })

  return NextResponse.json({ decks })
}
