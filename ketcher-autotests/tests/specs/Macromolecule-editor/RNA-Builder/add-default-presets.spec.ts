import { test } from '@fixtures';
import {
  moveMouseAway,
  takeEditorScreenshot,
  takeMonomerLibraryScreenshot,
  waitForPageInit,
} from '@utils';
import { Preset } from '@tests/pages/constants/monomers/Presets';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import { MonomerPreviewTooltip } from '@tests/pages/macromolecules/canvas/MonomerPreviewTooltip';

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
    await Library(page).selectMonomer(Preset.G);
    await Library(page).hoverMonomer(Preset.G);
    await MonomerPreviewTooltip(page).waitForBecomeVisible();
    await takeMonomerLibraryScreenshot(page);
  });

  test('Add Guanine to canvas', async ({ page }) => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas (by click)
    */
    await Library(page).dragMonomerOnCanvas(Preset.G, {
      x: 0,
      y: 0,
      fromCenter: true,
    });
    await moveMouseAway(page);

    await takeEditorScreenshot(page);
  });
});
