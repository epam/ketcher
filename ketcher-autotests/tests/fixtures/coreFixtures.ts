import { test as base, Page } from '@playwright/test';

type CoreWorkerFixtures = {
  ketcher: {
    page?: Page;
  };
  createPage: () => Promise<Page>;
  closePage: () => Promise<void>;
};

export const test = base.extend<object, CoreWorkerFixtures>({
  createPage: [
    async ({ browser, ketcher }, use) => {
      await use(async () => {
        const context = await browser.newContext();
        const page = await context.newPage();
        ketcher.page = page;
        return page;
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
    async (_, use) => {
      await use({});
    },
    { scope: 'worker', auto: true },
  ],

  page: async ({ ketcher }, use) => {
    await use(ketcher.page as Page);
  },
});
