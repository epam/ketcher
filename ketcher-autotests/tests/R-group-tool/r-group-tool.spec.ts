import { test } from '@playwright/test';
import { takeLeftToolbarScreenshot } from '@utils';

test('Icons and tooltips', async ({ page }) => {
  /* Test case: EPMLSOPKET-1555+EPMLSOPKET-1554
        Description: 'Ctrl+R' change tooltips. Correct icon of a tooltip is shown. Check all 3 values from drop-down list
    */
  await page.goto('');
  await page.waitForSelector('.Ketcher-root');

  await page.keyboard.press('Control+r');
  await takeLeftToolbarScreenshot(page);

  await page.keyboard.press('Control+r');
  await takeLeftToolbarScreenshot(page);

  await page.keyboard.press('Control+r');
  await takeLeftToolbarScreenshot(page);
});
