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
  setCustomQueryForBond,
} from '../utils';

async function drawStructure(page: Page) {
  await selectBond(BondTypeName.Single, page);
  await clickInTheMiddleOfTheScreen(page);
  await clickInTheMiddleOfTheScreen(page);
  await clickInTheMiddleOfTheScreen(page);
}

async function waitForBondPropsModal(page: Page) {
  await expect(page.getByTestId('bondProps-dialog')).toBeVisible();
}

test.describe('Checking bond attributes in SMARTS format', () => {
  const defaultFileFormat = 'MDL Molfile V2000';

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
    await setBondType(page, 'Single-option');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, defaultFileFormat, '[#6](-[#6])(-[#6])-[#6]');
  });

  test('Setting bond type - single up', async ({ page }) => {
    await setBondType(page, 'Single Up-option');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, defaultFileFormat, '[#6@](-[#6])(-[#6])/[#6]');
  });

  test('Setting bond type - single down', async ({ page }) => {
    await setBondType(page, 'Single Down-option');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(
      page,
      defaultFileFormat,
      '[#6@@](-[#6])(-[#6])\\[#6]',
    );
  });

  test('Setting bond type - single up/down', async ({ page }) => {
    test.fail();
    /**
     * This test will fail until https://github.com/epam/Indigo/issues/1371 is fixed
     */
    await setBondType(page, 'Single Up/Down-option');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, defaultFileFormat, '[#6](-[#6])(-[#6])-[#6]');
  });

  test('Setting bond type - double', async ({ page }) => {
    await setBondType(page, 'Double-option');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, defaultFileFormat, '[#6](-[#6])(-[#6])=[#6]');
  });

  test('Setting bond type - double cis/trans', async ({ page }) => {
    test.fail();
    /**
     * This test will fail until https://github.com/epam/Indigo/issues/1371 is fixed
     */
    await setBondType(page, 'Double Cis/Trans-option');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, defaultFileFormat, '[#6](-[#6])(-[#6])=[#6]');
  });

  test('Setting bond type - triple', async ({ page }) => {
    await setBondType(page, 'Triple-option');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, defaultFileFormat, '[#6](-[#6])(-[#6])#[#6]');
  });

  test('Setting bond type - aromatic', async ({ page }) => {
    await setBondType(page, 'Aromatic-option');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, defaultFileFormat, '[#6](-[#6])(-[#6]):[#6]');
  });

  test('Setting bond type - any', async ({ page }) => {
    await setBondType(page, 'Any-option');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, defaultFileFormat, '[#6](-[#6])(-[#6])~[#6]');
  });

  test('Setting bond type - hydrogen', async ({ page }) => {
    await setBondType(page, 'Hydrogen-option');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, defaultFileFormat, '[#6](-[#6])(-[#6])[#6]');
    await checkSmartsWarnings(page);
  });

  test('Setting bond type - single/double', async ({ page }) => {
    await setBondType(page, 'Single/Double-option');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(
      page,
      defaultFileFormat,
      '[#6](-[#6])(-[#6])!:;-,=[#6]',
    );
  });

  test('Setting bond type - single/aromatic', async ({ page }) => {
    await setBondType(page, 'Single/Aromatic-option');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(
      page,
      defaultFileFormat,
      '[#6](-[#6])(-[#6])-,:[#6]',
    );
  });

  test('Setting bond type - double/aromatic', async ({ page }) => {
    await setBondType(page, 'Double/Aromatic-option');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(
      page,
      defaultFileFormat,
      '[#6](-[#6])(-[#6])=,:[#6]',
    );
  });

  test('Setting bond type - dative', async ({ page }) => {
    await setBondType(page, 'Dative-option');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, defaultFileFormat, '[#6](-[#6])(-[#6])[#6]');
    await checkSmartsWarnings(page);
  });

  // Tests for bond topology:

  test('Setting bond topology - ring', async ({ page }) => {
    await setBondTopology(page, 'Ring-option');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(
      page,
      defaultFileFormat,
      '[#6](-[#6])(-[#6])-;@[#6]',
    );
  });

  test('Setting bond topology - chain', async ({ page }) => {
    await setBondTopology(page, 'Chain-option');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(
      page,
      defaultFileFormat,
      '[#6](-[#6])(-[#6])-;!@[#6]',
    );
  });

  // Custom query for bond

  test('Setting custom query - any OR double', async ({ page }) => {
    test.fail();
    /**
     * This test will fail until https://github.com/epam/Indigo/issues/1372 is fixed
     */
    await setCustomQueryForBond(page, '~,=');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(
      page,
      defaultFileFormat,
      '[#6](-[#6])(-[#6])~,=[#6]',
    );
  });
});
