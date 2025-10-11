import { test } from '@fixtures';
import { takeEditorScreenshot, waitForPageInit } from '@utils';

import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { MonomerPreviewTooltip } from '@tests/pages/macromolecules/canvas/MonomerPreviewTooltip';

/* 
Test case: #3063 - Add e2e tests for Macromolecule editor
*/

test.describe('Peptide', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  });

  test('Select peptide and drag it to canvas', async ({ page }) => {
    await Library(page).dragMonomerOnCanvas(Peptide.A, {
      x: -10,
      y: -10,
      fromCenter: true,
    });
    await MonomerPreviewTooltip(page).hide();
    await takeEditorScreenshot(page);
  });

  test('Add monomer preview on canvas', async ({ page }) => {
    /* 
    Test case: #2869 - Preview of monomer structures on canvas
    Description: Add monomer preview on canvas
    */
    await Library(page).dragMonomerOnCanvas(Peptide.A, {
      x: 0,
      y: 0,
      fromCenter: true,
    });
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
    await getMonomerLocator(page, Peptide.A).hover();
    await MonomerPreviewTooltip(page).waitForBecomeVisible();
    await takeEditorScreenshot(page);
  });
});
