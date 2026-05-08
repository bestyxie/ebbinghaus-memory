// Unit tests for Dictionary API client
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DictionaryAPI } from '@/lib/dictionary-api';

describe('DictionaryAPI', () => {
  let api: DictionaryAPI;

  beforeEach(() => {
    api = new DictionaryAPI('test-api-key');
    global.fetch = vi.fn();
  });

  it('should get definition successfully', async () => {
    const mockResponse = [
      {
        word: 'ephemeral',
        phonetic: '/ɪˈfem(ə)rəl/',
        phonetics: [
          {
            text: '/ɪˈfem(ə)rəl/',
            audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/ephemeral-us.mp3',
          },
        ],
        meanings: [
          {
            partOfSpeech: 'adjective',
            definitions: [
              {
                definition: 'lasting for a very short time',
                example: 'the fashion industry is ephemeral',
                synonyms: ['fleeting', 'transient', 'short-lived'],
              },
            ],
          },
        ],
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await api.getDefinition('ephemeral');
    expect(result).toEqual(mockResponse);
  });

  it('should return empty array for 404', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const result = await api.getDefinition('nonexistentword');
    expect(result).toEqual([]);
  });

  it('should throw error for other failures', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    await expect(api.getDefinition('test')).rejects.toThrow('Network error');
  });

  it('should get simplified definition', async () => {
    const mockResponse = [
      {
        word: 'ephemeral',
        phonetic: '/ɪˈfem(ə)rəl/',
        meanings: [
          {
            partOfSpeech: 'adjective',
            definitions: [
              {
                definition: 'lasting for a very short time',
                example: 'the fashion industry is ephemeral',
              },
            ],
          },
        ],
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await api.getSimplifiedDefinition('ephemeral');
    expect(result).toEqual({
      word: 'ephemeral',
      phonetic: '/ɪˈfem(ə)rəl/',
      definition: 'lasting for a very short time',
    });
  });

  it('should return null for simplified definition when word not found', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const result = await api.getSimplifiedDefinition('nonexistentword');
    expect(result).toBeNull();
  });

  it('should return null for simplified definition on error', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const result = await api.getSimplifiedDefinition('test');
    expect(result).toBeNull();
  });
});
