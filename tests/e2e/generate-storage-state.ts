#!/usr/bin/env node
/**
 * Generate Playwright storage state for E2E tests using API authentication
 */

import { chromium, type BrowserContext } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const STORAGE_STATE_PATH = 'tests/e2e/storage-state.json';
const TEST_USER = {
  email: 'test@test.com',
  password: '1234567890',
};

async function generateStorageState() {
  console.log('🚀 Generating storage state using API authentication...');
  console.log(`📍 Base URL: ${BASE_URL}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    baseURL: BASE_URL,
  });
  const page = await context.newPage();

  try {
    // First, let's check if user exists by trying to login
    console.log('🔐 Attempting to login via API...');

    const response = await page.request.post(`${BASE_URL}/api/auth/sign-in/email`, {
      data: {
        email: TEST_USER.email,
        password: TEST_USER.password,
      },
    });

    if (!response.ok()) {
      console.log('❌ Login failed, trying to register...');

      // Try to register
      const registerResponse = await page.request.post(`${BASE_URL}/api/auth/sign-up/email`, {
        data: {
          email: TEST_USER.email,
          password: TEST_USER.password,
          name: 'Test User',
        },
      });

      if (!registerResponse.ok()) {
        throw new Error(`Registration failed: ${registerResponse.status()}`);
      }

      console.log('✅ Registration successful!');
    } else {
      console.log('✅ Login successful!');
    }

    // Verify we have cookies
    const cookies = await context.cookies();
    console.log(`🍪 Received ${cookies.length} cookies`);

    const sessionCookie = cookies.find(c => c.name.includes('session'));
    if (sessionCookie) {
      console.log(`✅ Session cookie found: ${sessionCookie.name}`);
    }

    // Go to dashboard to verify authentication works
    console.log('📍 Navigating to dashboard to verify authentication...');
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    console.log(`📍 Current URL after navigation: ${currentUrl}`);

    if (currentUrl.includes('/dashboard')) {
      console.log('✅ Successfully authenticated and reached dashboard!');
    } else if (currentUrl.includes('/login')) {
      throw new Error('Authentication failed - redirected to login page');
    }

    // Wait for page to stabilize
    await page.waitForTimeout(1000);

    // Save storage state
    console.log(`💾 Saving storage state to ${STORAGE_STATE_PATH}...`);
    await context.storageState({ path: STORAGE_STATE_PATH });
    console.log('✅ Storage state saved successfully!');

    // Verify the file was created
    const fs = await import('fs/promises');
    try {
      const stats = await fs.stat(STORAGE_STATE_PATH);
      console.log(`📁 File size: ${stats.size} bytes`);

      // Read and log a preview of the storage state
      const content = JSON.parse(await fs.readFile(STORAGE_STATE_PATH, 'utf-8'));
      console.log(`📋 Storage state contains ${content.cookies?.length || 0} cookies`);
      if (content.cookies && content.cookies.length > 0) {
        console.log('   Cookies:', content.cookies.map((c: any) => c.name).join(', '));
      }
    } catch (err) {
      console.warn('⚠️  Could not verify storage state file:', err);
    }

    console.log('\n✨ Setup complete! You can now run E2E tests with:');
    console.log('   pnpm test:e2e');

  } catch (error) {
    console.error('❌ Error generating storage state:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

generateStorageState();
