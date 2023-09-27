import { test, expect } from '@playwright/test';
import { POLYMER_TOGGLER } from '../../../constants/testIdConstants';
import { waitForPageInit } from '@utils/common';

test.describe('Open Ketcher', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });
  test('Switch to Polymer Editor', async ({ page }) => {
    /* 
    Test case: #2496 - chem monomer library
    Description: Switch to Polymer Editor
    */
    await expect(page.getByTestId(POLYMER_TOGGLER)).toBeVisible();
    await page.getByTestId(POLYMER_TOGGLER).click();

    await expect(page.getByText('CHEM')).toBeVisible();
  });

  test('Open Chem tab in library', async ({ page }) => {
    /* 
    Test case: #2496 - chem monomer library
    Description: Open Chem tab in library
    */
    await page.getByTestId(POLYMER_TOGGLER).click();
    await page.getByText('CHEM').click();
    await expect(page.getByText('A6OH')).toBeVisible();
    await page.screenshot({
      path: 'tests/Macromolecule-editor/screenshots/chem-library.png',
    });
  });
});
