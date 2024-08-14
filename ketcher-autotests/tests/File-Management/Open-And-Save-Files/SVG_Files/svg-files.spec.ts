import { test } from '@playwright/test';
import { waitForPageInit } from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

test.describe('Saving in .svg files', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });
});
