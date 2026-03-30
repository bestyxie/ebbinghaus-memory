'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArticleCard } from '@/app/lib/types';
import { ArticleStudyView } from './article-study-view';

interface ArticleReviewContainerProps {
  isSingleMode: boolean;
  onComplete: () => void;
  onNoArticles?: () => void;
}

const COMPLETION_REDIRECT_DELAY = 2000;

function ArticleReviewContainerContent({
  isSingleMode,
  onComplete,
  onNoArticles,
}: ArticleReviewContainerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasNotifiedNoArticles = useRef(false);

  const [articles, setArticles] = useState<ArticleCard[]>([]);
  const [articleIndex, setArticleIndex] = useState(0);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  const [hasLoadedArticles, setHasLoadedArticles] = useState(false);

  const currentArticle = articles[articleIndex];

  const loadSingleArticle = useCallback(async () => {
    const cardId = searchParams.get('id');
    if (!cardId) return;

    setIsLoadingArticles(true);
    try {
      const response = await fetch(`/api/article-review/${cardId}`);
      if (!response.ok) throw new Error('Failed to fetch article');

      const data = await response.json();
      setArticles([data]);
      setArticleIndex(0);
    } catch (error) {
      console.error('Failed to fetch article:', error);
    } finally {
      setIsLoadingArticles(false);
      setHasLoadedArticles(true);
    }
  }, [searchParams]);

  const loadArticles = useCallback(async () => {
    setIsLoadingArticles(true);
    try {
      const response = await fetch('/api/article-review');
      if (!response.ok) throw new Error('Failed to fetch articles');

      const data = await response.json();
      const fetchedArticles = data.cards || [];
      setArticles(fetchedArticles);
      setArticleIndex(0);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setIsLoadingArticles(false);
      setHasLoadedArticles(true);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      if (isSingleMode) {
        await loadSingleArticle();
      } else {
        await loadArticles();
      }
    };

    load();
  }, [isSingleMode, loadSingleArticle, loadArticles]);

  // Check for empty articles after loading completes (only once)
  useEffect(() => {
    if (
      !isSingleMode &&
      hasLoadedArticles &&
      !isLoadingArticles &&
      articles.length === 0 &&
      !hasNotifiedNoArticles.current
    ) {
      hasNotifiedNoArticles.current = true;
      onNoArticles?.();
    }
  }, [isSingleMode, hasLoadedArticles, isLoadingArticles, articles.length, onNoArticles]);

  const handleRating = useCallback(async (quality: number) => {
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

      if (!response.ok) throw new Error('Failed to submit review');

      if (isSingleMode) {
        onComplete();
        setTimeout(() => router.push('/dashboard'), COMPLETION_REDIRECT_DELAY);
        return;
      }

      if (articleIndex < articles.length - 1) {
        setArticleIndex(prev => prev + 1);
      } else {
        onComplete();
        setTimeout(() => router.push('/dashboard'), COMPLETION_REDIRECT_DELAY);
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  }, [currentArticle, articleIndex, articles.length, router, isSingleMode, onComplete]);

  if (isLoadingArticles) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading articles...</p>
        </div>
      </div>
    );
  }

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
      onComplete={handleRating}
      isSingleMode={isSingleMode}
    />
  );
}

export function ArticleReviewContainer(props: ArticleReviewContainerProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ArticleReviewContainerContent {...props} />
    </Suspense>
  );
}
