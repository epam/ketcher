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
  // TODO: It was reduced to a 1000 to make overall tests execution faster. However, it resulted in some tests failing. Make it configurable?
  const maxTimeout = 3000;
  await waitForRender(page, emptyFunction, maxTimeout);
};
