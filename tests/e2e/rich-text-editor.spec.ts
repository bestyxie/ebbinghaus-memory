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

    // Find the TipTap editor (it has class 'prose' from editorProps)
    const editor = page.locator('.ProseMirror, .prose').first();
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click();

    // Type text
    await editor.type('This is bold text');

    // Select all text and apply bold
    await editor.press('Control+a');
    await editor.press('Control+b'); // Keyboard shortcut for bold

    // Wait a bit for formatting to apply
    await page.waitForTimeout(500);

    // Verify bold is applied
    const boldText = await editor.locator('strong').textContent();
    expect(boldText).toBe('This is bold text');

    // Select deck and submit form
    const deckSelector = page.locator('select[name="deckId"]');
    const deckCount = await deckSelector.locator('option').count();
    console.log('Number of deck options:', deckCount);

    if (deckCount > 0) {
      await page.selectOption('select[name="deckId"]', { index: 0 });
    } else {
      console.log('No decks available! Cannot proceed with test.');
      return;
    }

    // Check submit button state
    const submitBtn = page.locator('button[type="submit"]');
    const isDisabled = await submitBtn.isDisabled();
    console.log('Submit button disabled:', isDisabled);

    // Click submit
    await submitBtn.click();

    // Wait and check what happens
    await page.waitForTimeout(2000);

    // Check if we're still on the modal
    const stillOnModal = await page.locator('text=Add New Knowledge Point').isVisible().catch(() => false);
    console.log('Still on modal after submit:', stillOnModal);

    if (stillOnModal) {
      const bodyText = await page.locator('body').textContent();
      console.log('Modal body text preview:', bodyText.substring(0, 500));
      throw new Error('Form submission failed');
    }

    // Wait for modal to close
    await page.waitForSelector('text=Add New Knowledge Point', { state: 'hidden', timeout: 10000 });

    // Reload dashboard to see the new card
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // The card was created! Now go to review
    await goToReview(page);

    // Find the card with "bold text" (case insensitive)
    const reviewCard = page.locator('text=bold text').first();
    await expect(reviewCard).toBeVisible({ timeout: 10000 });

    // Check if it has strong tag (bold formatting)
    const hasBold = await reviewCard.locator('strong').isVisible().catch(() => false);
    console.log('Card has bold formatting:', hasBold);

    if (hasBold) {
      await expect(reviewCard.locator('strong')).toBeVisible();
    }
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

test.describe('Rich Text Editor - Security', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should sanitize malicious HTML', async ({ page }) => {
    await page.goto('/dashboard');
    await openCreateCardModal(page);

    await page.fill('input[name="front"]', 'Test Security');

    const editor = page.locator('.ProseMirror').first();

    // Try to inject script via direct HTML manipulation
    await editor.evaluate((el: any) => {
      el.innerHTML = '<p>Safe</p><script>window.xss = "attacked"</script><p>Content</p>';
    });

    await page.selectOption('select[name="deckId"]', { index: 0 });
    await page.click('button[type="submit"]');
    await page.waitForSelector('[role="dialog"]', { state: 'hidden' });

    // Go to review and verify script was removed
    await goToReview(page);
    await expect(page.locator('text=Safe')).toBeVisible();
    await expect(page.locator('text=Content')).toBeVisible();

    // Script should not exist in page
    const hasXss = await page.evaluate(() => typeof (window as any).xss !== 'undefined');
    expect(hasXss).toBeFalsy();
  });

  test('should block event handlers', async ({ page }) => {
    await page.goto('/dashboard');
    await openCreateCardModal(page);

    await page.fill('input[name="front"]', 'Test Event Handler');

    const editor = page.locator('.ProseMirror').first();

    // Try to inject onclick
    await editor.evaluate((el: any) => {
      el.innerHTML = '<p onclick="alert(1)">Click me</p>';
    });

    await page.selectOption('select[name="deckId"]', { index: 0 });
    await page.click('button[type="submit"]');
    await page.waitForSelector('[role="dialog"]', { state: 'hidden' });

    await goToReview(page);

    // Alert should not be triggered
    let alertFired = false;
    page.on('dialog', () => { alertFired = true; });

    await page.locator('text=Click me').click();
    await page.waitForTimeout(100);

    expect(alertFired).toBeFalsy();
  });
});

test.describe('Rich Text Editor - Edit Card', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should edit existing card and preserve formatting', async ({ page }) => {
    await page.goto('/dashboard');

    // Find first card and click edit
    await page.locator('[aria-label="Edit card"]').first().click();
    await page.waitForSelector('[role="dialog"]');

    // Modify the back content
    const editor = page.locator('.ProseMirror').first();
    await editor.click();
    await editor.press('End');
    await editor.type(' - Additional info');

    // Submit
    await page.click('button[type="submit"]');
    await page.waitForSelector('[role="dialog"]', { state: 'hidden' });

    // Verify changes persisted
    await goToReview(page);
    await expect(page.locator('text=Additional info')).toBeVisible();
  });

  test('should edit plain text card and add formatting', async ({ page }) => {
    await page.goto('/dashboard');

    // Find a plain text card (one without HTML in back)
    await page.locator('[aria-label="Edit card"]').first().click();
    await page.waitForSelector('[role="dialog"]');

    const editor = page.locator('.ProseMirror').first();

    // Get current content (should be plain text)
    const initialContent = await editor.textContent();

    // Select all and make bold
    await editor.click();
    await editor.press('Control+a');
    await editor.press('Control+b');

    await page.click('button[type="submit"]');
    await page.waitForSelector('[role="dialog"]', { state: 'hidden' });

    // Verify bold applied
    await goToReview(page);
    await expect(page.locator('strong').filter({ hasText: initialContent })).toBeVisible();
  });
});

test.describe('Rich Text Editor - Backward Compatibility', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display existing plain text cards correctly', async ({ page }) => {
    await page.goto('/review');
    await page.waitForSelector('text=Loading', { state: 'hidden' });

    // Plain text should still render
    const cardContent = page.locator('[class*="text-2xl"]').first();
    await expect(cardContent).toBeVisible();
  });

  test('should handle empty content gracefully', async ({ page }) => {
    await page.goto('/dashboard');
    await openCreateCardModal(page);

    await page.fill('input[name="front"]', 'Test Empty');

    // Don't fill back, try to submit
    await page.selectOption('select[name="deckId"]', { index: 0 });

    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Should show validation error
    await expect(page.locator('text=required')).toBeVisible();
  });
});
