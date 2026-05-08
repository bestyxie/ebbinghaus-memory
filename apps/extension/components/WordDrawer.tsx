import { useState, useEffect, useCallback } from 'react'

import { EbbinghausAPI } from '@/lib/ebbinghaus-api'
import { hunterStorage } from '@/lib/storage'

interface PageWord {
  id?: string
  word: string
  definition: string
  pronunciation?: string
  sentence?: string
  savedAt?: string
  pending?: boolean
}

function WordDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const [words, setWords] = useState<PageWord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasApiKey, setHasApiKey] = useState(false)
  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''

  const fetchWords = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const settings = await hunterStorage.getSettings()
      const apiKey = settings.apiKey
      setHasApiKey(!!apiKey)

      if (!apiKey) {
        setLoading(false)
        return
      }

      const api = new EbbinghausAPI(apiKey)
      const response = await api.listWords(100, 0, currentUrl)

      const rawWords = response.words || response.cards || response.data || []
      const apiWords: PageWord[] = (rawWords as Array<Record<string, string>>).map((w: Record<string, string>) => ({
        id: w.id,
        word: w.front || w.word,
        definition: w.back || w.definition || '',
        savedAt: w.createdAt || w.saved_at,
      }))

      // Also get pending words from queue for this URL
      const queue = await hunterStorage.getQueue()
      const pendingWords: PageWord[] = queue
        .filter(w => w.context?.source_url === currentUrl)
        .map(w => ({
          word: w.word,
          definition: w.definition,
          pronunciation: w.pronunciation,
          sentence: w.context?.sentence,
          pending: true,
        }))

      // Combine: pending first, then synced (deduplicate by word)
      const syncedWords = apiWords.filter(
        aw => !pendingWords.some(pw => pw.word.toLowerCase() === aw.word.toLowerCase())
      )

      setWords([...pendingWords, ...syncedWords])
    } catch (err) {
      console.error('[Hunter Drawer] Failed to fetch words:', err)
      setError('Failed to load words')
    } finally {
      setLoading(false)
    }
  }, [currentUrl])

  useEffect(() => {
    if (isOpen) {
      fetchWords()
    }
  }, [isOpen, fetchWords])

  // Refresh on word save
  useEffect(() => {
    const handleMessage = (message: { action: string }) => {
      if (message.action === 'syncStateChanged' && isOpen) {
        fetchWords()
      }
    }
    chrome.runtime.onMessage.addListener(handleMessage)
    return () => chrome.runtime.onMessage.removeListener(handleMessage)
  }, [isOpen, fetchWords])

  const wordCount = words.length

  return (
    <>
      <button
        className="hunter-drawer-fab"
        onClick={() => setIsOpen(!isOpen)}
        title="Saved words on this page"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <line x1="8" y1="7" x2="16" y2="7" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
        {wordCount > 0 && (
          <span className="hunter-drawer-badge">{wordCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="hunter-drawer-overlay" onClick={() => setIsOpen(false)} />
      )}

      <div className={`hunter-drawer-panel ${isOpen ? 'hunter-drawer-open' : ''}`}>
        <div className="hunter-drawer-header">
          <h3 className="hunter-drawer-title">Saved Words</h3>
          <span className="hunter-drawer-count">{wordCount}</span>
          <button className="hunter-drawer-close" onClick={() => setIsOpen(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="hunter-drawer-body">
          {loading && (
            <div className="hunter-drawer-loading">
              <div className="hunter-drawer-spinner" />
              <span>Loading words...</span>
            </div>
          )}

          {!loading && !hasApiKey && (
            <div className="hunter-drawer-empty">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <p>API key required to view saved words</p>
            </div>
          )}

          {!loading && hasApiKey && error && (
            <div className="hunter-drawer-empty">
              <p className="hunter-drawer-error-text">{error}</p>
              <button className="hunter-drawer-retry" onClick={fetchWords}>
                Retry
              </button>
            </div>
          )}

          {!loading && hasApiKey && !error && words.length === 0 && (
            <div className="hunter-drawer-empty">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <p>No words saved on this page yet</p>
              <p className="hunter-drawer-hint">Select text and click the translate button to start</p>
            </div>
          )}

          {!loading && words.length > 0 && (
            <div className="hunter-drawer-list">
              {words.map((w, i) => (
                <div key={w.id || `${w.word}-${i}`} className="hunter-drawer-card">
                  <div className="hunter-drawer-card-header">
                    <span className="hunter-drawer-card-word">{w.word}</span>
                    {w.pending && <span className="hunter-drawer-pending-badge">syncing</span>}
                  </div>
                  {w.pronunciation && (
                    <div className="hunter-drawer-card-pron">{w.pronunciation}</div>
                  )}
                  <div className="hunter-drawer-card-def">{w.definition}</div>
                  {w.sentence && (
                    <div className="hunter-drawer-card-sentence">"{w.sentence}"</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default WordDrawer
