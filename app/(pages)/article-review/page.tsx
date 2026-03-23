'use client'

import { useEffect, useState, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArticleCard } from '@/app/lib/types'
import { ArticleStudyView } from './components/article-study-view'

export default function ArticleReviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const startCardId = searchParams.get('startCardId')

  const [articles, setArticles] = useState<ArticleCard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [studyStartTime, setStudyStartTime] = useState<number>(Date.now())

  useEffect(() => {
    fetch('/api/article-review')
      .then((res) => res.json())
      .then((data) => {
        const fetchedArticles = data.cards || []
        setArticles(fetchedArticles)

        // Find the index of the start card if specified
        if (startCardId) {
          const startIndex = fetchedArticles.findIndex((a: ArticleCard) => a.id === startCardId)
          if (startIndex !== -1) {
            setCurrentIndex(startIndex)
          }
        }

        setLoading(false)
        setStudyStartTime(Date.now())
      })
      .catch((error) => {
        console.error('Failed to fetch articles:', error)
        setLoading(false)
      })
  }, [startCardId])

  const currentArticle = articles[currentIndex]

  const handleCompleteReview = async (quality: number) => {
    if (!currentArticle) return

    const studyTimeMs = Date.now() - studyStartTime

    try {
      const response = await fetch('/api/article-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: currentArticle.id,
          quality,
          studyTimeMs,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit review')
      }

      // Move to next article or redirect to dashboard
      if (currentIndex < articles.length - 1) {
        setCurrentIndex((prev) => prev + 1)
        setStudyStartTime(Date.now())
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Failed to submit review:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading articles...</p>
        </div>
      </div>
    )
  }

  if (!currentArticle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">No Articles Due</h2>
          <p className="text-gray-600 mb-6">You don't have any articles due for review right now.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ArticleStudyView
        article={currentArticle}
        currentIndex={currentIndex}
        totalArticles={articles.length}
        onComplete={handleCompleteReview}
      />
    </div>
  )
}
