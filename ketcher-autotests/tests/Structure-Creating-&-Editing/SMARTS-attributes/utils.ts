import { Page, expect } from '@playwright/test';
import { TopPanelButton, selectTopPanelButton } from '@utils';

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

// Query specific attributes:

export async function setRingBondCount(page: Page, value: string) {
  await page.getByTestId('ringBondCount-input').click();
  await page.getByRole('option', { name: value }).click();
}

export async function setHCount(page: Page, hCount: queryNumberValues) {
  await page.getByTestId('hCount-input').click();
  await page.getByRole('option', { name: hCount }).click();
}

export async function setSubstitutionCount(
  page: Page,
  substitutionCount: queryNumberValues,
) {
  await page.getByTestId('substitutionCount-input').click();
  await page.getByRole('option', { name: substitutionCount }).click();
}

export async function setUnsaturated(page: Page) {
  await page.getByTestId('file-name-input').check();
}

export async function setImplicitHCount(
  page: Page,
  implicitHCount: queryNumberValues,
) {
  await page.getByTestId('implicitHCount-input').click();
  await page.getByRole('option', { name: implicitHCount }).click();
}

export async function setRingMembership(
  page: Page,
  ringMembership: queryNumberValues,
) {
  await page.getByTestId('ringMembership-input').click();
  await page.getByRole('option', { name: ringMembership }).click();
}

export async function setRingSize(page: Page, ringSize: queryNumberValues) {
  await page.getByTestId('ringSize-input').click();
  await page.getByRole('option', { name: ringSize }).click();
}

export async function setConnectivity(
  page: Page,
  connectivity: queryNumberValues,
) {
  await page.getByTestId('connectivity-input').click();
  await page.getByRole('option', { name: connectivity }).click();
}

export async function setAromaticity(page: Page, aromaticity: aromaticity) {
  await page.getByTestId('aromaticity-input').click();
  await page.getByRole('option', { name: aromaticity }).click();
}

export async function setChirality(page: Page, chirality: chirality) {
  await page.getByTestId('chirality-input').click();
  await page.getByRole('option', { name: chirality, exact: true }).click();
}

// Custom query - atom properties:

export async function setCustomQueryForAtom(page: Page, customQuery: string) {
  await page.getByTestId('custom-query-checkbox').check();
  await page.getByTestId('atom-custom-query').fill(customQuery);
}

// Custom query - bond properties:

export async function setCustomQueryForBond(page: Page, customQuery: string) {
  await page.getByTestId('custom-query-checkbox').check();
  await page.getByTestId('bond-custom-query').fill(customQuery);
}

// Bond attributes:

export async function setBondType(page: Page, bondTypeTestId: string) {
  await page.getByTestId('type-input').click();
  await page.getByTestId(bondTypeTestId).click();
}

export async function setBondTopology(page: Page, bondTopologyTestId: string) {
  await page.getByTestId('topology-input').click();
  await page.getByTestId(bondTopologyTestId).click();
}

export async function checkSmartsValue(page: Page, value: string) {
  await selectTopPanelButton(TopPanelButton.Save, page);
  await page.getByRole('button', { name: 'MDL Molfile V2000' }).click();
  await page.getByRole('option', { name: 'Daylight SMARTS' }).click();
  const smartsInput = page.getByTestId('smarts-preview-area-text');
  await expect(smartsInput).toHaveValue(value);
}

export async function checkSmartsWarnings(page: Page) {
  const value =
    'Structure contains query properties of atoms and bonds that are not supported in the SMARTS. Query properties will not be reflected in the file saved.';
  await page.getByTestId('warnings-tab').click();
  const warningTextArea = await page.getByTestId('WarningTextArea');
  const warningText = await warningTextArea.evaluate(
    (node) => node.textContent,
  );
  expect(warningText).toEqual(value);
}
