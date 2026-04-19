import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Go to login page
  await page.goto('/login', { waitUntil: 'networkidle' });
});

test('setup: ensure test user exists', async ({ page }) => {
  // First try to login with existing credentials
  await page.fill('input[name="email"]', 'test@test.com');
  await page.fill('input[name="password"]', '1234567890');

  // Try to submit form using Enter key
  await page.press('input[name="password"]', 'Enter');

  // Wait for navigation or response
  await page.waitForTimeout(5000);

  console.log('After login attempt, URL:', page.url());

  // Check if we're on dashboard (login successful)
  if (page.url().includes('/dashboard')) {
    console.log('Test user already exists, logged in successfully');
    return;
  }

  // If still on login page, try to register
  console.log('Login failed, trying to register user...');

  // Click register button
  await page.click('text=立即注册');

  // Wait for name field to appear
  await page.waitForSelector('input[name="name"]', { timeout: 5000 });

  // Fill registration form
  await page.fill('input[name="email"]', 'test@test.com');
  await page.fill('input[name="password"]', '1234567890');
  await page.fill('input[name="name"]', 'Test User');

  // Submit using Enter key
  await page.press('input[name="name"]', 'Enter');

  // Wait for response
  await page.waitForTimeout(5000);
  console.log('After registration, URL:', page.url());

  // Check if we're on dashboard now
  if (page.url().includes('/dashboard')) {
    console.log('User registered successfully');
    return;
  }

  // If still not on dashboard, something is wrong
  throw new Error(`Failed to login/register. Final URL: ${page.url()}`);
});
