import { Page } from '@playwright/test';
import { turnOnMacromoleculesEditor } from '.';
import { CHEM_TAB, PEPTIDES_TAB } from '@constants/testIdConstants';

export async function goToCHEMTab(page: Page) {
  await turnOnMacromoleculesEditor(page);
  await page.getByTestId(CHEM_TAB).click();
}

export async function goToPeptidesTab(page: Page) {
  await turnOnMacromoleculesEditor(page);
  await page.getByTestId(PEPTIDES_TAB).click();
}
