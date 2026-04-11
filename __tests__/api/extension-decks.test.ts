import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/app/lib/prisma', () => ({
  prisma: {
    apiToken: { findUnique: vi.fn(), update: vi.fn() },
    deck: { findMany: vi.fn() },
  },
}))

vi.mock('@/app/lib/auth', () => ({
  auth: { api: { getSession: vi.fn() } },
}))

import { OPTIONS, GET } from '@/app/api/extension/decks/route'
import { prisma } from '@/app/lib/prisma'
import { auth } from '@/app/lib/auth'
import { hashToken } from '@/app/lib/token'

const USER_ID = 'user_ext'
const RAW_TOKEN = 'emb_' + 'a'.repeat(48)

function bearerRequest(url: string) {
  vi.mocked(prisma.apiToken.findUnique).mockResolvedValue({
    id: 'tok_1', userId: USER_ID, expiresAt: null,
  } as never)
  vi.mocked(prisma.apiToken.update).mockResolvedValue({} as never)
  return new NextRequest(url, {
    headers: { Authorization: `Bearer ${RAW_TOKEN}` },
  })
}

describe('OPTIONS /api/extension/decks', () => {
  it('returns 204 for preflight from a chrome extension', async () => {
    const req = new NextRequest('http://localhost/api/extension/decks', {
      method: 'OPTIONS',
      headers: { Origin: 'chrome-extension://abc' },
    })
    const res = await OPTIONS(req)
    expect(res.status).toBe(204)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('chrome-extension://abc')
    expect(res.headers.get('Access-Control-Allow-Headers')).toContain('Authorization')
  })
})

describe('GET /api/extension/decks', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns decks for authenticated user via Bearer token', async () => {
    const mockDecks = [
      { id: 'deck_1', title: '英语四级', color: '#137fec' },
      { id: 'deck_2', title: '前端面试', color: '#e53e3e' },
    ]
    vi.mocked(prisma.deck.findMany).mockResolvedValue(mockDecks as never)

    const res = await GET(bearerRequest('http://localhost/api/extension/decks'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.decks).toHaveLength(2)
    expect(body.decks[0].title).toBe('英语四级')
    expect(prisma.deck.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: USER_ID, deletedAt: null } })
    )
  })

  it('adds CORS headers to the response for extension origin', async () => {
    vi.mocked(prisma.deck.findMany).mockResolvedValue([] as never)
    const req = new NextRequest('http://localhost/api/extension/decks', {
      headers: {
        Authorization: `Bearer ${RAW_TOKEN}`,
        Origin: 'chrome-extension://abc',
      },
    })
    vi.mocked(prisma.apiToken.findUnique).mockResolvedValue({
      id: 'tok_1', userId: USER_ID, expiresAt: null,
    } as never)
    vi.mocked(prisma.apiToken.update).mockResolvedValue({} as never)

    const res = await GET(req)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('chrome-extension://abc')
  })

  it('returns 401 with invalid token', async () => {
    vi.mocked(prisma.apiToken.findUnique).mockResolvedValue(null)

    const req = new NextRequest('http://localhost/api/extension/decks', {
      headers: { Authorization: 'Bearer emb_invalid' },
    })
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns 401 without any authentication', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null)
    vi.mocked(prisma.apiToken.findUnique).mockResolvedValue(null)

    const res = await GET(new NextRequest('http://localhost/api/extension/decks'))
    expect(res.status).toBe(401)
  })
})
