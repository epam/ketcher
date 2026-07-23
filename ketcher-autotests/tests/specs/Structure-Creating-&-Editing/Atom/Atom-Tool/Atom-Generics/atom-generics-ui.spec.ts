import { test } from '@fixtures';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { takeEditorScreenshot, waitForPageInit } from '@utils';

test.describe('Open and validate Extended table', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Periodic table check', async ({ page }) => {
    /* 
      Test cases: EPMLSOPKET-1494
      */
    await RightToolbar(page).extendedTable();
    await takeEditorScreenshot(page);
  });
});
