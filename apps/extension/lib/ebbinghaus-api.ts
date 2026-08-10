// Ebbinghaus API client
// Implements POST /words and GET /words endpoints per API_SPEC.md

import { fetchWithRetry } from '@/lib/fetch-with-retry'
import type { CreateCardInput } from '@ebbinghaus/shared'

// Re-export helper functions for backward compatibility
export { toFlashcardDTO } from '@/lib/to-flashcard-dto'
export { isValidApiKeyFormat } from '@/lib/validate-api-key'

export type FlashcardDTO = Omit<CreateCardInput, 'quality'>

export interface WordResponse {
  saved: boolean
  id: string
  message: string
}

export interface WordsListResponse {
  cards: Array<{
    id: string
    front: string
    back: string
    sourceUrl: string | null
    sourceTitle: string | null
    createdAt: string
  }>
  total?: number
  limit?: number
  offset?: number
}

export interface ApiError {
  error: string
  message: string
  retry_after?: number
}

const API_BASE = process.env.PLASMO_PUBLIC_API_BASE || 'http://localhost:3001'

export class EbbinghausAPI {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private get headers(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    }
  }

  async saveWord(wordData: FlashcardDTO): Promise<WordResponse> {
    const response = await fetchWithRetry(`${API_BASE}/api/extension/cards`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(wordData),
    })

    if (response.ok) {
      return await response.json()
    }

    // Handle error responses
    if (response.status === 401) {
      const error: ApiError = await response.json()
      throw new Error(`Unauthorized: ${error.message}`)
    }

    if (response.status === 429) {
      const error: ApiError = await response.json()
      throw new Error(`Rate limited. Retry after ${error.retry_after} seconds.`)
    }

    if (response.status === 500) {
      throw new Error('Server error. Please try again.')
    }

    throw new Error('Failed to save word')
  }

  async saveWords(words: FlashcardDTO[]): Promise<{ saved: boolean; count: number }> {
    const response = await fetchWithRetry(`${API_BASE}/api/extension/cards`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(words),
    })

    if (response.ok) {
      return await response.json()
    }

    // Handle error responses (same as single word save)
    if (response.status === 401) {
      const error: ApiError = await response.json()
      throw new Error(`Unauthorized: ${error.message}`)
    }

    if (response.status === 429) {
      const error: ApiError = await response.json()
      throw new Error(`Rate limited. Retry after ${error.retry_after} seconds.`)
    }

    if (response.status === 500) {
      throw new Error('Server error. Please try again.')
    }

    throw new Error('Failed to save words')
  }

  async listWords(limit = 50, offset = 0, source?: string): Promise<WordsListResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    })

    if (source) {
      params.set('source', source)
    }

    const response = await fetch(`${API_BASE}/api/extension/cards?${params}`, {
      headers: this.headers,
    })

    if (response.ok) {
      return await response.json()
    }

    throw new Error('Failed to fetch words')
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await this.listWords(1, 0, 'https://example.com')
      return true
    } catch {
      return false
    }
  }
}
