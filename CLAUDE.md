# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ebbinghaus Memory - a spaced repetition flashcard app implementing the Ebbinghaus forgetting curve and SM-2 algorithm. Built with Next.js 15, Prisma, PostgreSQL, and better-auth.

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

```

## Architecture

### Tech Stack

- **Next.js 15** with App Router (using Turbopack for dev)
- **React 19** with TypeScript
- **Prisma 7** with PostgreSQL
- **better-auth** 1.5.3 for authentication
- **Tailwind CSS 4**
- **Zod** for validation

### Caveat

- The `Tag` interface (`{ id, name, color }`) maps to the `Deck` model fields: `id → id`, `name → title`, `color → color`
