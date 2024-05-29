import { Page } from '@playwright/test';
import { DELAY_IN_SECONDS, delay } from '@utils';

/* Function for move away mouse cursor from structure and reset current tool */
export async function resetCurrentTool(page: Page) {
  const xCoord = 100;
  const yCoord = 100;
  await page.mouse.move(xCoord, yCoord);
  await delay(DELAY_IN_SECONDS.TWO);
  await page.keyboard.press('Escape');
}
