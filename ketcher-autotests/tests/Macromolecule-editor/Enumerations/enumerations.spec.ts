import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  waitForPageInit,
  openFileAndAddToCanvas,
  selectEraseTool,
  selectSnakeLayoutModeTool,
} from '@utils';
import {
  turnOnMacromoleculesEditor,
  zoomWithMouseWheel,
} from '@utils/macromolecules';

test.describe('Enumerations', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Verify system enumeration for connected monomers through R2-R1', async ({
    page,
  }) => {
    /* 
    Test case: #3222
    Description: The system start enumeration from the monomer, which has occupied R2 attachment point
    */
    await openFileAndAddToCanvas('KET/peptides-connected-with-bonds.ket', page);
    await takeEditorScreenshot(page);
  });

  test('Enumerate multiple chains connected via CHEM and verify that they are considered as separate chains', async ({
    page,
  }) => {
    /* 
    Test case: #3222
    Description: The system start enumeration as separate chain when connected through CHEM
    */
    await openFileAndAddToCanvas(
      'KET/peptides-connected-through-chem.ket',
      page,
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
    await openFileAndAddToCanvas(
      'KET/three-peptide-chains-connected-through-chems.ket',
      page,
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
    await openFileAndAddToCanvas('KET/rna-and-peptides.ket', page);
    await takeEditorScreenshot(page);
  });

  test('Remove a monomer and observe how remaining monomers are correctly recalculated and renumbered in linear chain', async ({
    page,
  }) => {
    /* 
    Test case: #3222
    Description: Monomers are correctly recalculated and renumbered in linear chain
    */
    await openFileAndAddToCanvas('KET/peptides-connected-with-bonds.ket', page);
    await selectEraseTool(page);
    await page.getByText('Tml').locator('..').first().click();
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
    await openFileAndAddToCanvas(
      'KET/three-peptide-chains-connected-through-chems.ket',
      page,
    );
    await selectEraseTool(page);
    await page.getByText('Tml').locator('..').first().click();
    await page.getByText('His1Me').locator('..').first().click();
    await page.getByText('D-Hyp').locator('..').first().click();
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
    await openFileAndAddToCanvas('Molfiles-V3000/modified-rna.mol', page);
    await selectSnakeLayoutModeTool(page);
    await selectEraseTool(page);
    await page.getByText('25R').locator('..').first().click();
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
    const ZOOM_OUT_VALUE = 400;
    await openFileAndAddToCanvas('Molfiles-V3000/modified-rna.mol', page);
    await selectSnakeLayoutModeTool(page);
    await zoomWithMouseWheel(page, ZOOM_OUT_VALUE);
    await selectEraseTool(page);
    await page.getByText('3A6').locator('..').first().click();
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
    const ZOOM_OUT_VALUE = 400;
    await openFileAndAddToCanvas(
      'Molfiles-V3000/rna-modified-sugars.mol',
      page,
    );
    await selectSnakeLayoutModeTool(page);
    await zoomWithMouseWheel(page, ZOOM_OUT_VALUE);
    await selectEraseTool(page);
    await page.getByText('5A6').locator('..').first().click();
    await takeEditorScreenshot(page);
  });
});
