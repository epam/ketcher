import { test, expect } from '@fixtures';
import {
  doubleClickOnAtom,
  pasteFromClipboardAndOpenAsNewProject,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { checkSmartsValue, checkSmartsWarnings } from '../utils';
import { AtomPropertiesDialog } from '@tests/pages/molecules/canvas/AtomPropertiesDialog';
import {
  Radical,
  Valence,
} from '@tests/pages/constants/atomProperties/Constants';

test.describe('Checking atom properties attributes in SMARTS format', () => {
  test.beforeEach(async ({ page }) => {
    const numberOfAtom = 0;
    await waitForPageInit(page);
    await pasteFromClipboardAndOpenAsNewProject(page, 'C(C)(C)C');
    await doubleClickOnAtom(page, 'C', numberOfAtom);
    await expect(AtomPropertiesDialog(page).window).toBeVisible();
  });

  test('Setting atom label and checking the atom number', async ({ page }) => {
    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: { Label: 'Cr' },
    });
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[Cr])-[#6]');
  });

  test('Setting charge to zero', async ({ page }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3339
     * Test is failing due to bug https://github.com/epam/Indigo/issues/1438
     */
    test.fail();
    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: { Charge: '0' },
    });
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[#6;+0])-[#6]');
  });

  test('Setting positive charge', async ({ page }) => {
    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: { Charge: '10' },
    });
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[#6;+10])-[#6]');
  });

  test('Setting negative charge', async ({ page }) => {
    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: { Charge: '-15' },
    });
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[#6;-15])-[#6]');
  });

  test('Setting atomic mass', async ({ page }) => {
    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: { Isotope: '30' },
    });
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[#6;30])-[#6]');
  });

  test('Setting isotope (atomic mass) to zero', async ({ page }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3339
     * Test is failing due to bug https://github.com/epam/Indigo/issues/1438
     */
    test.fail();
    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: { Isotope: '0' },
    });
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[#6;0])-[#6]');
  });

  test('Setting valence', async ({ page }) => {
    /**
     * This test will fail until https://github.com/epam/Indigo/issues/1362 is fixed
     */
    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: { Valence: Valence.Four },
    });
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[#6;v4])-[#6]');
  });

  test('Setting radical', async ({ page }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3431
     * Description: setting redical option should have no impact on SMARTS output but warning should be displayed
     */
    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: { Radical: Radical.Monoradical },
    });
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6](-[#6])(-[#6])-[#6]');
    await checkSmartsWarnings(page);
  });

  test('Check that cannot add Charge more than -15', async ({ page }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3943
     * Description: Validation should be added +-15 range allowed only
     */
    await AtomPropertiesDialog(page).fillCharge('-16');
    expect(AtomPropertiesDialog(page).applyButton).toBeDisabled();
  });

  test('Check that cannot add Charge more than 15', async ({ page }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3943
     * Description: Validation should be added +-15 range allowed only
     */
    await AtomPropertiesDialog(page).fillCharge('16');
    expect(AtomPropertiesDialog(page).applyButton).toBeDisabled();
  });
});
