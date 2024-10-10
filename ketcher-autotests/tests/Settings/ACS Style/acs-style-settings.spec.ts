/* eslint-disable no-magic-numbers */
import { test } from '@playwright/test';
import {
  selectTopPanelButton,
  waitForPageInit,
  takeEditorScreenshot,
  pressButton,
  TopPanelButton,
  bondsSettings,
  scrollToDownInSetting,
  openFileAndAddToCanvas,
  openSettings,
  resetAllSettingsToDefault,
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
    Description: add new option AVS style
    */
    await openFileAndAddToCanvas('KET/layout-with-diagonally-arrow.ket', page);
    await openSettings(page);
    await pressButton(page, 'ACS Style');
    await page.waitForTimeout(3000);
    await takeEditorScreenshot(page);
    await bondsSettings(page);
    await scrollToDownInSetting(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);
  });

  test('Verify default settings after clicking ACS Style button and after that on Reset', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5156
    Description: add new option AVS style
    */
    await openFileAndAddToCanvas('KET/layout-with-long-molecule.ket', page);
    await openSettings(page);
    await pressButton(page, 'ACS Style');
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);
    await openSettings(page);
    await pressButton(page, 'Reset');
    await takeEditorScreenshot(page);
    await bondsSettings(page);
    await scrollToDownInSetting(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });
});
