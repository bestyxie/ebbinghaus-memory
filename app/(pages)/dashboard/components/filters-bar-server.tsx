import { Funnel, Grid3x3, List } from 'lucide-react';
import { FiltersBarClient } from './filters-bar-client';
import { getUserDecks } from '@/app/lib/deck';
import { auth } from '@/app/lib/auth';
import { headers } from 'next/headers';

type SortOption = 'nextReviewAt' | 'createdAt' | 'easeFactor';

interface FiltersBarServerProps {
  currentSortBy: SortOption;
  currentDeckId: string | null;
}

const sortOptions = [
  { value: 'nextReviewAt' as SortOption, label: 'Next Review' },
  { value: 'createdAt' as SortOption, label: 'Creation Date' },
  { value: 'easeFactor' as SortOption, label: 'Familiarity' },
];

export async function FiltersBarServer({
  currentSortBy,
  currentDeckId,
}: FiltersBarServerProps) {
  const header = await headers();
  const session = await auth.api.getSession({ headers: header });
  const decks = await getUserDecks(session?.user?.id || '');

  return (
    <div className="flex items-center gap-4 mb-6">
      {/* Filters Button (placeholder for future functionality) */}
      <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
        <Funnel className="h-4 w-4" />
        <span>Filters</span>
      </button>

      {/* Client-side interactive dropdowns */}
      <FiltersBarClient
        sortOptions={sortOptions}
        currentSortBy={currentSortBy}
        decks={decks}
        currentDeckId={currentDeckId}
      />

      {/* View toggles (placeholder for future functionality) */}
      <div className="ml-auto flex gap-2">
        <button className="p-2 text-gray-600 hover:text-gray-900">
          <Grid3x3 className="h-5 w-5" />
        </button>
        <button className="p-2 text-gray-900">
          <List className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
