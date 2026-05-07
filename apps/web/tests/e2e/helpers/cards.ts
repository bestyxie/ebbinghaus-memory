export async function openCreateCardModal(page: any) {
  // Wait for page to be ready
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500); // Small buffer for React to render

  // Find the button and click it using JavaScript to ensure the event fires
  console.log('Clicking "New Point" button using JavaScript...');
  await page.evaluate(() => {
    const button = document.querySelector('button')?.textContent?.includes('New Point')
      ? Array.from(document.querySelectorAll('button')).find(btn => btn.textContent?.includes('New Point'))
      : null;
    if (button) {
      (button as HTMLElement).click();
    }
  });
  console.log('✅ Clicked "New Point" button');

  // Wait a bit for dropdown animation
  await page.waitForTimeout(1000);

  // Wait for dropdown to appear - try multiple selectors
  console.log('Waiting for dropdown...');
  const dropdownSelectors = [
    'div[class*="shadow-xl"]',
    'div.absolute.top-full',
    '.shadow-xl',
  ];

  let dropdownVisible = false;
  for (const selector of dropdownSelectors) {
    try {
      await page.waitForSelector(selector, { state: 'visible', timeout: 3000 });
      console.log(`✅ Dropdown visible with selector: ${selector}`);
      dropdownVisible = true;
      break;
    } catch (error) {
      console.log(`❌ Dropdown not visible with selector: ${selector}`);
      continue;
    }
  }

  if (!dropdownVisible) {
    // Debug: check if dropdown exists in DOM but is hidden
    const dropdownExists = await page.locator('div[class*="shadow-xl"]').count();
    console.log(`Dropdown elements in DOM: ${dropdownExists}`);

    // Try clicking directly on the modal trigger
    console.log('Trying alternative approach: clicking modal trigger...');
    const hasModal = await page.locator('[role="dialog"]').count();
    if (hasModal > 0) {
      console.log('Modal is already open!');
    } else {
      // Try to find and click the New Point dropdown item directly
      const allButtons = await page.locator('button').all();
      for (const btn of allButtons) {
        const text = await btn.textContent();
        if (text?.includes('New Point')) {
          console.log('Found New Point button, clicking parent div...');
          await page.evaluate((el: HTMLElement) => {
            (el as HTMLElement).parentElement?.click();
          }, await page.locator('button:has-text("New Point")').elementHandle());
          await page.waitForTimeout(1000);
          break;
        }
      }

      // Check again for dropdown
      await page.waitForSelector('div[class*="shadow-xl"]', { state: 'visible', timeout: 5000 })
        .then(() => {
          console.log('✅ Dropdown appeared after parent div click');
          dropdownVisible = true;
        })
        .catch(() => {
          console.log('❌ Dropdown still not visible');
        });
    }
  }

  if (!dropdownVisible) {
    // Debug: screenshot and check page state
    console.log('Dropdown did not appear. Taking screenshot...');
    await page.screenshot({ path: 'test-results/dropdown-not-found.png' });
    throw new Error('Dropdown did not appear after clicking "New Point" button');
  }

  // Click the first "New Point" button in the dropdown
  console.log('Clicking first dropdown item...');
  const dropdownButtons = page.locator('div[class*="shadow-xl"] button');
  const buttonCount = await dropdownButtons.count();
  console.log(`Found ${buttonCount} buttons in dropdown`);

  await dropdownButtons.first().click();
  console.log('✅ Clicked dropdown item');

  // Wait for modal to appear
  console.log('Waiting for modal...');
  await page.waitForSelector('text=Add New Knowledge Point', { timeout: 5000 });
  console.log('✅ Modal appeared');
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
