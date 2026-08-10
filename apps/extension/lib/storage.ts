// Storage layer - chrome.storage.local wrappers with TypeScript interfaces
// Implements type-safe storage operations for all extension data

import { Storage } from '@plasmohq/storage';

export interface SourceAnchor {
  sel: string;
  ctx: string;
  occ: number;
}

// TypeScript interfaces matching API_SPEC.md
export interface QueuedWord {
  word: string;
  pronunciation?: string;
  definition: string;
  context: {
    sentence: string;
    source_url: string;
    source_anchor?: SourceAnchor;
    source_title?: string;
    captured_at?: string;
  };
  timestamp: number;
  retryCount: number;
}

export interface StoredWord {
  id: string;
  word: string;
  definition: string;
  savedAt: string;
}

export interface Settings {
  apiKey: string;
  firstRun: boolean;
  totalSaves: number;
  blacklistedDomains: string[];
}

export interface SyncState {
  queueSize: number;
  savedCount: number;
  lastSyncTime: number;
  syncStatus: 'loading' | 'synced' | 'pending' | 'error' | 'rate_limited' | 'no_auth';
  hasApiKey: boolean;
}

export interface DefinitionCache {
  [word: string]: {
    data: {
      word: string;
      phonetic: string;
      definition: string;
    };
    timestamp: number;
    ttl: number;
  };
}

// Storage keys
const STORAGE_KEYS = {
  QUEUE: 'hunter-queue',
  SETTINGS: 'hunter-settings',
  CACHE: 'hunter-cache',
} as const;

// Storage wrapper class
export class HunterStorage {
  private storage: Storage;

  constructor() {
    this.storage = new Storage();
  }

  // Queue operations
  async getQueue(): Promise<QueuedWord[]> {
    return await this.storage.get<QueuedWord[]>(STORAGE_KEYS.QUEUE) ?? [];
  }

  async addToQueue(word: QueuedWord): Promise<void> {
    const queue = await this.getQueue();
    queue.push(word);

    // Prune if over 100 items
    if (queue.length > 100) {
      queue.shift(); // Remove oldest item
    }

    await this.storage.set(STORAGE_KEYS.QUEUE, queue);
  }

  async removeFromQueue(word: string): Promise<void> {
    const queue = await this.getQueue();
    const filtered = queue.filter(w => w.word !== word);
    await this.storage.set(STORAGE_KEYS.QUEUE, filtered);
  }

  async clearQueue(): Promise<void> {
    await this.storage.set(STORAGE_KEYS.QUEUE, []);
  }

  // Settings operations
  async getSettings(): Promise<Settings> {
    const defaults: Settings = {
      apiKey: '',
      firstRun: true,
      totalSaves: 0,
      blacklistedDomains: [],
    };
    const stored = await this.storage.get<Settings>(STORAGE_KEYS.SETTINGS);
    if (!stored) return defaults;
    return { ...defaults, ...stored };
  }

  async setSettings(settings: Partial<Settings>): Promise<void> {
    const current = await this.getSettings();
    await this.storage.set(STORAGE_KEYS.SETTINGS, { ...current, ...settings });
  }

  // Blacklist operations
  async isBlacklisted(domain: string): Promise<boolean> {
    const { blacklistedDomains } = await this.getSettings();
    return blacklistedDomains.map(d => d.toLowerCase()).includes(domain.toLowerCase());
  }

  async addToBlacklist(domain: string): Promise<void> {
    const already = await this.isBlacklisted(domain);
    if (already) return;
    const { blacklistedDomains } = await this.getSettings();
    await this.setSettings({ blacklistedDomains: [...blacklistedDomains, domain.toLowerCase()] });
  }

  async removeFromBlacklist(domain: string): Promise<void> {
    const { blacklistedDomains } = await this.getSettings();
    await this.setSettings({
      blacklistedDomains: blacklistedDomains.filter(d => d.toLowerCase() !== domain.toLowerCase()),
    });
  }

  // Cache operations
  async getCachedDefinition(word: string): Promise<DefinitionCache[string] | null> {
    const cache = await this.storage.get<DefinitionCache>(STORAGE_KEYS.CACHE) ?? {};
    const entry = cache[word];

    if (!entry) {
      return null;
    }

    // Check TTL (24 hours)
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      // Expired
      delete cache[word];
      await this.storage.set(STORAGE_KEYS.CACHE, cache);
      return null;
    }

    return entry;
  }

  async setCachedDefinition(
    word: string,
    data: DefinitionCache[string]['data']
  ): Promise<void> {
    const cache = await this.storage.get<DefinitionCache>(STORAGE_KEYS.CACHE) ?? {};
    cache[word] = {
      data,
      timestamp: Date.now(),
      ttl: 86400000, // 24 hours in ms
    };
    await this.storage.set(STORAGE_KEYS.CACHE, cache);
  }

  // Quota monitoring (chrome.storage.local has 5MB limit)
  async getQuotaStatus(): Promise<{ used: number; total: number; percentage: number }> {
    const allData = await chrome.storage.local.get(null);
    const used = JSON.stringify(allData).length;
    const total = 5 * 1024 * 1024; // 5MB in bytes
    const percentage = (used / total) * 100;

    return { used, total, percentage };
  }
}

// Singleton instance
export const hunterStorage = new HunterStorage();
