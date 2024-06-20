import { Page } from '@playwright/test';
import { waitForKetcherInit } from './waitForKetcherInit/waitForKetcherInit';
import { waitForIndigoToLoad } from './waitForIndigoToLoad';

export const waitForPageInit = async (page: Page) => {
  await page.goto('');
  await waitForKetcherInit(page);
  if (process.env.ENABLE_POLYMER_EDITOR !== 'true') {
    await waitForIndigoToLoad(page);
  }
};
