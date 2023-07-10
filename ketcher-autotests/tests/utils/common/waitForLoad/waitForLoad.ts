import { Page } from '@playwright/test';

// const evaluateCallback = (REQUEST_IS_FINISHED: string) => {
//   const MAX_TIME_TO_WAIT = 10000;
//   return new Promise((resolve) => {
//     window.ketcher.eventBus.addListener(REQUEST_IS_FINISHED, () => {
//       return resolve('resolve');
//     });
//
//     setTimeout(() => resolve('Timeout exceeded'), MAX_TIME_TO_WAIT);
//   });
// };

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
  await page.waitForFunction(() => window.ketcher);
  // const promise = page.evaluate(evaluateCallback, REQUEST_IS_FINISHED);
  callback();

  if (await page.locator('[role=dialog]').isVisible()) {
    await page.waitForSelector('[role=dialog]', { state: 'detached' });
  }

  if (await page.locator('.loading-spinner').isVisible()) {
    await page.waitForSelector('.loading-spinner', { state: 'detached' });
  }

  // return promise;
};
