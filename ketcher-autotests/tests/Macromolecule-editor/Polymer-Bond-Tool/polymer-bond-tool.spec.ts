import { test, expect } from '@playwright/test';
import {
  selectSingleBondTool,
  waitForPageInit,
  takeEditorScreenshot,
  addSingleMonomerToCanvas,
  clickInTheMiddleOfTheScreen,
} from '@utils';
import {
  hideMonomerPreview,
  turnOnMacromoleculesEditor,
} from '@utils/macromolecules';
import { connectMonomersWithBonds } from '@utils/macromolecules/monomer';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
import { Chems, Peptides } from '@utils/selectors/macromoleculeEditor';
/* eslint-disable no-magic-numbers */

test.describe('Polymer Bond Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Create bond between two peptides', async ({ page }) => {
    /* 
    Test case: #2334 - Create peptide chain (HELM style) - Center-to-Center
    Description: Polymer bond tool
    */
    // Choose peptide
    const MONOMER_NAME = Peptides.Tza;
    const MONOMER_ALIAS = 'Tza';

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

    await takeEditorScreenshot(page);

    // Create bonds between peptides, taking screenshots in middle states
    await bondTwoMonomers(page, peptide1, peptide2);

    await takeEditorScreenshot(page);

    await bondTwoMonomers(page, peptide2, peptide3);

    await bondTwoMonomers(page, peptide4, peptide3);
  });

  test('Create bond between two chems', async ({ page }) => {
    /* 
    Test case: #2497 - Adding chems to canvas - Center-to-Center
    Description: Polymer bond tool
    */
    // Choose chems
    await page.getByText('CHEM').click();
    await page.getByTestId(Chems.hxy).click();

    // Create 2 chems on canvas
    await page.mouse.click(300, 300);
    await page.mouse.click(400, 400);

    // Get 2 chems locators
    const chems = await page.getByText('hxy').locator('..');
    const chem1 = chems.nth(0);
    const chem2 = chems.nth(1);

    // Select bond tool
    await selectSingleBondTool(page);

    // Create bonds between chems, taking screenshots in middle states
    await chem1.hover();
    await page.mouse.down();
    await hideMonomerPreview(page);

    await takeEditorScreenshot(page);
    await chem2.hover();
    await page.mouse.up();
    await hideMonomerPreview(page);
  });
});

test.describe('Signle Bond Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });
  test('Select monomers and pass a bond', async ({ page }) => {
    /* 
      Test case: Macro: #3385 - Overlapping of bonds between 2 monomers
      https://github.com/epam/ketcher/issues/3385 
      Description: The system shall unable user to create more
      than 1 bond between the first and the second monomer
      */
    const MONOMER_NAME = Peptides.Tza;
    const MONOMER_ALIAS = 'Tza';
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
    await selectSingleBondTool(page);
    await bondTwoMonomers(page, peptide1, peptide2);
    await bondTwoMonomers(page, peptide2, peptide1);
    await page.waitForSelector('#error-tooltip');
    const errorTooltip = await page.getByTestId('error-tooltip').innerText();
    const errorMessage =
      "There can't be more than 1 bond between the first and the second monomer";
    expect(errorTooltip).toEqual(errorMessage);
  });

  test('Check in full-screen mode it is possible to add a bond between a Peptide monomers if this bond is pulled not from a specific attachment point R', async ({
    page,
  }) => {
    /* 
    Test case: https://github.com/epam/ketcher/issues/4149
    Description: In full-screen mode it is possible to add a bond between 
    a Peptide monomers if this bond is pulled not from a specific attachment point R (connect it from center to center).
    */
    const x = 800;
    const y = 350;
    await page.locator('.css-1kbfai8').click();
    await page.getByTestId(Peptides.BetaAlanine).click();
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId(Peptides.Ethylthiocysteine).click();
    await page.mouse.click(x, y);
    await connectMonomersWithBonds(page, ['Bal', 'Edc']);
    await takeEditorScreenshot(page);
  });

  test('Check in full-screen mode it is possible to add a bond between a RNA monomers if this bond is pulled not from a specific attachment point R', async ({
    page,
  }) => {
    /* 
    Test case: https://github.com/epam/ketcher/issues/4149
    Description: In full-screen mode it is possible to add a bond between 
    a RNA monomers if this bond is pulled not from a specific attachment point R (connect it from center to center).
    */
    const x = 800;
    const y = 350;
    await page.locator('.css-1kbfai8').click();
    await page.getByTestId('RNA-TAB').click();
    await page.getByTestId('MOE(A)P_A_MOE_P').click();
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('dR(U)P_U_dR_P').click();
    await page.mouse.click(x, y);
    await connectMonomersWithBonds(page, ['P', 'dR']);
    await takeEditorScreenshot(page);
  });

  test('Check in full-screen mode it is possible to add a bond between a CHEM monomers if this bond is pulled not from a specific attachment point R', async ({
    page,
  }) => {
    /* 
    Test case: https://github.com/epam/ketcher/issues/4149
    Description: In full-screen mode it is possible to add a bond between 
    a CHEM monomers if this bond is pulled not from a specific attachment point R.
    */
    const x = 800;
    const y = 350;
    await page.locator('.css-1kbfai8').click();
    await page.getByTestId('CHEM-TAB').click();
    await page.getByTestId('A6OH___6-amino-hexanol').click();
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('Test-6-Ch___Test-6-AP-Chem').click();
    await page.mouse.click(x, y);
    await connectMonomersWithBonds(page, ['A6OH', 'Test-6-Ch']);
    await page
      .locator('div')
      .filter({ hasText: /^R2H$/ })
      .getByRole('button')
      .click();
    await page.getByRole('button', { name: 'R1' }).nth(1).click();
    await page.getByRole('button', { name: 'Connect' }).click();
    await takeEditorScreenshot(page);
  });
});
