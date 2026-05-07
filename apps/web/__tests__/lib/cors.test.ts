import { describe, it, expect } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { withCors, handleOptions } from '@/app/lib/cors'

function makeResponse() {
  return NextResponse.json({ ok: true })
}

describe('withCors', () => {
  it('adds CORS headers for chrome-extension:// origin', () => {
    const origin = 'chrome-extension://abcdefghijklmnop'
    const res = withCors(makeResponse(), origin)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(origin)
    expect(res.headers.get('Access-Control-Allow-Methods')).toBeTruthy()
    expect(res.headers.get('Access-Control-Allow-Headers')).toContain('Authorization')
  })

  it('adds CORS headers for moz-extension:// origin', () => {
    const origin = 'moz-extension://abcdefghijklmnop'
    const res = withCors(makeResponse(), origin)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(origin)
  })

  it('adds CORS headers for the app URL', () => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const res = withCors(makeResponse(), appUrl)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(appUrl)
  })

  it('does not add CORS headers for an unknown origin', () => {
    const res = withCors(makeResponse(), 'https://evil.com')
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })

  it('does not add CORS headers for null origin', () => {
    const res = withCors(makeResponse(), null)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })

  it('preserves the existing response body', async () => {
    const res = withCors(makeResponse(), 'chrome-extension://abc')
    expect(await res.json()).toEqual({ ok: true })
  })
})

describe('handleOptions', () => {
  it('returns 204 status', () => {
    const req = new NextRequest('http://localhost/api/extension/cards', { method: 'OPTIONS' })
    const res = handleOptions(req)
    expect(res.status).toBe(204)
  })

  it('adds CORS headers when origin is an extension', () => {
    const origin = 'chrome-extension://testid'
    const req = new NextRequest('http://localhost/api/extension/cards', {
      method: 'OPTIONS',
      headers: { Origin: origin },
    })
    const res = handleOptions(req)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(origin)
    expect(res.headers.get('Access-Control-Allow-Headers')).toContain('Authorization')
  })

  it('does not add CORS headers when origin is unknown', () => {
    const req = new NextRequest('http://localhost/api/extension/cards', {
      method: 'OPTIONS',
      headers: { Origin: 'https://evil.com' },
    })
    const res = handleOptions(req)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })
})
