import { test } from '@playwright/test';
import { clickInTheMiddleOfTheScreen, takeEditorScreenshot } from '@utils';

/*
   Lookup Abbreviations window appears when user starts typing
*/
test.describe('Lookup Abbreviations window', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test('does not disappear when user switches to new browser tab', async ({
    browser,
    page,
  }) => {
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.type('mer');
    const newPage = await browser.newPage();
    await newPage.goto('', { waitUntil: 'domcontentloaded' });
    await newPage.bringToFront();
    await page.bringToFront();
    await takeEditorScreenshot(page);
  });
});
