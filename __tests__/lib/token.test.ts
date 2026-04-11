import { describe, it, expect } from 'vitest'
import { generateRawToken, hashToken } from '@/app/lib/token'

describe('generateRawToken', () => {
  it('starts with emb_ prefix', () => {
    expect(generateRawToken()).toMatch(/^emb_/)
  })

  it('has correct format: emb_ + 48 hex chars', () => {
    expect(generateRawToken()).toMatch(/^emb_[0-9a-f]{48}$/)
  })

  it('generates unique tokens on each call', () => {
    expect(generateRawToken()).not.toBe(generateRawToken())
  })
})

describe('hashToken', () => {
  it('returns a 64-character hex string (SHA-256)', () => {
    expect(hashToken('emb_abc')).toMatch(/^[0-9a-f]{64}$/)
  })

  it('is deterministic for the same input', () => {
    const token = 'emb_test_token_123'
    expect(hashToken(token)).toBe(hashToken(token))
  })

  it('returns different hashes for different inputs', () => {
    expect(hashToken('emb_aaa')).not.toBe(hashToken('emb_bbb'))
  })
})
