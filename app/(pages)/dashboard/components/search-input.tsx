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
