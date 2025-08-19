import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { test } from '@fixtures';
import {
  addSingleMonomerToCanvas,
  dragMouseTo,
  waitForPageInit,
  takeEditorScreenshot,
  moveMouseAway,
} from '@utils';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
/* eslint-disable no-magic-numbers */

test.describe('Check attachment point rotation', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await Library(page).switchToPeptidesTab();
  });

  test('Select monomer and bonds and then hover monomer', async ({ page }) => {
    /* 
    Test case: # - Rotate attachment point to bond
    Description: Attachment points and labels should rotate to bond on hover
    */

    // Get 4 peptides locators
    const peptide1 = await addSingleMonomerToCanvas(
      page,
      Peptide.Tza,
      300,
      300,
      0,
    );
    const peptide2 = await addSingleMonomerToCanvas(
      page,
      Peptide.Tza,
      400,
      400,
      1,
    );
    const peptide3 = await addSingleMonomerToCanvas(
      page,
      Peptide.Tza,
      500,
      500,
      2,
    );
    const peptide4 = await addSingleMonomerToCanvas(
      page,
      Peptide.Tza,
      500,
      200,
      3,
    );

    // Select bond tool
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);

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
      Peptide.Tza,
      300,
      300,
      0,
    );
    const peptide2 = await addSingleMonomerToCanvas(
      page,
      Peptide.Tza,
      400,
      400,
      1,
    );

    // Select bond tool
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);

    // Create bonds between peptides
    await bondTwoMonomers(page, peptide1, peptide2);

    // Hover 1th peptide
    await moveMouseAway(page);
    await peptide1.hover();

    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });

    // Move selected monomer
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await page.mouse.move(410, 410);
    await dragMouseTo(200, 400, page);
    await moveMouseAway(page);

    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
    // Hover 1th peptide
    await peptide1.hover();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });
  });
});
