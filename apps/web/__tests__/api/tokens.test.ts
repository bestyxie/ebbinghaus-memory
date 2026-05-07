import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/app/lib/prisma', () => ({
  prisma: {
    apiToken: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

vi.mock('@/app/lib/auth', () => ({
  auth: { api: { getSession: vi.fn() } },
}))

import { GET, POST } from '@/app/api/tokens/route'
import { DELETE } from '@/app/api/tokens/[id]/route'
import { prisma } from '@/app/lib/prisma'
import { auth } from '@/app/lib/auth'

const USER_ID = 'user_test'

function authedSession() {
  vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: USER_ID } } as never)
  vi.mocked(prisma.apiToken.findUnique).mockResolvedValue(null) // no bearer token
}

describe('GET /api/tokens', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns token list for authenticated user', async () => {
    authedSession()
    const mockTokens = [
      { id: 'tok_1', name: 'Extension', lastUsedAt: null, expiresAt: null, createdAt: new Date() },
    ]
    vi.mocked(prisma.apiToken.findMany).mockResolvedValue(mockTokens as never)

    const res = await GET(new NextRequest('http://localhost/api/tokens'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.tokens).toHaveLength(1)
    expect(body.tokens[0].name).toBe('Extension')
    expect(prisma.apiToken.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: USER_ID } })
    )
  })

  it('returns 401 without authentication', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null)
    vi.mocked(prisma.apiToken.findUnique).mockResolvedValue(null)

    const res = await GET(new NextRequest('http://localhost/api/tokens'))
    expect(res.status).toBe(401)
  })
})

describe('POST /api/tokens', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates a token and returns rawToken once', async () => {
    authedSession()
    vi.mocked(prisma.apiToken.create).mockResolvedValue({
      id: 'tok_new', name: 'My Extension', createdAt: new Date(),
    } as never)

    const res = await POST(new NextRequest('http://localhost/api/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'My Extension' }),
    }))
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.token.name).toBe('My Extension')
    expect(body.token.rawToken).toMatch(/^emb_[0-9a-f]{48}$/)
  })

  it('stores a SHA-256 hash, never the raw token', async () => {
    authedSession()
    vi.mocked(prisma.apiToken.create).mockResolvedValue({
      id: 'tok_new', name: 'Test', createdAt: new Date(),
    } as never)

    await POST(new NextRequest('http://localhost/api/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test' }),
    }))

    const stored = vi.mocked(prisma.apiToken.create).mock.calls[0][0].data.tokenHash
    expect(stored).toMatch(/^[0-9a-f]{64}$/) // SHA-256 hex
    expect(stored).not.toMatch(/^emb_/)       // not the raw token
  })

  it('returns 400 when name is missing', async () => {
    authedSession()

    const res = await POST(new NextRequest('http://localhost/api/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when name is empty string', async () => {
    authedSession()

    const res = await POST(new NextRequest('http://localhost/api/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '' }),
    }))
    expect(res.status).toBe(400)
  })
})

describe('DELETE /api/tokens/:id', () => {
  beforeEach(() => vi.clearAllMocks())

  const params = Promise.resolve({ id: 'tok_1' })

  it('deletes a token owned by the user', async () => {
    authedSession()
    vi.mocked(prisma.apiToken.findFirst).mockResolvedValue({ id: 'tok_1' } as never)
    vi.mocked(prisma.apiToken.delete).mockResolvedValue({} as never)

    const res = await DELETE(new NextRequest('http://localhost/api/tokens/tok_1', {
      method: 'DELETE',
    }), { params })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(prisma.apiToken.delete).toHaveBeenCalledWith({ where: { id: 'tok_1' } })
  })

  it('returns 404 when token does not belong to user', async () => {
    authedSession()
    vi.mocked(prisma.apiToken.findFirst).mockResolvedValue(null)

    const res = await DELETE(new NextRequest('http://localhost/api/tokens/tok_other', {
      method: 'DELETE',
    }), { params: Promise.resolve({ id: 'tok_other' }) })

    expect(res.status).toBe(404)
  })
})
