import { Suspense } from 'react';
import Link from 'next/link';
import { StatsGrid } from './components/stats-grid';
import { CardTable } from './components/card-table';
import { FiltersBar } from './components/filters-bar';
import CreateBtn from './components/createBtn';
import { Plus, Play } from 'lucide-react';

export default function DashboardPage() {
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
            <Link
              href="/cards/new"
              className="flex items-center gap-2 px-5 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Plus className="h-5 w-5" />
              New Point
            </Link>
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
          <Suspense
            fallback={
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-[113px] animate-pulse bg-gray-200 rounded-lg"
                  />
                ))}
              </div>
            }
          >
            <StatsGrid />
          </Suspense>
        </div>

        {/* Filters */}
        <Suspense fallback={<div className="h-12 animate-pulse bg-gray-200 rounded-lg mb-6" />}>
          <FiltersBar
            onSortChange={(sortBy, sortOrder) => console.log('Sort:', sortBy, sortOrder)}
            onDeckFilter={(deckId) => console.log('Filter by deck:', deckId)}
          />
        </Suspense>

        {/* Card Table */}
        <Suspense
          fallback={
            <div className="bg-white rounded-lg border shadow-sm p-8 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 animate-pulse bg-gray-200 rounded" />
              ))}
            </div>
          }
        >
          <CardTable />
        </Suspense>
      </div>

      {/* Floating Create Button */}
      <CreateBtn />

      {/* Footer */}
      <footer className="mt-20 py-10 text-center text-sm text-gray-500">
        <p>© 2023 MindFlow. Master everything, forget nothing.</p>
      </footer>
    </div>
  );
}