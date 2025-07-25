import { Page, test } from '@playwright/test';
import {
  doubleClickOnAtom,
  takeEditorScreenshot,
  waitForAtomPropsModal,
  waitForPageInit,
} from '@utils';
import { checkSmartsValue } from '../utils';
import { drawStructure } from '@utils/canvas/drawStructures';
import { setCustomQueryForAtom } from '@tests/pages/molecules/canvas/AtomPropertiesDialog';

async function setAndCheckCustomQuery(
  page: Page,
  value: string,
  expectedSmarts: string,
) {
  await setCustomQueryForAtom(page, value);
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
      customQuery,
      '[#6](-[#6])(-[!C;R3])-[#6]',
    );
  });

  test('Setting custom query - logical AND and OR', async ({ page }) => {
    const customQuery = 'x2&D3,D2';
    await setAndCheckCustomQuery(
      page,
      customQuery,
      '[#6](-[#6])(-[x2&D3,D2])-[#6]',
    );
  });

  test('Setting custom query - logical OR for aliphatic atoms', async ({
    page,
  }) => {
    /**
     * https://github.com/epam/Indigo/issues/1337
     */
    const customQuery = 'F,Cl,Br,I;A';
    await setAndCheckCustomQuery(
      page,
      customQuery,
      '[#6](-[#6])(-[F,Cl,Br,I;A])-[#6]',
    );
  });
});
