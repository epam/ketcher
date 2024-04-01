import { Page, expect } from '@playwright/test';
import {
  LeftPanelButton,
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  moveMouseToTheMiddleOfTheScreen,
  selectLeftPanelButton,
  takeEditorScreenshot,
  STRUCTURE_LIBRARY_BUTTON_NAME,
  pressButton,
} from '@utils';
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

export enum Sugars {
  TwelveddR = "12ddR___1',2'-Di-Deoxy-Ribose",
  TwentyFiveR = '25R___2,5-Ribose',
  ThreeA6 = "3A6___6-amino-hexanol (3' end)",
  ThreeSS6 = "3SS6___3'-Thiol-Modifier 6 S-S from Glen Research",
}

export async function selectSugar(sugarName: Sugars, page: Page) {
  await page.getByTestId('RNA-TAB').click();
  await page.getByTestId('summary-Sugars').click();
  await page.getByTestId(sugarName).click();
}

export enum Bases {
  Adenine = 'A___Adenine',
  NBebnzylAdenine = 'baA___N-benzyl-adenine',
  TClampOMe = 'clA___T-clamp OMe',
}

export async function selectBase(baseName: Bases, page: Page) {
  await page.getByTestId('RNA-TAB').click();
  await page.getByTestId('summary-Bases').click();
  await page.getByTestId(baseName).click();
}

export enum Phosphates {
  Test6Ph = 'Test-6-Ph___Test-6-AP-Phosphate',
  Phosphate = 'P___Phosphate',
  Boranophosphate = 'bP___Boranophosphate',
}

export async function selectPhosphate(phosphateName: Phosphates, page: Page) {
  await page.getByTestId('RNA-TAB').click();
  await page.getByTestId('summary-Phosphates').click();
  await page.getByTestId(phosphateName).click();
}

export enum RnaPartDropDown {
  Sugars = 'summary-Sugars',
  Bases = 'summary-Bases',
  Phosphates = 'summary-Phosphates',
}

export async function selectMonomer(
  page: Page,
  monomerType: Sugars | Bases | Phosphates,
) {
  const isSugar = Object.values(Sugars).includes(monomerType as Sugars);
  const isBase = Object.values(Bases).includes(monomerType as Bases);
  const isPhosphate = Object.values(Phosphates).includes(
    monomerType as Phosphates,
  );

  if (isSugar) {
    await page.getByTestId(RnaPartDropDown.Sugars).click();
  }
  if (isBase) {
    await page.getByTestId(RnaPartDropDown.Bases).click();
  }
  if (isPhosphate) {
    await page.getByTestId(RnaPartDropDown.Phosphates).click();
  }
  await page.getByTestId(monomerType).click();
}

export async function selectSaltsAndSolvents(
  saltsAndSolventsGroupName: SaltsAndSolvents,
  page: Page,
) {
  const amountOfSaltsAndSolvents = 124;
  await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
  await page.getByRole('tab', { name: 'Salts and Solvents' }).click();
  const saltsButton = page
    .locator(`div[title*="${saltsAndSolventsGroupName}"] > div`)
    .first();
  await expect(
    page.locator('[data-testid*="templates-modal"] > div'),
  ).toHaveCount(amountOfSaltsAndSolvents, {
    timeout: 30000,
  });
  await saltsButton.click();
  await expect(page.getByTestId('templates-modal')).toHaveCount(0);
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
/*
  Function for selecting tool from left panel, click right mouse in the middle of canvas and take
  screenshot
  */
export async function selectLeftPanelToolClickAndScreenshot(
  leftbutton: LeftPanelButton,
  page: Page,
) {
  await selectLeftPanelButton(leftbutton, page);
  await clickInTheMiddleOfTheScreen(page, 'right');
  await takeEditorScreenshot(page);
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
  await page.mouse.click(COORDS_CLICK.x1, COORDS_CLICK.y1);
  await page.mouse.click(COORDS_CLICK.x2, COORDS_CLICK.y2);
  await page.mouse.click(COORDS_CLICK.x3, COORDS_CLICK.y3);
  await page.mouse.click(COORDS_CLICK.x4, COORDS_CLICK.y4);
  await page.mouse.click(COORDS_CLICK.x5, COORDS_CLICK.y5);
  await page.mouse.click(COORDS_CLICK.x6, COORDS_CLICK.y6);
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
  await page.getByTestId('period-table').click();
  await page.getByText(selectlisting, { exact: true }).click();

  for (const element of elements) {
    await page.getByTestId(`${element}-button`).click();
  }

  await page.getByTestId('OK').click();
}
