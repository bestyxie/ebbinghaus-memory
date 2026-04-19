export const TEST_USER = {
  email: 'test@test.com',
  password: '1234567890',
};

export async function login(page: any) {
  await page.goto('/dashboard', { waitUntil: 'networkidle' });
  // If redirected to auth, login
  const currentUrl = page.url();
  if (currentUrl.includes('/auth')) {
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  }
  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle');
}

export async function logout(page: any) {
  await page.goto('/dashboard');
  // Click logout button if exists
  const logoutBtn = page.locator('text=Logout').first();
  if (await logoutBtn.isVisible()) {
    await logoutBtn.click();
  }
}
