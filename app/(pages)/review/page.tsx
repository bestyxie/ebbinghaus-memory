'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FlashCard } from './components/flash-card';
import { RatingButtons } from './components/rating-buttons';
import { ProgressBar } from './components/progress-bar';
import { CompletionScreen } from './components/completion-screen';
import { CardWithDeck, ReviewSession } from '@/app/lib/types';

export default function ReviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [session, setSession] = useState<ReviewSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedStats, setCompletedStats] = useState<{
    totalReviewed: number;
    averageEaseFactor: number;
  } | null>(null);

  const currentCard = session?.cards[currentIndex];
  const isComplete = !currentCard;
  const progress = reviewedCount + 1;
  const total = session?.total || 0;

  // Fetch review session cards
  useEffect(() => {
    async function fetchSession() {
      try {
        setIsLoading(true);
        const mode = searchParams.get('mode') || 'all-due';
        const params = new URLSearchParams({ mode });

        if (mode === 'filtered') {
          const startCardId = searchParams.get('startCardId');
          const deckId = searchParams.get('deckId');
          const sortBy = searchParams.get('sortBy') || 'nextReviewAt';
          const sortOrder = searchParams.get('sortOrder') || 'asc';

          if (startCardId) params.append('startCardId', startCardId);
          if (deckId) params.append('deckId', deckId);
          params.append('sortBy', sortBy);
          params.append('sortOrder', sortOrder);
        }

        const response = await fetch(`/api/review?${params}`);
        if (!response.ok) {
          throw new Error('Failed to fetch review session');
        }

        const data: ReviewSession = await response.json();
        setSession(data);
      } catch (err) {
        console.error('Error fetching session:', err);
        setError('Failed to load review session');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSession();
  }, [searchParams]);

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
  }, [isFlipped, isComplete, isSubmitting]);

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

      // Update progress first
      setReviewedCount(prev => prev + 1);

      // Move to next card
      const nextIndex = currentIndex + 1;
      if (nextIndex >= session!.cards.length) {
        // Session complete - calculate stats
        const totalReviewed = reviewedCount + 1;
        const avgEaseFactor = session!.cards.reduce((sum, card, idx) => {
          if (idx <= currentIndex) return sum + card.easeFactor;
          return sum;
        }, 0) / totalReviewed;

        setCompletedStats({
          totalReviewed,
          averageEaseFactor: avgEaseFactor,
        });
      } else {
        setCurrentIndex(nextIndex);
        setIsFlipped(false);
      }
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError('Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  }, [currentCard, currentIndex, reviewedCount, session, isSubmitting]);

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleStartNewSession = () => {
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

  if (isComplete && completedStats) {
    return (
      <CompletionScreen
        stats={completedStats}
        onBackToDashboard={handleBackToDashboard}
        onStartNewSession={handleStartNewSession}
      />
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
