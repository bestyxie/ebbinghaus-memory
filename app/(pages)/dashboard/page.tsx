import Link from 'next/link';
import { DashboardContent } from './components/dashboard-content';
import CreateBtn from './components/createBtn';
import { Plus, Play } from 'lucide-react';
import { StatsGridServer } from './components/stats-grid';

export default async function DashboardPage() {
  const header = (
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
        <Link
          href="/review"
          className="flex items-center gap-2 px-5 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <Play className="h-5 w-5" />
          Start Reviewing
        </Link>
      </div>
    </div>
  );

  const statsGrid = (
    <div className="mb-12">
      <StatsGridServer />
    </div>
  );

  return <DashboardContent header={header} statsGrid={statsGrid} />;
}
