import { Page } from '@playwright/test';
import { isMacOS } from '../os';

export function getControlModifier() {
  return isMacOS() ? 'Meta' : 'Control';
}

export async function resetZoomLevelToDefault(page: Page) {
  await page.keyboard.press('Control+0');
}
