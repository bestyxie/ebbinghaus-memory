import type { SourceAnchor } from '@/lib/storage'

export function computeCssPath(element: Element | null): string {
  if (!element) return 'body'

  const parts: string[] = []
  let current: Element | null = element

  while (current && current !== document.body) {
    const tag = current.tagName.toLowerCase()

    if (current.id) {
      parts.unshift(`#${current.id}`)
      break
    }

    const parent = current.parentElement
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        (c) => c.tagName === current!.tagName
      )
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1
        parts.unshift(`${tag}:nth-of-type(${index})`)
      } else {
        parts.unshift(tag)
      }
    } else {
      parts.unshift(tag)
    }

    current = current.parentElement
  }

  if (parts.length === 0 || parts[0] !== 'body') {
    parts.unshift('body')
  }

  return parts.join(' > ')
}

export function extractContext(range: Range, maxLength: number = 40): string {
  const container = range.startContainer.parentElement
  if (!container) return range.toString().trim()

  const fullText = container.textContent || ''
  const selectedText = range.toString().trim()
  const selectedIndex = fullText.indexOf(selectedText)
  if (selectedIndex === -1) return selectedText

  const halfCtx = Math.floor((maxLength - selectedText.length) / 2)
  const start = Math.max(0, selectedIndex - halfCtx)
  const end = Math.min(fullText.length, selectedIndex + selectedText.length + halfCtx)

  return fullText.substring(start, end).replace(/\s+/g, ' ').trim()
}

export function countOccurrenceInParent(
  element: Element | null,
  selectedText: string
): number {
  if (!element || !element.parentElement) return 1

  const parentText = element.parentElement.textContent || ''
  const matches: number[] = []
  let searchIndex = 0

  while (searchIndex < parentText.length) {
    const found = parentText.indexOf(selectedText, searchIndex)
    if (found === -1) break
    matches.push(found)
    searchIndex = found + selectedText.length
  }

  const currentOccurrence = matches.length
  return currentOccurrence > 0 ? currentOccurrence : 1
}

export function computeSourceAnchor(
  range: Range,
  selectedText: string
): SourceAnchor {
  const element = range.startContainer.parentElement
  const sel = computeCssPath(element)
  const ctx = extractContext(range, 40)
  const occ = countOccurrenceInParent(element, selectedText)

  return { sel, ctx, occ }
}
