/* eslint-disable no-empty-pattern */
/* eslint-disable @typescript-eslint/ban-types */
import { test as base, Page } from '@playwright/test';
import { waitForPageInit } from '@utils';

type CoreWorkerFixtures = {
  ketcher: {
    page?: Page;
  };
  createPage: () => Promise<Page>;
  closePage: () => Promise<void>;
};

export const test = base.extend<{}, CoreWorkerFixtures>({
  createPage: [
    async ({ browser, ketcher }, use) => {
      await use(async () => {
        const context = await browser.newContext();
        const page = await context.newPage();
        ketcher.page = page;
        await waitForPageInit(ketcher.page);
        return ketcher.page;
      });
      ketcher.page = undefined;
    },
    { scope: 'worker', auto: true },
  ],

  closePage: [
    async ({ browser, ketcher }, use) => {
      await use(async () => {
        ketcher.page = undefined;
        await Promise.all(browser.contexts().map((context) => context.close()));
      });
      ketcher.page = undefined;
    },
    { scope: 'worker', auto: true },
  ],

  ketcher: [
    async ({}, use) => {
      await use({});
    },
    { scope: 'worker', auto: true },
  ],

  page: async ({ ketcher }, use) => {
    await use(ketcher.page as Page);
  },
});
