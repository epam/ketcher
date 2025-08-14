/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Page } from '@playwright/test';
import { test } from '@fixtures';
import { takeEditorScreenshot, openFileAndAddToCanvas } from '@utils';

let page: Page;
test.beforeAll(async ({ initMoleculesCanvas }) => {
  page = await initMoleculesCanvas();
});
test.afterAll(async ({ closePage }) => {
  await closePage();
});
test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

test('1. Verify that the star atom is added to the special nodes section of the extended table and tooltip text for the star atom reads: Any atom, including hydrogen', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5553
   * Description: Verify that the star atom is added to the special nodes section of the extended table
   *              and tooltip text for the star atom reads: "Any atom, including hydrogen."
   * Case:
   *      1. Load pairs of monomers connected to each other (3 files)
   *      2. Hover mouse over each bond having select tool switched on
   *      3. Take screenshot of the canvas to compare it with example
   */
  await openFileAndAddToCanvas(page, 'Molfiles-V2000/mol-1855-to-open.mol');
  // check that structure opened from file is displayed correctly
  await takeEditorScreenshot(page);
});
