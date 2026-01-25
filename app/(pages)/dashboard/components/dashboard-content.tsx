'use client';

import { useState, useCallback, useRef } from 'react';
import { CardTable } from './card-table';
import { FiltersBar } from './filters-bar';
import { StatsGrid } from './stats-grid';
import { CardRefreshContext } from './card-refresh-context';

type SortOption = 'nextReviewAt' | 'createdAt' | 'easeFactor';

interface DashboardContentProps {
  header: React.ReactNode;
}

export function DashboardContent({ header }: DashboardContentProps) {
  const [sortBy, setSortBy] = useState<SortOption>('nextReviewAt');
  const [deckId, setDeckId] = useState<string | null>(null);

  // Store refetch functions
  const statsRefetchRef = useRef<(() => void) | null>(null);
  const cardsRefetchRef = useRef<(() => void) | null>(null);

  // Stable callbacks for registering refetch functions
  const registerStatsRefetch = useCallback((refetch: () => void) => {
    statsRefetchRef.current = refetch;
  }, []);

  const registerCardsRefetch = useCallback((refetch: () => void) => {
    cardsRefetchRef.current = refetch;
  }, []);

  // Unified refresh function that calls both refetch functions
  const handleRefresh = useCallback(() => {
    statsRefetchRef.current?.();
    cardsRefetchRef.current?.();
  }, []);

  return (
    <CardRefreshContext.Provider value={{ refresh: handleRefresh }}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1600px] mx-auto px-8 py-10">
          {/* Header Section */}
          {header}

          {/* Stats Grid */}
          <div className="mb-12">
            <StatsGrid onFetch={registerStatsRefetch} />
          </div>

          {/* Filters and Card Table */}
          <FiltersBar
            sortBy={sortBy}
            onSortChange={setSortBy}
            deckId={deckId}
            onDeckChange={setDeckId}
          />
          <CardTable
            sortBy={sortBy}
            sortOrder="asc"
            deckId={deckId}
            onFetch={registerCardsRefetch}
          />

          {/* Footer */}
          <footer className="mt-20 py-10 text-center text-sm text-gray-500">
            <p>© 2023 MindFlow. Master everything, forget nothing.</p>
          </footer>
        </div>
      </div>
    </CardRefreshContext.Provider>
  );
}
