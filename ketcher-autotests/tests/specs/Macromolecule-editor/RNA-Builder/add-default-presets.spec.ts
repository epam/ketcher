import { waitForMonomerPreview } from '@utils/macromolecules';
import { test } from '@playwright/test';
import {
  moveMouseAway,
  takeEditorScreenshot,
  takeMonomerLibraryScreenshot,
  waitForPageInit,
} from '@utils';
import { Presets } from '@constants/monomers/Presets';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';

test.describe('Macromolecules default presets', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await Library(page).switchToRNATab();
    await Library(page).rnaBuilder.collapse();
  });

  test('Check Guanine in default presets', async ({ page }) => {
    /* 
    Test case: #2934 - rna builder: add default presets
    Description: Switch to Polymer Editor
    */
    await Library(page).selectMonomer(Presets.G);
    await Library(page).hoverMonomer(Presets.G);
    await waitForMonomerPreview(page);
    await takeMonomerLibraryScreenshot(page);
  });

  test('Add Guanine to canvas', async ({ page }) => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas (by click)
    */
    await Library(page).dragMonomerOnCanvas(Presets.G, {
      x: 0,
      y: 0,
      fromCenter: true,
    });
    await moveMouseAway(page);

    await takeEditorScreenshot(page);
  });
});
