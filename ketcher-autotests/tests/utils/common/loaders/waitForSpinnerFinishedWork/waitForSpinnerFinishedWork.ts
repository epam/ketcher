import { Page } from '@playwright/test';

export const waitForSpinnerFinishedWork = async (
  page: Page,
  callback: VoidFunction,
) => {
  return Promise.all([
    await callback(),
    await page.waitForSelector('.loading-spinner', { state: 'detached' }),
  ]);
};
