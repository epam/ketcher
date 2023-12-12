import { Page, test } from '@playwright/test';
import {
  BondType,
  BondTypeName,
  clickInTheMiddleOfTheScreen,
  doubleClickOnBond,
  pressButton,
  selectBond,
  takeEditorScreenshot,
  waitForBondPropsModal,
  waitForPageInit,
  checkSmartsValue,
  checkSmartsWarnings,
  setBondTopology,
  setBondType,
  setCustomQuery,
} from '@utils';

async function drawStructure(page: Page) {
  await selectBond(BondTypeName.Single, page);
  await clickInTheMiddleOfTheScreen(page);
  await clickInTheMiddleOfTheScreen(page);
  await clickInTheMiddleOfTheScreen(page);
}

async function setAndCheckBondType(
  page: Page,
  bondType: BondTypeName | string,
  expectedSmarts: string,
) {
  await setBondType(page, bondType);
  await pressButton(page, 'Apply');
  await takeEditorScreenshot(page);
  await checkSmartsValue(page, expectedSmarts);
}

async function setAndCheckBondProperties(
  page: Page,
  setProperty: (page: Page, value: string) => Promise<void>,
  value: string,
  expectedSmarts: string,
) {
  await setProperty(page, value);
  await pressButton(page, 'Apply');
  await takeEditorScreenshot(page);
  await checkSmartsValue(page, expectedSmarts);
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
    await setAndCheckBondType(page, 'Single', '[#6](-[#6])(-[#6])-[#6]');
  });

  test('Setting bond type - single up', async ({ page }) => {
    await setAndCheckBondType(
      page,
      BondTypeName.SingleUp,
      '[#6](-[#6])(-[#6])/[#6]',
    );
  });

  test('Setting bond type - single down', async ({ page }) => {
    await setAndCheckBondType(
      page,
      BondTypeName.SingleDown,
      '[#6](-[#6])(-[#6])\\[#6]',
    );
  });

  test('Setting bond type - single up/down', async ({ page }) => {
    await setAndCheckBondType(
      page,
      BondTypeName.SingleUpDown,
      '[#6](-[#6])(-[#6])-[#6]',
    );
  });

  test('Setting bond type - double', async ({ page }) => {
    await setAndCheckBondType(page, 'Double', '[#6](-[#6])(-[#6])=[#6]');
  });

  test('Setting bond type - double cis/trans', async ({ page }) => {
    await setAndCheckBondType(
      page,
      BondTypeName.DoubleCisTrans,
      '[#6](-[#6])(-[#6])=[#6]',
    );
  });

  test('Setting bond type - triple', async ({ page }) => {
    await setAndCheckBondType(
      page,
      BondTypeName.Triple,
      '[#6](-[#6])(-[#6])#[#6]',
    );
  });

  test('Setting bond type - aromatic', async ({ page }) => {
    await setAndCheckBondType(
      page,
      BondTypeName.Aromatic,
      '[#6](-[#6])(-[#6]):[#6]',
    );
  });

  test('Setting bond type - any', async ({ page }) => {
    await setAndCheckBondType(
      page,
      BondTypeName.Any,
      '[#6](-[#6])(-[#6])~[#6]',
    );
  });

  test('Setting bond type - hydrogen', async ({ page }) => {
    await setAndCheckBondType(
      page,
      BondTypeName.Hydrogen,
      '[#6](-[#6])(-[#6])[#6]',
    );
    await checkSmartsWarnings(page);
  });

  test('Setting bond type - single/double', async ({ page }) => {
    await setAndCheckBondType(
      page,
      BondTypeName.SingleDouble,
      '[#6](-[#6])(-[#6])!:;-,=[#6]',
    );
  });

  test('Setting bond type - single/aromatic', async ({ page }) => {
    await setAndCheckBondType(
      page,
      BondTypeName.SingleAromatic,
      '[#6](-[#6])(-[#6])-,:[#6]',
    );
  });

  test('Setting bond type - double/aromatic', async ({ page }) => {
    await setAndCheckBondType(
      page,
      BondTypeName.DoubleAromatic,
      '[#6](-[#6])(-[#6])=,:[#6]',
    );
  });

  test('Setting bond type - dative', async ({ page }) => {
    await setAndCheckBondType(
      page,
      BondTypeName.Dative,
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

  test('Setting custom query - any OR double', async ({ page }) => {
    await setAndCheckBondProperties(
      page,
      setCustomQuery,
      '~,=',
      '[#6](-[#6])(-[#6])~,=[#6]',
    );
  });
});
