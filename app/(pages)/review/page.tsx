'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FlashCard } from './components/flash-card';
import { RatingButtons } from './components/rating-buttons';
import { ProgressBar } from './components/progress-bar';
import { ReviewSession } from '@/app/lib/types';
import { REVIEW_BATCH_SIZE } from '@/app/lib/constants';
import { Suspense } from 'react';

function ReviewPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [session, setSession] = useState<ReviewSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentCard = session?.cards[currentIndex];
  const isComplete = !currentCard;
  const progress = reviewedCount + 1;
  const total = session?.total || 0;

  // Load cards - can be initial load or load more
  const loadCards = useCallback(async (cursor?: string) => {
    // Prevent duplicate loading
    if (cursor && (!session?.nextCursor || isLoadingMore)) return;

    try {
      if (!cursor) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const mode = searchParams.get('mode') || 'all-due';
      const params = new URLSearchParams({ mode });

      if (mode === 'filtered') {
        const startCardId = searchParams.get('startCardId');
        const deckId = searchParams.get('deckId');
        const sortBy = searchParams.get('sortBy') || 'nextReviewAt';
        const sortOrder = searchParams.get('sortOrder') || 'asc';

        if (startCardId && !cursor) params.append('startCardId', startCardId);
        if (deckId) params.append('deckId', deckId);
        params.append('sortBy', sortBy);
        params.append('sortOrder', sortOrder);
      }

      if (cursor) {
        params.append('cursor', cursor);
      }

      const response = await fetch(`/api/review?${params}`);
      if (!response.ok) {
        throw new Error(cursor ? 'Failed to fetch more cards' : 'Failed to fetch review session');
      }

      const data: ReviewSession = await response.json();

      if (!cursor) {
        // Initial load - replace session and reset state
        setSession(data);
        setCurrentIndex(0);
        setReviewedCount(0);
        setIsFlipped(false);
      } else {
        // Load more - append cards to existing session
        setSession(prev => ({
          ...prev!,
          cards: [...(prev?.cards || []), ...data.cards],
          hasMore: data.hasMore,
          nextCursor: data.nextCursor,
        }));
      }
    } catch (err) {
      console.error('Error loading cards:', err);
      setError(cursor ? 'Failed to load more cards' : 'Failed to load review session');
    } finally {
      if (!cursor) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  }, [searchParams, session?.nextCursor, isLoadingMore]);

  // Initial load - only run on mount
  useEffect(() => {
    loadCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load more cards when we're near the end of the current batch
  useEffect(() => {
    if (!session || !session.hasMore || isLoadingMore) return;

    // Load more when we have 3 cards left in the current batch
    const cardsRemainingInBatch = REVIEW_BATCH_SIZE - (currentIndex % REVIEW_BATCH_SIZE);
    const shouldLoadMore = cardsRemainingInBatch <= 3;

    // Also load if we're at the end and have more cards available
    const needsLoad = isComplete || shouldLoadMore;

    if (needsLoad) {
      loadCards(session.nextCursor);
    }
  }, [currentIndex, session, isLoadingMore, loadCards, isComplete, session?.nextCursor]);

  const handleFlip = useCallback(() => {
    if (isFlipped) return; // Can't flip back once answer is shown
    setIsFlipped(true);
  }, [isFlipped]);

  const handleRating = useCallback(async (quality: number) => {
    if (!currentCard || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: currentCard.id, quality }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      // Update progress
      setReviewedCount(prev => prev + 1);

      // Move to next card
      const nextIndex = currentIndex + 1;

      // Check if this was the last card and there are no more cards to load
      const isLastOverallCard = nextIndex >= total && !session!.hasMore;

      if (isLastOverallCard) {
        // Session complete - redirect to dashboard
        router.push('/dashboard');
      } else if (nextIndex < session!.cards.length) {
        // Move to next card in current batch
        setCurrentIndex(nextIndex);
        setIsFlipped(false);
      } else {
        // We've reached the end of current batch but hasMore is true
        // Update index to point to the first card of next batch
        setCurrentIndex(nextIndex);
        setIsFlipped(false);
        // The useEffect will load more cards
      }
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError('Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  }, [currentCard, currentIndex, session, isSubmitting, router, total]);

  // Keyboard shortcuts for rating
  useEffect(() => {
    if (!isFlipped || isComplete || isSubmitting) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '1') handleRating(1);
      if (e.key === '2') handleRating(2);
      if (e.key === '3') handleRating(3);
      if (e.key === '4') handleRating(4);
      if (e.key === ' ') setIsFlipped(false); // Space to flip back
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFlipped, isComplete, isSubmitting, handleRating]);

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading review session...</p>
        </div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleBackToDashboard}
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
      <div className="max-w-4xl mx-auto px-8 py-10">
        {/* Progress Bar */}
        <ProgressBar current={progress} total={total} />

        {/* Flash Card */}
        {currentCard && (
          <FlashCard
            card={currentCard}
            isFlipped={isFlipped}
            onFlip={handleFlip}
          />
        )}

        {/* Loading more cards */}
        {isComplete && isLoadingMore && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading more cards...</p>
          </div>
        )}

        {/* Rating Buttons - Only show when flipped */}
        {isFlipped && currentCard && (
          <RatingButtons
            onRate={handleRating}
            disabled={isSubmitting}
          />
        )}

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleBackToDashboard}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading review session...</p>
        </div>
      </div>
    }>
      <ReviewPageContent />
    </Suspense>
  );
}
