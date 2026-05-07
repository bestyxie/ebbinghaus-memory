import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/app/lib/api-helpers'
import { prisma } from '@/app/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireAuth(request)
  if (userId instanceof NextResponse) return userId

  const { id } = await params

  const token = await prisma.apiToken.findFirst({ where: { id, userId } })
  if (!token) {
    return NextResponse.json({ error: 'Token not found' }, { status: 404 })
  }

  await prisma.apiToken.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
