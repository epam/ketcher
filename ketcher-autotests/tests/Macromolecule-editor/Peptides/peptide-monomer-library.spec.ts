import { test } from '@playwright/test';
import {
  addPeptideOnCanvas,
  takeMonomerLibraryScreenshot,
  takePageScreenshot,
  takePeptideLibraryScreenshot,
  waitForPageInit,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

test.describe('Peptide library testing', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Monomer library', async ({ page }) => {
    await takeMonomerLibraryScreenshot(page);
  });

  test('Structure displaying in library', async ({ page }) => {
    // structure preview, molecule hovered state check
    await page.getByTestId('A___Alanine').hover();
    await page.waitForSelector('.polymer-library-preview');
    await takePeptideLibraryScreenshot(page);
  });

  test('Placing betaAlanine on canvas', async ({ page }) => {
    // placing molecule on canvas and molecule selected state check
    await addPeptideOnCanvas(page, 'Bal___beta-Alanine');
    await takePageScreenshot(page);
  });

  test('add molecule in favourites', async ({ page }) => {
    // favourites check. there is a bug - favourite sign (star) is golden when hovered(should be dark grey)
    // https://github.com/epam/ketcher/issues/3477
    // await page.waitForSelector('.star');
    await page.getByTestId('A___Alanine').getByText('★').click();
    await takePeptideLibraryScreenshot(page);
  });
});
