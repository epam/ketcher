import { Bases } from '@constants/monomers/Bases';
import { Phosphates } from '@constants/monomers/Phosphates';
import { Sugars } from '@constants/monomers/Sugars';
import { Page, test } from '@playwright/test';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import {
  moveMouseToTheMiddleOfTheScreen,
  takeEditorScreenshot,
  takeMonomerLibraryScreenshot,
} from '@utils';
import { waitForPageInit } from '@utils/common';
import { waitForMonomerPreview } from '@utils/macromolecules';

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
    await Library(page).selectMonomers([Sugars._25R, Bases.baA, Phosphates.bP]);
    await moveMouseToTheMiddleOfTheScreen(page);
    await Library(page).rnaBuilder.addToPresets();

    await takeMonomerLibraryScreenshot(page);

    await Library(page).rnaBuilder.duplicateAndEdit();

    await Library(page).selectMonomers([Sugars._12ddR, Bases.A, Phosphates.P]);
    await Library(page).rnaBuilder.save();

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

    await Library(page).selectMonomers([Sugars._25R, Bases.baA]);

    // Click on <button> "Add to Presets"
    await Library(page).rnaBuilder.addToPresets();

    await takeMonomerLibraryScreenshot(page);

    await Library(page).selectCustomPreset('MyRNA_baA_25R_.');
    await page.click('#polymer-editor-canvas');

    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });
});
