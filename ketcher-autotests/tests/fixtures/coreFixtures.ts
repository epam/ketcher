/* eslint-disable no-empty-pattern */
/* eslint-disable @typescript-eslint/ban-types */
import { test as base, Page, TestInfoError } from '@playwright/test';
import { waitForPageInit } from '@utils';

type CoreTestFixtures = {
  ketcherTestInfo: object;
};

type CoreWorkerFixtures = {
  ketcher: {
    page?: Page;
    testError?: TestInfoError;
    testStatus?: 'passed' | 'failed' | 'timedOut' | 'skipped' | 'interrupted';
    testTimeout?: number;
  };
  createPage: () => Promise<Page>;
  closePage: () => Promise<void>;
};

export const test = base.extend<CoreTestFixtures, CoreWorkerFixtures>({
  createPage: [
    async ({ browser, ketcher }, use) => {
      await use(async () => {
        const context = await browser.newContext();
        const page = await context.newPage();
        ketcher.page = page;
        await waitForPageInit(page);
        return page;
      });
      ketcher.page = undefined;
    },
    { scope: 'worker', auto: true },
  ],

  closePage: [
    async ({ browser, ketcher }, use) => {
      await use(async () => {
        await Promise.all(
          browser.contexts().map((context) =>
            context.close({
              reason:
                ketcher.testStatus === 'timedOut'
                  ? `Test timeout of ${ketcher.testTimeout}ms exceeded.`
                  : 'Test ended.',
            }),
          ),
        );
      });
    },
    { scope: 'worker', auto: true },
  ],

  ketcher: [
    async ({}, use) => {
      await use({});
    },
    { scope: 'worker', auto: true },
  ],

  ketcherTestInfo: [
    async ({ ketcher }, use, testInfo) => {
      ketcher.testError = undefined;
      ketcher.testStatus = undefined;
      ketcher.testTimeout = undefined;
      await use({});
      ketcher.testError = testInfo.error;
      ketcher.testStatus = testInfo.status;
      ketcher.testTimeout = testInfo.timeout;
    },
    { scope: 'test', auto: true },
  ],
});
