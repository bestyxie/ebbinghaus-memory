export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Suspense } from 'react';
import CreateBtn from './components/createBtn';
import { Plus, Play } from 'lucide-react';
import { StatsGridServer } from './components/stats-grid';
import { FiltersBarServer } from './components/filters-bar-server';
import { CardTableServer } from './components/card-table-server';
import { AIMemoryButton } from './components/ai-memory-button';

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-3 animate-pulse" />
          <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2 animate-pulse" />
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/3 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export default async function DashboardPage(props: DashboardPageProps) {
  const searchParams = await props.searchParams;

  // Parse and validate search params
  const sortBy = (searchParams.sortBy || 'nextReviewAt') as SortOption;
  const deckId = searchParams.deckId || null;
  const page = parseInt(searchParams.page || '1', 10);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-8 py-10">
        {/* Header Section */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-black tracking-tight">Study Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-md text-sm mt-1">
              Master your knowledge with space-repetition powered by the Ebbinghaus forgetting curve.
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <CreateBtn className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <Plus className="h-4 w-4" />
              New Point
            </CreateBtn>
            <AIMemoryButton />
            <Link
              href="/review"
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-blue-600/20 hover:brightness-110 transition-all"
            >
              <Play className="h-4 w-4" />
              Start Reviewing
            </Link>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="mb-10">
          <Suspense fallback={<StatsGridSkeleton />}>
            <StatsGridServer />
          </Suspense>
        </section>

        {/* Filters Bar */}
        <Suspense fallback={<div className="h-16" />}>
          <FiltersBarServer
            currentSortBy={sortBy}
            currentDeckId={deckId}
          />
        </Suspense>

        {/* Card Table */}
        <Suspense fallback={<div className="h-64" />}>
          <CardTableServer
            currentPage={page}
            sortBy={sortBy}
            deckId={deckId}
          />
        </Suspense>

        {/* Footer */}
        <footer className="py-10 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-xs">© 2023 MindFlow. Master everything, forget nothing.</p>
        </footer>
      </div>
    </div>
  );
}
