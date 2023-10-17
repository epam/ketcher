import { expect, Page } from '@playwright/test';
import {
  MACROMOLECULES_MODE,
  POLYMER_TOGGLER,
} from '@constants/testIdConstants';

export async function turnOnMacromoleculesEditor(page: Page) {
  await expect(page.getByTestId(POLYMER_TOGGLER)).toBeVisible();
  await page.getByTestId(POLYMER_TOGGLER).click();
  await expect(page.getByTestId(MACROMOLECULES_MODE)).toBeVisible();
  await page.getByTestId(MACROMOLECULES_MODE).click();
}
