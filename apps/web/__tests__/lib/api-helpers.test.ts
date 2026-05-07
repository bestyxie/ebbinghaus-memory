import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('@/app/lib/prisma', () => ({
  prisma: {
    apiToken: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('@/app/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))

import { requireAuth } from '@/app/lib/api-helpers'
import { prisma } from '@/app/lib/prisma'
import { auth } from '@/app/lib/auth'
import { hashToken } from '@/app/lib/token'

describe('requireAuth — Bearer token', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns userId when a valid non-expired token is provided', async () => {
    const rawToken = 'emb_validtoken'
    vi.mocked(prisma.apiToken.findUnique).mockResolvedValue({
      id: 'tok_1', userId: 'user_1', expiresAt: null,
    } as never)
    vi.mocked(prisma.apiToken.update).mockResolvedValue({} as never)

    const req = new NextRequest('http://localhost/api/tokens', {
      headers: { Authorization: `Bearer ${rawToken}` },
    })
    const result = await requireAuth(req)

    expect(result).toBe('user_1')
    expect(prisma.apiToken.findUnique).toHaveBeenCalledWith({
      where: { tokenHash: hashToken(rawToken) },
      select: { id: true, userId: true, expiresAt: true },
    })
  })

  it('returns 401 when token is not found in DB', async () => {
    vi.mocked(prisma.apiToken.findUnique).mockResolvedValue(null)

    const req = new NextRequest('http://localhost/api/tokens', {
      headers: { Authorization: 'Bearer emb_notfound' },
    })
    const result = await requireAuth(req)

    expect(result).toBeInstanceOf(NextResponse)
    expect((result as NextResponse).status).toBe(401)
    expect(await (result as NextResponse).json()).toEqual({ error: 'Invalid token' })
  })

  it('returns 401 when token is expired', async () => {
    vi.mocked(prisma.apiToken.findUnique).mockResolvedValue({
      id: 'tok_1', userId: 'user_1', expiresAt: new Date('2020-01-01'),
    } as never)

    const req = new NextRequest('http://localhost/api/tokens', {
      headers: { Authorization: 'Bearer emb_expired' },
    })
    const result = await requireAuth(req)

    expect(result).toBeInstanceOf(NextResponse)
    expect((result as NextResponse).status).toBe(401)
    expect(await (result as NextResponse).json()).toEqual({ error: 'Token expired' })
  })

  it('accepts a token with a future expiry date', async () => {
    vi.mocked(prisma.apiToken.findUnique).mockResolvedValue({
      id: 'tok_1', userId: 'user_1', expiresAt: new Date('2099-01-01'),
    } as never)
    vi.mocked(prisma.apiToken.update).mockResolvedValue({} as never)

    const req = new NextRequest('http://localhost/api/tokens', {
      headers: { Authorization: 'Bearer emb_future' },
    })
    const result = await requireAuth(req)
    expect(result).toBe('user_1')
  })
})

describe('requireAuth — session cookie fallback', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns userId from session when no Authorization header', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user_session' },
    } as never)

    const req = new NextRequest('http://localhost/api/tokens')
    const result = await requireAuth(req)
    expect(result).toBe('user_session')
    expect(prisma.apiToken.findUnique).not.toHaveBeenCalled()
  })

  it('returns 401 when session is absent', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null)

    const req = new NextRequest('http://localhost/api/tokens')
    const result = await requireAuth(req)

    expect(result).toBeInstanceOf(NextResponse)
    expect((result as NextResponse).status).toBe(401)
  })
})
