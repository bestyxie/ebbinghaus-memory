'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface PaginationClientProps {
  currentPage: number;
  totalPages: number;
  total: number;
}

export function PaginationClient({
  currentPage,
  totalPages,
  total,
}: PaginationClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updatePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/dashboard?${params.toString()}`);
  };

  const limit = 10;
  const startEntry = Math.min((currentPage - 1) * limit + 1, total);
  const endEntry = Math.min(currentPage * limit, total);

  return (
    <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
      <p className="text-sm text-gray-500">
        Showing {startEntry} to {endEntry} of {total} entries
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => updatePage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => updatePage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
