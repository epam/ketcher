import { test } from '@playwright/test';
import { TopRightToolbar } from '@tests/pages/molecules/TopRightToolbar';
import {
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
    await TopRightToolbar(page).Settings({ waitForFontListLoad: true });
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
