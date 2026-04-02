import { Page } from '@playwright/test';
import { waitForKetcherInit } from './loaders/waitForKetcherInit/waitForKetcherInit';
import { waitForIndigoToLoad } from './loaders/waitForIndigoToLoad';

export async function emptyFunction() {
  // Intentionally empty callback used as a default async no-op in wait helpers.
}

export async function pageReload(page: Page) {
  const { CommonTopRightToolbar } = await import(
    './../../pages/common/CommonTopRightToolbar'
  );
  await page.reload();
  await page.goto('', { waitUntil: 'domcontentloaded' });
  await waitForKetcherInit(page);
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
}

export async function pageReloadMicro(page: Page) {
  await page.reload();
  await page.goto('', { waitUntil: 'domcontentloaded' });
  await waitForKetcherInit(page);
  await waitForIndigoToLoad(page);
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
