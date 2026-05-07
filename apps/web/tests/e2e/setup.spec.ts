import { test as base, expect } from '@playwright/test';

// Create a custom test that saves storage state
const test = base.extend({
  // Save storage state after successful login
  storageState: async ({ page }, use) => {
    // Go to login page
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Fill login form
    await page.fill('input[name="email"]', 'test@test.com');
    await page.fill('input[name="password"]', '1234567890');

    // Submit form
    await page.press('input[name="password"]', 'Enter');

    // Wait for navigation to dashboard (up to 10 seconds)
    try {
      await page.waitForURL('/dashboard', { timeout: 10000 });
      console.log('✅ Login successful!');

      // Wait a bit for page to stabilize
      await page.waitForTimeout(2000);

      // Save storage state to file
      await page.context().storageState({ path: 'tests/e2e/storage-state.json' });
      console.log('✅ Storage state saved to tests/e2e/storage-state.json');
    } catch (error) {
      console.log('❌ Login failed. Trying to register...');

      // If login fails, try to register
      await page.click('text=立即注册');
      await page.waitForSelector('input[name="name"]', { timeout: 5000 });

      await page.fill('input[name="email"]', 'test@test.com');
      await page.fill('input[name="password"]', '1234567890');
      await page.fill('input[name="name"]', 'Test User');

      await page.press('input[name="name"]', 'Enter');

      // Wait for navigation to dashboard
      await page.waitForURL('/dashboard', { timeout: 10000 });
      console.log('✅ Registration successful!');

      // Wait for page to stabilize
      await page.waitForTimeout(2000);

      // Save storage state
      await page.context().storageState({ path: 'tests/e2e/storage-state.json' });
      console.log('✅ Storage state saved to tests/e2e/storage-state.json');
    }

    // Now use the storage state for actual tests
    await use('tests/e2e/storage-state.json');
  },
});

test('setup: generate storage state for E2E tests', async ({ page }) => {
  // This test just needs to run to generate the storage state
  // The actual work is done in the storageState fixture above

  // Verify we're on dashboard
  expect(page.url()).toContain('/dashboard');

  // Verify we're logged in by checking for logout button or user info
  const logoutBtn = page.locator('text=Logout').or(page.locator('[aria-label*="Logout"]'));
  await expect(logoutBtn.first()).toBeVisible({ timeout: 5000 });

  console.log('✅ Setup complete! Storage state is ready for E2E tests.');
});
