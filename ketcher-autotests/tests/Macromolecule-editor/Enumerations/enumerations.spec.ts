import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  waitForPageInit,
  openFileAndAddToCanvas,
  selectEraseTool,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

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
});
