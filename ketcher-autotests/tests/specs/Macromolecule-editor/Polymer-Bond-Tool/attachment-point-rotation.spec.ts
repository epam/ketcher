import { Peptides } from '@constants/monomers/Peptides';
import { test } from '@playwright/test';
import { turnOnMacromoleculesEditor } from '@tests/pages/common/TopLeftToolbar';
import {
  addSingleMonomerToCanvas,
  dragMouseTo,
  selectRectangleSelectionTool,
  waitForPageInit,
  takeEditorScreenshot,
  moveMouseAway,
  selectMacroBond,
} from '@utils';
import { MacroBondTool } from '@utils/canvas/tools/selectNestedTool/types';

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

    // Get 4 peptides locators
    const peptide1 = await addSingleMonomerToCanvas(
      page,
      Peptides.Tza,
      300,
      300,
      0,
    );
    const peptide2 = await addSingleMonomerToCanvas(
      page,
      Peptides.Tza,
      400,
      400,
      1,
    );
    const peptide3 = await addSingleMonomerToCanvas(
      page,
      Peptides.Tza,
      500,
      500,
      2,
    );
    const peptide4 = await addSingleMonomerToCanvas(
      page,
      Peptides.Tza,
      500,
      200,
      3,
    );

    // Select bond tool
    await selectMacroBond(page, MacroBondTool.SINGLE);

    // Create bonds between peptides
    await bondTwoMonomers(page, peptide1, peptide2);
    await bondTwoMonomers(page, peptide3, peptide2);
    await bondTwoMonomers(page, peptide3, peptide4);

    // Hover 1th peptide
    await moveMouseAway(page);
    await peptide1.hover();

    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });

    // Hover 2nd peptide
    await moveMouseAway(page);
    await peptide2.hover();

    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });
  });

  test('Move monomer bonded with another monomers and check attachment points', async ({
    page,
  }) => {
    /* 
    Test case: # - Rotate attachment point to bond
    Description: when monomers are moved, attachment points move also
    */

    // Get 4 peptides locators
    const peptide1 = await addSingleMonomerToCanvas(
      page,
      Peptides.Tza,
      300,
      300,
      0,
    );
    const peptide2 = await addSingleMonomerToCanvas(
      page,
      Peptides.Tza,
      400,
      400,
      1,
    );

    // Select bond tool
    await selectMacroBond(page, MacroBondTool.SINGLE);

    // Create bonds between peptides
    await bondTwoMonomers(page, peptide1, peptide2);

    // Hover 1th peptide
    await moveMouseAway(page);
    await peptide1.hover();

    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });

    // Move selected monomer
    await selectRectangleSelectionTool(page);
    await page.mouse.move(400, 400);
    await dragMouseTo(200, 400, page);
    await moveMouseAway(page);

    await selectMacroBond(page, MacroBondTool.SINGLE);
    // Hover 1th peptide
    await peptide1.hover();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });
  });
});
