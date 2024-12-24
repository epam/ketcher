import { Page } from '@playwright/test';
import { waitForRender } from '@utils/common';
import { emptyFunction } from '@utils/common/helpers';

export const waitForSpinnerFinishedWork = async (
  page: Page,
  callback: VoidFunction,
  timeout = 1000,
) => {
  await callback();
  await page.waitForSelector('.loading-spinner', { state: 'detached' });
  await waitForRender(page, emptyFunction, timeout);
};
