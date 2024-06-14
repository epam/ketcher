import { test, expect } from '@playwright/test';
import { waitForPageInit } from '@utils/common';
import { takeMonomerLibraryScreenshot } from '@utils';
import { gotoRNA } from '@utils/macromolecules/rnaBuilder';

test.describe('Macromolecules delete RNA presets', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await gotoRNA(page);
  });

  test('Should not delete default RNA preset', async ({ page }) => {
    await page.getByTestId('A_A_R_P').click({ button: 'right' });
    await takeMonomerLibraryScreenshot(page);
  });

  test('Delete copy RNA preset', async ({ page }) => {
    await page.getByTestId('A_A_R_P').click({ button: 'right' });

    await page.getByTestId('duplicateandedit').click();
    await page.getByTestId('save-btn').click();

    const createdPreset = page.getByTestId('A_Copy_A_R_P');
    await expect(createdPreset).toBeVisible();

    await createdPreset.click({ button: 'right' });
    await page.getByTestId('deletepreset').click();
    await page.getByRole('button', { name: 'Delete' }).click();

    await expect(createdPreset).not.toBeVisible();
  });
});
