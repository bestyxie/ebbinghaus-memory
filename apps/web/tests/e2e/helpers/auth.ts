export const TEST_USER = {
  email: 'test@test.com',
  password: '1234567890',
};

export async function login(page: any) {
  // Go to dashboard first
  await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

  const currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    // Fill and submit login form using keyboard
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);

    // Submit using Enter key on password field
    await page.press('input[name="password"]', 'Enter');

    // Wait for navigation to dashboard
    await page.waitForURL('/dashboard', { timeout: 15000 });
    await page.waitForLoadState('domcontentloaded');
  }

  // Wait for page to be stable
  await page.waitForTimeout(1000);
}

export async function logout(page: any) {
  await page.goto('/dashboard');
  // Click logout button if exists
  const logoutBtn = page.locator('text=Logout').first();
  if (await logoutBtn.isVisible()) {
    await logoutBtn.click();
  }
}
