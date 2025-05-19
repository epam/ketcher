import { Bases } from '@constants/monomers/Bases';
import { Chem } from '@constants/monomers/Chem';
import { Nucleotides } from '@constants/monomers/Nucleotides';
import { Peptides } from '@constants/monomers/Peptides';
import { Phosphates } from '@constants/monomers/Phosphates';
import { Presets } from '@constants/monomers/Presets';
import { Sugars } from '@constants/monomers/Sugars';
import { Page, expect } from '@playwright/test';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import {
  Monomer,
  STRUCTURE_LIBRARY_BUTTON_NAME,
  clickInTheMiddleOfTheScreen,
  clickOnCanvas,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  moveMouseToTheMiddleOfTheScreen,
  pressButton,
} from '@utils';
import {
  MonomerLocationTabs,
  goToMonomerLocationTab,
} from '@utils/macromolecules/library';
import { ElementLabel } from 'ketcher-core';

export enum SaltsAndSolvents {
  AceticAcid = 'acetic acid',
  AceticAnhydride = 'acetic anhydride',
  FormicAcid = 'formic acid',
  MethaneSulphonicAcid = 'methane sulphonic acid',
  PropionicAcid = 'propionic acid',
  Propanediol12 = '1,2-propanediol',
  Propanediol13 = '1,3-propanediol',
  Butanediol14 = '1,4-butanediol',
  Butanol1 = '1-butanol',
  Propanol1 = '1-propanol',
  Butanol2 = '2-butanol',
  Ethylhexanol2 = '2-ethylhexanol',
  DMF = 'DMF',
  DBU = '1,5-diazabicyclo[5.4.0]undec-7-ene',
  Isobutanol = 'isobutanol',
  Glycerol = 'glycerol',
  TButanol = 't-butanol',
  Sulfolane = 'sulfolane',
}

export enum FunctionalGroups {
  Ac = 'Ac',
  Bn = 'Bn',
  Boc = 'Boc',
  Bu = 'Bu',
  Bz = 'Bz',
  Cbz = 'Cbz',
  C2H5 = 'C2H5',
  CCl3 = 'CCl3',
  CF3 = 'CF3',
  CN = 'CN',
  CO2Et = 'CO2Et',
  CO2H = 'CO2H',
  CO2Me = 'CO2Me',
  CONH2 = 'CONH2',
  CO2Pr = 'CO2Pr',
  CO2tBu = 'CO2tBu',
  Cp = 'Cp',
  CPh3 = 'CPh3',
  Cy = 'Cy',
  Et = 'Et',
  FMOC = 'FMOC',
  IBu = 'iBu',
  Indole = 'Indole',
  IPr = 'iPr',
  Me = 'Me',
  Mes = 'Mes',
  Ms = 'Ms',
  NCO = 'NCO',
  NCS = 'NCS',
  NHPh = 'NHPh',
  NO2 = 'NO2',
  OAc = 'OAc',
  OCF3 = 'OCF3',
  OCN = 'OCN',
  OEt = 'OEt',
  OMe = 'OMe',
  Ph = 'Ph',
  PhCOOH = 'PhCOOH',
  Piv = 'Piv',
  PO2 = 'PO2',
  PO3 = 'PO3',
  PO3H2 = 'PO3H2',
  PO4 = 'PO4',
  PO4H2 = 'PO4H2',
  Pr = 'Pr',
  SBu = 'sBu',
  SCN = 'SCN',
  SO2 = 'SO2',
  SO2Cl = 'SO2Cl',
  SO2H = 'SO2H',
  SO3 = 'SO3',
  SO3H = 'SO3H',
  Tf = 'Tf',
}

export enum TemplateLibrary {
  Azulene = 'Azulene',
  Naphtalene = 'Naphtalene',
  Anthracene = 'Anthracene',
  Arabinofuranose = 'Arabinofuranose',
}

export enum RnaPartDropDown {
  Sugars = 'summary-Sugars',
  Bases = 'summary-Bases',
  Phosphates = 'summary-Phosphates',
}

const monomerTabMapping: Partial<Record<MonomerLocationTabs, Monomer[]>> = {
  [MonomerLocationTabs.BASES]: Object.values(Bases),
  [MonomerLocationTabs.CHEM]: Object.values(Chem),
  [MonomerLocationTabs.NUCLEOTIDES]: Object.values(Nucleotides),
  [MonomerLocationTabs.PHOSPHATES]: Object.values(Phosphates),
  [MonomerLocationTabs.PEPTIDES]: Object.values(Peptides),
  [MonomerLocationTabs.PRESETS]: Object.values(Presets),
  [MonomerLocationTabs.SUGARS]: Object.values(Sugars),
};

const getMonomerLocationTabNameBymonomer = (
  monomer: Monomer,
): MonomerLocationTabs => {
  for (const [tabName, tabmonomers] of Object.entries(monomerTabMapping)) {
    if (tabmonomers.includes(monomer)) {
      return tabName as MonomerLocationTabs;
    }
  }

  throw new Error(
    `MonomerLocationTab is not defined for monomer ${monomer.testId}`,
  );
};

/**
 * Selects a monomer by navigating to the corresponding tab and clicking on the monomer.
 * If the monomer belongs to an RNA-specific accordion group, it expands the accordion item.
 */
export async function selectMonomer(
  page: Page,
  monomer: Monomer,
  selectOnFavoritesTab = false,
) {
  const tab = selectOnFavoritesTab
    ? MonomerLocationTabs.Favorites
    : getMonomerLocationTabNameBymonomer(monomer);

  await goToMonomerLocationTab(page, tab);
  await page.getByTestId(monomer.testId).click();
}

/**
 * Selects a custom preset by navigating to the Presets tab and clicking on the preset.
 */
export async function selectCustomPreset(page: Page, presetTestId: string) {
  await goToMonomerLocationTab(page, MonomerLocationTabs.PRESETS);
  await page.getByTestId(presetTestId).click();
}

/**
 * Adds a monomer to favorites by navigating to the corresponding tab and clicking on the monomer's favorite icon.
 * If the monomer belongs to an RNA-specific accordion group, it expands the accordion item.
 */
export async function addMonomerToFavorites(page: Page, monomer: Monomer) {
  const tab = getMonomerLocationTabNameBymonomer(monomer);
  await goToMonomerLocationTab(page, tab);

  const favoritesStar = page.getByTestId(monomer.testId).getByText('★');
  const isFavorite = (await favoritesStar.getAttribute('class'))?.includes(
    'visible',
  );

  if (!isFavorite) {
    await favoritesStar.click();
  }
}

/**
 * Removes a monomer from favorites by navigating to the Favorites tab and clicking on the monomer's favorite icon.
 */
export async function removeMonomerFromFavorites(
  page: Page,
  monomer: Monomer,
  removeFromFavoritesTab = true,
) {
  const tab = removeFromFavoritesTab
    ? MonomerLocationTabs.Favorites
    : getMonomerLocationTabNameBymonomer(monomer);

  await goToMonomerLocationTab(page, tab);

  const favoritesStar = page.getByTestId(monomer.testId).getByText('★');
  const isFavorite = (await favoritesStar.getAttribute('class'))?.includes(
    'visible',
  );

  if (isFavorite) {
    await favoritesStar.click();
  }
}

/**
 * Selects multiple monomers by iterating through the provided list of monomers.
 * For each monomer, it navigates to the corresponding tab and clicks on the monomer.
 * If a monomer belongs to an RNA-specific accordion group, it expands the accordion item.
 */
export async function selectMonomers(page: Page, monomers: Array<Monomer>) {
  for (const monomer of monomers) {
    await selectMonomer(page, monomer);
  }
}

/**
 * Adds multiple monomers to favorites by iterating through the provided list of monomers.
 * For each monomer, it navigates to the corresponding tab, expands the accordion (if needed),
 * and clicks on the monomer's favorite icon.
 */
export async function addMonomersToFavorites(
  page: Page,
  monomers: Array<Monomer>,
) {
  for (const monomer of monomers) {
    await addMonomerToFavorites(page, monomer);
  }
}

/**
 * Removes multiple monomers from favorites by iterating through the provided list of monomers.
 */
export async function removeMonomersFromFavorites(
  page: Page,
  monomers: Array<Monomer>,
) {
  for (const monomer of monomers) {
    await removeMonomerFromFavorites(page, monomer);
  }
}

export async function selectSaltsAndSolvents(
  saltsAndSolventsGroupName: SaltsAndSolvents,
  page: Page,
) {
  // const amountOfSaltsAndSolvents = 124;
  await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
  await page.getByRole('tab', { name: 'Salts and Solvents' }).click();
  const saltsButton = page
    .locator(`div[title*="${saltsAndSolventsGroupName}"] > div`)
    .first();
  // await expect(
  //   page.locator('[data-testid*="templates-modal"] > div'),
  // ).toHaveCount(amountOfSaltsAndSolvents, {
  //   timeout: 30000,
  // });
  await saltsButton.click();
  // await expect(page.getByTestId('templates-modal')).toHaveCount(0);
}

export async function putAceticAcidOnCanvasByClickingInTheMiddleOfTheScreen(
  page: Page,
) {
  await selectSaltsAndSolvents(SaltsAndSolvents.AceticAcid, page);
  await clickInTheMiddleOfTheScreen(page);
}

export async function selectFunctionalGroups(
  functionalGroupName: FunctionalGroups,
  page: Page,
) {
  const amountOfFunctionalGroups = 62;
  await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
  await page.getByRole('tab', { name: 'Functional Groups' }).click();
  const functionalGroupButton = page
    .locator(`div[title*="${functionalGroupName}"] > div`)
    .first();
  await expect(
    page.locator('[data-testid*="templates-modal"] > div'),
  ).toHaveCount(amountOfFunctionalGroups, {
    timeout: 30000,
  });
  await functionalGroupButton.click();
  await expect(page.getByTestId('templates-modal')).toHaveCount(0);
}

export async function selectFunctionalGroup(
  functionalGroupName: FunctionalGroups,
  page: Page,
) {
  await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
  await page.getByRole('tab', { name: 'Functional Groups' }).click();
  await selectFunctionalGroups(functionalGroupName, page);
}

export async function selectUserTemplate(
  userTemplateName: TemplateLibrary,
  page: Page,
) {
  const userTemplateButton = page
    .locator(`div[title*="${userTemplateName}"] > div`)
    .first();
  await userTemplateButton.click();
}

/*
  Function for selecting Functional Groups and dragging it to a new location on the canvas
  */
export async function drawFGAndDrag(
  itemToChoose: FunctionalGroups,
  shift: number,
  page: Page,
) {
  await selectFunctionalGroups(itemToChoose, page);
  await moveMouseToTheMiddleOfTheScreen(page);
  const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
  const coordinatesWithShift = x + shift;
  await dragMouseTo(coordinatesWithShift, y, page);
}

/*
  Function for selecting Salts and Solvents and dragging it to a new location on the canvas
  */
export async function drawSaltAndDrag(
  itemToChoose: SaltsAndSolvents,
  shift: number,
  page: Page,
) {
  await selectSaltsAndSolvents(itemToChoose, page);
  await moveMouseToTheMiddleOfTheScreen(page);
  const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
  const coordinatesWithShift = x + shift;
  await dragMouseTo(coordinatesWithShift, y, page);
}

/*
  Function for selecting User Templates and dragging it to a new location on the canvas
  */
export async function selectUserTemplatesAndPlaceInTheMiddle(
  itemToChoose: TemplateLibrary,
  page: Page,
) {
  await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
  await page.getByRole('tab', { name: 'Template Library' }).click();
  await page.getByRole('button', { name: 'Aromatics' }).click();
  await selectUserTemplate(itemToChoose, page);
  await clickInTheMiddleOfTheScreen(page);
}

const COORDS_CLICK = {
  x1: 560,
  y1: 330,
  x2: 650,
  y2: 280,
  x3: 720,
  y3: 320,
  x4: 720,
  y4: 400,
  x5: 650,
  y5: 450,
  x6: 560,
  y6: 400,
};

/*
  Function for attaching structures on top of bonds attached on Benzene ring
  */
export async function attachOnTopOfBenzeneBonds(page: Page) {
  await clickOnCanvas(page, COORDS_CLICK.x2, COORDS_CLICK.y2);
  await clickOnCanvas(page, COORDS_CLICK.x3, COORDS_CLICK.y3);
  await clickOnCanvas(page, COORDS_CLICK.x1, COORDS_CLICK.y1);
  await clickOnCanvas(page, COORDS_CLICK.x4, COORDS_CLICK.y4);
  await clickOnCanvas(page, COORDS_CLICK.x5, COORDS_CLICK.y5);
  await clickOnCanvas(page, COORDS_CLICK.x6, COORDS_CLICK.y6);
}

export async function fillFieldByLabel(
  page: Page,
  fieldLabel: string,
  testValue: string,
) {
  await page.getByLabel(fieldLabel).click();
  await page.getByLabel(fieldLabel).fill(testValue);
}

export async function fillFieldByPlaceholder(
  page: Page,
  fieldLabel: string,
  testValue: string,
) {
  await page.getByPlaceholder(fieldLabel).click();
  await page.getByPlaceholder(fieldLabel).fill(testValue);
}

export async function selectAtomsFromPeriodicTable(
  page: Page,
  selectlisting: 'List' | 'Not List',
  elements: ElementLabel[],
) {
  const periodicTableButton = RightToolbar(page).periodicTableButton;

  await periodicTableButton.click();
  await page.getByText(selectlisting, { exact: true }).click();

  for (const element of elements) {
    await page.getByTestId(`${element}-button`).click();
  }

  await page.getByTestId('OK').click();
}
