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
import { checkSmartsValue, setCustomQuery } from '../utils';

async function drawStructure(page: Page) {
  await selectBond(BondTypeName.Single, page);
  await clickInTheMiddleOfTheScreen(page);
  await clickInTheMiddleOfTheScreen(page);
  await clickInTheMiddleOfTheScreen(page);
}

test.describe('Checking custom query in SMARTS format', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await drawStructure(page);
    await page.keyboard.press('Escape');
    await doubleClickOnAtom(page, 'C', 0);
    await waitForAtomPropsModal(page);
  });

  test('Setting custom query - one attribute', async ({ page }) => {
    const customQuery = '#6;x9';
    await setCustomQuery(page, customQuery);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[#6;x9])-[#6]');
  });

  test('Setting custom query - few attributes and logical AND low precedence', async ({
    page,
  }) => {
    const customQuery = 'x5;D0;h9;r3';
    await setCustomQuery(page, customQuery);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[x5;D0;h9;r3])-[#6]');
  });

  test('Setting custom query - logical NOT and AND low precedence', async ({
    page,
  }) => {
    const customQuery = '!C;R3';
    await setCustomQuery(page, customQuery);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[!C;R3])-[#6]');
  });

  test('Setting custom query - logical AND and OR', async ({ page }) => {
    const customQuery = 'x2&D3,D2';
    await setCustomQuery(page, customQuery);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[x2&D3,D2])-[#6]');
  });

  test('Setting custom query - logical OR for aliphatic atoms', async ({
    page,
  }) => {
    const customQuery = 'F,Cl,Br,I';
    await setCustomQuery(page, customQuery);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[#9,#17,#35,#53;A])-[#6]');
  });
});
