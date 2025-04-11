import { Page } from '@playwright/test';
import { isMacOS } from '../os';
import { waitForRender } from '@tests/utils';

export function getControlModifier() {
  return isMacOS() ? 'Meta' : 'Control';
}

export async function resetZoomLevelToDefault(page: Page) {
  await waitForRender(page, async () => {
    await page.keyboard.press('Control+0');
  });
}

export async function ZoomOutByKeyboard(page: Page) {
  await waitForRender(page, async () => {
    await page.keyboard.press('Control+-');
  });
}

export async function ZoomInByKeyboard(page: Page) {
  await waitForRender(page, async () => {
    await page.keyboard.press('Control+=');
  });
}

export async function keyboardPressOnCanvas(
  page: Page,
  key: string,
  options?: { delay?: number; waitForRenderTimeOut: number },
) {
  await waitForRender(
    page,
    async () => {
      await page.keyboard.press(key, options);
    },
    options?.waitForRenderTimeOut,
  );
}

export async function keyboardTypeOnCanvas(
  page: Page,
  text: string,
  options?: { delay?: number; waitForRenderTimeOut: number },
) {
  for (const char of text) {
    await keyboardPressOnCanvas(page, char, options);
  }
}
