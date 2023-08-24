import { test } from '@playwright/test';
import {
  selectTopPanelButton,
  TopPanelButton,
  takeEditorScreenshot,
} from '@utils';

test.describe('Open Ketcher', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test('Verify defult settings', async ({ page }) => {
    /*
    Test case:EPMLSOPKET-10078 - General settings - Defaul settings verification' & EPMLSOPKET-12973
    */
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await takeEditorScreenshot(page);
  });
});
