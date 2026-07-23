import { Page } from '@playwright/test';

export async function showRuler(page: Page) {
  await page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window._ketcher_isChainLengthRulerDisabled = false;
  });
}

export async function hideRuler(page: Page) {
  await page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window._ketcher_isChainLengthRulerDisabled = true;
  });
}
