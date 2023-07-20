import { test, expect } from '@playwright/test';

test.describe('Open Ketcher', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });
  test('Switch to Polymer Editor', async ({ page }) => {
    /* 
    Test case: #2496 - chem monomer library
    Description: Switch to Polymer Editor
    */
    await expect(page.getByTestId('PolymerToggler')).toBeVisible();
    await page.getByTestId('PolymerToggler').click();

    await expect(page.getByText('CHEM')).toBeVisible();
  });

  test('Open Chem tab in library', async ({ page }) => {
    /* 
    Test case: #2496 - chem monomer library
    Description: Open Chem tab in library
    */
    await page.getByTestId('PolymerToggler').click();
    await page.getByText('CHEM').click();
    await expect(page.getByText('A6OH')).toBeVisible();
  });
});
