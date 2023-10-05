import { test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  takePageScreenshot,
  waitForPageInit,
} from '@utils';
import { ALANINE } from '@utils/selectors/macromoleculeEditor';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

/* 
Test case: #3063 - Add e2e tests for Macromolecule editor
*/

test.describe('Peptide', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test.afterEach(async ({ page }) => {
    await takePageScreenshot(page);
  });

  test('Select peptide and drag it to canvas', async ({ page }) => {
    const coords = { x: 100, y: 100 };
    await page.click(ALANINE);
    await clickInTheMiddleOfTheScreen(page);
    await page.mouse.move(coords.x, coords.y);
  });

  test('Add monomer preview on canvas', async ({ page }) => {
    /* 
    Test case: #2869 - Preview of monomer structures on canvas
    Description: Add monomer preview on canvas
    */
    await page.click(ALANINE);
    await clickInTheMiddleOfTheScreen(page);
  });
});
