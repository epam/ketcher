import { Bases } from '@constants/monomers/Bases';
import { Phosphates } from '@constants/monomers/Phosphates';
import { Sugars } from '@constants/monomers/Sugars';
import { BUTTON__ADD_TO_PRESETS, RNA_TAB } from '@constants/testIdConstants';
import { Page, test } from '@playwright/test';
import {
  moveMouseToTheMiddleOfTheScreen,
  selectCustomPreset,
  selectMonomers,
  takeEditorScreenshot,
  takeMonomerLibraryScreenshot,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@tests/pages/common/TopRightToolbar';
import { waitForPageInit } from '@utils/common';
import { waitForMonomerPreview } from '@utils/macromolecules';
import { goToRNATab } from '@utils/macromolecules/library';
import {
  pressAddToPresetsButton,
  pressSaveButton,
} from '@utils/macromolecules/rnaBuilder';

/* 
Test case: #3063 - Add e2e tests for Macromolecule editor
*/
async function createRNA(page: Page) {
  await page.getByTestId(RNA_TAB).click();
  await expandRnaBuilder(page);
  await page.fill('[placeholder="Name your structure"]', 'MyRNA');
  await page.press('[placeholder="Name your structure"]', 'Enter');
}

async function expandRnaBuilder(page: Page) {
  await page
    .locator('div')
    .filter({ hasText: /^RNA Builder$/ })
    .getByRole('button')
    .click();
}

test.describe('Macromolecules custom presets', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await TopRightToolbar(page).turnOnMacromoleculesEditor();
    await createRNA(page);
  });

  test('Add new preset and duplicate it', async ({ page }) => {
    await selectMonomers(page, [Sugars._25R, Bases.baA, Phosphates.bP]);
    await moveMouseToTheMiddleOfTheScreen(page);
    await page.getByTestId(BUTTON__ADD_TO_PRESETS).click();

    await takeMonomerLibraryScreenshot(page);

    await page.getByTestId('duplicate-btn').click();

    await selectMonomers(page, [Sugars._12ddR, Bases.A, Phosphates.P]);
    await pressSaveButton(page);

    await takeMonomerLibraryScreenshot(page);
  });

  test('Add new preset with two monomers and add it to canvas', async ({
    page,
  }) => {
    await waitForPageInit(page);

    // Click on POLYMER_TOGGLER
    await TopRightToolbar(page).turnOnMacromoleculesEditor();

    // Click on <button> "RNA"
    await goToRNATab(page);

    await expandRnaBuilder(page);

    // Click on <input> [placeholder="Name your structure"]
    await page.click('[placeholder="Name your structure"]');

    // Fill "MyRNA" on <input> [placeholder="Name your structure"]
    await page.fill('[placeholder="Name your structure"]', 'MyRNA');

    // Press Enter on input
    await page.press('[placeholder="Name your structure"]', 'Enter');

    await selectMonomers(page, [Sugars._25R, Bases.baA]);

    // Click on <button> "Add to Presets"
    await pressAddToPresetsButton(page);

    await takeMonomerLibraryScreenshot(page);

    await selectCustomPreset(page, 'MyRNA_baA_25R_.');
    await page.click('#polymer-editor-canvas');

    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });
});
