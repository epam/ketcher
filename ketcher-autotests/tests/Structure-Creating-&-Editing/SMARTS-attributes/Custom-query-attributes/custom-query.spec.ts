import { Page, test } from '@playwright/test';
import {
  doubleClickOnAtom,
  pressButton,
  takeEditorScreenshot,
  waitForAtomPropsModal,
  waitForPageInit,
} from '@utils';
import { checkSmartsValue, setCustomQueryForAtom } from '../utils';
import { drawStructure } from '@utils/canvas/drawStructures';

async function setAndCheckCustomQuery(
  page: Page,
  setProperty: (arg0: Page, arg1: string) => Promise<void>,
  value: string,
  expectedSmarts: string,
) {
  await setProperty(page, value);
  await pressButton(page, 'Apply');
  await takeEditorScreenshot(page);
  await checkSmartsValue(page, expectedSmarts);
}

test.describe('Checking custom query in SMARTS format', () => {
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
    await setAndCheckCustomQuery(
      page,
      setCustomQueryForAtom,
      customQuery,
      '[#6](-[#6])(-[#6;x9])-[#6]',
    );
  });

  test('Setting custom query - few attributes and logical AND low precedence', async ({
    page,
  }) => {
    const customQuery = 'x5;D0;h9;r3';
    await setAndCheckCustomQuery(
      page,
      setCustomQueryForAtom,
      customQuery,
      '[#6](-[#6])(-[x5;D0;h9;r3])-[#6]',
    );
  });

  test('Setting custom query - logical NOT and AND low precedence', async ({
    page,
  }) => {
    const customQuery = '!C;R3';
    await setAndCheckCustomQuery(
      page,
      setCustomQueryForAtom,
      customQuery,
      '[#6](-[#6])(-[!C;R3])-[#6]',
    );
  });

  test('Setting custom query - logical AND and OR', async ({ page }) => {
    const customQuery = 'x2&D3,D2';
    await setAndCheckCustomQuery(
      page,
      setCustomQueryForAtom,
      customQuery,
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
    await setAndCheckCustomQuery(
      page,
      setCustomQueryForAtom,
      customQuery,
      '[#6](-[#6])(-[#9,#17,#35,#53;A])-[#6]',
    );
  });
});
