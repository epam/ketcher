import { Page, expect } from '@playwright/test';
import { BottomToolbar } from '@tests/pages/molecules/BottomToolbar';
import {
  clickInTheMiddleOfTheScreen,
  clickOnCanvas,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  moveMouseToTheMiddleOfTheScreen,
} from '@utils';

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
  PHEDPhenylalanine = 'PHE-D-Phenylalanine',
  PHELPhenylalanine = 'PHE-L-Phenylalanine',
}

export async function selectSaltsAndSolvents(
  saltsAndSolventsGroupName: SaltsAndSolvents,
  page: Page,
) {
  // const amountOfSaltsAndSolvents = 124;
  await BottomToolbar(page).StructureLibrary();
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
  await BottomToolbar(page).StructureLibrary();
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
  await BottomToolbar(page).StructureLibrary();
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
  await BottomToolbar(page).StructureLibrary();
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
