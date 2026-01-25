'use client';

import React, { useState } from 'react';
import { Funnel, ChevronDown, Grid3x3, List } from 'lucide-react';

type SortOption = 'nextReviewAt' | 'createdAt' | 'easeFactor';

interface FiltersBarProps {
  sortBy?: SortOption;
  onSortChange?: (value: SortOption) => void;
  deckId?: string | null;
  onDeckChange?: (deckId: string | null) => void;
}

export function FiltersBar({
  sortBy = 'nextReviewAt',
  onSortChange,
  deckId,
  onDeckChange
}: FiltersBarProps) {
  const [sortOpen, setSortOpen] = useState(false);
  const [deckOpen, setDeckOpen] = useState(false);

  const sortOptions = [
    { value: 'nextReviewAt' as SortOption, label: 'Next Review' },
    { value: 'createdAt' as SortOption, label: 'Creation Date' },
    { value: 'easeFactor' as SortOption, label: 'Familiarity' },
  ];

  const handleSortSelect = (value: SortOption) => {
    onSortChange?.(value);
    setSortOpen(false);
  };

  const handleDeckSelect = (value: string | null) => {
    onDeckChange?.(value);
    setDeckOpen(false);
  };

  return (
    <div className="flex items-center gap-4 mb-6">
      {/* Filters Button */}
      <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
        <Funnel className="h-4 w-4" />
        <span>Filters</span>
      </button>

      {/* Sort Dropdown */}
      <div className="relative">
        <button
          onClick={() => setSortOpen(!sortOpen)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <span>{sortOptions.find((o) => o.value === sortBy)?.label}</span>
          <ChevronDown className="h-4 w-4" />
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
      <div className="relative">
        <button
          onClick={() => setDeckOpen(!deckOpen)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <span>Tags</span>
          <ChevronDown className="h-4 w-4" />
        </button>

        {deckOpen && (
          <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <button
              onClick={() => handleDeckSelect(null)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg ${
                deckId === null ? 'text-blue-600 font-medium' : 'text-gray-700'
              }`}
            >
              All Decks
            </button>
          </div>
        )}
      </div>

      <div className="ml-auto flex gap-2">
        {/* Grid View Toggle */}
        <button className="p-2 text-gray-600 hover:text-gray-900">
          <Grid3x3 className="h-5 w-5" />
        </button>

        {/* List View Toggle */}
        <button className="p-2 text-gray-900">
          <List className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
