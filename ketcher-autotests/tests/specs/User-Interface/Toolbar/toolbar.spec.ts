import { test } from '@playwright/test';
import {
  openSettings,
  takeEditorScreenshot,
  takeLeftToolbarScreenshot,
  waitForPageInit,
} from '@utils';

test.describe('Toolbar palette and settings', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Settings: UI verification', async ({ page }) => {
    /* 
      Test case: EPMLSOPKET-1329
      Description:  'Settings': UI verification
      */
    await TopRightToolbar(page).Settings();
    // Wait while system loads list of values (i.e. Arial in particular) in Font combobox
    await page.waitForSelector('div[role="combobox"]', {
      state: 'attached',
    });
    await page.waitForSelector('div[role="combobox"]:has-text("Arial")', {
      timeout: 5000,
    });
    await takeEditorScreenshot(page);
  });

  test('Toolbar palette: full screen verification', async ({ page }) => {
    /* 
      Test case: EPMLSOPKET-1331
      Description:  Toolbar - Toolbar palette: full screen verification
      */
    await takeLeftToolbarScreenshot(page);
  });
});
