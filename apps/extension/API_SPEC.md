# API Specification (Mock Contract)

**Version:** 1.2
**Date:** 2026-04-13
**Status:** Updated to use /api/extension/* endpoints

---

## Ebbinghaus API

**Base URL:** `http://localhost:3001`

**TypeScript Interface:**
```typescript
interface FlashcardDTO {
  front: string;      // The vocabulary word
  back: string;       // The definition
  note?: string;      // Context sentence or notes
  deckId?: string;    // Target deck ID (optional)
  source?: string;    // Source URL (optional)
}
```

**Authentication:** Bearer Token in Authorization header
```
Authorization: Bearer <api_key>
```

### POST /api/extension/cards

Create a new flashcard.

**Request:**
```json
{
  "front": "ephemeral",
  "back": "lasting for a very short time",
  "note": "The beauty of the ephemeral is that it's temporary.",
  "source": "https://example.com/article"
}
```

**Fields:**
- `front` (string, required): The vocabulary word (card front)
- `back` (string, required): Word definition (card back)
- `note` (string, optional): Context sentence or additional notes
- `deckId` (string, optional): Target deck ID (if not provided, uses default deck)
- `source` (string, optional): Source URL where the word was found

**Response (Success - 200 OK):**
```json
{
  "saved": true,
  "id": "word_12345",
  "message": "Word saved successfully"
}
```

**Response (Error - 401 Unauthorized):**
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing API key"
}
```

**Response (Error - 429 Rate Limited):**
```json
{
  "error": "rate_limited",
  "message": "Too many requests. Retry after 600 seconds.",
  "retry_after": 600
}
```

**Response (Error - 400 Bad Request):**
```json
{
  "error": "bad_request",
  "message": "Invalid request format. 'front' and 'back' are required."
}
```

**Response (Error - 500 Server Error):**
```json
{
  "error": "server_error",
  "message": "Internal server error. Please try again."
}
```

### GET /api/extension/cards

List saved flashcards, optionally filtered by source URL.

**Request Headers:**
```
Authorization: Bearer <api_key>
```

**Query Parameters:**
- `source` (string, optional): Filter cards by source URL
- `limit` (integer, optional): Number of cards to return (default: 50)
- `offset` (integer, optional): Pagination offset (default: 0)

**Response (Success - 200 OK):**
```json
{
  "words": [
    {
      "id": "word_12345",
      "word": "ephemeral",
      "definition": "lasting for a very short time",
      "saved_at": "2026-04-10T10:30:00Z"
    }
  ],
  "total": 47,
  "limit": 50,
  "offset": 0
}
```

---

## Dictionary API

**Provider:** DictionaryAPI.dev (free tier: 5,000 requests/month)
**Base URL:** `https://api.dictionaryapi.dev/api/v2`

### GET /entries/{word}

Fetch definition for a word.

**Request:**
```
GET https://api.dictionaryapi.dev/api/v2/entries/{word}
```

**Path Parameters:**
- `word` (string, required): The word to define

**Response (Success - 200 OK):**
```json
[
  {
    "word": "ephemeral",
    "phonetic": "/ɪˈfem(ə)rəl/",
    "phonetics": [
      {
        "text": "/ɪˈfem(ə)rəl/",
        "audio": "https://api.dictionaryapi.dev/media/pronunciations/en/ephemeral-us.mp3"
      }
    ],
    "meanings": [
      {
        "partOfSpeech": "adjective",
        "definitions": [
          {
            "definition": "lasting for a very short time",
            "example": "the fashion industry is ephemeral",
            "synonyms": ["fleeting", "transient", "short-lived"]
          }
        ]
      }
    ]
  }
]
```

**Simplified Model (for MVP):**
```typescript
interface DictionaryResponse {
  word: string;
  phonetic: string;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
    }>;
  }>;
}
```

**Usage Notes:**
- Extract first meaning's first definition for tooltip preview
- Use `phonetic` field for pronunciation display
- Ignore audio for MVP (tooltip only shows text)
- Handle empty array response: return "Definition not available"

**Error Responses:**
- **404 Not Found:** Word not in dictionary → Show "Definition not available" in tooltip
- **429 Too Many Requests:** Rate limit exceeded → Use cached definition or show "API rate limit reached"

**Rate Limit:** 5,000 requests/month free tier ~166 requests/day. Implement local caching with 24-hour TTL.

---

## Local Storage Schema (chrome.storage.local)

### Queue Item
```typescript
interface QueuedWord {
  word: string;
  pronunciation?: string;
  definition: string;
  context: {
    sentence: string;
    source_url: string;
  };
  timestamp: number; // Date.now()
  retryCount: number; // 0-3
}
```

### Stored Words
```typescript
interface StoredWord {
  id: string; // from API response
  word: string;
  definition: string;
  savedAt: string; // ISO timestamp
}
```

### Settings
```typescript
interface Settings {
  apiKey: string;
  firstRun: boolean; // triggers onboarding
  totalSaves: number; // for milestone tracking
}
```

### Definition Cache
```typescript
interface DefinitionCache {
  [word: string]: {
    data: {
      word: string;
      phonetic: string;
      definition: string;
    };
    timestamp: number; // Date.now()
    ttl: 86400000; // 24 hours in ms
  }
}
```

---

## Implementation Notes

1. **API Key Validation:** Send a test request to GET /api/extension/cards?source=https://example.com&limit=1. If 401, API key is invalid.
2. **Data Mapping:** Local `QueuedWord` maps to API `FlashcardDTO`:
   - `word` → `front`
   - `definition` → `back`
   - `context.sentence` → `note`
   - `context.source_url` → `source`
   - `pronunciation` is stored locally but not sent to API
3. **Batch Sync:** When syncing queue, use POST /api/extension/cards with `FlashcardDTO[]` array.
4. **Retry Logic:** On 5xx error, increment retry count. After 3 retries, mark as failed (show in popup).
5. **Rate Limit Handling:** On 429, parse `retry_after` and schedule sync alarm for that many seconds in the future.

---

**Next Steps:**
1. Replace `API_BASE` placeholder with actual Ebbinghaus API endpoint
2. Test with real API to validate FlashcardDTO structure
3. Add deck management if `deckId` field is needed in the future
