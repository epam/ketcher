import { Page } from '@playwright/test';
import { isMacOS } from '../os';
import { waitForRender } from '@tests/utils';

let cachedAltModifier: string | null = null;

export function getAltModifier() {
  if (cachedAltModifier) return cachedAltModifier;
  cachedAltModifier = isMacOS() ? 'Option' : 'Alt';
  return cachedAltModifier;
}

export async function arrangeAsARingByKeyboard(page: Page) {
  const altModifier = getAltModifier();
  await waitForRender(page, async () => {
    await page.keyboard.press(`Shift+${altModifier}+c`);
  });
}

export async function resetZoomLevelToDefault(page: Page) {
  await waitForRender(page, async () => {
    await page.keyboard.press(`ControlOrMeta+0`);
  });
}

export async function ZoomOutByKeyboard(
  page: Page,
  options: { repeat: number; timeout?: number } = { repeat: 1 },
) {
  for (let i = 0; i < options.repeat; i++) {
    await waitForRender(
      page,
      async () => {
        await page.keyboard.press(`ControlOrMeta+Minus`);
      },
      options.timeout,
    );
  }
}

export async function ZoomInByKeyboard(
  page: Page,
  options: { repeat: number; timeout?: number } = { repeat: 1 },
) {
  for (let i = 0; i < options.repeat; i++) {
    await waitForRender(
      page,
      async () => {
        await page.keyboard.press(`ControlOrMeta+Equal`);
      },
      options.timeout,
    );
  }
}

export async function clearCanvasByKeyboard(page: Page) {
  await waitForRender(page, async () => {
    await page.keyboard.press(`ControlOrMeta+Delete`);
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

export async function deleteByKeyboard(page: Page) {
  await waitForRender(page, async () => {
    await page.keyboard.press('Delete');
  });
}
