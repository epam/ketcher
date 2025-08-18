import { Chem } from '@constants/monomers/Chem';
import { test } from '@fixtures';
import {
  openFileAndAddToCanvasMacro,
  pressButton,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { hideMonomerPreview } from '@utils/macromolecules';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';

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
  await hideMonomerPreview(page);

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
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
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
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
    await getMonomerLocator(page, Chem.Test_6_Ch).hover();
    await page.mouse.down();
    await getMonomerLocator(page, Chem.A6OH).hover();
    await page.mouse.up();
    await takeEditorScreenshot(page);
    await pressButton(page, 'Cancel');
    await takeEditorScreenshot(page);
  });
});
