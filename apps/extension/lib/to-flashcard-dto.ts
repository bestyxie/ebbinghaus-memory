// Convert QueuedWord to FlashcardDTO for API submission

import type { QueuedWord } from '@/lib/storage'
import type { FlashcardDTO } from '@/lib/ebbinghaus-api'

export function toFlashcardDTO(word: QueuedWord): FlashcardDTO {
  return {
    front: word.word,
    back: word.definition,
    note: word.context.sentence,
    source: word.context.source_url,
  }
}
