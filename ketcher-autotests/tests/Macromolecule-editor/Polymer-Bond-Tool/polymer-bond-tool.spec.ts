import { test } from '@playwright/test';
import { selectSingleBondTool, waitForPageInit } from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';
/* eslint-disable no-magic-numbers */

test.describe('Polymer Bond Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });
  test('Create bond between two peptides', async ({ page }) => {
    /* 
    Test case: #2334 - Create peptide chain (HELM style) - Center-to-Center
    Description: Polymer bond tool
    */

    await turnOnMacromoleculesEditor(page);

    // Choose peptide
    await page.getByText('Tza').click();

    // Create 4 peptides on canvas
    await page.mouse.click(300, 300);
    await page.mouse.click(400, 400);
    await page.mouse.click(500, 500);
    await page.mouse.click(500, 200);

    // Get 4 peptides locators
    const peptides = await page.getByText('Tza').locator('..');
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

  test('Create bond between two chems', async ({ page }) => {
    /* 
    Test case: #2497 - Adding chems to canvas - Center-to-Center
    Description: Polymer bond tool
    */

    await turnOnMacromoleculesEditor(page);

    // Choose chems
    await page.getByText('CHEM').click();
    await page.getByTestId('hxy___Hexynyl alcohol').click();

    // Create 2 chems on canvas
    await page.mouse.click(300, 300);
    await page.mouse.click(400, 400);

    // Get 2 chems locators
    const chems = await page.getByText('hxy').locator('..');
    const chem1 = chems.nth(0);
    const chem2 = chems.nth(1);

    // Select bond tool
    await selectSingleBondTool(page);

    // Create bonds between chems, taking screenshots in middle states
    await chem1.hover();
    await page.mouse.down();
    await page.screenshot({
      path: 'tests/Macromolecule-editor/screenshots/polymer-bond-tool-chem1.png',
    });
    await chem2.hover();
    await page.mouse.up();
    await page.screenshot({
      path: 'tests/Macromolecule-editor/screenshots/polymer-bond-tool-chem2.png',
    });
  });
});
