import { test } from '@playwright/test';
import {
  addMonomerToCanvas,
  dragMouseTo,
  selectEraseTool,
  selectRectangleArea,
  selectRectangleSelectionTool,
  selectSingleBondTool,
  takeEditorScreenshot,
  takePageScreenshot,
  waitForPageInit,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
/* eslint-disable no-magic-numbers */

test.describe('Rectangle Selection Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
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

    const peptide1 = await addMonomerToCanvas(
      page,
      MONOMER_NAME,
      MONOMER_ALIAS,
      300,
      300,
      0,
    );
    const peptide2 = await addMonomerToCanvas(
      page,
      MONOMER_NAME,
      MONOMER_ALIAS,
      400,
      400,
      1,
    );
    const peptide3 = await addMonomerToCanvas(
      page,
      MONOMER_NAME,
      MONOMER_ALIAS,
      500,
      500,
      2,
    );
    const peptide4 = await addMonomerToCanvas(
      page,
      MONOMER_NAME,
      MONOMER_ALIAS,
      500,
      200,
      3,
    );

    // Select bond tool
    await selectSingleBondTool(page);

    // Create bonds between peptides
    await bondTwoMonomers(page, peptide1, peptide2);
    await bondTwoMonomers(page, peptide3, peptide2);
    await bondTwoMonomers(page, peptide3, peptide4);

    await takePageScreenshot(page);

    await selectRectangleSelectionTool(page);

    // Coordinates for rectangle selection
    const startX = 100;
    const startY = 100;
    const endX = 500;
    const endY = 500;

    await selectRectangleArea(page, startX, startY, endX, endY);

    await takePageScreenshot(page);

    // Erase selected elements
    await selectEraseTool(page);

    // Get rid of flakiness because of preview
    const coords = [100, 100];
    await page.mouse.move(coords[0], coords[1]);

    await takePageScreenshot(page);
  });

  test('Move monomer bonded with another monomers', async ({ page }) => {
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
    await page.mouse.click(400, 400);
    await dragMouseTo(200, 400, page);

    await takeEditorScreenshot(page);
  });
});
