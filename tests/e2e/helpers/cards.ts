export async function openCreateCardModal(page: any) {
  // Wait for the page to be ready
  await page.waitForLoadState('networkidle');

  // Click the "New Point" button to open dropdown
  await page.click('button:has-text("New Point")');

  // Wait for dropdown to appear and click the first "New Point" item
  await page.waitForSelector('[role="menuitem"]', { timeout: 5000 });
  await page.click('[role="menuitem"]:has-text("New Point")');

  // Wait for modal to appear
  await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
}

export async function createCardWithRichText(page: any, front: string, backHtml: string) {
  await openCreateCardModal(page);

  // Fill front (plain text)
  await page.fill('input[name="front"]', front);

  // Fill back with HTML (using editor evaluation)
  await page.locator('.ProseMirror').first().evaluate((el: any, html: string) => {
    el.innerHTML = html;
  }, backHtml);

  // Select deck and difficulty
  await page.selectOption('select[name="deckId"]', { label: /./ }); // First available deck

  // Submit
  await page.click('button[type="submit"]:has-text("Save")');
  await page.waitForSelector('[role="dialog"]', { state: 'hidden' });
}

export async function waitForCardSave(page: any) {
  await page.waitForTimeout(500); // Brief wait for save
}

export async function goToReview(page: any) {
  await page.goto('/review');
  await page.waitForSelector('text=Loading', { state: 'hidden' });
}
