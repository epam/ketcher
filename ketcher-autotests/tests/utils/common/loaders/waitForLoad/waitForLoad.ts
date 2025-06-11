/* eslint-disable no-magic-numbers */
import { Page } from '@playwright/test';
import { OpenStructureDialog } from '@tests/pages/common/OpenStructureDialog';
import { delay } from '@utils/canvas';
import { waitForRender } from '@utils/common';

/**
 * Waits till event REQUEST_IS_FINISHED emits
 * from ketcher package and only then resolve promise
 * if event do not trigger then reject promise with message 'Timeout exeeded'
 *
 * Usage:
 * Use it to prevent delays in test cases, create custom helpers above it.
 *
 * Check addToCanvas function, for example.
 * @param page - playwright object
 * @param callback - any function that uses Locator.click, see playwright docs for Locator
 * @returns Promise<string>
 */
export const waitForLoad = async (page: Page, callback: VoidFunction) => {
  const openStructureDialogWindow = OpenStructureDialog(page).window;
  const loadingSpinner = page.getByTestId('loading-spinner');
  const errorMessageBox = page.getByText('Error Message', {
    exact: true,
  });

  callback();
  await delay(0.3);
  if (await loadingSpinner.isVisible()) {
    await loadingSpinner.waitFor({ state: 'detached' });
  }

  if (await openStructureDialogWindow.isVisible()) {
    // this spinner appear in Macro mode (before openStructureDialog close)
    if (await loadingSpinner.isVisible()) {
      await loadingSpinner.waitFor({ state: 'detached' });
    }
    if (await errorMessageBox.isVisible()) {
      return;
    }
    await openStructureDialogWindow.waitFor({
      state: 'detached',
    });
  }
  // this spinner appear in Molecules mode (after openStructureDialog close)
  if (await loadingSpinner.isVisible()) {
    await loadingSpinner.waitFor({ state: 'detached' });
  }
};

export async function waitForLoadAndRender(page: Page, callback: VoidFunction) {
  await waitForRender(page, async () => {
    await waitForLoad(page, async () => {
      callback();
    });
  });
}
