import { expect, Page } from '@playwright/test';
import {
  MACROMOLECULES_MODE,
  POLYMER_TOGGLER,
} from '@constants/testIdConstants';
import { moveMouseToTheMiddleOfTheScreen } from '@utils';

export async function turnOnMacromoleculesEditor(page: Page) {
  await expect(page.getByTestId(POLYMER_TOGGLER)).toBeVisible();
  await page.getByTestId(POLYMER_TOGGLER).click();
  await expect(page.getByTestId(MACROMOLECULES_MODE)).toBeVisible();
  await page.getByTestId(MACROMOLECULES_MODE).click();
}

export async function hideMonomerPreview(page: Page) {
  await page.mouse.move(9999, 9999);
  await page
    .getByTestId('polymer-library-preview')
    .waitFor({ state: 'detached', timeout: 2000 });
}

export async function scrollWithMouseWheel(page: Page, zoomLevelDelta: number) {
  await moveMouseToTheMiddleOfTheScreen(page);
  await page.keyboard.down('Control');
  await page.mouse.wheel(0, zoomLevelDelta);
  await page.keyboard.up('Control');
}
