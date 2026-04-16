import { FiltersBarClient } from './filters-bar-client';
import { SearchInput } from './search-input';
import { getUserDecks } from '@/app/lib/deck';
import { auth } from '@/app/lib/auth';
import { headers } from 'next/headers';
import { Filter } from 'lucide-react';

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

export async function FiltersBarServer({ currentSortBy, currentDeckId }: FiltersBarServerProps) {
  const header = await headers();
  const session = await auth.api.getSession({ headers: header });
  const decks = await getUserDecks(session?.user?.id || '');

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
        <Filter className="h-4 w-4 text-slate-500" />
        <span className="text-xs font-bold uppercase tracking-tight text-slate-500">Filters</span>
      </div>

      <SearchInput />

      <FiltersBarClient
        sortOptions={sortOptions}
        currentSortBy={currentSortBy}
        decks={decks}
        currentDeckId={currentDeckId}
      />
    </div>
  );
}
