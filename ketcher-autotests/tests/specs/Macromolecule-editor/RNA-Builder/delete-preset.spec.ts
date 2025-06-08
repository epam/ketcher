import { test, expect } from '@playwright/test';
import { waitForKetcherInit } from '@utils/common';
import { takeMonomerLibraryScreenshot } from '@utils';
import { Presets } from '@constants/monomers/Presets';
import { Library } from '@tests/pages/macromolecules/Library';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';

test.describe('Macromolecules delete RNA presets', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('', { waitUntil: 'domcontentloaded' });
    await waitForKetcherInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await Library(page).switchToRNATab();
  });

  test('Should not delete default RNA preset', async ({ page }) => {
    await Library(page).rightClickOnPreset(Presets.A);
    await takeMonomerLibraryScreenshot(page);
  });

  test('Delete copy RNA preset', async ({ page }) => {
    await Library(page).rightClickOnPreset(Presets.A);

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
