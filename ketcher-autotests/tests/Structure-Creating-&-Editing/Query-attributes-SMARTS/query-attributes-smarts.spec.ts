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
  setAromaticity,
  setChirality,
  setConnectivity,
  setHCount,
  setImplicitHCount,
  setRingBondCount,
  setRingMembership,
  setRingSize,
  setSubstitutionCount,
} from './utils';

async function drawStructure(page: Page) {
  await selectBond(BondTypeName.Single, page);
  await clickInTheMiddleOfTheScreen(page);
  await clickInTheMiddleOfTheScreen(page);
  await clickInTheMiddleOfTheScreen(page);
}

test.describe('Query features', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await drawStructure(page);
    await page.keyboard.press('Escape');
    await doubleClickOnAtom(page, 'C', 0);
    await waitForAtomPropsModal(page);
    await page.getByTestId('Query specific-section').click();
  });

  test('Setting ring bond count', async ({ page }) => {
    await setRingBondCount(page, '2');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[#6;x2])-[#6]');
  });

  test('Setting H count', async ({ page }) => {
    await setHCount(page, '3');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[#6;H3])-[#6]');
  });

  test('Setting substitution count', async ({ page }) => {
    await setSubstitutionCount(page, '4');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[#6;D4])-[#6]');
  });

  test('Setting aromacity - aromatic', async ({ page }) => {
    /**
     * TODO: add expected SMARTS representative when https://github.com/epam/Indigo/issues/1329 would be fixed
     */
    await setAromaticity(page, 'aromatic');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '');
  });

  test('Setting aromacity - aliphatic', async ({ page }) => {
    /**
     * TODO: add expected SMARTS representative when https://github.com/epam/Indigo/issues/1329 would be fixed
     */
    await setAromaticity(page, 'aliphatic');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '');
  });

  test('Setting implicit H count', async ({ page }) => {
    /**
     * TODO: add expected SMARTS representative when https://github.com/epam/Indigo/issues/1330 would be fixed
     */
    await setImplicitHCount(page, '5');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '');
  });

  test('Setting ring membership', async ({ page }) => {
    await setRingMembership(page, '6');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[#6;R6])-[#6]');
  });

  test('Setting ring size', async ({ page }) => {
    await setRingSize(page, '7');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[#6;r7])-[#6]');
  });

  test('Setting connectivity', async ({ page }) => {
    await setConnectivity(page, '8');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[#6;X8])-[#6]');
  });

  test('Setting chirality', async ({ page }) => {
    /**
     * TODO: add expected SMARTS representative when https://github.com/epam/Indigo/issues/1328 would be fixed
     */
    await setChirality(page, 'anticlockwise');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '');
  });
});
