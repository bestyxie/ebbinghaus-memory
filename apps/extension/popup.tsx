// Popup - shows saved words count and sync status
import React, { useState, useEffect } from 'react'

import { HunterStorage } from '@/lib/storage'
import type { SyncState } from '@/lib/storage'

import './popup.css'

export default function Popup() {
  const [syncState, setSyncState] = useState<SyncState>({
    queueSize: 0,
    savedCount: 0,
    lastSyncTime: Date.now(),
    syncStatus: 'loading',
    hasApiKey: false,
  })

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [currentDomain, setCurrentDomain] = useState('')
  const [siteBlacklisted, setSiteBlacklisted] = useState(false)

  useEffect(() => {
    let mounted = true

    async function loadState() {
      const state = await getSyncStateInternal()
      if (mounted) {
        setSyncState(state)
      }
    }

    loadState()
    loadDomainState()

    const handleMessage = (message: any) => {
      if (message.action === 'syncStateChanged' && mounted) {
        loadState()
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)

    return () => {
      mounted = false
    }
  }, [])

  async function loadDomainState() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.url) return
    try {
      const domain = new URL(tab.url).hostname
      setCurrentDomain(domain)
      const hunterStorage = new HunterStorage()
      const blacklisted = await hunterStorage.isBlacklisted(domain)
      setSiteBlacklisted(blacklisted)
    } catch {
      // ignore non-http tabs (chrome://, etc.)
    }
  }

  async function getSyncStateInternal(): Promise<SyncState> {
    const hunterStorage = new HunterStorage()

    const [queue, settings, syncMetrics] = await Promise.all([
      hunterStorage.getQueue(),
      hunterStorage.getSettings(),
      chrome.storage.local.get('syncMetrics'),
    ])

    const metrics = syncMetrics.syncMetrics || {
      lastSyncTime: Date.now(),
      lastSyncStatus: 'success',
      consecutiveErrors: 0,
      retryAfter: undefined,
    }

    const hasApiKey = !!settings.apiKey
    const isRateLimited = metrics.lastSyncStatus === 'rate_limited' &&
      metrics.retryAfter &&
      Date.now() < metrics.retryAfter

    return {
      queueSize: queue.length,
      savedCount: settings.totalSaves || 0,
      lastSyncTime: metrics.lastSyncTime,
      syncStatus: isRateLimited ? 'rate_limited' :
                !hasApiKey ? 'no_auth' :
                queue.length > 0 ? 'pending' :
                metrics.lastSyncStatus === 'error' ? 'error' : 'synced',
      hasApiKey,
    }
  }

  function formatLastSync(timestamp: number): string {
    const now = Date.now()
    const diffMs = now - timestamp

    if (diffMs < 60000) {
      return 'Just now'
    } else if (diffMs < 3600000) {
      const minutes = Math.floor(diffMs / 60000)
      return `${minutes}m ago`
    } else if (diffMs < 86400000) {
      const hours = Math.floor(diffMs / 3600000)
      return `${hours}h ago`
    } else {
      const days = Math.floor(diffMs / 86400000)
      return `${days}d ago`
    }
  }

  async function syncNow() {
    await chrome.runtime.sendMessage({ action: 'syncNow' })
    const newState = await getSyncStateInternal()
    setSyncState(newState)
  }

  function openOptions() {
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html') })
  }

  async function openReview() {
    chrome.tabs.create({ url: 'https://ebbinghaus.example.com/review' })
  }

  async function toggleBlacklist() {
    if (!currentDomain) return
    const hunterStorage = new HunterStorage()
    if (siteBlacklisted) {
      await hunterStorage.removeFromBlacklist(currentDomain)
    } else {
      await hunterStorage.addToBlacklist(currentDomain)
    }
    setSiteBlacklisted(!siteBlacklisted)
  }

  if (syncState.syncStatus === 'loading') {
    return (
      <div className="popup-container">
        <header className="popup-header">
          <h1>Hunter Plugin</h1>
        </header>
        <main className="popup-main">
          <div className="skeleton">
            <div className="skeleton-line" />
            <div className="skeleton-line short" />
          </div>
          {currentDomain && (
            <div className="site-toggle-row">
              <div className="site-toggle-label">
                <span className="site-toggle-title">不翻译该网站</span>
                <span className="site-toggle-domain">{currentDomain}</span>
              </div>
              <button
                className={`site-toggle-switch ${siteBlacklisted ? 'active' : ''}`}
                onClick={toggleBlacklist}
                aria-label={siteBlacklisted ? '恢复翻译' : '不翻译该网站'}
              />
            </div>
          )}
        </main>
      </div>
    )
  }

  if (syncState.savedCount === 0) {
    return (
      <div className="popup-container">
        <header className="popup-header">
          <h1>Hunter Plugin</h1>
          <button
            className="settings-button"
            aria-label="Settings"
            onClick={openOptions}
          >
            ⚙️
          </button>
        </header>
        <main className="popup-main">
          <div className="empty-state">
            <div className="illustration">📚</div>
            <p className="empty-text">Start your collection</p>
            <p className="empty-helper">Select any word on a page to save it</p>
            <button className="secondary-cta" onClick={openOptions}>
              Need an API key?
            </button>
          </div>
          {currentDomain && (
            <div className="site-toggle-row">
              <div className="site-toggle-label">
                <span className="site-toggle-title">不翻译该网站</span>
                <span className="site-toggle-domain">{currentDomain}</span>
              </div>
              <button
                className={`site-toggle-switch ${siteBlacklisted ? 'active' : ''}`}
                onClick={toggleBlacklist}
                aria-label={siteBlacklisted ? '恢复翻译' : '不翻译该网站'}
              />
            </div>
          )}
        </main>
      </div>
    )
  }

  if (!syncState.hasApiKey) {
    return (
      <div className="popup-container">
        <header className="popup-header">
          <h1>Hunter Plugin</h1>
        </header>
        <main className="popup-main">
          <div className="error-state">
            <div className="error-icon">🔑</div>
            <p className="error-title">API key required</p>
            <p className="error-message">
              Add your Ebbinghaus API key to start saving words
            </p>
            <button className="action-button primary" onClick={openOptions}>
              Add API Key
            </button>
          </div>
          {currentDomain && (
            <div className="site-toggle-row">
              <div className="site-toggle-label">
                <span className="site-toggle-title">不翻译该网站</span>
                <span className="site-toggle-domain">{currentDomain}</span>
              </div>
              <button
                className={`site-toggle-switch ${siteBlacklisted ? 'active' : ''}`}
                onClick={toggleBlacklist}
                aria-label={siteBlacklisted ? '恢复翻译' : '不翻译该网站'}
              />
            </div>
          )}
        </main>
      </div>
    )
  }

  return (
    <div className="popup-container">
      <header className="popup-header">
        <h1>Hunter Plugin</h1>
        <button
          className="settings-button"
          aria-label="Settings"
          onClick={openOptions}
        >
          ⚙️
        </button>
      </header>
      <main className="popup-main">
        <div className={`status-badge ${syncState.syncStatus}`}>
          {syncState.syncStatus === 'synced' && `✓ Synced • ${formatLastSync(syncState.lastSyncTime)}`}
          {syncState.syncStatus === 'pending' && `⏳ ${syncState.queueSize} pending`}
          {syncState.syncStatus === 'error' && '⚠️ Sync failed'}
          {syncState.syncStatus === 'rate_limited' && '⏸️ Rate limited'}
        </div>
        <h2 className="saved-count">{syncState.savedCount} words saved</h2>
        {syncState.queueSize > 0 && (
          <p className="queue-info">
            {syncState.queueSize} word{syncState.queueSize !== 1 ? 's' : ''} queued
          </p>
        )}
        <div className="actions">
          <button
            className="action-button secondary"
            onClick={syncNow}
            disabled={syncState.queueSize === 0}
          >
            Sync Now
          </button>
          <button
            className="action-button primary"
            onClick={openReview}
          >
            Review Now
          </button>
        </div>
        {currentDomain && (
          <div className="site-toggle-row">
            <div className="site-toggle-label">
              <span className="site-toggle-title">不翻译该网站</span>
              <span className="site-toggle-domain">{currentDomain}</span>
            </div>
            <button
              className={`site-toggle-switch ${siteBlacklisted ? 'active' : ''}`}
              onClick={toggleBlacklist}
              aria-label={siteBlacklisted ? '恢复翻译' : '不翻译该网站'}
            />
          </div>
        )}
      </main>
    </div>
  )
}
