'use client';

import { useState, useCallback, useRef } from 'react';
import { CardTable } from './card-table';
import { FiltersBar } from './filters-bar';
import { CardRefreshContext } from './card-refresh-context';

type SortOption = 'nextReviewAt' | 'createdAt' | 'easeFactor';

interface DashboardContentProps {
  header: React.ReactNode;
  statsGrid: React.ReactNode;
}

export function DashboardContent({ header, statsGrid }: DashboardContentProps) {
  const [sortBy, setSortBy] = useState<SortOption>('nextReviewAt');
  const [deckId, setDeckId] = useState<string | null>(null);

  // Store refetch function for cards
  const cardsRefetchRef = useRef<(() => void) | null>(null);

  // Stable callback for registering card refetch function
  const registerCardsRefetch = useCallback((refetch: () => void) => {
    cardsRefetchRef.current = refetch;
  }, []);

  // Refresh function for cards
  const handleRefresh = useCallback(() => {
    cardsRefetchRef.current?.();
  }, []);

  return (
    <CardRefreshContext.Provider value={{ refresh: handleRefresh }}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1600px] mx-auto px-8 py-10">
          {/* Header Section */}
          {header}

          {/* Stats Grid */}
          {statsGrid}

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
