/* eslint-disable no-magic-numbers */
import { test } from '@playwright/test';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import {
  waitForPageInit,
  takeEditorScreenshot,
  pressButton,
  scrollToDownInSetting,
  openFileAndAddToCanvas,
  openSettings,
  resetAllSettingsToDefault,
  openBondsSettingsSection,
} from '@utils';

test.describe('ACS Style Settings', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await resetAllSettingsToDefault(page);
  });

  test('Verify ACS Style button and setting after clicking', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5156
    Description: add new option ACS style
    */
    await openFileAndAddToCanvas('KET/layout-with-diagonally-arrow.ket', page);
    await TopRightToolbar(page).Settings();
    await pressButton(page, 'Set ACS Settings');
    await page.waitForTimeout(3000);
    await takeEditorScreenshot(page);
    await openBondsSettingsSection(page);
    await scrollToDownInSetting(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await pressButton(page, 'OK');
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
  });

  test('Verify default settings after clicking ACS Style button and after that on Reset', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5156
    Description: add new option ACS style
    */
    await openFileAndAddToCanvas('KET/layout-with-long-molecule.ket', page);
    await TopRightToolbar(page).Settings();
    await pressButton(page, 'Set ACS Settings');
    await pressButton(page, 'Apply');
    await pressButton(page, 'OK');
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
    await TopRightToolbar(page).Settings();
    await pressButton(page, 'Reset');
    await takeEditorScreenshot(page);
    await openBondsSettingsSection(page);
    await scrollToDownInSetting(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await pressButton(page, 'OK');
    await takeEditorScreenshot(page);
  });
});
