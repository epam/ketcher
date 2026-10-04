import { Page } from '@playwright/test';

declare global {
  interface Window {
    _ketcher_isChainLengthRulerDisabled: boolean;
  }
}

export async function showRuler(page: Page) {
  await page.evaluate(() => {
    window._ketcher_isChainLengthRulerDisabled = false;
  });
}

export async function hideRuler(page: Page) {
  await page.evaluate(() => {
    window._ketcher_isChainLengthRulerDisabled = true;
  });
}
