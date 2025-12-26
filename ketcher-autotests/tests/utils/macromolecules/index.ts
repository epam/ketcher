/* eslint-disable no-magic-numbers */
import { Page } from '@playwright/test';
import { moveMouseToTheMiddleOfTheScreen, waitForRender } from '@utils';

export async function zoomWithMouseWheel(page: Page, zoomLevelDelta: number) {
  await moveMouseToTheMiddleOfTheScreen(page);
  await page.keyboard.down('ControlOrMeta');
  await waitForRender(page, async () => {
    await page.mouse.wheel(0, zoomLevelDelta);
  });
  await page.keyboard.up('ControlOrMeta');
}

export async function scrollDown(page: Page, scrollDelta: number) {
  await moveMouseToTheMiddleOfTheScreen(page);
  await page.mouse.wheel(0, scrollDelta);
}

export async function scrollUp(page: Page, scrollDelta: number) {
  await moveMouseToTheMiddleOfTheScreen(page);
  await page.mouse.wheel(0, -scrollDelta);
}
