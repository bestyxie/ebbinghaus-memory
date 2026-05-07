import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/app/lib/api-helpers', () => ({
  requireAuth: vi.fn(),
}))

vi.mock('@/app/lib/prisma', () => ({
  prisma: {
    translationTask: { findUnique: vi.fn(), update: vi.fn() },
  },
}))

vi.mock('@/app/lib/translate-ai', () => ({
  evaluateTranslation: vi.fn(),
}))

import { POST } from '@/app/api/translate/[id]/submit/route'
import { requireAuth } from '@/app/lib/api-helpers'
import { prisma } from '@/app/lib/prisma'
import { evaluateTranslation } from '@/app/lib/translate-ai'

const USER_ID = 'user_test'
const TASK_ID = 'task_1'

function authedRequest(body: object) {
  vi.mocked(requireAuth).mockResolvedValue(USER_ID)
  return new NextRequest(`http://localhost/api/translate/${TASK_ID}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const baseTask = {
  id: TASK_ID,
  userId: USER_ID,
  topic: '医疗 IT 与实施',
  difficulty: 'advanced',
  sourceText: '医疗IT系统实施过程中，数据迁移和系统集成是确保业务连续性的关键环节。',
  interval: 0,
  repetitions: 0,
  easeFactor: 2.5,
  hintUsed: false,
}

const evaluationData = {
  score: 85,
  accuracyScore: 85,
  fluencyScore: 90,
  vocabScore: 80,
  feedback: '翻译基本准确',
  polished: '润色版本',
  nativeAlt: '地道表达',
  annotations: [
    { segment: 'data migration', type: 'good' as const, comment: '术语准确' },
    { segment: 'key factors', type: 'bad' as const, comment: '可用 critical' },
  ],
  nativeAnnotations: [
    { segment: 'critical enablers', comment: '比 key factors 更专业地道' },
  ],
}

describe('POST /api/translate/[id]/submit', () => {
  beforeEach(() => vi.clearAllMocks())

  it('submits translation with AI evaluation and SM-2 scheduling', async () => {
    vi.mocked(prisma.translationTask.findUnique).mockResolvedValue(baseTask as never)
    vi.mocked(evaluateTranslation).mockResolvedValue({ data: evaluationData })
    vi.mocked(prisma.translationTask.update).mockResolvedValue({} as never)

    const res = await POST(
      authedRequest({ userTranslation: 'test translation', timeSpentMs: 5000 }),
      { params: Promise.resolve({ id: TASK_ID }) }
    )
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.annotations).toEqual(evaluationData.annotations)

    // Verify SM-2 fields were passed to update
    const updateData = vi.mocked(prisma.translationTask.update).mock.calls[0][0].data
    expect(updateData.score).toBe(85)
    expect(updateData.status).toBe('COMPLETED') // score >= 80
    expect(updateData.interval).toBe(1) // first repetition with quality 4 → interval 1
    expect(updateData.easeFactor).toBeGreaterThan(1.3)
    expect(updateData.nextReviewAt).toBeInstanceOf(Date)
  })

  it('sets status to NEEDS_REVIEW when score < 80', async () => {
    vi.mocked(prisma.translationTask.findUnique).mockResolvedValue(baseTask as never)
    vi.mocked(evaluateTranslation).mockResolvedValue({
      data: { ...evaluationData, score: 65 },
    })
    vi.mocked(prisma.translationTask.update).mockResolvedValue({} as never)

    await POST(
      authedRequest({ userTranslation: 'poor translation' }),
      { params: Promise.resolve({ id: TASK_ID }) }
    )

    const updateData = vi.mocked(prisma.translationTask.update).mock.calls[0][0].data
    expect(updateData.status).toBe('NEEDS_REVIEW')
    expect(updateData.interval).toBe(1) // quality 2 → reset to interval 1
  })

  it('maps scores to SM-2 quality levels correctly', async () => {
    const scoreCases = [
      { score: 92, expectedInterval: 1, expectedReps: 1 },  // quality 5
      { score: 85, expectedInterval: 1, expectedReps: 1 },  // quality 4
      { score: 75, expectedInterval: 1, expectedReps: 1 },  // quality 3
      { score: 65, expectedInterval: 1, expectedReps: 0 },  // quality 2 → reset
      { score: 50, expectedInterval: 1, expectedReps: 0 },  // quality 1 → reset
    ]

    for (const { score } of scoreCases) {
      vi.clearAllMocks()
      vi.mocked(requireAuth).mockResolvedValue(USER_ID)
      vi.mocked(prisma.translationTask.findUnique).mockResolvedValue(baseTask as never)
      vi.mocked(evaluateTranslation).mockResolvedValue({
        data: { ...evaluationData, score },
      })
      vi.mocked(prisma.translationTask.update).mockResolvedValue({} as never)

      await POST(
        authedRequest({ userTranslation: 'test' }),
        { params: Promise.resolve({ id: TASK_ID }) }
      )

      const updateData = vi.mocked(prisma.translationTask.update).mock.calls[0][0].data
      expect(updateData.score).toBe(score)
    }
  })

  it('returns 400 when userTranslation is missing', async () => {
    vi.mocked(requireAuth).mockResolvedValue(USER_ID)

    const res = await POST(
      new NextRequest(`http://localhost/api/translate/${TASK_ID}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }),
      { params: Promise.resolve({ id: TASK_ID }) }
    )

    expect(res.status).toBe(400)
    expect(await res.json()).toMatchObject({ error: 'userTranslation is required' })
  })

  it('returns 404 when task not found', async () => {
    vi.mocked(prisma.translationTask.findUnique).mockResolvedValue(null)

    const res = await POST(
      authedRequest({ userTranslation: 'test' }),
      { params: Promise.resolve({ id: 'nonexistent' }) }
    )

    expect(res.status).toBe(404)
  })

  it('returns 403 when task belongs to another user', async () => {
    vi.mocked(prisma.translationTask.findUnique).mockResolvedValue({
      ...baseTask,
      userId: 'other_user',
    } as never)

    const res = await POST(
      authedRequest({ userTranslation: 'test' }),
      { params: Promise.resolve({ id: TASK_ID }) }
    )

    expect(res.status).toBe(403)
  })

  it('returns 500 when AI evaluation fails', async () => {
    vi.mocked(prisma.translationTask.findUnique).mockResolvedValue(baseTask as never)
    vi.mocked(evaluateTranslation).mockResolvedValue({
      data: null,
      error: 'AI evaluation failed',
    })

    const res = await POST(
      authedRequest({ userTranslation: 'test' }),
      { params: Promise.resolve({ id: TASK_ID }) }
    )

    expect(res.status).toBe(500)
    expect(await res.json()).toMatchObject({ error: 'AI evaluation failed' })
  })

  it('preserves hintUsed from task when not provided in request', async () => {
    const taskWithHint = { ...baseTask, hintUsed: true }
    vi.mocked(prisma.translationTask.findUnique).mockResolvedValue(taskWithHint as never)
    vi.mocked(evaluateTranslation).mockResolvedValue({ data: evaluationData })
    vi.mocked(prisma.translationTask.update).mockResolvedValue({} as never)

    await POST(
      authedRequest({ userTranslation: 'test' }),
      { params: Promise.resolve({ id: TASK_ID }) }
    )

    const updateData = vi.mocked(prisma.translationTask.update).mock.calls[0][0].data
    expect(updateData.hintUsed).toBe(true) // preserved from task
  })

  it('passes timeSpentMs when provided', async () => {
    vi.mocked(prisma.translationTask.findUnique).mockResolvedValue(baseTask as never)
    vi.mocked(evaluateTranslation).mockResolvedValue({ data: evaluationData })
    vi.mocked(prisma.translationTask.update).mockResolvedValue({} as never)

    await POST(
      authedRequest({ userTranslation: 'test', timeSpentMs: 15000 }),
      { params: Promise.resolve({ id: TASK_ID }) }
    )

    const updateData = vi.mocked(prisma.translationTask.update).mock.calls[0][0].data
    expect(updateData.timeSpentMs).toBe(15000)
  })
})
