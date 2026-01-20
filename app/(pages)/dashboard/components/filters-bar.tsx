'use client';

import React, { useState } from 'react';
import { Funnel, ChevronDown, Grid3x3, List } from 'lucide-react';

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
        <Funnel className="h-4 w-4" />
        <span>Filters</span>
      </button>

      {/* Sort Dropdown */}
      <div className="relative">
        <button
          onClick={() => setSortOpen(!sortOpen)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <span>{sortOptions.find((o) => o.value === selectedSort)?.label}</span>
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
      <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
        <span>Tags</span>
        <ChevronDown className="h-4 w-4" />
      </button>

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
