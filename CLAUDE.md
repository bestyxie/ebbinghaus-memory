# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ebbinghaus Memory - a spaced repetition flashcard app implementing the Ebbinghaus forgetting curve and SM-2 algorithm. Built with Next.js 15, Prisma, PostgreSQL, and NextAuth.

## Development Commands

```bash
# Development server (with Turbopack)
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Lint
pnpm lint

# type check
pnpm type-check

# Generate Prisma client (after schema changes)
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Open Prisma Studio (database GUI)
npx prisma studio

# Seed database
# Access via /app/seed/route.ts
```

## Architecture

### Tech Stack

- **Next.js 15** with App Router (using Turbopack for dev)
- **React 19** with TypeScript
- **Prisma 7** with PostgreSQL
- **NextAuth 5** (beta) for authentication
- **Tailwind CSS 4**
- **Zod** for validation

### Key Directories

- `app/(pages)/` - Route groups for authenticated pages
- `app/api/` - API routes
- `app/lib/` - Shared utilities (auth, prisma, srs-algorithm, dashboard-data, deck, types, zod, etc.)
- `app/components/` - Reusable components
- `prisma/` - Database schema and migrations
- `generated/` - Generated Prisma client (output directory, do not edit manually)
- `docs/` - Additional documentation for major features

### Dashboard

- Route: `/dashboard` - Main study dashboard
- Uses server/client component split pattern with React `<Suspense>` for streaming
- Components: `app/(pages)/dashboard/components/`
  - `stats-grid-server.tsx` - Server component: fetches stats with `unstable_cache` (5-min TTL)
  - `card-table-server.tsx` - Server component: fetches paginated cards via `dashboard-data.ts`
  - `filters-bar-server.tsx` - Server component: fetches decks, renders `FiltersBarClient`
  - `filters-bar-client.tsx` - Client component: interactive sort/deck dropdowns
  - `pagination-client.tsx` - Client component: page navigation
  - `card-row.tsx` - Individual card row in the table
  - `stats-card.tsx` - Single stat display card
  - `ai-memory-button.tsx` / `ai-memory-modal.tsx` - AI memory feature
- Data layer: `app/lib/dashboard-data.ts` - Card query logic used by `CardTableServer`

### Authentication Flow

- Uses NextAuth 5 (Better Auth) with Credentials provider
- Auth client exported from `app/lib/auth.ts`
- In server components/layouts: `auth.api.getSession({ headers: await headers() })`
- Single `/login` page handles both login and registration (via `register` boolean field)
- JWT session strategy
- Protected routes defined in `auth.config.ts`
- `proxy.ts` applies auth to all routes except `/api`, `_next/static`, `_next/image`, and `.png` files

### Database Schema (Prisma)

- **User** - User accounts with email/password
- **Deck** - Flashcard decks (folders for organizing cards)
- **Card** - Individual flashcards with SM-2 algorithm fields:
  - `nextReviewAt` - When card is due for review
  - `interval` - Current interval in days
  - `easeFactor` - Difficulty multiplier (default 2.5)
  - `repetitions` - Consecutive correct answers
  - `state` - NEW, LEARNING, REVIEW, or RELEARNING
- **ReviewLog** - Review history for analytics/heatmaps

### SM-2 Algorithm Fields

The Card model implements the SuperMemo-2 algorithm:

- `easeFactor`: Higher = easier to remember (interval grows faster)
- `interval`: Days until next review
- `repetitions`: Count of successful reviews
- `state`: Tracks learning phase (NEW → LEARNING → REVIEW → RELEARNING)

### Node Version

- Minimum: Node.js 20
- Use `.nvmrc` file for automatic version switching

### Environment Variables Required

- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - NextAuth secret (generate with `openssl rand -base64 32`)
