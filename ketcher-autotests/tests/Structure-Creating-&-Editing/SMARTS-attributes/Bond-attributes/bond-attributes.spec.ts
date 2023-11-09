import { Page, test, expect } from '@playwright/test';
import {
  BondType,
  BondTypeName,
  clickInTheMiddleOfTheScreen,
  doubleClickOnBond,
  pressButton,
  selectBond,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import {
  checkSmartsValue,
  checkSmartsWarnings,
  setBondTopology,
  setBondType,
  setCustomQuery,
} from '../utils';

const defaultFileFormat = 'MDL Molfile V2000';

async function drawStructure(page: Page) {
  await selectBond(BondTypeName.Single, page);
  await clickInTheMiddleOfTheScreen(page);
  await clickInTheMiddleOfTheScreen(page);
  await clickInTheMiddleOfTheScreen(page);
}

async function setAndCheckBondProperties(
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

async function waitForBondPropsModal(page: Page) {
  await expect(page.getByTestId('bondProps-dialog')).toBeVisible();
}

test.describe('Checking bond attributes in SMARTS format', () => {
  test.beforeEach(async ({ page }) => {
    const numberOfBond = 2;
    await waitForPageInit(page);
    await drawStructure(page);
    await page.keyboard.press('Escape');
    await doubleClickOnBond(page, BondType.SINGLE, numberOfBond);
    await waitForBondPropsModal(page);
  });

  // Tests for bond type:

  test('Setting bond type - single (aliphatic))', async ({ page }) => {
    await setAndCheckBondProperties(
      page,
      setBondType,
      'Single-option',
      '[#6](-[#6])(-[#6])-[#6]',
    );
  });

  test('Setting bond type - single up', async ({ page }) => {
    await setAndCheckBondProperties(
      page,
      setBondType,
      'Single Up-option',
      '[#6@](-[#6])(-[#6])/[#6]',
    );
  });

  test('Setting bond type - single down', async ({ page }) => {
    await setAndCheckBondProperties(
      page,
      setBondType,
      'Single Down-option',
      '[#6@@](-[#6])(-[#6])\\[#6]',
    );
  });

  test('Setting bond type - single up/down', async ({ page }) => {
    test.fail();
    /**
     * This test will fail until https://github.com/epam/Indigo/issues/1371 is fixed
     */
    await setAndCheckBondProperties(
      page,
      setBondType,
      'Single Up/Down-option',
      '[#6](-[#6])(-[#6])-[#6]',
    );
  });

  test('Setting bond type - double', async ({ page }) => {
    await setAndCheckBondProperties(
      page,
      setBondType,
      'Double-option',
      '[#6](-[#6])(-[#6])=[#6]',
    );
  });

  test('Setting bond type - double cis/trans', async ({ page }) => {
    test.fail();
    /**
     * This test will fail until https://github.com/epam/Indigo/issues/1371 is fixed
     */
    await setAndCheckBondProperties(
      page,
      setBondType,
      'Double Cis/Trans-option',
      '[#6](-[#6])(-[#6])=[#6]',
    );
  });

  test('Setting bond type - triple', async ({ page }) => {
    await setAndCheckBondProperties(
      page,
      setBondType,
      'Triple-option',
      '[#6](-[#6])(-[#6])#[#6]',
    );
  });

  test('Setting bond type - aromatic', async ({ page }) => {
    await setAndCheckBondProperties(
      page,
      setBondType,
      'Aromatic-option',
      '[#6](-[#6])(-[#6]):[#6]',
    );
  });

  test('Setting bond type - any', async ({ page }) => {
    await setAndCheckBondProperties(
      page,
      setBondType,
      'Any-option',
      '[#6](-[#6])(-[#6])~[#6]',
    );
  });

  test('Setting bond type - hydrogen', async ({ page }) => {
    await setAndCheckBondProperties(
      page,
      setBondType,
      'Hydrogen-option',
      '[#6](-[#6])(-[#6])[#6]',
    );
    await checkSmartsWarnings(page);
  });

  test('Setting bond type - single/double', async ({ page }) => {
    await setAndCheckBondProperties(
      page,
      setBondType,
      'Single/Double-option',
      '[#6](-[#6])(-[#6])!:;-,=[#6]',
    );
  });

  test('Setting bond type - single/aromatic', async ({ page }) => {
    await setAndCheckBondProperties(
      page,
      setBondType,
      'Single/Aromatic-option',
      '[#6](-[#6])(-[#6])-,:[#6]',
    );
  });

  test('Setting bond type - double/aromatic', async ({ page }) => {
    await setAndCheckBondProperties(
      page,
      setBondType,
      'Double/Aromatic-option',
      '[#6](-[#6])(-[#6])=,:[#6]',
    );
  });

  test('Setting bond type - dative', async ({ page }) => {
    await setAndCheckBondProperties(
      page,
      setBondType,
      'Dative-option',
      '[#6](-[#6])(-[#6])[#6]',
    );
    await checkSmartsWarnings(page);
  });

  // Tests for bond topology:

  test('Setting bond topology - ring', async ({ page }) => {
    await setAndCheckBondProperties(
      page,
      setBondTopology,
      'Ring-option',
      '[#6](-[#6])(-[#6])-;@[#6]',
    );
  });

  test('Setting bond topology - chain', async ({ page }) => {
    await setAndCheckBondProperties(
      page,
      setBondTopology,
      'Chain-option',
      '[#6](-[#6])(-[#6])-;!@[#6]',
    );
  });

  // Custom query for bond

  test('Setting custom query - any OR double', async ({ page }) => {
    test.fail();
    /**
     * This test will fail until https://github.com/epam/Indigo/issues/1372 is fixed
     */
    await setAndCheckBondProperties(
      page,
      setCustomQuery,
      '~,=',
      '[#6](-[#6])(-[#6])~,=[#6]',
    );
  });
});
