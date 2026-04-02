'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FlashCard } from './flash-card';
import { RatingButtons } from './rating-buttons';
import { ProgressBar } from './progress-bar';
import { OutputExerciseView } from './exercises';
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
  const [outputExerciseAnswer, setOutputExerciseAnswer] = useState<string | null>(null);
  const [outputExerciseIsCorrect, setOutputExerciseIsCorrect] = useState<boolean | null>(null);

  const currentCard = session?.cards[currentIndex];
  const isFlashcardComplete = !currentCard;
  const flashcardProgress = currentIndex + 1;
  const flashcardTotal = session?.total || 0;

  // 确定当前卡片应该显示的输出练习级别
  const outputLevel: OutputLevel | null = currentCard
    ? getOutputLevel(currentCard.repetitions, currentCard.outputRepetitions || 0)
    : null;

  const isOutputExerciseMode = outputLevel !== null;

  const loadSingleFlashcard = useCallback(async () => {
    const cardId = searchParams.get('id');
    if (!cardId) return;

    setIsLoadingFlashcards(true);
    try {
      const response = await fetch(`/api/review/${cardId}`);
      if (!response.ok) throw new Error('Failed to fetch card');

      const data = await response.json();
      setSession({ cards: [data], total: 1, hasMore: false, nextCursor: undefined });
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
          cards: [...(prev?.cards || []), ...data.cards],
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

  const handleRating = useCallback(async (quality: number) => {
    if (!currentCard || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // 对于输出练习模式，需要传递额外的参数
      const requestBody: {
        cardId: string;
        quality: number;
        exerciseId?: string;
        isOutputCorrect?: boolean;
        outputLevel?: number;
        userAnswer?: string;
      } = {
        cardId: currentCard.id,
        quality,
      };

      // 如果是输出练习模式，添加输出练习相关数据
      if (isOutputExerciseMode && outputExerciseAnswer && outputLevel) {
        // exerciseId 会由后端通过 card.outputExercise.id 查找
        requestBody.exerciseId = undefined;

        // Level 1-2: 自动判断正确性
        if (outputLevel <= 2 && outputExerciseIsCorrect !== null) {
          requestBody.isOutputCorrect = outputExerciseIsCorrect;
          requestBody.outputLevel = outputLevel;
          requestBody.userAnswer = outputExerciseAnswer;
        } else {
          // Level 3-4: 用户自评，quality >= 3 认为正确
          requestBody.isOutputCorrect = quality >= 3;
          requestBody.outputLevel = outputLevel;
          requestBody.userAnswer = outputExerciseAnswer;
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
      const isLastOverallCard = nextIndex >= flashcardTotal && !session!.hasMore;

      // 重置输出练习状态
      setOutputExerciseAnswer(null);
      setOutputExerciseIsCorrect(null);

      if (isLastOverallCard) {
        if (typeParam === 'flashcard') {
          onComplete();
          setTimeout(() => router.push('/dashboard'), COMPLETION_REDIRECT_DELAY);
        } else {
          onTransitionToArticles();
        }
      } else if (nextIndex < session!.cards.length) {
        setCurrentIndex(nextIndex);
        setIsFlipped(false);
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
  }, [currentCard, currentIndex, session, isSubmitting, router, flashcardTotal, typeParam, isSingleMode, onComplete, onTransitionToArticles, isOutputExerciseMode, outputExerciseAnswer, outputExerciseIsCorrect, outputLevel]);

  // 处理输出练习提交（Level 1-2）
  const handleOutputExerciseSubmit = useCallback((answer: string, isCorrect?: boolean) => {
    setOutputExerciseAnswer(answer);
    if (typeof isCorrect === 'boolean') {
      setOutputExerciseIsCorrect(isCorrect);
      // Level 1-2: 根据正确性自动评分
      const quality = isCorrect ? 4 : 1;
      handleRating(quality);
    }
    // Level 3-4: 由用户在看到反馈后自评
  }, [handleRating]);

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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flashcards...</p>
        </div>
      </div>
    );
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 输出练习模式 */}
      {isOutputExerciseMode && currentCard && outputLevel ? (
        <div>
          <div className="max-w-4xl mx-auto px-8 py-6">
            <ProgressBar current={flashcardProgress} total={flashcardTotal} isSingleMode={isSingleMode} />
          </div>
          <OutputExerciseView
            card={currentCard}
            level={outputLevel}
            onSubmit={handleOutputExerciseSubmit}
            disabled={isSubmitting}
          />
        </div>
      ) : (
        /* 标准闪卡模式 */
        <div className="max-w-4xl mx-auto px-8 py-10">
          <ProgressBar current={flashcardProgress} total={flashcardTotal} isSingleMode={isSingleMode} />

          {currentCard && (
            <FlashCard
              card={currentCard}
              isFlipped={isFlipped}
              onFlip={handleFlip}
            />
          )}

          {isFlashcardComplete && isLoadingMore && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading more cards...</p>
            </div>
          )}

          {isFlipped && currentCard && (
            <RatingButtons
              onRate={handleRating}
              disabled={isSubmitting}
            />
          )}

          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function FlashcardReviewContainer(props: FlashcardReviewContainerProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <FlashcardReviewContainerContent {...props} />
    </Suspense>
  );
}
