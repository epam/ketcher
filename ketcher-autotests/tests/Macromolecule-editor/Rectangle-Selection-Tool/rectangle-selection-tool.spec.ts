import { test } from '@playwright/test';
import {
  addMonomerToCanvas,
  dragMouseTo,
  selectEraseTool,
  selectRectangleArea,
  selectRectangleSelectionTool,
  selectSingleBondTool,
  takeEditorScreenshot,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
/* eslint-disable no-magic-numbers */

test.describe('Rectangle Selection Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await turnOnMacromoleculesEditor(page);
  });
  test('Select monomer and bonds and then erase', async ({ page }) => {
    /* 
    Test case: #2360 - "Select" tool for Macromolecules editor
    Description: Rectangle Selection Tool
    */

    // Create 4 peptides on canvas
    const MONOMER_NAME = 'Tza___3-thiazolylalanine';
    const MONOMER_ALIAS = 'Tza';
    await addMonomerToCanvas(page, MONOMER_NAME, 300, 300);
    await addMonomerToCanvas(page, MONOMER_NAME, 400, 400);
    await addMonomerToCanvas(page, MONOMER_NAME, 500, 500);
    await addMonomerToCanvas(page, MONOMER_NAME, 500, 200);

    // Get 4 peptides locators
    const peptides = await page.getByText(MONOMER_ALIAS).locator('..');
    const peptide1 = peptides.nth(0);
    const peptide2 = peptides.nth(1);
    const peptide3 = peptides.nth(2);
    const peptide4 = peptides.nth(3);

    // Select bond tool
    await selectSingleBondTool(page);

    // Create bonds between peptides
    await bondTwoMonomers(page, peptide1, peptide2);
    await bondTwoMonomers(page, peptide3, peptide2);
    await bondTwoMonomers(page, peptide3, peptide4);

    await page.screenshot({
      path: 'tests/Macromolecule-editor/screenshots/rectangle-selection-tool.png',
    });

    await selectRectangleSelectionTool(page);

    // Coordinates for rectangle selection
    const startX = 100;
    const startY = 100;
    const endX = 500;
    const endY = 500;

    await selectRectangleArea(page, startX, startY, endX, endY);

    await page.screenshot({
      path: 'tests/Macromolecule-editor/screenshots/rectangle-selection-tool2.png',
    });

    // Erase selected elements
    await selectEraseTool(page);

    await page.screenshot({
      path: 'tests/Macromolecule-editor/screenshots/rectangle-selection-tool3.png',
    });
  });

  test.skip('Move monomer bonded with another monomers', async ({ page }) => {
    /* 
    Test case: #2367 - move items on the canvas
    Description: check ability to move items on the canvas
    */

    // Choose peptide
    await page.getByText('Tza').click();

    // Create 4 peptides on canvas
    await page.mouse.click(300, 300);
    await page.mouse.click(400, 400);
    await page.mouse.click(500, 500);
    await page.mouse.click(600, 600);

    // Get 4 peptides locators
    const peptides = await page.getByText('Tza').locator('..');
    const peptide1 = peptides.nth(0);
    const peptide2 = peptides.nth(1);
    const peptide3 = peptides.nth(2);
    const peptide4 = peptides.nth(3);

    // Select bond tool
    await selectSingleBondTool(page);

    // Create bonds between peptides
    await bondTwoMonomers(page, peptide1, peptide2);
    await bondTwoMonomers(page, peptide3, peptide2);
    await bondTwoMonomers(page, peptide3, peptide4);

    await takeEditorScreenshot(page);

    // Move selected monomer
    await selectRectangleSelectionTool(page);
    await page.mouse.move(400, 400);
    await dragMouseTo(500, 500, page);
    await page.mouse.move(400, 400);
    await dragMouseTo(200, 400, page);

    await takeEditorScreenshot(page);
  });
});
