import { Page, expect } from '@playwright/test';
import { TopPanelButton, selectTopPanelButton } from '@utils';
import { clickOnFileFormatDropdown } from '@utils/formats';

type queryNumberValues =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9';

type aromaticity = 'aromatic' | 'aliphatic' | '';
type chirality = 'clockwise' | 'anticlockwise' | '';

export async function setAromaticity(page: Page, aromaticity: aromaticity) {
  await page.getByTestId('aromaticity-input-span').click();
  await page.getByRole('option', { name: aromaticity }).click();
}

export async function setCustomQuery(page: Page, customQuery: string) {
  await page.getByTestId('custom-query-checkbox').check();
  await page.getByTestId('custom-query-value').fill(customQuery);
}

export async function setImplicitHCount(
  page: Page,
  implicitHCount: queryNumberValues,
) {
  await page.getByTestId('implicitHCount-input').click();
  await page.getByRole('option', { name: implicitHCount }).click();
}

export async function setChirality(page: Page, chirality: chirality) {
  await page.getByTestId('chirality-input-span').click();
  await page.getByRole('option', { name: chirality, exact: true }).click();
}

export async function checkSmartsValue(page: Page, value: string) {
  await selectTopPanelButton(TopPanelButton.Save, page);
  await clickOnFileFormatDropdown(page);
  await page.getByRole('option', { name: 'Daylight SMARTS' }).click();
  const smartsInput = page.getByTestId('smarts-preview-area-text');
  await expect(smartsInput).toHaveValue(value);
}
