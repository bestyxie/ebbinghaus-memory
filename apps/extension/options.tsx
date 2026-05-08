// Options page - API key management and settings
import React, { useState, useEffect } from 'react'

import { HunterStorage } from '@/lib/storage'
import type { Settings } from '@/lib/storage'
import { EbbinghausAPI, isValidApiKeyFormat } from '@/lib/ebbinghaus-api'

import './options.css'

export default function Options() {
  const [apiKey, setApiKey] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [validationResult, setValidationResult] = useState<'idle' | 'valid' | 'invalid'>('idle')
  const [totalSaves, setTotalSaves] = useState(0)

  useEffect(() => {
    let mounted = true

    async function loadSettings() {
      const hunterStorage = new HunterStorage()
      const settings = await hunterStorage.getSettings()

      if (mounted) {
        setApiKey(settings.apiKey || '')
        setTotalSaves(settings.totalSaves || 0)
      }
    }

    loadSettings()

    return () => {
      mounted = false
    }
  }, [])

  async function validateApiKey(key: string): Promise<boolean> {
    if (!isValidApiKeyFormat(key)) {
      return false
    }
    return new EbbinghausAPI(key).validateApiKey()
  }

  async function handleSaveApiKey() {
    const trimmedKey = apiKey.trim()

    if (!trimmedKey) {
      setSaveStatus('error')
      setValidationResult('invalid')
      return
    }

    if (!isValidApiKeyFormat(trimmedKey)) {
      setSaveStatus('error')
      setValidationResult('invalid')
      setTimeout(() => {
        setSaveStatus('idle')
        setValidationResult('idle')
      }, 3000)
      return
    }

    setSaveStatus('saving')
    setValidationResult('idle')

    const isValid = await validateApiKey(trimmedKey)

    if (isValid) {
      const hunterStorage = new HunterStorage()
      await hunterStorage.setSettings({ apiKey: trimmedKey })
      setSaveStatus('saved')
      setValidationResult('valid')
    } else {
      setSaveStatus('error')
      setValidationResult('invalid')
    }

    setTimeout(() => {
      setSaveStatus('idle')
    }, 3000)
  }

  async function handleClearApiKey() {
    const hunterStorage = new HunterStorage()
    await hunterStorage.setSettings({ apiKey: '' })
    setApiKey('')
    setValidationResult('idle')
    setTotalSaves(0)
  }

  return (
    <div className="options-container">
      <header className="options-header">
        <h1>Hunter Plugin Settings</h1>
      </header>

      <main className="options-main">
        <section className="options-section">
          <h2>API Configuration</h2>
          <p className="section-description">
            Enter your Ebbinghaus API key to enable word saving and synchronization.
          </p>

          <div className="form-group">
            <label htmlFor="apiKey">API Key</label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key..."
              className="api-key-input"
              disabled={saveStatus === 'saving'}
            />

            <div className="button-group">
              <button
                onClick={handleSaveApiKey}
                disabled={saveStatus === 'saving' || !apiKey.trim()}
                className="save-button"
              >
                {saveStatus === 'saving' ? 'Validating...' : 'Save API Key'}
              </button>

              {apiKey && (
                <button
                  onClick={handleClearApiKey}
                  className="clear-button"
                  disabled={saveStatus === 'saving'}
                >
                  Clear
                </button>
              )}
            </div>

            {saveStatus === 'saved' && (
              <div className="status-message success">
                ✓ API key saved successfully
              </div>
            )}

            {saveStatus === 'error' && validationResult === 'invalid' && (
              <div className="status-message error">
                ✗ Invalid API key. Please check the format and try again.
              </div>
            )}

            {saveStatus === 'error' && validationResult === 'idle' && (
              <div className="status-message error">
                ✗ Invalid API key format. Must be at least 16 characters and contain only letters, numbers, hyphens, underscores, or dots.
              </div>
            )}
          </div>
        </section>

        <section className="options-section">
          <h2>Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{totalSaves}</div>
              <div className="stat-label">Words Saved</div>
            </div>
          </div>
        </section>

        <section className="options-section">
          <h2>How to Use</h2>
          <ol className="instructions">
            <li>Select any word on a webpage to see its definition</li>
            <li>Click the "Save" button in the tooltip to add it to your collection</li>
            <li>Words are automatically synced to your Ebbinghaus account</li>
            <li>Click the extension icon to view sync status and saved count</li>
          </ol>
        </section>

        <section className="options-section">
          <h2>Resources</h2>
          <div className="links">
            <a href="https://ebbinghaus.example.com/dashboard" target="_blank" rel="noopener noreferrer">
              Open Ebbinghaus Dashboard →
            </a>
            <a href="https://ebbinghaus.example.com/review" target="_blank" rel="noopener noreferrer">
              Review Your Words →
            </a>
            <a href="https://ebbinghaus.example.com/docs/api" target="_blank" rel="noopener noreferrer">
              API Documentation →
            </a>
          </div>
        </section>
      </main>

      <footer className="options-footer">
        <p>Hunter Plugin v{chrome.runtime.getManifest().version}</p>
      </footer>
    </div>
  )
}
