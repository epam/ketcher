import { test, expect } from '@playwright/test';
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

  test('is shown, when entering some text', async ({ page }) => {
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.type('mek');
    const abbreviationLookup = await page.getByTestId('AbbreviationLookup');
    expect(await abbreviationLookup.isVisible()).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('is not shown, when pressing "1" multiple times to change bond type', async ({
    page,
  }) => {
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.type('1');
    await page.keyboard.type('1');
    await page.keyboard.type('1');
    const abbreviationLookup = await page.getByTestId('AbbreviationLookup');
    expect(await abbreviationLookup.isVisible()).toBe(false);
  });

  test('is not shown, when pressing "t" multiple times to change template', async ({
    page,
  }) => {
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.type('t');
    await page.keyboard.type('t');
    await page.keyboard.type('t');
    const abbreviationLookup = await page.getByTestId('AbbreviationLookup');
    expect(await abbreviationLookup.isVisible()).toBe(false);
  });
});
