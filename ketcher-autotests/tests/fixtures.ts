import {
  test as base,
  expect,
  Page,
  Locator,
  BrowserContext,
  request,
} from '@playwright/test';

export const test = base;
export { expect, request };
export type { Page, Locator, BrowserContext };

test.beforeEach(async ({ page }, testInfo) => {
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();

    if (type === 'warn') {
      console.warn(`[browser warn] [${testInfo.title}] ${text}`);
    } else if (type === 'error') {
      console.error(`[browser error] [${testInfo.title}] ${text}`);
    } else {
      console.log(`[browser ${type}] [${testInfo.title}] ${text}`);
    }
  });
});
