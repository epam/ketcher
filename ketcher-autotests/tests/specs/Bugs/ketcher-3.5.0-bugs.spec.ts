/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { Peptides } from '@constants/monomers/Peptides';
import { Page, test, expect } from '@playwright/test';
import {
  takeEditorScreenshot,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  MacroFileType,
  resetZoomLevelToDefault,
  takeMonomerLibraryScreenshot,
  openFileAndAddToCanvasAsNewProjectMacro,
  openFileAndAddToCanvasAsNewProject,
  takeLeftToolbarMacromoleculeScreenshot,
  takeTopToolbarScreenshot,
  SdfFileFormat,
  clickInTheMiddleOfTheScreen,
  takePageScreenshot,
  clickOnAtom,
  waitForMonomerPreview,
  MolFileFormat,
  clickOnCanvas,
  openFile,
  pressButton,
  clickOnTheCanvas,
  selectUserTemplate,
  TemplateLibrary,
  MonomerType,
  selectPartOfMolecules,
} from '@utils';
import {
  selectFlexLayoutModeTool,
  selectSequenceLayoutModeTool,
} from '@utils/canvas/tools/helpers';
import {
  copyAndPaste,
  selectAllStructuresOnCanvas,
} from '@utils/canvas/selectSelection';
import { waitForPageInit, waitForSpinnerFinishedWork } from '@utils/common';
import {
  getMonomerLocator,
  getSymbolLocator,
  modifyInRnaBuilder,
} from '@utils/macromolecules/monomer';
import { processResetToDefaultState } from '@utils/testAnnotations/resetToDefaultState';
import {
  keyboardPressOnCanvas,
  keyboardTypeOnCanvas,
} from '@utils/keyboard/index';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { Library } from '@tests/pages/macromolecules/Library';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { expandMonomer, expandMonomers } from '@utils/canvas/monomer/helpers';
import { Presets } from '@constants/monomers/Presets';
import {
  switchToPeptideMode,
  switchToRNAMode,
} from '@utils/macromolecules/sequence';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { MacromoleculesFileFormatType } from '@tests/pages/constants/fileFormats/macroFileFormats';
import {
  COORDINATES_TO_PERFORM_ROTATION,
  rotateToCoordinates,
} from '../Structure-Creating-&-Editing/Actions-With-Structures/Rotation/utils';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';
import { CalculateVariablesPanel } from '@tests/pages/macromolecules/CalculateVariablesPanel';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { OpenPPTXFileDialog } from '@tests/pages/molecules/OpenPPTXFileDialog';
import { openStructureLibrary } from '@tests/pages/molecules/BottomToolbar';
import {
  BondsSetting,
  MeasurementUnit,
} from '@tests/pages/constants/settingsDialog/Constants';
import {
  setSettingsOptions,
  SettingsDialog,
} from '@tests/pages/molecules/canvas/SettingsDialog';
import { TopRightToolbar } from '@tests/pages/molecules/TopRightToolbar';
import {
  ModifyAminoAcidsOption,
  MonomerOption,
} from '@tests/pages/constants/contextMenu/Constants';
import { Ruler } from '@tests/pages/macromolecules/tools/Ruler';

async function openPPTXFileAndValidateStructurePreview(
  page: Page,
  filePath: string,
  numberOf: {
    Structure: number;
  } = { Structure: 1 },
) {
  await CommonTopLeftToolbar(page).openFile();
  await waitForSpinnerFinishedWork(page, async () => {
    await openFile(page, filePath);
  });
  const openPPTXFileDialog = OpenPPTXFileDialog(page);
  if (numberOf.Structure !== 1) {
    await openPPTXFileDialog.selectStructure(numberOf);
  }
  await takeEditorScreenshot(page);
  await openPPTXFileDialog.pressOpenAsNewProjectButton();
}

let page: Page;

test.describe('Ketcher bugs in 3.5.0', () => {
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: false,
      goToPeptides: false,
      disableChainLengthRuler: false,
    });
  });

  test.afterEach(async ({ context: _ }, testInfo) => {
    await CommonTopLeftToolbar(page).clearCanvas();
    await resetZoomLevelToDefault(page);
    await processResetToDefaultState(testInfo, page);
  });

  test.afterAll(async ({ browser }) => {
    await Promise.all(browser.contexts().map((context) => context.close()));
  });

  test('Case 1: Clicking on base card in RNA Builder scroll to selected base if multiple bases from the same section are selected', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7285
     * Bug: https://github.com/epam/ketcher/issues/6834
     * Description: Clicking on base card in RNA Builder scroll to selected base if multiple bases from the same section are selected.
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Create sequence with the same bases
     * 3. Select multiple bases that belong to the same section (e.g., all from section "C").
     * 4. Right-click and select Modify in RNA Builder
     * 5. Click on the Base card in the RNA Builder.
     */
    await selectSequenceLayoutModeTool(page);
    await Library(page).switchToRNATab();
    await Library(page).rnaBuilder.expand();
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(C)P.R(C)P.R(C)P.R(C)P.R(C)P.R(C)P.R(C)P.R(C)}$$$$V2.0',
    );
    await selectAllStructuresOnCanvas(page);
    const symbolC = getSymbolLocator(page, { symbolAlias: 'C' }).first();
    await modifyInRnaBuilder(page, symbolC);
    await Library(page).rnaBuilder.selectBaseSlot();
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 2: Monomers positions are preserved when pasting macromolecule in MOL format', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7285
     * Bug: https://github.com/epam/ketcher/issues/6958
     * Description: Monomers positions are preserved when pasting macromolecule in MOL format.
     * Scenario:
     * 1. Go to Macro - Flex mode (empty canvas!)
     * 2. Load from MOL
     */
    await selectFlexLayoutModeTool(page);
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'Molfiles-V3000/Bugs/gattaca.mol',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 3: Undo/Redo work for modifications', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7285
     * Bug: https://github.com/epam/ketcher/issues/7177
     * Description: Undo/Redo work for modifications.
     * Scenario:
     * 1. Go to Macro - Flex mode (empty canvas!)
     * 2. Add an amino acid
     * 3. Modify it
     * 4. Undo/Redo modification
     * 5. Check that modification is applied
     */
    await selectFlexLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{Q.W.E.R.T.Y}$$$$V2.0',
    );
    await selectAllStructuresOnCanvas(page);
    const randomPeptide = getMonomerLocator(page, {
      monomerType: MonomerType.Peptide,
    }).first();
    await ContextMenu(page, randomPeptide).click([
      MonomerOption.ModifyAminoAcids,
      ModifyAminoAcidsOption.Phosphorylation,
    ]);
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });
    await CommonTopLeftToolbar(page).redo();
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });
  });

  test('Case 4: Monomers are updated immediately after modification', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7285
     * Bug: https://github.com/epam/ketcher/issues/7176
     * Description: Monomers are updated immediately after modification.
     * Scenario:
     * 1. Go to Macro - Flex mode (empty canvas!)
     * 2. Add an amino acid
     * 3. Modify it
     * 4. Check that modification is applied
     */
    await selectFlexLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{W.D.H.Q.I.U.W.D.U.Q.T.I.V.U}$$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });
    await selectAllStructuresOnCanvas(page);
    const randomPeptide = getMonomerLocator(page, {
      monomerType: MonomerType.Peptide,
    }).first();
    await ContextMenu(page, randomPeptide).click([
      MonomerOption.ModifyAminoAcids,
      ModifyAminoAcidsOption.NMethylation,
    ]);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });
  });

  test('Case 5: Layout not shift when entering symbol in sequence mode', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7285
     * Bug: https://github.com/epam/ketcher/issues/7031
     * Description: Layout not shift when entering symbol in sequence mode.
     * Scenario:
     * 1. Go to Macro - Sequence (empty canvas!)
     * 2. Add a symbol to the canvas
     * 3. Check that layout not shift
     * 4. Take a screenshot
     */
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });
    await keyboardTypeOnCanvas(page, 'A');
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });
  });

  test('Case 6: Correct order of amino acid modification options in context menu', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7285
     * Bug: https://github.com/epam/ketcher/issues/7202
     * Description: Correct order of amino acid modification options in context menu.
     * Scenario:
     * 1. Load HELM in Macro mode Flex
     * 2. Right-click on the amino acid
     * 3. Check that modification options are in correct order
     * 4. Take a screenshot
     */
    await selectFlexLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.S.R.[Hyp]}|PEPTIDE2{C.C}$PEPTIDE1,PEPTIDE2,2:R3-1:R3$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });
    await selectAllStructuresOnCanvas(page);
    const peptide = getMonomerLocator(page, {
      monomerType: MonomerType.Peptide,
    }).first();
    await ContextMenu(page, peptide).hover(MonomerOption.ModifyAminoAcids);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });
  });

  test('Case 7: Molecule mass calculated for partial selected micromolecule', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7285
     * Bug: https://github.com/epam/ketcher/issues/7150
     * Description: Molecule mass calculated for partial selected micromolecule.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from file
     * 3. Select part of benzene ring
     * 4. Open the "Calculate Properties" window
     */
    await selectFlexLayoutModeTool(page);
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

  test('Case 8: Monomer selection without bonds work the same as with bonds', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7285
     * Bug: https://github.com/epam/ketcher/issues/7142
     * Description: Monomer selection without bonds work the same as with bonds.
     * Scenario:
     * 1. Go to Macromolecules mode - Flex canvas (empty)
     * 2. Load from file
     * 3. Select monomers without bonds
     * 4. Open the "Calculate Properties" window
     */
    await selectFlexLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.[2Nal].[Edc]}$$$$V2.0',
    );
    await page.keyboard.down('Shift');
    await getMonomerLocator(page, Peptides.A).click();
    await getMonomerLocator(page, Peptides._2Nal).click();
    await getMonomerLocator(page, Peptides.Edc).click();
    await page.keyboard.up('Shift');
    await CommonTopLeftToolbar(page).calculateProperties();
    expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
      '449.587',
    );
    expect(await CalculateVariablesPanel(page).getMolecularFormula()).toEqual(
      'C21H27N3O4S2',
    );
    expect(
      await CalculateVariablesPanel(page).getIsoelectricPointValue(),
    ).toEqual('5.96');
    expect(
      await CalculateVariablesPanel(page).getExtinctionCoefficientValue(),
    ).toEqual('125');
    await CommonTopLeftToolbar(page).calculateProperties();
  });

  test('Case 9: N-methylation is not shown as available for Hyp', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7285
     * Bug: https://github.com/epam/ketcher/issues/7203
     * Description: N-methylation is not shown as available for Hyp. Natural amino acid should be available.
     * N-methylation should not appear in the list, as the R1 is occupied and the modification is not valid for Hyp.
     * Scenario:
     * 1. Load HELM in Macro mode Flex
     * 2. Right-click on the amino acid
     * 3. Take a screenshot
     */
    await selectFlexLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.S.R.[Hyp]}|PEPTIDE2{C.C}$PEPTIDE1,PEPTIDE2,2:R3-1:R3$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });
    await selectAllStructuresOnCanvas(page);
    const peptide = getMonomerLocator(page, {
      monomerType: MonomerType.Peptide,
    }).first();
    await ContextMenu(page, peptide).hover(MonomerOption.ModifyAminoAcids);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });
  });

  test('Case 10: App not crashes after mass modifying amino acids and switching to Micro mode', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7285
     * Bug: https://github.com/epam/ketcher/issues/7200
     * Description: App not crashes after mass modifying amino acids and switching to Micro mode.
     * Scenario:
     * 1. Go to Macro - Flex mode (empty canvas!)
     * 2. Add an amino acid
     * 3. Modify it
     * 4. Check that modification is applied
     * 5. Switch to Micro mode
     * 6. Check that app not crashes
     * 7. Take a screenshot
     */
    await selectFlexLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{H.D.U.W.E.U.Y.E.W.Y.T.V.F.W.Y.T}$$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });
    await selectAllStructuresOnCanvas(page);
    const randomPeptide = getMonomerLocator(page, {
      monomerType: MonomerType.Peptide,
    }).first();
    await ContextMenu(page, randomPeptide).click([
      MonomerOption.ModifyAminoAcids,
      ModifyAminoAcidsOption.NMethylation,
    ]);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });
  });

  test('Case 11: System calculate melting temperature for mix of nucleotides/nucleosides and phosphates', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7285
     * Bug: https://github.com/epam/Indigo/issues/2937
     * Description: System calculate melting temperature for mix of nucleotides/nucleosides and phosphates.
     * Scenario:
     * 1. Go to Macro - Flex mode (empty canvas!)
     * 2. Load from HELM
     * 3. Open Calculate properties (press Alt+C) and go to RNA/DNA tab
     */
    await selectFlexLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{P.R(G)P.R(A)P}|RNA2{P.R(U)P.R(C)P}$RNA1,RNA2,3:pair-6:pair|RNA1,RNA2,6:pair-3:pair$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });
    await CommonTopLeftToolbar(page).calculateProperties();
    expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
      '1481.749',
    );
    expect(await CalculateVariablesPanel(page).getMolecularFormula()).toEqual(
      'C38H53N15O36P6',
    );
    expect(
      await CalculateVariablesPanel(page).getMeltingTemperatureValue(),
    ).toEqual('-1.3');
    await CommonTopLeftToolbar(page).calculateProperties();
  });

  test('Case 12: The atom order in the molecule formula is correct', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7285
     * Bug: https://github.com/epam/Indigo/issues/2927
     * Description: The atom order in the molecule formula is correct.
     * Scenario:
     * 1. Go to Macro - Flex mode (empty canvas!)
     * 2. Load from HELM
     * 3. Open Calculate properties (press Alt+C) and go to RNA/DNA tab
     */
    await selectFlexLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'CHEM1{[CCC(C(NC(C(NC(C(NC(C(NC(C(NC(C(NC(C(NC(CNC(C(NC(C(NC(C(NC(C(NC(C(NC(C(NC(C(NC(C(NC(C(NC(C(NC(C(NC(CNC(C(NC(C(NC(C(N)CC1NC=NC=1)=O)(C)C)=O)CCC(O)=O)=O)=O)C(O)C)=O)CC1C=CC=CC=1)=O)C(O)C)=O)CO)=O)CC(O)=O)=O)C(C)C)=O)CO)=O)CO)=O)CC1C=CC(O)=CC=1)=O)CC(C)C)=O)CCC(O)=O)=O)=O)CCC(N)=O)=O)C)=O)C)=O)CCCCNC(COCCOCCNC(COCCOCCNC(CCC(NC(CCCCCCCCCCCCCCCCC(O)=O)=O)C(O)=O)=O)=O)=O)=O)CCC(O)=O)=O)CC1C=CC=CC=1)=O)C(NC(C(NC(C(NC(C(NC(C(NC(C(NCC(NC(C(NCC(O)=O)=O)CCCNC(N)=N)=O)=O)CCCNC(N)=N)=O)C(C)C)=O)CC(C)C)=O)CC1C2C(=CC=CC=2)NC=1)=O)C)=O)C]}$$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });
    await CommonTopLeftToolbar(page).calculateProperties();
    expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
      '4113.578',
    );
    expect(await CalculateVariablesPanel(page).getMolecularFormula()).toEqual(
      'C187H291N45O59',
    );
    await CommonTopLeftToolbar(page).calculateProperties();
  });

  test('Case 13: Melting temperature not defined for one RNA/DNA nucleotide chain lenght', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7285
     * Bug: https://github.com/epam/Indigo/issues/2934
     * Description: Melting temperature not defined for one RNA/DNA nucleotide chain lenght.
     * Scenario:
     * 1. Go to Macromolecules mode - Sequence canvas (empty)
     * 2. Load from HELM
     * 3. Open Calculate properties (press Alt+C) and go to RNA/DNA tab
     */
    await selectSequenceLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(G)}|RNA2{R(C)}$RNA1,RNA2,2:pair-2:pair$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });
    await CommonTopLeftToolbar(page).calculateProperties();
    expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
      '526.457',
    );
    expect(await CalculateVariablesPanel(page).getMolecularFormula()).toEqual(
      'C19H26N8O10',
    );
    await expect(
      CalculateVariablesPanel(page).rnaTab.meltingTemperatureValue,
    ).not.toBeVisible();
    await CommonTopLeftToolbar(page).calculateProperties();
  });

  test('Case 14: System calculate melting temperature for mix of nucleotides/nucleosides and unsplit nucleotides/unsplit nucleosides', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7285
     * Bug: https://github.com/epam/Indigo/issues/2936
     * Description: System calculate melting temperature for mix of nucleotides/nucleosides and unsplit nucleotides/unsplit nucleosides.
     * Scenario:
     * 1. Go to Macromolecules mode - Flex canvas (empty)
     * 2. Load from HELM
     * 3. Open Calculate properties (press Alt+C) and go to RNA/DNA tab
     */
    await selectFlexLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[2-damdA]}|RNA2{R(G)P}|RNA3{[5Br-dU].R(C)}$RNA2,RNA1,3:R2-1:R1|RNA1,RNA3,1:pair-1:pair|RNA2,RNA3,2:pair-3:pair$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });
    await CommonTopLeftToolbar(page).calculateProperties();
    expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
      '1303.721',
    );
    expect(await CalculateVariablesPanel(page).getMolecularFormula()).toEqual(
      'C38H50BrN16O25P3',
    );
    expect(
      await CalculateVariablesPanel(page).getMeltingTemperatureValue(),
    ).toEqual('-1.3');
    await CommonTopLeftToolbar(page).calculateProperties();
  });

  test('Case 15: Melting temperature calculation works correct for three antistrand DNA', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7285
     * Bug: https://github.com/epam/Indigo/issues/2968
     * Description: Melting temperature calculation works correct for three antistrand DNA.
     * Scenario:
     * 1. Go to Macromolecules mode - Flex canvas (empty)
     * 2. Load from HELM
     * 3. Open Calculate properties (press Alt+C) and go to RNA/DNA tab
     */
    await selectFlexLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[dR](A)P.[dR](A)P.[dR](A)}|RNA2{[dR](T)P.[dR](T)P.[dR](T)}$RNA1,RNA2,8:pair-2:pair|RNA1,RNA2,5:pair-5:pair|RNA1,RNA2,2:pair-8:pair$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });
    await CommonTopLeftToolbar(page).calculateProperties();
    expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
      '1728.27',
    );
    expect(await CalculateVariablesPanel(page).getMolecularFormula()).toEqual(
      'C60H77N21O32P4',
    );
    expect(
      await CalculateVariablesPanel(page).getMeltingTemperatureValue(),
    ).toEqual('0.8');
    await CommonTopLeftToolbar(page).calculateProperties();
  });

  test('Case 16: System substract from mass of monomer mass of leaving group atom(s) if an attachment point is occupied', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7285
     * Bug: https://github.com/epam/Indigo/issues/2923
     * Description: System substract from mass of monomer mass of leaving group atom(s) if an attachment point is occupied.
     * Scenario:
     * 1. Go to Macromolecules mode - Flex canvas (empty)
     * 2. Load from HELM
     * 3. Open Calculate properties (press Alt+C) and go to RNA/DNA tab
     */
    await selectFlexLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{C}|PEPTIDE2{C.C}|PEPTIDE3{C.C.C}$$$$V2.0',
    );
    await getMonomerLocator(page, Peptides.C).nth(1).click();
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });
    await CommonTopLeftToolbar(page).calculateProperties();
    expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
      '104.151',
    );
    expect(await CalculateVariablesPanel(page).getMolecularFormula()).toEqual(
      'C3H6NOS',
    );
    await CommonTopLeftToolbar(page).calculateProperties();
    await getMonomerLocator(page, Peptides.C).nth(3).click();
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });
    await CommonTopLeftToolbar(page).calculateProperties();
    expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
      '103.143',
    );
    expect(await CalculateVariablesPanel(page).getMolecularFormula()).toEqual(
      'C3H5NOS',
    );
    await CommonTopLeftToolbar(page).calculateProperties();
  });

  test('Case 17: Load from HELM work for two side chain connected sequences', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7285
     * Bug: https://github.com/epam/Indigo/issues/2966
     * Description: Load from HELM work for two side chain connected sequences.
     * For now it is working wrong. Bug not fixed yet. After fixing it we should update screenshot.
     * Scenario:
     * 1. Go to Macromolecules mode - Flex canvas (empty)
     * 2. Load from HELM
     * 3. Take a screenshot
     */
    await selectFlexLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(C)P.RP.RP.R(C)P}|RNA2{R(G)P}$RNA2,RNA1,1:R1-6:R3$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });
  });

  test('Case 18: No temperature should be calculated for one pair of double stranded DNA/RNA nucleotides', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7285
     * Bug: https://github.com/epam/Indigo/issues/2986
     * Description: No temperature should be calculated for one pair of double stranded DNA/RNA nucleotides.
     * Scenario:
     * 1. Go to Macromolecules mode - Sequence canvas (empty)
     * 2. Load from HELM
     * 3. Open Calculate properties (press Alt+C) and go to RNA/DNA tab
     */
    await selectSequenceLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)}|RNA2{R(U)}$RNA1,RNA2,2:pair-2:pair$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });
    await CommonTopLeftToolbar(page).calculateProperties();
    expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
      '511.443',
    );
    expect(await CalculateVariablesPanel(page).getMolecularFormula()).toEqual(
      'C19H25N7O10',
    );
    await expect(
      CalculateVariablesPanel(page).rnaTab.meltingTemperatureValue,
    ).not.toBeVisible();
    await CommonTopLeftToolbar(page).calculateProperties();
  });

  test('Case 19: Monomers not shifts out of visible area when adjusting layout with ruler in sequence edit mode', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7285
     * Bug: https://github.com/epam/ketcher/issues/7288
     * Description: Monomers not shifts out of visible area when adjusting layout with ruler in sequence edit mode.
     * Scenario:
     * 1. Add monomers in Sequence Edit Mode. ( Do not exit from Edit sequence mode - it is important)
     * 2. Use the ruler tool to adjust the layout of the sequence (e.g., move the slider from position 30 to 20).
     * 3. Observe the canvas after the ruler is released
     */
    await selectSequenceLayoutModeTool(page);
    await keyboardTypeOnCanvas(
      page,
      'ACGTUACGTUACGTUACGTUACGTUACGTUACGTUACGTUACGTUACGTUACGTUACGTU',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await Ruler(page).dragRulerHandle(400, 300);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await Ruler(page).dragRulerHandle(600, 300);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 20: Substituents are displayed backwards if appearing on the left of the molecule', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7285
     * Bug: https://github.com/epam/Indigo/issues/2748
     * Description: Substituents are displayed backwards if appearing on the left of the molecule.
     * Scenario:
     * 1. Open Micro mode
     * 2. Open structure from KET
     * 3. Save as SVG
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Bugs/SiEt3-two-s-groups.ket',
    );
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await takeEditorScreenshot(page);
  });

  test('Case 21: Export of unknown for Ketcher monomers works correct', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7285
     * Bug: https://github.com/epam/Indigo/issues/2969
     * Description: Export of unknown for Ketcher monomers works correct.
     * Scenario:
     * 1. Open Macro mode
     * 2. Load from HELM
     * 3. Export canvas to HELM
     * For now it is working wrong. Bug not fixed yet. After fixing it we should update screenshot.
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{Raaa(Aaaa)Paaa}$$$$V2.0',
    );
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.HELM,
    );
    await takeEditorScreenshot(page);
  });
});
