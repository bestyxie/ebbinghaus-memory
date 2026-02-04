'use client';

import { useEffect, useState, useCallback } from 'react';
import { CardRow } from './card-row';
import { CardsResponse } from '@/app/lib/types';

interface CardTableProps {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  deckId?: string | null;
  onFetch?: (refetch: () => void) => void;
}

export function CardTable({ sortBy = 'nextReviewAt', sortOrder = 'asc', deckId, onFetch }: CardTableProps) {
  const [data, setData] = useState<CardsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        sortBy,
        sortOrder,
      });

      if (deckId) {
        params.append('deckId', deckId);
      }

      const response = await fetch(`/api/dashboard/cards?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cards');
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch cards:', error);
      setError('Failed to load cards');
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortBy, sortOrder, deckId]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  // Expose refetch function to parent via callback
  useEffect(() => {
    if (onFetch) {
      onFetch(fetchCards);
    }
  }, [onFetch, fetchCards]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-8 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 animate-pulse bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.cards.length === 0) {
    return (
      <div className="bg-white rounded-lg border shadow-sm p-12 text-center">
        <p className="text-gray-500">No cards found. Create your first card to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <caption className="sr-only">List of all knowledge points with their status and familiarity</caption>
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">
              Knowledge Point
            </th>
            <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">
              Tags
            </th>
            <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">
              Status
            </th>
            <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">
              Familiarity
            </th>
            <th className="py-4 px-6 text-center text-sm font-medium text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {data.cards.map((card) => (
            <CardRow key={card.id} card={card} sortBy={sortBy} sortOrder={sortOrder} deckId={deckId} />
          ))}
        </tbody>
      </table>
      </div>

      {/* Pagination */}
      <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {Math.min((currentPage - 1) * 10 + 1, data.total)} to{' '}
          {Math.min(currentPage * 10, data.total)} of {data.total} entries
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={currentPage >= data.totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
