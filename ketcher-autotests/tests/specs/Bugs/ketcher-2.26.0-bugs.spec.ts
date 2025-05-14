/* eslint-disable no-inline-comments */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  resetZoomLevelToDefault,
  pasteFromClipboardAndAddToCanvas,
} from '@utils';
import { waitForPageInit } from '@utils/common';
import { processResetToDefaultState } from '@utils/testAnnotations/resetToDefaultState';
import { TopLeftToolbar } from '@tests/pages/common/TopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/TopRightToolbar';

let page: Page;

test.describe('Ketcher bugs in 2.26.0', () => {
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: false,
      goToPeptides: false,
    });
  });

  test.afterEach(async ({ context: _ }, testInfo) => {
    await TopLeftToolbar(page).clearCanvas();
    await resetZoomLevelToDefault(page);
    await processResetToDefaultState(testInfo, page);
  });

  test.afterAll(async ({ browser }) => {
    await Promise.all(browser.contexts().map((context) => context.close()));
  });

  test('Case 1: The options for layout about smart-layout, aromatize-skip-superatoms and etc is sent as not undefined', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5635
     * Description: The options for layout about smart-layout, aromatize-skip-superatoms and etc is sent as not undefined.
     * Scenario:
     * 1. Go to Micro
     * 2. Paste from clipboard
     * 3. Take screenshot
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await pasteFromClipboardAndAddToCanvas(
      page,
      'C1CC=CC=CC=CCC=CC=CC=CCC=CC=C1 |c:2,11,16,t:4,6,9,13,18|',
    );
    await takeEditorScreenshot(page);
  });
});
