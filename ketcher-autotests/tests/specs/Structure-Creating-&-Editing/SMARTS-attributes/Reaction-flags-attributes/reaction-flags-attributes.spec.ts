import { test, expect } from '@fixtures';
import {
  checkSmartsValue,
  checkSmartsWarnings,
  doubleClickOnAtom,
  pasteFromClipboardAndOpenAsNewProject,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { AtomPropertiesDialog } from '@tests/pages/molecules/canvas/AtomPropertiesDialog';
import { Inversion } from '@tests/pages/constants/atomProperties/Constants';

const expectedSmarts = '[#6](-[#6])(-[#6])-[#6]';

test.describe('Checking atom properties attributes in SMARTS format', () => {
  test.beforeEach(async ({ page }) => {
    const numberOfAtom = 0;
    await waitForPageInit(page);
    await pasteFromClipboardAndOpenAsNewProject(page, 'C(C)(C)C');
    await doubleClickOnAtom(page, 'C', numberOfAtom);
    await expect(AtomPropertiesDialog(page).window).toBeVisible();
  });

  test('Setting reaction flag - Inverts', async ({ page }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3431
     * Description: setting reaction flag - inverts should have no impact on SMARTS output but warning should be displayed
     */
    await AtomPropertiesDialog(page).setOptions({
      ReactionFlags: {
        Inversion: Inversion.Inverts,
      },
    });
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, expectedSmarts);
    await checkSmartsWarnings(page);
  });

  test('Setting reaction flag - Retains', async ({ page }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3431
     * Description: setting reaction flag - retains should have no impact on SMARTS output but warning should be displayed
     */
    await AtomPropertiesDialog(page).setOptions({
      ReactionFlags: {
        Inversion: Inversion.Retains,
      },
    });
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, expectedSmarts);
    await checkSmartsWarnings(page);
  });

  test('Setting reaction flag - Exact change checked', async ({ page }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3431
     * Description: checking exact change option at reaction flag section should have no impact on SMARTS output but warning should be displayed
     */
    await AtomPropertiesDialog(page).setOptions({
      ReactionFlags: {
        ExactChangeCheckbox: true,
      },
    });
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, expectedSmarts);
    await checkSmartsWarnings(page);
  });
});
