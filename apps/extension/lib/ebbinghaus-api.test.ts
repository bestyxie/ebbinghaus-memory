// Unit tests for Ebbinghaus API client
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EbbinghausAPI, isValidApiKeyFormat, toFlashcardDTO, type FlashcardDTO } from '@/lib/ebbinghaus-api';
import type { QueuedWord } from '@/lib/storage';

describe('toFlashcardDTO', () => {
  const queued: QueuedWord = {
    word: 'ephemeral',
    pronunciation: '/ɪˈfem(ə)rəl/',
    definition: 'lasting for a very short time',
    context: {
      sentence: 'The beauty of the ephemeral is that it\'s temporary.',
      source_url: 'https://example.com/article#:~:text=ephemeral',
      source_anchor: { sel: 'body > article > p', ctx: 'the ephemeral nature', occ: 1 },
      source_title: 'The Ephemeral Self',
      captured_at: '2026-08-10T12:00:00Z',
    },
    timestamp: 1000,
    retryCount: 0,
  };

  it('maps word to front', () => {
    expect(toFlashcardDTO(queued).front).toBe('ephemeral');
  });

  it('maps definition to back', () => {
    expect(toFlashcardDTO(queued).back).toBe('lasting for a very short time');
  });

  it('maps context.sentence to note', () => {
    expect(toFlashcardDTO(queued).note).toBe('The beauty of the ephemeral is that it\'s temporary.');
  });

  it('maps context.source_url to sourceUrl', () => {
    expect(toFlashcardDTO(queued).sourceUrl).toBe('https://example.com/article#:~:text=ephemeral');
  });

  it('maps word to sourceWord', () => {
    expect(toFlashcardDTO(queued).sourceWord).toBe('ephemeral');
  });

  it('sets sourceProvenance to chrome-extension', () => {
    expect(toFlashcardDTO(queued).sourceProvenance).toBe('chrome-extension');
  });

  it('maps context.source_anchor to sourceAnchor', () => {
    expect(toFlashcardDTO(queued).sourceAnchor).toEqual({ sel: 'body > article > p', ctx: 'the ephemeral nature', occ: 1 });
  });

  it('maps context.source_title to sourceTitle', () => {
    expect(toFlashcardDTO(queued).sourceTitle).toBe('The Ephemeral Self');
  });

  it('maps context.captured_at to capturedAt', () => {
    expect(toFlashcardDTO(queued).capturedAt).toBe('2026-08-10T12:00:00Z');
  });

  it('does not include word, definition, context, pronunciation, timestamp, or retryCount', () => {
    const dto = toFlashcardDTO(queued) as any;
    expect(dto.word).toBeUndefined();
    expect(dto.definition).toBeUndefined();
    expect(dto.context).toBeUndefined();
    expect(dto.pronunciation).toBeUndefined();
    expect(dto.timestamp).toBeUndefined();
    expect(dto.retryCount).toBeUndefined();
  });
});

describe('isValidApiKeyFormat', () => {
  it('rejects empty string', () => {
    expect(isValidApiKeyFormat('')).toBe(false);
  });

  it('rejects whitespace-only string', () => {
    expect(isValidApiKeyFormat('   ')).toBe(false);
  });

  it('rejects placeholder "your-api-key-here"', () => {
    expect(isValidApiKeyFormat('your-api-key-here')).toBe(false);
  });

  it('rejects placeholder "YOUR_API_KEY"', () => {
    expect(isValidApiKeyFormat('YOUR_API_KEY')).toBe(false);
  });

  it('rejects keys shorter than 16 characters', () => {
    expect(isValidApiKeyFormat('short-key')).toBe(false);
  });

  it('rejects keys with invalid characters', () => {
    expect(isValidApiKeyFormat('invalid key with spaces!!')).toBe(false);
  });

  it('accepts a valid 16+ char alphanumeric key', () => {
    expect(isValidApiKeyFormat('abcdef1234567890')).toBe(true);
  });

  it('accepts a key with hyphens, underscores, and dots', () => {
    expect(isValidApiKeyFormat('my-api_key.v2-1234567890')).toBe(true);
  });

  it('trims leading/trailing whitespace before validation', () => {
    expect(isValidApiKeyFormat('  abcdef1234567890  ')).toBe(true);
  });
});

describe('EbbinghausAPI', () => {
  let api: EbbinghausAPI;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    api = new EbbinghausAPI(mockApiKey);
    global.fetch = vi.fn();
  });

  it('should create API with api key', () => {
    expect(api).toBeDefined();
  });

  it('should save flashcard successfully', async () => {
    const card: FlashcardDTO = {
      front: 'ephemeral',
      back: 'lasting for a very short time',
      note: 'The beauty of the ephemeral is that it\'s temporary.',
      sourceUrl: 'https://example.com/article',
      sourceWord: 'ephemeral',
      sourceProvenance: 'chrome-extension',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        saved: true,
        id: 'word_12345',
        message: 'Word saved successfully',
      }),
    });

    const result = await api.saveWord(card);
    expect(result.saved).toBe(true);
    expect(result.id).toBe('word_12345');
  });

  it('should send FlashcardDTO fields in request body', async () => {
    const card: FlashcardDTO = {
      front: 'ephemeral',
      back: 'lasting for a very short time',
      note: 'The beauty of the ephemeral is that it\'s temporary.',
      sourceUrl: 'https://example.com/article',
      sourceWord: 'ephemeral',
      sourceProvenance: 'chrome-extension',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ saved: true, id: 'word_12345', message: 'ok' }),
    });

    await api.saveWord(card);

    // Verify POST /api/extension/cards endpoint
    const url = (global.fetch as any).mock.calls[0][0];
    expect(url).toContain('/api/extension/cards');

    const body = JSON.parse((global.fetch as any).mock.calls[0][1].body);
    expect(body).toEqual({
      front: 'ephemeral',
      back: 'lasting for a very short time',
      note: 'The beauty of the ephemeral is that it\'s temporary.',
      sourceUrl: 'https://example.com/article',
      sourceWord: 'ephemeral',
      sourceProvenance: 'chrome-extension',
    });
  });

  it('should call new endpoint with source query param', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        words: [],
        total: 0,
        limit: 50,
        offset: 0,
      }),
    });

    await api.listWords(50, 0, 'https://example.com');

    // Verify GET /api/extension/cards?source=... endpoint
    const url = (global.fetch as any).mock.calls[0][0];
    expect(url).toContain('/api/extension/cards');
    expect(url).toContain('source=');
  });

  it('should handle 401 unauthorized error', async () => {
    const card: FlashcardDTO = {
      front: 'test',
      back: 'test definition',
      note: 'test sentence',
      sourceUrl: 'https://example.com',
      sourceWord: 'test',
      sourceProvenance: 'chrome-extension',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({
        error: 'Unauthorized',
        message: 'Invalid or missing API key',
      }),
    });

    await expect(api.saveWord(card)).rejects.toThrow('Unauthorized: Invalid or missing API key');
  });

  it('should handle 429 rate limit error', async () => {
    const card: FlashcardDTO = {
      front: 'test',
      back: 'test definition',
      note: 'test sentence',
      sourceUrl: 'https://example.com',
      sourceWord: 'test',
      sourceProvenance: 'chrome-extension',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({
        error: 'rate_limited',
        message: 'Too many requests. Retry after 600 seconds.',
        retry_after: 600,
      }),
    });

    await expect(api.saveWord(card)).rejects.toThrow('Rate limited. Retry after 600 seconds.');
  });

  it('should handle 500 server error', async () => {
    const card: FlashcardDTO = {
      front: 'test',
      back: 'test definition',
      note: 'test sentence',
      sourceUrl: 'https://example.com',
      sourceWord: 'test',
      sourceProvenance: 'chrome-extension',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(api.saveWord(card)).rejects.toThrow('Server error. Please try again.');
  });

  it('should list words successfully', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        cards: [
          {
            id: 'word_12345',
            front: 'ephemeral',
            back: 'lasting for a very short time',
            sourceUrl: 'https://example.com/article',
            sourceTitle: null,
            createdAt: '2026-04-10T10:30:00Z',
          },
        ],
        total: 1,
        limit: 50,
        offset: 0,
      }),
    });

    const result = await api.listWords();
    expect(result.cards).toHaveLength(1);
    expect(result.cards[0].front).toBe('ephemeral');
  });

  it('should validate API key successfully', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        cards: [],
        total: 0,
        limit: 1,
        offset: 0,
      }),
    });

    const isValid = await api.validateApiKey();
    expect(isValid).toBe(true);
  });

  it('should invalidate API key on error', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    const isValid = await api.validateApiKey();
    expect(isValid).toBe(false);
  });
});
