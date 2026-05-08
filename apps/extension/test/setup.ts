// Test setup file - mocks chrome APIs for testing
import { vi } from 'vitest';

// Mock chrome.storage.local with proper structure
const mockStorageData: Record<string, any> = {};

// Create proper chrome.storage.local mock
const chromeStorageLocal = {
  get: (keys: string | string[] | Record<string, any> | null): Promise<Record<string, any>> => {
    return new Promise((resolve) => {
      const result: Record<string, any> = {};

      if (keys === null) {
        // Get all
        Object.assign(result, mockStorageData);
      } else if (typeof keys === 'string') {
        result[keys] = mockStorageData[keys] ?? null;
      } else if (Array.isArray(keys)) {
        keys.forEach((key) => {
          result[key] = mockStorageData[key] ?? null;
        });
      } else if (typeof keys === 'object') {
        Object.keys(keys).forEach((key) => {
          result[key] = mockStorageData[key] ?? null;
        });
      }

      resolve(result);
    });
  },

  set: (items: Record<string, any>): Promise<void> => {
    return new Promise((resolve) => {
      Object.assign(mockStorageData, items);
      resolve();
    });
  },

  clear: (): Promise<void> => {
    return new Promise((resolve) => {
      Object.keys(mockStorageData).forEach(key => {
        delete mockStorageData[key];
      });
      resolve();
    });
  },

  // For compatibility with code that might use these methods
  remove: (keys: string | string[]): Promise<void> => {
    return new Promise((resolve) => {
      const keysArray = Array.isArray(keys) ? keys : [keys];
      keysArray.forEach((key) => {
        delete mockStorageData[key];
      });
      resolve();
    });
  },

  getBytesInUse: (callback: (bytesInUse: number) => void): void => {
    const size = new Blob([JSON.stringify(mockStorageData)]).size;
    callback(size);
  }
};

const mockChrome = {
  storage: {
    local: chromeStorageLocal,
    // Also add sync for compatibility
    sync: chromeStorageLocal,
  },
  runtime: {
    onInstalled: {
      addListener: vi.fn(),
    },
    getManifest: vi.fn(() => ({ version: '0.0.1' })),
  },
};

// Set up chrome global before tests
global.chrome = mockChrome as any;

// Reset mock storage before each test
beforeEach(() => {
  Object.keys(mockStorageData).forEach(key => {
    delete mockStorageData[key];
  });
});

// Mock fetch API
global.fetch = vi.fn();
