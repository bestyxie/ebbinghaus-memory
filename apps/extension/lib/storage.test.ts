// Unit tests for storage layer
import { describe, it, expect, beforeEach } from 'vitest';
import { HunterStorage, type QueuedWord, type Settings } from '@/lib/storage';

describe('HunterStorage', () => {
  let storage: HunterStorage;

  beforeEach(() => {
    storage = new HunterStorage();
    // Clear all storage before each test
    chrome.storage.local.clear();
  });

  describe('Queue operations', () => {
    it('should return empty queue initially', async () => {
      const queue = await storage.getQueue();
      expect(queue).toEqual([]);
    });

    it('should add word to queue', async () => {
      const word: QueuedWord = {
        word: 'ephemeral',
        pronunciation: '/ɪˈfem(ə)rəl/',
        definition: 'lasting for a very short time',
        context: {
          sentence: 'The beauty of the ephemeral is that it\'s temporary.',
          source_url: 'https://example.com/article',
        },
        timestamp: Date.now(),
        retryCount: 0,
      };

      await storage.addToQueue(word);
      const queue = await storage.getQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0]).toEqual(word);
    });

    it('should prune queue when adding 101st item', async () => {
      // Add 100 items
      for (let i = 0; i < 100; i++) {
        await storage.addToQueue({
          word: `word${i}`,
          definition: `definition${i}`,
          context: {
            sentence: `sentence${i}`,
            source_url: `https://example.com/${i}`,
          },
          timestamp: Date.now(),
          retryCount: 0,
        });
      }

      // Add 101st item
      await storage.addToQueue({
        word: 'word101',
        definition: 'definition101',
        context: {
          sentence: 'sentence101',
          source_url: 'https://example.com/101',
        },
        timestamp: Date.now(),
        retryCount: 0,
      });

      const queue = await storage.getQueue();
      expect(queue).toHaveLength(100);
      expect(queue[0].word).toBe('word1'); // First item pruned (word0 removed)
    });

    it('should remove word from queue', async () => {
      await storage.addToQueue({
        word: 'ephemeral',
        definition: 'test',
        context: {
          sentence: 'test sentence',
          source_url: 'https://example.com',
        },
        timestamp: Date.now(),
        retryCount: 0,
      });

      await storage.removeFromQueue('ephemeral');
      const queue = await storage.getQueue();
      expect(queue).toHaveLength(0);
    });

    it('should clear queue', async () => {
      await storage.addToQueue({
        word: 'test',
        definition: 'test',
        context: {
          sentence: 'test',
          source_url: 'https://example.com',
        },
        timestamp: Date.now(),
        retryCount: 0,
      });

      await storage.clearQueue();
      const queue = await storage.getQueue();
      expect(queue).toHaveLength(0);
    });
  });

  describe('Settings operations', () => {
    it('should return default settings initially', async () => {
      const settings = await storage.getSettings();
      expect(settings).toEqual({
        apiKey: '',
        firstRun: true,
        totalSaves: 0,
      });
    });

    it('should update settings', async () => {
      await storage.setSettings({ apiKey: 'test-key' });
      const settings = await storage.getSettings();
      expect(settings.apiKey).toBe('test-key');
      expect(settings.firstRun).toBe(true); // Other fields preserved
    });

    it('should merge settings updates', async () => {
      await storage.setSettings({ apiKey: 'key1' });
      await storage.setSettings({ firstRun: false });
      const settings = await storage.getSettings();
      expect(settings.apiKey).toBe('key1');
      expect(settings.firstRun).toBe(false);
    });
  });

  describe('Cache operations', () => {
    it('should return null for uncached word', async () => {
      const result = await storage.getCachedDefinition('ephemeral');
      expect(result).toBeNull();
    });

    it('should cache definition', async () => {
      await storage.setCachedDefinition('ephemeral', {
        word: 'ephemeral',
        phonetic: '/ɪˈfem(ə)rəl/',
        definition: 'lasting for a very short time',
      });

      const result = await storage.getCachedDefinition('ephemeral');
      expect(result).not.toBeNull();
      expect(result!.data.word).toBe('ephemeral');
    });

    it('should return null for expired cache entry', async () => {
      // Set cache with expired timestamp
      const cache = {
        ephemeral: {
          data: {
            word: 'ephemeral',
            phonetic: '/ɪˈfem(ə)rəl/',
            definition: 'test',
          },
          timestamp: Date.now() - 90000000, // Expired
          ttl: 86400000,
        },
      };

      chrome.storage.local.set({ 'hunter-cache': cache });

      const result = await storage.getCachedDefinition('ephemeral');
      expect(result).toBeNull();
    });
  });

  describe('Quota monitoring', () => {
    it('should return quota status', async () => {
      const status = await storage.getQuotaStatus();
      expect(status.used).toBeGreaterThan(0);
      expect(status.total).toBe(5 * 1024 * 1024);
      expect(status.percentage).toBeGreaterThan(0);
      expect(status.percentage).toBeLessThan(100);
    });
  });
});
