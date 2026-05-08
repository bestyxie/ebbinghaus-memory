// Extract sentence context around selected word

export function extractSentenceContext(fullText: string, selectedText: string): string {
  // Normalize whitespace: collapse newlines, tabs, and multiple spaces into single space
  const normalized = fullText.replace(/\s+/g, ' ').trim()

  const selectedIndex = normalized.indexOf(selectedText)
  if (selectedIndex === -1) return selectedText

  const before = normalized.substring(0, selectedIndex)
  const after = normalized.substring(selectedIndex + selectedText.length)

  // Find sentence start: last sentence boundary before the selection
  // Sentence boundary = sentence-ending punct [.!?。！？] + optional closing quotes/brackets + whitespace
  let sentenceStart = 0
  const startRegex = /[.!?。！？]["""'')\]]*(?:\s|$)/g
  let match
  while ((match = startRegex.exec(before)) !== null) {
    sentenceStart = match.index + match[0].length
  }

  // Find sentence end: first sentence-ending punctuation after the selection
  // Include any closing quotes/brackets after the punctuation (via lookahead to not consume trailing space)
  let sentenceEnd = after.length
  const endRegex = /[.!?。！？]["""'')\]]*(?=\s|$)/
  const endMatch = after.match(endRegex)
  if (endMatch && endMatch.index !== undefined) {
    sentenceEnd = endMatch.index + endMatch[0].length
  }

  return normalized.substring(
    sentenceStart,
    selectedIndex + selectedText.length + sentenceEnd
  ).trim()
}
