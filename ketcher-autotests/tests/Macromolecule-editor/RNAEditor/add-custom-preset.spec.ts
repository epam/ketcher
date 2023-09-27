import { test } from '@playwright/test';
import {
  POLYMER_TOGGLER,
  RNA_TAB,
  SUGAR,
  BASE,
  PHOSPHATE,
  BUTTON__ADD_TO_PRESETS,
} from '../../../constants/testIdConstants';
import { waitForPageInit } from '@utils/common';

/* 
Test case: #3063 - Add e2e tests for Macromolecule editor
*/
test.describe('Macromolecules custom presets', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);

    // Click on POLYMER_TOGGLER
    await page.getByTestId(POLYMER_TOGGLER).click();

    // Click on <button> "RNA"
    await page.getByTestId(RNA_TAB).click();

    // Click on <input> [placeholder="Name your structure"]
    await page.click('[placeholder="Name your structure"]');

    // Fill "MyRNA" on <input> [placeholder="Name your structure"]
    await page.fill('[placeholder="Name your structure"]', 'MyRNA');

    // Press Enter on input
    await page.press('[placeholder="Name your structure"]', 'Enter');
  });
  test('Add new preset and duplicate it', async ({ page }) => {
    // Click on <div> "Sugar Not selected"
    await page.getByTestId(SUGAR).click();

    // Click on <div> "25R ★"
    await page.click('[data-testid="25R___2,5-Ribose"]');

    // Click on <div> "Base Not selected"
    await page.getByTestId(BASE).click();

    // Click on <div> "baA ★"
    await page.click('[data-testid="baA___N-benzyl-adenine"]');

    // Click on <div> "Phosphate Not selected"
    await page.getByTestId(PHOSPHATE).click();

    // Click on <div> "bP ★"
    await page.click('[data-testid="bP___Boranophosphate"]');

    // Click on <button> "Add to Presets"
    await page.getByTestId(BUTTON__ADD_TO_PRESETS).click();

    await page.screenshot({
      path: 'tests/Macromolecule-editor/screenshots/add-custom-preset-add.png',
    });

    // Click on <button> "Duplicate and Edit"
    await page.click('[data-testid="duplicate-btn"]');

    // Click on <div> "Sugar 25R"
    await page.getByTestId(SUGAR).click();

    // Click on <div> "dR ★"
    await page.click('[data-testid="dR___D-Arginine"]');

    // Click on <div> "Base baA"
    await page.getByTestId(BASE).click();

    // Click on <span> "cl2A"
    await page.click('text=cl2A');

    // Click on <div> "Phosphate bP"
    await page.getByTestId(PHOSPHATE).click();

    // Click on <div> "Smp ★"
    await page.click('[data-testid="Smp___(Sp)-Methylphosphonate"]');

    // Click on <button> "Save"
    await page.click('[data-testid="save-btn"]');

    // Take full page screenshot
    await page.screenshot({
      path: 'tests/Macromolecule-editor/screenshots/add-custom-preset-duplicate.png',
      fullPage: true,
    });
  });

  test('Add new preset with two monomers and add it to canvas', async ({
    page,
  }) => {
    await waitForPageInit(page);

    // Click on POLYMER_TOGGLER
    await page.getByTestId(POLYMER_TOGGLER).click();

    // Click on <button> "RNA"
    await page.getByTestId(RNA_TAB).click();

    // Click on <input> [placeholder="Name your structure"]
    await page.click('[placeholder="Name your structure"]');

    // Fill "MyRNA" on <input> [placeholder="Name your structure"]
    await page.fill('[placeholder="Name your structure"]', 'MyRNA');

    // Press Enter on input
    await page.press('[placeholder="Name your structure"]', 'Enter');

    // Click on <div> "Sugar Not selected"
    await page.getByTestId(SUGAR).click();

    // Click on <div> "25R ★"
    await page.click('[data-testid="25R___2,5-Ribose"]');

    // Click on <div> "Base Not selected"
    await page.getByTestId(BASE).click();

    // Click on <div> "baA ★"
    await page.click('[data-testid="baA___N-benzyl-adenine"]');

    // Click on <button> "Add to Presets"
    await page.getByTestId(BUTTON__ADD_TO_PRESETS).click();

    await page.click('[data-testid="MyRNA_baA_25R_."]');

    await page.click('#polymer-editor-canvas');
    await page.screenshot({
      path: 'tests/Macromolecule-editor/screenshots/add-custom-preset-add-to-canvas.png',
      fullPage: true,
    });
  });
});
