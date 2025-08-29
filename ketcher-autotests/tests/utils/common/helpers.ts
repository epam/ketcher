import { Page } from '@playwright/test';
import { waitForKetcherInit, waitForIndigoToLoad } from './loaders';
import { OpenStructureDialog } from '@tests/pages/common/OpenStructureDialog';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export async function emptyFunction() {}

export async function pageReload(page: Page) {
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

export async function waitForErrorMessage(page: Page) {
  const errorMessageDialog = page.getByText('Error message', {
    exact: true,
  });

  await errorMessageDialog.waitFor({ state: 'visible', timeout: 1000 });
}

export async function closeOpenStructure(page: Page) {
  const openStructure = page.getByText('Open Structure', {
    exact: true,
  });
  await OpenStructureDialog(page).close();
  await openStructure.waitFor({ state: 'hidden' });
}

export async function closeErrorAndInfoModals(page: Page) {
  const closeButton = page.getByTestId('info-modal-close');
  if (await closeButton.isVisible()) {
    await closeButton.click();
  }

  const closeIcon = page.locator('[data-testid="close-window-button"]').first();
  if (await closeIcon.isVisible()) {
    await closeIcon.click();
  }
}
