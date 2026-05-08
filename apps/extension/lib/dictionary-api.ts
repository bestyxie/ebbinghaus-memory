// Dictionary API client
// Uses local API endpoint: GET /api/extension/dictionary?word={word}

export interface DictionaryResponse {
  word: string;
  basicTranslation: string | null;  // 中文翻译
  phonetic: string;                 // 音标
  audio: string;                    // 音频
  englishDefinitions: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
      synonyms?: string[];
    }>;
  }>;
}

const API_BASE = (process.env.PLASMO_PUBLIC_API_BASE || 'http://localhost:3001') + '/api/extension';

export class DictionaryAPI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getDefinition(word: string): Promise<DictionaryResponse | null> {
    const url = `${API_BASE}/dictionary?word=${encodeURIComponent(word)}`;
    console.log('[DictionaryAPI] Fetching URL:', url);
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });
    console.log('[DictionaryAPI] Response status:', response.status, 'ok:', response.ok);

    if (response.status === 404) {
      // Word not found
      console.log('[DictionaryAPI] Word not found (404)');
      return null;
    }

    if (!response.ok) {
      console.error('[DictionaryAPI] Failed to fetch definition, status:', response.status);
      throw new Error('Failed to fetch definition');
    }

    const data: DictionaryResponse = await response.json();
    console.log('[DictionaryAPI] Got data:', data);

    return data;
  }

  // Simplified model for MVP
  async getSimplifiedDefinition(word: string): Promise<{
    word: string;
    phonetic: string;
    definition: string;
    chineseTranslation?: string;
    audio?: string;
  } | null> {
    try {
      console.log('[DictionaryAPI] Getting definition for:', word);
      const data = await this.getDefinition(word);

      if (!data) {
        console.log('[DictionaryAPI] No result found');
        return null;
      }

      // Get first English definition
      let firstDefinition = '';
      if (data.englishDefinitions && data.englishDefinitions.length > 0) {
        const firstMeaning = data.englishDefinitions[0];
        if (firstMeaning.definitions && firstMeaning.definitions.length > 0) {
          firstDefinition = firstMeaning.definitions[0].definition;
        }
      }

      const result = {
        word: data.word,
        phonetic: data.phonetic || '',
        definition: firstDefinition,
        chineseTranslation: data.basicTranslation || undefined,
        audio: data.audio || undefined,
      };
      console.log('[DictionaryAPI] Simplified result:', result);
      return result;
    } catch (error) {
      console.error('[DictionaryAPI] Error getting definition:', error);
      return null;
    }
  }
}
