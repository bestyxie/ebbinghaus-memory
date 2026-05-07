import { test as base } from '@playwright/test';

// Re-export base test (storage state is configured globally in playwright.config.ts)
export const test = base;
