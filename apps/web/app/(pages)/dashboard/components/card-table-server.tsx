import { CardTableClient } from './card-table-client';
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
    <CardTableClient
      cards={cards}
      currentPage={currentPage}
      totalPages={totalPages}
      total={total}
    />
  );
}
