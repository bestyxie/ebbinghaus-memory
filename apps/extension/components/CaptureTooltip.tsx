import { useState, useEffect } from 'react'

import { DictionaryAPI } from '@/lib/dictionary-api'
import { hunterStorage } from '@/lib/storage'
import type { QueuedWord, Settings, SourceAnchor } from '@/lib/storage'

interface TooltipProps {
  word: string
  sentence: string
  sourceUrl: string
  sourceAnchor: SourceAnchor
  sourceTitle: string
  capturedAt: string
  position: { top: number; left: number }
  onClose: () => void
}

function CaptureTooltip({ word, sentence, sourceUrl, sourceAnchor, sourceTitle, capturedAt, position, onClose }: TooltipProps) {
  const [definition, setDefinition] = useState<{
    word: string
    phonetic: string
    definition: string
    chineseTranslation?: string
    audio?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null)

  useEffect(() => {
    let mounted = true

    async function fetchDefinition() {
      console.log('[Hunter] fetchDefinition called for word:', word)
      setLoading(true)
      setError(null)

      const settings = await hunterStorage.getSettings()
      const api = new DictionaryAPI(settings.apiKey)
      console.log('[Hunter] Calling DictionaryAPI.getSimplifiedDefinition...')
      const result = await api.getSimplifiedDefinition(word)
      console.log('[Hunter] DictionaryAPI result:', result)

      if (mounted) {
        if (result) {
          setDefinition(result)
        } else {
          setError('Definition unavailable')
        }
        setLoading(false)
      }
    }

    fetchDefinition()

    return () => {
      mounted = false
    }
  }, [word])

  useEffect(() => {
    let mounted = true

    async function checkApiKey() {
      try {
        const settings: Settings = await hunterStorage.getSettings()
        if (mounted) {
          setHasApiKey(!!settings.apiKey)
        }
      } catch (error) {
        // Handle extension context invalidated (e.g., after extension reload)
        if (error instanceof Error && error.message.includes('Extension context invalidated')) {
          console.warn('Extension context invalidated, reloading page...')
          if (mounted) {
            setHasApiKey(false)
          }
          // Optionally reload the page to get fresh extension context
          // window.location.reload()
        } else if (mounted) {
          setHasApiKey(false)
        }
      }
    }

    checkApiKey()
  }, [])

  const handleSave = async () => {
    if (!definition || saving || saved || !hasApiKey) return

    setSaving(true)

    const wordData: Omit<QueuedWord, 'timestamp'> = {
      word: definition.word,
      pronunciation: definition.phonetic,
      definition: `${definition.phonetic}\n${definition.chineseTranslation}\n${definition.definition}`,
      context: {
        sentence,
        source_url: sourceUrl,
        source_anchor: sourceAnchor,
        source_title: sourceTitle,
        captured_at: capturedAt,
      },
      retryCount: 0,
    }

    chrome.runtime.sendMessage({
      action: 'addToQueue',
      word: wordData,
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Failed to send message to background script:', chrome.runtime.lastError)
        setError('Failed to save word. Please try again.')
        setSaving(false)
        return
      }

      if (response?.success) {
        setSaved(true)
        setTimeout(() => onClose(), 1500)
      } else {
        setError('Failed to save word')
      }
      setSaving(false)
    })
  }

  const handleRetry = () => {
    setSaved(false)
    setSaving(false)
  }

  if (loading) {
    return (
      <div
        className="hunter-tooltip hunter-tooltip-loading"
        style={{ position: 'absolute', top: `${position.top}px`, left: `${position.left}px` }}
      >
        <div className="hunter-word">{word}</div>
        <div className="hunter-loading-skeleton">
          <div className="skeleton-line"></div>
          <div className="skeleton-line short"></div>
        </div>
        <button className="hunter-save-button" disabled>
          Save
        </button>
        {!hasApiKey && (
          <div className="hunter-api-key-warning">
            API key required
          </div>
        )}
        <button className="hunter-close-button" onClick={onClose}>
          ✕
        </button>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="hunter-tooltip hunter-tooltip-error"
        style={{ position: 'absolute', top: `${position.top}px`, left: `${position.left}px` }}
      >
        <div className="hunter-word">{word}</div>
        <div className="hunter-error-message">{error}</div>
        <button className="hunter-retry-button" onClick={handleRetry}>
          Try Again
        </button>
        <button className="hunter-close-button" onClick={onClose}>
          ✕
        </button>
      </div>
    )
  }

  return (
    <div
      className="hunter-tooltip"
      style={{ position: 'absolute', top: `${position.top}px`, left: `${position.left}px` }}
    >
      <button className="hunter-close-button" onClick={onClose}>
        ✕
      </button>

      <div className="hunter-word">{definition.word}</div>

      {definition.phonetic && (
        <div className="hunter-pronunciation">{definition.phonetic}</div>
      )}

      {definition.chineseTranslation && (
        <div className="hunter-chinese-translation">{definition.chineseTranslation}</div>
      )}

      <div className="hunter-definition">{definition.definition}</div>

      <button
        className={`hunter-save-button ${saved ? 'saved' : ''}`}
        onClick={saved ? undefined : handleSave}
        disabled={saving || saved || !hasApiKey}
      >
        {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save'}
      </button>
      {!hasApiKey && hasApiKey !== null && (
        <div className="hunter-api-key-hint">
          API key required to save
        </div>
      )}
    </div>
  )
}

export default CaptureTooltip
