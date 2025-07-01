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
    ).toEqual('3.52');
    expect(
      await CalculateVariablesPanel(page).getExtinctionCoefficientValue(),
    ).toEqual('125');
    await CommonTopLeftToolbar(page).calculateProperties();
  });
});
