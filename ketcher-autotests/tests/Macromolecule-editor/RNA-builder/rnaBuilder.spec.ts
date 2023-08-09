import { test, expect } from '@playwright/test';
import {
  POLYMER_TOGGLER,
  RNA_TAB,
  SUGAR,
  BASE,
  PHOSPHATE,
  BUTTON__ADD_TO_PRESETS,
} from '../../../constants/testIdConstants';

/* 
Test case: #3063 - Add e2e tests for Macromolecule editor
*/

test('Add new preset', async ({ page }) => {
  await page.goto('');

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

  // Click on <div> "Phosphate Not selected"
  await page.getByTestId(PHOSPHATE).click();

  // Click on <div> "bP ★"
  await page.click('[data-testid="bP___Boranophosphate"]');

  // Click on <button> "Add to Presets"
  await page.getByTestId(BUTTON__ADD_TO_PRESETS).click();

  await page.screenshot({
    path: 'tests/Macromolecule-editor/screenshots/rnaBuilder.png',
  });
});
