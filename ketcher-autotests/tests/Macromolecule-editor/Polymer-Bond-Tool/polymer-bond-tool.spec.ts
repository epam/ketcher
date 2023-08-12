import { test, expect } from '@playwright/test';
import { selectSingleBondTool } from '@utils';
/* eslint-disable no-magic-numbers */

test.describe('Polymer Bond Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });
  test.skip('Create bond between two peptides', async ({ page }) => {
    /* 
    Test case: #2334 - Create peptide chain (HELM style) - Center-to-Center
    Description: Polymer bond tool
    */

    await expect(page.getByTestId('PolymerToggler')).toBeVisible();
    await page.getByTestId('PolymerToggler').click();

    // Choose peptide
    await page.getByText('Tza').click();

    // Create 4 peptides on canvas
    await page.mouse.click(300, 300);
    await page.mouse.click(400, 400);
    await page.mouse.click(500, 500);
    await page.mouse.click(500, 200);

    // Get 4 peptides locators
    const peptides = await page.getByText('Tza');
    const peptide1 = peptides.nth(0);
    const peptide2 = peptides.nth(1);
    const peptide3 = peptides.nth(2);
    const peptide4 = peptides.nth(3);

    // Select bond tool
    await selectSingleBondTool(page);

    // Create bonds between peptides, taking screenshots in middle states
    await peptide1.hover();
    await page.mouse.down();
    await page.screenshot({
      path: 'tests/Macromolecule-editor/screenshots/polymer-bond-tool.png',
    });
    await peptide2.hover();
    await page.mouse.up();
    await page.screenshot({
      path: 'tests/Macromolecule-editor/screenshots/polymer-bond-tool2.png',
    });

    await page.mouse.down();
    await peptide3.hover();
    await page.mouse.up();

    await peptide4.hover();
    await page.mouse.down();
    await peptide3.hover();
    await page.mouse.up();

    // Wait error popup
    await page.waitForSelector('#error-tooltip');

    await page.screenshot({
      path: 'tests/Macromolecule-editor/screenshots/polymer-bond-tool3.png',
    });
  });
});
