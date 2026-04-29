import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/app/lib/api-helpers', () => ({
  requireAuth: vi.fn(),
}))

vi.mock('@/app/lib/prisma', () => ({
  prisma: {
    translationTask: { findUnique: vi.fn() },
    deck: { findUnique: vi.fn() },
    card: { create: vi.fn() },
    cardDeck: { create: vi.fn() },
  },
}))

import { POST } from '@/app/api/translate/[id]/create-card/route'
import { requireAuth } from '@/app/lib/api-helpers'
import { prisma } from '@/app/lib/prisma'

const USER_ID = 'user_test'
const TASK_ID = 'task_1'

function authedRequest(body: object) {
  vi.mocked(requireAuth).mockResolvedValue(USER_ID)
  return new NextRequest(`http://localhost/api/translate/${TASK_ID}/create-card`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const mockTask = {
  id: TASK_ID,
  userId: USER_ID,
  sourceText: '测试源文本',
}

const mockCard = {
  id: 'card_1',
  front: 'deploy',
  back: '部署',
  source: 'translate',
  cardType: 'FLASHCARD',
  state: 'NEW',
  userId: USER_ID,
}

describe('POST /api/translate/[id]/create-card', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates a card from translation result', async () => {
    vi.mocked(prisma.translationTask.findUnique).mockResolvedValue(mockTask as never)
    vi.mocked(prisma.card.create).mockResolvedValue(mockCard as never)

    const res = await POST(
      authedRequest({ front: 'deploy', back: '部署' }),
      { params: Promise.resolve({ id: TASK_ID }) }
    )
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.card.id).toBe('card_1')

    const createData = vi.mocked(prisma.card.create).mock.calls[0][0].data
    expect(createData.front).toBe('deploy')
    expect(createData.back).toBe('部署')
    expect(createData.source).toBe('translate')
    expect(createData.cardType).toBe('FLASHCARD')
    expect(createData.state).toBe('NEW')
    expect(createData.userId).toBe(USER_ID)
  })

  it('links card to deck when deckId provided', async () => {
    vi.mocked(prisma.translationTask.findUnique).mockResolvedValue(mockTask as never)
    vi.mocked(prisma.deck.findUnique).mockResolvedValue({ id: 'deck_1', userId: USER_ID } as never)
    vi.mocked(prisma.card.create).mockResolvedValue(mockCard as never)
    vi.mocked(prisma.cardDeck.create).mockResolvedValue({} as never)

    const res = await POST(
      authedRequest({ front: 'deploy', back: '部署', deckId: 'deck_1' }),
      { params: Promise.resolve({ id: TASK_ID }) }
    )

    expect(res.status).toBe(200)
    expect(prisma.cardDeck.create).toHaveBeenCalledWith({
      data: { cardId: 'card_1', deckId: 'deck_1' },
    })
  })

  it('does not link card when deckId not provided', async () => {
    vi.mocked(prisma.translationTask.findUnique).mockResolvedValue(mockTask as never)
    vi.mocked(prisma.card.create).mockResolvedValue(mockCard as never)

    await POST(
      authedRequest({ front: 'deploy', back: '部署' }),
      { params: Promise.resolve({ id: TASK_ID }) }
    )

    expect(prisma.cardDeck.create).not.toHaveBeenCalled()
  })

  it('returns 400 when front is missing', async () => {
    vi.mocked(requireAuth).mockResolvedValue(USER_ID)

    const res = await POST(
      new NextRequest(`http://localhost/api/translate/${TASK_ID}/create-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ back: '部署' }),
      }),
      { params: Promise.resolve({ id: TASK_ID }) }
    )

    expect(res.status).toBe(400)
    expect(await res.json()).toMatchObject({ error: 'front is required' })
  })

  it('returns 400 when back is missing', async () => {
    vi.mocked(requireAuth).mockResolvedValue(USER_ID)

    const res = await POST(
      new NextRequest(`http://localhost/api/translate/${TASK_ID}/create-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ front: 'deploy' }),
      }),
      { params: Promise.resolve({ id: TASK_ID }) }
    )

    expect(res.status).toBe(400)
    expect(await res.json()).toMatchObject({ error: 'back is required' })
  })

  it('returns 404 when task not found', async () => {
    vi.mocked(prisma.translationTask.findUnique).mockResolvedValue(null)

    const res = await POST(
      authedRequest({ front: 'deploy', back: '部署' }),
      { params: Promise.resolve({ id: 'nonexistent' }) }
    )

    expect(res.status).toBe(404)
    expect(await res.json()).toMatchObject({ error: 'Task not found' })
  })

  it('returns 404 when task belongs to another user', async () => {
    vi.mocked(prisma.translationTask.findUnique).mockResolvedValue({
      ...mockTask,
      userId: 'other_user',
    } as never)

    const res = await POST(
      authedRequest({ front: 'deploy', back: '部署' }),
      { params: Promise.resolve({ id: TASK_ID }) }
    )

    expect(res.status).toBe(404)
  })

  it('returns 404 when deck not found', async () => {
    vi.mocked(prisma.translationTask.findUnique).mockResolvedValue(mockTask as never)
    vi.mocked(prisma.deck.findUnique).mockResolvedValue(null)

    const res = await POST(
      authedRequest({ front: 'deploy', back: '部署', deckId: 'deck_other' }),
      { params: Promise.resolve({ id: TASK_ID }) }
    )

    expect(res.status).toBe(404)
    expect(await res.json()).toMatchObject({ error: 'Deck not found' })
  })

  it('returns 404 when deck belongs to another user', async () => {
    vi.mocked(prisma.translationTask.findUnique).mockResolvedValue(mockTask as never)
    vi.mocked(prisma.deck.findUnique).mockResolvedValue({ id: 'deck_1', userId: 'other_user' } as never)

    const res = await POST(
      authedRequest({ front: 'deploy', back: '部署', deckId: 'deck_1' }),
      { params: Promise.resolve({ id: TASK_ID }) }
    )

    expect(res.status).toBe(404)
  })
})
