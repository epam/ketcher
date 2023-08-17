/* eslint-disable no-magic-numbers */
import { test } from '@playwright/test';
import {
  copyAndPaste,
  cutAndPaste,
  dragMouseTo,
  moveMouseToTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  selectAllStructuresOnCanvas,
  takeEditorScreenshot,
} from '@utils';
test.describe('Selection Tools', () => {
  test.describe('Select All', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('');
      // TODO: change to waitforinit....
      await page.waitForFunction(() => window.ketcher);
    });

    /*
    Test case: EPMLSOPKET-1337
    Description:  Select all using hot-key
    */
    test(`Select all using hot-key`, async ({ page }) => {
      const DELTA = 200;
      await openFileAndAddToCanvas('display-abbrev-groups-example.mol', page);

      await selectAllStructuresOnCanvas(page);
      await moveMouseToTheMiddleOfTheScreen(page);
      await dragMouseTo(DELTA, DELTA, page);
      await takeEditorScreenshot(page);

      await cutAndPaste(page);
      await takeEditorScreenshot(page);

      await copyAndPaste(page);
      await takeEditorScreenshot(page);

      await selectAllStructuresOnCanvas(page);
      await page.keyboard.press('Delete');
      await takeEditorScreenshot(page);
    });
  });
});
