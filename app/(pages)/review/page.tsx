'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FlashCard } from './components/flash-card';
import { RatingButtons } from './components/rating-buttons';
import { ProgressBar } from './components/progress-bar';
import { ReviewSession, ArticleCard } from '@/app/lib/types';
import { REVIEW_BATCH_SIZE } from '@/app/lib/constants';
import { ArticleStudyView } from './components/article-study-view';
import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

type ReviewMode = 'flashcard' | 'article' | 'transition' | 'complete' | 'empty';

// Auto-redirect delay after completion (ms)
const COMPLETION_REDIRECT_DELAY = 2000;

function ReviewPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const typeParam = searchParams.get('type');
  const isSingleMode = searchParams.get('single') === 'true';

  // Flashcard state
  const [session, setSession] = useState<ReviewSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoadingFlashcards, setIsLoadingFlashcards] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [flashcardError, setFlashcardError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Article state
  const [articles, setArticles] = useState<ArticleCard[]>([]);
  const [articleIndex, setArticleIndex] = useState(0);
  const [isLoadingArticles, setIsLoadingArticles] = useState(typeParam === 'article'); // Start loading if article mode
  const [articlesCount, setArticlesCount] = useState(0);
  const [hasLoadedArticles, setHasLoadedArticles] = useState(false); // Track if articles have been loaded

  // Mode state - initialize based on URL param
  const [mode, setMode] = useState<ReviewMode>(() => {
    if (typeParam === 'article') return 'article';
    return 'flashcard';
  });

  const currentCard = session?.cards[currentIndex];
  const currentArticle = articles[articleIndex];
  const isFlashcardComplete = !currentCard && mode === 'flashcard';
  const flashcardProgress = reviewedCount + 1;
  const flashcardTotal = session?.total || 0;

  // Load single flashcard (for single mode)
  const loadSingleFlashcard = useCallback(async () => {
    const cardId = searchParams.get('id');
    if (!cardId) return;

    setIsLoadingFlashcards(true);
    try {
      const response = await fetch(`/api/review/${cardId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch card');
      }

      const data = await response.json();
      setSession({
        cards: [data],
        total: 1,
        hasMore: false,
        nextCursor: undefined,
      });
      setCurrentIndex(0);
      setReviewedCount(0);
      setIsFlipped(false);
    } catch (err) {
      console.error('Error loading flashcard:', err);
      setFlashcardError('Failed to load card');
    } finally {
      setIsLoadingFlashcards(false);
    }
  }, [searchParams]);

  // Load flashcards (for batch mode)
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
        setReviewedCount(0);
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

  // Load single article (for single mode)
  const loadSingleArticle = useCallback(async () => {
    const cardId = searchParams.get('id');
    if (!cardId) return;

    setIsLoadingArticles(true);
    try {
      const response = await fetch(`/api/article-review/${cardId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }

      const data = await response.json();
      setArticles([data]);
      setArticlesCount(1);
      setArticleIndex(0);
    } catch (error) {
      console.error('Failed to fetch article:', error);
    } finally {
      setIsLoadingArticles(false);
      setHasLoadedArticles(true);
    }
  }, [searchParams]);

  // Load articles (for batch mode)
  const loadArticles = useCallback(async () => {
    setIsLoadingArticles(true);
    try {
      const response = await fetch('/api/article-review');
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      const data = await response.json();
      const fetchedArticles = data.cards || [];
      setArticles(fetchedArticles);
      setArticlesCount(fetchedArticles.length);
      setArticleIndex(0);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setIsLoadingArticles(false);
      setHasLoadedArticles(true);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (mode === 'flashcard') {
      if (isSingleMode) {
        loadSingleFlashcard();
      } else {
        loadFlashcards();
      }
    } else if (mode === 'article') {
      if (isSingleMode) {
        loadSingleArticle();
      } else {
        loadArticles();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, isSingleMode]);

  // Load more flashcards when near end
  useEffect(() => {
    if (mode !== 'flashcard' || !session || !session.hasMore || isLoadingMore) return;

    const cardsRemainingInBatch = REVIEW_BATCH_SIZE - (currentIndex % REVIEW_BATCH_SIZE);
    const shouldLoadMore = cardsRemainingInBatch <= 3;
    const needsLoad = isFlashcardComplete || shouldLoadMore;

    if (needsLoad) {
      loadFlashcards(session.nextCursor);
    }
  }, [currentIndex, session, isLoadingMore, loadFlashcards, isFlashcardComplete, mode, session?.nextCursor]);

  // Load articles when transitioning to article mode
  useEffect(() => {
    if (mode === 'article' && articles.length === 0 && !isLoadingArticles) {
      loadArticles();
    }
  }, [mode, articles.length, isLoadingArticles, loadArticles]);

  // Auto-transition to articles when no flashcards available (Review All mode)
  useEffect(() => {
    if (
      mode === 'flashcard' &&
      !isLoadingFlashcards &&
      !isLoadingMore &&
      session !== null &&
      session.cards.length === 0 &&
      !session.hasMore &&
      typeParam === null &&
      !isLoadingArticles
    ) {
      // No flashcards available, check for articles
      if (articles.length === 0) {
        // Need to load articles first
        loadArticles();
      } else {
        // Articles loaded, transition to article mode
        setMode('article');
      }
    }

    // Review All mode: checked both flashcards and articles, both empty
    if (
      typeParam === null &&
      !isLoadingFlashcards &&
      !isLoadingMore &&
      !isLoadingArticles &&
      session !== null &&
      session.cards.length === 0 &&
      !session.hasMore &&
      articles.length === 0
    ) {
      setMode('empty');
    }

    // Flashcards Only mode - no flashcards available
    if (
      mode === 'flashcard' &&
      typeParam === 'flashcard' &&
      !isLoadingFlashcards &&
      !isLoadingMore &&
      session !== null &&
      session.cards.length === 0 &&
      !session.hasMore
    ) {
      setMode('empty');
    }

    // Articles Only mode - no articles available
    if (
      mode === 'article' &&
      typeParam === 'article' &&
      !isLoadingArticles &&
      hasLoadedArticles &&
      articles.length === 0
    ) {
      setMode('empty');
    }
  }, [mode, isLoadingFlashcards, isLoadingMore, session, typeParam, loadArticles, isLoadingArticles, articles.length, hasLoadedArticles]);

  const handleFlip = useCallback(() => {
    if (isFlipped) return;
    setIsFlipped(true);
  }, [isFlipped]);

  const handleFlashcardRating = useCallback(async (quality: number) => {
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

      // Single mode: redirect to dashboard immediately
      if (isSingleMode) {
        setMode('complete');
        setTimeout(() => router.push('/dashboard'), COMPLETION_REDIRECT_DELAY);
        return;
      }

      setReviewedCount(prev => prev + 1);
      const nextIndex = currentIndex + 1;
      const isLastOverallCard = nextIndex >= flashcardTotal && !session!.hasMore;

      if (isLastOverallCard) {
        // Flashcards complete - check if we should transition to articles
        // (Flashcards Only mode: typeParam === 'flashcard', show completion immediately)
        if (typeParam === 'flashcard') {
          setMode('complete');
          setTimeout(() => router.push('/dashboard'), COMPLETION_REDIRECT_DELAY);
        } else {
          // Review All mode: load article count and show transition
          const articleResponse = await fetch('/api/article-review');
          if (articleResponse.ok) {
            const data = await articleResponse.json();
            const articleCount = data.cards?.length || 0;
            setArticlesCount(articleCount);

            if (articleCount > 0) {
              setMode('transition');
            } else {
              setMode('complete');
              setTimeout(() => router.push('/dashboard'), COMPLETION_REDIRECT_DELAY);
            }
          } else {
            setMode('complete');
            setTimeout(() => router.push('/dashboard'), COMPLETION_REDIRECT_DELAY);
          }
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
  }, [currentCard, currentIndex, session, isSubmitting, router, flashcardTotal, typeParam, isSingleMode]);

  const handleArticleRating = useCallback(async (quality: number) => {
    if (!currentArticle) return;

    const studyTimeMs = currentArticle.totalStudyTimeMs || 0;

    try {
      const response = await fetch('/api/article-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: currentArticle.id,
          quality,
          studyTimeMs,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      // Single mode: redirect to dashboard immediately
      if (isSingleMode) {
        setMode('complete');
        setTimeout(() => router.push('/dashboard'), COMPLETION_REDIRECT_DELAY);
        return;
      }

      if (articleIndex < articles.length - 1) {
        setArticleIndex((prev) => prev + 1);
      } else {
        // Show completion page before redirecting
        setMode('complete');
        setTimeout(() => router.push('/dashboard'), COMPLETION_REDIRECT_DELAY);
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  }, [currentArticle, articleIndex, articles.length, router, isSingleMode]);

  const handleTransitionToArticles = useCallback(() => {
    setMode('article');
  }, []);

  const handleSkipArticles = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  // Keyboard shortcuts for flashcard rating
  useEffect(() => {
    if (mode !== 'flashcard' || !isFlipped || isFlashcardComplete || isSubmitting) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '1') handleFlashcardRating(1);
      if (e.key === '2') handleFlashcardRating(2);
      if (e.key === '3') handleFlashcardRating(3);
      if (e.key === '4') handleFlashcardRating(4);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [mode, isFlipped, isFlashcardComplete, isSubmitting, handleFlashcardRating]);

  // Loading state
  if ((mode === 'flashcard' && isLoadingFlashcards) || (mode === 'article' && isLoadingArticles)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {mode === 'flashcard' ? 'Loading flashcards...' : 'Loading articles...'}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (flashcardError && !session && mode === 'flashcard') {
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

  // Transition view
  if (mode === 'transition') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="h-20 w-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-3 text-gray-800">
            Great job! 🎉
          </h2>

          <p className="text-gray-600 mb-6">
            You&apos;ve reviewed <span className="font-bold text-blue-600">{flashcardTotal}</span> flashcards and strengthened your memory.
          </p>

          {articlesCount > 0 ? (
            <>
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <p className="text-blue-800">
                  You have <span className="font-bold text-blue-600">{articlesCount}</span> article(s) to read
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleTransitionToArticles}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all hover:scale-105"
                >
                  Continue to Articles
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button
                  onClick={handleSkipArticles}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Skip for Now
                </button>
              </div>
            </>
          ) : (
            <div className="bg-green-50 rounded-xl p-4 mb-6">
              <p className="text-green-800 flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                No articles due for review
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Complete view
  if (mode === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="h-20 w-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-3 text-gray-800">
            All done! 🎊
          </h2>

          <p className="text-gray-600 mb-6">
            You&apos;ve completed all your reviews for today
          </p>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Empty view - no content to review
  if (mode === 'empty') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="h-20 w-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-3 text-gray-800">
            All caught up! 🎉
          </h2>

          <p className="text-gray-600 mb-6">
            {typeParam === 'flashcard'
              ? 'No flashcards due for review right now'
              : typeParam === 'article'
              ? 'No articles due for review right now'
              : 'No content due for review right now'}
          </p>

          <p className="text-sm text-gray-500 mb-6">
            Keep up the great work!
          </p>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Flashcard mode
  if (mode === 'flashcard') {
    return (
      <div className="min-h-screen bg-gray-50">
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
              onRate={handleFlashcardRating}
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
      </div>
    );
  }

  // Article mode
  if (mode === 'article') {
    if (!currentArticle) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4">No Articles Due</h2>
            <p className="text-gray-600 mb-6">You don&apos;t have any articles due for review right now.</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return (
      <ArticleStudyView
        article={currentArticle}
        currentIndex={articleIndex}
        totalArticles={articles.length}
        onComplete={handleArticleRating}
        isSingleMode={isSingleMode}
      />
    );
  }

  return null;
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
