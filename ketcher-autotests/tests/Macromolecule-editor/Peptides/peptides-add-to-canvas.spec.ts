import { test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  moveMouseToTheMiddleOfTheScreen,
  selectMacroBond,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { ALANINE } from '@utils/selectors/macromoleculeEditor';
import {
  hideMonomerPreview,
  turnOnMacromoleculesEditor,
} from '@utils/macromolecules';
import { MacroBondTool } from '@utils/canvas/tools/selectNestedTool/types';

/* 
Test case: #3063 - Add e2e tests for Macromolecule editor
*/

test.describe('Peptide', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Select peptide and drag it to canvas', async ({ page }) => {
    await page.click(ALANINE);
    await clickInTheMiddleOfTheScreen(page);
    await hideMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  test('Add monomer preview on canvas', async ({ page }) => {
    /* 
    Test case: #2869 - Preview of monomer structures on canvas
    Description: Add monomer preview on canvas
    */
    await page.click(ALANINE);
    await clickInTheMiddleOfTheScreen(page);
    await selectMacroBond(page, MacroBondTool.SINGLE);
    await moveMouseToTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });
});
