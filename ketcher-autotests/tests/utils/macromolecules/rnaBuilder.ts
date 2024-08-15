import { Page } from '@playwright/test';
import { turnOnMacromoleculesEditor } from '.';
import { RNA_TAB } from '@constants/testIdConstants';

export async function toggleRnaBuilderAccordion(page: Page) {
  await page.getByText('RNA Builder').locator('button').click();
}

export async function gotoRNA(page: Page) {
  await turnOnMacromoleculesEditor(page);
  await page.getByTestId(RNA_TAB).click();
  await toggleRnaBuilderAccordion(page);
}

export async function toggleSugarsAccordion(page: Page) {
  await page.getByTestId('summary-Sugars').click();
}

export async function toggleBasesAccordion(page: Page) {
  await page.getByTestId('summary-Bases').click();
}

export async function togglePhosphatesAccordion(page: Page) {
  await page.getByTestId('summary-Phosphates').click();
}

export async function togglePresetsAccordion(page: Page) {
  await page.getByTestId('summary-Presets').click();
}

export async function toggleNucleotidesAccordion(page: Page) {
  await page.getByTestId('summary-Nucleotides').click();
}

export async function pressNewPresetButton(page: Page) {
  await page.getByRole('button', { name: 'New Preset' }).click();
}

export async function selectSugarSlot(page: Page) {
  await page.getByTestId('rna-builder-slot--sugar').click();
}

export async function selectBaseSlot(page: Page) {
  await page.getByTestId('rna-builder-slot--base').click();
}

export async function selectPhosphateSlot(page: Page) {
  await page.getByTestId('rna-builder-slot--phosphate').click();
}

export async function pressAddToPresetsButton(page: Page) {
  await page.getByTestId('add-to-presets-btn').click();
}
