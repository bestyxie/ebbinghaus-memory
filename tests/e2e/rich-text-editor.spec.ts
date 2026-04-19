import { test, expect } from '@playwright/test';
import { login, TEST_USER } from './helpers/auth';
import { openCreateCardModal, goToReview } from './helpers/cards';

test.describe('Rich Text Editor - Create Card', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should create card with bold text', async ({ page }) => {
    await page.goto('/dashboard');
    await openCreateCardModal(page);

    // Fill front
    await page.fill('input[name="front"]', 'Test Bold');

    // Click in editor
    const editor = page.locator('.ProseMirror').first();
    await editor.click();

    // Type text
    await editor.type('This is bold text');

    // Select all text
    await editor.press('Control+a');
    await editor.press('Control+b'); // Keyboard shortcut for bold

    // Verify bold is applied
    const boldText = await editor.locator('strong').textContent();
    expect(boldText).toBe('This is bold text');

    // Submit form
    await page.selectOption('select[name="deckId"]', { index: 0 });
    await page.click('button[type="submit"]');
    await page.waitForSelector('[role="dialog"]', { state: 'hidden' });

    // Go to review and verify
    await goToReview(page);
    const reviewCard = page.locator('text=This is bold text');
    await expect(reviewCard).toBeVisible();
    await expect(reviewCard.locator('strong')).toBeVisible();
  });

  test('should create card with italic text', async ({ page }) => {
    await page.goto('/dashboard');
    await openCreateCardModal(page);

    await page.fill('input[name="front"]', 'Test Italic');

    const editor = page.locator('.ProseMirror').first();
    await editor.click();
    await editor.type('Italic text');
    await editor.press('Control+a');
    await editor.press('Control+i');

    const italicText = await editor.locator('em').textContent();
    expect(italicText).toBe('Italic text');

    await page.selectOption('select[name="deckId"]', { index: 0 });
    await page.click('button[type="submit"]');
    await page.waitForSelector('[role="dialog"]', { state: 'hidden' });

    await goToReview(page);
    await expect(page.locator('em:has-text("Italic text")')).toBeVisible();
  });

  test('should create card with heading', async ({ page }) => {
    await page.goto('/dashboard');
    await openCreateCardModal(page);

    await page.fill('input[name="front"]', 'Test Heading');

    const editor = page.locator('.ProseMirror').first();
    await editor.click();

    // Click H2 button in toolbar
    await page.click('[aria-label="Heading 2"]');
    await editor.type('This is a heading');

    const heading = await editor.locator('h2').textContent();
    expect(heading).toBe('This is a heading');

    await page.selectOption('select[name="deckId"]', { index: 0 });
    await page.click('button[type="submit"]');
    await page.waitForSelector('[role="dialog"]', { state: 'hidden' });

    await goToReview(page);
    await expect(page.locator('h2:has-text("This is a heading")')).toBeVisible();
  });

  test('should create card with bullet list', async ({ page }) => {
    await page.goto('/dashboard');
    await openCreateCardModal(page);

    await page.fill('input[name="front"]', 'Test List');

    const editor = page.locator('.ProseMirror').first();
    await editor.click();

    // Click bullet list button
    await page.click('[aria-label="Bullet list"]');
    await editor.type('First item');
    await editor.press('Enter');
    await editor.type('Second item');

    const listItems = await editor.locator('ul li').count();
    expect(listItems).toBe(2);

    await page.selectOption('select[name="deckId"]', { index: 0 });
    await page.click('button[type="submit"]');
    await page.waitForSelector('[role="dialog"]', { state: 'hidden' });

    await goToReview(page);
    await expect(page.locator('ul li').first()).toContainText('First item');
    await expect(page.locator('ul li').nth(1)).toContainText('Second item');
  });
});
