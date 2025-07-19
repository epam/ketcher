/* eslint-disable promise/param-names */
/* eslint-disable no-inline-comments */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { Page, test, expect } from '@playwright/test';
import {
  delay,
  keyboardPressOnCanvas,
  keyboardTypeOnCanvas,
  MacroFileType,
  moveMouseAway,
  openFileAndAddToCanvasAsNewProjectMacro,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  resetZoomLevelToDefault,
  selectPartOfMolecules,
  takeElementScreenshot,
  takePageScreenshot,
  takeTopToolbarScreenshot,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import { waitForPageInit } from '@utils/common';
import { processResetToDefaultState } from '@utils/testAnnotations/resetToDefaultState';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { getSymbolLocator } from '@utils/macromolecules/monomer';
import {
  switchToDNAMode,
  switchToPeptideMode,
  switchToRNAMode,
} from '@utils/macromolecules/sequence';
import { Peptides } from '@constants/monomers/Peptides';
import { Presets } from '@constants/monomers/Presets';
import { Chem } from '@constants/monomers/Chem';
import { Library } from '@tests/pages/macromolecules/Library';
import { CalculateVariablesPanel } from '@tests/pages/macromolecules/CalculateVariablesPanel';
import {
  MolecularMassUnit,
  OligonucleotidesUnit,
  UnipositiveIonsUnit,
} from '@tests/pages/constants/calculateVariablesPanel/Constants';
import { waitForCalculateProperties } from '@utils/common/loaders/waitForCalculateProperties';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';

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
    if (await CalculateVariablesPanel(page).closeButton.isVisible()) {
      await CalculateVariablesPanel(page).close();
    }
    await CommonTopLeftToolbar(page).clearCanvas();
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
    await expect(icon.title).toBeTruthy();
    await takeTopToolbarScreenshot(page);
    await iconButton.click();
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
    await moveMouseAway(page);
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
      await keyboardPressOnCanvas(page, 'ArrowRight', {
        waitForRenderTimeOut: 2,
      });
    }
    await page.keyboard.up('Shift');
    await CommonTopLeftToolbar(page).calculateProperties();
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
    await CommonTopLeftToolbar(page).calculateProperties();
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
    await CommonTopLeftToolbar(page).calculateProperties();
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
      await keyboardPressOnCanvas(page, 'ArrowRight', {
        waitForRenderTimeOut: 2,
      });
    }
    await page.keyboard.up('Shift');
    await CommonTopLeftToolbar(page).calculateProperties();
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
     * 4. Add the selection to RNA/DNA chain
     * 5. Check "Calculate Properties" window (default tab is "RNA/DNA")
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{Q.W.D.F.G.H.E.R.T.T.I.I.Y}|RNA1{R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)}$$$$V2.0',
    );
    await CommonTopLeftToolbar(page).calculateProperties();
    await takePageScreenshot(page);
    await getSymbolLocator(page, {
      symbolAlias: 'A',
      nodeIndexOverall: 14,
    }).dblclick();
    await page.keyboard.down('Shift');
    for (let i = 0; i < 2; i++) {
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
    await CommonTopLeftToolbar(page).calculateProperties();
    await takePageScreenshot(page);
    await CommonTopLeftToolbar(page).calculateProperties();
    await takePageScreenshot(page);
    await CommonTopLeftToolbar(page).calculateProperties();
    await takePageScreenshot(page);
    await CalculateVariablesPanel(page).close();
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
      'RNA1{R(A)}$$$$V2.0',
    );
    await CommonTopLeftToolbar(page).calculateProperties();
    await CalculateVariablesPanel(page).molecularMassUnitsCombobox.click();
    await expect(page.getByTestId(MolecularMassUnit.Da)).toBeVisible();
    await expect(page.getByTestId(MolecularMassUnit.MDa)).toBeVisible();
    await expect(page.getByTestId(MolecularMassUnit.kDa)).toBeVisible();
    await page.keyboard.press('Escape');
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
    await CommonTopLeftToolbar(page).calculateProperties();
    expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
      '925.653',
    );
    await waitForCalculateProperties(page, async () => {
      await keyboardTypeOnCanvas(page, 'AA');
    });
    await delay(1);
    expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
      '1.584',
    );
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
    await CommonTopLeftToolbar(page).calculateProperties();
    await page.waitForTimeout(1000);
    expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
      '925.653',
    );
    await CalculateVariablesPanel(page).setMolecularMassUnits(
      MolecularMassUnit.kDa,
    );
    expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
      '0.926',
    );
    await CalculateVariablesPanel(page).setMolecularMassUnits(
      MolecularMassUnit.MDa,
    );
    expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
      '0.001',
    );
    await CalculateVariablesPanel(page).setMolecularMassUnits(
      MolecularMassUnit.Da,
    );
    expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
      '925.653',
    );
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
    await CommonTopLeftToolbar(page).calculateProperties();
    await takePageScreenshot(page);
    await CalculateVariablesPanel(page).peptidesTab.click();
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
      'PEPTIDE1{A.C.C.D.D.D.E.E.E.E.F.F.F.F.F.G.G.G.G.G.G.H.H.H.H.H.H.H.I.I.I.I.I.I.I.I.K.K.K.K.K.K.K.K.K.L.L.L.L.L.L.L.L.L.L.M.M.M.M.M.M.M.M.M.M.M.N.N.N.N.N.N.N.N.N.N.N.N.P.P.P.P.P.P.P.P.P.P.P.P.P.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.R.R.R.R.R.R.R.R.R.R.R.R.R.R.R.S.S.S.S.S.S.S.S.S.S.S.S.S.S.S.S.T.T.T.T.T.T.T.T.T.T.T.T.T.T.T.T.T.V.V.V.V.V.V.V.V.V.V.V.V.V.V.V.V.V.V.W.W.W.W.W.W.W.W.W.W.W.W.W.W.W.W.W.W.W.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.(D,N).(L,I).(E,Q).(A,C,D,E,F,G,H,I,K,L,M,N,O,P,Q,R,S,T,U,V,W,Y).[2Abz].[3Abz].[4Abz].[Abu23D].[Ac3c].[Ac6c].[Aca].[Aib].[Aoda].[Apm].[App].[Asu].[Azi].[Bmt].[Bmt_E].O.U}$$$$V2.0',
    );
    await CommonTopLeftToolbar(page).calculateProperties();
    expect(
      await CalculateVariablesPanel(page).getIsoelectricPointValue(),
    ).toEqual('5.96');
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
      'PEPTIDE1{A.C.C.D.D.D.E.E.E.E.F.F.F.F.F.G.G.G.G.G.G.H.H.H.H.H.H.H.I.I.I.I.I.I.I.I.K.K.K.K.K.K.K.K.K.L.L.L.L.L.L.L.L.L.L.M.M.M.M.M.M.M.M.M.M.M.N.N.N.N.N.N.N.N.N.N.N.N.P.P.P.P.P.P.P.P.P.P.P.P.P.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.R.R.R.R.R.R.R.R.R.R.R.R.R.R.R.S.S.S.S.S.S.S.S.S.S.S.S.S.S.S.S.T.T.T.T.T.T.T.T.T.T.T.T.T.T.T.T.T.V.V.V.V.V.V.V.V.V.V.V.V.V.V.V.V.V.V.W.W.W.W.W.W.W.W.W.W.W.W.W.W.W.W.W.W.W.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.(L,I).(D,N).(E,Q).(A,C,D,E,F,G,H,I,K,L,M,N,O,P,Q,R,S,T,U,V,W,Y).[Wil].[Tic].[Pqa].[pnT].[pnG].[Pqa].[pnC].[pnA].[Pip].[Oic3aS].[Oic].[Oic3aR].[NMe4Ab].[Dsu].[DBmtE].O.U}$$$$V2.0',
    );
    await CommonTopLeftToolbar(page).calculateProperties();
    expect(
      await CalculateVariablesPanel(page).getPeptideNaturalAnalogCountList(),
    ).toEqual([
      'A1',
      'C2',
      'D3',
      'E4',
      'F5',
      'G6',
      'H7',
      'I8',
      'K9',
      'L10',
      'M11',
      'N12',
      'O0',
      'P13',
      'Q14',
      'R15',
      'S16',
      'T17',
      'U0',
      'V18',
      'W19',
      'Y20',
      'Other21',
    ]);
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
    await getSymbolLocator(page, {
      symbolAlias: 'Q',
      nodeIndexOverall: 0,
    }).dblclick();
    await page.keyboard.down('Shift');
    for (let i = 0; i < 16; i++) {
      await keyboardPressOnCanvas(page, 'ArrowRight', {
        waitForRenderTimeOut: 2,
      });
    }
    await page.keyboard.up('Shift');
    await CommonTopLeftToolbar(page).calculateProperties();
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
    await CommonTopLeftToolbar(page).calculateProperties();
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
     * 3. Open the "Calculate Properties" window
     * 4. Check that a valid nucleic acid (RNA/DNA) chain is any chain that contains a double stranded pure nucleotide/nucleoside
     */
    await switchToRNAMode(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)}|RNA2{[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)}$RNA1,RNA2,38:pair-2:pair|RNA1,RNA2,35:pair-5:pair|RNA1,RNA2,32:pair-8:pair|RNA1,RNA2,29:pair-11:pair|RNA1,RNA2,26:pair-14:pair|RNA1,RNA2,23:pair-17:pair|RNA1,RNA2,20:pair-20:pair|RNA1,RNA2,17:pair-23:pair|RNA1,RNA2,14:pair-26:pair|RNA1,RNA2,11:pair-29:pair|RNA1,RNA2,8:pair-32:pair|RNA1,RNA2,5:pair-35:pair|RNA1,RNA2,2:pair-38:pair$$$V2.0',
    );
    await CommonTopLeftToolbar(page).calculateProperties();
    await takePageScreenshot(page);
  });

  test('Case 18: Verify if the chain is not valid the Melting temperature area of the RNA/DNA tab set to blank and grayed out', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: If the chain is not valid the Melting temperature area of the RNA/DNA tab set to blank and grayed out.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Open the "Calculate Properties" window
     * 4. Check that if the chain is not valid the Melting temperature area of the RNA/DNA tab set to blank and grayed out
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)}$$$$V2.0',
    );
    await CommonTopLeftToolbar(page).calculateProperties();
    await takePageScreenshot(page);
  });

  test('Case 19: Verify that Melting temperature displayed as a number with one decimal point', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Melting temperature displayed as a number with one decimal point.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Open the "Calculate Properties" window
     * 4. Check that Melting temperature displayed as a number with one decimal point
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)}|RNA2{[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)}$RNA1,RNA2,38:pair-2:pair|RNA1,RNA2,35:pair-5:pair|RNA1,RNA2,32:pair-8:pair|RNA1,RNA2,29:pair-11:pair|RNA1,RNA2,26:pair-14:pair|RNA1,RNA2,23:pair-17:pair|RNA1,RNA2,20:pair-20:pair|RNA1,RNA2,17:pair-23:pair|RNA1,RNA2,14:pair-26:pair|RNA1,RNA2,11:pair-29:pair|RNA1,RNA2,8:pair-32:pair|RNA1,RNA2,5:pair-35:pair|RNA1,RNA2,2:pair-38:pair$$$V2.0',
    );
    await CommonTopLeftToolbar(page).calculateProperties();
    expect(
      await CalculateVariablesPanel(page).getMeltingTemperatureValue(),
    ).toEqual('35.6');
  });

  test('Case 20: Check that values for the concentration of unipositive ions and oligonucleotides can be changed by the user, but the default/preset values are 140mM and 200μM respectively', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Values for the concentration of unipositive ions and oligonucleotides can be changed by the user,
     * but the default/preset values are 140mM and 200μM respectively.
     * Within the drop-down menu for units of these two concentrations there three options nM, μM, and mM.
     * Changing the units change the numbers appropriately.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Open the "Calculate Properties" window
     * 4. Check that values for the concentration of unipositive ions and oligonucleotides can be changed by the user,
     * but the default/preset values are 140mM and 200μM respectively
     * 5. Check that within the drop-down menu for units of these two concentrations there three options nM, μM, and mM
     * 6. Check that changing the units change the numbers appropriately
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)}|RNA2{[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)}$RNA1,RNA2,38:pair-2:pair|RNA1,RNA2,35:pair-5:pair|RNA1,RNA2,32:pair-8:pair|RNA1,RNA2,29:pair-11:pair|RNA1,RNA2,26:pair-14:pair|RNA1,RNA2,23:pair-17:pair|RNA1,RNA2,20:pair-20:pair|RNA1,RNA2,17:pair-23:pair|RNA1,RNA2,14:pair-26:pair|RNA1,RNA2,11:pair-29:pair|RNA1,RNA2,8:pair-32:pair|RNA1,RNA2,5:pair-35:pair|RNA1,RNA2,2:pair-38:pair$$$V2.0',
    );
    await CommonTopLeftToolbar(page).calculateProperties();
    await takePageScreenshot(page);
    await CalculateVariablesPanel(page).setUnipositiveIonsUnits(
      UnipositiveIonsUnit.μM,
    );
    await CalculateVariablesPanel(page).setOligonucleotidesUnits(
      OligonucleotidesUnit.mM,
    );
    expect(
      await CalculateVariablesPanel(page).getMeltingTemperatureValue(),
    ).toEqual('7.5');

    await CalculateVariablesPanel(page).setUnipositiveIonsUnits(
      UnipositiveIonsUnit.nM,
    );
    await CalculateVariablesPanel(page).setOligonucleotidesUnits(
      OligonucleotidesUnit.nM,
    );
    expect(
      await CalculateVariablesPanel(page).getMeltingTemperatureValue(),
    ).toEqual('-39');

    await CalculateVariablesPanel(page).setUnipositiveIonsUnits(
      UnipositiveIonsUnit.mM,
    );
    await CalculateVariablesPanel(page).setOligonucleotidesUnits(
      OligonucleotidesUnit.μM,
    );
    expect(
      await CalculateVariablesPanel(page).getMeltingTemperatureValue(),
    ).toEqual('35.6');
  });

  test('Case 21: Check that Base count displayed as a grid with the appropriate number next to the natural analogue', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Base count displayed as a grid with the appropriate number next to the natural analogue.
     * If a natural analogue does not appear within the selection, the appropriate card is grayed out.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Open the "Calculate Properties" window
     * 4. Check that Base count displayed as a grid with the appropriate number next to the natural analogue
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[dR](A)P.[dR](G)P.[dR](T)}$$$$V2.0',
    );
    await CommonTopLeftToolbar(page).calculateProperties();
    expect(await CalculateVariablesPanel(page).getMolecularFormula()).toEqual(
      'C30H38N12O16P2',
    );
    expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
      '884.641',
    );
    expect(
      await CalculateVariablesPanel(page).getNucleotideNaturalAnalogCountList(),
    ).toEqual(['A1', 'C0', 'G1', 'T1', 'U0', 'Other0']);
  });

  test('Case 22: Check if a natural analogue does not appear within the selection, the appropriate card is grayed out', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: If a natural analogue does not appear within the selection, the appropriate card is grayed out.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Open the "Calculate Properties" window
     * 4. Select one chain/continuous part of one chain
     * 5. Check that if a natural analogue does not appear within the selection, the appropriate card is grayed out
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[dR](A)P.[dR](C)P.[dR](G)P.[dR](T)P.[dR](U)}$$$$V2.0',
    );
    await getSymbolLocator(page, {
      symbolAlias: 'A',
      nodeIndexOverall: 0,
    }).dblclick();
    await page.keyboard.down('Shift');
    for (let i = 0; i < 2; i++) {
      await keyboardPressOnCanvas(page, 'ArrowRight', {
        waitForRenderTimeOut: 2,
      });
    }
    await page.keyboard.up('Shift');
    await CommonTopLeftToolbar(page).calculateProperties();
    expect(await CalculateVariablesPanel(page).getMolecularFormula()).toEqual(
      'C29H37N13O17P3',
    );
    expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
      '932.602',
    );
    expect(
      await CalculateVariablesPanel(page).getNucleotideNaturalAnalogCountList(),
    ).toEqual(['A1', 'C1', 'G1', 'T0', 'U0', 'Other0']);
  });

  test('Case 23: Check Calculation Properties for standard R2-R1 connected monomers with microstructure', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Calculation Properties for standard R2-R1 connected monomers with microstructure displayed.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from file
     * 3. Select all
     * 4. Open the "Calculate Properties" window
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/peptide-connected-to-microstructure-r2-r1.ket',
    );
    await CommonTopLeftToolbar(page).calculateProperties();
    expect(await CalculateVariablesPanel(page).getMolecularFormula()).toEqual(
      'C10H13NOS',
    );
    expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
      '195.281',
    );
    expect(
      await CalculateVariablesPanel(page).getIsoelectricPointValue(),
    ).toEqual('8.49');
    expect(
      await CalculateVariablesPanel(page).getExtinctionCoefficientValue(),
    ).toEqual('125');
    expect(
      await CalculateVariablesPanel(page).getPeptideNaturalAnalogCountList(),
    ).toEqual([
      'A0',
      'C1',
      'D0',
      'E0',
      'F0',
      'G0',
      'H0',
      'I0',
      'K0',
      'L0',
      'M0',
      'N0',
      'O0',
      'P0',
      'Q0',
      'R0',
      'S0',
      'T0',
      'U0',
      'V0',
      'W0',
      'Y0',
      'Other0',
    ]);
    await takePageScreenshot(page);
  });

  test('Case 24: Check Calculation Properties for non-standard R3-R1 connected monomers with microstructure', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Calculation Properties for standard R3-R1 connected monomers with microstructure displayed.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from file
     * 3. Select all
     * 4. Open the "Calculate Properties" window
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/peptide-connected-to-microstructure-r3-r1.ket',
    );
    await CommonTopLeftToolbar(page).calculateProperties();
    expect(await CalculateVariablesPanel(page).getMolecularFormula()).toEqual(
      'C10H13NO2S',
    );
    expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
      '211.281',
    );
    expect(
      await CalculateVariablesPanel(page).getIsoelectricPointValue(),
    ).toEqual('8.49');
    expect(
      await CalculateVariablesPanel(page).getExtinctionCoefficientValue(),
    ).toEqual('125');
    expect(
      await CalculateVariablesPanel(page).getPeptideNaturalAnalogCountList(),
    ).toEqual([
      'A0',
      'C1',
      'D0',
      'E0',
      'F0',
      'G0',
      'H0',
      'I0',
      'K0',
      'L0',
      'M0',
      'N0',
      'O0',
      'P0',
      'Q0',
      'R0',
      'S0',
      'T0',
      'U0',
      'V0',
      'W0',
      'Y0',
      'Other0',
    ]);
  });

  test('Case 25: Verify correct molecular formula and molecular mass calculation for whole benzene ring (C6H6,  78.11 Da)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Correct molecular formula and molecular mass calculation for whole benzene ring (C6H6,  78.11 Da).
     * Scenario:
     * 1. Go to Macro
     * 2. Load from file
     * 3. Open the "Calculate Properties" window
     */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/single-benzene-ring.ket',
    );
    await CommonTopLeftToolbar(page).calculateProperties();
    const molecularFormula = await CalculateVariablesPanel(
      page,
    ).getMolecularFormula();
    const molecularMass = await CalculateVariablesPanel(
      page,
    ).getMolecularMassValue();

    expect(molecularFormula).toEqual('C6H6');
    expect(molecularMass).toEqual('78.112');
  });

  test('Case 26: Verify correct molecular formula and molecular mass calculation for selection of part benzene ring', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Correct molecular formula and molecular mass calculation for selection of part benzene ring.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from file
     * 3. Select part of benzene ring
     * 4. Open the "Calculate Properties" window
     */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/single-benzene-ring.ket',
    );
    await selectPartOfMolecules(page, 10);
    await CommonTopLeftToolbar(page).calculateProperties();
    const molecularFormula = await CalculateVariablesPanel(
      page,
    ).getMolecularFormula();
    const molecularMass = await CalculateVariablesPanel(
      page,
    ).getMolecularMassValue();

    expect(molecularFormula).toEqual('C3H3');
    expect(molecularMass).toEqual('39.056');
  });

  test('Case 27: Verify correct molecular formula and molecular mass calculation for selection of part benzene ring connected to Peptides sequence', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Correct molecular formula and molecular mass calculation for selection of part benzene ring connected to Peptides sequence.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from file
     * 3. Select part of benzene ring
     * 4. Open the "Calculate Properties" window
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/benzene-ring-connected-to-peptide.ket',
    );
    await selectPartOfMolecules(page, -80);
    await CommonTopLeftToolbar(page).calculateProperties();
    const molecularFormula = await CalculateVariablesPanel(
      page,
    ).getMolecularFormula();
    const molecularMass = await CalculateVariablesPanel(
      page,
    ).getMolecularMassValue();

    expect(molecularFormula).toEqual('C2H2');
    expect(molecularMass).toEqual('26.037');
  });

  test('Case 28: Verify correct molecular formula and molecular mass calculation for selection of part benzene ring connected to RNA/DNA sequence', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Correct molecular formula and molecular mass calculation for selection of part benzene ring connected to RNA/DNA sequence.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from file
     * 3. Select part of benzene ring
     * 4. Open the "Calculate Properties" window
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/benzene-ring-connected-to-rna.ket',
    );
    await selectPartOfMolecules(page, -80);
    await CommonTopLeftToolbar(page).calculateProperties();
    const molecularFormula = await CalculateVariablesPanel(
      page,
    ).getMolecularFormula();
    const molecularMass = await CalculateVariablesPanel(
      page,
    ).getMolecularMassValue();

    expect(molecularFormula).toEqual('C3H3');
    expect(molecularMass).toEqual('39.056');
  });

  test('Case 29: Verify correct molecular formula and molecular mass calculation for selection of benzene ring connected to Peptides sequence', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Сorrect molecular formula and molecular mass calculation for selection of benzene ring connected to Peptides sequence.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from file
     * 3. Select all
     * 4. Open the "Calculate Properties" window
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/benzene-ring-connected-to-peptide.ket',
    );
    await selectAllStructuresOnCanvas(page);
    await CommonTopLeftToolbar(page).calculateProperties();
    const molecularFormula = await CalculateVariablesPanel(
      page,
    ).getMolecularFormula();
    const molecularMass = await CalculateVariablesPanel(
      page,
    ).getMolecularMassValue();

    expect(molecularFormula).toEqual('C9H11NO');
    expect(molecularMass).toEqual('149.19');
  });

  test('Case 30: Verify correct molecular formula and molecular mass calculation for selection of benzene ring connected to RNA/DNA sequence', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Сorrect molecular formula and molecular mass calculation for selection of benzene ring connected to RNA/DNA sequence.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from file
     * 3. Select all
     * 4. Open the "Calculate Properties" window
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/benzene-ring-connected-to-rna.ket',
    );
    await selectAllStructuresOnCanvas(page);
    await CommonTopLeftToolbar(page).calculateProperties();
    const molecularFormula = await CalculateVariablesPanel(
      page,
    ).getMolecularFormula();
    const molecularMass = await CalculateVariablesPanel(
      page,
    ).getMolecularMassValue();

    expect(molecularFormula).toEqual('C16H18N5O6P');
    expect(molecularMass).toEqual('407.318');
  });

  test('Case 31: Verify correct molecular formula and molecular mass  of structures with multiple rings (e.g., naphthalene)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Correct molecular formula and molecular mass  of structures with multiple rings (e.g., naphthalene).
     * Scenario:
     * 1. Go to Macro
     * 2. Load from file
     * 3. Open the "Calculate Properties" window
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openFileAndAddToCanvasAsNewProjectMacro(page, 'KET/naphthalene.ket');
    await selectAllStructuresOnCanvas(page);
    await CommonTopLeftToolbar(page).calculateProperties();
    const molecularFormula = await CalculateVariablesPanel(
      page,
    ).getMolecularFormula();
    const molecularMass = await CalculateVariablesPanel(
      page,
    ).getMolecularMassValue();

    expect(molecularFormula).toEqual('C10H8');
    expect(molecularMass).toEqual('128.171');
  });

  test('Case 32: Verify that the molecular formula and molecular mass is correctly calculated for a simple peptide structure', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: The molecular formula and molecular mass is correctly calculated for a simple peptide structure.
     * Scenario:
     * 1. Go to Macro
     * 2. Select a simple peptide structure
     * 3. Open the "Calculate Properties" window
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await Library(page).selectMonomer(Peptides.A);
    await CommonTopLeftToolbar(page).calculateProperties();
    const molecularFormula = await CalculateVariablesPanel(
      page,
    ).getMolecularFormula();
    const molecularMass = await CalculateVariablesPanel(
      page,
    ).getMolecularMassValue();

    expect(molecularFormula).toEqual('C3H7NO2');
    expect(molecularMass).toEqual('89.093');
  });

  test('Case 33: Verify that the molecular formula and molecular mass is correctly calculated for a simple RNA/DNA structure', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: The molecular formula and molecular mass is correctly calculated for a simple RNA/DNA structure.
     * Scenario:
     * 1. Go to Macro
     * 2. Select a simple RNA/DNA structure
     * 3. Open the "Calculate Properties" window
     */
    await Library(page).selectMonomer(Presets.A);
    await CommonTopLeftToolbar(page).calculateProperties();
    const molecularFormula = await CalculateVariablesPanel(
      page,
    ).getMolecularFormula();
    const molecularMass = await CalculateVariablesPanel(
      page,
    ).getMolecularMassValue();

    expect(molecularFormula).toEqual('C10H14N5O7P');
    expect(molecularMass).toEqual('347.221');
  });

  test('Case 34: Verify that the molecular formula and molecular mass is correctly calculated for a simple CHEM structure', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: The molecular formula and molecular mass is correctly calculated for a simple CHEM structure.
     * Scenario:
     * 1. Go to Macro
     * 2. Select a simple CHEM structure
     * 3. Open the "Calculate Properties" window
     */
    await Library(page).selectMonomer(Chem.Test_6_Ch);
    await CommonTopLeftToolbar(page).calculateProperties();
    const molecularFormula = await CalculateVariablesPanel(
      page,
    ).getMolecularFormula();
    const molecularMass = await CalculateVariablesPanel(
      page,
    ).getMolecularMassValue();

    expect(molecularFormula).toEqual('C14H28BrClINO2');
    expect(molecularMass).toEqual('484.639');
  });

  test('Case 35: Verify correct molecular mass calculation for complex polymers with connected small molecules', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Correct molecular mass calculation for complex polymers with connected small molecules.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from file
     * 3. Open the "Calculate Properties" window
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await Library(page).switchToPeptidesTab();
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/peptides-connected-to-molecule.ket',
    );
    await selectAllStructuresOnCanvas(page);
    await CommonTopLeftToolbar(page).calculateProperties();
    const molecularFormula = await CalculateVariablesPanel(
      page,
    ).getMolecularFormula();
    const molecularMass = await CalculateVariablesPanel(
      page,
    ).getMolecularMassValue();

    expect(molecularFormula).toEqual('C33H43N5O10S');
    expect(molecularMass).toEqual('701.787');
  });

  test('Case 36: Verify isoelectric point calculation with multiple groups (Leaving group atoms at occupied attachment points are ignored)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Isoelectric point calculation with multiple groups are correct (Leaving group atoms at occupied attachment points are ignored).
     * Scenario:
     * 1. Go to Macro
     * 2. Add a structure with multiple groups
     * 3. Open the "Calculate Properties" window
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await switchToPeptideMode(page);
    await keyboardTypeOnCanvas(page, 'AAAAA');
    await CommonTopLeftToolbar(page).calculateProperties();
    const isoelectricPoint = await CalculateVariablesPanel(
      page,
    ).getIsoelectricPointValue();

    expect(isoelectricPoint).toEqual('5.96');
  });

  test('Case 37: Verify correct calculation of melting temperature for a simple double-stranded RNA', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Correct calculation of melting temperature for a simple double-stranded RNA.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Open the "Calculate Properties" window
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)}$RNA1,RNA2,2:pair-5:pair|RNA1,RNA2,5:pair-2:pair$$$V2.0',
    );
    await CommonTopLeftToolbar(page).calculateProperties();
    const meltingTemperature = await CalculateVariablesPanel(
      page,
    ).getMeltingTemperatureValue();

    expect(meltingTemperature).toEqual('-12.4');
  });

  test('Case 38: Verify correct calculation of melting temperature for a simple double-stranded DNA', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Correct calculation of melting temperature for a simple double-stranded DNA.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Open the "Calculate Properties" window
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[dR](A)P.[dR](A)}|RNA2{[dR](T)P.[dR](T)}$RNA1,RNA2,2:pair-5:pair|RNA1,RNA2,5:pair-2:pair$$$V2.0',
    );
    await CommonTopLeftToolbar(page).calculateProperties();
    const meltingTemperature = await CalculateVariablesPanel(
      page,
    ).getMeltingTemperatureValue();

    expect(meltingTemperature).toEqual('-12.4');
  });

  test('Case 39: Verify melting temperature calculation with user-defined parameters for a simple double-stranded RNA', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Melting temperature calculation with user-defined parameters for a simple double-stranded RNA.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Open the "Calculate Properties" window
     * 4. Change the default values of the parameters
     * 5. Check that the melting temperature is calculated correctly
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)}$RNA1,RNA2,2:pair-5:pair|RNA1,RNA2,5:pair-2:pair$$$V2.0',
    );
    await CommonTopLeftToolbar(page).calculateProperties();
    expect(
      await CalculateVariablesPanel(page).getMeltingTemperatureValue(),
    ).toEqual('-12.4');

    await CalculateVariablesPanel(page).setUnipositiveIonsUnits(
      UnipositiveIonsUnit.μM,
    );
    await CalculateVariablesPanel(page).setOligonucleotidesUnits(
      OligonucleotidesUnit.mM,
    );
    expect(
      await CalculateVariablesPanel(page).getMeltingTemperatureValue(),
    ).toEqual('-40.5');

    await CalculateVariablesPanel(page).setUnipositiveIonsUnits(
      UnipositiveIonsUnit.nM,
    );
    await CalculateVariablesPanel(page).setOligonucleotidesUnits(
      OligonucleotidesUnit.nM,
    );

    expect(
      await CalculateVariablesPanel(page).getMeltingTemperatureValue(),
    ).toEqual('-87');

    await CalculateVariablesPanel(page).setUnipositiveIonsUnits(
      UnipositiveIonsUnit.mM,
    );
    await CalculateVariablesPanel(page).setOligonucleotidesUnits(
      OligonucleotidesUnit.μM,
    );

    expect(
      await CalculateVariablesPanel(page).getMeltingTemperatureValue(),
    ).toEqual('-12.4');
  });

  test('Case 40: Verify melting temperature calculation with user-defined parameters for a simple double-stranded DNA', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Melting temperature calculation with user-defined parameters for a simple double-stranded DNA.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Open the "Calculate Properties" window
     * 4. Change the default values of the parameters
     * 5. Check that the melting temperature is calculated correctly
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[dR](A)P.[dR](A)}|RNA2{[dR](T)P.[dR](T)}$RNA1,RNA2,2:pair-5:pair|RNA1,RNA2,5:pair-2:pair$$$V2.0',
    );
    await CommonTopLeftToolbar(page).calculateProperties();
    expect(
      await CalculateVariablesPanel(page).getMeltingTemperatureValue(),
    ).toEqual('-12.4');

    await CalculateVariablesPanel(page).setUnipositiveIonsUnits(
      UnipositiveIonsUnit.μM,
    );
    await CalculateVariablesPanel(page).setOligonucleotidesUnits(
      OligonucleotidesUnit.mM,
    );
    expect(
      await CalculateVariablesPanel(page).getMeltingTemperatureValue(),
    ).toEqual('-40.5');

    await CalculateVariablesPanel(page).setUnipositiveIonsUnits(
      UnipositiveIonsUnit.nM,
    );
    await CalculateVariablesPanel(page).setOligonucleotidesUnits(
      OligonucleotidesUnit.nM,
    );

    expect(
      await CalculateVariablesPanel(page).getMeltingTemperatureValue(),
    ).toEqual('-87');

    await CalculateVariablesPanel(page).setUnipositiveIonsUnits(
      UnipositiveIonsUnit.mM,
    );
    await CalculateVariablesPanel(page).setOligonucleotidesUnits(
      OligonucleotidesUnit.μM,
    );

    expect(
      await CalculateVariablesPanel(page).getMeltingTemperatureValue(),
    ).toEqual('-12.4');
  });

  test('Case 41: Verify correct calculation of extinction coefficient and correct hydrophobicity calculation  for a simple peptide', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Сorrect calculation of extinction coefficient and correct hydrophobicity calculation  for a simple peptide.
     * Scenario:
     * 1. Go to Macro
     * 2. Select a simple peptide structure
     * 3. Open the "Calculate Properties" window
     */
    await Library(page).selectMonomer(Peptides.A);
    await CommonTopLeftToolbar(page).calculateProperties();
    expect(
      await CalculateVariablesPanel(page).getExtinctionCoefficientValue(),
    ).toEqual('0');
    await takeElementScreenshot(
      page,
      CalculateVariablesPanel(page).peptidesTab.hydrophobicityGraph,
    );
  });

  test('Case 42: Verify correct calculation of extinction coefficient and correct hydrophobicity calculation  for a peptides sequence', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Сorrect calculation of extinction coefficient and correct hydrophobicity calculation  for a peptides sequence.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Open the "Calculate Properties" window
     */
    await Library(page).switchToRNATab();
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{K.E.T.C.H.E.R}$$$$V2.0',
    );
    await CommonTopLeftToolbar(page).calculateProperties();
    expect(
      await CalculateVariablesPanel(page).getExtinctionCoefficientValue(),
    ).toEqual('125');
    await takeElementScreenshot(
      page,
      CalculateVariablesPanel(page).peptidesTab.hydrophobicityGraph,
    );
  });

  test('Case 43: Verify correct property calculations for RNA containing modified bases', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Correct property calculations for RNA containing modified bases.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Open the "Calculate Properties" window
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R([baA])P.R([5meC])P.R([4imen2])P.R([cneT])P.R([5eU])}$$$$V2.0',
    );
    await CommonTopLeftToolbar(page).calculateProperties();
    expect(await CalculateVariablesPanel(page).getMolecularFormula()).toEqual(
      'C66H78N20O34P4',
    );
    expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
      '1.819',
    );
    expect(
      await CalculateVariablesPanel(page).getNucleotideNaturalAnalogCountList(),
    ).toEqual(['A1', 'C1', 'G1', 'T1', 'U1', 'Other0']);
  });

  test('Case 44: Verify correct property calculations for DNA containing modified bases', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Correct property calculations for DNA containing modified bases.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Open the "Calculate Properties" window
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[dR]([4ime6A])P.[dR]([ac4C])P.[dR]([allyl9])P.[dR]([mo4bn3])P.[dR]([5fU])}$$$$V2.0',
    );
    await CommonTopLeftToolbar(page).calculateProperties();
    expect(await CalculateVariablesPanel(page).getMolecularFormula()).toEqual(
      'C66H80FN19O32P4',
    );
    expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
      '1.794',
    );
    expect(
      await CalculateVariablesPanel(page).getNucleotideNaturalAnalogCountList(),
    ).toEqual(['A1', 'C1', 'G1', 'T1', 'U1', 'Other0']);
  });

  test('Case 45: Verify property calculations for structures containing both peptide and RNA along with additional microstructures', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Calculations for structures containing both peptide and RNA along with additional microstructures.
     * Scenario:
     * 1. Go to Macro - Flex
     * 2. Load from file
     * 3. Open the "Calculate Properties" window
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/peptide-rna-microstructure-connected.ket',
    );
    await CommonTopLeftToolbar(page).calculateProperties();
    expect(await CalculateVariablesPanel(page).getMolecularFormula()).toEqual(
      'C19H23N6O7P',
    );
    expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
      '478.396',
    );
    expect(
      await CalculateVariablesPanel(page).getNucleotideNaturalAnalogCountList(),
    ).toEqual(['A1', 'C0', 'G0', 'T0', 'U0', 'Other0']);
  });

  test('Case 46: Verify property calculations for structures containing both peptide and DNA along with additional microstructures', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Calculations for structures containing both peptide and DNA along with additional microstructures.
     * Scenario:
     * 1. Go to Macro - Flex
     * 2. Load from file
     * 3. Open the "Calculate Properties" window
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/peptide-dna-microstructure-connected.ket',
    );
    await CommonTopLeftToolbar(page).calculateProperties();
    expect(await CalculateVariablesPanel(page).getMolecularFormula()).toEqual(
      'C19H23N6O6P',
    );
    expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
      '462.396',
    );
    expect(
      await CalculateVariablesPanel(page).getNucleotideNaturalAnalogCountList(),
    ).toEqual(['A1', 'C0', 'G0', 'T0', 'U0', 'Other0']);
  });

  test('Case 47: Verify calculate properties for Peptides if Phosphate is missing in mixed chain', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Calculate properties for Peptides if Phosphate is missing in mixed chain.
     * Scenario:
     * 1. Go to Macro - Flex
     * 2. Load from HELM
     * 3. Open the "Calculate Properties" window
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)}|PEPTIDE1{A}$RNA1,PEPTIDE1,1:R2-1:R1$$$V2.0',
    );
    await CommonTopLeftToolbar(page).calculateProperties();
    expect(await CalculateVariablesPanel(page).getMolecularFormula()).toEqual(
      'C13H18N6O6',
    );
    expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
      '354.319',
    );
    expect(
      await CalculateVariablesPanel(page).getNucleotideNaturalAnalogCountList(),
    ).toEqual(['A1', 'C0', 'G0', 'T0', 'U0', 'Other0']);
  });

  test('Case 48: Verify calculate properties when two chains are connected via a CHEM', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Calculate properties when two chains are connected via a CHEM.
     * Scenario:
     * 1. Go to Macro - Flex
     * 2. Load from file
     * 3. Open the "Calculate Properties" window
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/sequenses-connected-through-chem.ket',
    );
    await CommonTopLeftToolbar(page).calculateProperties();
    expect(await CalculateVariablesPanel(page).getMolecularFormula()).toEqual(
      'C21H23N6O7',
    );
    expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
      '471.443',
    );
    expect(
      await CalculateVariablesPanel(page).getNucleotideNaturalAnalogCountList(),
    ).toEqual(['A1', 'C0', 'G0', 'T0', 'U0', 'Other0']);
  });

  test('Case 49: Verify calculate properties when two chains are connected via a microstructure with attachment points', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Calculate properties when two chains are connected via a microstructure with attachment points.
     * Scenario:
     * 1. Go to Macro - Flex
     * 2. Load from file
     * 3. Open the "Calculate Properties" window
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/microstructure-with-attachment-points.ket',
    );
    await CommonTopLeftToolbar(page).calculateProperties();
    expect(await CalculateVariablesPanel(page).getMolecularFormula()).toEqual(
      'C19H22N6O6',
    );
    expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
      '430.415',
    );
    expect(
      await CalculateVariablesPanel(page).getNucleotideNaturalAnalogCountList(),
    ).toEqual(['A1', 'C0', 'G0', 'T0', 'U0', 'Other0']);
  });

  test('Case 50: Verify calculate properties when two chains are connected via a microstructure without attachment points', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Description: Calculate properties when two chains are connected via a microstructure without attachment points.
     * Scenario:
     * 1. Go to Macro - Flex
     * 2. Load from file
     * 3. Open the "Calculate Properties" window
     * We have a bug for this issue: https://github.com/epam/Indigo/issues/2903
     * After fix we need to remove screenshot and uncomment asserts
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/microstructure-without-attachment-points.ket',
    );
    await CommonTopLeftToolbar(page).calculateProperties();
    // expect(await CalculateVariablesPanel(page).getMolecularFormula()).toEqual(
    //   'C19H22N6O5',
    // );
    // expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
    //   '414.415',
    // );
    // expect(
    //   await CalculateVariablesPanel(page).getNucleotideNaturalAnalogCountList(),
    // ).toEqual(['A1', 'C0', 'G0', 'T0', 'U0', 'Other0']);
    await takePageScreenshot(page);
  });

  test('Case 51: Check that hydrophobicity graph is displayed after opening Calculate Properties', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7312
     * Description: Check that hydrophobicity graph is displayed after opening Calculate Properties
     * Scenario:
     * 1. Go to Macro - Flex
     * 2. Load from HELM peptide chain
     * 3. Open the "Calculate Properties" window
     * 4. Take screenshot of Hydrophobicity Graph it works correct
     *
     * Version 3.5
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.(A,C,D,E,F,G,H,I,K,L,M,N,O,P,Q,R,S,T,U,V,W,Y)}$$$$V2.0',
    );

    await CommonTopLeftToolbar(page).calculateProperties();
    await takeElementScreenshot(
      page,
      CalculateVariablesPanel(page).peptidesTab.hydrophobicityGraph,
    );
  });

  test('Case 52: Check that graph remains readable for 4 amino acids ', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7312
     * Description: Check that graph remains readable for 4 amino acids
     * Scenario:
     * 1. Go to Macro - Flex
     * 2. Load from HELM peptide chain
     * 3. Open the "Calculate Properties" window
     * 4. Take screenshot of Hydrophobicity Graph it works correct
     *
     * Version 3.5
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.C.D.E}$$$$V2.0',
    );

    await CommonTopLeftToolbar(page).calculateProperties();
    await takeElementScreenshot(
      page,
      CalculateVariablesPanel(page).peptidesTab.hydrophobicityGraph,
    );
  });

  test('Case 53: Check that graph remains readable for 44 amino acids ', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7312
     * Description: Check that graph remains readable for 44 amino acids
     * Scenario:
     * 1. Go to Macro - Flex
     * 2. Load from HELM peptide chain
     * 3. Open the "Calculate Properties" window
     * 4. Take screenshot of Hydrophobicity Graph it works correct
     *
     * Version 3.5
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E}$$$$V2.0',
    );

    await CommonTopLeftToolbar(page).calculateProperties();
    await takeElementScreenshot(
      page,
      CalculateVariablesPanel(page).peptidesTab.hydrophobicityGraph,
    );
  });

  test('Case 54: Check that graph remains readable for 110 amino acids ', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7312
     * Description: Check that graph remains readable for 110 amino acids
     * Scenario:
     * 1. Go to Macro - Flex
     * 2. Load from HELM peptide chain
     * 3. Open the "Calculate Properties" window
     * 4. Take screenshot of Hydrophobicity Graph it works correct
     *
     * Version 3.5
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L}$$$$V2.0',
    );

    await CommonTopLeftToolbar(page).calculateProperties();
    await takeElementScreenshot(
      page,
      CalculateVariablesPanel(page).peptidesTab.hydrophobicityGraph,
    );
  });

  test('Case 55: Check that graph remains readable for 532 amino acids ', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7312
     * Description: Check that graph remains readable for 532 amino acids
     * Scenario:
     * 1. Go to Macro - Flex
     * 2. Load from HELM peptide chain
     * 3. Open the "Calculate Properties" window
     * 4. Take screenshot of Hydrophobicity Graph it works correct
     *
     * Version 3.5
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N}$$$$V2.0',
    );

    await CommonTopLeftToolbar(page).calculateProperties();
    await waitForCalculateProperties(page);
    await takeElementScreenshot(
      page,
      CalculateVariablesPanel(page).peptidesTab.hydrophobicityGraph,
    );
  });

  test('Case 56: Check that graph remains readable for 1240 amino acids ', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7312
     * Description: Check that graph remains readable for 532 amino acids
     * Scenario:
     * 1. Go to Macro - Flex
     * 2. Load from HELM peptide chain
     * 3. Open the "Calculate Properties" window
     * 4. Take screenshot of Hydrophobicity Graph it works correct
     *
     * Version 3.5
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y.A.C.D.E.F.G.H.I.K.L.M.N.Q.R.S.T.U.V.W.Y}$$$$V2.0',
    );

    await CommonTopLeftToolbar(page).calculateProperties();
    await page.waitForTimeout(5000);
    await takeElementScreenshot(
      page,
      CalculateVariablesPanel(page).peptidesTab.hydrophobicityGraph,
    );
  });

  test('Case 57: Check that graph uses the maximum number of x-axis labels based on container width (window width > 360px -> verify 5 labels)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7312
     * Description: Check that graph uses the maximum number of x-axis labels based on container width (window width > 360px -> verify 5 labels)
     * Scenario:
     * 0. Setup browser dimention larger to make Hydrophobicity Graph fit 5 labels
     * 1. Go to Macro - Flex
     * 2. Load from HELM peptide chain
     * 3. Open the "Calculate Properties" window
     * 4. Take screenshot of Hydrophobicity Graph it works correct
     * 5. Setup browser dimention back to default
     *
     * Version 3.5
     */

    const originalViewport = page.viewportSize();
    if (!originalViewport) {
      throw new Error('Viewport size is not available');
    }
    await page.setViewportSize({ width: 1440, height: 900 });

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.C.D.E.F}$$$$V2.0',
    );

    await CommonTopLeftToolbar(page).calculateProperties();
    await takeElementScreenshot(
      page,
      CalculateVariablesPanel(page).peptidesTab.hydrophobicityGraph,
    );

    await page.setViewportSize(originalViewport);
  });

  test('Case 58: Check that graph uses the maximum number of x-axis labels based on container width (window width between 300-360px  -> verify 4 labels)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7312
     * Description: Check that graph uses the maximum number of x-axis labels based on container width (window width between 300-360px  -> verify 4 labels)
     * Scenario:
     * 0. Setup browser dimention larger to make Hydrophobicity Graph fit 4 labels
     * 1. Go to Macro - Flex
     * 2. Load from HELM peptide chain
     * 3. Open the "Calculate Properties" window
     * 4. Take screenshot of Hydrophobicity Graph it works correct
     * 5. Setup browser dimention back to default
     *
     * Version 3.5
     */

    const originalViewport = page.viewportSize();
    if (!originalViewport) {
      throw new Error('Viewport size is not available');
    }
    await page.setViewportSize({ width: 1360, height: 900 });

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.C.D.E}$$$$V2.0',
    );

    await CommonTopLeftToolbar(page).calculateProperties();
    await takeElementScreenshot(
      page,
      CalculateVariablesPanel(page).peptidesTab.hydrophobicityGraph,
    );

    await page.setViewportSize(originalViewport);
  });

  test('Case 59: Check that graph uses the maximum number of x-axis labels based on container width (width 240-300px  -> verify 3 labels)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7312
     * Description: Check that graph uses the maximum number of x-axis labels based on container width (width 240–300px → verify 3 labels)
     * Scenario:
     * 0. Setup browser dimention larger to make Hydrophobicity Graph fit 3 labels
     * 1. Go to Macro - Flex
     * 2. Load from HELM peptide chain
     * 3. Open the "Calculate Properties" window
     * 4. Take screenshot of Hydrophobicity Graph it works correct
     * 5. Setup browser dimention back to default
     *
     * Version 3.5
     */

    const originalViewport = page.viewportSize();
    if (!originalViewport) {
      throw new Error('Viewport size is not available');
    }
    await page.setViewportSize({ width: 1180, height: 900 });

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.C.D.E.F.G.H}$$$$V2.0',
    );

    await CommonTopLeftToolbar(page).calculateProperties();
    await takeElementScreenshot(
      page,
      CalculateVariablesPanel(page).peptidesTab.hydrophobicityGraph,
    );

    await page.setViewportSize(originalViewport);
  });

  test('Case 60: Check that graph uses the maximum number of x-axis labels based on container width (width < 240px  -> verify 2 labels)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7312
     * Description: Check that graph uses the maximum number of x-axis labels based on container width (width < 240px → verify 2 labels)
     * Scenario:
     * 0. Setup browser dimention larger to make Hydrophobicity Graph fit 2 labels
     * 1. Go to Macro - Flex
     * 2. Load from HELM peptide chain
     * 3. Open the "Calculate Properties" window
     * 4. Take screenshot of Hydrophobicity Graph it works correct
     * 5. Setup browser dimention back to default
     *
     * Version 3.5
     */

    const originalViewport = page.viewportSize();
    if (!originalViewport) {
      throw new Error('Viewport size is not available');
    }
    await page.setViewportSize({ width: 980, height: 900 });

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.C.D.E.F}$$$$V2.0',
    );

    await CommonTopLeftToolbar(page).calculateProperties();
    await takeElementScreenshot(
      page,
      CalculateVariablesPanel(page).peptidesTab.hydrophobicityGraph,
    );

    await page.setViewportSize(originalViewport);
  });

  test('Case 61: Check correct amino acid label values on x-axis (For 100 AAs and 5 labels -> expect labels like 20, 40, 60, 80, 100 (based on spacing logic)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7312
     * Description: Check correct amino acid label values on x-axis (For 100 AAs and 5 labels -> expect
     *              labels like 20, 40, 60, 80, 100 (based on spacing logic)
     * Scenario:
     * 0. Setup browser dimention larger to make Hydrophobicity Graph fit 5 labels
     * 1. Go to Macro - Flex
     * 2. Load from HELM peptide chain
     * 3. Open the "Calculate Properties" window
     * 4. Take screenshot of Hydrophobicity Graph it works correct
     * 5. Setup browser dimention back to default
     */

    const originalViewport = page.viewportSize();
    if (!originalViewport) {
      throw new Error('Viewport size is not available');
    }
    await page.setViewportSize({ width: 1440, height: 900 });

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.C.D.E.F}$$$$V2.0',
    );

    await CommonTopLeftToolbar(page).calculateProperties();
    await takeElementScreenshot(
      page,
      CalculateVariablesPanel(page).peptidesTab.hydrophobicityGraph,
    );

    await page.setViewportSize(originalViewport);
  });

  test('Case 62: Check correct amino acid label values on x-axis (For 100 AAs and 5 labels -> expect labels like 20, 40, 60, 80, 100 (based on spacing logic)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7312
     * Description: Check correct amino acid label values on x-axis (For 100 AAs and 5 labels -> expect
     *              labels like 20, 40, 60, 80, 100 (based on spacing logic)
     * Scenario:
     * 1. Go to Macro - Flex
     * 2. Load from HELM peptide chain
     * 3. Open the "Calculate Properties" window
     * 4. Hover mouse cursor over Hydrofobicity button
     * 5. Validate tooltip info
     *
     * Version 3.5
     */

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.C.D.E.F}$$$$V2.0',
    );

    await CommonTopLeftToolbar(page).calculateProperties();

    await CalculateVariablesPanel(
      page,
    ).peptidesTab.hydrophobicityInfoButton.hover();
    await expect(page.getByRole('tooltip')).toContainText(
      'y = Hydrophobicity scorex = Position of the amino acid residueThe hydrophobicity is calculated using the method from Black S.D. and Mould D.R. (1991). Natural analogue is used in place of a modified amino acid.',
    );
  });

  test('Case 62: Check that graph shows a line for each amino acid with hydrophobicity', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7312
     * Description:  Check that graph shows a line for each amino acid with hydrophobicity
     *               (Each amino acid should have a y-axis value (coefficient from the table in #2552))
     * Scenario:
     * 0. Setup browser dimention larger to make Hydrophobicity Graph fit 5 labels
     * 1. Go to Macro - Flex
     * 2. Load from HELM peptide chain (peptides sorted base on their hydrofobicity)
     * 3. Open the "Calculate Properties" window
     * 4. Take screenshot of Hydrophobicity Graph it works correct
     * 5. Setup browser dimention back to default
     *
     * Version 3.5
     */

    const originalViewport = page.viewportSize();
    if (!originalViewport) {
      throw new Error('Viewport size is not available');
    }
    await page.setViewportSize({ width: 1440, height: 900 });

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{R.D.E.H.N.Q.K.S.T.G.A.C.P.M.V.W.Y.I.L.F.R.(E,Q).D.(E,Q).E.(E,Q).H.(E,Q).N.(E,Q).Q.(E,Q).K.(E,Q).S.(E,Q).T.(E,Q).G.(E,Q).A.(E,Q).C.(E,Q).P.(E,Q).M.(E,Q).V.(E,Q).W.(E,Q).Y.(E,Q).I.(E,Q).L.(E,Q).F.(E,Q)}$$$$V2.0',
    );

    await CommonTopLeftToolbar(page).calculateProperties();
    await takeElementScreenshot(
      page,
      CalculateVariablesPanel(page).peptidesTab.hydrophobicityGraph,
    );

    await page.setViewportSize(originalViewport);
  });
});
