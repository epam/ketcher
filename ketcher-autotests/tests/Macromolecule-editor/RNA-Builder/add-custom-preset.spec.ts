import { Page, test } from '@playwright/test';
import {
  RNA_TAB,
  SUGAR,
  BASE,
  PHOSPHATE,
  BUTTON__ADD_TO_PRESETS,
} from '@constants/testIdConstants';
import { waitForPageInit } from '@utils/common';
import {
  Bases,
  moveMouseToTheMiddleOfTheScreen,
  Sugars,
  takeEditorScreenshot,
  takeMonomerLibraryScreenshot,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';
import { pressSaveButton } from '@utils/macromolecules/rnaBuilder';

/* 
Test case: #3063 - Add e2e tests for Macromolecule editor
*/
async function createRNA(page: Page) {
  await page.getByTestId(RNA_TAB).click();
  await expandRnaBuilder(page);
  await page.fill('[placeholder="Name your structure"]', 'MyRNA');
  await page.press('[placeholder="Name your structure"]', 'Enter');
}

async function selectRNAComponents(
  page: Page,
  {
    sugar,
    base,
    phosphate,
  }: {
    sugar: string;
    base: string;
    phosphate: string;
  },
) {
  await page.getByTestId(SUGAR).click();
  await page.getByTestId(sugar).click();

  await page.getByTestId(BASE).click();
  await page.getByTestId(base).click();

  await page.getByTestId(PHOSPHATE).click();
  await page.getByTestId(phosphate).click();
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
    await turnOnMacromoleculesEditor(page);
    await createRNA(page);
  });

  test('Add new preset and duplicate it', async ({ page }) => {
    await selectRNAComponents(page, {
      sugar: Sugars.TwentyFiveR,
      base: Bases.baA,
      phosphate: 'bP___Boranophosphate',
    });
    await moveMouseToTheMiddleOfTheScreen(page);
    await page.getByTestId(BUTTON__ADD_TO_PRESETS).click();

    await takeMonomerLibraryScreenshot(page);

    await page.getByTestId('duplicate-btn').click();

    await selectRNAComponents(page, {
      sugar: "12ddR___1',2'-dideoxyribose",
      base: 'A___Adenine',
      phosphate: 'P___Phosphate',
    });

    await pressSaveButton(page);

    await takeMonomerLibraryScreenshot(page);
  });

  test('Add new preset with two monomers and add it to canvas', async ({
    page,
  }) => {
    await waitForPageInit(page);

    // Click on POLYMER_TOGGLER
    await turnOnMacromoleculesEditor(page);

    // Click on <button> "RNA"
    await page.getByTestId(RNA_TAB).click();

    await expandRnaBuilder(page);

    // Click on <input> [placeholder="Name your structure"]
    await page.click('[placeholder="Name your structure"]');

    // Fill "MyRNA" on <input> [placeholder="Name your structure"]
    await page.fill('[placeholder="Name your structure"]', 'MyRNA');

    // Press Enter on input
    await page.press('[placeholder="Name your structure"]', 'Enter');

    // Click on <div> "Sugar Not selected"
    await page.getByTestId(SUGAR).click();

    // Click on <div> "25R ★"
    await page.click(`[data-testid="${Sugars.TwentyFiveR}"]`);

    // Click on <div> "Base Not selected"
    await page.getByTestId(BASE).click();

    // Click on <div> "baA ★"
    await page.click(`[data-testid="${Bases.baA}"]`);

    // Click on <button> "Add to Presets"
    await page.getByTestId(BUTTON__ADD_TO_PRESETS).click();

    await takeMonomerLibraryScreenshot(page);

    await page.click('[data-testid="MyRNA_baA_25R_."]');

    await page.click('#polymer-editor-canvas');
    await takeEditorScreenshot(page);
  });
});
