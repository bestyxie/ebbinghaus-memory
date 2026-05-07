import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/app/lib/prisma', () => ({
  prisma: {
    apiToken: { findUnique: vi.fn(), update: vi.fn() },
    deck: { findFirst: vi.fn() },
    card: { create: vi.fn(), findMany: vi.fn() },
  },
}))

vi.mock('@/app/lib/auth', () => ({
  auth: { api: { getSession: vi.fn() } },
}))

import { POST, GET } from '@/app/api/extension/cards/route'
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

  describe('batch creation (array input)', () => {
    it('creates multiple cards from array', async () => {
      const mockCards = [
        { id: 'card_1', front: 'word 1', back: 'meaning 1', createdAt: new Date() },
        { id: 'card_2', front: 'word 2', back: 'meaning 2', createdAt: new Date() },
        { id: 'card_3', front: 'word 3', back: 'meaning 3', createdAt: new Date() },
      ]
      vi.mocked(prisma.card.create)
        .mockResolvedValueOnce(mockCards[0] as never)
        .mockResolvedValueOnce(mockCards[1] as never)
        .mockResolvedValueOnce(mockCards[2] as never)

      const res = await POST(postRequest([
        { front: 'word 1', back: 'meaning 1', quality: 4 },
        { front: 'word 2', back: 'meaning 2', quality: 5 },
        { front: 'word 3', back: 'meaning 3', quality: 3 },
      ]))
      const body = await res.json()

      expect(res.status).toBe(201)
      expect(body.cards).toHaveLength(3)
      expect(body.cards[0].front).toBe('word 1')
      expect(body.cards[1].front).toBe('word 2')
      expect(body.cards[2].front).toBe('word 3')
      expect(prisma.card.create).toHaveBeenCalledTimes(3)
    })

    it('returns 400 for empty array', async () => {
      authedTokenMock()
      const res = await POST(postRequest([]))
      expect(res.status).toBe(400)
    })

    it('validates all cards in array before creation', async () => {
      authedTokenMock()
      const res = await POST(postRequest([
        { front: 'valid', back: 'valid' },
        { front: '', back: 'invalid' }, // empty front
      ]))
      expect(res.status).toBe(400)
      expect(prisma.card.create).not.toHaveBeenCalled()
    })

    it('returns 400 if any card references invalid deck', async () => {
      vi.mocked(prisma.deck.findFirst).mockResolvedValue(null)
      authedTokenMock()

      const res = await POST(postRequest([
        { front: 'word 1', back: 'meaning 1', deckId: 'invalid_deck' },
      ]))
      expect(res.status).toBe(400)
      expect(await res.json()).toMatchObject({ error: 'Invalid deck' })
    })
  })

  describe('optional fields', () => {
    it('accepts note field', async () => {
      vi.mocked(prisma.card.create).mockResolvedValue(createdCard as never)

      await POST(postRequest({
        front: 'ephemeral',
        back: 'lasting briefly',
        note: 'remember: short-lived',
      }))

      const createData = vi.mocked(prisma.card.create).mock.calls[0][0].data
      expect(createData.note).toBe('remember: short-lived')
    })

    it('accepts source field', async () => {
      vi.mocked(prisma.card.create).mockResolvedValue(createdCard as never)

      await POST(postRequest({
        front: 'ephemeral',
        back: 'lasting briefly',
        source: 'chrome-extension',
      }))

      const createData = vi.mocked(prisma.card.create).mock.calls[0][0].data
      expect(createData.source).toBe('chrome-extension')
    })

    it('uses default quality 4 when not provided', async () => {
      vi.mocked(prisma.card.create).mockResolvedValue(createdCard as never)

      await POST(postRequest({
        front: 'ephemeral',
        back: 'lasting briefly',
      }))

      const createData = vi.mocked(prisma.card.create).mock.calls[0][0].data
      expect(createData.easeFactor).toBeCloseTo(2.5, 1) // quality 4 defaults to ~2.5
    })
  })
})

describe('GET /api/extension/cards', () => {
  beforeEach(() => vi.clearAllMocks())

  function getRequest(url: string) {
    vi.mocked(prisma.apiToken.findUnique).mockResolvedValue({
      id: 'tok_1', userId: USER_ID, expiresAt: null,
    } as never)
    vi.mocked(prisma.apiToken.update).mockResolvedValue({} as never)
    return new NextRequest(url, {
      headers: { Authorization: `Bearer ${RAW_TOKEN}` },
    })
  }

  it('returns cards filtered by source parameter', async () => {
    const mockCards = [
      { id: 'card_1', front: 'test word', back: 'test meaning', source: 'extension', createdAt: new Date() },
    ]
    vi.mocked(prisma.card.findMany).mockResolvedValue(mockCards as never)

    const res = await GET(getRequest('http://localhost/api/extension/cards?source=extension'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.cards).toHaveLength(1)
    expect(prisma.card.findMany).toHaveBeenCalledWith({
      where: { userId: USER_ID, source: 'extension' },
      select: { id: true, front: true, back: true, source: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
  })

  it('returns 400 when source parameter is missing', async () => {
    const res = await GET(getRequest('http://localhost/api/extension/cards'))
    expect(res.status).toBe(400)
    expect(await res.json()).toMatchObject({ error: 'Missing required query parameter: source' })
  })

  it('returns 401 without authentication', async () => {
    vi.mocked(prisma.apiToken.findUnique).mockResolvedValue(null)
    vi.mocked(auth.api.getSession).mockResolvedValue(null)

    const res = await GET(new NextRequest('http://localhost/api/extension/cards?source=test'))
    expect(res.status).toBe(401)
  })

  it('returns empty array when no cards found for source', async () => {
    vi.mocked(prisma.card.findMany).mockResolvedValue([])

    const res = await GET(getRequest('http://localhost/api/extension/cards?source=nonexistent'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.cards).toHaveLength(0)
  })
})
