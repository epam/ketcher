import { test, expect } from '@playwright/test';
import {
  DELAY_IN_SECONDS,
  clickInTheMiddleOfTheScreen,
  takePageScreenshot,
  waitForPageInit,
} from '@utils';
import { ALANINE } from '@utils/selectors/macromoleculeEditor';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

/* 
Test case: #3063 - Add e2e tests for Macromolecule editor
*/

test.describe('Peptide library testing', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Monomer library', async ({ page }) => {
    await turnOnMacromoleculesEditor(page);
    await takePageScreenshot(page);
  });

  test('Structure displaying in library', async ({ page }) => {
    await turnOnMacromoleculesEditor(page);
    await page.getByTestId('A___Alanine').hover();
    // const expectedElement = page.getByTestId('polymer-library-preview');
    await expect(page.getByTestId('polymer-library-preview')).toBeVisible();
    // await DELAY_IN_SECONDS.TWO;
    await takePageScreenshot(page);
  });
});
