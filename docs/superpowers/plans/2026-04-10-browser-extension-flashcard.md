# Browser Extension Flashcard Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to create flashcards from any webpage via a Chrome browser extension, authenticated with API tokens generated in the web app.

**Architecture:** The server gains an `ApiToken` model (SHA-256 hashed tokens, never stored raw); `requireAuth` is extended to accept `Authorization: Bearer <token>` in addition to session cookies. Two CORS-enabled extension API routes (`/api/extension/cards`, `/api/extension/decks`) handle card creation and deck listing. The Chrome Manifest V3 extension popup auto-fills the front field from the page's selected text and sends authenticated requests to the user's server.

**Tech Stack:** Next.js 15 API routes, Prisma 7 + PostgreSQL, Node.js built-in `crypto`, Chrome Manifest V3, TypeScript, esbuild.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `prisma/schema.prisma` | Add `ApiToken` model |
| Create | `app/lib/token.ts` | Token generation + hashing utilities |
| Create | `app/lib/cors.ts` | CORS header helpers |
| Modify | `app/lib/api-helpers.ts` | Bearer token auth alongside session auth |
| Create | `app/api/tokens/route.ts` | List + create API tokens |
| Create | `app/api/tokens/[id]/route.ts` | Delete API token |
| Create | `app/api/extension/decks/route.ts` | List decks (CORS-enabled, token auth) |
| Create | `app/api/extension/cards/route.ts` | Create flashcard (CORS-enabled, token auth) |
| Create | `app/(pages)/settings/page.tsx` | Settings page (server component) |
| Create | `app/(pages)/settings/components/TokenManager.tsx` | Token CRUD UI (client component) |
| Modify | `app/(pages)/components/navigation.tsx` | Add Settings nav link |
| Create | `extension/manifest.json` | Chrome extension manifest v3 |
| Create | `extension/popup.html` | Extension popup container |
| Create | `extension/popup.ts` | Popup logic (setup + card creation) |
| Create | `extension/styles.css` | Popup styles |
| Create | `extension/package.json` | Extension dev dependencies |
| Create | `extension/build.js` | esbuild config |

---

## Task 1: Add ApiToken Model to Prisma Schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add `ApiToken` model and relation to `User`**

Open `prisma/schema.prisma`. Add `apiTokens ApiToken[]` to the `User` model relation list (after `outputPracticeLogs`), and append the new model at the end of the file:

```prisma
// In the User model, add:
  apiTokens   ApiToken[]  // API tokens for extension access

// New model at end of file:
model ApiToken {
  id          String    @id @default(cuid())
  name        String    // User-given label, e.g. "Chrome Extension"
  tokenHash   String    @unique // SHA-256 hash of the raw token
  lastUsedAt  DateTime?
  expiresAt   DateTime? // null = never expires
  createdAt   DateTime  @default(now())

  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("api_tokens")
}
```

- [ ] **Step 2: Run migration and regenerate client**

```bash
npx prisma migrate dev --name add-api-token
npx prisma generate
```

Expected: Migration file created in `prisma/migrations/`, Prisma client updated. No errors.

- [ ] **Step 3: Verify migration ran**

```bash
npx prisma studio
```

Check that the `api_tokens` table appears in Prisma Studio. Then close Studio (`Ctrl+C`).

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add ApiToken model for browser extension authentication"
```

---

## Task 2: Token Utilities + CORS Helpers

**Files:**
- Create: `app/lib/token.ts`
- Create: `app/lib/cors.ts`

- [ ] **Step 1: Create token utilities**

Create `app/lib/token.ts`:

```typescript
import { createHash, randomBytes } from 'crypto'

/** Returns a raw token string of the form `emb_<48 hex chars>`. Store this nowhere — return once to user. */
export function generateRawToken(): string {
  return 'emb_' + randomBytes(24).toString('hex')
}

/** SHA-256 hash of rawToken — safe to store in DB. */
export function hashToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex')
}
```

- [ ] **Step 2: Create CORS helpers**

Create `app/lib/cors.ts`:

```typescript
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
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
pnpm type-check 2>&1 | tail -20
```

Expected: No errors about the new files.

- [ ] **Step 4: Commit**

```bash
git add app/lib/token.ts app/lib/cors.ts
git commit -m "feat: add token utilities and CORS helpers"
```

---

## Task 3: Extend requireAuth to Support Bearer Token Auth

**Files:**
- Modify: `app/lib/api-helpers.ts`

- [ ] **Step 1: Rewrite `app/lib/api-helpers.ts`**

Replace the entire file with:

```typescript
import { NextResponse, NextRequest } from 'next/server'
import { auth } from './auth'
import { prisma } from './prisma'
import { hashToken } from './token'

/**
 * Require authentication for API routes.
 * Checks Bearer token first (for browser extension), then falls back to session cookie.
 * Returns userId if authenticated, or 401 NextResponse if not.
 *
 * Usage:
 * ```ts
 * export async function GET(request: NextRequest) {
 *   const userId = await requireAuth(request)
 *   if (userId instanceof NextResponse) return userId
 *   // use userId...
 * }
 * ```
 */
export async function requireAuth(
  request: NextRequest
): Promise<string | NextResponse<{ error: string }>> {
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const rawToken = authHeader.slice(7)
    const tokenHash = hashToken(rawToken)
    const apiToken = await prisma.apiToken.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true, expiresAt: true },
    })
    if (!apiToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    if (apiToken.expiresAt && apiToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 })
    }
    // Update lastUsedAt non-blocking
    prisma.apiToken
      .update({ where: { id: apiToken.id }, data: { lastUsedAt: new Date() } })
      .catch(() => {})
    return apiToken.userId
  }

  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return session.user.id
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm type-check 2>&1 | tail -20
```

Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add app/lib/api-helpers.ts
git commit -m "feat: extend requireAuth to support Bearer token authentication"
```

---

## Task 4: Token Management API

**Files:**
- Create: `app/api/tokens/route.ts`
- Create: `app/api/tokens/[id]/route.ts`

- [ ] **Step 1: Create list + create endpoint**

Create `app/api/tokens/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/app/lib/api-helpers'
import { prisma } from '@/app/lib/prisma'
import { generateRawToken, hashToken } from '@/app/lib/token'
import { z } from 'zod'

const createTokenSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
})

export async function GET(request: NextRequest) {
  const userId = await requireAuth(request)
  if (userId instanceof NextResponse) return userId

  const tokens = await prisma.apiToken.findMany({
    where: { userId },
    select: { id: true, name: true, lastUsedAt: true, expiresAt: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ tokens })
}

export async function POST(request: NextRequest) {
  const userId = await requireAuth(request)
  if (userId instanceof NextResponse) return userId

  const body = await request.json()
  const parsed = createTokenSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const rawToken = generateRawToken()
  const token = await prisma.apiToken.create({
    data: { name: parsed.data.name, tokenHash: hashToken(rawToken), userId },
    select: { id: true, name: true, createdAt: true },
  })

  // rawToken is returned ONCE and never stored — user must copy it now
  return NextResponse.json({ token: { ...token, rawToken } }, { status: 201 })
}
```

- [ ] **Step 2: Create delete endpoint**

Create `app/api/tokens/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/app/lib/api-helpers'
import { prisma } from '@/app/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireAuth(request)
  if (userId instanceof NextResponse) return userId

  const { id } = await params

  const token = await prisma.apiToken.findFirst({ where: { id, userId } })
  if (!token) {
    return NextResponse.json({ error: 'Token not found' }, { status: 404 })
  }

  await prisma.apiToken.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
pnpm type-check 2>&1 | tail -20
```

Expected: No errors.

- [ ] **Step 4: Test token creation with curl (dev server must be running: `pnpm dev`)**

First log in via browser at `http://localhost:3000/login` with `test@test.com` / `1234567890`. Copy the session cookie from browser DevTools → Application → Cookies → `better-auth.session_token`.

```bash
# Replace <SESSION_TOKEN> with the copied cookie value
curl -s -X POST http://localhost:3000/api/tokens \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=<SESSION_TOKEN>" \
  -d '{"name":"Chrome Extension"}' | jq .
```

Expected output:
```json
{
  "token": {
    "id": "...",
    "name": "Chrome Extension",
    "createdAt": "...",
    "rawToken": "emb_..."
  }
}
```

- [ ] **Step 5: Test Bearer token auth**

Copy the `rawToken` from above and test:

```bash
curl -s http://localhost:3000/api/tokens \
  -H "Authorization: Bearer <rawToken>" | jq .
```

Expected: `{ "tokens": [...] }` with the token you just created.

- [ ] **Step 6: Commit**

```bash
git add app/api/tokens/
git commit -m "feat: add API token management endpoints (create, list, delete)"
```

---

## Task 5: Extension-Facing API Routes (CORS-enabled)

**Files:**
- Create: `app/api/extension/decks/route.ts`
- Create: `app/api/extension/cards/route.ts`

- [ ] **Step 1: Create decks list endpoint**

Create `app/api/extension/decks/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/app/lib/api-helpers'
import { prisma } from '@/app/lib/prisma'
import { withCors, handleOptions } from '@/app/lib/cors'

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get('Origin')
  const userId = await requireAuth(request)
  if (userId instanceof NextResponse) return withCors(userId, origin)

  const decks = await prisma.deck.findMany({
    where: { userId, deletedAt: null },
    select: { id: true, title: true, color: true },
    orderBy: { title: 'asc' },
  })

  return withCors(NextResponse.json({ decks }), origin)
}
```

- [ ] **Step 2: Create card creation endpoint**

Create `app/api/extension/cards/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/app/lib/api-helpers'
import { prisma } from '@/app/lib/prisma'
import { withCors, handleOptions } from '@/app/lib/cors'
import { calculateInitialEaseFactor } from '@/app/lib/zod'
import { z } from 'zod'

const createExtensionCardSchema = z.object({
  front: z.string().min(1, 'Front is required'),
  back: z.string().min(1, 'Back is required'),
  note: z.string().optional(),
  deckId: z.string().optional(),
  quality: z.number().int().min(3).max(5).default(4),
})

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('Origin')
  const userId = await requireAuth(request)
  if (userId instanceof NextResponse) return withCors(userId, origin)

  const body = await request.json()
  const parsed = createExtensionCardSchema.safeParse(body)
  if (!parsed.success) {
    return withCors(
      NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 }),
      origin
    )
  }

  const { front, back, note, deckId, quality } = parsed.data

  if (deckId) {
    const deck = await prisma.deck.findFirst({ where: { id: deckId, userId, deletedAt: null } })
    if (!deck) {
      return withCors(NextResponse.json({ error: 'Invalid deck' }, { status: 400 }), origin)
    }
  }

  const card = await prisma.card.create({
    data: {
      front,
      back,
      note: note ?? null,
      userId,
      nextReviewAt: new Date(),
      interval: 0,
      easeFactor: calculateInitialEaseFactor(quality),
      repetitions: 0,
      state: 'NEW',
      ...(deckId && { cardDecks: { create: { deckId } } }),
    },
    select: { id: true, front: true, back: true, createdAt: true },
  })

  return withCors(NextResponse.json({ card }, { status: 201 }), origin)
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
pnpm type-check 2>&1 | tail -20
```

Expected: No errors.

- [ ] **Step 4: Test extension card creation with curl**

```bash
# Use the rawToken from Task 4 Step 4
curl -s -X POST http://localhost:3000/api/extension/cards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <rawToken>" \
  -d '{"front":"ephemeral","back":"lasting only for a short time","quality":4}' | jq .
```

Expected:
```json
{
  "card": {
    "id": "...",
    "front": "ephemeral",
    "back": "lasting only for a short time",
    "createdAt": "..."
  }
}
```

- [ ] **Step 5: Test CORS preflight**

```bash
curl -s -I -X OPTIONS http://localhost:3000/api/extension/cards \
  -H "Origin: chrome-extension://fakeid" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization"
```

Expected headers in response:
```
access-control-allow-origin: chrome-extension://fakeid
access-control-allow-methods: GET, POST, DELETE, OPTIONS
access-control-allow-headers: Content-Type, Authorization
```

- [ ] **Step 6: Commit**

```bash
git add app/api/extension/
git commit -m "feat: add CORS-enabled extension API routes for cards and decks"
```

---

## Task 6: Settings Page — Token Manager UI

**Files:**
- Create: `app/(pages)/settings/page.tsx`
- Create: `app/(pages)/settings/components/TokenManager.tsx`

- [ ] **Step 1: Create the Settings page (server component)**

Create `app/(pages)/settings/page.tsx`:

```typescript
import TokenManager from './components/TokenManager'

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
      <p className="text-gray-500 mb-8">Manage your account settings and API access.</p>
      <TokenManager />
    </div>
  )
}
```

- [ ] **Step 2: Create the TokenManager client component**

Create `app/(pages)/settings/components/TokenManager.tsx`:

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Copy, Check, Key } from 'lucide-react'

interface ApiToken {
  id: string
  name: string
  lastUsedAt: string | null
  createdAt: string
}

interface NewToken extends ApiToken {
  rawToken: string
}

export default function TokenManager() {
  const [tokens, setTokens] = useState<ApiToken[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [revealedToken, setRevealedToken] = useState<NewToken | null>(null)
  const [copied, setCopied] = useState(false)

  const fetchTokens = useCallback(async () => {
    const res = await fetch('/api/tokens')
    if (res.ok) {
      const data = await res.json()
      setTokens(data.tokens)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchTokens() }, [fetchTokens])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    const res = await fetch('/api/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    })
    if (res.ok) {
      const data = await res.json()
      setRevealedToken(data.token)
      setNewName('')
      setShowForm(false)
      fetchTokens()
    }
    setCreating(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this token? Any extension using it will stop working.')) return
    await fetch(`/api/tokens/${id}`, { method: 'DELETE' })
    setTokens(prev => prev.filter(t => t.id !== id))
  }

  async function handleCopy(text: string) {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">API Tokens</h2>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            New Token
          </button>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Use API tokens to authenticate the browser extension. Each token is shown only once — copy it immediately.
      </p>

      {/* New token revealed */}
      {revealedToken && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-semibold text-green-800 mb-1">
            Token "{revealedToken.name}" created — copy it now, it won't be shown again.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <code className="flex-1 text-xs bg-white border border-green-200 rounded px-3 py-2 break-all font-mono">
              {revealedToken.rawToken}
            </code>
            <button
              onClick={() => handleCopy(revealedToken.rawToken)}
              className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <button
            onClick={() => setRevealedToken(null)}
            className="mt-3 text-xs text-green-700 underline"
          >
            I've saved the token, dismiss
          </button>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 flex items-center gap-2">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Token name, e.g. Chrome Extension"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
          <button
            type="button"
            onClick={() => { setShowForm(false); setNewName('') }}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Token list */}
      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : tokens.length === 0 ? (
        <p className="text-sm text-gray-400">No tokens yet. Create one to use the browser extension.</p>
      ) : (
        <ul className="space-y-2">
          {tokens.map(token => (
            <li key={token.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
              <div>
                <p className="text-sm font-medium text-gray-900">{token.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Created {new Date(token.createdAt).toLocaleDateString()}
                  {token.lastUsedAt && ` · Last used ${new Date(token.lastUsedAt).toLocaleDateString()}`}
                </p>
              </div>
              <button
                onClick={() => handleDelete(token.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                title="Delete token"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
pnpm type-check 2>&1 | tail -20
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add app/(pages)/settings/
git commit -m "feat: add settings page with API token management UI"
```

---

## Task 7: Add Settings Link to Navigation

**Files:**
- Modify: `app/(pages)/components/navigation.tsx`

- [ ] **Step 1: Add Settings to navItems and iconMap**

In `app/(pages)/components/navigation.tsx`, add `Settings` to the lucide-react import and add a nav item:

```typescript
// Change the import line to include Settings:
import {
  LayoutDashboard,
  ClipboardCheck,
  BarChart3,
  AlertTriangle,
  Settings,
} from "lucide-react";

// In navItems array, add after the Dashboard entry:
{ href: "/settings", label: "Settings", icon: "Settings", badge: undefined },

// In iconMap, add:
Settings,
```

- [ ] **Step 2: Verify in browser**

Visit `http://localhost:3000/dashboard`. Confirm "Settings" appears in the sidebar. Click it — should navigate to `/settings` with the Token Manager visible.

- [ ] **Step 3: Commit**

```bash
git add app/(pages)/components/navigation.tsx
git commit -m "feat: add Settings link to sidebar navigation"
```

---

## Task 8: Browser Extension — Project Setup and Manifest

**Files:**
- Create: `extension/manifest.json`
- Create: `extension/package.json`
- Create: `extension/build.js`

- [ ] **Step 1: Create extension directory and package.json**

```bash
mkdir -p extension/dist
```

Create `extension/package.json`:

```json
{
  "name": "ebbinghaus-extension",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "node build.js",
    "dev": "node build.js --watch"
  },
  "devDependencies": {
    "@types/chrome": "^0.0.279",
    "esbuild": "^0.24.0",
    "typescript": "^5.0.0"
  }
}
```

- [ ] **Step 2: Install extension dev dependencies**

```bash
cd extension && npm install
```

Expected: `node_modules` created with esbuild and @types/chrome.

- [ ] **Step 3: Create esbuild config**

Create `extension/build.js`:

```javascript
const esbuild = require('esbuild')
const watch = process.argv.includes('--watch')

const config = {
  entryPoints: ['popup.ts'],
  bundle: true,
  outfile: 'dist/popup.js',
  platform: 'browser',
  target: 'chrome120',
}

if (watch) {
  esbuild.context(config).then(ctx => {
    ctx.watch()
    console.log('Watching for changes...')
  })
} else {
  esbuild.build(config).then(() => console.log('Build complete'))
}
```

- [ ] **Step 4: Create the manifest**

Create `extension/manifest.json`:

```json
{
  "manifest_version": 3,
  "name": "Ebbinghaus Memory",
  "version": "1.0.0",
  "description": "Add flashcards from any webpage to Ebbinghaus Memory.",
  "permissions": [
    "storage",
    "activeTab",
    "scripting"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_title": "Add Flashcard"
  },
  "icons": {
    "16": "icon16.png",
    "48": "icon48.png",
    "128": "icon128.png"
  }
}
```

> **Note:** The extension references icon files that don't exist yet. Chrome will show a placeholder — this is fine for development. Add real PNG icons before publishing to the store.

- [ ] **Step 5: Commit**

```bash
cd ..
git add extension/
git commit -m "feat: add browser extension project scaffold (manifest, build config)"
```

---

## Task 9: Browser Extension — Popup UI and Logic

**Files:**
- Create: `extension/popup.html`
- Create: `extension/styles.css`
- Create: `extension/popup.ts`

- [ ] **Step 1: Create popup.html**

Create `extension/popup.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ebbinghaus Memory</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div id="app">
    <!-- Setup screen -->
    <div id="screen-setup" class="screen hidden">
      <h1 class="title">Setup</h1>
      <p class="subtitle">Connect to your Ebbinghaus Memory server.</p>
      <form id="setup-form">
        <label class="label" for="serverUrl">Server URL</label>
        <input id="serverUrl" type="url" class="input" placeholder="https://your-app.vercel.app" required />

        <label class="label" for="apiToken">API Token</label>
        <input id="apiToken" type="password" class="input" placeholder="emb_..." required />
        <p class="hint">Generate a token at Settings → API Tokens in the web app.</p>

        <button type="submit" class="btn btn-primary" id="setup-btn">Save & Connect</button>
        <p id="setup-error" class="error hidden"></p>
      </form>
    </div>

    <!-- Card creation screen -->
    <div id="screen-create" class="screen hidden">
      <div class="header">
        <h1 class="title">Add Flashcard</h1>
        <button id="settings-btn" class="icon-btn" title="Settings">⚙</button>
      </div>
      <form id="create-form">
        <label class="label" for="front">Front</label>
        <textarea id="front" class="input textarea" placeholder="Word or question" rows="2" required></textarea>

        <label class="label" for="back">Back</label>
        <textarea id="back" class="input textarea" placeholder="Definition or answer" rows="3" required></textarea>

        <label class="label" for="note">Note (optional)</label>
        <input id="note" type="text" class="input" placeholder="Memory hint..." />

        <label class="label" for="deck">Deck</label>
        <select id="deck" class="input select">
          <option value="">No deck</option>
        </select>

        <label class="label">Difficulty</label>
        <div class="quality-group">
          <label class="quality-option">
            <input type="radio" name="quality" value="5" /> Easy
          </label>
          <label class="quality-option">
            <input type="radio" name="quality" value="4" checked /> Medium
          </label>
          <label class="quality-option">
            <input type="radio" name="quality" value="3" /> Hard
          </label>
        </div>

        <button type="submit" class="btn btn-primary" id="create-btn">Add Card</button>
        <p id="create-error" class="error hidden"></p>
        <p id="create-success" class="success hidden">Card added!</p>
      </form>
    </div>

    <!-- Loading screen -->
    <div id="screen-loading" class="screen">
      <p class="subtitle">Loading...</p>
    </div>
  </div>
  <script src="dist/popup.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create styles.css**

Create `extension/styles.css`:

```css
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 13px;
  width: 320px;
  min-height: 200px;
  background: #fff;
  color: #1a1a1a;
}

#app { padding: 16px; }

.screen { display: flex; flex-direction: column; gap: 8px; }
.hidden { display: none !important; }

.header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.title { font-size: 15px; font-weight: 600; color: #111; }
.subtitle { color: #666; font-size: 12px; }
.hint { color: #888; font-size: 11px; margin-top: -4px; }

.label { font-weight: 500; color: #444; font-size: 12px; margin-top: 8px; display: block; }

.input {
  width: 100%;
  padding: 7px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s;
}
.input:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.15); }
.textarea { resize: vertical; font-family: inherit; }
.select { background: white; cursor: pointer; }

.quality-group { display: flex; gap: 12px; margin-top: 2px; }
.quality-option { display: flex; align-items: center; gap: 4px; cursor: pointer; color: #555; }
.quality-option input { cursor: pointer; }

.btn {
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 12px;
  transition: background 0.15s;
}
.btn-primary { background: #2563eb; color: white; }
.btn-primary:hover { background: #1d4ed8; }
.btn-primary:disabled { background: #93c5fd; cursor: not-allowed; }

.icon-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #666;
  padding: 2px 4px;
  border-radius: 4px;
}
.icon-btn:hover { background: #f3f4f6; }

.error { color: #dc2626; font-size: 12px; margin-top: 6px; }
.success { color: #16a34a; font-size: 12px; margin-top: 6px; font-weight: 500; }
```

- [ ] **Step 3: Create popup.ts**

Create `extension/popup.ts`:

```typescript
interface StoredConfig {
  serverUrl: string
  token: string
}

interface Deck {
  id: string
  title: string
  color: string
}

// ---------- Helpers ----------

function show(id: string) {
  document.getElementById(id)!.classList.remove('hidden')
}
function hide(id: string) {
  document.getElementById(id)!.classList.add('hidden')
}
function el<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T
}

async function getConfig(): Promise<StoredConfig | null> {
  return new Promise(resolve => {
    chrome.storage.local.get(['serverUrl', 'token'], result => {
      if (result.serverUrl && result.token) {
        resolve({ serverUrl: result.serverUrl as string, token: result.token as string })
      } else {
        resolve(null)
      }
    })
  })
}

async function saveConfig(config: StoredConfig): Promise<void> {
  return new Promise(resolve => {
    chrome.storage.local.set(config, resolve)
  })
}

async function getSelectedText(): Promise<string> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab.id) return ''
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection()?.toString().trim() ?? '',
    })
    return (results[0]?.result as string) ?? ''
  } catch {
    return ''
  }
}

async function fetchDecks(config: StoredConfig): Promise<Deck[]> {
  const res = await fetch(`${config.serverUrl}/api/extension/decks`, {
    headers: { Authorization: `Bearer ${config.token}` },
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.decks ?? []
}

// ---------- Screens ----------

async function showSetupScreen() {
  hide('screen-loading')
  show('screen-setup')

  // Prefill from existing config if any
  const config = await getConfig()
  if (config) {
    el<HTMLInputElement>('serverUrl').value = config.serverUrl
    el<HTMLInputElement>('apiToken').value = config.token
  }

  el('setup-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    hide('setup-error')
    const serverUrl = el<HTMLInputElement>('serverUrl').value.replace(/\/$/, '')
    const token = el<HTMLInputElement>('apiToken').value.trim()
    const btn = el<HTMLButtonElement>('setup-btn')
    btn.disabled = true
    btn.textContent = 'Connecting...'

    // Validate by fetching decks
    try {
      const res = await fetch(`${serverUrl}/api/extension/decks`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`Server returned ${res.status}`)
      await saveConfig({ serverUrl, token })
      hide('screen-setup')
      await showCreateScreen({ serverUrl, token })
    } catch (err) {
      el('setup-error').textContent = `Connection failed: ${(err as Error).message}`
      show('setup-error')
      btn.disabled = false
      btn.textContent = 'Save & Connect'
    }
  })
}

async function showCreateScreen(config: StoredConfig) {
  hide('screen-loading')
  show('screen-create')

  // Load decks and selected text in parallel
  const [decks, selectedText] = await Promise.all([fetchDecks(config), getSelectedText()])

  // Populate deck selector
  const deckSelect = el<HTMLSelectElement>('deck')
  decks.forEach(deck => {
    const opt = document.createElement('option')
    opt.value = deck.id
    opt.textContent = deck.title
    deckSelect.appendChild(opt)
  })

  // Prefill front with selected text
  if (selectedText) {
    el<HTMLTextAreaElement>('front').value = selectedText
    el<HTMLTextAreaElement>('back').focus()
  } else {
    el<HTMLTextAreaElement>('front').focus()
  }

  // Settings button → go back to setup
  el('settings-btn').addEventListener('click', async () => {
    hide('screen-create')
    await showSetupScreen()
  })

  // Create card form
  el('create-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    hide('create-error')
    hide('create-success')
    const btn = el<HTMLButtonElement>('create-btn')
    btn.disabled = true
    btn.textContent = 'Adding...'

    const front = el<HTMLTextAreaElement>('front').value.trim()
    const back = el<HTMLTextAreaElement>('back').value.trim()
    const note = el<HTMLInputElement>('note').value.trim()
    const deckId = el<HTMLSelectElement>('deck').value
    const quality = parseInt(
      (document.querySelector('input[name="quality"]:checked') as HTMLInputElement)?.value ?? '4'
    )

    try {
      const res = await fetch(`${config.serverUrl}/api/extension/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.token}`,
        },
        body: JSON.stringify({ front, back, note: note || undefined, deckId: deckId || undefined, quality }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? `Server error ${res.status}`)
      }

      show('create-success')
      el<HTMLFormElement>('create-form').reset()
      // Restore default quality
      ;(document.querySelector('input[name="quality"][value="4"]') as HTMLInputElement).checked = true
    } catch (err) {
      el('create-error').textContent = (err as Error).message
      show('create-error')
    } finally {
      btn.disabled = false
      btn.textContent = 'Add Card'
    }
  })
}

// ---------- Init ----------

async function init() {
  show('screen-loading')
  const config = await getConfig()
  hide('screen-loading')

  if (!config) {
    await showSetupScreen()
  } else {
    await showCreateScreen(config)
  }
}

document.addEventListener('DOMContentLoaded', init)
```

- [ ] **Step 4: Build the extension**

```bash
cd extension && npm run build
```

Expected:
```
Build complete
```

Verify `extension/dist/popup.js` exists.

- [ ] **Step 5: Load extension in Chrome and test**

1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select the `/workspace/extension` directory
5. The extension should appear. Click its icon in the toolbar.
6. **First launch:** Setup screen appears. Enter `http://localhost:3000` and your API token (from Task 4). Click "Save & Connect".
7. **After setup:** Card creation screen appears. Select some text on any page, click the extension icon — the front field should be pre-filled.
8. Fill in back field, click "Add Card". Verify "Card added!" success message.
9. Check `http://localhost:3000/dashboard` — the new card should appear.

- [ ] **Step 6: Commit**

```bash
cd ..
git add extension/popup.html extension/styles.css extension/popup.ts extension/dist/
git commit -m "feat: implement browser extension popup with auth setup and card creation"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Browser login/token auth: Tasks 1-4 (ApiToken model + Bearer auth)
- ✅ CORS for extension origin: Tasks 2 + 5
- ✅ Extension-facing API (cards + decks): Task 5
- ✅ Token management UI: Task 6
- ✅ Settings nav link: Task 7
- ✅ Extension manifest + build: Task 8
- ✅ Extension popup with auth setup: Task 9
- ✅ Auto-fill from selected text: Task 9 (`getSelectedText`)
- ✅ Deck selection: Task 9 (populate select from API)

**Placeholder scan:** No TBDs, TODOs, or vague steps found.

**Type consistency:**
- `withCors` in `cors.ts` takes `NextResponse<T>` — used consistently in Tasks 3 and 5
- `requireAuth` returns `string | NextResponse<{ error: string }>` — all callers check `instanceof NextResponse`
- `calculateInitialEaseFactor` imported from `@/app/lib/zod` — same as existing actions.ts usage
