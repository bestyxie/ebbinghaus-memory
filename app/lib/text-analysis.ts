/**
 * Text analysis utilities for article cards
 * Provides functions for word counting, reading time calculation, and markdown processing
 */

/**
 * Calculate the word count of a text, excluding Markdown syntax
 * @param text - The text to analyze
 * @returns The number of words in the text
 */
export function calculateWordCount(text: string): number {
  if (!text) return 0

  // Remove code blocks
  let cleanText = text.replace(/```[\s\S]*?```/g, '')

  // Remove inline code
  cleanText = cleanText.replace(/`[^`]+`/g, '')

  // Remove Markdown links but keep the text
  cleanText = cleanText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

  // Remove Markdown images
  cleanText = cleanText.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')

  // Remove Markdown symbols (#, *, _, ~, >, |, -)
  cleanText = cleanText.replace(/[#*_~>|\-]/g, '')

  // Remove extra whitespace and count words
  const words = cleanText.trim().split(/\s+/).filter(Boolean)

  return words.length
}

/**
 * Calculate the estimated reading time in minutes
 * Based on average reading speed of 220 words per minute
 * @param wordCount - The number of words in the text
 * @returns The estimated reading time in minutes
 */
export function calculateReadTime(wordCount: number): number {
  if (wordCount <= 0) return 0
  // Average reading speed: 220 words per minute
  return Math.ceil(wordCount / 220)
}

/**
 * Extract text from a specific range in the raw Markdown content
 * @param rawMarkdown - The raw Markdown content
 * @param startIndex - The starting index
 * @param endIndex - The ending index
 * @returns The extracted text with Markdown formatting
 */
export function extractTextWithMarkdown(
  rawMarkdown: string,
  startIndex: number,
  endIndex: number
): string {
  if (!rawMarkdown || startIndex < 0 || endIndex > rawMarkdown.length || startIndex >= endIndex) {
    return ''
  }
  return rawMarkdown.substring(startIndex, endIndex)
}

/**
 * Insert a recall block marker into Markdown content
 * This function replaces the original text with a special marker that can be rendered
 * as an interactive recall block
 * @param content - The original Markdown content
 * @param blockId - The unique identifier for the recall block
 * @param originalText - The text to be replaced with a marker
 * @returns The updated content with the recall block marker
 */
export function insertRecallBlockMarker(
  content: string,
  blockId: string,
  originalText: string
): string {
  if (!content || !originalText) return content

  const marker = `:::recall-block id="${blockId}"\n${originalText}\n:::`
  return content.replace(originalText, marker)
}

/**
 * Calculate readability score using a simplified Flesch Reading Ease formula
 * @param text - The text to analyze
 * @returns A readability score (0-100), higher is easier to read
 */
export function calculateReadability(text: string): number {
  if (!text) return 0

  const cleanText = text.replace(/```[\s\S]*?```/g, '').replace(/`[^`]+`/g, '')
  const words = cleanText.trim().split(/\s+/).filter(Boolean)

  if (words.length === 0) return 0

  // Count sentences (rough approximation)
  const sentences = cleanText.split(/[.!?]+/).filter(Boolean).length

  // Count syllables (rough approximation for English)
  const syllableCount = words.reduce((count, word) => {
    return count + countSyllables(word)
  }, 0)

  // Flesch Reading Ease: 206.835 - 1.015 × (words/sentences) - 84.6 × (syllables/words)
  const avgWordsPerSentence = words.length / sentences
  const avgSyllablesPerWord = syllableCount / words.length

  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)

  // Clamp score between 0 and 100
  return Math.max(0, Math.min(100, Math.round(score)))
}

/**
 * Count syllables in a word (rough approximation for English)
 * @param word - The word to analyze
 * @returns The estimated number of syllables
 */
function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '')

  if (word.length <= 3) return 1

  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
  word = word.replace(/^y/, '')
  const syllables = word.match(/[aeiouy]{1,2}/g)

  return syllables ? syllables.length : 1
}

/**
 * Get a human-readable readability level
 * @param score - The readability score (0-100)
 * @returns A string describing the reading level
 */
export function getReadabilityLevel(score: number): string {
  if (score >= 90) return 'Very Easy (5th grade)'
  if (score >= 80) return 'Easy (6th grade)'
  if (score >= 70) return 'Fairly Easy (7th grade)'
  if (score >= 60) return 'Standard (8th-9th grade)'
  if (score >= 50) return 'Fairly Difficult (10th-12th grade)'
  if (score >= 30) return 'Difficult (College)'
  return 'Very Difficult (Graduate school)'
}

/**
 * Truncate text to a maximum length with ellipsis
 * @param text - The text to truncate
 * @param maxLength - The maximum length
 * @returns The truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}
