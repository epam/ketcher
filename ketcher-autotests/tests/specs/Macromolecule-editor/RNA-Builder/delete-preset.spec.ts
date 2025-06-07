import { test, expect } from '@playwright/test';
import { waitForPageInit } from '@utils/common';
import { takeMonomerLibraryScreenshot } from '@utils';
import { Presets } from '@constants/monomers/Presets';
import { Library } from '@tests/pages/macromolecules/Library';

test.describe('Macromolecules delete RNA presets', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await Library(page).switchToRNATab();
  });

  test('Should not delete default RNA preset', async ({ page }) => {
    await page.getByTestId(Presets.A.testId).click({ button: 'right' });
    await takeMonomerLibraryScreenshot(page);
  });

  test('Delete copy RNA preset', async ({ page }) => {
    await page.getByTestId(Presets.A.testId).click({ button: 'right' });

    await page.getByTestId('duplicateandedit').click();
    await Library(page).rnaBuilder.save();

    const createdPreset = page.getByTestId('A_Copy_A_R_P');
    await expect(createdPreset).toBeVisible();

    await createdPreset.click({ button: 'right' });
    await page.getByTestId('deletepreset').click();
    await page.getByRole('button', { name: 'Delete' }).click();

    await expect(createdPreset).not.toBeVisible();
  });
});
