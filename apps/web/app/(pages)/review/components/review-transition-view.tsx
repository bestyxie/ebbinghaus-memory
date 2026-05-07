'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

interface ReviewTransitionViewProps {
  flashcardTotal: number;
  onContinue: () => void;
}

export function ReviewTransitionView({
  flashcardTotal,
  onContinue,
}: ReviewTransitionViewProps) {
  const router = useRouter();
  const [articlesCount, setArticlesCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticlesCount = async () => {
      try {
        const response = await fetch('/api/article-review');
        if (response.ok) {
          const data = await response.json();
          setArticlesCount(data.cards?.length || 0);
        }
      } catch (error) {
        console.error('Failed to fetch articles count:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticlesCount();
  }, []);

  const handleSkip = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
                onClick={onContinue}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all hover:scale-105"
              >
                Continue to Articles
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={handleSkip}
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
