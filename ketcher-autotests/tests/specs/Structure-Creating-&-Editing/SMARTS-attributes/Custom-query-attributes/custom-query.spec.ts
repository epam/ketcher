import { Page, test } from '@playwright/test';
import {
  doubleClickOnAtom,
  takeEditorScreenshot,
  waitForAtomPropsModal,
  waitForPageInit,
} from '@utils';
import { checkSmartsValue } from '../utils';
import { drawStructure } from '@utils/canvas/drawStructures';
import { AtomPropertiesDialog } from '@tests/pages/molecules/canvas/AtomPropertiesDialog';
import { AtomPropertiesSettings } from '@tests/pages/constants/atomProperties/Constants';

async function setAndCheckCustomQuery(
  page: Page,
  options: AtomPropertiesSettings,
  expectedSmarts: string,
) {
  await AtomPropertiesDialog(page).setOptions(options);
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
    await setAndCheckCustomQuery(
      page,
      {
        CustomQuery: {
          CustomQueryCheckbox: true,
          CustomQueryTextArea: '#6;x9',
        },
      },
      '[#6](-[#6])(-[#6;x9])-[#6]',
    );
  });

  test('Setting custom query - few attributes and logical AND low precedence', async ({
    page,
  }) => {
    await setAndCheckCustomQuery(
      page,
      {
        CustomQuery: {
          CustomQueryCheckbox: true,
          CustomQueryTextArea: 'x5;D0;h9;r3',
        },
      },
      '[#6](-[#6])(-[x5;D0;h9;r3])-[#6]',
    );
  });

  test('Setting custom query - logical NOT and AND low precedence', async ({
    page,
  }) => {
    await setAndCheckCustomQuery(
      page,
      {
        CustomQuery: {
          CustomQueryCheckbox: true,
          CustomQueryTextArea: '!C;R3',
        },
      },
      '[#6](-[#6])(-[!C;R3])-[#6]',
    );
  });

  test('Setting custom query - logical AND and OR', async ({ page }) => {
    await setAndCheckCustomQuery(
      page,
      {
        CustomQuery: {
          CustomQueryCheckbox: true,
          CustomQueryTextArea: 'x2&D3,D2',
        },
      },
      '[#6](-[#6])(-[x2&D3,D2])-[#6]',
    );
  });

  test('Setting custom query - logical OR for aliphatic atoms', async ({
    page,
  }) => {
    /**
     * https://github.com/epam/Indigo/issues/1337
     */
    await setAndCheckCustomQuery(
      page,
      {
        CustomQuery: {
          CustomQueryCheckbox: true,
          CustomQueryTextArea: 'F,Cl,Br,I;A',
        },
      },
      '[#6](-[#6])(-[F,Cl,Br,I;A])-[#6]',
    );
  });
});
