/* eslint-disable no-inline-comments */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { Page, test, expect } from '@playwright/test';
import {
  keyboardPressOnCanvas,
  keyboardTypeOnCanvas,
  MacroFileType,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  resetZoomLevelToDefault,
  selectPartOfMolecules,
  takePageScreenshot,
  takeTopToolbarScreenshot,
} from '@utils';
import { waitForPageInit } from '@utils/common';
import { processResetToDefaultState } from '@utils/testAnnotations/resetToDefaultState';
import { TopLeftToolbar } from '@tests/pages/common/TopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/TopRightToolbar';
import { getSymbolLocator } from '@utils/macromolecules/monomer';
import { switchToDNAMode } from '@utils/macromolecules/sequence';

async function clickOnXButton(page: Page) {
  await page.locator('.css-1icymbx').click();
}

export async function selectMolecularMassUnit(
  page: Page,
  unit?: 'Da' | 'kDa' | 'MDa',
) {
  const dropdown = page.getByTestId('dropdown-select').first();
  await expect(dropdown).toBeVisible();
  await dropdown.click();
  if (!unit) return;
  const optionTestId = `${unit}-option`;
  const option = page.getByTestId(optionTestId).first();
  await expect(option).toBeVisible();
  await option.click();
}

async function selectPeptidesPropertiesTab(page: Page) {
  await page.getByTestId('peptides-properties-tab').click();
}

let page: Page;

test.describe('Calculate Properties tests', () => {
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: false,
      goToPeptides: false,
    });
  });

  test.afterEach(async ({ context: _ }, testInfo) => {
    await TopLeftToolbar(page).clearCanvas();
    await TopLeftToolbar(page).calculateProperties();
    await resetZoomLevelToDefault(page);
    await processResetToDefaultState(testInfo, page);
  });

  test.afterAll(async ({ browser }) => {
    await Promise.all(browser.contexts().map((context) => context.close()));
  });

  test('Case 1: Check that "Calculate Properties" icon added to the main toolbar, with the tooltip preview of "Calculate Properties (Alt+C)"', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: "Calculate Properties" icon added to the main toolbar, with the tooltip preview of "Calculate Properties (Alt+C)".
     * Scenario:
     * 1. Go to Macro
     * 2. Check that "Calculate Properties" icon added to the main toolbar, with the tooltip preview of "Calculate Properties (Alt+C)"
     */
    const icon = {
      testId: 'calculate-macromolecule-properties-button',
      title: 'Calculate properties (Alt+C)',
    };
    const iconButton = page.getByTestId(icon.testId);
    await expect(iconButton).toHaveAttribute('title', icon.title);
    await iconButton.hover();
    expect(icon.title).toBeTruthy();
    await takeTopToolbarScreenshot(page);
  });

  test('Case 2: Check that the shortcut Alt+C (Option+C for MacOS) used to invoke the "Calculate Properties" window', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Shortcut Alt+C (Option+C for MacOS) used to invoke the "Calculate Properties" window.
     * Scenario:
     * 1. Go to Macro
     * 2. Use shortcut Alt+C (Option+C for MacOS) to invoke the "Calculate Properties" window
     */
    await keyboardPressOnCanvas(page, 'Alt+C');
    await takePageScreenshot(page);
  });

  test('Case 3: Verify after the user selects one chain/continuous part of one chain and opens the "Calculate Properties" window, Ketcher send the selection to Indigo, and the selection remain', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: After the user selects one chain/continuous part of one chain and opens the "Calculate Properties" window,
     * Ketcher send the selection to Indigo, and the selection remain.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Select one chain/continuous part of one chain
     * 4. Open the "Calculate Properties" window
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)}|PEPTIDE1{Q.W.D.F.G.H.E.R.T.T.I.I.Y}$$$$V2.0',
    );
    await getSymbolLocator(page, {
      symbolAlias: 'Q',
      nodeIndexOverall: 14,
    }).dblclick();
    await page.keyboard.down('Shift');
    for (let i = 0; i < 12; i++) {
      await keyboardPressOnCanvas(page, 'ArrowRight');
    }
    await page.keyboard.up('Shift');
    await TopLeftToolbar(page).calculateProperties();
    await takePageScreenshot(page);
  });

  test('Case 4: Check if only one chain is present on canvas, and the "Calculate Properties" window is opened, Ketcher send the whole canvas to Indigo', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: If only one chain is present on canvas, and the "Calculate Properties" window is opened, Ketcher send the whole canvas to Indigo.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Open the "Calculate Properties" window
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{Q.W.D.F.G.H.E.R.T.T.I.I.Y}$$$$V2.0',
    );
    await TopLeftToolbar(page).calculateProperties();
    await takePageScreenshot(page);
  });

  test('Case 5: Verify if the "Calculate Properties" window is opened and no selection is made when there is more than one chain on canvas, values in the "Calculate Properties" window blank and grayed out, and the window contain an error message: "Select monomer, chain or part of a chain"', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: If the "Calculate Properties" window is opened and no selection is made when there is more than one chain on canvas,
     * values in the "Calculate Properties" window blank and grayed out, and the window contain an error message: "Select monomer, chain or part of a chain".
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Open the "Calculate Properties" window
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{Q.W.D.F.G.H.E.R.T.T.I.I.Y}|RNA1{R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)}$$$$V2.0',
    );
    await TopLeftToolbar(page).calculateProperties();
    await takePageScreenshot(page);
  });

  test('Case 6: Check that if while the "Calculate Properties" window is opened the selection is removed and there is more than one chain on canvas, values in the "Calculate Properties" window reset to blank and be grayed out, and the window contain an error message: "Select monomer, chain or part of a chain"', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: If while the "Calculate Properties" window is opened the selection is removed and there is more than one chain on canvas,
     * values in the "Calculate Properties" window reset to blank and be grayed out, and the window contain an error message: "Select monomer, chain or part of a chain".
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Select one chain/continuous part of one chain
     * 4. Open the "Calculate Properties" window
     * 5. Remove the selection
     * 6. Check that values in the "Calculate Properties" window reset to blank and be grayed out, and the window contain an error message: "Select monomer, chain or part of a chain"
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{Q.W.D.F.G.H.E.R.T.T.I.I.Y}|RNA1{R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)}$$$$V2.0',
    );
    await getSymbolLocator(page, {
      symbolAlias: 'Q',
      nodeIndexOverall: 0,
    }).dblclick();
    await page.keyboard.down('Shift');
    for (let i = 0; i < 12; i++) {
      await keyboardPressOnCanvas(page, 'ArrowRight');
    }
    await page.keyboard.up('Shift');
    await TopLeftToolbar(page).calculateProperties();
    await takePageScreenshot(page);
    await keyboardPressOnCanvas(page, 'Escape');
    await takePageScreenshot(page);
  });

  test('Case 7: Check that the default tab is "Peptides", unless the selection (or the single chain on canvas) contains a valid DNA/RNA double-stranded chain without any amino-acids (Then the default tab is "RNA/DNA")', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Default tab is "Peptides", unless the selection (or the single chain on canvas) contains a valid DNA/RNA
     * double-stranded chain without any amino-acids (Then the default tab is "RNA/DNA").
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Open the "Calculate Properties" window (default tab is "Peptides")
     * 5. Add the selection to RNA/DNA chain
     * 6. Check "Calculate Properties" window (default tab is "RNA/DNA")
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{Q.W.D.F.G.H.E.R.T.T.I.I.Y}|RNA1{R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)}$$$$V2.0',
    );
    await TopLeftToolbar(page).calculateProperties();
    await takePageScreenshot(page);
    await getSymbolLocator(page, {
      symbolAlias: 'A',
      nodeIndexOverall: 14,
    }).dblclick();
    await page.keyboard.down('Shift');
    for (let i = 0; i < 12; i++) {
      await keyboardPressOnCanvas(page, 'ArrowRight');
    }
    await page.keyboard.up('Shift');
    await takePageScreenshot(page);
  });

  test('Case 8: Verify if clicking on the "Calculate Properties" icon when the window is opened, or clicking on the X in the "Calculate Properties" window closes that window', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: If clicking on the "Calculate Properties" icon when the window is opened, or clicking on the X in the "Calculate Properties" window closes that window.
     * Scenario:
     * 1. Go to Macro
     * 2. Click on the "Calculate Properties" (window is opened)
     * 3. Click on the "Calculate Properties" icon
     * 4. Check that the window is closed
     * 5. Click on the "Calculate Properties" icon again
     * 6. Check that the window is opened
     * 7. Click on the X in the "Calculate Properties" window
     * 8. Check that the window is closed
     */
    await TopLeftToolbar(page).calculateProperties();
    await takePageScreenshot(page);
    await TopLeftToolbar(page).calculateProperties();
    await takePageScreenshot(page);
    await TopLeftToolbar(page).calculateProperties();
    await takePageScreenshot(page);
    await clickOnXButton(page);
    await takePageScreenshot(page);
  });

  test('Case 9: Verify that within the drop-down menu for units of Molecular mass there three options Da, kDa, and MDa', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Within the drop-down menu for units of Molecular mass there three options Da, kDa, and MDa.
     * Scenario:
     * 1. Go to Macro
     * 2. Click on the "Calculate Properties"
     * 3. Check that within the drop-down menu for units of Molecular mass there three options Da, kDa, and MDa.
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)}$$$$V2.0',
    );
    await TopLeftToolbar(page).calculateProperties();
    await selectMolecularMassUnit(page);
    await takePageScreenshot(page);
  });

  test('Case 10: Check if indigo returns the value of less than 1000 for Molecular mass, the value rounded up to three digits, and the unit Da', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description:  If indigo returns the value of less than 1000 for Molecular mass, the value rounded up to three digits, and the unit Da,
     * equal than 1000 but less than 1000000 for Molecular mass, the value divided by 1000, rounded up to three digits, and the unit kDa
     * Scenario:
     * 1. Go to Macro
     * 2. Click on the "Calculate Properties"
     * 3. Check that within the drop-down menu for units of Molecular mass there three options Da, kDa, and MDa.
     */
    await keyboardTypeOnCanvas(page, 'AAA');
    await TopLeftToolbar(page).calculateProperties();
    await takePageScreenshot(page);
    await keyboardTypeOnCanvas(page, 'AA');
    await takePageScreenshot(page);
  });

  test('Case 11: Verify that changing the units change the displayed Molecular mass number appropriately', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Сhanging the units change the displayed Molecular mass number appropriately.
     * Scenario:
     * 1. Go to Macro
     * 2. Click on the "Calculate Properties"
     * 3. Change the units from Da to kDa and to MDa
     */
    await keyboardTypeOnCanvas(page, 'AAA');
    await TopLeftToolbar(page).calculateProperties();
    await takePageScreenshot(page);
    await selectMolecularMassUnit(page, 'kDa');
    await takePageScreenshot(page);
    await selectMolecularMassUnit(page, 'MDa');
    await takePageScreenshot(page);
    await selectMolecularMassUnit(page, 'Da');
    await takePageScreenshot(page);
  });

  test('Case 12: Check that if no amino-acids are contained on canvas the peptide-specific properties set to blank and greyed out', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: If no amino-acids are contained on canvas (when there is one chain on canvas), or within the selection,
     * the peptide-specific properties set to blank and greyed out, and the tab contain an error message: "Select an amino acid,
     * chain or part of a chain containing amino acids".
     * Scenario:
     * 1. Go to Macro
     * 2. Add not amino-acids to canvas
     * 3. Click on the "Calculate Properties"
     * 4. Switch to the "Peptides" tab
     */
    await keyboardTypeOnCanvas(page, 'AAA');
    await TopLeftToolbar(page).calculateProperties();
    await takePageScreenshot(page);
    await selectPeptidesPropertiesTab(page);
    await takePageScreenshot(page);
  });

  test('Case 13: Verify that Isoelectric point displayed as a number with two decimal places', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Isoelectric point displayed as a number with two decimal places.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Open the "Calculate Properties" window
     * 4. Check that Isoelectric point displayed as a number with two decimal places
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{Q.W.D.F.G.H.E.R.T.T.I.I.Y}$$$$V2.0',
    );
    await TopLeftToolbar(page).calculateProperties();
    await takePageScreenshot(page);
  });

  test('Case 14: Check that Amino acid count displayed as a grid with the appropriate number next to the natural analogue', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Amino acid count displayed as a grid with the appropriate number next to the natural analogue.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM Peptides
     * 3. Open the "Calculate Properties" window
     * 4. Check that Amino acid count displayed as a grid with the appropriate number next to the natural analogue
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{Q.Q.W.E.E.E.R.T.T.Y.U.I.O.P.A.S.S.D.F.G.H.K.L.C.V.M.K.D.K.D.W.T.W.E.I.G.K.I.G.G.H.H.S.U.K.M.M.C.K.F.K.F.R.I.U.I.E.O.I.K}$$$$V2.0',
    );
    await TopLeftToolbar(page).calculateProperties();
    await takePageScreenshot(page);
  });

  test('Case 15: Check that if a natural analogue does not appear within the selection, the appropriate card grayed out', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: If a natural analogue does not appear within the selection, the appropriate card grayed out.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM Peptides
     * 3. Select one chain/continuous part of one chain
     * 4. Open the "Calculate Properties" window
     * 5. Check that if a natural analogue does not appear within the selection, the appropriate card grayed out
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{Q.Q.W.E.E.E.R.T.T.Y.U.I.O.P.A.S.S.D.F.G.H.K.L.C.V.M.K.D.K.D.W.T.W.E.I.G.K.I.G.G.H.H.S.U.K.M.M.C.K.F.K.F.R.I.U.I.E.O.I.K}$$$$V2.0',
    );
    await selectPartOfMolecules(page, -80);
    await TopLeftToolbar(page).calculateProperties();
    await takePageScreenshot(page);
  });

  test('Case 16: Check that a valid nucleic acid (RNA/DNA) chain is any chain that contains at least one nucleotide/nucleoside', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: A valid nucleic acid (RNA/DNA) chain is any chain that contains at least one nucleotide/nucleoside.
     * Scenario:
     * 1. Go to Macro
     * 2. Add one nucleotide/nucleoside to canvas
     * 3. Click on the "Calculate Properties"
     */
    await switchToDNAMode(page);
    await keyboardTypeOnCanvas(page, 'A');
    await TopLeftToolbar(page).calculateProperties();
    await takePageScreenshot(page);
  });

  test('Case 17: Check that a valid nucleic acid (RNA/DNA) chain is any chain that contains a double stranded pure nucleotide/nucleoside sequence where every base is connected with a base on the other chain via a H-bond', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: A valid nucleic acid (RNA/DNA) chain is any chain that contains a double stranded pure nucleotide/nucleoside
     * sequence where every base is connected with a base on the other chain via a H-bond.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM double stranded nucleotide/nucleoside
     * 4. Open the "Calculate Properties" window
     * 5. Check that a valid nucleic acid (RNA/DNA) chain is any chain that contains a double stranded pure nucleotide/nucleoside
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)}|RNA2{[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)}$RNA1,RNA2,38:pair-2:pair|RNA1,RNA2,35:pair-5:pair|RNA1,RNA2,32:pair-8:pair|RNA1,RNA2,29:pair-11:pair|RNA1,RNA2,26:pair-14:pair|RNA1,RNA2,23:pair-17:pair|RNA1,RNA2,20:pair-20:pair|RNA1,RNA2,17:pair-23:pair|RNA1,RNA2,14:pair-26:pair|RNA1,RNA2,11:pair-29:pair|RNA1,RNA2,8:pair-32:pair|RNA1,RNA2,5:pair-35:pair|RNA1,RNA2,2:pair-38:pair$$$V2.0',
    );
    await TopLeftToolbar(page).calculateProperties();
    await takePageScreenshot(page);
  });

  test('Case 18: Verify if the chain is not valid the Melting temperature area of the RNA/DNA tab set to blank and grayed out', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: If the chain is not valid the Melting temperature area of the RNA/DNA tab set to blank and grayed out.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 4. Open the "Calculate Properties" window
     * 5. Check that if the chain is not valid the Melting temperature area of the RNA/DNA tab set to blank and grayed out
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)}$$$$V2.0',
    );
    await TopLeftToolbar(page).calculateProperties();
    await takePageScreenshot(page);
  });
});
