import {
  CHEM_TAB,
  FAVORITES_TAB,
  PEPTIDES_TAB,
  RNA_TAB,
} from '@constants/testIdConstants';
import { Page } from '@playwright/test';
import { RnaAccordionType, toggleRnaAccordionItem } from './rnaBuilder';
import { Tabs } from '.';

export type Tabs =
  | typeof FAVORITES_TAB
  | typeof PEPTIDES_TAB
  | typeof RNA_TAB
  | typeof CHEM_TAB;

export const goToRNATab = async (page: Page) => goToTab(page, RNA_TAB);

export const goToCHEMTab = async (page: Page) => goToTab(page, CHEM_TAB);

export const goToPeptidesTab = async (page: Page) =>
  goToTab(page, PEPTIDES_TAB);

export async function goToTab(page: Page, tab: Tabs) {
  if (!(await isTabSelected(page, tab))) {
    await page.getByTestId(tab).click();
  }
}

export async function isTabSelected(
  page: Page,
  tabTestId: string,
): Promise<boolean> {
  const ariaSelected = await page
    .getByTestId(tabTestId)
    .getAttribute('aria-selected');
  return ariaSelected === 'true';
}

export enum MonomerLocationTabs {
  PEPTIDES = 'Peptides',
  PRESETS = 'Presets',
  SUGARS = 'Sugars',
  BASES = 'Bases',
  PHOSPHATES = 'Phosphates',
  NUCLEOTIDES = 'Nucleotides',
  CHEM = 'CHEM',
  Favorites = 'Favorites',
}

type MonomerLocationInfo = {
  tab: Tabs;
  rnaAccordionItem?: RnaAccordionType;
};

const monomerLocationsInfo: Record<MonomerLocationTabs, MonomerLocationInfo> = {
  [MonomerLocationTabs.PEPTIDES]: {
    tab: PEPTIDES_TAB,
  },
  [MonomerLocationTabs.CHEM]: {
    tab: CHEM_TAB,
  },
  [MonomerLocationTabs.PRESETS]: {
    tab: RNA_TAB,
    rnaAccordionItem: 'Presets',
  },
  [MonomerLocationTabs.SUGARS]: {
    tab: RNA_TAB,
    rnaAccordionItem: 'Sugars',
  },
  [MonomerLocationTabs.BASES]: {
    tab: RNA_TAB,
    rnaAccordionItem: 'Bases',
  },
  [MonomerLocationTabs.PHOSPHATES]: {
    tab: RNA_TAB,
    rnaAccordionItem: 'Phosphates',
  },
  [MonomerLocationTabs.NUCLEOTIDES]: {
    tab: RNA_TAB,
    rnaAccordionItem: 'Nucleotides',
  },
  [MonomerLocationTabs.Favorites]: {
    tab: FAVORITES_TAB,
  },
};

export async function goToMonomerLocationTab(
  page: Page,
  monomerLocation: MonomerLocationTabs,
) {
  const { tab, rnaAccordionItem } = monomerLocationsInfo[monomerLocation];

  if (!tab) {
    throw new Error(
      `Can't determine the tab for monomer location ${monomerLocation}`,
    );
  }

  await goToTab(page, tab);

  if (rnaAccordionItem) {
    toggleRnaAccordionItem(page, rnaAccordionItem, 'expand');
  }
}
