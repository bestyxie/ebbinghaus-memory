'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FlashcardStandardView } from './flashcard-standard-view';
import { OutputExerciseView } from './exercises';
import { ReviewLoadingView } from './review-loading-view';
import { ReviewSession, OutputLevel } from '@/app/lib/types';
import { getOutputLevel } from '@/app/lib/output-exercises';
import { REVIEW_BATCH_SIZE } from '@/app/lib/constants';

interface FlashcardReviewContainerProps {
  typeParam: string | null;
  isSingleMode: boolean;
  onComplete: () => void;
  onTransitionToArticles: () => void;
}

const COMPLETION_REDIRECT_DELAY = 2000;

function FlashcardReviewContainerContent({
  typeParam,
  isSingleMode,
  onComplete,
  onTransitionToArticles,
}: FlashcardReviewContainerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [session, setSession] = useState<ReviewSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingFlashcards, setIsLoadingFlashcards] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [flashcardError, setFlashcardError] = useState<string | null>(null);

  // 输出练习相关状态
  const [outputExercisePendingRating, setOutputExercisePendingRating] = useState<number | null>(null);
  const [pendingOutputExerciseParams, setPendingOutputExerciseParams] = useState<{
    exerciseId: string;
    isCorrect: boolean;
    answer: string;
  } | null>(null);

  const currentItem = session?.items[currentIndex];
  const isFlashcardComplete = !currentItem;
  const flashcardProgress = currentIndex + 1;
  const flashcardTotal = session?.total || 0;

  // mode 由后端决定：'input' = 标准闪卡，'output' = 输出练习
  const isOutputExerciseMode = currentItem?.mode === 'output';
  const outputLevel: OutputLevel | null = isOutputExerciseMode
    ? getOutputLevel(currentItem!.outputRepetitions || 0)
    : null;

  const loadSingleFlashcard = useCallback(async () => {
    const cardId = searchParams.get('id');
    if (!cardId) return;

    setIsLoadingFlashcards(true);
    try {
      const response = await fetch(`/api/review/${cardId}`);
      if (!response.ok) throw new Error('Failed to fetch card');

      const data = await response.json();
      setSession({ items: [{ ...data, mode: 'input' as const }], total: 1, hasMore: false, nextCursor: undefined });
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err) {
      console.error('Error loading flashcard:', err);
      setFlashcardError('Failed to load card');
    } finally {
      setIsLoadingFlashcards(false);
    }
  }, [searchParams]);

  const loadFlashcards = useCallback(async (cursor?: string) => {
    if (cursor && (!session?.nextCursor || isLoadingMore)) return;

    try {
      if (!cursor) {
        setIsLoadingFlashcards(true);
      } else {
        setIsLoadingMore(true);
      }

      const params = new URLSearchParams();
      if (cursor) params.append('cursor', cursor);

      const response = await fetch(`/api/review?${params}`);
      if (!response.ok) {
        throw new Error(cursor ? 'Failed to fetch more cards' : 'Failed to fetch review session');
      }

      const data: ReviewSession = await response.json();

      if (!cursor) {
        setSession(data);
        setCurrentIndex(0);
        setIsFlipped(false);
      } else {
        setSession(prev => ({
          ...prev!,
          items: [...(prev?.items || []), ...data.items],
          hasMore: data.hasMore,
          nextCursor: data.nextCursor,
        }));
      }
    } catch (err) {
      console.error('Error loading flashcards:', err);
      setFlashcardError(cursor ? 'Failed to load more cards' : 'Failed to load review session');
    } finally {
      if (!cursor) {
        setIsLoadingFlashcards(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  }, [session?.nextCursor, isLoadingMore]);

  useEffect(() => {
    if (isSingleMode) {
      loadSingleFlashcard();
    } else {
      loadFlashcards();
    }
  }, [isSingleMode, loadSingleFlashcard, loadFlashcards]);

  useEffect(() => {
    if (!session || !session.hasMore || isLoadingMore) return;

    const cardsRemainingInBatch = REVIEW_BATCH_SIZE - (currentIndex % REVIEW_BATCH_SIZE);
    const shouldLoadMore = cardsRemainingInBatch <= 3;
    const needsLoad = isFlashcardComplete || shouldLoadMore;

    if (needsLoad) {
      loadFlashcards(session.nextCursor);
    }
  }, [currentIndex, session, isLoadingMore, loadFlashcards, isFlashcardComplete]);

  const handleFlip = useCallback(() => {
    if (isFlipped) return;
    setIsFlipped(true);
  }, [isFlipped]);

  const handleRating = useCallback(async (quality: number, outputExerciseParams?: {
    exerciseId: string;
    isCorrect: boolean;
    answer: string;
  }) => {
    if (!currentItem || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const requestBody: {
        cardId: string;
        quality: number;
        mode: 'input' | 'output';
        exerciseId?: string;
        isOutputCorrect?: boolean;
        outputLevel?: number;
        userAnswer?: string;
      } = {
        cardId: currentItem.id,
        quality,
        mode: currentItem.mode,
      };

      // 输出轨道附加参数
      if (currentItem.mode === 'output' && outputExerciseParams && outputLevel) {
        requestBody.exerciseId = outputExerciseParams.exerciseId;
        requestBody.outputLevel = outputLevel;
        requestBody.userAnswer = outputExerciseParams.answer;
        if (outputLevel <= 2) {
          requestBody.isOutputCorrect = outputExerciseParams.isCorrect;
        } else {
          requestBody.isOutputCorrect = quality >= 3;
        }
      }

      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error('Failed to submit rating');

      if (isSingleMode) {
        onComplete();
        setTimeout(() => router.push('/dashboard'), COMPLETION_REDIRECT_DELAY);
        return;
      }

      const nextIndex = currentIndex + 1;
      const isLastOverallItem = nextIndex >= flashcardTotal && !session!.hasMore;

      // 重置输出练习状态
      setOutputExercisePendingRating(null);
      setPendingOutputExerciseParams(null);

      if (isLastOverallItem) {
        if (typeParam === 'flashcard') {
          onComplete();
          setTimeout(() => router.push('/dashboard'), COMPLETION_REDIRECT_DELAY);
        } else {
          onTransitionToArticles();
        }
      } else {
        setCurrentIndex(nextIndex);
        setIsFlipped(false);
      }
    } catch (err) {
      console.error('Error submitting rating:', err);
      setFlashcardError('Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  }, [currentItem, currentIndex, session, isSubmitting, router, flashcardTotal, typeParam, isSingleMode, onComplete, onTransitionToArticles, outputLevel]);

  // 处理输出练习提交
  const handleOutputExerciseSubmit = useCallback((answer: string, isCorrect?: boolean, quality?: number, exerciseId?: string | null) => {
    if (typeof isCorrect === 'boolean' && exerciseId) {
      // Level 1-2: 自动判断正确性
      // 保存参数供 handleOutputExerciseContinue 使用
      setPendingOutputExerciseParams({
        exerciseId,
        isCorrect,
        answer,
      });
      // 计算评分，但等用户点击继续后再跳转
      const autoQuality = isCorrect ? 4 : 1;
      setOutputExercisePendingRating(autoQuality);
    } else if (typeof quality === 'number' && exerciseId) {
      // Level 3-4: 用户自评，直接传递参数进入下一张
      handleRating(quality, {
        exerciseId,
        isCorrect: quality >= 3,
        answer,
      });
    }
  }, [handleRating]);

  const handleOutputExerciseContinue = useCallback(() => {
    if (outputExercisePendingRating !== null && pendingOutputExerciseParams) {
      handleRating(outputExercisePendingRating, pendingOutputExerciseParams);
    }
  }, [outputExercisePendingRating, pendingOutputExerciseParams, handleRating]);

  useEffect(() => {
    // 输出练习模式下，键盘快捷键由子组件处理
    if (isOutputExerciseMode) return;

    if (!isFlipped || isFlashcardComplete || isSubmitting) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '1') handleRating(1);
      if (e.key === '2') handleRating(2);
      if (e.key === '3') handleRating(3);
      if (e.key === '4') handleRating(4);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFlipped, isFlashcardComplete, isSubmitting, handleRating, isOutputExerciseMode]);

  if (isLoadingFlashcards) {
    return <ReviewLoadingView mode="flashcard" />;
  }

  if (flashcardError && !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{flashcardError}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // 单个模式的标题 UI（普通模式的进度条在 FlashcardStandardView 中显示）
  const singleModeHeader = isSingleMode ? (
    <div className="max-w-4xl mx-auto px-8 py-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-2xl font-bold text-gray-900">
            {isOutputExerciseMode ? 'Output Practice' : 'Quick Review'}
          </h2>
          <span className="text-lg font-semibold text-blue-600">
            Single card
          </span>
        </div>
        <div className="text-sm text-gray-600">
          {isOutputExerciseMode
            ? 'Practice this card, then return to dashboard'
            : 'Review this card, then return to dashboard'}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {singleModeHeader}
      {/* 输出练习模式 */}
      {isOutputExerciseMode && currentItem && outputLevel ? (
        <OutputExerciseView
          card={currentItem}
          level={outputLevel}
          onSubmit={handleOutputExerciseSubmit}
          onContinue={handleOutputExerciseContinue}
          showContinue={outputExercisePendingRating !== null}
          disabled={isSubmitting}
        />
      ) : (
        /* 标准闪卡模式 */
        <FlashcardStandardView
          card={currentItem ?? null}
          isFlipped={isFlipped}
          isSubmitting={isSubmitting}
          isLoadingMore={isLoadingMore}
          current={flashcardProgress}
          total={flashcardTotal}
          onFlip={handleFlip}
          onRate={handleRating}
        />
      )}
    </div>
  );
}

export function FlashcardReviewContainer(props: FlashcardReviewContainerProps) {
  return <FlashcardReviewContainerContent {...props} />;
}
