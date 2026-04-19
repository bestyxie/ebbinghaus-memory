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

test.describe('Rich Text Editor - Bubble Menu', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');
    await openCreateCardModal(page);
  });

  test('should show bubble menu on text selection', async ({ page }) => {
    await page.fill('input[name="front"]', 'Test Bubble');

    const editor = page.locator('.ProseMirror').first();
    await editor.click();
    await editor.type('Select this text');

    // Select text
    await editor.press('Control+a');

    // Bubble menu should appear
    const bubbleMenu = page.locator('.bubble-menu');
    await expect(bubbleMenu).toBeVisible();

    // Should have bold, italic, underline buttons
    await expect(bubbleMenu.locator('button')).toHaveCount(3);
  });

  test('should apply formatting via bubble menu', async ({ page }) => {
    await page.fill('input[name="front"]', 'Test Bubble Format');

    const editor = page.locator('.ProseMirror').first();
    await editor.click();
    await editor.type('Format me');
    await editor.press('Shift+Home'); // Select "Format me"

    // Click bold in bubble menu
    const bubbleMenu = page.locator('.bubble-menu');
    await bubbleMenu.locator('button').first().click(); // Bold button

    await expect(editor.locator('strong')).toContainText('Format me');
  });
});

test.describe('Rich Text Editor - Advanced Features', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');
    await openCreateCardModal(page);
  });

  test('should create card with highlight color', async ({ page }) => {
    await page.fill('input[name="front"]', 'Test Highlight');

    const editor = page.locator('.ProseMirror').first();
    await editor.click();
    await editor.type('Highlighted text');
    await editor.press('Control+a');

    // Click highlight button and select yellow
    await page.click('[aria-label="Highlight"]');
    await page.click('[data-color="yellow"]');

    // Verify highlight applied
    const highlighted = await editor.locator('mark[style*="background-color: yellow"]');
    await expect(highlighted).toBeVisible();

    await page.selectOption('select[name="deckId"]', { index: 0 });
    await page.click('button[type="submit"]');
    await page.waitForSelector('[role="dialog"]', { state: 'hidden' });

    await goToReview(page);
    await expect(page.locator('mark[style*="background"]')).toBeVisible();
  });

  test('should create card with text alignment', async ({ page }) => {
    await page.fill('input[name="front"]', 'Test Alignment');

    const editor = page.locator('.ProseMirror').first();
    await editor.click();

    // Click center align
    await page.click('[aria-label="Center align"]');
    await editor.type('Centered text');

    // Verify alignment applied
    const aligned = await editor.locator('p[style*="text-align: center"]');
    await expect(aligned).toBeVisible();

    await page.selectOption('select[name="deckId"]', { index: 0 });
    await page.click('button[type="submit"]');
    await page.waitForSelector('[role="dialog"]', { state: 'hidden' });

    await goToReview(page);
    await expect(page.locator('p[style*="text-align: center"]')).toBeVisible();
  });

  test('should create card with code block', async ({ page }) => {
    await page.fill('input[name="front"]', 'Test Code');

    const editor = page.locator('.ProseMirror').first();
    await editor.click();

    // Click code block button
    await page.click('[aria-label="Code block"]');
    await editor.type('const x = 42;');

    // Verify code block
    const codeBlock = await editor.locator('pre code');
    await expect(codeBlock).toBeVisible();
    await expect(codeBlock).toContainText('const x = 42;');

    await page.selectOption('select[name="deckId"]', { index: 0 });
    await page.click('button[type="submit"]');
    await page.waitForSelector('[role="dialog"]', { state: 'hidden' });

    await goToReview(page);
    await expect(page.locator('pre code')).toContainText('const x = 42;');
  });

  test('should create card with blockquote', async ({ page }) => {
    await page.fill('input[name="front"]', 'Test Quote');

    const editor = page.locator('.ProseMirror').first();
    await editor.click();

    // Click blockquote button
    await page.click('[aria-label="Blockquote"]');
    await editor.type('This is a quote');

    const quote = await editor.locator('blockquote');
    await expect(quote).toBeVisible();
    await expect(quote).toContainText('This is a quote');

    await page.selectOption('select[name="deckId"]', { index: 0 });
    await page.click('button[type="submit"]');
    await page.waitForSelector('[role="dialog"]', { state: 'hidden' });

    await goToReview(page);
    await expect(page.locator('blockquote')).toContainText('This is a quote');
  });
});
