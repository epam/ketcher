import { test, expect } from '@playwright/test';
import { waitForPageInit } from '@utils/common';
import { takePageScreenshot } from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

test.describe('Open Ketcher', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Switch to Polymer Editor', async ({ page }) => {
    /* 
    Test case: #2496 - chem monomer library
    Description: Switch to Polymer Editor
    */
    await expect(page.getByText('CHEM')).toBeVisible();
  });

  test('Open Chem tab in library', async ({ page }) => {
    /* 
    Test case: #2496 - chem monomer library
    Description: Open Chem tab in library
    */
    await page.getByText('CHEM').click();
    await expect(page.getByText('A6OH')).toBeVisible();
    await takePageScreenshot(page);
  });
});
