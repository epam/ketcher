import { test, expect } from '@fixtures';
import {
  doubleClickOnAtom,
  pasteFromClipboardAndOpenAsNewProject,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { checkSmartsValue } from '../utils';
import { AtomPropertiesDialog } from '@tests/pages/molecules/canvas/AtomPropertiesDialog';

test.describe('Checking custom query in SMARTS format', () => {
  test.beforeEach(async ({ page }) => {
    const numberOfAtom = 0;
    await waitForPageInit(page);
    await pasteFromClipboardAndOpenAsNewProject(page, 'C(C)(C)C');
    await doubleClickOnAtom(page, 'C', numberOfAtom);
    await expect(AtomPropertiesDialog(page).window).toBeVisible();
  });

  test('Setting custom query - one attribute', async ({ page }) => {
    await AtomPropertiesDialog(page).setOptions({
      CustomQuery: {
        CustomQueryCheckbox: true,
        CustomQueryTextArea: '#6;x9',
      },
    });
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[#6;x9])-[#6]');
  });

  test('Setting custom query - few attributes and logical AND low precedence', async ({
    page,
  }) => {
    await AtomPropertiesDialog(page).setOptions({
      CustomQuery: {
        CustomQueryCheckbox: true,
        CustomQueryTextArea: 'x5;D0;h9;r3',
      },
    });
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[x5;D0;h9;r3])-[#6]');
  });

  test('Setting custom query - logical NOT and AND low precedence', async ({
    page,
  }) => {
    await AtomPropertiesDialog(page).setOptions({
      CustomQuery: {
        CustomQueryCheckbox: true,
        CustomQueryTextArea: '!C;R3',
      },
    });
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[!C;R3])-[#6]');
  });

  test('Setting custom query - logical AND and OR', async ({ page }) => {
    await AtomPropertiesDialog(page).setOptions({
      CustomQuery: {
        CustomQueryCheckbox: true,
        CustomQueryTextArea: 'x2&D3,D2',
      },
    });
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[x2&D3,D2])-[#6]');
  });

  test('Setting custom query - logical OR for aliphatic atoms', async ({
    page,
  }) => {
    /**
     * https://github.com/epam/Indigo/issues/1337
     */
    await AtomPropertiesDialog(page).setOptions({
      CustomQuery: {
        CustomQueryCheckbox: true,
        CustomQueryTextArea: 'F,Cl,Br,I;A',
      },
    });
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[F,Cl,Br,I;A])-[#6]');
  });
});
