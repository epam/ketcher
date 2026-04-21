/* eslint-disable no-magic-numbers */
import { Page } from '@playwright/test';
import { moveMouseAway, waitForRender } from '@utils';

export async function horizontalFlipByKeyboard(page: Page) {
  await moveMouseAway(page);
  await waitForRender(page, async () => {
    await page.keyboard.press('Alt+h');
  });
}

export async function verticalFlipByKeyboard(page: Page) {
  await moveMouseAway(page);
  await waitForRender(page, async () => {
    await page.keyboard.press('Alt+v');
  });
}

export async function selectionDeleteByKeyboard(page: Page) {
  await moveMouseAway(page);
  await waitForRender(page, async () => {
    await page.keyboard.press('Delete');
  });
}
