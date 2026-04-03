'use client';

import { useRouter } from 'next/navigation';
import { FlashCard } from './flash-card';
import { RatingButtons } from './rating-buttons';
import { ProgressBar } from './progress-bar';
import type { CardWithDeck } from '@/app/lib/types';

interface FlashcardStandardViewProps {
  card: CardWithDeck | null;
  isFlipped: boolean;
  isSubmitting: boolean;
  isLoadingMore: boolean;
  current: number;
  total: number;
  onFlip: () => void;
  onRate: (quality: number) => void;
}

export function FlashcardStandardView({
  card,
  isFlipped,
  isSubmitting,
  isLoadingMore,
  current,
  total,
  onFlip,
  onRate,
}: FlashcardStandardViewProps) {
  const router = useRouter();
  const isComplete = !card;

  return (
    <div className="max-w-4xl mx-auto px-8 py-10">
      {/* 进度条 */}
      <ProgressBar current={current} total={total} />

      {/* 卡片 */}
      {card && (
        <FlashCard
          card={card}
          isFlipped={isFlipped}
          onFlip={onFlip}
        />
      )}

      {/* 加载更多状态 */}
      {isComplete && isLoadingMore && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading more cards...</p>
        </div>
      )}

      {/* 评分按钮（翻转后显示） */}
      {isFlipped && card && (
        <RatingButtons
          onRate={onRate}
          disabled={isSubmitting}
        />
      )}

      {/* 返回仪表盘 */}
      <div className="mt-8 text-center">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
