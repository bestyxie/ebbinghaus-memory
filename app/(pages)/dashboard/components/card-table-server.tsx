import { CardRow } from './card-row';
import { PaginationClient } from './pagination-client';
import { getCardsData } from '@/app/lib/dashboard-data';
import { auth } from '@/app/lib/auth';
import { headers } from 'next/headers';

type SortOption = 'nextReviewAt' | 'createdAt' | 'easeFactor';

interface CardTableServerProps {
  currentPage: number;
  sortBy: SortOption;
  deckId: string | null;
  search: string | null;
}

export async function CardTableServer({ currentPage, sortBy, deckId, search }: CardTableServerProps) {
  const header = await headers();
  const session = await auth.api.getSession({ headers: header });

  if (!session?.user?.id) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-6">
        <p className="text-amber-700 dark:text-amber-400 text-sm">Session expired. Please refresh the page or log in again.</p>
      </div>
    );
  }

  let cards: Awaited<ReturnType<typeof getCardsData>>['cards'];
  let total: number;
  let totalPages: number;

  try {
    const cardsData = await getCardsData(session.user.id, { sortBy, deckId, page: currentPage, searchTerm: search || undefined });
    cards = cardsData.cards;
    total = cardsData.total;
    totalPages = cardsData.totalPages;
  } catch (error) {
    console.error('CardTableServer: failed to fetch cards', { userId: session.user.id, sortBy, deckId, page: currentPage, search, error });
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800 p-6">
        <p className="text-red-700 dark:text-red-400 text-sm">Failed to load cards. Please refresh the page.</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-12 text-center">
        <p className="text-slate-500">
          {search
            ? `No cards match "${search}". Try a different search term.`
            : 'No cards found. Create your first card to get started!'}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden mb-8">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left border-collapse">
          <caption className="sr-only">
            List of all knowledge points with their status and familiarity
          </caption>
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
              <th className="px-6 py-4">Knowledge Point</th>
              <th className="px-6 py-4">Tags</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Familiarity</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {cards.map((card) => (
              <CardRow key={card.id} card={card} />
            ))}
          </tbody>
        </table>
      </div>

      <PaginationClient currentPage={currentPage} totalPages={totalPages} total={total} />
    </div>
  );
}
