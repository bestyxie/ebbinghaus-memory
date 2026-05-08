// Onboarding flow - 3-step introduction for new users
import React, { useState, useEffect } from 'react'

import { HunterStorage } from '@/lib/storage'
import { EbbinghausAPI, isValidApiKeyFormat } from '@/lib/ebbinghaus-api'

import './onboarding.css'

type Step = 'welcome' | 'api-key' | 'tutorial' | 'complete'

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState<Step>('welcome')
  const [apiKey, setApiKey] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    let mounted = true

    async function checkExistingSetup() {
      const hunterStorage = new HunterStorage()
      const settings = await hunterStorage.getSettings()

      if (mounted) {
        if (settings.apiKey) {
          setCurrentStep('tutorial')
        }
      }
    }

    checkExistingSetup()

    return () => {
      mounted = false
    }
  }, [])

  async function validateAndSaveApiKey() {
    const trimmedKey = apiKey.trim()

    if (!trimmedKey) {
      setSaveError('Please enter an API key')
      return
    }

    if (!isValidApiKeyFormat(trimmedKey)) {
      setSaveError('Invalid API key format. Must be at least 16 characters and contain only letters, numbers, hyphens, underscores, or dots.')
      return
    }

    setIsValidating(true)
    setSaveError('')

    try {
      const api = new EbbinghausAPI(trimmedKey)
      const valid = await api.validateApiKey()

      if (valid) {
        const hunterStorage = new HunterStorage()
        await hunterStorage.setSettings({
          apiKey: trimmedKey,
          firstRun: false,
        })
        setIsValid(true)
        setTimeout(() => setCurrentStep('tutorial'), 500)
      } else {
        setSaveError('Invalid API key. Please check and try again.')
      }
    } catch {
      setSaveError('Unable to validate API key. Please check your connection.')
    } finally {
      setIsValidating(false)
    }
  }

  function skipApiKeySetup() {
    setCurrentStep('tutorial')
  }

  function finishOnboarding() {
    const hunterStorage = new HunterStorage()
    hunterStorage.setSettings({ firstRun: false })

    if (chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.remove(tabs[0].id)
        }
      })
    }
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <header className="onboarding-header">
          <div className="logo">📚</div>
          <h1>Hunter Plugin</h1>
          <p className="tagline">Build your vocabulary, one word at a time</p>
        </header>

        <div className="onboarding-content">
          {currentStep === 'welcome' && (
            <div className="step-content">
              <div className="step-indicator">
                <div className="step-dot active"></div>
                <div className="step-dot"></div>
                <div className="step-dot"></div>
              </div>

              <h2>Welcome to Hunter Plugin</h2>

              <div className="feature-list">
                <div className="feature-item">
                  <div className="feature-icon">🎯</div>
                  <div className="feature-text">
                    <strong>Select any word</strong> on a webpage to see its definition
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-icon">💾</div>
                  <div className="feature-text">
                    <strong>Save words instantly</strong> with a single click
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-icon">🔄</div>
                  <div className="feature-text">
                    <strong>Sync automatically</strong> to your Ebbinghaus account
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-icon">📖</div>
                  <div className="feature-text">
                    <strong>Review daily</strong> using spaced repetition
                  </div>
                </div>
              </div>

              <button onClick={() => setCurrentStep('api-key')} className="primary-button">
                Get Started
              </button>
            </div>
          )}

          {currentStep === 'api-key' && (
            <div className="step-content">
              <div className="step-indicator">
                <div className="step-dot completed"></div>
                <div className="step-dot active"></div>
                <div className="step-dot"></div>
              </div>

              <h2>Connect Your Account</h2>
              <p className="step-description">
                Enter your Ebbinghaus API key to enable word saving and synchronization.
              </p>

              <div className="api-key-form">
                <label htmlFor="onboardingApiKey">API Key</label>
                <input
                  id="onboardingApiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key..."
                  className="api-input"
                  disabled={isValidating}
                />

                {saveError && (
                  <div className="error-message">{saveError}</div>
                )}

                {isValid && (
                  <div className="success-message">
                    ✓ API key validated successfully!
                  </div>
                )}

                <div className="button-group">
                  <button
                    onClick={validateAndSaveApiKey}
                    disabled={isValidating || !apiKey.trim()}
                    className="primary-button"
                  >
                    {isValidating ? 'Validating...' : 'Continue'}
                  </button>

                  <button
                    onClick={skipApiKeySetup}
                    disabled={isValidating}
                    className="secondary-button"
                  >
                    Skip for now
                  </button>
                </div>

                <p className="help-text">
                  Don't have an API key?{' '}
                  <a
                    href="https://ebbinghaus.example.com/settings/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Get one here →
                  </a>
                </p>
              </div>
            </div>
          )}

          {currentStep === 'tutorial' && (
            <div className="step-content">
              <div className="step-indicator">
                <div className="step-dot completed"></div>
                <div className="step-dot completed"></div>
                <div className="step-dot active"></div>
              </div>

              <h2>How It Works</h2>
              <p className="step-description">
                Learn how to capture words while you browse.
              </p>

              <div className="tutorial-steps">
                <div className="tutorial-step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <strong>Select a word</strong>
                    <p>Highlight any word on a webpage with your mouse</p>
                  </div>
                </div>

                <div className="tutorial-step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <strong>View definition</strong>
                    <p>A tooltip appears with the word's pronunciation and definition</p>
                  </div>
                </div>

                <div className="tutorial-step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <strong>Click Save</strong>
                    <p>Click the blue "Save" button to add it to your collection</p>
                  </div>
                </div>

                <div className="tutorial-step">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <strong>Review later</strong>
                    <p>Open the popup to see sync status and review saved words</p>
                  </div>
                </div>
              </div>

              <div className="demo-illustration">
                <div className="demo-word">ephemeral</div>
                <div className="demo-arrow">↓</div>
                <div className="demo-tooltip">
                  <div className="demo-word-large">ephemeral</div>
                  <div className="demo-definition">lasting for a very short time</div>
                  <button className="demo-save-button">Save</button>
                </div>
              </div>

              <button onClick={finishOnboarding} className="primary-button">
                Start Saving Words
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
