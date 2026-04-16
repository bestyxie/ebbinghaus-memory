# Dashboard Text Search Design

**Date:** 2026-04-16
**Status:** Approved

## Overview

Add a text search input to the dashboard that filters cards by their `front` field content. The search is triggered explicitly via Enter key or search button click. The input value stays in sync with the URL.

## Architecture

### Components

**`SearchInput` component** - New client component in `app/(pages)/dashboard/components/search-input.tsx`
- Text input with search icon from `lucide-react` (`Search` icon)
- Clear button (`X` icon) visible inside the input whenever there's text
- Triggered by Enter key or search icon click
- Updates URL search param only when triggered
- Minimum 2 characters required
- Clicking X clears the search immediately and restores previous filters
- Input value always mirrors URL `search` param - persists across navigation

### UI Layout

```
┌─────────────────────────────────────┐
│ 🔍 [search input...]        [X]    │ ← X only shows when input has text
└─────────────────────────────────────┘
```

### Data Flow

```
User types "react" + Enter → Update URL ?search=react →
Page re-renders → SearchInput reads "react" from URL →
Server reads search param → SQL LIKE query → Filtered results
```

## Database Query Changes

**`getCardsData` function** (`app/lib/dashboard-data.ts`):
- Add optional `searchTerm?: string` parameter to `GetCardsOptions`
- Add `WHERE` clause: `AND c.front ILIKE ${searchTerm}`
- Reset to page 1 when search changes
- Clear deck/sort filters when search term is present

## URL Schema

```
/dashboard?sortBy=nextReviewAt&deckId=abc&page=2
                    ↓ type "react" + Enter
/dashboard?search=react&page=1
```

When search is active, deck/sort filters are cleared from URL.

## Implementation Files

1. **`app/(pages)/dashboard/components/search-input.tsx`** (new)
   - Client component with controlled input
   - Initialize value from `search` URL param
   - Enter key or search button triggers search
   - X button (always visible when input has text) clears search immediately
   - Input stays populated after URL update

2. **`app/lib/dashboard-data.ts`** (modify)
   - Add `searchTerm` to `GetCardsOptions`
   - Update SQL queries with `ILIKE` filter

3. **`app/(pages)/dashboard/page.tsx`** (modify)
   - Read `search` from searchParams
   - Pass to `CardTableServer`

4. **`app/(pages)/dashboard/components/card-table-server.tsx`** (modify)
   - Pass `searchTerm` to `getCardsData`

5. **`app/(pages)/dashboard/components/filters-bar-server.tsx`** (modify)
   - Add `SearchInput` component to filter bar

## Edge Cases

- **Empty search** - X button clears search and restores previous filters (deck/sort)
- **Short terms** - Show inline error if < 2 chars on Enter
- **No results** - Show "No cards match your search" message
- **URL sharing** - Search term persists in URL and input field
- **Input persistence** - Input value stays populated after navigation/pagination

## Testing Checklist

- [ ] Enter key triggers search
- [ ] Search button click triggers search
- [ ] X button clears search and restores filters
- [ ] X button only shows when input has text
- [ ] Input value persists after URL update
- [ ] Search persists across pagination
- [ ] Clearing search restores deck/sort filters
- [ ] Works independently from filters (one or the other, not both)
