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

async function drawStructure(page: Page, numberOfClicks: number) {
  await selectBond(BondTypeName.Single, page);
  for (let i = 0; i < numberOfClicks; i++) {
    await clickInTheMiddleOfTheScreen(page);
  }
}

test.describe('Checking atom properties attributes in SMARTS format', () => {
  const defaultFileFormat = 'MDL Molfile V2000';

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
    await setLabel(page, 'Cr');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, defaultFileFormat, '[#6](-[#6])(-[#24])-[#6]');
  });

  test('Setting positive charge', async ({ page }) => {
    await setCharge(page, '10');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(
      page,
      defaultFileFormat,
      '[#6](-[#6])(-[#6;+10])-[#6]',
    );
  });

  test('Setting negative charge', async ({ page }) => {
    await setCharge(page, '-15');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(
      page,
      defaultFileFormat,
      '[#6](-[#6])(-[#6;-15])-[#6]',
    );
  });

  test('Setting atomic mass', async ({ page }) => {
    await setAtomicMass(page, '30');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(
      page,
      defaultFileFormat,
      '[#6](-[#6])(-[#6;30])-[#6]',
    );
  });

  test('Setting valence', async ({ page }) => {
    test.fail();
    /**
     * This test will fail until https://github.com/epam/Indigo/issues/1362 is fixed
     */
    await setValence(page, 'IV');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(
      page,
      defaultFileFormat,
      '[#6](-[#6])(-[#6;v4])-[#6]',
    );
  });
});
