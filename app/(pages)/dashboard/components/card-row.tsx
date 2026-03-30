'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CardStatusBadge } from './card-status-badge';
import { FamiliarityProgress } from './familiarity-progress';
import { EditCardModal } from './edit-card-modal';
import { PopConfirm } from '@/app/components/ui/popconfirm';
import { Pencil, Trash, PlayCircle, FileText } from 'lucide-react';
import { CardWithDeck } from '@/app/lib/types';

const ACTION_BTN_CLASS = 'p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all';

interface CardRowProps {
  card: CardWithDeck;
}

export function CardRow({ card }: CardRowProps) {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleDeleteCard = async () => {
    try {
      const response = await fetch(`/api/cards/${card.id}`, { method: 'DELETE' });
      if (!response.ok) {
        let message = 'Failed to delete card. Please try again.';
        try {
          const body = await response.json();
          if (body?.error) message = body.error;
        } catch {
          // Non-JSON response (e.g. gateway error) — use generic message
        }
        throw new Error(message);
      }
      router.refresh();
    } catch (error) {
      console.error('Error deleting card:', error);
      throw error;
    }
  };

  const buildReviewUrl = () => {
    // For article cards, go to article review mode
    if (isArticleCard) {
      return `/review?type=article&id=${card.id}&single=true`;
    }
    // For flashcards, go to flashcard review mode
    return `/review?type=flashcard&id=${card.id}&single=true`;
  };

  const getCardStatus = (): { status: 'new' | 'due' | 'overdue' | 'scheduled'; daysUntil?: number } => {
    const now = new Date();
    const reviewDate = card.nextReviewAt ? new Date(card.nextReviewAt) : null;
    if (!reviewDate || card.state === 'NEW') return { status: 'new' };
    const diffDays = Math.ceil((reviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { status: 'overdue' };
    if (diffDays === 0) return { status: 'due' };
    return { status: 'scheduled', daysUntil: diffDays };
  };

  const familiarity = Math.min(100, Math.round(
    (card.easeFactor - 1.3) / (2.5 - 1.3) * 50 + (card.repetitions / 10) * 50
  ));

  const getLastReviewedText = () => {
    if (card.state === 'NEW') return 'Not reviewed yet';
    const diffDays = Math.floor((Date.now() - new Date(card.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Reviewed today';
    if (diffDays === 1) return 'Last reviewed 1 day ago';
    return `Last reviewed ${diffDays} days ago`;
  };

  const { status, daysUntil } = getCardStatus();
  const isOverdue = status === 'overdue';
  const isArticleCard = card.cardType === 'ARTICLE';

  const deckColor = card.deck?.color;
  const tagStyle = deckColor ? {
    backgroundColor: `${deckColor}20`,
    borderColor: `${deckColor}50`,
    color: deckColor,
  } : undefined;

  // For article cards, get article-specific metadata
  const getArticleMetadata = () => {
    if (!isArticleCard) return null;
    const wordCount = card.wordCount || 0;
    const blocksCount = card.recallBlocks?.length || 0;
    return { wordCount, blocksCount };
  };

  const articleMetadata = getArticleMetadata();

  return (
    <>
      <tr className={`group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30 ${isOverdue ? 'bg-rose-50/10 dark:bg-rose-950/5' : ''}`}>
        {/* Knowledge Point */}
        <td className="px-6 py-5">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              {isArticleCard && (
                <FileText className="h-4 w-4 text-purple-500 flex-shrink-0" />
              )}
              <span className={`font-bold text-sm transition-colors ${isOverdue ? 'text-rose-500 group-hover:underline' : 'text-slate-900 dark:text-white group-hover:text-blue-600'}`}>
                {isArticleCard ? card.articleTitle || card.front : card.front}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 uppercase font-medium tracking-tight">
              {isArticleCard && articleMetadata ? (
                <>
                  {articleMetadata.wordCount} words · {articleMetadata.blocksCount} blocks
                </>
              ) : (
                getLastReviewedText()
              )}
            </span>
          </div>
        </td>

        {/* Tags (Deck) */}
        <td className="px-6 py-5">
          {card.deck ? (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border"
              style={tagStyle}
            >
              {card.deck.title}
            </span>
          ) : (
            <span className="text-[10px] text-slate-400">No deck</span>
          )}
        </td>

        {/* Status */}
        <td className="px-6 py-5">
          <CardStatusBadge status={status} daysUntil={daysUntil} />
        </td>

        {/* Familiarity */}
        <td className="px-6 py-5">
          <FamiliarityProgress percentage={familiarity} />
        </td>

        {/* Actions */}
        <td className="px-6 py-5 text-right">
          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
            <Link
              href={buildReviewUrl()}
              className={`${ACTION_BTN_CLASS} hover:text-blue-600`}
              aria-label={`Start reviewing ${card.front}`}
              title="Start reviewing"
            >
              <PlayCircle className="h-[18px] w-[18px]" />
            </Link>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className={`${ACTION_BTN_CLASS} hover:text-blue-600`}
              aria-label={`Edit ${card.front}`}
              title="Edit card"
            >
              <Pencil className="h-[18px] w-[18px]" />
            </button>
            <PopConfirm
              title="Delete card?"
              description="This action cannot be undone."
              onConfirm={handleDeleteCard}
              isDestructive={true}
              confirmText="Delete"
              cancelText="Cancel"
            >
              <button
                className={`${ACTION_BTN_CLASS} hover:text-rose-500`}
                aria-label={`Delete ${card.front}`}
                title="Delete card"
              >
                <Trash className="h-[18px] w-[18px]" />
              </button>
            </PopConfirm>
          </div>
        </td>
      </tr>

      <EditCardModal card={card} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
    </>
  );
}
