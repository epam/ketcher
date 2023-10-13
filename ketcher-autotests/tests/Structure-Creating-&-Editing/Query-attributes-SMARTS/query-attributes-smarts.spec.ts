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
import { checkSmartsValue, setHCount, setRingBondCount } from './utils';

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
    await setRingBondCount(page, '3');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[#6;x3])-[#6]');
  });

  test('Setting H count', async ({ page }) => {
    await setHCount(page, '2');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[#6;H2])-[#6]');
  });
});
