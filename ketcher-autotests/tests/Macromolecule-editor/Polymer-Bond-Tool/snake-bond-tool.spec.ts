import { Page, test, expect } from '@playwright/test';
import {
  addMonomerToCanvas,
  addRnaPresetOnCanvas,
  clickRedo,
  clickUndo,
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

async function createBondedMonomers(page: Page) {
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

  test('Check snake mode arrange for peptides chain', async ({ page }) => {
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

    await addRnaPresetOnCanvas(page, 'A_A_R_P', 300, 300);
    await addRnaPresetOnCanvas(page, 'C_C_R_P', 400, 600);
    await addRnaPresetOnCanvas(page, 'G_G_R_P', 600, 400);

    await selectSingleBondTool(page);

    const phosphate1 = await page
      .locator(`//\*[name() = 'g' and ./\*[name()='text' and .='P']]`)
      .nth(0);

    const phosphate2 = await page
      .locator(`//\*[name() = 'g' and ./\*[name()='text' and .='P']]`)
      .nth(1);

    const sugar1 = await page
      .locator(`//\*[name() = 'g' and ./\*[name()='text' and .='R']]`)
      .nth(1);
    const sugar2 = await page
      .locator(`//\*[name() = 'g' and ./\*[name()='text' and .='R']]`)
      .nth(2);

    await bondTwoMonomers(page, phosphate1, sugar1);
    await bondTwoMonomers(page, phosphate2, sugar2);

    await takeEditorScreenshot(page);
  });

  test('Check snake mode arrange for RNA chain', async ({ page }) => {
    await page.getByText('RNA').click();

    await addRnaPresetOnCanvas(page, 'A_A_R_P', 300, 300);
    await addRnaPresetOnCanvas(page, 'C_C_R_P', 400, 600);
    await addRnaPresetOnCanvas(page, 'G_G_R_P', 600, 400);
    await addRnaPresetOnCanvas(page, 'T_T_R_P', 800, 200);
    await addRnaPresetOnCanvas(page, 'T_T_R_P', 100, 100);

    await selectSingleBondTool(page);

    const phosphate1 = await page
      .locator(`//\*[name() = 'g' and ./\*[name()='text' and .='P']]`)
      .nth(0);
    const phosphate2 = await page
      .locator(`//\*[name() = 'g' and ./\*[name()='text' and .='P']]`)
      .nth(1);
    const phosphate3 = await page
      .locator(`//\*[name() = 'g' and ./\*[name()='text' and .='P']]`)
      .nth(2);
    const phosphate4 = await page
      .locator(`//\*[name() = 'g' and ./\*[name()='text' and .='P']]`)
      .nth(3);
    const sugar1 = await page
      .locator(`//\*[name() = 'g' and ./\*[name()='text' and .='R']]`)
      .nth(1);
    const sugar2 = await page
      .locator(`//\*[name() = 'g' and ./\*[name()='text' and .='R']]`)
      .nth(2);
    const sugar3 = await page
      .locator(`//\*[name() = 'g' and ./\*[name()='text' and .='R']]`)
      .nth(3);
    const sugar4 = await page
      .locator(`//\*[name() = 'g' and ./\*[name()='text' and .='R']]`)
      .nth(4);

    await bondTwoMonomers(page, phosphate1, sugar1);
    await bondTwoMonomers(page, phosphate2, sugar2);
    await bondTwoMonomers(page, phosphate3, sugar3);
    await bondTwoMonomers(page, phosphate4, sugar4);

    await selectSnakeBondTool(page);
    await takeEditorScreenshot(page);
  });

  test('Create snake bond for mix chains with nucleotides and peptides', async ({
    page,
  }) => {
    const peptide1 = await addMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      500,
      500,
      0,
    );
    const peptide2 = await addMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      600,
      600,
      1,
    );

    const peptide3 = await addMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      650,
      650,
      2,
    );

    const peptide4 = await addMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      700,
      500,
      3,
    );
    const peptide5 = await addMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      750,
      550,
      4,
    );
    const peptide6 = await addMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      800,
      600,
      5,
    );
    const peptide7 = await addMonomerToCanvas(
      page,
      MONOMER_NAME_TZA,
      MONOMER_ALIAS_TZA,
      850,
      650,
      6,
    );
    await page.getByText('RNA').click();
    await selectSnakeBondTool(page);

    await addRnaPresetOnCanvas(page, 'A_A_R_P', 200, 200);
    await addRnaPresetOnCanvas(page, 'C_C_R_P', 300, 500);
    await addRnaPresetOnCanvas(page, 'G_G_R_P', 400, 300);

    await selectSingleBondTool(page);

    const phosphate1 = await page
      .locator(`//\*[name() = 'g' and ./\*[name()='text' and .='P']]`)
      .nth(0);
    const phosphate2 = await page
      .locator(`//\*[name() = 'g' and ./\*[name()='text' and .='P']]`)
      .nth(1);
    const phosphate3 = await page
      .locator(`//\*[name() = 'g' and ./\*[name()='text' and .='P']]`)
      .nth(2);

    const sugar1 = await page
      .locator(`//\*[name() = 'g' and ./\*[name()='text' and .='R']]`)
      .nth(1);
    const sugar2 = await page
      .locator(`//\*[name() = 'g' and ./\*[name()='text' and .='R']]`)
      .nth(2);

    await bondTwoMonomers(page, phosphate1, sugar1);
    await bondTwoMonomers(page, phosphate2, sugar2);
    await bondTwoMonomers(page, phosphate3, peptide1);

    await page.locator('button[title=R1]').nth(1).click();
    await page.locator('button[title=Connect]').click();
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

    await addRnaPresetOnCanvas(page, 'A_A_R_P', 200, 200);
    await addRnaPresetOnCanvas(page, 'G_G_R_P', 700, 300);

    await page.getByTestId('summary-Sugars').click();
    const sugarOfNucleoside = await addMonomerToCanvas(
      page,
      'R___Ribose',
      'R',
      500,
      500,
      2,
    );
    await page.getByTestId('summary-Bases').click();
    const baseOfNucleoside = await addMonomerToCanvas(
      page,
      'A___Adenine',
      'A',
      600,
      600,
      1,
    );

    await selectSingleBondTool(page);
    await bondTwoMonomers(page, sugarOfNucleoside, baseOfNucleoside);

    const phosphate = await page
      .locator(`//\*[name() = 'g' and ./\*[name()='text' and .='P']]`)
      .nth(0);

    const sugar = await page
      .locator(`//\*[name() = 'g' and ./\*[name()='text' and .='R']]`)
      .nth(1);

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

    await addRnaPresetOnCanvas(page, 'A_A_R_P', 200, 200);
    await addRnaPresetOnCanvas(page, 'G_G_R_P', 500, 300);
    await addRnaPresetOnCanvas(page, 'T_T_R_P', 700, 300);
    await addRnaPresetOnCanvas(page, 'U_U_R_P', 900, 300);

    await page.getByTestId('summary-Sugars').click();
    const sugarOfNucleoside = await addMonomerToCanvas(
      page,
      'R___Ribose',
      'R',
      350,
      350,
      4,
    );
    await page.getByTestId('summary-Bases').click();
    const baseOfNucleoside = await addMonomerToCanvas(
      page,
      'nC6n8A___6-Aminohexyl-8-aminoadenine',
      'nC6n8A',
      350,
      500,
      0,
    );

    await page.getByTestId('PEPTIDES-TAB').click();

    const monomer1 = await addMonomerToCanvas(
      page,
      'A___Alanine',
      'A',
      500,
      500,
      1,
    );
    const monomer2 = await addMonomerToCanvas(
      page,
      'Hcy___homocysteine',
      'Hcy',
      550,
      550,
      0,
    );
    const monomer3 = await addMonomerToCanvas(
      page,
      'A___Alanine',
      'A',
      600,
      600,
      2,
    );
    const monomer4 = await addMonomerToCanvas(
      page,
      'A___Alanine',
      'A',
      650,
      650,
      3,
    );
    const monomer5 = await addMonomerToCanvas(
      page,
      'A___Alanine',
      'A',
      700,
      700,
      4,
    );
    const monomer6 = await addMonomerToCanvas(
      page,
      'Bal___beta-Alanine',
      'Bal',
      600,
      500,
      0,
    );
    const monomer7 = await addMonomerToCanvas(
      page,
      'Bal___beta-Alanine',
      'Bal',
      650,
      500,
      1,
    );
    const monomer8 = await addMonomerToCanvas(
      page,
      'Bal___beta-Alanine',
      'Bal',
      750,
      500,
      2,
    );

    await selectSingleBondTool(page);
    await bondTwoMonomers(page, sugarOfNucleoside, baseOfNucleoside);
    await bondTwoMonomers(page, baseOfNucleoside, monomer1);
    await page.locator('button[title=R2]').nth(0).click();
    await page.locator('button[title=R1]').nth(1).click();
    await page.locator('button[title=Connect]').click();

    await bondTwoMonomers(page, monomer1, monomer2);
    await bondTwoMonomers(page, monomer2, monomer3);
    await bondTwoMonomers(page, monomer3, monomer4);
    await bondTwoMonomers(page, monomer2, monomer5);
    await page.locator('button[title=R1]').nth(1).click();
    await page.locator('button[title=Connect]').click();

    const phosphate = await page
      .locator(`//\*[name() = 'g' and ./\*[name()='text' and .='P']]`)
      .nth(0);

    const sugar = await page
      .locator(`//\*[name() = 'g' and ./\*[name()='text' and .='R']]`)
      .nth(1);
    const sugar1 = await page
      .locator(`//\*[name() = 'g' and ./\*[name()='text' and .='R']]`)
      .nth(2);
    const phosphate1 = await page
      .locator(`//\*[name() = 'g' and ./\*[name()='text' and .='P']]`)
      .nth(1);
    const phosphate2 = await page
      .locator(`//\*[name() = 'g' and ./\*[name()='text' and .='P']]`)
      .nth(2);
    await bondTwoMonomers(page, phosphate, sugarOfNucleoside);
    await bondTwoMonomers(page, sugarOfNucleoside, sugar);
    await bondTwoMonomers(page, phosphate1, sugar1);
    await bondTwoMonomers(page, phosphate2, monomer6);
    await page.locator('button[title=R1]').nth(1).click();
    await page.locator('button[title=Connect]').click();
    await bondTwoMonomers(page, monomer6, monomer7);
    await bondTwoMonomers(page, monomer7, monomer8);

    await takeEditorScreenshot(page);

    await selectSnakeBondTool(page);
    await takeEditorScreenshot(page);
  });
});
