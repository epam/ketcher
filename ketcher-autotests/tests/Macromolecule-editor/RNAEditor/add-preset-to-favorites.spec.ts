import { Page, test, expect } from '@playwright/test';
import { RNA_TAB } from '@constants/testIdConstants';
import { waitForPageInit } from '@utils/common';
import { takePageScreenshot } from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';
import { toggleRnaBuilderAccordion } from '@utils/macromolecules/rnaBuilder';

async function gotoRNA(page: Page) {
  await turnOnMacromoleculesEditor(page);
  await page.getByTestId(RNA_TAB).click();
  await toggleRnaBuilderAccordion(page);
}

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
    await page.locator('div[class="star "]').first().click();
    await page.getByTestId('FAVORITES_TAB').click();
    await takePageScreenshot(page);
  });
});
