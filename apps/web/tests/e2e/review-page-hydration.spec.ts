import { test, expect } from '@playwright/test';

test.describe('Review Page Hydration Check', () => {
  test('check for hydration errors in console', async ({ page }) => {
    // Collect all console messages
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push(`[${msg.type()}] ${text}`);
      console.log(`Console ${msg.type()}:`, text);
    });

    // Collect page errors
    const pageErrors: string[] = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
      console.log('Page error:', error.message);
    });

    // Navigate to the review page
    await page.goto('http://localhost:3002/review?type=flashcard&id=cmo5tyhs1000qhhp58ot8opx8&single=true');

    // Wait for initial load
    await page.waitForTimeout(3000);

    // Check for hydration-related messages
    const hydrationMessages = consoleMessages.filter(msg =>
      msg.toLowerCase().includes('hydrat') ||
      msg.toLowerCase().includes('mismatch') ||
      msg.toLowerCase().includes('server rendered')
    );

    console.log('=== Hydration-related messages ===');
    hydrationMessages.forEach(msg => console.log(msg));

    // Also check for sanitizer errors
    const sanitizerErrors = pageErrors.filter(err =>
      err.includes('sanitizer') ||
      err.includes('addHook') ||
      err.includes('DOMPurify')
    );

    console.log('=== Sanitizer errors ===');
    sanitizerErrors.forEach(err => console.log(err));

    // Take screenshot
    await page.screenshot({ path: 'test-results/review-hydration-check.png', fullPage: true });

    // Assertions - we expect NO hydration or sanitizer errors
    expect(hydrationMessages.filter(msg =>
      msg.includes('[error]') || msg.includes('[warning]')
    )).toEqual([]);

    expect(sanitizerErrors).toEqual([]);

    // Also check pageErrors for hydration-related issues
    const hydrationPageErrors = pageErrors.filter(err =>
      err.toLowerCase().includes('hydrat')
    );

    expect(hydrationPageErrors).toEqual([]);

    console.log('✅ No hydration or sanitizer errors detected!');
  });
});
