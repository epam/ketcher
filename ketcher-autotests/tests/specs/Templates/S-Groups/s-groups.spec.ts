import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  waitForPageInit,
} from '@utils';

test.describe('S-Groups', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Open file with several s-groups and check brackets', async ({
    page,
  }) => {
    /*
    Test case related to issue: https://github.com/epam/ketcher/issues/2389
    Description: Open file with S-groups (with Unsupported S-group type GEN) and see that brackets in place for all S-Groups except DAT
    */
    await openFileAndAddToCanvas(
      page,
      'Rxn-V2000/structure-with-s-groups-with-unsupported-s-group-type.rxn',
    );
    await takeEditorScreenshot(page);
  });
});
