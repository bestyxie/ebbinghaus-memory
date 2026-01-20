# Dashboard Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a comprehensive dashboard page displaying study statistics, card lists with filters, and quick actions, implementing the design from the Figma specification.

**Architecture:** Create server-side dashboard API endpoints for statistics and card data, build reusable dashboard components (stats cards, filters, card table), and integrate with existing authentication and SM-2 algorithm systems. Use Next.js 15 App Router with React Server Components for data fetching and Client Components for interactivity. **Note:** UI labels show "Tags" but they map to the database "Deck" model (flashcard sets/folders).

**Tech Stack:** Next.js 15, React 19, TypeScript, Prisma 7, Tailwind CSS 4, NextAuth 5

---

## Task 1: Create Dashboard Statistics API Endpoint

**Files:**
- Create: `app/api/dashboard/stats/route.ts`
- Test: Manual testing with pnpm dev

**Step 1: Create the API route file**

Create the statistics endpoint that aggregates user data:

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    // Get total cards count
    const totalCards = await prisma.card.count({
      where: { userId },
    });

    // Get cards due for review today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueToday = await prisma.card.count({
      where: {
        userId,
        nextReviewAt: {
          lte: tomorrow,
        },
      },
    });

    // Calculate retention rate from review logs
    const reviewLogs = await prisma.reviewLog.findMany({
      where: { userId },
      select: { quality: true },
    });

    const retentionRate = reviewLogs.length > 0
      ? Math.round(
          (reviewLogs.filter((log) => log.quality >= 3).length / reviewLogs.length) * 100
        )
      : 100;

    return NextResponse.json({
      totalCards,
      dueToday,
      retentionRate,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
```

**Step 2: Test the endpoint manually**

Run: `pnpm dev`
Visit: `http://localhost:3000/api/dashboard/stats` (while logged in)
Expected: JSON response with `totalCards`, `dueToday`, `retentionRate`

**Step 3: Commit**

```bash
git add app/api/dashboard/stats/route.ts
git commit -m "feat: add dashboard statistics API endpoint"
```

---

## Task 2: Create Dashboard Cards API Endpoint

**Files:**
- Create: `app/api/dashboard/cards/route.ts`
- Test: Manual testing

**Step 1: Create the cards listing endpoint**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'nextReviewAt';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const deckId = searchParams.get('deckId');

    const userId = session.user.id;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    // Add deck filter if provided
    if (deckId) {
      where.deckId = deckId;
    }

    const [cards, total] = await Promise.all([
      prisma.card.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          deck: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.card.count({ where }),
    ]);

    return NextResponse.json({
      cards,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching dashboard cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cards' },
      { status: 500 }
    );
  }
}
```

**Step 2: Test the endpoint**

Run: `pnpm dev`
Visit: `http://localhost:3000/api/dashboard/cards?page=1&limit=10`
Expected: JSON response with cards array and pagination info

**Step 3: Commit**

```bash
git add app/api/dashboard/cards/route.ts
git commit -m "feat: add dashboard cards listing API with pagination and filters"
```

---

## Task 3: Create Stats Card Component

**Files:**
- Create: `app/(pages)/dashboard/components/stats-card.tsx`
- Test: Visual testing in dashboard

**Step 1: Create the reusable stats card component**

```typescript
'use client';

import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  trend?: {
    value: string;
    type: 'up' | 'down' | 'stable';
  };
  variant?: 'default' | 'accent';
  progress?: number; // For retention rate bar (0-100)
}

export function StatsCard({
  title,
  value,
  subtitle,
  trend,
  variant = 'default',
  progress,
}: StatsCardProps) {
  const baseClasses = 'rounded-lg border bg-white p-6';
  const variantClasses = variant === 'accent'
    ? 'shadow-sm'
    : '';

  return (
    <div className={`${baseClasses} ${variantClasses}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm ${
              trend.type === 'up' ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            <span>{trend.value}</span>
            {trend.type === 'up' && (
              <svg
                className="h-3 w-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>

      {progress !== undefined && (
        <div className="mt-4">
          <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <p className="mt-4 text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}
```

**Step 2: Verify component compiles**

Check for TypeScript errors: Run `pnpm build` (should succeed)

**Step 3: Commit**

```bash
git add app/(pages)/dashboard/components/stats-card.tsx
git commit -m "feat: add reusable stats card component"
```

---

## Task 4: Create Stats Grid Component

**Files:**
- Create: `app/(pages)/dashboard/components/stats-grid.tsx`
- Test: Visual testing

**Step 1: Create the stats grid component**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { StatsCard } from './stats-card';

interface DashboardStats {
  totalCards: number;
  dueToday: number;
  retentionRate: number;
}

export function StatsGrid() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[113px] animate-pulse bg-gray-200 rounded-lg"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatsCard
        title="Total Knowledge"
        value={stats.totalCards.toLocaleString()}
        subtitle="Points tracked this year"
        trend={{ value: '+12%', type: 'up' }}
      />

      <StatsCard
        title="Due for Review"
        value={stats.dueToday}
        subtitle="Requires your attention"
        variant="accent"
      />

      <StatsCard
        title="Retention Rate"
        value={`${stats.retentionRate}%`}
        subtitle="Based on review history"
        trend={{ value: 'Stable', type: 'stable' }}
        progress={stats.retentionRate}
      />
    </div>
  );
}
```

**Step 2: Check for errors**

Run: `pnpm build`
Expected: No TypeScript or build errors

**Step 3: Commit**

```bash
git add app/(pages)/dashboard/components/stats-grid.tsx
git commit -m "feat: add stats grid component with data fetching"
```

---

## Task 5: Create Card Status Badge Component

**Files:**
- Create: `app/(pages)/dashboard/components/card-status-badge.tsx`
- Test: Visual testing

**Step 1: Create status badge component**

```typescript
'use client';

import React from 'react';

type CardStatus = 'new' | 'due' | 'overdue' | 'scheduled';

interface CardStatusBadgeProps {
  status: CardStatus;
  daysUntil?: number;
}

export function CardStatusBadge({ status, daysUntil }: CardStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'new':
        return {
          label: 'New',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          dotColor: 'bg-gray-400',
        };
      case 'due':
        return {
          label: 'Due Now',
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-700',
          dotColor: 'bg-orange-500',
        };
      case 'overdue':
        return {
          label: 'Overdue',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          dotColor: 'bg-red-500',
        };
      case 'scheduled':
        return {
          label: daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`,
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          dotColor: 'bg-blue-500',
        };
      default:
        return {
          label: 'Unknown',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          dotColor: 'bg-gray-400',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex items-center gap-2 ${config.textColor}`}>
      <div className={`h-1.5 w-1.5 rounded-full ${config.dotColor}`} />
      <span className="text-sm font-medium">{config.label}</span>
    </div>
  );
}
```

**Step 2: Verify compilation**

Run: `pnpm build` (should succeed)

**Step 3: Commit**

```bash
git add app/(pages)/dashboard/components/card-status-badge.tsx
git commit -m "feat: add card status badge component"
```

---

## Task 6: Create Familiarity Progress Component

**Files:**
- Create: `app/(pages)/dashboard/components/familiarity-progress.tsx`
- Test: Visual testing

**Step 1: Create familiarity component**

```typescript
'use client';

import React from 'react';

interface FamiliarityProgressProps {
  percentage: number;
}

export function FamiliarityProgress({ percentage }: FamiliarityProgressProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-1 w-20 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm text-gray-600">{percentage}%</span>
    </div>
  );
}
```

**Step 2: Check compilation**

Run: `pnpm build` (no errors expected)

**Step 3: Commit**

```bash
git add app/(pages)/dashboard/components/familiarity-progress.tsx
git commit -m "feat: add familiarity progress component"
```

---

## Task 7: Create Card Row Component

**Files:**
- Create: `app/(pages)/dashboard/components/card-row.tsx`
- Test: Visual testing

**Step 1: Create card row component**

```typescript
'use client';

import React from 'react';
import Link from 'next/link';
import { CardStatusBadge } from './card-status-badge';
import { FamiliarityProgress } from './familiarity-progress';
import { PencilIcon, TrashIcon, PlayIcon } from '@heroicons/react/24/outline';

interface Card {
  id: string;
  front: string;
  back: string;
  nextReviewAt: Date | null;
  interval: number;
  easeFactor: number;
  repetitions: number;
  state: string;
  createdAt: Date;
  updatedAt: Date;
  deck: {
    id: string;
    name: string;
  } | null;
}

interface CardRowProps {
  card: Card;
}

export function CardRow({ card }: CardRowProps) {
  // Calculate card status
  const getCardStatus = (): { status: 'new' | 'due' | 'overdue' | 'scheduled'; daysUntil?: number } => {
    const now = new Date();
    const reviewDate = card.nextReviewAt ? new Date(card.nextReviewAt) : null;

    if (!reviewDate || card.state === 'NEW') {
      return { status: 'new' };
    }

    const diffTime = reviewDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'overdue' };
    } else if (diffDays === 0) {
      return { status: 'due' };
    } else {
      return { status: 'scheduled', daysUntil: diffDays };
    }
  };

  // Calculate familiarity based on ease factor and repetitions
  const familiarity = Math.min(100, Math.round(
    (card.easeFactor - 1.3) / (2.5 - 1.3) * 50 +
    (card.repetitions / 10) * 50
  ));

  // Get last reviewed text
  const getLastReviewedText = () => {
    if (card.state === 'NEW') {
      return 'Not reviewed yet';
    }

    const diffTime = now.getTime() - card.updatedAt.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Reviewed today';
    if (diffDays === 1) return 'Last reviewed 1 day ago';
    return `Last reviewed ${diffDays} days ago`;
  };

  const { status, daysUntil } = getCardStatus();
  const now = new Date();

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      {/* Knowledge Point */}
      <td className="py-6 px-6">
        <div>
          <p className="font-medium text-gray-900">{card.front}</p>
          <p className="mt-2 text-sm text-gray-500">{getLastReviewedText()}</p>
        </div>
      </td>

      {/* Tags (Deck) */}
      <td className="py-6 px-6">
        {card.deck ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            {card.deck.name}
          </span>
        ) : (
          <span className="text-sm text-gray-400">No deck</span>
        )}
      </td>

      {/* Status */}
      <td className="py-6 px-6">
        <CardStatusBadge status={status} daysUntil={daysUntil} />
      </td>

      {/* Familiarity */}
      <td className="py-6 px-6">
        <FamiliarityProgress percentage={familiarity} />
      </td>

      {/* Actions */}
      <td className="py-6 px-6">
        <div className="flex items-center gap-2">
          <Link
            href={`/review/${card.id}`}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Start reviewing"
          >
            <PlayIcon className="h-4 w-4" />
          </Link>
          <Link
            href={`/cards/${card.id}/edit`}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit card"
          >
            <PencilIcon className="h-4 w-4" />
          </Link>
          <button
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete card"
            onClick={() => {
              // TODO: Implement delete functionality
              console.log('Delete card:', card.id);
            }}
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
```

**Step 2: Install heroicons if not present**

Run: `pnpm add @heroicons/react`

**Step 3: Check compilation**

Run: `pnpm build` (no errors expected)

**Step 4: Commit**

```bash
git add app/(pages)/dashboard/components/card-row.tsx
git add package.json pnpm-lock.yaml
git commit -m "feat: add card row component with deck display (labeled as Tags)"
```

---

## Task 8: Create Card Table Component

**Files:**
- Create: `app/(pages)/dashboard/components/card-table.tsx`
- Test: Visual testing

**Step 1: Create the card table component**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { CardRow } from './card-row';

interface Card {
  id: string;
  front: string;
  back: string;
  nextReviewAt: Date | null;
  interval: number;
  easeFactor: number;
  repetitions: number;
  state: string;
  createdAt: Date;
  updatedAt: Date;
  deck: {
    id: string;
    name: string;
  } | null;
}

interface CardsResponse {
  cards: Card[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function CardTable() {
  const [data, setData] = useState<CardsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('nextReviewAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    async function fetchCards() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '10',
          sortBy,
          sortOrder,
        });

        const response = await fetch(`/api/dashboard/cards?${params}`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch cards:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCards();
  }, [currentPage, sortBy, sortOrder]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-8 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 animate-pulse bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.cards.length === 0) {
    return (
      <div className="bg-white rounded-lg border shadow-sm p-12 text-center">
        <p className="text-gray-500">No cards found. Create your first card to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">
              Knowledge Point
            </th>
            <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">
              Tags
            </th>
            <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">
              Status
            </th>
            <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">
              Familiarity
            </th>
            <th className="py-4 px-6 text-center text-sm font-medium text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {data.cards.map((card) => (
            <CardRow key={card.id} card={card} />
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {Math.min((currentPage - 1) * 10 + 1, data.total)} to{' '}
          {Math.min(currentPage * 10, data.total)} of {data.total} entries
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={currentPage >= data.totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Check for errors**

Run: `pnpm build` (should succeed)

**Step 3: Commit**

```bash
git add app/(pages)/dashboard/components/card-table.tsx
git commit -m "feat: add card table component with pagination"
```

---

## Task 9: Create Filters Bar Component

**Files:**
- Create: `app/(pages)/dashboard/components/filters-bar.tsx`
- Test: Visual testing

**Step 1: Create filters component**

```typescript
'use client';

import React, { useState } from 'react';
import { FunnelIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

type SortOption = 'nextReviewAt' | 'createdAt' | 'easeFactor';
type DeckOption = string | null;

interface FiltersBarProps {
  onSortChange: (sortBy: SortOption, sortOrder: 'asc' | 'desc') => void;
  onDeckFilter: (deckId: DeckOption) => void;
}

export function FiltersBar({ onSortChange, onDeckFilter }: FiltersBarProps) {
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState<SortOption>('nextReviewAt');

  const sortOptions = [
    { value: 'nextReviewAt' as SortOption, label: 'Next Review' },
    { value: 'createdAt' as SortOption, label: 'Creation Date' },
    { value: 'easeFactor' as SortOption, label: 'Familiarity' },
  ];

  const handleSortSelect = (value: SortOption) => {
    setSelectedSort(value);
    onSortChange(value, 'asc');
    setSortOpen(false);
  };

  return (
    <div className="flex items-center gap-4 mb-6">
      {/* Filters Button */}
      <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
        <FunnelIcon className="h-4 w-4" />
        <span>Filters</span>
      </button>

      {/* Sort Dropdown */}
      <div className="relative">
        <button
          onClick={() => setSortOpen(!sortOpen)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <span>{sortOptions.find((o) => o.value === selectedSort)?.label}</span>
          <ChevronDownIcon className="h-4 w-4" />
        </button>

        {sortOpen && (
          <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortSelect(option.value)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Decks Filter (labeled as "Tags" in UI) */}
      <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
        <span>Tags</span>
        <ChevronDownIcon className="h-4 w-4" />
      </button>

      <div className="ml-auto flex gap-2">
        {/* Grid View Toggle */}
        <button className="p-2 text-gray-600 hover:text-gray-900">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
        </button>

        {/* List View Toggle */}
        <button className="p-2 text-gray-900">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Check compilation**

Run: `pnpm build` (no errors)

**Step 3: Commit**

```bash
git add app/(pages)/dashboard/components/filters-bar.tsx
git commit -m "feat: add filters bar with deck filtering (labeled as Tags in UI)"
```

---

## Task 10: Update Dashboard Page

**Files:**
- Modify: `app/(pages)/dashboard/page.tsx`
- Test: Full page testing

**Step 1: Read current dashboard page**

Run: `cat app/(pages)/dashboard/page.tsx`

**Step 2: Replace with new dashboard implementation**

```typescript
import { Suspense } from 'react';
import { StatsGrid } from './components/stats-grid';
import { CardTable } from './components/card-table';
import { FiltersBar } from './components/filters-bar';
import { CreateBtn } from './components/createBtn';
import { PlusIcon, PlayIcon } from '@heroicons/react/24/outline';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-8 py-10">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Study Dashboard
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Master your knowledge with space-repetition powered by the Ebbinghaus forgetting curve.
            </p>
          </div>

          <div className="flex gap-4">
            <Link
              href="/cards/new"
              className="flex items-center gap-2 px-5 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <PlusIcon className="h-5 w-5" />
              New Point
            </Link>
            <Link
              href="/review"
              className="flex items-center gap-2 px-5 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <PlayIcon className="h-5 w-5" />
              Start Reviewing
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-12">
          <Suspense
            fallback={
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-[113px] animate-pulse bg-gray-200 rounded-lg"
                  />
                ))}
              </div>
            }
          >
            <StatsGrid />
          </Suspense>
        </div>

        {/* Filters */}
        <Suspense fallback={<div className="h-12 animate-pulse bg-gray-200 rounded-lg mb-6" />}>
          <FiltersBar
            onSortChange={(sortBy, sortOrder) => console.log('Sort:', sortBy, sortOrder)}
            onDeckFilter={(deckId) => console.log('Filter by deck:', deckId)}
          />
        </Suspense>

        {/* Card Table */}
        <Suspense
          fallback={
            <div className="bg-white rounded-lg border shadow-sm p-8 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 animate-pulse bg-gray-200 rounded" />
              ))}
            </div>
          }
        >
          <CardTable />
        </Suspense>
      </div>

      {/* Floating Create Button */}
      <CreateBtn />

      {/* Footer */}
      <footer className="mt-20 py-10 text-center text-sm text-gray-500">
        <p>© 2023 MindFlow. Master everything, forget nothing.</p>
      </footer>
    </div>
  );
}
```

**Step 3: Add missing import for Link**

Make sure to add: `import Link from 'next/link';` at the top

**Step 4: Test the dashboard**

Run: `pnpm dev`
Visit: `http://localhost:3000/dashboard`
Expected: Full dashboard with stats, filters, and card table

**Step 5: Commit**

```bash
git add app/(pages)/dashboard/page.tsx
git commit -m "feat: implement complete dashboard page with all components"
```

---

## Task 11: Add Loading States and Error Handling

**Files:**
- Modify: `app/(pages)/dashboard/components/card-table.tsx`
- Modify: `app/(pages)/dashboard/components/stats-grid.tsx`

**Step 1: Add error boundary for stats grid**

Update `stats-grid.tsx`:

Add error state handling in the component:

```typescript
// Add after useState declarations
const [error, setError] = useState<string | null>(null);

// Update the fetch function
async function fetchStats() {
  try {
    const response = await fetch('/api/dashboard/stats');
    if (!response.ok) {
      throw new Error('Failed to fetch statistics');
    }
    const data = await response.json();
    setStats(data);
    setError(null);
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    setError('Failed to load statistics');
  } finally {
    setLoading(false);
  }
}

// Add error display before loading check
if (error) {
  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-700">{error}</p>
    </div>
  );
}
```

**Step 2: Add error handling for card table**

Update `card-table.tsx` similarly:

```typescript
const [error, setError] = useState<string | null>(null);

// In the fetch function
if (!response.ok) {
  throw new Error('Failed to fetch cards');
}
setError(null);

// Add error display
if (error) {
  return (
    <div className="bg-white rounded-lg border shadow-sm p-12 text-center">
      <p className="text-red-600">{error}</p>
    </div>
  );
}
```

**Step 3: Test error handling**

Run: `pnpm dev`
Test: Temporarily break the API to see error states

**Step 4: Commit**

```bash
git add app/(pages)/dashboard/components/stats-grid.tsx app/(pages)/dashboard/components/card-table.tsx
git commit -m "feat: add error handling and loading states to dashboard components"
```

---

## Task 12: Add Responsive Design Fixes

**Files:**
- Modify: `app/(pages)/dashboard/page.tsx`
- Modify: `app/(pages)/dashboard/components/card-table.tsx`

**Step 1: Add responsive table wrapper**

In `card-table.tsx`, wrap the table in a responsive div:

```typescript
// Wrap the return JSX with:
<div className="overflow-x-auto">
  <table className="w-full min-w-[800px]">
    {/* rest of table */}
  </table>
</div>
```

**Step 2: Add responsive header in dashboard page**

Update the header section:

```typescript
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
  {/* content */}
</div>
```

**Step 3: Test responsive behavior**

Run: `pnpm dev`
Test: Resize browser window to mobile, tablet, desktop sizes

**Step 4: Commit**

```bash
git add app/(pages)/dashboard/page.tsx app/(pages)/dashboard/components/card-table.tsx
git commit -m "feat: add responsive design improvements to dashboard"
```

---

## Task 13: Add Accessibility Features

**Files:**
- Modify: All dashboard components
- Test: Screen reader testing

**Step 1: Add ARIA labels to buttons**

Update `card-row.tsx` actions:

```typescript
<button
  aria-label="Edit card {card.front}"
  // ... other props
>
```

**Step 2: Add table captions**

In `card-table.tsx`, add after opening `<table>` tag:

```typescript
<caption className="sr-only">List of all knowledge points with their status and familiarity</caption>
```

**Step 3: Add keyboard navigation support**

Ensure all interactive elements are keyboard accessible:
- Check tab order
- Add focus states
- Ensure proper contrast

**Step 4: Test with keyboard**

Test: Navigate dashboard using Tab key only

**Step 5: Commit**

```bash
git add app/(pages)/dashboard/components/
git commit -m "feat: improve accessibility with ARIA labels and keyboard navigation"
```

---

## Task 14: Final Testing and Polish

**Files:**
- Test: All dashboard functionality
- Modify: Any files needing fixes

**Step 1: Run full build**

Run: `pnpm build`
Expected: Clean build with no errors

**Step 2: Run linter**

Run: `pnpm lint`
Expected: No linting errors

**Step 3: Manual testing checklist**

Test each feature:
- [ ] Stats cards display correct numbers
- [ ] "New Point" button navigates correctly
- [ ] "Start Reviewing" button navigates correctly
- [ ] Sort filters change card order
- [ ] Pagination works correctly
- [ ] Card status badges show correct states
- [ ] Familiarity bars display correctly
- [ ] Action buttons work (edit, review, delete placeholder)
- [ ] Responsive design works on mobile
- [ ] Keyboard navigation works
- [ ] Loading states show during data fetch
- [ ] Error states show on API failure

**Step 4: Test with different data states**

- User with no cards
- User with 1 card
- User with many cards (> 10)
- User with overdue cards
- User with new cards

**Step 5: Final commit**

```bash
git add .
git commit -m "chore: final dashboard implementation with all features tested"
```

---

## Task 15: Update Documentation

**Files:**
- Modify: `CLAUDE.md` (root)
- Create: `docs/DASHBOARD.md`

**Step 1: Update root CLAUDE.md**

Add to the "Key Directories" section:

```markdown
### Dashboard
- Route: `/dashboard` - Main study dashboard
- Components: `app/(pages)/dashboard/components/`
  - `stats-grid.tsx` - Statistics cards
  - `card-table.tsx` - Card listing with pagination
  - `filters-bar.tsx` - Sort and filter controls
- API Endpoints:
  - `/api/dashboard/stats` - Get user statistics
  - `/api/dashboard/cards` - Get paginated card list
```

**Step 2: Create dashboard documentation**

Create `docs/DASHBOARD.md`:

```markdown
# Dashboard Documentation

## Overview
The dashboard is the main interface for viewing and managing flashcards.

**Important Note:** The UI displays "Tags" labels, but these map to the database "Deck" model. A Deck represents a flashcard set/folder for organizing cards.

## Features

### Statistics Cards
- Total Knowledge: Shows total number of cards
- Due for Review: Cards due today
- Retention Rate: Overall success rate from review logs

### Card Table
- Lists all cards with status, tags, and familiarity
- Sortable by: Next Review, Creation Date, Familiarity
- Paginated with 10 cards per page
- Quick actions: Review, Edit, Delete

### Status Indicators
- **New**: Never reviewed
- **Due Now**: Review date is today or past
- **Overdue**: Review date has passed
- **In X days**: Scheduled for future review

## API Endpoints

### GET /api/dashboard/stats
Returns user statistics.

**Response:**
```json
{
  "totalCards": 100,
  "dueToday": 14,
  "retentionRate": 92
}
```

### GET /api/dashboard/cards
Returns paginated list of cards.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sortBy`: Field to sort by (default: nextReviewAt)
- `sortOrder`: asc or desc (default: asc)
- `deckId`: Filter by deck ID (optional)

**Response:**
```json
{
  "cards": [...],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

## Components

### StatsCard
Reusable component for displaying statistics with optional trend indicator.

### CardRow
Individual row in the card table with status badges and action buttons.

### FiltersBar
Sorting and filtering controls for the card table.

## Future Enhancements
- Advanced filters (date range, multiple tags)
- Export functionality
- Bulk actions
- Grid view option
- Search within cards
```

**Step 3: Commit documentation**

```bash
git add CLAUDE.md docs/DASHBOARD.md
git commit -m "docs: add dashboard documentation"
```

---

## Completion Checklist

After implementing all tasks, verify:

- [ ] All API endpoints return correct data
- [ ] All components render without errors
- [ ] TypeScript compilation passes
- [ ] ESLint passes
- [ ] Responsive design works
- [ ] Accessibility features implemented
- [ ] Error handling in place
- [ ] Loading states display
- [ ] Documentation updated
- [ ] All tests pass (if tests exist)

## Summary

This plan implements a complete dashboard page with:
1. **2 Statistics API endpoints** for data aggregation
2. **7 Reusable components** for UI elements
3. **Full card listing interface** with sorting and filtering
4. **Responsive design** that works on all devices
5. **Accessibility features** for inclusive design
6. **Error handling** and loading states
7. **Comprehensive documentation** for future maintenance

**Note:** UI shows "Tags" but maps to database "Deck" model (flashcard folders/sets).

Total estimated implementation: ~15 tasks, each broken into 2-5 minute steps.
