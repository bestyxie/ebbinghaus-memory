'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArticleEditor } from './components/article-editor'
import { MetricCard } from './components/metric-card'
import { RecallBlock } from '@/app/lib/types'
import { calculateWordCount, calculateReadTime, calculateReadability } from '@/app/lib/text-analysis'

export default function ArticleEditorPage() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [recallBlocks, setRecallBlocks] = useState<RecallBlock[]>([])
  const [selectedDeckId] = useState<string>()
  const [isPreview, setIsPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string>()

  const handleSave = async () => {
    if (!title.trim()) { setError('Please enter a title'); return }
    if (!content.trim()) { setError('Please enter article content'); return }

    setIsSaving(true)
    setError(undefined)

    try {
      const response = await fetch('/api/article-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleTitle: title,
          articleContent: content,
          deckId: selectedDeckId,
          recallBlocks,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save article')
      }

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save article')
      setIsSaving(false)
    }
  }

  const wordCount = calculateWordCount(content)
  const readTime = calculateReadTime(wordCount)
  const readability = calculateReadability(content)

  return (
    <div className="min-h-screen bg-slate-50/80 selection:bg-note-yellow/50">
      <div className="max-w-4xl mx-auto px-8 py-10 space-y-8">

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 text-red-800 px-4 py-3 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="px-5 py-2 rounded-xl text-gray-500 font-semibold hover:bg-gray-50 transition-all text-sm"
          >
            {isPreview ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gray-900 text-white px-7 py-2 rounded-xl font-bold shadow-md hover:bg-black active:scale-[0.98] transition-all text-sm disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Session'}
          </button>
        </div>

        {/* Editor canvas */}
        <ArticleEditor
          title={title}
          content={content}
          onTitleChange={setTitle}
          onContentChange={setContent}
          onSelectionCreate={(block) => setRecallBlocks([...recallBlocks, block])}
          isPreview={isPreview}
          recallBlocks={recallBlocks}
          onToggleBlock={() => {}}
        />

        {/* Bento metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <MetricCard
            icon="auto_awesome"
            label="Readability"
            value={readability > 0 ? `${readability}/100` : '—'}
            color="blue"
          />
          <MetricCard
            icon="timer"
            label="Study Time"
            value={readTime > 0 ? `${readTime} Mins` : '0 Mins'}
            color="yellow"
          />
          <MetricCard
            icon="psychology"
            label="Recall Blocks"
            value={recallBlocks.length}
            color="pink"
          />
        </div>

      </div>
    </div>
  )
}
