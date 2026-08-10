import type { SourceAnchor } from '@/lib/storage'

export type LocateResult =
  | { found: true; element: HTMLElement; method: 'css' | 'context' | 'fragment' }
  | { found: false }

const HIGHLIGHT_STYLE = 'outline: 2px solid #ffd54f; outline-offset: 2px;'
const HIGHLIGHT_CLASS = 'ebbinghaus-source-highlight'
const MAX_RETRIES = 8
const INITIAL_DELAY = 100
const DELAY_MULTIPLIER = 1.6
const MAX_DELAY = 1600

export function locateByCss(anchor: SourceAnchor): LocateResult {
  try {
    const el = document.querySelector(anchor.sel)
    if (el instanceof HTMLElement) {
      return { found: true, element: el, method: 'css' }
    }
  } catch {
    // invalid selector
  }
  return { found: false }
}

export function locateByContext(anchor: SourceAnchor): LocateResult {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  const nodes: Text[] = []
  let node: Node | null
  while ((node = walker.nextNode())) {
    if (node.textContent && node.textContent.includes(anchor.ctx)) {
      const parent = node.parentElement
      if (parent instanceof HTMLElement) {
        nodes.push(node as Text)
      }
    }
  }

  if (nodes.length === 0) return { found: false }

  const target = nodes[0].parentElement as HTMLElement
  return { found: true, element: target, method: 'context' }
}

export function parseTextFragment(url: string): string | null {
  const hashIndex = url.indexOf('#:~:text=')
  if (hashIndex === -1) return null
  const raw = url.substring(hashIndex + '#:~:text='.length)

  // Text fragment format: [prefix-]text[,-suffix]
  // Split on the first '-' from left (prefix boundary) and first ',-' from right (suffix boundary)
  let text = raw
  const suffixMatch = text.match(/,-([^,]+)$/)
  if (suffixMatch) {
    text = text.substring(0, suffixMatch.index)
  }
  const prefixMatch = text.match(/^([^,]+)-(.+)$/)
  if (prefixMatch) {
    text = prefixMatch[2]
  }

  return text.trim() || null
}

export function locateByFragment(fragmentText: string | null): LocateResult {
  if (!fragmentText) return { found: false }

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  let node: Node | null
  while ((node = walker.nextNode())) {
    if (node.textContent && node.textContent.includes(fragmentText)) {
      const parent = node.parentElement
      if (parent instanceof HTMLElement) {
        return { found: true, element: parent, method: 'fragment' }
      }
    }
  }
  return { found: false }
}

export function locate(anchor: SourceAnchor, url: string): LocateResult {
  const cssResult = locateByCss(anchor)
  if (cssResult.found) return cssResult

  const ctxResult = locateByContext(anchor)
  if (ctxResult.found) return ctxResult

  const fragmentText = parseTextFragment(url)
  return locateByFragment(fragmentText)
}

export function highlightElement(element: HTMLElement): void {
  element.classList.add(HIGHLIGHT_CLASS)
  element.setAttribute('style', HIGHLIGHT_STYLE + (element.getAttribute('style') || ''))

  if (typeof element.scrollIntoView === 'function') {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  element.addEventListener('click', removeHighlight, { once: true })
  document.addEventListener('click', removeHighlight, { once: true })
}

function removeHighlight(e: Event): void {
  const target = e.target as HTMLElement
  if (target.classList?.contains(HIGHLIGHT_CLASS)) return
  document.querySelectorAll('.' + HIGHLIGHT_CLASS).forEach((el) => {
    el.classList.remove(HIGHLIGHT_CLASS)
    const style = el.getAttribute('style') || ''
    el.setAttribute('style', style.replace(HIGHLIGHT_STYLE, ''))
  })
}

export function computeRetryDelay(attempt: number): number {
  return Math.min(INITIAL_DELAY * Math.pow(DELAY_MULTIPLIER, attempt), MAX_DELAY)
}

export function locateWithRetry(
  anchor: SourceAnchor,
  url: string,
  options?: {
    maxRetries?: number
    onAttempt?: (attempt: number) => void
    onComplete?: (result: LocateResult) => void
  }
): void {
  const maxRetries = options?.maxRetries ?? MAX_RETRIES
  let attempt = 0

  const tryLocate = () => {
    const result = locate(anchor, url)
    if (result.found) {
      highlightElement(result.element)
      options?.onComplete?.(result)
      return
    }

    attempt++
    if (attempt >= maxRetries) {
      options?.onComplete?.(result)
      return
    }

    options?.onAttempt?.(attempt)
    setTimeout(tryLocate, computeRetryDelay(attempt))
  }

  tryLocate()
}

export const locateConfig = {
  MAX_RETRIES,
  INITIAL_DELAY,
  DELAY_MULTIPLIER,
  MAX_DELAY,
  HIGHLIGHT_CLASS,
  HIGHLIGHT_STYLE,
}
