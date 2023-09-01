import { test } from '@playwright/test';
import {
  addMonomerToCanvas,
  selectEraseTool,
  selectSingleBondTool,
  takeEditorScreenshot,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
/* eslint-disable no-magic-numbers */

test.describe('Erase Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await turnOnMacromoleculesEditor(page);
  });
  test('Delete monomer bonded with another monomers', async ({ page }) => {
    /* 
    Test case: #2370 - "Erase" tool for macromolecules editor
    Description: Erase Tool
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

    await takeEditorScreenshot(page);

    await selectEraseTool(page);

    // Delete peptide linked with two other peptides by bonds
    await peptide3.click();

    await takeEditorScreenshot(page);
  });
});
