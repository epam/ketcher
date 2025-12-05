import { Page } from '@playwright/test';
import * as os from 'os';
import { waitForRender } from '@tests/utils';

let cachedControlModifier: string | null = null;

export function getControlModifier() {
  if (cachedControlModifier) return cachedControlModifier;
  cachedControlModifier = os.platform() === 'darwin' ? 'Meta' : 'Control';
  return cachedControlModifier;
}

export async function resetZoomLevelToDefault(page: Page) {
  const modifier = getControlModifier();
  await waitForRender(page, async () => {
    await page.keyboard.press(`${modifier}+0`);
  });
}

export async function ZoomOutByKeyboard(
  page: Page,
  options: { repeat: number; timeout?: number } = { repeat: 1 },
) {
  const modifier = getControlModifier();
  for (let i = 0; i < options.repeat; i++) {
    await waitForRender(
      page,
      async () => {
        await page.keyboard.press(`${modifier}+Minus`);
      },
      options.timeout,
    );
  }
}

export async function ZoomInByKeyboard(
  page: Page,
  options: { repeat: number; timeout?: number } = { repeat: 1 },
) {
  const modifier = getControlModifier();
  for (let i = 0; i < options.repeat; i++) {
    await waitForRender(
      page,
      async () => {
        await page.keyboard.press(`${modifier}+Equal`);
      },
      options.timeout,
    );
  }
}

export async function clearCanvasByKeyboard(page: Page) {
  const modifier = getControlModifier();
  await waitForRender(page, async () => {
    await page.keyboard.press(`${modifier}+Delete`);
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
