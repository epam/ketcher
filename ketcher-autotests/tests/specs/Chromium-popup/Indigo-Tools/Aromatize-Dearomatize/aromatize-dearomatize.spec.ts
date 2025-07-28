/* eslint-disable no-magic-numbers */
import { test } from '@playwright/test';
import { takeEditorScreenshot, waitForPageInit } from '@utils';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';

test.describe('Aromatize/Dearomatize Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Empty canvas', { tag: ['@chromium-popup'] }, async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1867
    Description: Nothing is changed.
    */
    await IndigoFunctionsToolbar(page).aromatize();
    await IndigoFunctionsToolbar(page).dearomatize();
    await takeEditorScreenshot(page);
  });
});
