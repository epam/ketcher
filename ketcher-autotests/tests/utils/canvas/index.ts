export * from './selectBond';
export * from './tools';
export * from './helpers';
export * from './types';
import { Page } from '@playwright/test';
import { delay } from './helpers';
/* Function for move away mouse cursor from structure and reset current tool */
export async function resetCurrentTool(page: Page) {
  await page.mouse.move(100, 100);
  await delay(3);
  await page.keyboard.press('Escape');
}
