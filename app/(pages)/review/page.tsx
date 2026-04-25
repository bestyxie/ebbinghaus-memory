'use client';
export const dynamic = 'force-dynamic';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ReviewSession } from '@/app/lib/types';
import { ReviewLoadingView } from './components/review-loading-view';
import { ReviewTransitionView } from './components/review-transition-view';
import { ReviewCompleteView } from './components/review-complete-view';
import { ReviewEmptyView } from './components/review-empty-view';
import { FlashcardReviewContainer } from './components/flashcard-review-container';
import { ArticleReviewContainer } from './components/article-review-container';

type ReviewMode = 'flashcard' | 'article' | 'transition' | 'complete' | 'empty';

function ReviewPageContent() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');
  const isSingleMode = searchParams.get('single') === 'true';

  const [mode, setMode] = useState<ReviewMode>(() => {
    if (typeParam === 'article') return 'article';
    return 'flashcard';
  });

  const [session, setSession] = useState<ReviewSession | null>(null);
  const [isLoadingFlashcards, setIsLoadingFlashcards] = useState(true);

  const handleComplete = useCallback(() => {
    setMode('complete');
  }, []);

  const handleTransitionToArticles = useCallback(() => {
    setMode('article');
  }, []);

  const handleNoArticles = useCallback(() => {
    setMode('complete');
  }, []);

  // Initial data fetch for flashcard mode detection
  useEffect(() => {
    const checkForContent = async () => {
      if (mode === 'flashcard' && !isSingleMode) {
        const response = await fetch('/api/review');
        if (response.ok) {
          const data: ReviewSession = await response.json();
          setSession(data);
          setIsLoadingFlashcards(false);

          // Auto-transition to articles if no flashcards (Review All mode)
          if (typeParam === null && data.items.length === 0 && !data.hasMore) {
            setMode('article');
          }
        }
      }
    };

    checkForContent();
  }, [mode, isSingleMode, typeParam]);

  // Handle empty state for flashcards only
  useEffect(() => {
    if (isLoadingFlashcards) return;
    if ((typeParam === 'flashcard' || typeParam === null) && session === null) return;

    const hasFlashcards = (session?.items?.length ?? 0) > 0 || session?.hasMore;

    // Flashcards Only mode - no flashcards available
    if (typeParam === 'flashcard' && !hasFlashcards) {
      setMode('empty');
    }

    // Review All mode - no flashcards and no articles (article check happens in container)
    if (typeParam === null && !hasFlashcards) {
      // Let the ArticleReviewContainer handle the empty check for articles
      // If flashcards are empty, we'll transition to article mode and check there
    }
  }, [typeParam, isLoadingFlashcards, session]);

  // Loading state (only for flashcards, articles handle their own loading)
  if (mode === 'flashcard' && isLoadingFlashcards && !isSingleMode) {
    return <ReviewLoadingView mode={mode} />;
  }

  // Empty view - only for flashcards only mode
  if (mode === 'empty') {
    return <ReviewEmptyView type={typeParam === 'flashcard' || typeParam === 'article' ? typeParam : null} />;
  }

  // Complete view
  if (mode === 'complete') {
    return <ReviewCompleteView />;
  }

  // Transition view
  if (mode === 'transition') {
    return (
      <ReviewTransitionView
        flashcardTotal={session?.total || 0}
        onContinue={handleTransitionToArticles}
      />
    );
  }

  // Flashcard mode
  if (mode === 'flashcard') {
    return (
      <FlashcardReviewContainer
        typeParam={typeParam}
        isSingleMode={isSingleMode}
        onComplete={handleComplete}
        onTransitionToArticles={handleTransitionToArticles}
      />
    );
  }

  // Article mode
  if (mode === 'article') {
    return (
      <ArticleReviewContainer
        isSingleMode={isSingleMode}
        onComplete={handleComplete}
        onNoArticles={handleNoArticles}
      />
    );
  }

  return null;
}

export default function ReviewPage() {
  return <Suspense><ReviewPageContent /></Suspense>;
}
