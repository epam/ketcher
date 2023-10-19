import { test } from '@playwright/test';
import {
  addPeptideOnCanvas,
  takePageScreenshot,
  takePeptideLibraryScreenshot,
  waitForPageInit,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

/* 
Test case: #3063 - Add e2e tests for Macromolecule editor
*/

test.describe('Peptide library testing', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Monomer library', async ({ page }) => {
    await takePageScreenshot(page);
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
    // await clickInTheMiddleOfTheScreen(page);
    // await selectRectangleSelectionTool(page);
    // await page.waitForSelector('peptide').hover();
    // await page.getByText('Bal').first().hover();
    // await moveMouseToTheMiddleOfTheScreen(page);
    await takePageScreenshot(page);
  });

  test('add molecule in favourites', async ({ page }) => {
    // favourites check
    (await page.waitForSelector('.star')).click();
    await takePeptideLibraryScreenshot(page);
  });
});
