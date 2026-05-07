import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockFetch = vi.fn()
global.fetch = mockFetch

vi.mock('@/app/lib/prisma', () => ({
  prisma: {
    apiToken: { findUnique: vi.fn(), update: vi.fn() },
  },
}))

vi.mock('@/app/lib/auth', () => ({
  auth: { api: { getSession: vi.fn() } },
}))

import { GET } from '@/app/api/extension/dictionary/route'
import { prisma } from '@/app/lib/prisma'
import { auth } from '@/app/lib/auth'

const USER_ID = 'user_dict'
const RAW_TOKEN = 'emb_' + 'c'.repeat(48)

function authedRequest() {
  vi.mocked(prisma.apiToken.findUnique).mockResolvedValue({
    id: 'tok_1', userId: USER_ID, expiresAt: null,
  } as never)
  vi.mocked(prisma.apiToken.update).mockResolvedValue({} as never)
}

function getRequest(word: string) {
  authedRequest()
  return new NextRequest(`http://localhost/api/extension/dictionary?word=${word}`, {
    headers: { Authorization: `Bearer ${RAW_TOKEN}` },
  })
}

describe('GET /api/extension/dictionary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.BAIDU_APP_ID = 'test_app_id'
    process.env.BAIDU_SECRET_KEY = 'test_secret_key'
  })

  afterEach(() => {
    mockFetch.mockReset()
  })

  afterEach(() => {
    delete process.env.BAIDU_APP_ID
    delete process.env.BAIDU_SECRET_KEY
  })

  it('returns dictionary data for valid word', async () => {
    const mockBaiduResponse = {
      trans_result: [{ src: 'hello', dst: '你好' }],
    }
    const mockDictResponse = [
      {
        word: 'hello',
        phonetic: '/həˈloʊ/',
        phonetics: [
          { text: '/həˈloʊ/', audio: 'https://example.com/hello.mp3' },
        ],
        meanings: [
          {
            partOfSpeech: 'exclamation',
            definitions: [{ definition: 'Used as a greeting' }],
          },
        ],
      },
    ]

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockBaiduResponse,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDictResponse,
      } as Response)

    const res = await GET(getRequest('hello'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.word).toBe('hello')
    expect(body.basicTranslation).toBe('你好')
    expect(body.phonetic).toBe('/həˈloʊ/')
    expect(body.audio).toBe('https://example.com/hello.mp3')
    expect(body.englishDefinitions).toEqual(mockDictResponse[0].meanings)
  })

  it('returns 400 when word parameter is missing', async () => {
    authedRequest()
    const res = await GET(new NextRequest('http://localhost/api/extension/dictionary', {
      headers: { Authorization: `Bearer ${RAW_TOKEN}` },
    }))

    expect(res.status).toBe(400)
    expect(await res.json()).toMatchObject({
      error: '请提供要查询的单词 (例如: ?word=apple)',
    })
  })

  it('returns 500 when Baidu API credentials are missing', async () => {
    delete process.env.BAIDU_APP_ID
    delete process.env.BAIDU_SECRET_KEY

    const res = await GET(getRequest('test'))

    expect(res.status).toBe(500)
    expect(await res.json()).toMatchObject({ error: '服务端缺失 Baidu API 配置' })
  })

  it('handles word not found in dictionary API gracefully', async () => {
    const mockBaiduResponse = {
      trans_result: [{ src: 'nonexistent', dst: '不存在的' }],
    }

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockBaiduResponse,
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response)

    const res = await GET(getRequest('nonexistent'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.word).toBe('nonexistent')
    expect(body.basicTranslation).toBe('不存在的')
    expect(body.phonetic).toBe('')
    expect(body.audio).toBe('')
    expect(body.englishDefinitions).toEqual([])
  })

  it('handles phonetic without audio', async () => {
    const mockBaiduResponse = {
      trans_result: [{ src: 'test', dst: '测试' }],
    }
    const mockDictResponse = [
      {
        word: 'test',
        phonetic: '/test/',
        phonetics: [{ text: '/test/', audio: '' }],
        meanings: [],
      },
    ]

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockBaiduResponse,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDictResponse,
      } as Response)

    const res = await GET(getRequest('test'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.phonetic).toBe('/test/')
    expect(body.audio).toBe('')
  })

  it('uses first phonetic when no phonetic with audio found', async () => {
    const mockBaiduResponse = {
      trans_result: [{ src: 'fallback', dst: '回退' }],
    }
    const mockDictResponse = [
      {
        word: 'fallback',
        phonetics: [
          { text: '/ˈfɔːlbæk/' },
          { audio: 'https://example.com/audio.mp3' },
        ],
        meanings: [],
      },
    ]

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockBaiduResponse,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDictResponse,
      } as Response)

    const res = await GET(getRequest('fallback'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.phonetic).toBe('/ˈfɔːlbæk/')
  })

  it('handles API errors', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    const res = await GET(getRequest('hello'))

    expect(res.status).toBe(500)
    expect(await res.json()).toMatchObject({ error: '服务器请求外部 API 失败' })
  })

  it('returns 401 without authentication', async () => {
    vi.mocked(prisma.apiToken.findUnique).mockResolvedValue(null)
    vi.mocked(auth.api.getSession).mockResolvedValue(null)

    const res = await GET(new NextRequest('http://localhost/api/extension/dictionary?word=test'))
    expect(res.status).toBe(401)
  })

  it('handles missing Baidu translation', async () => {
    const mockBaiduResponse = { trans_result: null }
    const mockDictResponse = [
      {
        word: 'hello',
        phonetics: [{ text: '/həˈloʊ/', audio: '' }],
        meanings: [],
      },
    ]

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockBaiduResponse,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDictResponse,
      } as Response)

    const res = await GET(getRequest('hello'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.basicTranslation).toBeNull()
  })

  it('makes concurrent requests to both APIs', async () => {
    const mockBaiduResponse = {
      trans_result: [{ src: 'concurrent', dst: '并发' }],
    }
    const mockDictResponse = [
      {
        word: 'concurrent',
        phonetics: [],
        meanings: [],
      },
    ]

    let baiduCalled = false
    let dictCalled = false

    mockFetch.mockImplementation(async (url) => {
      if (typeof url === 'string' && url.includes('baidu')) {
        baiduCalled = true
        await new Promise((resolve) => setTimeout(resolve, 10))
        return {
          ok: true,
          json: async () => mockBaiduResponse,
        } as Response
      } else {
        dictCalled = true
        await new Promise((resolve) => setTimeout(resolve, 10))
        return {
          ok: true,
          json: async () => mockDictResponse,
        } as Response
      }
    })

    const startTime = Date.now()
    const res = await GET(getRequest('concurrent'))
    const endTime = Date.now()

    expect(res.status).toBe(200)
    expect(baiduCalled).toBe(true)
    expect(dictCalled).toBe(true)
    // Concurrent requests should complete in less than 2x individual delay
    expect(endTime - startTime).toBeLessThan(25)
  })

  it('handles words with special characters', async () => {
    const mockBaiduResponse = {
      trans_result: [{ src: "don't", dst: '不' }],
    }
    const mockDictResponse = [
      {
        word: "don't",
        phonetics: [],
        meanings: [],
      },
    ]

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockBaiduResponse,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDictResponse,
      } as Response)

    const res = await GET(getRequest("don't"))
    expect(res.status).toBe(200)
  })
})
