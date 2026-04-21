'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CardRow } from './card-row';
import { PaginationClient } from './pagination-client';
import { PopConfirm } from '@/app/components/ui/popconfirm';
import { Trash, X } from 'lucide-react';
import { CardWithDeck } from '@/app/lib/types';

interface CardTableClientProps {
  cards: CardWithDeck[];
  currentPage: number;
  totalPages: number;
  total: number;
}

export function CardTableClient({ cards, currentPage, totalPages, total }: CardTableClientProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allSelected = cards.length > 0 && selectedIds.size === cards.length;
  const someSelected = selectedIds.size > 0;

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(cards.map((c) => c.id)));
    }
  }, [allSelected, cards]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleBatchDelete = async () => {
    try {
      const response = await fetch('/api/cards/batch', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });

      if (!response.ok) {
        let message = 'Failed to delete cards. Please try again.';
        try {
          const body = await response.json();
          if (body?.error) message = body.error;
        } catch {
          // Non-JSON response
        }
        throw new Error(message);
      }

      clearSelection();
      router.refresh();
    } catch (error) {
      console.error('Error batch deleting cards:', error);
      throw error;
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden mb-8">
      {/* Batch Action Bar */}
      {someSelected && (
        <div className="flex items-center justify-between px-6 py-3 bg-blue-50 dark:bg-blue-950/30 border-b border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {selectedIds.size} selected
            </span>
            <button
              onClick={clearSelection}
              className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              aria-label="Clear selection"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <PopConfirm
            title={`Delete ${selectedIds.size} card${selectedIds.size > 1 ? 's' : ''}?`}
            description="This action cannot be undone."
            onConfirm={handleBatchDelete}
            isDestructive={true}
            confirmText="Delete"
            cancelText="Cancel"
          >
            <button
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors"
              aria-label={`Delete ${selectedIds.size} selected cards`}
            >
              <Trash className="h-4 w-4" />
              Delete
            </button>
          </PopConfirm>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left border-collapse">
          <caption className="sr-only">
            List of all knowledge points with their status and familiarity
          </caption>
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
              <th className="px-4 py-4 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected && !allSelected;
                  }}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  aria-label="Select all cards"
                />
              </th>
              <th className="px-6 py-4">Knowledge Point</th>
              <th className="px-6 py-4">Tags</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Familiarity</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {cards.map((card) => (
              <CardRow
                key={card.id}
                card={card}
                isSelected={selectedIds.has(card.id)}
                onSelect={toggleSelect}
              />
            ))}
          </tbody>
        </table>
      </div>

      <PaginationClient currentPage={currentPage} totalPages={totalPages} total={total} />
    </div>
  );
}
