'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

type SortOption = 'nextReviewAt' | 'createdAt' | 'easeFactor';

interface Deck {
  id: string;
  title: string;
  color: string;
}

interface FiltersBarClientProps {
  sortOptions: Array<{ value: SortOption; label: string }>;
  currentSortBy: SortOption;
  decks: Deck[];
  currentDeckId: string | null;
}

export function FiltersBarClient({
  sortOptions,
  currentSortBy,
  decks,
  currentDeckId,
}: FiltersBarClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sortOpen, setSortOpen] = useState(false);
  const [deckOpen, setDeckOpen] = useState(false);

  const updateURL = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change
    if ('sortBy' in updates || 'deckId' in updates) {
      params.set('page', '1');
    }

    router.push(`/dashboard?${params.toString()}`);
  };

  const handleSortSelect = (value: SortOption) => {
    updateURL({ sortBy: value });
    setSortOpen(false);
  };

  const handleDeckSelect = (deckId: string | null) => {
    updateURL({ deckId });
    setDeckOpen(false);
  };

  const currentSortLabel = sortOptions.find((o) => o.value === currentSortBy)?.label || 'Sort by';
  const currentDeckLabel = currentDeckId
    ? decks.find((d) => d.id === currentDeckId)?.title || 'Tags'
    : 'All Tags';

  return (
    <>
      {/* Sort Dropdown */}
      <div className="relative">
        <button
          onClick={() => setSortOpen(!sortOpen)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <span>{currentSortLabel}</span>
          <ChevronDown className="h-4 w-4" />
        </button>

        {sortOpen && (
          <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortSelect(option.value)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                  option.value === currentSortBy ? 'text-blue-600 font-medium' : 'text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Decks Filter (labeled as "Tags" in UI) */}
      <div className="relative">
        <button
          onClick={() => setDeckOpen(!deckOpen)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <span>{currentDeckLabel}</span>
          <ChevronDown className="h-4 w-4" />
        </button>

        {deckOpen && (
          <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <button
              onClick={() => handleDeckSelect(null)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg ${
                currentDeckId === null ? 'text-blue-600 font-medium' : 'text-gray-700'
              }`}
            >
              All Tags
            </button>
            {decks.map((deck) => (
              <button
                key={deck.id}
                onClick={() => handleDeckSelect(deck.id)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 last:rounded-b-lg ${
                  deck.id === currentDeckId ? 'text-blue-600 font-medium' : 'text-gray-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: deck.color }}
                  />
                  {deck.title}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
