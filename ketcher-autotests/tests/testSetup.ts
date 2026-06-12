import { test } from '@playwright/test';

test.beforeEach(async ({ page }, testInfo) => {
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();

    if (type === 'warning') {
      console.warn(`[browser warn] [${testInfo.title}] ${text}`);
    } else if (type === 'error') {
      console.error(`[browser error] [${testInfo.title}] ${text}`);
    }
  });
});
