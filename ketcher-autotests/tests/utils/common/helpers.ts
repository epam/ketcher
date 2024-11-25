import { Page } from '@playwright/test';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';
import { waitForKetcherInit, waitForIndigoToLoad } from './loaders';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export async function emptyFunction() {}

export async function pageReload(page: Page) {
  /* In order to fix problem with label renderer (one pixel shift) 
        we have to try to reload page
    */
  await page.reload();
  await page.goto('', { waitUntil: 'domcontentloaded' });
  await waitForKetcherInit(page);
  await waitForIndigoToLoad(page);
  if (process.env.ENABLE_POLYMER_EDITOR === 'true') {
    await turnOnMacromoleculesEditor(page);
  }
}

export async function contextReload(page: Page): Promise<Page> {
  /* In order to fix problem with label renderer (one pixel shift) 
        we have to try to reload deeper than page - context!
   */
  const cntxt = page.context();
  const brwsr = cntxt.browser();
  await page.close();
  await cntxt.close();
  if (brwsr) {
    const newContext = await brwsr.newContext();
    page = await newContext.newPage();
  }

  await page.goto('', { waitUntil: 'domcontentloaded' });
  await waitForKetcherInit(page);
  await waitForIndigoToLoad(page);
  if (process.env.ENABLE_POLYMER_EDITOR === 'true') {
    await turnOnMacromoleculesEditor(page);
  }
  return page;
}

/**
 * This function clears the local storage of the page.
 * It is useful for resetting the application state to ensure no previous data interferes with testing.
 *
 * @param {Page} page - The Playwright page object.
 */
export async function clearLocalStorage(page: Page) {
  page.evaluate(() => {
    localStorage.clear();
  });
}

export async function closeErrorMessage(page: Page) {
  const errorMessage = page.getByText('Error message', {
    exact: true,
  });
  const closeWindowButton = page.getByRole('button', {
    name: 'Close window',
  });

  await closeWindowButton.click();
  await errorMessage.waitFor({ state: 'hidden' });
}

export async function closeOpenStructure(page: Page) {
  const closeWindowButton = page.getByRole('button', {
    name: 'Close window',
  });
  const openStructure = page.getByText('Open Structure', {
    exact: true,
  });
  await closeWindowButton.click();
  await openStructure.waitFor({ state: 'hidden' });
}

export async function closeErrorAndInfoModals(page: Page) {
  const closeButton = page.getByRole('button', { name: 'Close' });
  if (await closeButton.isVisible()) {
    await closeButton.click();
  }

  const closeIcon = page.locator('[data-testid="close-icon"]');
  if (await closeIcon.isVisible()) {
    await closeIcon.click();
  }
}
