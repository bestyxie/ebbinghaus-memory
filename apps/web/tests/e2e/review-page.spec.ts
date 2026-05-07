import { test, expect } from '@playwright/test';

test.describe('Review Page', () => {
  test('should load review page without errors', async ({ page }) => {
    // Track any JavaScript errors
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
      console.log('❌ JavaScript error:', error.message);
    });

    // Track console messages for hydration warnings
    const consoleWarnings: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        const text = msg.text();
        consoleWarnings.push(text);
        console.log(`⚠️  Console ${msg.type()}:`, text);
      }
    });

    // Navigate to the review page with the correct URL format
    await page.goto('http://localhost:3002/review?type=flashcard&id=cmo5tyhs1000qhhp58ot8opx8&single=true');

    // Wait for page to load
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 });

    // Check if we're on the review page (not redirected to login)
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    if (currentUrl.includes('/login')) {
      console.log('⚠️  Redirected to login - authentication may be required');
    }

    // Wait for page to stabilize
    await page.waitForTimeout(2000);

    // Take a screenshot for visual verification
    await page.screenshot({ path: 'test-results/review-page.png' });

    // Wait a bit more to catch any delayed errors
    await page.waitForTimeout(2000);

    // Check for hydration errors
    const hydrationErrors = [
      ...errors.filter(err => err.includes('Hydration') || err.includes('hydrat')),
      ...consoleWarnings.filter(w => w.includes('Hydration') || w.includes('hydrat'))
    ];

    if (hydrationErrors.length > 0) {
      console.log('❌ Hydration errors detected:', hydrationErrors);
    }

    expect(hydrationErrors).toEqual([]);

    // Assert no critical sanitizer errors occurred
    const sanitizerErrors = errors.filter(err => err.includes('sanitizer') || err.includes('addHook'));
    expect(sanitizerErrors).toEqual([]);

    console.log('✅ Test completed!');
  });
});
