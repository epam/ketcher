/* eslint-disable no-magic-numbers */
import { Page } from '@playwright/test';
import { delay } from '@utils/index';

/* Function for move away mouse cursor from structure and reset current tool */
export async function resetCurrentTool(page: Page) {
  const xCoord = 100;
  const yCoord = 100;
  await page.mouse.move(xCoord, yCoord);
  await delay(0.2);
  await page.keyboard.press('Escape');
}
