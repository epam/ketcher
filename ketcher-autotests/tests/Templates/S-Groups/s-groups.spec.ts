/* eslint-disable no-magic-numbers */
import { test } from '@playwright/test';
import {
  waitForKetcherInit,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
} from '@utils';

test.describe('S-Groups', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await waitForKetcherInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Open file with several s-groups and check brackets', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-12967 for Open RXN v2000 file with 'S-Group Properties Type = Multiple group Multi.zip
    Test case related to issue: https://github.com/epam/ketcher/issues/2389
    Description: Open file with S-groups (with Unsupported S-group type GEN) and see that brackets in place for all S-Groups except DAT
    */
    await openFileAndAddToCanvas(
      'RXN/structure-with-s-groups-with-unsupported-s-group-type-V2000.rxn',
      page,
    );
  });
});
