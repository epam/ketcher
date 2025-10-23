/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { test } from '@fixtures';
import { Page } from '@playwright/test';

let page: Page;

test.beforeAll(async ({ initFlexCanvas }) => {
  page = await initFlexCanvas();
});

test.afterEach(async () => {});

test.afterAll(async ({ closePage }) => {
  await closePage();
});

test('Case 1: Check import/export aliases from HELM (Peptides)', async () => {
  /*
   * Test case: https://github.com/epam/ketcher/issues/8345
   * Description: Upload _Base1 base to the library
   * Scenario:
   * 1. Go to Macro mode
   * 2. Execute command in console to add _Base1 to the library
   * 3. Check that the structure appears in the Library
   *
   * Version 3.9
   */
  await page.evaluate(() => {
    window.ketcher.editor.setOptions(
      JSON.stringify({ viewOnlyMode123: `false123` }),
    );
  });
});
