import { Page, test, expect } from '@playwright/test';
import {
  addSingleMonomerToCanvas,
  addRnaPresetOnCanvas,
  clickRedo,
  clickUndo,
  selectSingleBondTool,
  selectSnakeBondTool,
  takeEditorScreenshot,
  waitForPageInit,
  addBondedMonomersToCanvas,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
/* eslint-disable no-magic-numbers */

const MONOMER_NAME_TZA = 'Tza___3-thiazolylalanine';
const MONOMER_ALIAS_TZA = 'Tza';

async function createBondedMonomers(page: Page) {
  const MONOMER_NAME_DSEC = 'dSec___D-SelenoCysteine';
  const MONOMER_ALIAS_DSEC = 'dSec';
  const MONOMER_NAME_MEC = 'meC___N-Methyl-Cysteine';
  const MONOMER_ALIAS_MEC = 'meC';

  const peptide1 = await addSingleMonomerToCanvas(
    page,
    MONOMER_NAME_DSEC,
    MONOMER_ALIAS_DSEC,
    200,
    200,
    0,
  );

  const [peptide2, peptide3] = await addBondedMonomersToCanvas(
    page,
    MONOMER_NAME_TZA,
    MONOMER_ALIAS_TZA,
    100,
    100,
    50,
    50,
    2,
  );

  const peptide4 = await addSingleMonomerToCanvas(
    page,
    MONOMER_NAME_MEC,
    MONOMER_ALIAS_MEC,
    400,
    400,
    0,
  );

  await selectSingleBondTool(page);

  await bondTwoMonomers(page, peptide1, peptide2);
  await bondTwoMonomers(page, peptide3, peptide4);
}

test.describe('Snake Bond Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Create snake bond between peptides', async ({ page }) => {
    /* 
    Test case: #3280 - Create snake bond 
    Description: Snake bond tool
    */

    await selectSnakeBondTool(page);
    const [, peptide2] = await addBondedMonomersToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      300,
      300,
      100,
      100,
      2,
    );
    const peptide3 = await addSingleMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      300,
      500,
      2,
    );
    const peptide4 = await addSingleMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      200,
      200,
      3,
    );

    await selectSingleBondTool(page);

    await bondTwoMonomers(page, peptide2, peptide3);
    await bondTwoMonomers(page, peptide3, peptide4);

    // await takeEditorScreenshot(page);
  });

  test('Check snake mode arrange for peptides chain', async ({ page }) => {
    /* 
    Test case: #3280 - Check snake mode
    Description: Snake bond tool
    */

    await addBondedMonomersToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      100,
      100,
      50,
      50,
      12,
    );

    await selectSnakeBondTool(page);

    await takeEditorScreenshot(page);
  });

  test('Check finding right chain sequence using snake mode', async ({
    page,
  }) => {
    /*
    Test case: #3280 - Check finding right chain sequence using snake mode
    Description: Snake bond tool
    */
    await createBondedMonomers(page);
    await takeEditorScreenshot(page);
    await selectSnakeBondTool(page);
    await takeEditorScreenshot(page);
  });

  test('Button is not active after undo', async ({ page }) => {
    const snakeModeButton = page.getByTestId('snake-mode-button');
    await createBondedMonomers(page);
    await expect(snakeModeButton).not.toHaveClass(/active/);

    await selectSnakeBondTool(page);
    await expect(snakeModeButton).toHaveClass(/active/);

    await clickUndo(page);
    await expect(snakeModeButton).not.toHaveClass(/active/);

    await clickRedo(page);
    await expect(snakeModeButton).toHaveClass(/active/);
  });

  test('Create snake bond between RNA nucleotides', async ({ page }) => {
    await page.getByText('RNA').click();
    await selectSnakeBondTool(page);

    const { phosphate } = await addRnaPresetOnCanvas(
      page,
      'A_A_R_P',
      300,
      300,
      0,
      0,
    );
    const { sugar: sugar1, phosphate: phosphate1 } = await addRnaPresetOnCanvas(
      page,
      'C_C_R_P',
      400,
      600,
      1,
      1,
    );
    const { sugar: sugar2 } = await addRnaPresetOnCanvas(
      page,
      'G_G_R_P',
      600,
      400,
      2,
      2,
    );

    await selectSingleBondTool(page);

    await bondTwoMonomers(page, phosphate, sugar1);
    await bondTwoMonomers(page, phosphate1, sugar2);

    await takeEditorScreenshot(page);
  });

  test('Check snake mode arrange for RNA chain', async ({ page }) => {
    await page.getByText('RNA').click();

    const { phosphate } = await addRnaPresetOnCanvas(
      page,
      'A_A_R_P',
      300,
      300,
      0,
      0,
    );
    const { sugar: sugar1, phosphate: phosphate1 } = await addRnaPresetOnCanvas(
      page,
      'C_C_R_P',
      400,
      600,
      1,
      1,
    );
    const { sugar: sugar2, phosphate: phosphate2 } = await addRnaPresetOnCanvas(
      page,
      'G_G_R_P',
      600,
      400,
      2,
      2,
    );
    const { sugar: sugar3, phosphate: phosphate3 } = await addRnaPresetOnCanvas(
      page,
      'T_T_R_P',
      800,
      200,
      3,
      3,
    );
    const { sugar: sugar4 } = await addRnaPresetOnCanvas(
      page,
      'T_T_R_P',
      100,
      100,
      4,
      4,
    );

    await selectSingleBondTool(page);

    await bondTwoMonomers(page, phosphate, sugar1);
    await bondTwoMonomers(page, phosphate1, sugar2);
    await bondTwoMonomers(page, phosphate2, sugar3);
    await bondTwoMonomers(page, phosphate3, sugar4);

    await selectSnakeBondTool(page);
    await takeEditorScreenshot(page);
  });

  test('Create snake bond for mix chains with nucleotides and peptides', async ({
    page,
  }) => {
    const peptide1 = await addSingleMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      500,
      500,
      0,
    );
    const peptide2 = await addSingleMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      600,
      600,
      1,
    );

    const peptide3 = await addSingleMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      650,
      650,
      2,
    );

    const peptide4 = await addSingleMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      700,
      500,
      3,
    );
    const peptide5 = await addSingleMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      750,
      550,
      4,
    );
    const peptide6 = await addSingleMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      800,
      600,
      5,
    );
    const peptide7 = await addSingleMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      850,
      650,
      6,
    );
    await page.getByText('RNA').click();
    await selectSnakeBondTool(page);

    const { phosphate } = await addRnaPresetOnCanvas(
      page,
      'A_A_R_P',
      200,
      200,
      0,
      0,
    );
    const { sugar: sugar1, phosphate: phosphate1 } = await addRnaPresetOnCanvas(
      page,
      'C_C_R_P',
      300,
      500,
      1,
      1,
    );
    const { sugar: sugar2, phosphate: phosphate2 } = await addRnaPresetOnCanvas(
      page,
      'G_G_R_P',
      400,
      300,
      2,
      2,
    );

    await selectSingleBondTool(page);

    await bondTwoMonomers(page, phosphate, sugar1);
    await bondTwoMonomers(page, phosphate1, sugar2);
    await bondTwoMonomers(page, phosphate2, peptide1, undefined, 'R1');
    await bondTwoMonomers(page, peptide1, peptide2);
    await bondTwoMonomers(page, peptide2, peptide3);

    await bondTwoMonomers(page, peptide4, peptide5);
    await bondTwoMonomers(page, peptide5, peptide6);
    await bondTwoMonomers(page, peptide6, peptide7);

    await takeEditorScreenshot(page);

    await selectSnakeBondTool(page);
    await takeEditorScreenshot(page);

    await selectSnakeBondTool(page);
    await takeEditorScreenshot(page);
  });

  test('Create snake bond for chain with nucleoside', async ({ page }) => {
    await page.getByText('RNA').click();
    await selectSnakeBondTool(page);

    const { phosphate } = await addRnaPresetOnCanvas(
      page,
      'A_A_R_P',
      200,
      200,
      0,
      0,
    );
    const { sugar } = await addRnaPresetOnCanvas(
      page,
      'G_G_R_P',
      700,
      300,
      1,
      1,
    );

    await page.getByTestId('summary-Sugars').click();
    const sugarOfNucleoside = await addSingleMonomerToCanvas(
      page,
      'R___Ribose',
      'R',
      500,
      500,
      2,
    );
    await page.getByTestId('summary-Bases').click();
    const baseOfNucleoside = await addSingleMonomerToCanvas(
      page,
      'A___Adenine',
      'A',
      600,
      600,
      1,
    );

    await selectSingleBondTool(page);
    await bondTwoMonomers(page, sugarOfNucleoside, baseOfNucleoside);
    await bondTwoMonomers(page, phosphate, sugarOfNucleoside);
    await bondTwoMonomers(page, sugarOfNucleoside, sugar);

    await takeEditorScreenshot(page);

    await selectSnakeBondTool(page);
    await takeEditorScreenshot(page);

    await selectSnakeBondTool(page);
    await takeEditorScreenshot(page);
  });

  test('Create snake bond for chain with side chains', async ({ page }) => {
    await page.getByText('RNA').click();
    const { phosphate } = await addRnaPresetOnCanvas(
      page,
      'C_C_R_P',
      200,
      200,
      0,
      0,
    );
    const { sugar: sugar1, phosphate: phosphate1 } = await addRnaPresetOnCanvas(
      page,
      'G_G_R_P',
      500,
      300,
      1,
      1,
    );
    const { sugar: sugar2, phosphate: phosphate2 } = await addRnaPresetOnCanvas(
      page,
      'T_T_R_P',
      700,
      300,
      2,
      2,
    );
    await addRnaPresetOnCanvas(page, 'U_U_R_P', 900, 300, 3, 3);
    await page.getByTestId('summary-Sugars').click();
    const sugarOfNucleoside = await addSingleMonomerToCanvas(
      page,
      'R___Ribose',
      'R',
      350,
      350,
      4,
    );
    await page.getByTestId('summary-Bases').click();
    const baseOfNucleoside = await addSingleMonomerToCanvas(
      page,
      'nC6n8A___6-Aminohexyl-8-aminoadenine',
      'nC6n8A',
      350,
      500,
      0,
    );

    await page.getByTestId('PEPTIDES-TAB').click();
    const [peptide] = await addBondedMonomersToCanvas(
      page,
      'A___Alanine',
      'A',
      500,
      500,
      50,
      50,
      3,
    );

    const [hcyPeptide, hcyPeptide1] = await addBondedMonomersToCanvas(
      page,
      'Hcy___homocysteine',
      'Hcy',
      600,
      500,
      50,
      0,
      2,
    );

    const [balPeptide] = await addBondedMonomersToCanvas(
      page,
      'Bal___beta-Alanine',
      'Bal',
      700,
      700,
      50,
      0,
      2,
    );
    const balPeptide1 = await addSingleMonomerToCanvas(
      page,
      'Bal___beta-Alanine',
      'Bal',
      850,
      650,
      2,
    );

    await selectSingleBondTool(page);
    await bondTwoMonomers(page, sugarOfNucleoside, baseOfNucleoside);
    await bondTwoMonomers(page, baseOfNucleoside, peptide, 'R2', 'R1');

    await bondTwoMonomers(page, phosphate, sugarOfNucleoside);
    await bondTwoMonomers(page, sugarOfNucleoside, sugar1);
    await bondTwoMonomers(page, phosphate1, sugar2);
    await bondTwoMonomers(page, phosphate2, hcyPeptide, undefined, 'R1');
    await bondTwoMonomers(page, hcyPeptide1, balPeptide);
    await bondTwoMonomers(page, hcyPeptide1, balPeptide1, undefined, 'R1');
    await takeEditorScreenshot(page);

    await selectSnakeBondTool(page);
    await takeEditorScreenshot(page);
  });
});
