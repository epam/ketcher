import { Page } from '@playwright/test';
import { turnOnMacromoleculesEditor } from '.';
import { CHEM_TAB, RNA_TAB } from '@constants/testIdConstants';

export async function toggleRnaBuilderAccordion(page: Page) {
  await page.getByText('RNA Builder').locator('button').click();
}

export async function gotoRNA(page: Page) {
  await turnOnMacromoleculesEditor(page);
  await page.getByTestId(RNA_TAB).click();
  await toggleRnaBuilderAccordion(page);
}

export async function goToCHEMTab(page: Page) {
  await turnOnMacromoleculesEditor(page);
  await page.getByTestId(CHEM_TAB).click();
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

export async function expandCollapseRnaBuilder(page: Page) {
  await page
    .locator('div')
    .filter({ hasText: /^RNA Builder$/ })
    .getByRole('button')
    .click();
}
