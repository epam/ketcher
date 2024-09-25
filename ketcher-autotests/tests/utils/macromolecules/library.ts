import { Page } from '@playwright/test';
import {
  CHEM_TAB,
  FAVORITES_TAB,
  PEPTIDES_TAB,
  RNA_TAB,
} from '@constants/testIdConstants';
import {
  toggleSugarsAccordion,
  toggleBasesAccordion,
  togglePhosphatesAccordion,
  toggleNucleotidesAccordion,
} from './rnaBuilder';

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

export enum MonomerLocationTabs {
  PEPTIDES = 'Peptides',
  PRESETS = 'Presets',
  SUGARS = 'Sugars',
  BASES = 'Bases',
  PHOSPHATES = 'Phosphates',
  NUCLEOTIDES = 'Nucleotides',
  CHEM = 'CHEM',
}

export async function goToMonomerLocationTab(
  page: Page,
  monomerLocation: MonomerLocationTabs,
) {
  switch (monomerLocation) {
    case 'Peptides':
      await goToPeptidesTab(page);
      break;
    case 'Presets':
      await goToRNATab(page);
      // Presets tab openned by default
      break;
    case 'Sugars':
      await goToRNATab(page);
      await toggleSugarsAccordion(page);
      break;
    case 'Bases':
      await goToRNATab(page);
      await toggleBasesAccordion(page);
      break;
    case 'Phosphates':
      await goToRNATab(page);
      await togglePhosphatesAccordion(page);
      break;
    case 'Nucleotides':
      await toggleNucleotidesAccordion(page);
      break;
    case 'CHEM':
      await goToCHEMTab(page);
      break;
    default:
      await goToRNATab(page);
      break;
  }
}
