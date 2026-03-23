'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { JSONContent } from '@tiptap/react'
import { ArticleEditor } from './components/article-editor'
import { MetricCard } from './components/metric-card'
import { RecallBlock } from '@/app/lib/types'
import { calculateWordCount, calculateReadTime, calculateReadability } from '@/app/lib/text-analysis'
import { getPlainTextFromJson } from './components/tiptap-editor'

export default function ArticleEditorPage() {
  const router = useRouter()
  const [plainTextContent, setPlainTextContent] = useState('')
  const [title, setTitle] = useState('')
  const [recallBlocks, setRecallBlocks] = useState<RecallBlock[]>([])
  const [selectedDeckId] = useState<string>()
  const [isPreview, setIsPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string>()

  // Handle content changes from TipTap editor
  const handleContentChange = useCallback((json: JSONContent) => {
    const text = getPlainTextFromJson(json)
    setPlainTextContent(text)
  }, [])

  // Handle recall block creation/update
  const handleSelectionCreate = useCallback((block: RecallBlock) => {
    setRecallBlocks((prev) => {
      // Check if block already exists
      const existingIndex = prev.findIndex((b) => b.id === block.id)
      if (existingIndex >= 0) {
        // Update existing block
        const updated = [...prev]
        updated[existingIndex] = block
        return updated
      }
      // Add new block
      return [...prev, block]
    })
  }, [])

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please enter a title')
      return
    }
    if (!plainTextContent.trim()) {
      setError('Please enter article content')
      return
    }

    setIsSaving(true)
    setError(undefined)

    try {
      const response = await fetch('/api/article-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleTitle: title,
          articleContent: plainTextContent,
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

  // Use plain text for metrics calculation
  const wordCount = calculateWordCount(plainTextContent)
  const readTime = calculateReadTime(wordCount)
  const readability = calculateReadability(plainTextContent)

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
          content={plainTextContent}
          onTitleChange={setTitle}
          onContentChange={handleContentChange}
          onSelectionCreate={handleSelectionCreate}
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
