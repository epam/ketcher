import { test, expect } from '@playwright/test';

test.describe('Macromolecules default presets', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });
  test.skip('Check Guanine in default presets', async ({ page }) => {
    /* 
    Test case: #2496 - chem monomer library
    Description: Switch to Polymer Editor
    */
    await expect(page.getByTestId('PolymerToggler')).toBeVisible();
    await page.getByTestId('PolymerToggler').click();
    await page.getByText('RNA').click();

    await page.getByTestId('cancel-btn').click();
    await page.getByTestId('G').click();
    await page.screenshot({
      path: 'tests/Macromolecule-editor/screenshots/default-presets.png',
    });
  });
});
