# Architecture

This document describes the high-level architecture of Ebbinghaus Memory.
If you want to familiarize yourself with the code base, you are just in the right place!

## Bird's Eye View

```
┌──────────────────────────────────────────────────────────┐
│                        Client                            │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌───────────┐  │
│  │Dashboard │ │ Review   │ │ Article   │ │ Settings  │  │
│  │  Page    │ │  Page    │ │  Editor   │ │   Page    │  │
│  └────┬─────┘ └────┬─────┘ └─────┬─────┘ └─────┬─────┘  │
│       │            │             │              │         │
│  ┌────┴────────────┴─────────────┴──────────────┴──────┐  │
│  │              Shared Components & Layout              │  │
│  └────────────────────┬────────────────────────────────┘  │
└───────────────────────┼──────────────────────────────────┘
                        │ HTTP / Server Actions
┌───────────────────────┼──────────────────────────────────┐
│                   Server / API                            │
│  ┌────────────┐  ┌─────┴──────┐  ┌──────────────────┐   │
│  │ Middleware  │  │ API Routes │  │ Server Actions   │   │
│  │ (Auth+CORS)│  │ (23 endpts)│  │ (auth, CRUD)     │   │
│  └────────────┘  └─────┬──────┘  └────────┬─────────┘   │
│                        │                   │              │
│  ┌─────────────────────┴───────────────────┴───────────┐  │
│  │                    app/lib/                          │  │
│  │  ┌──────────────┐  ┌──────────┐  ┌───────────────┐  │  │
│  │  │SRS Algorithm │  │  Auth    │  │ Dashboard Data│  │  │
│  │  │  (SM-2)      │  │ (better- │  │ (Raw SQL)     │  │  │
│  │  └──────────────┘  │  auth)   │  └───────────────┘  │  │
│  │  ┌──────────────┐  └──────────┘  ┌───────────────┐  │  │
│  │  │  AI (Zhipu)  │  ┌──────────┐  │ Validation    │  │  │
│  │  │  Exercises   │  │  Prisma  │  │ (Zod)         │  │  │
│  │  └──────────────┘  │  Client  │  └───────────────┘  │  │
│  │                    └────┬─────┘                      │  │
│  └─────────────────────────┼───────────────────────────┘  │
└────────────────────────────┼──────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │   PostgreSQL    │
                    │   Database      │
                    └─────────────────┘
```

On the highest level, Ebbinghaus Memory is a spaced repetition flashcard application that accepts user-created cards and produces optimized review schedules based on the Ebbinghaus forgetting curve.

More specifically, input data consists of flashcards (front/back Q&A pairs) and article cards (rich text with active recall blocks), organized into decks. Each card carries SM-2 algorithm state: interval, ease factor, repetitions, and a next-review date. The application computes when each card should be reviewed next, and generates AI-powered output exercises (fill-blank, word scramble, translation, contextual sentences) for language learning.

The server renders pages using React Server Components and handles mutations via API routes and server actions. The database is the sole source of truth -- there is no client-side state management library. The Prisma ORM (with raw SQL for performance-critical paths) communicates with PostgreSQL.

Users interact through a web browser, and a Chrome extension can also create cards via a CORS-enabled API using Bearer token authentication.


## Code Map

This section talks briefly about various important directories and data structures.
Pay attention to the **Architecture Invariant** sections.
They often talk about things which are deliberately absent in the source code.

Note also which layers are **API Boundaries**.
Remember, [rules at the boundary are different](https://www.tedinski.com/2018/02/06/system-boundaries.html).

### `app/` (Next.js App Router)

The `app/` directory is the heart of the application, following Next.js 15 App Router conventions. It contains all routes, layouts, pages, API endpoints, shared components, and library code.

The directory is organized into these layers:

- `(pages)/` -- route group for all authenticated pages, sharing a sidebar layout
- `login/`, `register/` -- public authentication pages outside the route group
- `api/` -- REST API endpoints (23 routes)
- `components/` -- shared UI components (editor, UI primitives)
- `lib/` -- business logic and utilities
- `layout.tsx` -- root layout

**Architecture Invariant:** the `app/` directory is the entire application. There is no separate `src/` directory. All server code, client code, and shared code live under `app/`.

### `app/lib/`

This is where all business logic and shared utilities live. It is the **most important** directory to understand.

**`srs-algorithm.ts`** implements the SuperMemo-2 (SM-2) spaced repetition algorithm. It is a pure function: given a card's current state and a user's quality rating, it returns the updated state (new interval, ease factor, repetitions, and next review date). The algorithm is stateless -- all persistent state lives in the database.

**`auth.ts`** configures better-auth with email/password authentication, 7-day sessions, PostgreSQL adapter with transactions, and the Next.js cookies plugin. It exports inferred `Session` and `User` types.

**`auth-actions.ts`** provides server actions for sign-in, sign-up, and sign-out with redirect behavior.

**`prisma.ts`** exports a singleton Prisma client. It uses the `globalThis` pattern to prevent multiple clients during development hot-reload.

**`dashboard-data.ts`** fetches dashboard card data using raw SQL with window functions for pagination. This was a deliberate performance optimization: a single raw SQL query replaced multiple Prisma calls, achieving a 444x speedup (10s to 23ms). It uses `React.cache` for request deduplication within a single server render.

**`api-helpers.ts`** provides `requireAuth()` -- a dual-path authentication guard for API routes. It checks Bearer tokens first (for the Chrome extension), then falls back to session cookies. Returns a `userId` string on success or a 401 response on failure.

**`output-exercises.ts`** generates AI-powered exercises using the Vercel AI SDK with a Zhipu GLM-4 provider. Exercises have four progressive difficulty levels.

**`zod.ts`** defines Zod validation schemas for all API inputs: authentication, card creation/editing, deck management, article cards, and AI generation requests.

**`types.ts`** contains comprehensive TypeScript type definitions: card types (`FLASHCARD | ARTICLE`), card states (`NEW | LEARNING | REVIEW | RELEARNING`), review modes, output exercise levels, and API response shapes.

**`text-analysis.ts`** provides natural language processing utilities: word counting (excluding Markdown syntax), reading time estimation at 220 WPM, and Flesch Reading Ease scoring.

**`token.ts`** handles API token generation and hashing. Tokens use a `emb_` prefix with 24 random bytes, stored as SHA-256 hashes.

**`ai.ts`** configures the AI provider (Zhipu GLM-4) for memory text generation assistance.

**Architecture Invariant:** library functions in `app/lib/` are pure and composable. They do not import React or Next.js primitives (except `auth.ts` which needs the cookies plugin, and `dashboard-data.ts` which uses `React.cache`). Business logic has no knowledge of HTTP -- that is the API layer's job.

**Architecture Invariant:** `srs-algorithm.ts` is a pure function with no side effects. It does not touch the database, the network, or any global state. All it does is math. This makes it trivially testable.

### `prisma/`

Database schema and migrations. The schema defines the entire data model.

**`schema.prisma`** contains 9 models:

- **User** -- the root entity. Has unique email. Owns decks, cards, logs, and API tokens.
- **Session** -- better-auth managed sessions with 7-day expiry.
- **Account** -- better-auth managed credential storage.
- **Verification** -- email verification tokens.
- **Deck** -- card organization with color coding, soft delete (`deletedAt`), and unique title per user.
- **Card** -- the core entity. Supports two card types (`FLASHCARD`, `ARTICLE`). Carries full SM-2 state for both the input track and the output track (dual-track system). Has indexes on `(userId, nextReviewAt)`, `(userId, createdAt)`, and `(userId, easeFactor)`.
- **CardDeck** -- many-to-many junction table with cascade delete.
- **OutputExercise** -- caches AI-generated exercises for a card. Contains fill-blank templates, word lists, standard answers, and context prompts.
- **OutputPracticeLog** -- records exercise attempts with AI evaluation scores (vocab, grammar, native expression).
- **ReviewLog** -- records every review with rating, time spent, and a snapshot of SM-2 state before and after.
- **ApiToken** -- hashed tokens for extension access with optional expiration.

**Architecture Invariant:** the Card model carries all SM-2 state as flat columns, not as a JSON blob. This allows indexed queries on `nextReviewAt` and `easeFactor` for efficient review queue and difficulty sorting.

**Architecture Invariant:** the dual-track system stores independent SM-2 state per track. The output track (`outputInterval`, `outputEaseFactor`, `outputRepetitions`, `outputNextReviewAt`) is `null` until activated (after 3 consecutive correct input reviews).

### `middleware.ts`

The middleware serves two purposes:

1. **CORS handling** for extension API routes (`/api/dictionary`, `/api/extension`).
2. **Authentication gate** for page routes. Public routes (`/login`, `/register`) are accessible to everyone. Unauthenticated users are redirected to `/login`. Authenticated users are redirected away from login/register pages.

**Architecture Invariant:** the middleware does not protect API routes. API authentication is handled by `requireAuth()` in each route handler. This separation exists because API routes need to support both cookie sessions and Bearer tokens.

### `app/(pages)/`

The route group for all authenticated pages. Shares a common layout with a sidebar.

**`dashboard/`** -- the main page. Server component that renders card tables with sorting, filtering, pagination. Contains 28 co-located components for card creation, editing, batch operations, and statistics.

**`review/`** -- the review session page. Implements the dual-track review flow: input track (flashcard Q&A) and output track (AI exercises with 4 progressive levels). Contains 12 co-located components including exercise-specific views.

**`article-editor/`** -- the article card editor. Uses a Tiptap-based rich text editor with custom extensions for highlighting, text alignment, and recall blocks.

**`settings/`** -- application settings including API token management for browser extension integration.

**`components/`** -- shared page-level components: sidebar, navigation, deck/tag section, sign-out button.

**Architecture Invariant:** dashboard page uses React Server Components for data fetching. The review page uses client components for interactive state (card flipping, rating, timers). Server and client component boundaries are deliberate: server components for data, client components for interactivity.

### `app/api/`

REST API endpoints. 23 routes organized by domain:

**Cards** (`/api/cards/`): CRUD operations, batch delete, paginated listing with filters. The paginated listing at `/api/dashboard/cards` uses the optimized raw SQL from `dashboard-data.ts`.

**Decks** (`/api/decks/`): CRUD with soft delete, deck listing with card counts. Creation uses a database transaction.

**Review** (`/api/review/`): Fetches the review queue (dual-track -- a card is due if either track is due). Submits ratings and updates SM-2 state. Article review is handled separately at `/api/article-review/`.

**Article Cards** (`/api/article-cards/`): CRUD with metrics (word count, reading time). Recall block updates at `/api/article-cards/[id]/recall-blocks`.

**Output Exercises** (`/api/output-exercises/`): Generates AI exercises and evaluates user answers. Exercise difficulty is determined by the card's output track repetitions.

**Extension** (`/api/extension/`): CORS-enabled endpoints for the Chrome extension. Card CRUD, deck listing, and dictionary lookup (Baidu + Free Dictionary APIs).

**AI** (`/api/ai/`): Memory text generation assistance.

**Tokens** (`/api/tokens/`): API token lifecycle management.

**Architecture Invariant:** every API route calls `requireAuth()` as its first action. There is no route-level middleware for API auth. This is intentional: API routes support two auth mechanisms (cookie and token) that require different handling.

**Architecture Invariant:** API routes return JSON. They do not render HTML. Page routes render HTML. This boundary is strict.

### `app/components/`

Shared components used across multiple pages.

**`editor/`** -- Tiptap-based rich text editor with bubble menu, fixed toolbar, and HTML renderer. Uses DOMPurify for sanitization. Custom extensions support colored highlights, text alignment, underline, and placeholders.

**`ui/`** -- low-level UI primitives (dropdown, popconfirm).

**`tags-modal.tsx`** -- deck selection modal.

**Architecture Invariant:** the editor component is the only place that handles rich text input. All article content passes through DOMPurify sanitization before rendering. This prevents XSS from user-generated HTML.

### `app/(pages)/layout.tsx`

The authenticated layout. A simple flex container with a `Sidebar` and a scrollable `<main>` area.

**Architecture Invariant:** all authenticated pages share this layout. There is no page-level layout override. The sidebar is always visible.

### `app/login/`, `app/register/`

Public authentication pages. Outside the `(pages)/` route group, so they do not get the sidebar layout. Each contains a server component page and a client component form.

### `public/`

Static assets served directly by Next.js.

### `docs/`

Project documentation (15 files covering features, e2e testing, review flow, etc.).

### `tests/`

End-to-end tests using Playwright.

### Configuration Files

**`next.config.ts`** -- minimal Next.js configuration.
**`tsconfig.json`** -- TypeScript with strict mode, `@/*` path alias, ES2017 target.
**`middleware.ts`** -- auth gate and CORS handling (described above).
**`postcss.config.mjs`** -- PostCSS with Tailwind CSS 4.
**`playwright.config.ts`** -- E2E test configuration.
**`vitest.config.ts`** -- Unit test configuration.


## Cross-Cutting Concerns

This section talks about things which are everywhere and nowhere in particular.

### The SM-2 Algorithm

The SuperMemo-2 algorithm is the mathematical heart of the application. It lives in `app/lib/srs-algorithm.ts` as a single pure function:

```
interval:  0 → 1 day,  1 → 6 days,  2+ → interval × easeFactor
easeFactor: EF + (0.1 - (5 - quality) × (0.08 + (5 - quality) × 0.02))
minimum EF: 1.3
```

Quality ratings: 0-5 (5 = perfect, < 3 = forgotten). In practice, the UI maps a 4-point scale (Again / Hard / Good / Easy) to SM-2 quality scores.

**The Dual-Track System.** Each card maintains two independent SM-2 state machines:

1. **Input track** -- active immediately. Traditional flashcard review (see front, recall back).
2. **Output track** -- activates after the input track reaches 3 consecutive correct reviews. Generates AI exercises at 4 progressive difficulty levels: fill-blank, word scramble, translation, contextual sentence creation.

A card appears in the review queue if either track is due. The input track is always prioritized.

### Authentication

The application uses `better-auth` for authentication, configured in `app/lib/auth.ts`.

Authentication flows through three layers:

1. **Middleware** (`middleware.ts`) -- protects page routes by checking the session via `/api/auth/get-session`.
2. **API helpers** (`app/lib/api-helpers.ts`) -- protects API routes via `requireAuth()`, supporting both cookie sessions and Bearer tokens.
3. **Server actions** (`app/lib/auth-actions.ts`) -- handle sign-in, sign-up, and sign-out with redirect behavior.

Sessions last 7 days with a 1-day update window. Cookie caching is enabled with a 5-minute max-age for fast session reads.

**Architecture Invariant:** there is no custom auth code. All authentication logic delegates to `better-auth`. The application only configures it and consumes its APIs.

### Data Fetching

The application uses three data fetching patterns, each appropriate to its context:

1. **React Server Components** -- the dashboard page fetches data directly via `getCardsData()` (which uses raw SQL). This avoids an extra HTTP round-trip and enables streaming.

2. **API Routes** -- the review page and other client components fetch from API endpoints. This is necessary for interactive features that run entirely in the browser.

3. **Server Actions** -- mutations (create card, submit review) use Next.js server actions with `revalidatePath()` for optimistic cache invalidation.

**Architecture Invariant:** the `dashboard-data.ts` module uses raw SQL, not Prisma's query builder. This was a deliberate choice after Prisma queries proved 444x slower for the paginated dashboard query. Raw SQL is used only where performance demands it; all other database access uses Prisma.

### Validation

All external input is validated using Zod schemas defined in `app/lib/zod.ts`. Each API route and server action validates its input against the appropriate schema before processing.

Schemas exist for: sign-in/sign-up, card creation/editing, deck CRUD, article card CRUD, recall blocks, and AI generation requests.

**Architecture Invariant:** validation happens at the boundary. Business logic functions in `app/lib/` trust that their inputs are already validated. They do not re-validate.

### AI Integration

The application integrates with Zhipu GLM-4 for:

1. **Output exercise generation** -- given a flashcard's front/back, generate fill-blank, word scramble, translation, and contextual sentence exercises with structured output.
2. **Exercise evaluation** -- for Level 3-4 exercises, the AI evaluates user answers on vocabulary usage, grammar correctness, and native expression quality.
3. **Memory text generation** -- assistance for creating card content.

AI-generated exercises are cached in the `OutputExercise` table. A card gets one exercise record that is reused across sessions.

### Error Handling

**Architecture Invariant:** API routes follow a consistent error pattern: `requireAuth()` returns a 401 on auth failure, validation returns 400, unexpected errors return 500. All error responses are `{ error: string }` JSON objects.

The application does not use a global error boundary for API routes. Each route handles its own errors. Page-level errors are handled by Next.js error boundaries.

### Testing

The project uses two testing frameworks:

- **Playwright** (`tests/e2e/`) -- end-to-end browser tests covering review flow, card management, and rich text editing.
- **Vitest** (`__tests__/`) -- unit tests for isolated logic like the SRS algorithm.

The SRS algorithm is particularly well-suited for unit testing because it is a pure function: given the same input, it always produces the same output, with no mocks needed.

**Architecture Invariant:** E2E tests use a real database and a running server. There are no mocked API routes in the test suite. Tests create real cards and verify real database state.

### Performance Optimizations

1. **Raw SQL with window functions** for the dashboard query (`dashboard-data.ts`). A single query fetches paginated cards with total count using `COUNT(*) OVER()`, replacing multiple Prisma queries.

2. **`React.cache`** for request deduplication within a single server render pass.

3. **Database indexes** on frequently queried columns: `(userId, nextReviewAt)` for review queue, `(userId, createdAt)` for temporal sorting, `(userId, easeFactor)` for difficulty sorting.

4. **Exercise caching** -- AI-generated exercises are stored in the database and reused rather than regenerated on each review.
