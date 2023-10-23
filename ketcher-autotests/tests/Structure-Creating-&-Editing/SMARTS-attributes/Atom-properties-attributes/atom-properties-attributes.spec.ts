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

async function drawStructure(page: Page) {
  await selectBond(BondTypeName.Single, page);
  await clickInTheMiddleOfTheScreen(page);
  await clickInTheMiddleOfTheScreen(page);
  await clickInTheMiddleOfTheScreen(page);
}

test.describe('Checking atom properties attributes in SMARTS format', () => {
  test.beforeEach(async ({ page }) => {
    const numberOfAtom = 0;
    await waitForPageInit(page);
    await drawStructure(page);
    await page.keyboard.press('Escape');
    await doubleClickOnAtom(page, 'C', numberOfAtom);
    await waitForAtomPropsModal(page);
  });

  test('Setting atom label and checking the atom number', async ({ page }) => {
    await setLabel(page, 'Cr');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[#24])-[#6]');
  });

  test('Setting positive charge', async ({ page }) => {
    await setCharge(page, '10');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[#6;+10])-[#6]');
  });

  test('Setting negative charge', async ({ page }) => {
    await setCharge(page, '-15');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[#6;-15])-[#6]');
  });

  test('Setting atomic mass', async ({ page }) => {
    await setAtomicMass(page, '30');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[#6;30])-[#6]');
  });

  test('Setting valence', async ({ page }) => {
    await setValence(page, 'IV');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[#6;v4])-[#6]');
  });
});
