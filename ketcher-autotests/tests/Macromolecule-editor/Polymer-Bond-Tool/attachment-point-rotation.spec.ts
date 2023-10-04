import { test } from '@playwright/test';
import {
  addMonomerToCanvas,
  dragMouseTo,
  selectRectangleSelectionTool,
  selectSingleBondTool,
  takePageScreenshot,
  waitForPageInit,
  takeEditorScreenshot,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
/* eslint-disable no-magic-numbers */

test.describe('Check attachment point rotation', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });
  test('Select monomer and bonds and then hover monomer', async ({ page }) => {
    /* 
    Test case: # - Rotate attachment point to bond
    Description: Attachment points and labels should rotate to bond on hover
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

    // Hover 1th peptide
    await peptide1.hover();

    await takePageScreenshot(page);

    // Hover 2nd peptide
    await peptide2.hover();

    await takeEditorScreenshot(page);
  });

  test('Move monomer bonded with another monomers and check attachment points', async ({
    page,
  }) => {
    /* 
    Test case: # - Rotate attachment point to bond
    Description: when monomers are moved, attachment points move also
    */

    const MONOMER_NAME = 'Tza___3-thiazolylalanine';

    await addMonomerToCanvas(page, MONOMER_NAME, 300, 300);
    await addMonomerToCanvas(page, MONOMER_NAME, 400, 400);

    // Get 4 peptides locators
    const peptides = await page.getByText('Tza').locator('..');
    const peptide1 = peptides.nth(0);
    const peptide2 = peptides.nth(1);

    // Select bond tool
    await selectSingleBondTool(page);

    // Create bonds between peptides
    await bondTwoMonomers(page, peptide1, peptide2);

    // Hover 1th peptide
    await peptide1.hover();

    await takeEditorScreenshot(page);

    // Move selected monomer
    await selectRectangleSelectionTool(page);
    await page.mouse.move(400, 400);
    await dragMouseTo(500, 500, page);
    await page.mouse.move(400, 400);
    await dragMouseTo(200, 400, page);

    await selectSingleBondTool(page);
    // Hover 1th peptide
    await peptide1.hover();

    await takeEditorScreenshot(page);
  });
});
