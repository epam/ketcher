import { Bases } from '@constants/monomers/Bases';
import { Peptides } from '@constants/monomers/Peptides';
import { Sugars } from '@constants/monomers/Sugars';
import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  waitForPageInit,
  openFileAndAddToCanvasMacro,
} from '@utils';
import { selectSnakeLayoutModeTool } from '@utils/canvas/tools/helpers';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';

test.describe('Enumerations', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  });

  test('Verify system enumeration for connected monomers through R2-R1', async ({
    page,
  }) => {
    /* 
    Test case: #3222
    Description: The system start enumeration from the monomer, which has occupied R2 attachment point
    */
    await openFileAndAddToCanvasMacro(
      page,
      'KET/peptides-connected-with-bonds.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Enumerate multiple chains connected via CHEM and verify that they are considered as separate chains', async ({
    page,
  }) => {
    /* 
    Test case: #3222
    Description: The system start enumeration as separate chain when connected through CHEM
    */
    await openFileAndAddToCanvasMacro(
      page,
      'KET/peptides-connected-through-chem.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that different chains connected via CHEM are considered separately, and CHEM itself is not enumerated', async ({
    page,
  }) => {
    /* 
    Test case: #3222
    Description: CHEM are considered separately, and CHEM itself is not enumerated
    */
    await openFileAndAddToCanvasMacro(
      page,
      'KET/three-peptide-chains-connected-through-chems.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Confirm that each chain (RNA and peptide) is counted separately when they are connected', async ({
    page,
  }) => {
    /* 
    Test case: #3222
    Description: each chain (RNA and peptide) is counted separately when they are connected
    */
    await openFileAndAddToCanvasMacro(page, 'KET/rna-and-peptides.ket');
    await takeEditorScreenshot(page);
  });

  test('The system walk along sugar-phosphate core from R2 to R1 until it meets sugar with base', async ({
    page,
  }) => {
    /* 
    Test case: #3222
    Description: The system walk along sugar-phosphate core from R2 to R1 
    until it meets the sugar with the base (attached to R3 AP via R3-R1 bond). Such base counted.
    */
    await openFileAndAddToCanvasMacro(page, 'KET/sugar-phosphate-core.ket');
    await takeEditorScreenshot(page);
  });

  test('Deleting base recalculate chain', async ({ page }) => {
    /* 
    Test case: #3222
    Description: Chain recalculated after deleting base.
    */
    await openFileAndAddToCanvasMacro(page, 'KET/sugar-phosphate-baA.ket');
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await CommonLeftToolbar(page).selectEraseTool();
    await getMonomerLocator(page, Bases.baA).click();
    await takeEditorScreenshot(page);
  });

  test('Undoing base recalculate chain', async ({ page }) => {
    /* 
    Test case: #3222
    Description: Chain recalculated after undoing base.
    */
    await openFileAndAddToCanvasMacro(page, 'KET/sugar-phosphate-baA.ket');
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await CommonLeftToolbar(page).selectEraseTool();
    await getMonomerLocator(page, Bases.baA).click();
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
  });

  test('Remove a monomer and observe how remaining monomers are correctly recalculated and renumbered in linear chain', async ({
    page,
  }) => {
    /* 
    Test case: #3222
    Description: Monomers are correctly recalculated and renumbered in linear chain
    */
    await openFileAndAddToCanvasMacro(
      page,
      'KET/peptides-connected-with-bonds.ket',
    );
    await CommonLeftToolbar(page).selectEraseTool();
    await getMonomerLocator(page, Peptides.Tml).click();
    await takeEditorScreenshot(page);
  });

  test('Monomers are correctly recalculated and renumbered in both linear and branch chains', async ({
    page,
  }) => {
    /* 
    Test case: #3222
    Description: Remove a monomer and observe how the remaining monomers are correctly 
    recalculated and renumbered in both linear and branch chains
    */
    await openFileAndAddToCanvasMacro(
      page,
      'KET/three-peptide-chains-connected-through-chems.ket',
    );
    await CommonLeftToolbar(page).selectEraseTool();
    await getMonomerLocator(page, Peptides.Tml).click();
    await getMonomerLocator(page, Peptides.His1Me).click();
    await getMonomerLocator(page, Peptides.D_Hyp).click();
    await takeEditorScreenshot(page);
  });

  test('Remove first monomer from an RNA linear chain and ensure proper renumbering of the preceding monomers', async ({
    page,
  }) => {
    /* 
    Test case: #3222
    Description: Remove first a monomer and observe how the remaining monomers are correctly 
    recalculated and renumbered in both linear and branch chains
    */
    await openFileAndAddToCanvasMacro(page, 'Molfiles-V3000/modified-rna.mol');
    await selectSnakeLayoutModeTool(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await getMonomerLocator(page, Sugars._25R).click();
    await takeEditorScreenshot(page);
  });

  test('Remove the last monomer from an RNA linear chain and ensure proper renumbering of the preceding monomers', async ({
    page,
  }) => {
    /* 
    Test case: #3222
    Description: Remove a monomer and observe how the remaining monomers are correctly 
    recalculated and renumbered in both linear and branch chains
    */
    await openFileAndAddToCanvasMacro(page, 'Molfiles-V3000/modified-rna.mol');
    await selectSnakeLayoutModeTool(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await getMonomerLocator(page, Sugars._3A6).click();
    await takeEditorScreenshot(page);
  });

  test('Remove a monomer from middle of an RNA linear chain and verify the correct renumbering of the remaining monomers', async ({
    page,
  }) => {
    /* 
    Test case: #3222
    Description: Remove a monomer from middle and observe how the remaining monomers are correctly 
    recalculated and renumbered in both linear and branch chains
    */
    await openFileAndAddToCanvasMacro(
      page,
      'Molfiles-V3000/rna-modified-sugars.mol',
    );
    await selectSnakeLayoutModeTool(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await getMonomerLocator(page, Sugars._5A6).click();
    await takeEditorScreenshot(page);
  });

  test('After Undo monomers are correctly recalculated and renumbered in both linear and branch chains', async ({
    page,
  }) => {
    /* 
    Test case: #3222
    Description: After Undo monomers are correctly 
    recalculated and renumbered in both linear and branch chains
    */
    await openFileAndAddToCanvasMacro(
      page,
      'KET/three-peptide-chains-connected-through-chems.ket',
    );
    await CommonLeftToolbar(page).selectEraseTool();
    await getMonomerLocator(page, Peptides.Tml).click();
    await getMonomerLocator(page, Peptides.His1Me).click();
    await getMonomerLocator(page, Peptides.D_Hyp).click();

    const pressCount = 3;
    for (let i = 0; i < pressCount; i++) {
      await CommonTopLeftToolbar(page).undo();
    }
    await takeEditorScreenshot(page);
  });

  test('Remove a monomer from a chain that overlaps with another chain and ensure proper renumbering in both chains', async ({
    page,
  }) => {
    /* 
    Test case: #3222
    Description: After deleted proper renumbering in both chains and after Undo monomers are correctly 
    recalculated and renumbered in both linear and branch chains
    */
    await openFileAndAddToCanvasMacro(
      page,
      'KET/intersected-monomers-chains.ket',
    );
    await CommonLeftToolbar(page).selectEraseTool();
    await getMonomerLocator(page, Peptides.Hcy).click();
    await getMonomerLocator(page, Peptides.meC).click();
    await takeEditorScreenshot(page);
    const pressCount = 2;
    for (let i = 0; i < pressCount; i++) {
      await CommonTopLeftToolbar(page).undo();
    }
    await takeEditorScreenshot(page);
  });
});
