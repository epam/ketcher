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
  checkSmartsWarnings,
  setAromaticity,
  setChirality,
  setConnectivity,
  setHCount,
  setImplicitHCount,
  setRingBondCount,
  setRingMembership,
  setRingSize,
  setSubstitutionCount,
  setUnsaturated,
} from '../utils';

const defaultFileFormat = 'MDL Molfile V2000';

async function drawStructure(page: Page) {
  await selectBond(BondTypeName.Single, page);
  await clickInTheMiddleOfTheScreen(page);
  await clickInTheMiddleOfTheScreen(page);
  await clickInTheMiddleOfTheScreen(page);
}

async function setAndCheckQuerySpecificProperties(
  page: Page,
  setProperty: (arg0: Page, arg1: any) => Promise<void>,
  value: string,
  expectedSmarts: string,
) {
  await setProperty(page, value);
  await pressButton(page, 'Apply');
  await takeEditorScreenshot(page);
  await checkSmartsValue(page, defaultFileFormat, expectedSmarts);
}

test.describe('Checking query specific attributes in SMARTS format', () => {
  test.beforeEach(async ({ page }) => {
    const numberOfAtom = 0;
    await waitForPageInit(page);
    await drawStructure(page);
    await page.keyboard.press('Escape');
    await doubleClickOnAtom(page, 'C', numberOfAtom);
    await waitForAtomPropsModal(page);
    await page.getByTestId('Query specific-section').click();
  });

  test('Setting ring bond count', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      setRingBondCount,
      '2',
      '[#6](-[#6])(-[#6;x2])-[#6]',
    );
  });

  test('Setting ring bond count - As drawn', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      setRingBondCount,
      'As drawn',
      '[#6](-[#6])(-[#6;x0])-[#6]',
    );
  });

  test('Setting H count', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      setHCount,
      '3',
      '[#6](-[#6])(-[#6;H3])-[#6]',
    );
  });

  test('Setting substitution count', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      setSubstitutionCount,
      '4',
      '[#6](-[#6])(-[#6;D4])-[#6]',
    );
  });

  test('Setting unsaturated', async ({ page }) => {
    await setUnsaturated(page);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(
      page,
      defaultFileFormat,
      '[#6](-[#6])(-[#6;$([*,#1]=,#,:[*,#1])])-[#6]',
    );
    await checkSmartsWarnings(page);
  });

  test('Setting aromacity - aromatic', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      setAromaticity,
      'aromatic',
      '[#6](-[#6])(-[c])-[#6]',
    );
  });

  test('Setting aromacity - aliphatic', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      setAromaticity,
      'aliphatic',
      '[#6](-[#6])(-[C])-[#6]',
    );
  });

  test('Setting implicit H count', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      setImplicitHCount,
      '5',
      '[#6](-[#6])(-[#6;h5])-[#6]',
    );
  });

  test('Setting ring membership', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      setRingMembership,
      '6',
      '[#6](-[#6])(-[#6;R6])-[#6]',
    );
  });

  test('Setting ring size', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      setRingSize,
      '7',
      '[#6](-[#6])(-[#6;r7])-[#6]',
    );
  });

  test('Setting connectivity', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      setConnectivity,
      '8',
      '[#6](-[#6])(-[#6;X8])-[#6]',
    );
  });

  test('Setting chirality - anticlockwise', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      setChirality,
      'anticlockwise',
      '[#6](-[#6])(-[#6;@])-[#6]',
    );
  });

  test('Setting chirality - clockwise', async ({ page }) => {
    await setAndCheckQuerySpecificProperties(
      page,
      setChirality,
      'clockwise',
      '[#6](-[#6])(-[#6;@@])-[#6]',
    );
  });
});
