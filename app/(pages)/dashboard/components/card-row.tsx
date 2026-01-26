'use client';

import React from 'react';
import Link from 'next/link';
import { CardStatusBadge } from './card-status-badge';
import { FamiliarityProgress } from './familiarity-progress';
import { Pencil, Trash, Play } from 'lucide-react';

interface Card {
  id: string;
  front: string;
  back: string;
  nextReviewAt: Date | null;
  interval: number;
  easeFactor: number;
  repetitions: number;
  state: string;
  createdAt: Date;
  updatedAt: Date;
  deck: {
    id: string;
    name: string;
  } | null;
}

interface CardRowProps {
  card: Card;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  deckId?: string | null;
}

export function CardRow({ card, sortBy = 'nextReviewAt', sortOrder = 'asc', deckId }: CardRowProps) {
  // Build review URL with current filters
  const buildReviewUrl = () => {
    const params = new URLSearchParams({
      mode: 'filtered',
      startCardId: card.id,
      sortBy,
      sortOrder,
    });

    if (deckId) {
      params.append('deckId', deckId);
    }

    return '/review?' + params.toString();
  };

  // Calculate card status
  const getCardStatus = (): { status: 'new' | 'due' | 'overdue' | 'scheduled'; daysUntil?: number } => {
    const now = new Date();
    const reviewDate = card.nextReviewAt ? new Date(card.nextReviewAt) : null;

    if (!reviewDate || card.state === 'NEW') {
      return { status: 'new' };
    }

    const diffTime = reviewDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'overdue' };
    } else if (diffDays === 0) {
      return { status: 'due' };
    } else {
      return { status: 'scheduled', daysUntil: diffDays };
    }
  };

  // Calculate familiarity based on ease factor and repetitions
  const familiarity = Math.min(100, Math.round(
    (card.easeFactor - 1.3) / (2.5 - 1.3) * 50 +
    (card.repetitions / 10) * 50
  ));

  // Get last reviewed text
  const getLastReviewedText = () => {
    if (card.state === 'NEW') {
      return 'Not reviewed yet';
    }

    const now = new Date();
    const diffTime = now.getTime() - (new Date(card.updatedAt)).getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Reviewed today';
    if (diffDays === 1) return 'Last reviewed 1 day ago';
    return `Last reviewed ${diffDays} days ago`;
  };

  const { status, daysUntil } = getCardStatus();

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      {/* Knowledge Point */}
      <td className="py-6 px-6">
        <div>
          <p className="font-medium text-gray-900">{card.front}</p>
          <p className="mt-2 text-sm text-gray-500">{getLastReviewedText()}</p>
        </div>
      </td>

      {/* Tags (Deck) */}
      <td className="py-6 px-6">
        {card.deck ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            {card.deck.name}
          </span>
        ) : (
          <span className="text-sm text-gray-400">No deck</span>
        )}
      </td>

      {/* Status */}
      <td className="py-6 px-6">
        <CardStatusBadge status={status} daysUntil={daysUntil} />
      </td>

      {/* Familiarity */}
      <td className="py-6 px-6">
        <FamiliarityProgress percentage={familiarity} />
      </td>

      {/* Actions */}
      <td className="py-6 px-6">
        <div className="flex items-center gap-2">
          <Link
            href={buildReviewUrl()}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            aria-label={`Start reviewing ${card.front}`}
            title="Start reviewing"
          >
            <Play className="h-4 w-4" />
          </Link>
          <Link
            href={`/cards/${card.id}/edit`}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            aria-label={`Edit ${card.front}`}
            title="Edit card"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label={`Delete ${card.front}`}
            title="Delete card"
            onClick={() => {
              // TODO: Implement delete functionality
              console.log('Delete card:', card.id);
            }}
          >
            <Trash className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
