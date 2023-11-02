import { Page, test } from '@playwright/test';
import {
  BondTypeName,
  clickInTheMiddleOfTheScreen,
  doubleClickOnAtom,
  pressButton,
  selectBond,
  takeEditorScreenshot,
  waitForAtomPropsModal,
  waitForPageInit,
} from '@utils';
import {
  checkSmartsValue,
  setAtomicMass,
  setCharge,
  setLabel,
  setValence,
} from '../utils';

const defaultFileFormat = 'MDL Molfile V2000';

async function drawStructure(page: Page, numberOfClicks: number) {
  await selectBond(BondTypeName.Single, page);
  for (let i = 0; i < numberOfClicks; i++) {
    await clickInTheMiddleOfTheScreen(page);
  }
}

async function setAndCheckAtomProperties(
  page: Page,
  setProperty: (arg0: Page, arg1: string) => Promise<void>,
  value: string,
  expectedSmarts: string,
) {
  await setProperty(page, value);
  await pressButton(page, 'Apply');
  await takeEditorScreenshot(page);
  await checkSmartsValue(page, defaultFileFormat, expectedSmarts);
}

test.describe('Checking atom properties attributes in SMARTS format', () => {
  test.beforeEach(async ({ page }) => {
    const numberOfAtom = 0;
    const numberOfBondsAtStructure = 3;
    await waitForPageInit(page);
    await drawStructure(page, numberOfBondsAtStructure);
    await page.keyboard.press('Escape');
    await doubleClickOnAtom(page, 'C', numberOfAtom);
    await waitForAtomPropsModal(page);
  });

  test('Setting atom label and checking the atom number', async ({ page }) => {
    await setAndCheckAtomProperties(
      page,
      setLabel,
      'Cr',
      '[#6](-[#6])(-[#24])-[#6]',
    );
  });

  test('Setting positive charge', async ({ page }) => {
    await setAndCheckAtomProperties(
      page,
      setCharge,
      '10',
      '[#6](-[#6])(-[#6;+10])-[#6]',
    );
  });

  test('Setting negative charge', async ({ page }) => {
    await setAndCheckAtomProperties(
      page,
      setCharge,
      '-15',
      '[#6](-[#6])(-[#6;-15])-[#6]',
    );
  });

  test('Setting atomic mass', async ({ page }) => {
    await setAndCheckAtomProperties(
      page,
      setAtomicMass,
      '30',
      '[#6](-[#6])(-[#6;30])-[#6]',
    );
  });

  test('Setting valence', async ({ page }) => {
    test.fail();
    /**
     * This test will fail until https://github.com/epam/Indigo/issues/1362 is fixed
     */
    await setAndCheckAtomProperties(
      page,
      setValence,
      'IV',
      '[#6](-[#6])(-[#6;v4])-[#6]',
    );
  });
});
