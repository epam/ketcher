import { Presets } from '@constants/monomers/Presets';
import { test, expect } from '@playwright/test';
import { Library } from '@tests/pages/macromolecules/Library';
import {
  takeMonomerLibraryScreenshot,
  waitForMonomerPreview,
  waitForPageInit,
} from '@utils';

test.describe('Macromolecules add RNA presets to Favorites', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await Library(page).switchToRNATab();
  });

  test('Should have star when hover over RNA presets', async ({ page }) => {
    await Library(page).hoverMonomer(Presets.A);
    await waitForMonomerPreview(page);
    await takeMonomerLibraryScreenshot(page);
  });

  test('Should add RNA presets to Favorites', async ({ page }) => {
    await Library(page).switchToFavoritesTab();
    await expect(page.getByTestId(Presets.A.testId)).not.toBeVisible();

    await Library(page).switchToRNATab();
    await page.locator('div[class="star "]').first().click();
    await Library(page).switchToFavoritesTab();
    await expect(page.getByTestId(Presets.A.testId)).toBeVisible();
  });
});
