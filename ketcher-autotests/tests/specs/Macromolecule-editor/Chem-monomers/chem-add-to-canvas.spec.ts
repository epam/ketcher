import { Chem } from '@tests/pages/constants/monomers/Chem';
import { test } from '@fixtures';
import {
  openFileAndAddToCanvasMacro,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import { MonomerPreviewTooltip } from '@tests/pages/macromolecules/canvas/MonomerPreviewTooltip';
import { AttachmentPointsDialog } from '@tests/pages/macromolecules/canvas/AttachmentPointsDialog';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';

/* 
Test case: #2497 - Add chem to canvas
*/

test('Select chem and drag it to canvas', async ({ page }) => {
  await waitForPageInit(page);

  // Click on POLYMER_TOGGLER
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  await Library(page).dragMonomerOnCanvas(Chem.sDBL, {
    x: 0,
    y: 0,
    fromCenter: true,
  });
  // Click on <svg> #polymer-editor-canvas
  await MonomerPreviewTooltip(page).hide();

  await takeEditorScreenshot(page);
});

test.describe('Actions with CHEM', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  });

  test('Check that CHEM name fits in its icon when placed on canvas', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures
    Description: CHEM name fits in its icon when placed on canvas.
    */
    await openFileAndAddToCanvasMacro(page, 'KET/all-chems.ket');
    await CommonLeftToolbar(page).bondTool(MacroBondType.Single);
    await takeEditorScreenshot(page);
  });

  test('Check that APs are not redrawn incorrectly after opening the modal window', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures https://github.com/epam/ketcher/issues/3585
    https://github.com/epam/ketcher/issues/3582
    Description: APs are not redrawn incorrectly after opening the modal window.
    */
    await openFileAndAddToCanvasMacro(page, 'KET/chems-not-connected.ket');
    await CommonLeftToolbar(page).bondTool(MacroBondType.Single);
    await bondTwoMonomers(
      page,
      getMonomerLocator(page, Chem.Test_6_Ch),
      getMonomerLocator(page, Chem.A6OH),
    );
    await takeEditorScreenshot(page);
    await AttachmentPointsDialog(page).cancel();
    await takeEditorScreenshot(page);
  });
});
