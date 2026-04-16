# Dashboard Text Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add text search functionality to the dashboard that filters cards by their `front` field content, triggered by Enter key with a clear button.

**Architecture:** Client-side search input component that updates URL params, server-side SQL `ILIKE` filtering in the data fetching layer, following the existing filter pattern (deck/sort filters).

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Prisma raw SQL, lucide-react icons, Tailwind CSS 4

---

## File Structure

| File | Responsibility |
|------|----------------|
| `app/(pages)/dashboard/components/search-input.tsx` | Client component with controlled input, Enter key handler, X button to clear |
| `app/lib/dashboard-data.ts` | Add `searchTerm` parameter, modify SQL queries with `ILIKE` filter |
| `app/(pages)/dashboard/page.tsx` | Read `search` from searchParams, pass to server components |
| `app/(pages)/dashboard/components/card-table-server.tsx` | Pass `searchTerm` to `getCardsData` |
| `app/(pages)/dashboard/components/filters-bar-server.tsx` | Include `SearchInput` in filter bar layout |

---

## Task 1: Update dashboard-data.ts to support search

**Files:**
- Modify: `app/lib/dashboard-data.ts:7-12, 20-153`

- [ ] **Step 1: Add searchTerm to GetCardsOptions interface**

Add `searchTerm?: string` to the interface:

```typescript
interface GetCardsOptions {
  sortBy: SortOption;
  deckId: string | null;
  page: number;
  limit?: number;
  searchTerm?: string;  // Add this line
}
```

- [ ] **Step 2: Update SQL queries to include ILIKE filter**

Modify all 6 SQL query branches to add the search term filter. For each query, add:
- `AND c.front ILIKE ${searchTerm}` to the WHERE clause
- Handle the case where `searchTerm` is undefined (no filter)

Example for the first query (deckId + sortBy === 'createdAt'):

```typescript
if (deckId) {
  if (sortBy === 'createdAt') {
    const searchPattern = searchTerm ? `%${searchTerm}%` : '%';
    rawCards = await prisma.$queryRaw<RawCardResult[]>`
      SELECT
        c.id, c.front, c.back, c.note, c."nextReviewAt", c.interval, c."easeFactor",
        c.repetitions, c."outputRepetitions", c."outputInterval", c."outputEaseFactor", c."outputNextReviewAt",
        c.state, c."userId", c."createdAt", c."updatedAt", c."cardType",
        d.id as "deckId", d.title as "deckTitle", d.color as "deckColor",
        COUNT(*) OVER()::int as total_count
      FROM "Card" c
      INNER JOIN "CardDeck" cd ON cd."cardId" = c.id AND cd."deckId" = ${deckId}
      LEFT JOIN "Deck" d ON d.id = cd."deckId" AND d."deletedAt" IS NULL
      WHERE c."userId" = ${userId}
        AND c.front ILIKE ${searchPattern}
      ORDER BY c."createdAt" ASC
      LIMIT ${limit} OFFSET ${skip}
    `;
```

Apply the same pattern to the other 5 query branches:
- `deckId` + `sortBy === 'easeFactor'`
- `deckId` + `sortBy === 'nextReviewAt'` (default)
- No `deckId` + `sortBy === 'createdAt'`
- No `deckId` + `sortBy === 'easeFactor'`
- No `deckId` + `sortBy === 'nextReviewAt'` (default)

- [ ] **Step 3: Verify type check passes**

Run: `pnpm type-check`

Expected: No TypeScript errors

- [ ] **Step 4: Commit data layer changes**

```bash
git add app/lib/dashboard-data.ts
git commit -m "feat: add searchTerm parameter to getCardsData

Add optional searchTerm parameter to GetCardsOptions interface.
Update all 6 SQL query branches to filter cards by front field
using ILIKE pattern matching.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 2: Create SearchInput client component

**Files:**
- Create: `app/(pages)/dashboard/components/search-input.tsx`

- [ ] **Step 1: Create the SearchInput component**

Create the file with the following implementation:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';

export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get('search') || '';
  const [inputValue, setInputValue] = useState(currentSearch);

  // Keep input in sync with URL
  useEffect(() => {
    setInputValue(currentSearch);
  }, [currentSearch]);

  const handleSearch = () => {
    const trimmed = inputValue.trim();
    if (trimmed.length < 2) {
      return; // Don't search for terms < 2 chars
    }

    const params = new URLSearchParams(searchParams.toString());
    // Clear deck and sort filters when searching
    params.delete('deckId');
    params.delete('sortBy');
    params.set('search', trimmed);
    params.set('page', '1');

    router.push(`/dashboard?${params.toString()}`);
  };

  const handleClear = () => {
    setInputValue('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    params.set('page', '1');

    router.push(`/dashboard?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const hasValue = inputValue.length > 0;

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search cards..."
          className="w-64 pl-9 pr-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
        />
        {hasValue && (
          <button
            onClick={handleClear}
            className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify type check passes**

Run: `pnpm type-check`

Expected: No TypeScript errors

- [ ] **Step 3: Commit SearchInput component**

```bash
git add app/(pages)/dashboard/components/search-input.tsx
git commit -m "feat: add SearchInput client component

Add controlled search input with Enter key trigger.
Search term updates URL params and clears deck/sort filters.
X button clears search and restores previous filters.
Input value stays in sync with URL search param.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 3: Integrate SearchInput into filters bar

**Files:**
- Modify: `app/(pages)/dashboard/components/filters-bar-server.tsx:1,32-37`

- [ ] **Step 1: Import SearchInput component**

Add the import at the top of the file:

```typescript
import { FiltersBarClient } from './filters-bar-client';
import { SearchInput } from './search-input';  // Add this line
import { getUserDecks } from '@/app/lib/deck';
import { auth } from '@/app/lib/auth';
import { headers } from 'next/headers';
import { Filter } from 'lucide-react';
```

- [ ] **Step 2: Add SearchInput to the JSX**

Add the SearchInput component before FiltersBarClient:

```typescript
export async function FiltersBarServer({ currentSortBy, currentDeckId }: FiltersBarServerProps) {
  const header = await headers();
  const session = await auth.api.getSession({ headers: header });
  const decks = await getUserDecks(session?.user?.id || '');

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
        <Filter className="h-4 w-4 text-slate-500" />
        <span className="text-xs font-bold uppercase tracking-tight text-slate-500">Filters</span>
      </div>

      <SearchInput />  {/* Add this line */}

      <FiltersBarClient
        sortOptions={sortOptions}
        currentSortBy={currentSortBy}
        decks={decks}
        currentDeckId={currentDeckId}
      />
    </div>
  );
}
```

- [ ] **Step 3: Verify type check passes**

Run: `pnpm type-check`

Expected: No TypeScript errors

- [ ] **Step 4: Commit filter bar integration**

```bash
git add app/(pages)/dashboard/components/filters-bar-server.tsx
git commit -m "feat: add SearchInput to filters bar

Integrate SearchInput component into the dashboard filter bar.
Positioned before the existing deck/sort filters.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 4: Update page.tsx to read search param

**Files:**
- Modify: `app/(pages)/dashboard/page.tsx:11-18,36-41,73-75`

- [ ] **Step 1: Add search to DashboardPageProps interface**

Update the interface to include `search`:

```typescript
interface DashboardPageProps {
  searchParams: Promise<{
    sortBy?: string;
    deckId?: string;
    page?: string;
    search?: string;  // Add this line
  }>;
}
```

- [ ] **Step 2: Parse search from searchParams**

Add the search param parsing:

```typescript
export default async function DashboardPage(props: DashboardPageProps) {
  const searchParams = await props.searchParams;

  // Parse and validate search params
  const sortBy = (searchParams.sortBy || 'nextReviewAt') as SortOption;
  const deckId = searchParams.deckId || null;
  const page = parseInt(searchParams.page || '1', 10);
  const search = searchParams.search || null;  // Add this line
```

- [ ] **Step 3: Pass search to CardTableServer**

Update the CardTableServer component call:

```typescript
<Suspense fallback={<div className="h-64" />}>
  <CardTableServer
    currentPage={page}
    sortBy={sortBy}
    deckId={deckId}
    search={search}  // Add this line
  />
</Suspense>
```

- [ ] **Step 4: Verify type check passes**

Run: `pnpm type-check`

Expected: No TypeScript errors

- [ ] **Step 5: Commit page.tsx changes**

```bash
git add app/(pages)/dashboard/page.tsx
git commit -m "feat: read search param from URL in dashboard page

Parse search from searchParams and pass to CardTableServer.
Maintains existing filter (deck/sort) and pagination logic.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 5: Update CardTableServer to pass searchTerm

**Files:**
- Modify: `app/(pages)/dashboard/components/card-table-server.tsx:7-13,32,44`

- [ ] **Step 1: Add search prop to CardTableServerProps interface**

Update the interface:

```typescript
interface CardTableServerProps {
  currentPage: number;
  sortBy: SortOption;
  deckId: string | null;
  search: string | null;  // Add this line
}
```

- [ ] **Step 2: Destructure search from props**

Update the component signature:

```typescript
export async function CardTableServer({ currentPage, sortBy, deckId, search }: CardTableServerProps) {
```

- [ ] **Step 3: Pass search to getCardsData**

Update the getCardsData call:

```typescript
const cardsData = await getCardsData(session.user.id, {
  sortBy,
  deckId,
  page: currentPage,
  searchTerm: search  // Add this line
});
```

- [ ] **Step 4: Update empty state message for search**

When search is active and no results, show a more specific message:

```typescript
if (cards.length === 0) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-12 text-center">
      <p className="text-slate-500">
        {search
          ? `No cards match "${search}". Try a different search term.`
          : 'No cards found. Create your first card to get started!'}
      </p>
    </div>
  );
}
```

- [ ] **Step 5: Verify type check passes**

Run: `pnpm type-check`

Expected: No TypeScript errors

- [ ] **Step 6: Commit CardTableServer changes**

```bash
git add app/(pages)/dashboard/components/card-table-server.tsx
git commit -m "feat: pass search term to getCardsData in CardTableServer

Add search prop to CardTableServerProps and pass searchTerm to getCardsData.
Update empty state message to show search-specific hint when searching.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 6: Manual testing and verification

- [ ] **Step 1: Start development server**

Run: `pnpm dev`

Expected: Server starts at http://localhost:3000

- [ ] **Step 2: Test search input appears**

Navigate to `/dashboard` and verify:
- Search input is visible in the filter bar
- Search icon is visible on the left
- Placeholder text says "Search cards..."

- [ ] **Step 3: Test Enter key search**

1. Type "test" in the search input
2. Press Enter
3. Verify URL updates to `/dashboard?search=test&page=1`
4. Verify deck/sort filters are cleared from URL
5. Verify input still shows "test"
6. Verify cards are filtered (if any match)

- [ ] **Step 4: Test X button clear**

1. With search active (showing results)
2. Click the X button
3. Verify URL no longer has `search` param
4. Verify input is cleared
5. Verify page resets to page 1

- [ ] **Step 5: Test minimum 2 characters**

1. Type "a" (1 character)
2. Press Enter
3. Verify URL does NOT update
4. Verify no search occurs

- [ ] **Step 6: Test search persistence**

1. Search for "react"
2. Navigate to page 2 (if available)
3. Verify search term remains in URL
4. Verify input still shows "react"
5. Verify results are still filtered

- [ ] **Step 7: Test no results message**

1. Search for a term that definitely has no matches (e.g., "xyznonexistent123")
2. Verify message shows: `No cards match "xyznonexistent123". Try a different search term.`

- [ ] **Step 8: Test URL sharing**

1. Search for "react"
2. Copy the URL (e.g., `/dashboard?search=react&page=1`)
3. Open URL in a new tab/private window
4. Verify search input is pre-filled with "react"
5. Verify results show filtered cards

- [ ] **Step 9: Verify TypeScript compilation**

Run: `pnpm type-check`

Expected: No errors

- [ ] **Step 10: Lint check**

Run: `pnpm lint`

Expected: No errors (or only auto-fixable warnings)

- [ ] **Step 11: Final commit for any fixes**

If any issues were found and fixed during testing:

```bash
git add -A
git commit -m "fix: address issues found during manual testing

[Describe any fixes made]

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Summary

This plan implements text search functionality across 5 files:

1. **`app/lib/dashboard-data.ts`** - Backend SQL filtering with ILIKE
2. **`app/(pages)/dashboard/components/search-input.tsx`** - New client component
3. **`app/(pages)/dashboard/components/filters-bar-server.tsx`** - UI integration
4. **`app/(pages)/dashboard/page.tsx`** - URL param reading
5. **`app/(pages)/dashboard/components/card-table-server.tsx`** - Data passing

The feature follows the existing filter pattern, uses URL-based state management, and includes proper error handling for edge cases (empty results, short terms).
