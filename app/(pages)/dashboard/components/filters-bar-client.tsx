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

const dropdownContainerClass = 'absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-10';
const dropdownItemClass = 'w-full text-left px-4 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800';
const dropdownItemActiveClass = 'text-blue-600 font-medium';
const dropdownItemDefaultClass = 'text-slate-700 dark:text-slate-300';

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

  const isDeckActive = currentDeckId !== null;

  return (
    <>
      {/* Sort Dropdown */}
      <div className="relative">
        <button
          onClick={() => setSortOpen(!sortOpen)}
          className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <span>{currentSortLabel}</span>
          <ChevronDown className="h-4 w-4" />
        </button>

        {sortOpen && (
          <div className={dropdownContainerClass}>
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortSelect(option.value)}
                className={`${dropdownItemClass} ${option.value === currentSortBy ? dropdownItemActiveClass : dropdownItemDefaultClass}`}
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
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            isDeckActive
              ? 'bg-blue-600/10 border border-blue-600/20 text-blue-600 font-bold hover:bg-blue-600/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <span>{currentDeckLabel}</span>
          <ChevronDown className="h-4 w-4" />
        </button>

        {deckOpen && (
          <div className={dropdownContainerClass}>
            <button
              onClick={() => handleDeckSelect(null)}
              className={`${dropdownItemClass} ${currentDeckId === null ? dropdownItemActiveClass : dropdownItemDefaultClass}`}
            >
              All Tags
            </button>
            {decks.map((deck) => (
              <button
                key={deck.id}
                onClick={() => handleDeckSelect(deck.id)}
                className={`${dropdownItemClass} ${deck.id === currentDeckId ? dropdownItemActiveClass : dropdownItemDefaultClass}`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: deck.color }} />
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
