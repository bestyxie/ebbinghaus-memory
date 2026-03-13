import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import CreateBtn from './components/createBtn';
import { Plus, Play } from 'lucide-react';
import { auth } from '@/app/lib/auth';
import { headers } from 'next/headers';
import { StatsGridServer } from './components/stats-grid';
import { FiltersBarServer } from './components/filters-bar-server';
import { CardTableServer } from './components/card-table-server';
import { AIMemoryButton } from './components/ai-memory-button';
import { getCardsData } from '@/app/lib/dashboard-data';
import { getUserDecks } from '@/app/lib/deck';

type SortOption = 'nextReviewAt' | 'createdAt' | 'easeFactor';

interface DashboardPageProps {
  searchParams: Promise<{
    sortBy?: string;
    deckId?: string;
    page?: string;
  }>;
}

function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-3 animate-pulse" />
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export default async function DashboardPage(props: DashboardPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    redirect('/login');
  }
  const searchParams = await props.searchParams;

  // Parse and validate search params
  const sortBy = (searchParams.sortBy || 'nextReviewAt') as SortOption;
  const deckId = searchParams.deckId || null;
  const page = parseInt(searchParams.page || '1', 10);

  // Fetch data in parallel
  const [cardsData, decks] = await Promise.all([
    getCardsData(session?.user.id || '', { sortBy, deckId, page }),
    getUserDecks(session.user.id),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-8 py-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Study Dashboard
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Master your knowledge with space-repetition powered by the Ebbinghaus forgetting curve.
            </p>
          </div>

          <div className="flex gap-4">
            <CreateBtn
              className="flex items-center gap-2 px-5 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Plus className="h-5 w-5" />
              New Point
            </CreateBtn>
            {/* <AIMemoryButton /> */}
            <Link
              href="/review"
              className="flex items-center gap-2 px-5 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Play className="h-5 w-5" />
              Start Reviewing
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-12">
          <Suspense fallback={<StatsGridSkeleton />}>
            <StatsGridServer user={session.user} />
          </Suspense>
        </div>

        {/* Filters Bar */}
        <FiltersBarServer
          decks={decks}
          currentSortBy={sortBy}
          currentDeckId={deckId}
        />

        {/* Card Table */}
        <CardTableServer
          cards={cardsData.cards}
          total={cardsData.total}
          currentPage={page}
          totalPages={cardsData.totalPages}
          sortBy={sortBy}
          deckId={deckId}
        />

        {/* Footer */}
        <footer className="mt-20 py-10 text-center text-sm text-gray-500">
          <p>© 2023 MindFlow. Master everything, forget nothing.</p>
        </footer>
      </div>
    </div>
  );
}
