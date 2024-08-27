import { Page } from '@playwright/test';
import {
  CHEM_TAB,
  FAVORITES_TAB,
  PEPTIDES_TAB,
  RNA_TAB,
} from '@constants/testIdConstants';

export async function goToRNATab(page: Page) {
  await page.getByTestId(FAVORITES_TAB).click();
  await page.getByTestId(RNA_TAB).click();
}
export async function goToCHEMTab(page: Page) {
  await page.getByTestId(CHEM_TAB).click();
}

export async function goToPeptidesTab(page: Page) {
  await page.getByTestId(PEPTIDES_TAB).click();
}
