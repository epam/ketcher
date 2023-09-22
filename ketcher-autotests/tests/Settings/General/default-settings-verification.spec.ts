import { test } from '@playwright/test';
import {
  selectTopPanelButton,
  TopPanelButton,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';

test.describe('Open Ketcher', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Verify Ketcher settings panel', async ({ page }) => {
    /*
    Test case:EPMLSOPKET-10078 - General settings - Defaul settings verification' & EPMLSOPKET-12973
    */
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await takeEditorScreenshot(page);
  });
});
