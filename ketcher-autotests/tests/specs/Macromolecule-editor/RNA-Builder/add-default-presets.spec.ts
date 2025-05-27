import { waitForMonomerPreview } from '@utils/macromolecules';
import { test } from '@playwright/test';
import {
  selectMonomer,
  takeEditorScreenshot,
  takeMonomerLibraryScreenshot,
  waitForPageInit,
} from '@utils';
import { toggleRnaBuilderAccordion } from '@utils/macromolecules/rnaBuilder';
import { Presets } from '@constants/monomers/Presets';
import { goToRNATab } from '@utils/macromolecules/library';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';

test.describe('Macromolecules default presets', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await goToRNATab(page);
    await toggleRnaBuilderAccordion(page);
  });

  test('Check Guanine in default presets', async ({ page }) => {
    /* 
    Test case: #2934 - rna builder: add default presets
    Description: Switch to Polymer Editor
    */
    await selectMonomer(page, Presets.G);
    await waitForMonomerPreview(page);
    await takeMonomerLibraryScreenshot(page);
  });

  test('Add Guanine to canvas', async ({ page }) => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas (by click)
    */
    await selectMonomer(page, Presets.G);
    await page.click('#polymer-editor-canvas');

    // Get rid of flakiness because of preview
    const coords = { x: 100, y: 100 };
    await page.mouse.move(coords.x, coords.y);

    await takeEditorScreenshot(page);
  });
});
