import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/app/lib/api-helpers'
import { prisma } from '@/app/lib/prisma'
import { generateRawToken, hashToken } from '@/app/lib/token'
import { z } from 'zod'

const createTokenSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
})

export async function GET(request: NextRequest) {
  const userId = await requireAuth(request)
  if (userId instanceof NextResponse) return userId

  const tokens = await prisma.apiToken.findMany({
    where: { userId },
    select: { id: true, name: true, lastUsedAt: true, expiresAt: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ tokens })
}

export async function POST(request: NextRequest) {
  const userId = await requireAuth(request)
  if (userId instanceof NextResponse) return userId

  const body = await request.json()
  const parsed = createTokenSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const rawToken = generateRawToken()
  const token = await prisma.apiToken.create({
    data: { name: parsed.data.name, tokenHash: hashToken(rawToken), userId },
    select: { id: true, name: true, createdAt: true },
  })

  // rawToken is returned ONCE — user must copy it now, it's never stored raw
  return NextResponse.json({ token: { ...token, rawToken } }, { status: 201 })
}
