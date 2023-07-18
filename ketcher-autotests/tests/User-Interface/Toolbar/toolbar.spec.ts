import { test } from '@playwright/test';
import {
  selectTopPanelButton,
  takeEditorScreenshot,
  takeLeftToolbarScreenshot,
  TopPanelButton,
} from '@utils';

test.describe('Open Ketcher', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test('Settings: UI verification', async ({ page }) => {
    /* 
      Test case: EPMLSOPKET-1329
      Description:  'Settings': UI verification
      */
    await selectTopPanelButton(TopPanelButton.Settings, page);
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
