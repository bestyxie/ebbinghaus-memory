import { NextRequest, NextResponse } from 'next/server'

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

function getAllowedOrigin(origin: string | null): string | null {
  if (!origin) return null
  if (origin.startsWith('chrome-extension://')) return origin
  if (origin.startsWith('moz-extension://')) return origin
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  if (origin === appUrl) return origin
  return null
}

export function withCors<T>(response: NextResponse<T>, origin: string | null): NextResponse<T> {
  const allowed = getAllowedOrigin(origin)
  if (allowed) {
    response.headers.set('Access-Control-Allow-Origin', allowed)
    for (const [key, val] of Object.entries(CORS_HEADERS)) {
      response.headers.set(key, val)
    }
  }
  return response
}

export function handleOptions(request: NextRequest): NextResponse {
  const origin = request.headers.get('Origin')
  const response = new NextResponse(null, { status: 204 })
  return withCors(response, origin)
}
