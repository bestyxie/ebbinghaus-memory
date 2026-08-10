// Convert QueuedWord to FlashcardDTO for API submission

import type { QueuedWord } from '@/lib/storage'
import type { FlashcardDTO } from '@/lib/ebbinghaus-api'

export function toFlashcardDTO(word: QueuedWord): FlashcardDTO {
  return {
    front: word.word,
    back: word.definition,
    note: word.context.sentence,
    sourceUrl: word.context.source_url,
    sourceWord: word.word,
    ...(word.context.source_anchor && { sourceAnchor: word.context.source_anchor }),
    ...(word.context.source_title && { sourceTitle: word.context.source_title }),
    ...(word.context.captured_at && { capturedAt: word.context.captured_at }),
    sourceProvenance: 'chrome-extension',
  }
}
