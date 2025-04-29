import { test } from '@playwright/test';
import { rightToolbar } from '@tests/pages/molecules/RightToolbar';
import { takeEditorScreenshot, waitForPageInit } from '@utils';

test.describe('Open and validate Extended table', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Periodic table check', async ({ page }) => {
    /* 
      Test cases: EPMLSOPKET-1494
      */
    const extendedTableButton = rightToolbar(page).extendedTableButton;

    await extendedTableButton.click();
    await takeEditorScreenshot(page);
  });
});
