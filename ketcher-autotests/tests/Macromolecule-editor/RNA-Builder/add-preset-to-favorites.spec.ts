import { test, expect } from '@playwright/test';
import { waitForPageInit } from '@utils/common';
import { takePageScreenshot } from '@utils';
import { gotoRNA } from '@utils/macromolecules/rnaBuilder';

test.describe('Macromolecules add RNA presets to Favorites', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await gotoRNA(page);
  });

  test('Should have star when hover over RNA presets', async ({ page }) => {
    await page.getByTestId('A_A_R_P').hover();
    await takePageScreenshot(page);
  });

  test('Should add RNA presets to Favorites', async ({ page }) => {
    await page.getByTestId('FAVORITES_TAB').click();
    await expect(page.getByTestId('A_A_R_P')).not.toBeVisible();

    await page.getByTestId('RNA_TAB').click();
    await page.locator('div[class="star "]').first().click();
    await page.getByTestId('FAVORITES_TAB').click();
    await expect(page.getByTestId('A_A_R_P')).toBeVisible();
  });
});
