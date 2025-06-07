import { waitForMonomerPreview } from '@utils/macromolecules';
import { test } from '@playwright/test';
import {
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
    await waitForMonomerPreview(page);
    await takeMonomerLibraryScreenshot(page);
  });

  test('Add Guanine to canvas', async ({ page }) => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas (by click)
    */
    await Library(page).selectMonomer(Presets.G);
    await page.click('#polymer-editor-canvas');

    // Get rid of flakiness because of preview
    const coords = { x: 100, y: 100 };
    await page.mouse.move(coords.x, coords.y);

    await takeEditorScreenshot(page);
  });
});
