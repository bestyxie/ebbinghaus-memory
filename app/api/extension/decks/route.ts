import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/app/lib/api-helpers'
import { prisma } from '@/app/lib/prisma'
import { withCors, handleOptions } from '@/app/lib/cors'

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get('Origin')
  const userId = await requireAuth(request)
  if (userId instanceof NextResponse) return withCors(userId, origin)

  const decks = await prisma.deck.findMany({
    where: { userId, deletedAt: null },
    select: { id: true, title: true, color: true },
    orderBy: { title: 'asc' },
  })

  return withCors(NextResponse.json({ decks }), origin)
}
