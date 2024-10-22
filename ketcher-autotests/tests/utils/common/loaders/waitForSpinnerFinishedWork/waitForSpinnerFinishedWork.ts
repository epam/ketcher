import { Page } from '@playwright/test';
import { waitForRender } from '@utils/common';
import { emptyFunction } from '@utils/common/helpers';

// export const waitForSpinnerFinishedWork = async (
//   page: Page,
//   callback: VoidFunction,
// ) => {
//   return Promise.all([
//     await callback(),
//     await page.waitForSelector('.loading-spinner', { state: 'detached' }),
//   ]);
// };

export const waitForSpinnerFinishedWork = async (
  page: Page,
  callback: VoidFunction,
) => {
  await callback();
  await page.waitForSelector('.loading-spinner', { state: 'detached' });
  const maxTimeout = 1000;
  await waitForRender(page, emptyFunction, maxTimeout);
};
