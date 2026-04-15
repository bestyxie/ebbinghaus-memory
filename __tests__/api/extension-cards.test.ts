import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/app/lib/prisma', () => ({
  prisma: {
    apiToken: { findUnique: vi.fn(), update: vi.fn() },
    deck: { findFirst: vi.fn() },
    card: { create: vi.fn() },
  },
}))

vi.mock('@/app/lib/auth', () => ({
  auth: { api: { getSession: vi.fn() } },
}))

import { POST } from '@/app/api/extension/cards/route'
import { prisma } from '@/app/lib/prisma'
import { auth } from '@/app/lib/auth'

const USER_ID = 'user_ext'
const RAW_TOKEN = 'emb_' + 'b'.repeat(48)

function authedTokenMock() {
  vi.mocked(prisma.apiToken.findUnique).mockResolvedValue({
    id: 'tok_1', userId: USER_ID, expiresAt: null,
  } as never)
  vi.mocked(prisma.apiToken.update).mockResolvedValue({} as never)
}

function postRequest(body: object, origin?: string) {
  authedTokenMock()
  return new NextRequest('http://localhost/api/extension/cards', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RAW_TOKEN}`,
      'Content-Type': 'application/json',
      ...(origin ? { Origin: origin } : {}),
    },
    body: JSON.stringify(body),
  })
}


describe('POST /api/extension/cards', () => {
  beforeEach(() => vi.clearAllMocks())

  const createdCard = { id: 'card_1', front: 'ephemeral', back: 'lasting briefly', createdAt: new Date() }

  it('creates a flashcard and returns it', async () => {
    vi.mocked(prisma.card.create).mockResolvedValue(createdCard as never)

    const res = await POST(postRequest({ front: 'ephemeral', back: 'lasting briefly' }))
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.card.front).toBe('ephemeral')
    expect(body.card.back).toBe('lasting briefly')
  })

  it('sets correct SM-2 initial state when creating', async () => {
    vi.mocked(prisma.card.create).mockResolvedValue(createdCard as never)

    await POST(postRequest({ front: 'ephemeral', back: 'lasting briefly', quality: 5 }))

    const createData = vi.mocked(prisma.card.create).mock.calls[0][0].data
    expect(createData.state).toBe('NEW')
    expect(createData.interval).toBe(0)
    expect(createData.repetitions).toBe(0)
    expect(createData.easeFactor).toBeGreaterThan(2.5) // quality 5 = Easy → higher EF
    expect(createData.userId).toBe(USER_ID)
  })

  it('links card to deck when deckId is provided', async () => {
    vi.mocked(prisma.deck.findFirst).mockResolvedValue({ id: 'deck_1' } as never)
    vi.mocked(prisma.card.create).mockResolvedValue(createdCard as never)

    await POST(postRequest({ front: 'ephemeral', back: 'lasting briefly', deckId: 'deck_1' }))

    const createData = vi.mocked(prisma.card.create).mock.calls[0][0].data
    expect(createData.cardDecks).toEqual({ create: { deckId: 'deck_1' } })
  })

  it('returns 400 when deckId does not belong to user', async () => {
    vi.mocked(prisma.deck.findFirst).mockResolvedValue(null)

    const res = await POST(postRequest({
      front: 'ephemeral', back: 'lasting briefly', deckId: 'deck_other',
    }))
    expect(res.status).toBe(400)
    expect(await res.json()).toMatchObject({ error: 'Invalid deck' })
  })

  it('returns 400 when front is missing', async () => {
    authedTokenMock()
    const res = await POST(postRequest({ back: 'no front provided' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when back is missing', async () => {
    authedTokenMock()
    const res = await POST(postRequest({ front: 'no back provided' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when quality is out of range', async () => {
    authedTokenMock()
    const res = await POST(postRequest({ front: 'f', back: 'b', quality: 1 }))
    expect(res.status).toBe(400)
  })

  it('returns 401 without authentication', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null)
    vi.mocked(prisma.apiToken.findUnique).mockResolvedValue(null)

    const res = await POST(new NextRequest('http://localhost/api/extension/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ front: 'f', back: 'b' }),
    }))
    expect(res.status).toBe(401)
  })
})
