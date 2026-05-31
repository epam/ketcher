import { Base } from '@tests/pages/constants/monomers/Bases';
import { Phosphate } from '@tests/pages/constants/monomers/Phosphates';
import { Sugar } from '@tests/pages/constants/monomers/Sugars';
import { Page, test } from '@fixtures';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import {
  Monomer,
  moveMouseToTheMiddleOfTheScreen,
  takeEditorScreenshot,
  takeMonomerLibraryScreenshot,
} from '@utils';
import { waitForPageInit } from '@utils/common';
import { Preset } from '@tests/pages/constants/monomers/Presets';
import { MonomerPreviewTooltip } from '@tests/pages/macromolecules/canvas/MonomerPreviewTooltip';

/* 
Test case: #3063 - Add e2e tests for Macromolecule editor
*/
async function createRNA(page: Page) {
  await Library(page).switchToRNATab();
  await Library(page).rnaBuilder.expand();
  await page.fill('[placeholder="Name your structure"]', 'MyRNA');
  await page.press('[placeholder="Name your structure"]', 'Enter');
}

test.describe('Macromolecules custom presets', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await createRNA(page);
  });

  test('Add new preset and duplicate it', async ({ page }) => {
    await Library(page).selectMonomers([Sugar._25R, Base.baA, Phosphate.bP]);
    await moveMouseToTheMiddleOfTheScreen(page);
    await Library(page).rnaBuilder.addToPresets();
    await Library(page).hoverMonomer(Preset.MyRNA);
    await MonomerPreviewTooltip(page).waitForBecomeVisible();
    await takeMonomerLibraryScreenshot(page);

    await Library(page).rnaBuilder.duplicateAndEdit();

    await Library(page).selectMonomers([Sugar._12ddR, Base.A, Phosphate.P]);
    await Library(page).rnaBuilder.save();
    await Library(page).hoverMonomer(Preset.MyRNA);
    await MonomerPreviewTooltip(page).waitForBecomeVisible();
    await takeMonomerLibraryScreenshot(page);
  });

  test('Add new preset with two monomers and add it to canvas', async ({
    page,
  }) => {
    await waitForPageInit(page);

    // Click on POLYMER_TOGGLER
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    // Click on <button> "RNA"
    await Library(page).switchToRNATab();

    await Library(page).rnaBuilder.expand();

    // Click on <input> [placeholder="Name your structure"]
    await page.click('[placeholder="Name your structure"]');

    // Fill "MyRNA" on <input> [placeholder="Name your structure"]
    await page.fill('[placeholder="Name your structure"]', 'MyRNA');

    // Press Enter on input
    await page.press('[placeholder="Name your structure"]', 'Enter');

    await Library(page).selectMonomers([Sugar._25R, Base.baA]);

    // Click on <button> "Add to Presets"
    await Library(page).rnaBuilder.addToPresets();

    await takeMonomerLibraryScreenshot(page);

    await Library(page).dragMonomerOnCanvas(
      {
        alias: 'MyRNA_baA_25R_.',
        testId: 'MyRNA_baA_25R_.',
      } as Monomer,
      {
        x: 100,
        y: 100,
      },
    );

    await takeEditorScreenshot(page);
  });
});
