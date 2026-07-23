import { test, expect } from '@fixtures';
import { AbbreviationLookup } from '@tests/pages/molecules/canvas/AbbreviationLookupDialog';
import {
  clickInTheMiddleOfTheCanvas,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';

/*
   Lookup Abbreviations window appears when user starts typing
*/
test.describe('Lookup Abbreviations window', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('does not disappear when user switches to new browser tab', async ({
    browser,
    page,
  }) => {
    await clickInTheMiddleOfTheCanvas(page);
    await page.keyboard.type('mer');
    const newPage = await browser.newPage();
    await newPage.goto('', { waitUntil: 'domcontentloaded' });
    await newPage.bringToFront();
    await page.bringToFront();
    await takeEditorScreenshot(page);
  });

  test('is shown, when entering some text', async ({ page }) => {
    await clickInTheMiddleOfTheCanvas(page);
    await page.keyboard.type('mek');
    expect(await AbbreviationLookup(page).window.isVisible()).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('is not shown, when pressing "1" multiple times to change bond type', async ({
    page,
  }) => {
    // EPMLSOPKET-16922, EPMLSOPKET-16923
    await clickInTheMiddleOfTheCanvas(page);
    await page.keyboard.type('1');
    await page.keyboard.type('1');
    await page.keyboard.type('1');
    expect(await AbbreviationLookup(page).window.isVisible()).toBe(false);
  });

  test('is not shown, when pressing "t" multiple times to change template', async ({
    page,
  }) => {
    // EPMLSOPKET-16924
    await clickInTheMiddleOfTheCanvas(page);
    await page.keyboard.type('t');
    await page.keyboard.type('t');
    await page.keyboard.type('t');
    expect(await AbbreviationLookup(page).window.isVisible()).toBe(false);
  });
});
