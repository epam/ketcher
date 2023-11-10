import { Page, test } from '@playwright/test';
import {
  selectTopPanelButton,
  TopPanelButton,
  takeEditorScreenshot,
  waitForPageInit,
  drawBenzeneRing,
  pressButton,
  copyAndPaste,
} from '@utils';

async function generalDefaultSettings(page: Page) {
  await selectTopPanelButton(TopPanelButton.Settings, page);
  const deltaX = 0;
  const deltaY = 150;
  const anyX = 638;
  const anyY = 524;
  await page.mouse.move(anyX, anyY);
  await page.mouse.wheel(deltaX, deltaY);
}

async function resetSelectToolOff(page: Page) {
  await selectTopPanelButton(TopPanelButton.Settings, page);
  await page.getByRole('button', { name: 'After Paste' }).click();
  await page.getByTestId('off-option').click();
  await pressButton(page, 'Apply');
}

test.describe('Open Ketcher', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Verify Ketcher settings panel', async ({ page }) => {
    /*
    Test case:EPMLSOPKET-10078 - General settings - Defaul settings verification' & EPMLSOPKET-12973
    */
    await selectTopPanelButton(TopPanelButton.Settings, page);
  });

  test('Verify settings menu', async ({ page }) => {
    // Test case: EPMLSOPKET-10077
    await generalDefaultSettings(page);
  });

  test('Undo/Redo Actions when switch "reset to Select tool" is"Off"', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-18059
    // Task need to be fix - Undo is not working when Select tool is"Off"'
    // https://github.com/epam/ketcher/issues/3005 - fix in Ketcher 2.17
    const pointX = 350;
    const pointY = 350;
    await resetSelectToolOff(page);
    await drawBenzeneRing(page);
    await copyAndPaste(page);
    await page.mouse.click(pointX, pointY);
    await page.keyboard.press('Control+z');
  });
});
