import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('@/app/lib/api-helpers', () => ({
  requireAuth: vi.fn(),
}))

vi.mock('@/app/lib/prisma', () => ({
  prisma: {
    translationTask: { findUnique: vi.fn() },
  },
}))

import { GET } from '@/app/api/translate/tasks/[id]/route'
import { requireAuth } from '@/app/lib/api-helpers'
import { prisma } from '@/app/lib/prisma'

const USER_ID = 'user_test'

function authedRequest(id: string) {
  vi.mocked(requireAuth).mockResolvedValue(USER_ID)
  return new NextRequest(`http://localhost/api/translate/tasks/${id}`)
}

const mockTask = {
  id: 'task_1',
  userId: USER_ID,
  topic: '医疗 IT 与实施',
  difficulty: 'advanced',
  sourceText: '测试源文本',
  userTranslation: null,
  score: null,
  status: 'PENDING',
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('GET /api/translate/tasks/[id]', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns task when found and belongs to user', async () => {
    vi.mocked(prisma.translationTask.findUnique).mockResolvedValue(mockTask as never)

    const res = await GET(authedRequest('task_1'), {
      params: Promise.resolve({ id: 'task_1' }),
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.task.id).toBe('task_1')
    expect(body.task.topic).toBe('医疗 IT 与实施')
  })

  it('returns 404 when task not found', async () => {
    vi.mocked(prisma.translationTask.findUnique).mockResolvedValue(null)

    const res = await GET(authedRequest('nonexistent'), {
      params: Promise.resolve({ id: 'nonexistent' }),
    })

    expect(res.status).toBe(404)
    expect(await res.json()).toMatchObject({ error: 'Task not found' })
  })

  it('returns 403 when task belongs to another user', async () => {
    vi.mocked(prisma.translationTask.findUnique).mockResolvedValue({
      ...mockTask,
      userId: 'other_user',
    } as never)

    const res = await GET(authedRequest('task_1'), {
      params: Promise.resolve({ id: 'task_1' }),
    })

    expect(res.status).toBe(403)
    expect(await res.json()).toMatchObject({ error: 'Forbidden' })
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(requireAuth).mockResolvedValue(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) as never
    )

    const res = await GET(new NextRequest('http://localhost/api/translate/tasks/task_1'), {
      params: Promise.resolve({ id: 'task_1' }),
    })

    expect(res.status).toBe(401)
  })
})
