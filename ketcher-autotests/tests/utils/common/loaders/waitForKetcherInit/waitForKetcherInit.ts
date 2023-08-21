import { Page } from '@playwright/test';
export const waitForKetcherInit = async (page: Page) => {
  await page.waitForFunction(() => window.ketcher);
};
