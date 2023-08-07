import { test } from '@playwright/test';
import { takeEditorScreenshot, AtomButton, selectAtomInToolbar } from '@utils';

test.describe('Open and validate Extended table', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Periodic table check', async ({ page }) => {
    /* 
      Test cases: EPMLSOPKET-1507, EPMLSOPKET-1509, EPMLSOPKET-1515, EPMLSOPKET-1519, EPMLSOPKET-1525, EPMLSOPKET-1504, EPMLSOPKET-1501
      */
    await selectAtomInToolbar(AtomButton.Extended, page);
  });
});
