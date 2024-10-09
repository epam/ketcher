/* eslint-disable no-magic-numbers */
import { Page, test, expect } from '@playwright/test';
import {
  selectTopPanelButton,
  TopPanelButton,
  waitForPageInit,
  drawBenzeneRing,
  pressButton,
  copyAndPaste,
  takeEditorScreenshot,
  openFileAndAddToCanvasAsNewProject,
  resetAllSettingsToDefault,
  setFontSizeOptionUnit,
  setFontSizeValue,
  setSubFontSizeOptionUnit,
  setSubFontSizeValue,
  setReactionMarginSizeOptionUnit,
  setReactionMarginSizeValue,
  moveMouseAway,
  openSettings,
} from '@utils';

async function resetSelectToolOff(page: Page) {
  await openSettings(page);
  await page.getByTestId('reset-to-select-input-span').click();
  await page.getByTestId('off-option').click();
  await pressButton(page, 'Apply');
}

test('Verify Ketcher settings panel', async ({ page }) => {
  /*
  Test case:EPMLSOPKET-10078 - General settings - Defaul settings verification' & EPMLSOPKET-12973
  */
  await waitForPageInit(page);
  await openSettings(page);
  await page.waitForTimeout(3000);
  await takeEditorScreenshot(page);
});

test.describe('General Settings', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await resetAllSettingsToDefault(page);
  });

  test('Undo/Redo Actions when switch "reset to Select tool" is"Off"', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-18059
    const pointX = 350;
    const pointY = 350;
    await resetSelectToolOff(page);
    await drawBenzeneRing(page);
    await copyAndPaste(page);
    await page.mouse.click(pointX, pointY);
    await page.keyboard.press('Control+z');
  });
});
