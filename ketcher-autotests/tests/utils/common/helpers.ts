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
  await turnOnMacromoleculesEditor(page);
}
