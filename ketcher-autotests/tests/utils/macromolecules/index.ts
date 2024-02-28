import { expect, Page } from '@playwright/test';
import {
  MACROMOLECULES_MODE,
  MOLECULES_MODE,
  POLYMER_TOGGLER,
} from '@constants/testIdConstants';
import {
  moveMouseToTheMiddleOfTheScreen,
  waitForSpinnerFinishedWork,
} from '@utils';

export async function turnOnMacromoleculesEditor(page: Page) {
  await expect(page.getByTestId(POLYMER_TOGGLER)).toBeVisible();
  await page.getByTestId(POLYMER_TOGGLER).click();
  await expect(page.getByTestId(MACROMOLECULES_MODE)).toBeVisible();
  await page.getByTestId(MACROMOLECULES_MODE).click();
}

export async function turnOnMicromoleculesEditor(page: Page) {
  await expect(page.getByTestId(POLYMER_TOGGLER)).toBeVisible();
  await page.getByTestId(POLYMER_TOGGLER).click();
  await expect(page.getByTestId(MOLECULES_MODE)).toBeVisible();
  await page.getByTestId(MOLECULES_MODE).click();
}

export async function hideMonomerPreview(page: Page) {
  await page.mouse.move(9999, 9999);
  await page
    .getByTestId('polymer-library-preview')
    .waitFor({ state: 'detached' });
}

export async function zoomWithMouseWheel(page: Page, zoomLevelDelta: number) {
  await moveMouseToTheMiddleOfTheScreen(page);
  await page.keyboard.down('Control');
  await page.mouse.wheel(0, zoomLevelDelta);
  await page.keyboard.up('Control');
}

export async function scrollDown(page: Page, scrollDelta: number) {
  await moveMouseToTheMiddleOfTheScreen(page);
  await page.mouse.wheel(0, scrollDelta);
}

export async function chooseFileFormat(
  page: Page,
  fileFomat: 'Ket' | 'MDL Molfile V3000',
) {
  await page.getByTestId('dropdown-select').click();
  await waitForSpinnerFinishedWork(page, async () => {
    await page.getByRole('option', { name: fileFomat }).click();
  });
}
