import { test } from '@playwright/test';
import {
  addMonomerToCanvas,
  selectSingleBondTool,
  selectSnakeBondTool,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
/* eslint-disable no-magic-numbers */

const MONOMER_NAME_TZA = 'Tza___3-thiazolylalanine';
const MONOMER_ALIAS_TZA = 'Tza';

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

    const peptide1 = await addMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      300,
      300,
      0,
    );
    const peptide2 = await addMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      400,
      400,
      1,
    );
    const peptide3 = await addMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      300,
      500,
      2,
    );
    const peptide4 = await addMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      200,
      200,
      3,
    );

    await selectSingleBondTool(page);

    await bondTwoMonomers(page, peptide1, peptide2);
    await bondTwoMonomers(page, peptide2, peptide3);
    await bondTwoMonomers(page, peptide3, peptide4);

    await takeEditorScreenshot(page);
  });

  test('Check snake mode arrange', async ({ page }) => {
    /* 
    Test case: #3280 - Check snake mode
    Description: Snake bond tool
    */

    const peptide1 = await addMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      100,
      100,
      0,
    );
    const peptide2 = await addMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      150,
      150,
      1,
    );
    const peptide3 = await addMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      200,
      200,
      2,
    );
    const peptide4 = await addMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      250,
      250,
      3,
    );
    const peptide5 = await addMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      300,
      300,
      4,
    );
    const peptide6 = await addMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      350,
      350,
      5,
    );
    const peptide7 = await addMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      400,
      400,
      6,
    );
    const peptide8 = await addMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      450,
      450,
      7,
    );
    const peptide9 = await addMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      500,
      500,
      8,
    );
    const peptide10 = await addMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      550,
      550,
      9,
    );

    const peptide11 = await addMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      600,
      600,
      10,
    );
    const peptide12 = await addMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      650,
      650,
      11,
    );

    await selectSingleBondTool(page);

    await bondTwoMonomers(page, peptide1, peptide2);
    await bondTwoMonomers(page, peptide2, peptide3);
    await bondTwoMonomers(page, peptide3, peptide4);
    await bondTwoMonomers(page, peptide4, peptide5);
    await bondTwoMonomers(page, peptide5, peptide6);
    await bondTwoMonomers(page, peptide6, peptide7);
    await bondTwoMonomers(page, peptide7, peptide8);
    await bondTwoMonomers(page, peptide8, peptide9);
    await bondTwoMonomers(page, peptide9, peptide10);
    await bondTwoMonomers(page, peptide10, peptide11);
    await bondTwoMonomers(page, peptide11, peptide12);

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

    const MONOMER_NAME_DSEC = 'dSec___D-SelenoCysteine';
    const MONOMER_ALIAS_DSEC = 'dSec';
    const MONOMER_NAME_MEC = 'meC___N-Methyl-Cysteine';
    const MONOMER_ALIAS_MEC = 'meC';

    const peptide1 = await addMonomerToCanvas(
      page,
      MONOMER_NAME_DSEC,
      MONOMER_ALIAS_DSEC,
      200,
      200,
      0,
    );

    const peptide2 = await addMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      100,
      100,
      0,
    );
    const peptide3 = await addMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      150,
      150,
      1,
    );

    const peptide4 = await addMonomerToCanvas(
      page,
      MONOMER_NAME_MEC,
      MONOMER_ALIAS_MEC,
      400,
      400,
      0,
    );

    await selectSingleBondTool(page);

    await bondTwoMonomers(page, peptide1, peptide2);
    await bondTwoMonomers(page, peptide2, peptide3);
    await bondTwoMonomers(page, peptide3, peptide4);

    await takeEditorScreenshot(page);

    await selectSnakeBondTool(page);

    await takeEditorScreenshot(page);
  });
});
