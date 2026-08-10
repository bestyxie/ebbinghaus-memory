import { useState, useEffect, useRef } from 'react'

import { hunterStorage } from '@/lib/storage'

import TranslateButton from '@/components/TranslateButton'
import CaptureTooltip from '@/components/CaptureTooltip'
import { extractSentenceContext } from '@/utils/extract-sentence-context'
import { calculateTooltipPosition } from '@/utils/calculate-tooltip-position'
import { computeSourceAnchor } from '@/utils/compute-source-anchor'
import { buildTextFragmentUrl } from '@/utils/build-text-fragment'
import type { SourceAnchor } from '@/lib/storage'

// Main content script
function WordCapture() {
  const [showTranslateButton, setShowTranslateButton] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [translateButtonData, setTranslateButtonData] = useState<{
    word: string
    sentence: string
    sourceUrl: string
    sourceAnchor: SourceAnchor
    sourceTitle: string
    capturedAt: string
    buttonPosition: { top: number; left: number }
    tooltipPosition: { top: number; left: number }
  } | null>(null)
  const [tooltipData, setTooltipData] = useState<{
    word: string
    sentence: string
    sourceUrl: string
    sourceAnchor: SourceAnchor
    sourceTitle: string
    capturedAt: string
    position: { top: number; left: number }
  } | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection()
      const selectedText = selection?.toString().trim()

      if (!selectedText || selectedText.length < 2) {
        if (showTranslateButton) {
          setShowTranslateButton(false)
        }
        if (showTooltip) {
          setShowTooltip(false)
        }
        return
      }

      if (selectedText.length > 50) {
        return
      }

      const activeElement = document.activeElement
      if (activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.getAttribute('contenteditable') === 'true'
      )) {
        return
      }

      const range = selection.getRangeAt(0)
      if (!range) return

      const rect = range.getBoundingClientRect()

      // Position the translate button at bottom-right of selection
      // Add scroll offsets to convert viewport coords to document coords
      const buttonPosition = {
        top: rect.bottom + window.scrollY + 8,
        left: rect.right + window.scrollX - 32,
      }

      // Calculate tooltip position for later use
      const tooltipPosition = calculateTooltipPosition(rect)

      let fullText = ''
      let node = range.startContainer
      while (node && node.nodeType !== Node.ELEMENT_NODE) {
        node = node.parentNode
      }
      if (node && node.parentElement) {
        fullText = node.parentElement.textContent || ''
      } else {
        fullText = document.body.textContent || ''
      }

      const sentence = extractSentenceContext(fullText, selectedText)

      const sourceAnchor = computeSourceAnchor(range, selectedText)
      const sourceTitle = document.title || ''
      const capturedAt = new Date().toISOString()
      const sourceUrl = buildTextFragmentUrl(
        window.location.href,
        selectedText,
        sourceAnchor.ctx
      )

      setTranslateButtonData({
        word: selectedText,
        sentence,
        sourceUrl,
        sourceAnchor,
        sourceTitle,
        capturedAt,
        buttonPosition,
        tooltipPosition,
      })
      setShowTranslateButton(true)
      setShowTooltip(false)
      console.log('[Hunter] Translate button data set:', {
        word: selectedText,
        buttonPosition,
        tooltipPosition
      })
    }

    let selectionTimeout: NodeJS.Timeout
    const debouncedSelection = () => {
      clearTimeout(selectionTimeout)
      selectionTimeout = setTimeout(handleSelection, 300)
    }

    document.addEventListener('mouseup', debouncedSelection)
    document.addEventListener('selectionchange', debouncedSelection)

    document.addEventListener('keyup', (e) => {
      if (e.shiftKey) {
        debouncedSelection()
      }
    })

    return () => {
      document.removeEventListener('mouseup', debouncedSelection)
      document.removeEventListener('selectionchange', debouncedSelection)
      clearTimeout(selectionTimeout)
    }
  }, [showTranslateButton, showTooltip])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Use composedPath to properly detect clicks inside shadow DOM
      const path = e.composedPath()
      if (tooltipRef.current && !path.includes(tooltipRef.current)) {
        setShowTooltip(false)
      }
      // Close translate button if clicking outside
      if (showTranslateButton) {
        const isInsideButton = path.some(
          (el) => el instanceof HTMLElement && el.classList.contains('hunter-translate-button')
        )
        if (!isInsideButton) {
          setShowTranslateButton(false)
        }
      }
    }

    if (showTooltip || showTranslateButton) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showTooltip, showTranslateButton])

  const handleTranslateButtonClick = () => {
    console.log('[Hunter] Translate button clicked!', { translateButtonData })
    if (!translateButtonData) {
      console.error('[Hunter] No translate button data available')
      return
    }

    setTooltipData({
      word: translateButtonData.word,
      sentence: translateButtonData.sentence,
      sourceUrl: translateButtonData.sourceUrl,
      sourceAnchor: translateButtonData.sourceAnchor,
      sourceTitle: translateButtonData.sourceTitle,
      capturedAt: translateButtonData.capturedAt,
      position: translateButtonData.tooltipPosition,
    })
    setShowTranslateButton(false)
    setShowTooltip(true)
    console.log('[Hunter] Tooltip should now be visible')
  }

  if (!showTranslateButton && !showTooltip) {
    return null
  }

  return (
    <div ref={tooltipRef}>
      {showTranslateButton && translateButtonData && (
        <TranslateButton
          buttonPosition={translateButtonData.buttonPosition}
          onClick={handleTranslateButtonClick}
        />
      )}
      {showTooltip && tooltipData && (
        <CaptureTooltip
          {...tooltipData}
          onClose={() => setShowTooltip(false)}
        />
      )}
    </div>
  )
}

export default WordCapture
