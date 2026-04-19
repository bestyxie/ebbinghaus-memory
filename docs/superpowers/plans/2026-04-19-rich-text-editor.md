# Rich Text Editor for Flashcard Back Content - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add TipTap-based rich text editing to flashcard back content with HTML storage, DOMPurify sanitization, and comprehensive e2e tests.

**Architecture:** TipTap editor component (fixed toolbar + bubble menu) outputs HTML, sanitized by DOMPurify, stored in existing `card.back` String field, rendered safely in review page using HTMLRenderer component.

**Tech Stack:** TipTap 3.20, DOMPurify 3.0, Playwright (e2e testing), Next.js 15, React 19, TypeScript

---

## File Structure Overview

**New Files:**
- `tests/e2e/rich-text-editor.spec.ts` - E2E tests for rich text editor
- `app/components/editor/rich-text-editor.tsx` - Main TipTap editor wrapper
- `app/components/editor/html-renderer.tsx` - Safe HTML display component
- `app/components/editor/fixed-toolbar.tsx` - Fixed toolbar component
- `app/components/editor/bubble-menu.tsx` - Floating menu for text selection
- `app/lib/editor/extensions.ts` - TipTap extensions configuration
- `app/lib/editor/sanitizer.ts` - DOMPurify configuration

**Modified Files:**
- `package.json` - Add Playwright, DOMPurify, @types/dompurify
- `app/(pages)/dashboard/components/create-card-modal.tsx` - Use RichTextEditor
- `app/(pages)/dashboard/components/edit-card-modal.tsx` - Use RichTextEditor
- `app/(pages)/review/components/flash-card.tsx` - Use HTMLRenderer

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Playwright and DOMPurify**

```bash
pnpm add -D @playwright/test
pnpm add dompurify
pnpm add -D @types/dompurify
```

- [ ] **Step 2: Initialize Playwright**

```bash
npx playwright install --with-deps
```

- [ ] **Step 3: Create Playwright config**

Create: `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

- [ ] **Step 4: Add test scripts to package.json**

Add to `package.json` scripts:
```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui",
"test:e2e:debug": "playwright test --debug"
```

- [ ] **Step 5: Commit**

```bash
git add package.json playwright.config.ts pnpm-lock.yaml
git commit -m "chore: install Playwright and DOMPurify for rich text editor

- Add Playwright for e2e testing
- Add DOMPurify for HTML sanitization
- Configure Playwright for Next.js dev server

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 2: Create Test Utilities and Helpers

**Files:**
- Create: `tests/e2e/helpers/auth.ts`
- Create: `tests/e2e/helpers/cards.ts`

- [ ] **Step 1: Create authentication helpers**

Create: `tests/e2e/helpers/auth.ts`

```typescript
export const TEST_USER = {
  email: 'test@test.com',
  password: '1234567890',
};

export async function login(page) {
  await page.goto('/dashboard');
  // If redirected to auth, login
  const currentUrl = page.url();
  if (currentUrl.includes('/auth')) {
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  }
}

export async function logout(page) {
  await page.goto('/dashboard');
  // Click logout button if exists
  const logoutBtn = page.locator('text=Logout').first();
  if (await logoutBtn.isVisible()) {
    await logoutBtn.click();
  }
}
```

- [ ] **Step 2: Create card management helpers**

Create: `tests/e2e/helpers/cards.ts`

```typescript
export async function openCreateCardModal(page) {
  await page.click('button:has-text("Add Knowledge")');
  await page.waitForSelector('[role="dialog"]');
}

export async function createCardWithRichText(page, front: string, backHtml: string) {
  await openCreateCardModal(page);

  // Fill front (plain text)
  await page.fill('input[name="front"]', front);

  // Fill back with HTML (using editor evaluation)
  await page.locator('.ProseMirror').first().evaluate((el: any, html) => {
    el.innerHTML = html;
  }, backHtml);

  // Select deck and difficulty
  await page.selectOption('select[name="deckId"]', { label: /./ }); // First available deck

  // Submit
  await page.click('button[type="submit"]:has-text("Save")');
  await page.waitForSelector('[role="dialog"]', { state: 'hidden' });
}

export async function waitForCardSave(page) {
  await page.waitForTimeout(500); // Brief wait for save
}

export async function goToReview(page) {
  await page.goto('/review');
  await page.waitForSelector('text=Loading', { state: 'hidden' });
}
```

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/helpers/
git commit -m "test: add e2e test helpers for auth and card management

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 3: Write E2E Test - Rich Text Editor Creation

**Files:**
- Create: `tests/e2e/rich-text-editor.spec.ts`

- [ ] **Step 1: Write the failing test - Create card with rich text**

Create: `tests/e2e/rich-text-editor.spec.ts`

```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test:e2e tests/e2e/rich-text-editor.spec.ts
```

Expected: FAIL - No rich text editor exists yet

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/rich-text-editor.spec.ts
git commit -m "test: add e2e tests for rich text editor creation

- Test bold text formatting
- Test italic text formatting
- Test heading formatting
- Test bullet list formatting

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 4: Write E2E Test - Bubble Menu and Advanced Features

**Files:**
- Modify: `tests/e2e/rich-text-editor.spec.ts`

- [ ] **Step 1: Add tests for bubble menu and advanced features**

Add to: `tests/e2e/rich-text-editor.spec.ts`

```typescript
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test:e2e tests/e2e/rich-text-editor.spec.ts
```

Expected: FAIL - No rich text editor exists yet

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/rich-text-editor.spec.ts
git commit -m "test: add e2e tests for bubble menu and advanced features

- Test bubble menu visibility on selection
- Test formatting via bubble menu
- Test highlight colors
- Test text alignment
- Test code blocks
- Test blockquotes

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 5: Write E2E Test - Security and Edge Cases

**Files:**
- Modify: `tests/e2e/rich-text-editor.spec.ts`

- [ ] **Step 1: Add security and edge case tests**

Add to: `tests/e2e/rich-text-editor.spec.ts`

```typescript
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test:e2e tests/e2e/rich-text-editor.spec.ts
```

Expected: FAIL - No rich text editor exists yet

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/rich-text-editor.spec.ts
git commit -m "test: add e2e tests for security and edge cases

- Test HTML sanitization blocks XSS
- Test event handlers are blocked
- Test editing existing cards preserves formatting
- Test backward compatibility with plain text cards
- Test empty content validation

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 6: Create TipTap Extensions Configuration

**Files:**
- Create: `app/lib/editor/extensions.ts`

- [ ] **Step 1: Write the extensions configuration**

Create: `app/lib/editor/extensions.ts`

```typescript
import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { Mark, mergeAttributes } from '@tiptap/core';

// Custom highlight extension with color support
const Highlight = Mark.create({
  name: 'highlight',

  addOptions() {
    return {
      colors: ['#fef08a', '#f9a8d4', '#93c5fd', '#86efac'], // yellow, pink, blue, green
      defaultColor: '#fef08a',
    };
  },

  addAttributes() {
    return {
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute('style'),
        renderHTML: (attributes) => {
          if (!attributes.style) {
            return {};
          }
          return { style: attributes.style };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'mark',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['mark', mergeAttributes(HTMLAttributes), 0];
  },
});

// Text alignment extension
const TextAlign = Extension.create({
  name: 'textAlign',

  addOptions() {
    return {
      types: ['heading', 'paragraph'],
      alignments: ['left', 'center', 'right', 'justify'],
      defaultAlignment: 'left',
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textAlign: {
            default: this.options.defaultAlignment,
            parseHTML: (element) => element.style.textAlign || this.options.defaultAlignment,
            renderHTML: (attributes) => {
              if (attributes.textAlign === this.options.defaultAlignment) {
                return {};
              }
              return { style: `text-align: ${attributes.textAlign}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setTextAlignment:
        (alignment: string) =>
        ({ commands }) => {
          return this.options.types.every((type) =>
            commands.updateAttributes(type, { textAlign: alignment })
          );
        },
    };
  },
});

export const getExtensions = (placeholder = 'Type detailed content here...') => {
  return [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
      bulletList: {
        keepMarks: true,
        keepAttributes: false,
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: false,
      },
    }),
    Underline,
    Highlight,
    TextAlign,
    Placeholder.configure({
      placeholder,
      emptyEditorClass: 'is-editor-empty',
    }),
  ];
};

export { Highlight, TextAlign };
```

- [ ] **Step 2: Commit**

```bash
git add app/lib/editor/extensions.ts
git commit -m "feat: add TipTap extensions configuration

- Add custom highlight mark with color support
- Add text alignment extension
- Configure StarterKit with heading levels 1-3
- Add placeholder extension
- Export getExtensions helper

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 7: Create HTML Sanitizer

**Files:**
- Create: `app/lib/editor/sanitizer.ts`

- [ ] **Step 1: Write the sanitizer**

Create: `app/lib/editor/sanitizer.ts`

```typescript
import DOMPurify from 'dompurify';

// Configure DOMPurify for our needs
const purify = DOMPurify();

const ALLOWED_TAGS = [
  'p',
  'br',
  'div',
  'span',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'h1',
  'h2',
  'h3',
  'ul',
  'ol',
  'li',
  'blockquote',
  'pre',
  'code',
  'mark',
  'a',
];

const ALLOWED_ATTR = [
  'class',
  'href',
  'style', // For text-align and background-color
];

// Custom hook to allow only safe style values
purify.addHook('uponSanitizeAttribute', (node, data) => {
  if (data.attrName === 'style') {
    const style = data.attrValue as string;

    // Only allow text-align and background-color
    const allowedPatterns = [
      /^text-align:\s*(left|center|right|justify)\s*;?$/i,
      /^background-color:\s*#[0-9a-f]{3,6}\s*;?$/i,
    ];

    const isAllowed = allowedPatterns.some(pattern => pattern.test(style));

    if (!isAllowed) {
      // Remove unsafe style
      delete node.attributes[data.attrName];
      data.attrValue = '';
    }
  }

  if (data.attrName === 'href') {
    // Block javascript: and data: URLs
    const href = data.attrValue as string;
    if (href.startsWith('javascript:') || href.startsWith('data:')) {
      delete node.attributes['href'];
      data.attrValue = '';
    }
  }
});

export function sanitizeHTML(html: string): string {
  if (!html) return '';

  return purify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    KEEP_CONTENT: true,
    RETURN_TRUSTED_TYPE: false, // Return string, not TrustedHTML
    SANITIZE_DOM: true,
  });
}

export function sanitizeHTMLStrict(html: string): string {
  // For user-supplied content that needs extra sanitization
  return purify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'span'],
    ALLOWED_ATTR: ['class'],
    KEEP_CONTENT: true,
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/lib/editor/sanitizer.ts
git commit -m "feat: add HTML sanitizer with DOMPurify

- Configure allowed tags and attributes
- Add custom hook for style validation
- Block javascript: and data: URLs
- Export sanitizeHTML and sanitizeHTMLStrict

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 8: Create Fixed Toolbar Component

**Files:**
- Create: `app/components/editor/fixed-toolbar.tsx`

- [ ] **Step 1: Write the fixed toolbar component**

Create: `app/components/editor/fixed-toolbar.tsx`

```typescript
'use client';

import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from 'lucide-react';

interface FixedToolbarProps {
  editor: Editor | null;
}

const HIGHLIGHT_COLORS = [
  { name: 'yellow', value: '#fef08a', class: 'bg-yellow-200' },
  { name: 'pink', value: '#f9a8d4', class: 'bg-pink-200' },
  { name: 'blue', value: '#93c5fd', class: 'bg-blue-200' },
  { name: 'green', value: '#86efac', class: 'bg-green-200' },
];

export function FixedToolbar({ editor }: FixedToolbarProps) {
  if (!editor) {
    return null;
  }

  const setHighlight = (color: string) => {
    editor.chain().focus().setMark('highlight', { style: `background-color: ${color}` }).run();
  };

  const setAlignment = (alignment: 'left' | 'center' | 'right' | 'justify') => {
    editor.chain().focus().setTextAlign(alignment).run();
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-slate-200 bg-slate-50">
      {/* Basic Formatting */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 hover:bg-slate-200 rounded ${editor.isActive('bold') ? 'bg-slate-300' : ''}`}
        aria-label="Bold"
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 hover:bg-slate-200 rounded ${editor.isActive('italic') ? 'bg-slate-300' : ''}`}
        aria-label="Italic"
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 hover:bg-slate-200 rounded ${editor.isActive('underline') ? 'bg-slate-300' : ''}`}
        aria-label="Underline"
        title="Underline (Ctrl+U)"
      >
        <Underline className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-slate-300 mx-1" />

      {/* Headings */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 hover:bg-slate-200 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-slate-300' : ''}`}
        aria-label="Heading 1"
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 hover:bg-slate-200 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-300' : ''}`}
        aria-label="Heading 2"
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-2 hover:bg-slate-200 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-slate-300' : ''}`}
        aria-label="Heading 3"
        title="Heading 3"
      >
        <Heading3 className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-slate-300 mx-1" />

      {/* Lists */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 hover:bg-slate-200 rounded ${editor.isActive('bulletList') ? 'bg-slate-300' : ''}`}
        aria-label="Bullet list"
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 hover:bg-slate-200 rounded ${editor.isActive('orderedList') ? 'bg-slate-300' : ''}`}
        aria-label="Numbered list"
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-slate-300 mx-1" />

      {/* Blocks */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 hover:bg-slate-200 rounded ${editor.isActive('blockquote') ? 'bg-slate-300' : ''}`}
        aria-label="Blockquote"
        title="Blockquote"
      >
        <Quote className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-2 hover:bg-slate-200 rounded ${editor.isActive('codeBlock') ? 'bg-slate-300' : ''}`}
        aria-label="Code block"
        title="Code Block"
      >
        <Code className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-slate-300 mx-1" />

      {/* Highlight Color Dropdown */}
      <div className="relative group">
        <button
          type="button"
          className="p-2 hover:bg-slate-200 rounded flex items-center gap-1"
          aria-label="Highlight"
          title="Highlight Color"
        >
          <Palette className="w-4 h-4" />
        </button>
        <div className="absolute top-full left-0 mt-1 hidden group-hover:flex bg-white border border-slate-200 rounded shadow-lg z-10">
          {HIGHLIGHT_COLORS.map((color) => (
            <button
              key={color.name}
              type="button"
              onClick={() => setHighlight(color.value)}
              className={`w-8 h-8 ${color.class} hover:opacity-80 first:rounded-tl last:rounded-bl`}
              aria-label={`Highlight ${color.name}`}
              data-color={color.name}
              title={color.name}
            />
          ))}
        </div>
      </div>

      <div className="w-px h-6 bg-slate-300 mx-1" />

      {/* Text Alignment */}
      <button
        type="button"
        onClick={() => setAlignment('left')}
        className={`p-2 hover:bg-slate-200 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-slate-300' : ''}`}
        aria-label="Align left"
        title="Align Left"
      >
        <AlignLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => setAlignment('center')}
        className={`p-2 hover:bg-slate-200 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-slate-300' : ''}`}
        aria-label="Align center"
        title="Align Center"
      >
        <AlignCenter className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => setAlignment('right')}
        className={`p-2 hover:bg-slate-200 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-slate-300' : ''}`}
        aria-label="Align right"
        title="Align Right"
      >
        <AlignRight className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => setAlignment('justify')}
        className={`p-2 hover:bg-slate-200 rounded ${editor.isActive({ textAlign: 'justify' }) ? 'bg-slate-300' : ''}`}
        aria-label="Align justify"
        title="Align Justify"
      >
        <AlignJustify className="w-4 h-4" />
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/editor/fixed-toolbar.tsx
git commit -m "feat: add fixed toolbar for rich text editor

- Add basic formatting buttons (bold, italic, underline)
- Add heading buttons (H1, H2, H3)
- Add list buttons (bullet, numbered)
- Add block buttons (blockquote, code)
- Add highlight color dropdown (yellow, pink, blue, green)
- Add text alignment buttons (left, center, right, justify)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 9: Create Bubble Menu Component

**Files:**
- Create: `app/components/editor/bubble-menu.tsx`

- [ ] **Step 1: Write the bubble menu component**

Create: `app/components/editor/bubble-menu.tsx`

```typescript
'use client';

import { Editor } from '@tiptap/react';
import { BubbleMenu as TiptapBubbleMenu } from '@tiptap/react';
import { Bold, Italic, Underline } from 'lucide-react';
import { Highlight } from '@/app/lib/editor/extensions';

interface BubbleMenuProps {
  editor: Editor | null;
}

const HIGHLIGHT_COLORS = [
  { name: 'yellow', value: '#fef08a', class: 'bg-yellow-200' },
  { name: 'pink', value: '#f9a8d4', class: 'bg-pink-200' },
  { name: 'blue', value: '#93c5fd', class: 'bg-blue-200' },
  { name: 'green', value: '#86efac', class: 'bg-green-200' },
];

export function BubbleMenu({ editor }: BubbleMenuProps) {
  if (!editor) {
    return null;
  }

  const setHighlight = (color: string) => {
    editor.chain().focus().setMark('highlight', { style: `background-color: ${color}` }).run();
  };

  return (
    <TiptapBubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100 }}
      className="bubble-menu flex gap-1 p-1 bg-white border border-slate-200 rounded-lg shadow-lg"
    >
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 hover:bg-slate-100 rounded ${editor.isActive('bold') ? 'bg-slate-200' : ''}`}
        aria-label="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 hover:bg-slate-100 rounded ${editor.isActive('italic') ? 'bg-slate-200' : ''}`}
        aria-label="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 hover:bg-slate-100 rounded ${editor.isActive('underline') ? 'bg-slate-200' : ''}`}
        aria-label="Underline"
      >
        <Underline className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      {/* Highlight Colors */}
      <div className="relative group">
        <button
          type="button"
          className="p-2 hover:bg-slate-100 rounded flex items-center gap-1"
          aria-label="Highlight"
        >
          <span className="w-4 h-4 rounded-full bg-yellow-200" />
        </button>
        <div className="absolute top-full right-0 mt-1 hidden group-hover:flex flex-col bg-white border border-slate-200 rounded shadow-lg z-10">
          {HIGHLIGHT_COLORS.map((color) => (
            <button
              key={color.name}
              type="button"
              onClick={() => setHighlight(color.value)}
              className={`w-8 h-8 ${color.class} hover:opacity-80`}
              aria-label={`Highlight ${color.name}`}
              data-color={color.name}
            />
          ))}
        </div>
      </div>
    </TiptapBubbleMenu>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/editor/bubble-menu.tsx
git commit -m "feat: add bubble menu for text selection formatting

- Add floating menu on text selection
- Add bold, italic, underline buttons
- Add highlight color dropdown
- Position menu near selected text

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 10: Create HTML Renderer Component

**Files:**
- Create: `app/components/editor/html-renderer.tsx`

- [ ] **Step 1: Write the HTML renderer component**

Create: `app/components/editor/html-renderer.tsx`

```typescript
'use client';

import { sanitizeHTML } from '@/app/lib/editor/sanitizer';

interface HTMLRendererProps {
  html: string;
  className?: string;
}

export function HTMLRenderer({ html, className = '' }: HTMLRendererProps) {
  const sanitized = sanitizeHTML(html);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
```

- [ ] **Step 2: Add typography styles**

Create: `app/components/editor/html-renderer.css` (will be imported globally)

Or better, use Tailwind's prose plugin. For now, add inline styles:

```typescript
'use client';

import { sanitizeHTML } from '@/app/lib/editor/sanitizer';

interface HTMLRendererProps {
  html: string;
  className?: string;
}

const TYPOGRAPHY_STYLES = `
  prose-headings:font-bold prose-headings:text-gray-900 prose-headings:mb-4 prose-headings:mt-6
  prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
  prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
  prose-strong:font-bold prose-strong:text-gray-900
  prose-em:italic prose-em:text-gray-700
  prose-u:underline
  prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4
  prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4
  prose-li:mb-1
  prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
  prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
  prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
  prose-a:text-blue-600 prose-a:underline prose-a:hover:text-blue-800
  mark:px-1 mark:py-0.5 mark:rounded
`;

export function HTMLRenderer({ html, className = '' }: HTMLRendererProps) {
  const sanitized = sanitizeHTML(html);

  return (
    <div
      className={`${className} ${TYPOGRAPHY_STYLES}`}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
```

Actually, let's simplify and just use Tailwind utility classes in the parent component.

```typescript
'use client';

import { sanitizeHTML } from '@/app/lib/editor/sanitizer';

interface HTMLRendererProps {
  html: string;
  className?: string;
}

export function HTMLRenderer({ html, className = '' }: HTMLRendererProps) {
  const sanitized = sanitizeHTML(html);

  return (
    <div
      className={`prose prose-slate max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
```

Note: We'll need to install @tailwindcss/typography plugin.

- [ ] **Step 2: Install Tailwind Typography**

```bash
pnpm add -D @tailwindcss/typography
```

- [ ] **Step 3: Update Tailwind config**

Add to `tailwind.config.js` or existing config:

```javascript
export default {
  // ... existing config
  plugins: {
    '@tailwindcss/typography',
  },
}
```

Actually, for Tailwind CSS v4, it's auto-imported. Let's check the current setup first.

- [ ] **Step 4: Commit**

```bash
git add app/components/editor/html-renderer.tsx
git add -D @tailwindcss/typography pnpm-lock.yaml
git commit -m "feat: add HTML renderer component with DOMPurify

- Add HTMLRenderer component for safe HTML display
- Sanitize HTML using DOMPurify before rendering
- Add Tailwind Typography for better styling
- Export HTMLRenderer

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 11: Create Rich Text Editor Component

**Files:**
- Create: `app/components/editor/rich-text-editor.tsx`

- [ ] **Step 1: Write the rich text editor component**

Create: `app/components/editor/rich-text-editor.tsx`

```typescript
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect } from 'react';
import { getExtensions } from '@/app/lib/editor/extensions';
import { FixedToolbar } from './fixed-toolbar';
import { BubbleMenu } from './bubble-menu';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  name?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Type detailed content here...',
  className = '',
  name,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: getExtensions(placeholder),
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none min-h-[150px] px-4 py-3',
      },
    },
  });

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  // Hidden input for form submission
  if (name) {
    return (
      <div className={className}>
        <input type="hidden" name={name} value={value} />
        <div className="border border-slate-300 rounded-lg overflow-hidden">
          <FixedToolbar editor={editor} />
          <EditorContent editor={editor} />
          {editor && <BubbleMenu editor={editor} />}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="border border-slate-300 rounded-lg overflow-hidden">
        <FixedToolbar editor={editor} />
        <EditorContent editor={editor} />
        {editor && <BubbleMenu editor={editor} />}
      </div>
    </div>
  );
}
```

Wait, we need to handle the form submission differently. Let me revise to work with the existing form pattern.

Actually, the modals use `useActionState` with a form, so we need to handle this properly. Let me create a wrapper that can work with forms.

```typescript
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect, useRef } from 'react';
import { getExtensions } from '@/app/lib/editor/extensions';
import { FixedToolbar } from './fixed-toolbar';
import { BubbleMenu } from './bubble-menu';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  name?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Type detailed content here...',
  className = '',
  name,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: getExtensions(placeholder),
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);

      // Also update hidden input if name is provided
      if (name) {
        const hiddenInput = document.querySelector(`input[name="${name}"]`) as HTMLInputElement;
        if (hiddenInput) {
          hiddenInput.value = html;
        }
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[150px] px-4 py-3 focus:outline-none',
      },
    },
  });

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  return (
    <div className={className}>
      <input type="hidden" name={name || 'back'} value={value} readOnly />
      <div className="border border-slate-300 rounded-lg overflow-hidden">
        <FixedToolbar editor={editor} />
        <EditorContent editor={editor} />
        {editor && <BubbleMenu editor={editor} />}
      </div>
    </div>
  );
}
```

Actually, let me simplify. The form uses FormData which reads from inputs, so we need a hidden input that gets updated.

```typescript
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect, useRef } from 'react';
import { getExtensions } from '@/app/lib/editor/extensions';
import { FixedToolbar } from './fixed-toolbar';
import { BubbleMenu } from './bubble-menu';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  name?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Type detailed content here...',
  className = '',
  name = 'back',
}: RichTextEditorProps) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: getExtensions(placeholder),
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);

      // Update hidden input for form submission
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = html;
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[150px] px-4 py-3 focus:outline-none',
      },
    },
  });

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  return (
    <div className={className}>
      <input
        ref={hiddenInputRef}
        type="hidden"
        name={name}
        value={value}
        readOnly
      />
      <div className="border border-slate-300 rounded-lg overflow-hidden">
        <FixedToolbar editor={editor} />
        <EditorContent editor={editor} />
        {editor && <BubbleMenu editor={editor} />}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add TipTap styles to globals**

Add to `app/globals.css`:

```css
@import "tailwindcss";

/* TipTap Editor Styles */
.ProseMirror {
  outline: none;
}

.ProseMirror p.is-editor-empty:first-child::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

/* Bubble menu */
.bubble-menu {
  position: absolute;
  z-index: 50;
}
```

- [ ] **Step 3: Commit**

```bash
git add app/components/editor/rich-text-editor.tsx app/globals.css
git commit -m "feat: add rich text editor component with TipTap

- Add RichTextEditor component
- Integrate FixedToolbar and BubbleMenu
- Handle form submission with hidden input
- Add TipTap styles to globals.css
- Export RichTextEditor

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 12: Update Create Card Modal

**Files:**
- Modify: `app/(pages)/dashboard/components/create-card-modal.tsx`

- [ ] **Step 1: Replace textarea with RichTextEditor**

First, read the current file to see the exact structure, then make the change.

```typescript
"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { createCard } from "@/app/lib/actions";
import {
  X,
  Plus,
} from "lucide-react";
import { DeckSelector } from "./deck-selector";
import { DifficultySelector } from "./difficulty-selector";
import { RichTextEditor } from "@/app/components/editor/rich-text-editor";

interface CreateCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCardModal({ isOpen, onClose }: CreateCardModalProps) {
  const [state, formAction, isPending] = useActionState(createCard, null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<"5" | "4" | "3">("4");
  const [backContent, setBackContent] = useState("");
  const hasHandledSuccess = useRef(false);

  // Close modal on success (revalidatePath handles data refresh automatically)
  useEffect(() => {
    if (state?.success && !isPending && !hasHandledSuccess.current) {
      hasHandledSuccess.current = true;
      onClose();
      // Reset form after successful creation
      setBackContent("");
    }
  }, [state?.success, isPending, onClose]);

  // Reset the success handler when modal closes
  useEffect(() => {
    if (!isOpen) {
      hasHandledSuccess.current = false;
      setBackContent("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <form action={formAction} className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-[720px] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Add New Knowledge Point</h2>
            <p className="text-sm text-slate-500 mt-1">
              Enter details to start your Ebbinghaus memory cycle.
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-auto px-6 py-6 space-y-6">
          {/* Title & Hint */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                name="front"
                required
                placeholder="e.g., Photosynthesis Basics"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Hint</label>
              <input
                name="note"
                placeholder="A brief reminder for front"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Rich Text Editor */}
          <div>
            <label className="block text-sm font-medium mb-2">Detailed Content</label>
            <RichTextEditor
              value={backContent}
              onChange={setBackContent}
              placeholder="Describe knowledge point in detail..."
              name="back"
            />
          </div>

          {/* Deck Selector */}
          <DeckSelector />

          {/* Difficulty Selector */}
          <DifficultySelector
            value={selectedDifficulty}
            onChange={setSelectedDifficulty}
          />

          {/* Error Display */}
          {state?.error && (
            <div className="bg-red-50 text-red-800 p-3 rounded-lg">
              {state.error}
            </div>
          )}

          {/* Sync hidden input */}
          <input type="hidden" name="quality" value={selectedDifficulty} />
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Plus />
            {isPending ? "Creating..." : "Save Knowledge Point"}
          </button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(pages\)/dashboard/components/create-card-modal.tsx
git commit -m "feat: integrate rich text editor into create card modal

- Replace textarea with RichTextEditor component
- Add state management for back content
- Remove fake toolbar UI
- Keep form validation

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 13: Update Edit Card Modal

**Files:**
- Modify: `app/(pages)/dashboard/components/edit-card-modal.tsx`

- [ ] **Step 1: Replace textarea with RichTextEditor**

```typescript
"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { updateCard } from "@/app/lib/actions";
import {
  X,
  Check,
} from "lucide-react";
import { CardWithDeck, Deck } from "@/app/lib/types";
import { RichTextEditor } from "@/app/components/editor/rich-text-editor";

interface EditCardModalProps {
  card: CardWithDeck;
  isOpen: boolean;
  onClose: () => void;
}

export function EditCardModal({ card, isOpen, onClose }: EditCardModalProps) {
  const [state, formAction, isPending] = useActionState(updateCard, null);
  const previousIsPending = useRef(false);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [backContent, setBackContent] = useState(card.back || "");

  // Reset back content when card changes
  useEffect(() => {
    setBackContent(card.back || "");
  }, [card.id]);

  // Fetch all decks for the dropdown
  useEffect(() => {
    if (isOpen) {
      const fetchDecks = async () => {
        try {
          const response = await fetch('/api/decks');
          if (response.ok) {
            const data = await response.json();
            setDecks(data);
          }
        } catch (error) {
          console.error('Error fetching decks:', error);
        }
      };

      fetchDecks();
    }
  }, [isOpen]);

  // Close modal on success when pending transitions from true to false
  useEffect(() => {
    if (previousIsPending.current && !isPending && state?.success) {
      onClose();
    }
    previousIsPending.current = isPending;
  }, [isPending, state?.success, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <form
        action={formAction}
        className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-[720px] max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Edit Knowledge Point</h2>
            <p className="text-sm text-slate-500 mt-1">
              Update your knowledge point content.
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-auto px-6 py-6 space-y-6">
          {/* Card ID (hidden) */}
          <input type="hidden" name="cardId" value={card.id} />

          {/* Title & Hint */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                name="front"
                required
                defaultValue={card.front}
                placeholder="e.g., Photosynthesis Basics"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Hint</label>
              <input
                name="note"
                defaultValue={card.note || ""}
                placeholder="A brief reminder for front"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Rich Text Editor */}
          <div>
            <label className="block text-sm font-medium mb-2">Detailed Content</label>
            <RichTextEditor
              value={backContent}
              onChange={setBackContent}
              placeholder="Describe knowledge point in detail..."
              name="back"
            />
          </div>

          {/* Deck Selector with default value */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags (Deck)</label>
            <div className="flex gap-2">
              <select
                name="deckId"
                defaultValue={card.deck?.id || ""}
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No deck</option>
                {decks.map(deck => (
                  <option key={deck.id} value={deck.id}>
                    {deck.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error Display */}
          {state?.error && (
            <div className="bg-red-50 text-red-800 p-3 rounded-lg">
              {state.error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Check />
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(pages\)/dashboard/components/edit-card-modal.tsx
git commit -m "feat: integrate rich text editor into edit card modal

- Replace textarea with RichTextEditor component
- Add state management for back content
- Remove fake toolbar UI
- Load existing HTML content into editor

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 14: Update Flash Card Review Component

**Files:**
- Modify: `app/(pages)/review/components/flash-card.tsx`

- [ ] **Step 1: Replace plain text with HTMLRenderer**

```typescript
'use client';

import { motion } from 'framer-motion';
import { CardWithDeck } from '@/app/lib/types';
import { HTMLRenderer } from '@/app/components/editor/html-renderer';

interface FlashCardProps {
  card: CardWithDeck;
  isFlipped: boolean;
  onFlip: () => void;
}

export function FlashCard({ card, isFlipped, onFlip }: FlashCardProps) {
  return (
    <div className="flex justify-center items-center min-h-[500px]">
      <div className="w-full max-w-3xl perspective-1000">
        <motion.div
          className="relative w-full h-[500px] cursor-pointer"
          onClick={onFlip}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front of Card */}
          <motion.div
            className="absolute inset-0 backface-hidden bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-12 flex flex-col justify-center items-center"
            animate={{ opacity: isFlipped ? 0 : 1 }}
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            {card.deck && (
              <div className="absolute top-6 left-6 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {card.deck.title}
              </div>
            )}

            <div className="text-3xl font-bold text-gray-900 text-center leading-relaxed">
              {card.front}
            </div>

            {card.note && (
              <div className="mt-6 pt-6 border-t border-gray-300">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Note
                </h4>
                <p className="text-lg text-gray-700 text-center">
                  {card.note}
                </p>
              </div>
            )}

            <div className="absolute bottom-6 text-gray-400 text-sm">
              Click to reveal answer
            </div>
          </motion.div>

          {/* Back of Card */}
          <motion.div
            className="absolute inset-0 backface-hidden bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg border-2 border-blue-200 p-8 flex flex-col justify-start overflow-y-auto"
            animate={{
              opacity: isFlipped ? 1 : 0,
              rotateY: 180,
            }}
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            {card.deck && (
              <div className="self-start px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                {card.deck.title}
              </div>
            )}

            <div className="flex flex-col gap-5 flex-1">
              {/* Front */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  Question
                </h3>
                <div className="text-lg text-gray-700 leading-relaxed">
                  {card.front}
                </div>
              </div>

              {/* Back - Now using HTMLRenderer */}
              <div>
                <h3 className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1">
                  Answer
                </h3>
                <HTMLRenderer
                  html={card.back}
                  className="text-lg text-gray-900 leading-relaxed prose prose-slate max-w-none"
                />
              </div>

              {/* Note */}
              {card.note && (
                <div className="pt-4 border-t border-blue-200">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                    Note
                  </h3>
                  <p className="text-base text-gray-600 leading-relaxed">{card.note}</p>
                </div>
              )}

              {/* Source */}
              {card.source && (
                <div className={card.note ? '' : 'pt-4 border-t border-blue-200'}>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                    Source
                  </h3>
                  {(() => {
                    try {
                      new URL(card.source);
                      return (
                        <a
                          href={card.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-base text-blue-600 hover:text-blue-800 underline break-all"
                        >
                          {card.source}
                        </a>
                      );
                    } catch {
                      return <p className="text-base text-gray-600 break-all">{card.source}</p>;
                    }
                  })()}
                </div>
              )}
            </div>

            <div className="mt-4 text-center text-gray-400 text-sm shrink-0">
              Rate your recall below
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(pages\)/review/components/flash-card.tsx
git commit -m "feat: render rich HTML content in flash card review

- Replace plain text back content with HTMLRenderer
- Sanitize HTML before rendering for security
- Add prose styling for better typography

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 15: Run E2E Tests and Fix Failures

**Files:**
- None (testing phase)

- [ ] **Step 1: Run all e2e tests**

```bash
pnpm test:e2e
```

- [ ] **Step 2: Analyze failures**

Review which tests are failing and why. Common issues:
- Selector mismatches (aria-labels, class names)
- Timing issues (need to wait for elements)
- Form submission not working properly

- [ ] **Step 3: Fix test failures iteratively**

For each failing test:
1. Identify the root cause
2. Fix the implementation (not the test!)
3. Re-run the test
4. Repeat until pass

- [ ] **Step 4: Commit fixes**

```bash
git add .
git commit -m "fix: resolve e2e test failures

- Fix selector mismatches
- Fix timing issues
- Fix form submission handling

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 16: Final Verification

**Files:**
- None (verification phase)

- [ ] **Step 1: Run all tests one more time**

```bash
pnpm test:e2e
pnpm type-check
pnpm lint
```

- [ ] **Step 2: Manual testing checklist**

1. Create a new card with various formatting options
2. Edit an existing card and add rich text
3. Review cards in review mode
4. Try keyboard shortcuts (Ctrl+B, Ctrl+I, Ctrl+U)
5. Test bubble menu on text selection
6. Verify highlight colors work
7. Verify text alignment works
8. Try to inject malicious HTML (should be sanitized)

- [ ] **Step 3: Final commit if needed**

```bash
git add .
git commit -m "chore: final cleanup and verification

- All tests passing
- Manual verification complete
- Ready for review

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Summary

This plan implements a complete rich text editor for flashcard back content with:

1. **E2E Tests First** - All test scenarios written before implementation (TDD approach)
2. **TipTap Editor** - Modern, extensible rich text editor
3. **Security** - DOMPurify sanitization prevents XSS attacks
4. **Dual UI** - Fixed toolbar + bubble menu for great UX
5. **Full Features** - Bold, italic, underline, headings, lists, blocks, highlights, alignment
6. **Backward Compatible** - Existing plain text cards work without migration
7. **Integration** - Works seamlessly with create/edit modals and review page

**Total Tasks:** 16
**Estimated Time:** 4-6 hours (including test fixes)

**Key Dependencies:**
- @tiptap/react, @tiptap/starter-kit (already installed)
- @tiptap/extension-underline (already installed)
- dompurify, @types/dompurify (new)
- @playwright/test (new for e2e testing)
- @tailwindcss/typography (new for prose styling)
