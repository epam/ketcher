/* eslint-disable no-magic-numbers */
import { test } from '@playwright/test';
import { SettingsSection } from '@tests/pages/constants/settingsDialog/Constants';
import {
  setACSSettings,
  SettingsDialog,
} from '@tests/pages/molecules/canvas/SettingsDialog';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { TopRightToolbar } from '@tests/pages/molecules/TopRightToolbar';
import {
  waitForPageInit,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
} from '@utils';

test.describe('ACS Style Settings', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Verify ACS Style button and setting after clicking', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5156
    Description: add new option ACS style
    */
    await openFileAndAddToCanvas('KET/layout-with-diagonally-arrow.ket', page);
    await TopRightToolbar(page).Settings({ waitForFontListLoad: true });
    await SettingsDialog(page).setACSSettings();
    await takeEditorScreenshot(page);
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await takeEditorScreenshot(page);
    await SettingsDialog(page).apply();
    await page.getByRole('button', { name: 'OK' }).click();
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
    await setACSSettings(page);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
    await TopRightToolbar(page).Settings({ waitForFontListLoad: true });
    await SettingsDialog(page).reset();
    await takeEditorScreenshot(page);
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await takeEditorScreenshot(page);
    await SettingsDialog(page).apply();
    await page.getByRole('button', { name: 'OK' }).click();
    await takeEditorScreenshot(page);
  });
});
