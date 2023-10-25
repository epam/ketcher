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
import { checkSmartsValue, setCustomQueryForAtom } from '../utils';

async function drawStructure(page: Page) {
  await selectBond(BondTypeName.Single, page);
  await clickInTheMiddleOfTheScreen(page);
  await clickInTheMiddleOfTheScreen(page);
  await clickInTheMiddleOfTheScreen(page);
}

test.describe('Checking custom query in SMARTS format', () => {
  const defaultFileFormat = 'MDL Molfile V2000';

  test.beforeEach(async ({ page }) => {
    const numberOfAtom = 0;
    await waitForPageInit(page);
    await drawStructure(page);
    await page.keyboard.press('Escape');
    await doubleClickOnAtom(page, 'C', numberOfAtom);
    await waitForAtomPropsModal(page);
  });

  test('Setting custom query - one attribute', async ({ page }) => {
    const customQuery = '#6;x9';
    await setCustomQueryForAtom(page, customQuery);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(
      page,
      defaultFileFormat,
      '[#6](-[#6])(-[#6;x9])-[#6]',
    );
  });

  test('Setting custom query - few attributes and logical AND low precedence', async ({
    page,
  }) => {
    const customQuery = 'x5;D0;h9;r3';
    await setCustomQueryForAtom(page, customQuery);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(
      page,
      defaultFileFormat,
      '[#6](-[#6])(-[x5;D0;h9;r3])-[#6]',
    );
  });

  test('Setting custom query - logical NOT and AND low precedence', async ({
    page,
  }) => {
    const customQuery = '!C;R3';
    await setCustomQueryForAtom(page, customQuery);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(
      page,
      defaultFileFormat,
      '[#6](-[#6])(-[!C;R3])-[#6]',
    );
  });

  test('Setting custom query - logical AND and OR', async ({ page }) => {
    const customQuery = 'x2&D3,D2';
    await setCustomQueryForAtom(page, customQuery);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(
      page,
      defaultFileFormat,
      '[#6](-[#6])(-[x2&D3,D2])-[#6]',
    );
  });

  test('Setting custom query - logical OR for aliphatic atoms', async ({
    page,
  }) => {
    test.fail();
    /**
     * This test will fail until https://github.com/epam/Indigo/issues/1337 is fixed
     */
    const customQuery = 'F,Cl,Br,I';
    await setCustomQueryForAtom(page, customQuery);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await checkSmartsValue(
      page,
      defaultFileFormat,
      '[#6](-[#6])(-[#9,#17,#35,#53;A])-[#6]',
    );
  });
});
