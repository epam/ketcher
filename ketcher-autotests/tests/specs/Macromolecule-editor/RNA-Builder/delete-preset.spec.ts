import { test, expect } from '@playwright/test';
import { waitForPageInit } from '@utils/common';
import { takeMonomerLibraryScreenshot } from '@utils';
import { gotoRNA, pressSaveButton } from '@utils/macromolecules/rnaBuilder';
import { Presets } from '@constants/monomers/Presets';

test.describe('Macromolecules delete RNA presets', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await gotoRNA(page);
  });

  test('Should not delete default RNA preset', async ({ page }) => {
    await page.getByTestId(Presets.A.testId).click({ button: 'right' });
    await takeMonomerLibraryScreenshot(page);
  });

  test('Delete copy RNA preset', async ({ page }) => {
    await page.getByTestId(Presets.A.testId).click({ button: 'right' });

    await page.getByTestId('duplicateandedit').click();
    await pressSaveButton(page);

    const createdPreset = page.getByTestId('A_Copy_A_R_P');
    await expect(createdPreset).toBeVisible();

    await createdPreset.click({ button: 'right' });
    await page.getByTestId('deletepreset').click();
    await page.getByRole('button', { name: 'Delete' }).click();

    await expect(createdPreset).not.toBeVisible();
  });
});
