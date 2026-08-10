// Content script - captures word selections and shows definition tooltip
import type { PlasmoCSConfig, PlasmoGetStyle } from 'plasmo'

import HunterContent from '@/components/HunterContent'

export const config: PlasmoCSConfig = {
  matches: ['<all_urls>'],
}

const cssText = `
.hunter-translate-button {
  position: absolute;
  z-index: 2147483647;
  width: 32px;
  height: 32px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  transition: all 0.15s ease;
  animation: hunter-scale-in 0.15s ease-out;
}
.hunter-translate-button:hover {
  background: #f3f4f6;
  border-color: #3b82f6;
  transform: scale(1.05);
}
.hunter-translate-button:active {
  transform: scale(0.95);
}
@keyframes hunter-scale-in {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}
.hunter-tooltip {
  position: absolute;
  z-index: 2147483647;
  width: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #1a1a1a;
  animation: hunter-fade-in 0.15s ease-out;
}
@keyframes hunter-fade-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
.hunter-close-button {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  font-size: 16px;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.15s ease;
}
.hunter-close-button:hover {
  background: #f3f4f6;
  color: #1a1a1a;
}
.hunter-word {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
  padding-right: 32px;
}
.hunter-pronunciation {
  font-size: 14px;
  color: #3b82f6;
  margin-bottom: 12px;
  font-family: 'Lucida Sans Unicode', 'Arial Unicode MS', sans-serif;
  letter-spacing: 0.5px;
}
.hunter-chinese-translation {
  font-size: 15px;
  color: #1a1a1a;
  margin-bottom: 12px;
  font-weight: 500;
  padding: 8px 12px;
  background: #f0f9ff;
  border-left: 3px solid #3b82f6;
  border-radius: 4px;
}
.hunter-definition {
  margin-bottom: 16px;
  color: #374151;
  font-size: 13px;
  line-height: 1.6;
}
.hunter-save-button {
  width: 100%;
  padding: 10px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}
.hunter-save-button:hover:not(:disabled) {
  background: #2563eb;
}
.hunter-save-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
.hunter-save-button.saved {
  background: #10b981;
}
.hunter-tooltip-loading .hunter-loading-skeleton {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}
.hunter-api-key-warning {
  margin-top: 8px;
  padding: 8px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
}
.hunter-api-key-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
}
.hunter-loading-skeleton .skeleton-line {
  height: 16px;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: hunter-skeleton-pulse 1.5s ease-in-out infinite;
}
.hunter-loading-skeleton .skeleton-line.short {
  width: 60%;
}
@keyframes hunter-skeleton-pulse {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.hunter-tooltip-error {
  position: absolute;
  border-left: 4px solid #ef4444;
}
.hunter-error-message {
  color: #ef4444;
  margin-bottom: 12px;
  font-size: 13px;
}
.hunter-retry-button {
  width: 100%;
  padding: 10px 16px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease;
}
.hunter-retry-button:hover {
  background: #dc2626;
}
.hunter-save-button.saved::before {
  content: '\\2713';
  margin-right: 4px;
}
.hunter-drawer-fab {
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2147483646;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: #3b82f6;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px rgba(59, 130, 246, 0.4);
  transition: all 0.2s ease;
}
.hunter-drawer-fab:hover {
  background: #2563eb;
  transform: translateY(-50%) scale(1.08);
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.5);
}
.hunter-drawer-fab:active {
  transform: translateY(-50%) scale(0.95);
}
.hunter-drawer-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  background: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  line-height: 1;
}
.hunter-drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2147483645;
  background: rgba(0, 0, 0, 0.3);
  animation: hunter-drawer-fade-in 0.2s ease;
}
@keyframes hunter-drawer-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.hunter-drawer-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 360px;
  max-width: 90vw;
  z-index: 2147483646;
  background: #ffffff;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
}
.hunter-drawer-panel.hunter-drawer-open {
  transform: translateX(0);
}
.hunter-drawer-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}
.hunter-drawer-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}
.hunter-drawer-count {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 10px;
}
.hunter-drawer-close {
  margin-left: auto;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  transition: all 0.15s ease;
}
.hunter-drawer-close:hover {
  background: #f3f4f6;
  color: #1a1a1a;
}
.hunter-drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}
.hunter-drawer-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 0;
  color: #9ca3af;
  font-size: 14px;
}
.hunter-drawer-spinner {
  width: 24px;
  height: 24px;
  border: 2.5px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: hunter-drawer-spin 0.8s linear infinite;
}
@keyframes hunter-drawer-spin {
  to { transform: rotate(360deg); }
}
.hunter-drawer-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 20px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
}
.hunter-drawer-hint {
  font-size: 12px;
  color: #d1d5db;
  margin: 0;
}
.hunter-drawer-error-text {
  color: #ef4444;
  font-size: 13px;
}
.hunter-drawer-retry {
  padding: 8px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s;
}
.hunter-drawer-retry:hover {
  background: #2563eb;
}
.hunter-drawer-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.hunter-drawer-card {
  padding: 12px 14px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  transition: border-color 0.15s;
}
.hunter-drawer-card:hover {
  border-color: #e0e0e0;
}
.hunter-drawer-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.hunter-drawer-card-word {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}
.hunter-drawer-pending-badge {
  font-size: 10px;
  font-weight: 500;
  color: #d97706;
  background: #fef3c7;
  padding: 1px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.hunter-drawer-card-pron {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 6px;
}
.hunter-drawer-card-def {
  font-size: 13px;
  color: #374151;
  line-height: 1.5;
}
.hunter-drawer-card-sentence {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #e5e7eb;
  font-style: italic;
  line-height: 1.4;
}
`

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement('style')
  style.textContent = cssText
  return style
}

// Global handler for extension context invalidation
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason instanceof Error && event.reason.message.includes('Extension context invalidated')) {
      console.warn('Extension context invalidated - extension was reloaded')
      event.preventDefault() // Prevent error from showing in console
    }
  })
}

// Source locate: scroll to + highlight word on third-party pages
if (typeof window !== 'undefined') {
  chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    if (message.action !== 'ebbinghaus-source-locate') return true

    const { url } = message as { url: string }
    if (!url || !url.includes(':~:text=')) return true

    const hashIndex = url.indexOf('#:~:text=')
    if (hashIndex === -1) return true
    const raw = url.substring(hashIndex + '#:~:text='.length)

    // Parse [prefix-]text[,-suffix]
    let text = raw
    const suffixMatch = text.match(/,-([^,]+)$/)
    if (suffixMatch) text = text.substring(0, suffixMatch.index)
    const prefixMatch = text.match(/^([^,]+)-(.+)$/)
    if (prefixMatch) text = prefixMatch[2]
    const fragmentText = text.trim()
    if (!fragmentText) return true

    const HIGHLIGHT_CLASS = 'ebbinghaus-source-highlight'
    const HIGHLIGHT_STYLE = 'background-color: #ffd54f; color: #000; padding: 0 2px; border-radius: 2px;'

    const tryLocate = (retryCount: number) => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      let node: Node | null
      while ((node = walker.nextNode())) {
        if (!node.textContent) continue
        const nodeText = node.textContent
        const matchIndex = nodeText.indexOf(fragmentText)
        if (matchIndex === -1) continue

        const parent = node.parentElement
        if (!parent) continue

        try {
          const range = document.createRange()
          range.setStart(node, matchIndex)
          range.setEnd(node, matchIndex + fragmentText.length)

          const mark = document.createElement('mark')
          mark.className = HIGHLIGHT_CLASS
          mark.setAttribute('style', HIGHLIGHT_STYLE)
          range.surroundContents(mark)

          if (typeof mark.scrollIntoView === 'function') {
            mark.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        } catch {
          // surroundContents fails when range crosses element boundaries
        }
        return
      }

      if (retryCount < 8) {
        const delay = Math.min(100 * Math.pow(1.6, retryCount), 1600)
        setTimeout(() => tryLocate(retryCount + 1), delay)
      }
    }

    tryLocate(0)
    return true
  })
}

export default HunterContent
