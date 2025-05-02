import { test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  moveMouseToTheMiddleOfTheScreen,
  selectMonomer,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import {
  hideMonomerPreview,
  waitForMonomerPreview,
} from '@utils/macromolecules';
import { Peptides } from '@constants/monomers/Peptides';
import { turnOnMacromoleculesEditor } from '@tests/pages/common/TopRightToolbar';
import { bondSelectionTool } from '@tests/pages/common/CommonLeftToolbar';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';

/* 
Test case: #3063 - Add e2e tests for Macromolecule editor
*/

test.describe('Peptide', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Select peptide and drag it to canvas', async ({ page }) => {
    await selectMonomer(page, Peptides.A);
    await clickInTheMiddleOfTheScreen(page);
    await hideMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  test('Add monomer preview on canvas', async ({ page }) => {
    /* 
    Test case: #2869 - Preview of monomer structures on canvas
    Description: Add monomer preview on canvas
    */
    await selectMonomer(page, Peptides.A);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
    await moveMouseToTheMiddleOfTheScreen(page);
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });
});
