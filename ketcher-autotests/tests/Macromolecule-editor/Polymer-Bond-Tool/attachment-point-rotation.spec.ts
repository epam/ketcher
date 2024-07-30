import { test } from '@playwright/test';
import {
  addSingleMonomerToCanvas,
  dragMouseTo,
  selectRectangleSelectionTool,
  selectSingleBondTool,
  waitForPageInit,
  takeEditorScreenshot,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
import { Peptides } from '@utils/selectors/macromoleculeEditor';
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
    const MONOMER_NAME = Peptides.Tza;
    const MONOMER_ALIAS = 'Tza';

    // Get 4 peptides locators
    const peptide1 = await addSingleMonomerToCanvas(
      page,
      MONOMER_NAME,
      MONOMER_ALIAS,
      300,
      300,
      0,
    );
    const peptide2 = await addSingleMonomerToCanvas(
      page,
      MONOMER_NAME,
      MONOMER_ALIAS,
      400,
      400,
      1,
    );
    const peptide3 = await addSingleMonomerToCanvas(
      page,
      MONOMER_NAME,
      MONOMER_ALIAS,
      500,
      500,
      2,
    );
    const peptide4 = await addSingleMonomerToCanvas(
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

    // Hover 1th peptide
    await peptide1.hover();

    // Get rid of flakiness because of preview
    await page.waitForSelector('.polymer-library-preview');

    await takeEditorScreenshot(page);

    // Hover 2nd peptide
    await peptide2.hover();

    // Get rid of flakiness because of preview
    await page.waitForSelector('.polymer-library-preview');

    await takeEditorScreenshot(page);
  });

  test('Move monomer bonded with another monomers and check attachment points', async ({
    page,
  }) => {
    /* 
    Test case: # - Rotate attachment point to bond
    Description: when monomers are moved, attachment points move also
    */

    const MONOMER_NAME = Peptides.Tza;
    const MONOMER_ALIAS = 'Tza';

    // Get 4 peptides locators
    const peptide1 = await addSingleMonomerToCanvas(
      page,
      MONOMER_NAME,
      MONOMER_ALIAS,
      300,
      300,
      0,
    );
    const peptide2 = await addSingleMonomerToCanvas(
      page,
      MONOMER_NAME,
      MONOMER_ALIAS,
      400,
      400,
      1,
    );

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
    await dragMouseTo(200, 400, page);

    await selectSingleBondTool(page);
    // Hover 1th peptide
    await peptide1.hover();
    await page.getByTestId('polymer-library-preview');
    await takeEditorScreenshot(page);
  });
});
