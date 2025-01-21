import { test, expect } from '@playwright/test';
import { takeMonomerLibraryScreenshot, waitForPageInit } from '@utils';
import { goToFavoritesTab, goToRNATab } from '@utils/macromolecules/library';
import { gotoRNA } from '@utils/macromolecules/rnaBuilder';

test.describe('Macromolecules add RNA presets to Favorites', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await gotoRNA(page);
  });

  test('Should have star when hover over RNA presets', async ({ page }) => {
    await page.getByTestId('A_A_R_P').hover();
    await takeMonomerLibraryScreenshot(page);
  });

  test('Should add RNA presets to Favorites', async ({ page }) => {
    await goToFavoritesTab(page);
    await expect(page.getByTestId('A_A_R_P')).not.toBeVisible();

    await goToRNATab(page);
    await page.locator('div[class="star "]').first().click();
    await goToFavoritesTab(page);
    await expect(page.getByTestId('A_A_R_P')).toBeVisible();
  });
});
