import { expect, Page } from '@playwright/test';
import { POLYMER_TOGGLER } from '@constants/testIdConstants';

export async function turnOnMacromoleculesEditor(page: Page) {
  await expect(page.getByTestId(POLYMER_TOGGLER)).toBeVisible();
  await page.getByTestId(POLYMER_TOGGLER).click();
}

export async function hideMonomerPreview(page: Page) {
  await page.mouse.move(9999, 9999);
  await page
    .getByTestId('polymer-library-preview')
    .waitFor({ state: 'detached' });
}
