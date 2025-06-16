import { Page } from '@playwright/test';
import { isMacOS } from '../os';
import { waitForRender } from '@tests/utils';

export function getControlModifier() {
  return isMacOS() ? 'Meta' : 'Control';
}

export async function resetZoomLevelToDefault(page: Page) {
  const modifier = getControlModifier();
  await waitForRender(page, async () => {
    await page.keyboard.press(`${modifier}+0`);
  });
}

export async function ZoomOutByKeyboard(page: Page) {
  const modifier = getControlModifier();
  await waitForRender(page, async () => {
    await page.keyboard.press(`${modifier}+Minus`);
  });
}

export async function ZoomInByKeyboard(page: Page) {
  const modifier = getControlModifier();
  await waitForRender(page, async () => {
    await waitForRender(
      page,
      async () => await page.keyboard.press(`${modifier}+Equal`),
    );
  });
}

export async function keyboardPressOnCanvas(
  page: Page,
  key: string,
  options?: { delay?: number; waitForRenderTimeOut?: number },
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
  options?: { delay?: number; waitForRenderTimeOut?: number },
) {
  for (const char of text) {
    await keyboardPressOnCanvas(page, char, options);
  }
}
