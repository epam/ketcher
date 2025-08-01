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
} from '@utils';
import {
  copyAndPaste,
  selectAllStructuresOnCanvas,
} from '@utils/canvas/selectSelection';
import { waitForPageInit, waitForSpinnerFinishedWork } from '@utils/common';
import {
  getMonomerLocator,
  getSymbolLocator,
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
import { CalculatedValuesDialog } from '@tests/pages/molecules/canvas/CalculatedValuesDialog';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { MolecularMassUnit } from '@tests/pages/constants/calculateVariablesPanel/Constants';

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

test.describe('Ketcher bugs in 3.4.0', () => {
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

  test('Case 1: Tooltips in sequence mode disappear after right-click on letters', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/ketcher/issues/4476
     * Description: Tooltips in sequence mode disappear after right-click on letters.
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from HELM
     * 3. Select all canvas and call context menu
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.R(C)P.R(G)P.R(T)P}$$$$V2.0',
    );
    const anySymbol = getSymbolLocator(page, {}).first();
    await ContextMenu(page, anySymbol).open();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 2: Create Antisense RNA Strand and Create Antisense DNA Strand are not missed from context menu if they should be disabled ', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/ketcher/issues/6696
     * Description: Create Antisense RNA Strand and Create Antisense DNA Strand option are at the menu (but disabled).
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from HELM
     * 3. Select all canvas and call context menu
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{(A,C,D,E,F,G,H,I,K,L,M,N,O,P,Q,R,S,T,U,V,W,Y)}|RNA1{R([nC6n8A])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    );
    await selectAllStructuresOnCanvas(page);
    const anySymbol = getSymbolLocator(page, {}).first();
    await ContextMenu(page, anySymbol).open();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 3: System not shows natural analog monomer as modified if source mol file contains only 3-letters natural analog name', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/ketcher/issues/6762
     * Description: System not shows natural analog monomer as modified if source mol file contains only 3-letters natural analog name.
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from MOL
     */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'Molfiles-V3000/Bugs/System shows natural analog monomer as modified if source mol file contains only 3-letters natural analog name.mol',
      MacroFileType.MOLv3000,
    );
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 4: Enter key not adds undeletable preset to Preset section', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/ketcher/issues/6870
     * Description: Enter key not adds undeletable preset to Preset section.
     * No preset appears, Enter key starts new sequence in editor
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Go to Library - RNA tab - Presets section
     * 3. Select any Preset (U in my case)
     * 4. Press Enter key
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await Library(page).selectMonomer(Presets.U);
    await keyboardPressOnCanvas(page, 'Enter');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 5: Correct button sizes in the control panel', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/ketcher/issues/6877
     * Description: Correct button sizes in the control panel.
     * Scenario:
     * 1. Open Macro mode
     * 2. Сheck the button sizes on the control panel
     */
    await takeLeftToolbarMacromoleculeScreenshot(page);
    await takeTopToolbarScreenshot(page);
  });

  test('Case 6: Correct highlight behavior for microstructures when opening a file in Macro Mode', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/ketcher/issues/6409
     * Description: The highlight should accurately outline the selected microstructures.
     * No extra floating highlight artifacts should appear.
     * Scenario:
     * 1. Open a file containing microstructures directly in Macro Mode
     * 2. Verify that the highlight accurately outlines the selected microstructures
     * 3. Ensure no extra floating highlight artifacts appear
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Bugs/ketcher - 2025-02-03T145910.386.ket',
    );
    await selectAllStructuresOnCanvas(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 7: Correct numbering in sequence mode when adding Phosphates', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/ketcher/issues/6584
     * Description: The adding of Phosphates should start new count, indicating that they are separate entities from the existing sequence.
     * Terminal phosphates should not get counted.
     * Scenario:
     * 1. Open Ketcher in Macro mode and switch to Sequence mode.
     * 2. Create an RNA or DNA sequence.
     * 3. Add a Phosphates to the sequence.
     * 4. Observe the numbering of the added component.
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await keyboardTypeOnCanvas(page, 'AAAAAAAAAAPPPPPAAAAAAAAAA');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 8: Modified phosphates not shift away from main structure during expand in Micro Mode', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/ketcher/issues/6557
     * Description: Modified phosphates not shift away from main structure during expand in Micro Mode
     * Scenario:
     * 1. Open file in Micro mode
     * 2. Select all structure
     * 3. Expand it
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Bugs/macro-structures.ket',
    );
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await expandMonomers(page, page.getByText('3FAM'));
    await CommonTopRightToolbar(page).setZoomInputValue('50');
    await takeEditorScreenshot(page);
  });

  test('Case 9: Correct numbering in sequence mode when adding CHEM or Peptide', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/ketcher/issues/6288
     * Description: The adding of CHEM or Peptide should start new count,
     * indicating that they are separate entities from the existing sequence.
     * Scenario:
     * 1. Open Ketcher in Macro mode and switch to Sequence mode.
     * 2. Create an RNA or DNA sequence.
     * 3. Add a CHEM or Peptide to the sequence.
     * 4. Observe the numbering of the added component.
     */
    await keyboardTypeOnCanvas(page, 'AAAAAAAAAA');
    await MacromoleculesTopToolbar(page).peptides();
    await keyboardTypeOnCanvas(page, 'QQQQQ');
    await MacromoleculesTopToolbar(page).rna();
    await keyboardTypeOnCanvas(page, 'AAAAAAAAAA');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 10: Export of monomers to SDF v3000 works correct', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/ketcher/issues/5860
     * Description: Export of monomers to SDF v3000 works correct.
     * Scenario:
     * 1. Go to Micro mode
     * 2. Load from file
     * 3. Save canvas to SDF v3000
     * 4. Load it back using Add to canvas button (same for Open as New Project)
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Bugs/All type of monomers in horisontal chain and large micromolecule in the middle.ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'SDF/All type of monomers in horisontal chain and large micromolecule in the middle-expected.sdf',
      FileType.SDF,
      SdfFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'SDF/All type of monomers in horisontal chain and large micromolecule in the middle-expected.sdf',
    );
    await takeEditorScreenshot(page);
  });

  test('Case 11: Pyl Peptide is not changed to wrong letter while we save one to Fasta or Sequence file', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/ketcher/issues/4362
     * Description: Pyl Peptide is not changed to wrong letter while we save one to Fasta or Sequence file.
     * Scenario:
     * 1. Open Macro mode
     * 2. Add O and K Peptide to canvas
     * 3. Save canvas to Fasta or Sequence file
     * 4. Take screenshot
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await Library(page).selectMonomer(Peptides.O);
    await Library(page).selectMonomer(Peptides.K);
    await resetZoomLevelToDefault(page);
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.FASTA,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await SaveStructureDialog(page).cancel();
  });

  test('Case 12: DNA/RNA sequences should NOT accept * symbols', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/ketcher/issues/4358
     * Description: DNA/RNA sequences should NOT accept * symbols.
     * Error message should appear: "*" symbol is not allowed for DNA sequence.
     * Scenario:
     * 1. Open Macro mode
     * 2. Load by Paste from Clipboard as FASTA - RNA/DNA
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.FASTA,
      'AAAA*AAAA',
      true,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 13: System not replaces "Salts and Solvents" molecules with CH4 while loading if no mouse move and some other molecules present on the canvas', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/ketcher/issues/3878
     * Description: System not replaces "Salts and Solvents" molecules with CH4 while loading if no mouse move and some other molecules present on the canvas.
     * Scenario:
     * 1. Go to Micro mode
     * 2. Load from file
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V2000/Bugs/Source.mol',
    );
    await takeEditorScreenshot(page);
  });

  test('Case 14: When opening a macro file with 50 or more monomers in micro mode, application not freezes', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/ketcher/issues/3907
     * Description: When opening a macro file with 50 or more monomers in micro mode, application not freezes.
     * Scenario:
     * 1. Go to Micro mode
     * 2. Load from file
     * 3. Swtch to Macromolecules mode
     * 4. Take screenshot
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Bugs/fifty-monomers.ket',
    );
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 15: When opening a macro file with 100 or more monomers in micro mode, application not freezes', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/ketcher/issues/3907
     * Description: When opening a macro file with 100 or more monomers in micro mode, application not freezes.
     * Scenario:
     * 1. Go to Micro mode
     * 2. Load from file
     * 3. Swtch to Macromolecules mode
     * 4. Take screenshot
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Bugs/hundred-monomers.ket',
    );
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 16: It is not possible to expand ambiguous monomers on micromolecules canvas', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/ketcher/issues/5789
     * Description: It is not possible to expand ambiguous monomers on micromolecules canvas
     * Scenario:
     * 1. Open file in Micro mode
     * 2. Select all structure
     * 3. Expand it
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Bugs/1. Peptide X (ambiguouse, alternatives, from library).ket',
    );
    await takeEditorScreenshot(page);
    const point = page.getByText('X');
    await ContextMenu(page, point).open();
    await takeEditorScreenshot(page);
  });

  test('Case 17: It is not possible to expand unknown nucleotide on micromolecules canvas', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/ketcher/issues/5791
     * Description: It is not possible to expand unknown nucleotide on micromolecules canvas
     * Scenario:
     * 1. Open file in Micro mode
     * 2. Select all structure
     * 3. Expand it
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Bugs/17. Unknown nucleotide.ket',
    );
    await takeEditorScreenshot(page);
    const point = page.getByText('Unknown');
    await ContextMenu(page, point).open();
    await takeEditorScreenshot(page);
  });

  test('Case 18: Rotation is correct upon exporting transformed monomer to SVG or PNG', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/ketcher/issues/7062
     * Description: Rotation is correct upon exporting transformed monomer to SVG or PNG
     * Scenario:
     * 1. Open file in Micro mode
     * 2. Select all structure
     * 3. Rotate it
     * 4. Export to SVG
     * 5. Take screenshot
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Bugs/two-monomers-connected.ket',
    );
    await expandMonomer(page, page.getByText('Edc'));
    await clickInTheMiddleOfTheScreen(page);
    await selectAllStructuresOnCanvas(page);
    await takeEditorScreenshot(page);
    await rotateToCoordinates(page, COORDINATES_TO_PERFORM_ROTATION);
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await takeEditorScreenshot(page);
  });

  test('Case 19: Unipositive ions default value is shown in mM for double-stranded sequence selection', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Bug: https://github.com/epam/ketcher/issues/7034
     * Description: Unipositive ions default value is shown in mM for double-stranded sequence selection.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Open the "Calculate Properties" window
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)}|RNA2{[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)}$RNA1,RNA2,38:pair-2:pair|RNA1,RNA2,35:pair-5:pair|RNA1,RNA2,32:pair-8:pair|RNA1,RNA2,29:pair-11:pair|RNA1,RNA2,26:pair-14:pair|RNA1,RNA2,23:pair-17:pair|RNA1,RNA2,20:pair-20:pair|RNA1,RNA2,17:pair-23:pair|RNA1,RNA2,14:pair-26:pair|RNA1,RNA2,11:pair-29:pair|RNA1,RNA2,8:pair-32:pair|RNA1,RNA2,5:pair-35:pair|RNA1,RNA2,2:pair-38:pair$$$V2.0',
    );
    await MacromoleculesTopToolbar(page).calculateProperties();
    await takePageScreenshot(page);
    await MacromoleculesTopToolbar(page).calculateProperties();
  });

  test('Case 20: Alt+C hotkey open the “Calculate Properties” window', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Bug: https://github.com/epam/ketcher/issues/7015
     * Description: Alt+C hotkey open the “Calculate Properties” window.
     * Scenario:
     * 1. Go to Macro
     * 2. Open the "Calculate Properties" window by Alt+C hotkey
     */
    await takePageScreenshot(page);
    await page.keyboard.press('Alt+C');
    await takePageScreenshot(page);
  });

  test('Case 21: Tooltip displayed for the “Calculate Properties” button in main toolbar', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Bug: https://github.com/epam/ketcher/issues/7014
     * Description: Tooltip displayed for the “Calculate Properties” button in main toolbar.
     * Scenario:
     * 1. Go to Macro
     * 2. Hover over the “Calculate Properties” button in main toolbar
     * 3. Verify that tooltip is displayed
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
    await MacromoleculesTopToolbar(page).calculateProperties();
  });

  test('Case 22: Correct Melting temperature value', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7042
     * Bug: https://github.com/epam/ketcher/issues/7059
     * Description: Correct Melting temperature value.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Open the "Calculate Properties" window
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)}|RNA2{[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)}$RNA1,RNA2,38:pair-2:pair|RNA1,RNA2,35:pair-5:pair|RNA1,RNA2,32:pair-8:pair|RNA1,RNA2,29:pair-11:pair|RNA1,RNA2,26:pair-14:pair|RNA1,RNA2,23:pair-17:pair|RNA1,RNA2,20:pair-20:pair|RNA1,RNA2,17:pair-23:pair|RNA1,RNA2,14:pair-26:pair|RNA1,RNA2,11:pair-29:pair|RNA1,RNA2,8:pair-32:pair|RNA1,RNA2,5:pair-35:pair|RNA1,RNA2,2:pair-38:pair$$$V2.0',
    );
    await MacromoleculesTopToolbar(page).calculateProperties();
    expect(
      await CalculateVariablesPanel(page).getMeltingTemperatureValue(),
    ).toEqual('35.6');
    await MacromoleculesTopToolbar(page).calculateProperties();
  });

  test('Case 23: Able to collapse monomer back after flipping and changing mode from Micro to Macro and back', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/ketcher/issues/7024
     * Description: Able to collapse monomer back after flipping and changing mode from Micro to Macro and back
     * Scenario:
     * 1. Load from KET
     * 2. Go to Micro mode
     * 3. Expand monomer and flip in vertically
     * 4. Go to Macromolecules mode and back to Molecules mode
     * 5. Try to collapse monomer
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(page, 'KET/Bugs/Edc-monomer.ket');
    await expandMonomer(page, page.getByText('Edc'));
    await clickInTheMiddleOfTheScreen(page);
    await selectAllStructuresOnCanvas(page);
    await rotateToCoordinates(page, COORDINATES_TO_PERFORM_ROTATION);
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await takeEditorScreenshot(page);
    await clickOnAtom(page, 'O', 0, 'right');
    await page.getByText('Collapse monomer').click();
    await takeEditorScreenshot(page);
  });

  test('Case 24: App not crashes when adding Ambiguous Amino Acids to peptide sequence with open Calculate Properties window', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/ketcher/issues/7039
     * Description: App not crashes when adding Ambiguous Amino Acids to peptide sequence with open Calculate Properties window
     * Scenario:
     * 1. Open Ketcher in Macro mode
     * 2. Add a peptide sequence to the canvas.
     * 3. Open the Calculate Properties window.
     * 4. From the Ambiguous Amino Acids section in the library, click to add any ambiguous amino acid (e.g., X, B, J, Z) to the peptide sequence.
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await MacromoleculesTopToolbar(page).peptides();
    await keyboardTypeOnCanvas(page, 'QWERTYASDF');
    await MacromoleculesTopToolbar(page).calculateProperties();
    await Library(page).selectMonomer(Peptides.X);
    await Library(page).selectMonomer(Peptides.B);
    await Library(page).selectMonomer(Peptides.J);
    await Library(page).selectMonomer(Peptides.Z);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await MacromoleculesTopToolbar(page).calculateProperties();
  });

  test('Case 25: Rotation work for expanded monomers on Molecules mode', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/ketcher/issues/7007
     * Description: Rotation work for expanded monomers on Molecules mode
     * Scenario:
     * 1. Open Ketcher in Micro mode
     * 2. Load from KET
     * 3. Expand monomer and rotate it
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(page, 'KET/Bugs/Edc-monomer.ket');
    await expandMonomer(page, page.getByText('Edc'));
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await selectAllStructuresOnCanvas(page);
    await rotateToCoordinates(page, COORDINATES_TO_PERFORM_ROTATION);
    await takeEditorScreenshot(page);
  });

  test('Case 26: Limit size of structures in preview', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/ketcher/issues/4212
     * Description: Limit size of structures in preview.
     * Scale is no larger than on the canvas with zoom 100%
     * Scenario:
     * 1. Add some molecules and structures on canvas in micro mode ( e.g. Benzene ring, molecules )
     * 2. Switch to Macro mode and hover over abbreviations
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Bugs/benzene-ring-with-attachment-point.ket',
    );
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await getMonomerLocator(page, {
      monomerAlias: 'F1',
    }).hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  test(
    'Case 27: System not removes monomers from Molecules mode canvas when switched from Macro mode (bonds remain!) if ketcher in embedded mode (custom style iframe)',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/7243
       * Bug: https://github.com/epam/ketcher/issues/6974
       * Description: System not removes monomers from Molecules mode canvas when switched from
       * Macro mode (bonds remain!) if ketcher in embedded mode (custom style iframe)
       * Scenario:
       * 1. Open Ketcher in iFrame mode locally
       * 2. Go to Macro - Flex mode (empty canvas!)
       * 3. Add simple preset on the canvas
       * 4. Switch to Micro mode
       * 5. Take screenshot
       */
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Flex,
      );
      await Library(page).selectMonomer(Presets.A);
      await clickInTheMiddleOfTheScreen(page);
      await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
      await takeEditorScreenshot(page);
    },
  );

  test('Case 28: Correct highlight (not missing fill) for leaving-group atoms', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/ketcher/issues/7027
     * Description: Leaving group atom(s) should be highlighted in one way on monomer hover and on hover over that atom(s)
     * Scenario:
     * 1. Load from KET
     * 2. Expand monomer
     * 3. Hover over leaving group atom(s)
     * 4. Take screenshot
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(page, 'KET/Bugs/Edc-monomer.ket');
    await expandMonomer(page, page.getByText('Edc'));
    await page.mouse.move(650, 350);
    await takeEditorScreenshot(page);
  });

  test('Case 29: Layout not changes when switching from micro mode to sequence mode and back', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/ketcher/issues/5085
     * Description: Layout not changes when switching from micro mode to sequence mode and back
     * Scenario:
     * 1. Open Ketcher in Micro mode
     * 2. Load from KET
     * 3. Switch to Sequence mode
     * 4. Switch back to Micro mode
     * 5. Take screenshot
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Bugs/Layout changes when switching from micro mode to sequence mode and back.ket',
    );
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
    });
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await CommonTopRightToolbar(page).setZoomInputValue('60');
    await takeEditorScreenshot(page);
  });

  test('Case 30: Can edit concentration values of unipositive ions and oligonucleotides in Calculate Properties', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/ketcher/issues/7118
     * Description: Can edit concentration values of unipositive ions and oligonucleotides in Calculate Properties.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Open the "Calculate Properties" window
     * 4. Change the concentration values of unipositive ions and oligonucleotides
     * 5. Verify that the values are updated correctly
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)}|RNA2{[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)}$RNA1,RNA2,11:pair-5:pair|RNA1,RNA2,8:pair-8:pair|RNA1,RNA2,5:pair-11:pair|RNA1,RNA2,2:pair-14:pair|RNA1,RNA2,14:pair-2:pair$$$V2.0',
    );
    await MacromoleculesTopToolbar(page).calculateProperties();
    expect(
      await CalculateVariablesPanel(page).getMeltingTemperatureValue(),
    ).toEqual('14.6');
    await CalculateVariablesPanel(page).setUnipositiveIonsValue('300');
    await CalculateVariablesPanel(page).setOligonucleotidesValue('300');
    expect(
      await CalculateVariablesPanel(page).getMeltingTemperatureValue(),
    ).toEqual('18.7');
    await MacromoleculesTopToolbar(page).calculateProperties();
  });

  test('Case 31: Saving monomers to SDF v3000 works correct - system not saves every monomer template for every monomer on the canvas', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/Indigo/issues/2772
     * Description: Saving monomers to SDF v3000 works correct - system not saves every monomer template for every monomer on the canvas
     * Scenario:
     * 1. Go to Micro mode
     * 2. Load from KET
     * 3. Save canvas to SDF v3000 and check the result
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Bugs/Saving monomers to SDF v300o works wrong.ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'SDF/Saving monomers to SDF v300o works wrong-expected.sdf',
      FileType.SDF,
      SdfFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'SDF/Saving monomers to SDF v300o works wrong-expected.sdf',
    );
    await takeEditorScreenshot(page);
  });

  test('Case 32: Ketcher not fails to save structure in MOL V3000 format when encountering custom attachment labels like “Ch”', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/Indigo/issues/2781
     * Description: Ketcher not fails to save structure in MOL V3000 format when encountering custom attachment labels like “Ch”
     * Scenario:
     * 1. Go to Micro mode
     * 2. Load from MOL
     * 3. Save canvas to MOL v3000 and check the result
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V3000/Bugs/DnaBadPairs.mol',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'Molfiles-V3000/Bugs/DnaBadPairs-expected.mol',
      FileType.MOL,
      MolFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V3000/Bugs/DnaBadPairs-expected.mol',
    );
    await takeEditorScreenshot(page);
  });

  test('Case 33: Save a reaction with Multi-Tailed Arrow to Daylight SMARTS format', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/Indigo/issues/2462
     * Description: Save a reaction with Multi-Tailed Arrow to Daylight SMARTS format
     * Scenario:
     * 1. Add to Canvas reaction with Multi-Tailed Arrow
     * 2. Save canvas to Daylight SMARTS format
     * 3. Load it back
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Bugs/Reaction-with-Multi-Tailed-Arrow.ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'SMARTS/Reaction-with-Multi-Tailed-Arrow-expected.smarts',
      FileType.SMARTS,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'SMARTS/Reaction-with-Multi-Tailed-Arrow-expected.smarts',
    );
    await takeEditorScreenshot(page);
  });

  test('Case 34: Export to KET format work. System not throw exception', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/Indigo/issues/2858
     * Description: Export to any format work. System not throw exception
     * Scenario:
     * 1. Go to Micro mode
     * 2. Load from KET
     * 3. Save canvas to KET and check the result
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Bugs/svg-colored-images-with-elements.ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'KET/Bugs/svg-colored-images-with-elements-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Bugs/svg-colored-images-with-elements-expected.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Case 35: System not reverse reaction order on Calculated Values dialog', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/Indigo/issues/2859
     * Description: System not reverse reaction order on Calculated Values dialog
     * Scenario:
     * 1. Go to Micro mode
     * 2. Load from KET
     * 3. Press Calculated Values button (or press Alt+c)
     */

    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Bugs/ket-cascade-reaction-3-1-2-1-1.ket',
    );
    await takeEditorScreenshot(page);
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(
      CalculatedValuesDialog(page).chemicalFormulaInput,
    ).toContainText('[C7H14] > [C4H8]');
    await expect(CalculatedValuesDialog(page).molecularWeightInput).toHaveValue(
      '[98.189] > [56.108]',
    );
    await expect(CalculatedValuesDialog(page).exactMassInput).toHaveValue(
      '[98.110] > [56.063]',
    );
    await expect(
      CalculatedValuesDialog(page).elementalAnalysisInput,
    ).toHaveValue('[C 85.6 H 14.4] > [C 85.6 H 14.4]');
  });

  test('Case 36: Copy to clipboard work if Multi-Tailed Arrow present on the canvas', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/Indigo/issues/2860
     * Description: Copy to clipboard work if Multi-Tailed Arrow present on the canvas
     * Scenario:
     * 1. Go to Micro mode
     * 2. Load from KET
     * 3. Select all object on the canvas (press Ctrl+a) and copy it to clipboard (press Ctrl+c)
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Bugs/benzene-ring-and-multitailed-arrow.ket',
    );
    await takeEditorScreenshot(page);
    await copyAndPaste(page);
    await clickOnCanvas(page, 200, 200);
    await takeEditorScreenshot(page);
  });

  test('Case 37: Saving of 3:3 reaction to SDF v2000 not causes exception: Convert error! core: <reaction> is not a base molecule', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/Indigo/issues/2805
     * Description: Saving of 3:3 reaction to SDF v2000 not causes exception: Convert error! core: <reaction> is not a base molecule
     * Scenario:
     * 1. Go to Micro mode
     * 2. Load from KET
     * 3. Save canvas to SDF v2000 and check the result
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'RDF-V2000/rdf-rxn-v2000-reaction-3x3-new.rdf',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'SDF/rdf-rxn-v2000-reaction-3x3-new-expected.sdf',
      FileType.SDF,
      SdfFileFormat.v2000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'SDF/rdf-rxn-v2000-reaction-3x3-new-expected.sdf',
    );
    await takeEditorScreenshot(page);
  });

  test('Case 38: System not shifts text label to the right', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/Indigo/issues/1683
     * Description: System not shifts text label to the right
     * Scenario:
     * 1. Go to Micro mode
     * 2. Open from pptx file
     * 3. Take screenshot
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openPPTXFileAndValidateStructurePreview(
      page,
      'PPTX/Shifted.labels.pptx',
    );
    await takeEditorScreenshot(page);
  });

  test('Case 39: Saved Ellipse and Line Shapes in CDXML format are correctly displayed after opening', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/Indigo/issues/2047
     * Description: Saved Ellipse and Line Shapes in CDXML format are correctly displayed after opening
     * Scenario:
     * 1. Go to Micro mode
     * 2. Open from KET file
     * 3. Save canvas to CDXML format
     * 4. Open saved file
     * 5. Take screenshot
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Bugs/simple-objects-line-and-shape.ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDXML/Bugs/simple-objects-line-and-shape-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/Bugs/simple-objects-line-and-shape-expected.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  test('Case 40: Indigo calculate properties for Peptides tab if Phosphate is missing in mixed chain', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/Indigo/issues/2902
     * Description: Indigo calculate properties for Peptides tab if Phosphate is missing in mixed chain.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Open the "Calculate Properties" window
     * 4. Verify that the properties are calculated correctly for the Peptides tab
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)}|PEPTIDE1{A}$RNA1,PEPTIDE1,1:R2-1:R1$$$V2.0',
    );
    await MacromoleculesTopToolbar(page).calculateProperties();
    expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
      '354.323',
    );
    expect(await CalculateVariablesPanel(page).getMolecularFormula()).toEqual(
      'C13H18N6O6',
    );
    await CalculateVariablesPanel(page).peptidesTab.click();
    expect(
      await CalculateVariablesPanel(page).getIsoelectricPointValue(),
    ).toEqual('2.39');
    expect(
      await CalculateVariablesPanel(page).getExtinctionCoefficientValue(),
    ).toEqual('0');
    await MacromoleculesTopToolbar(page).calculateProperties();
  });

  test('Case 41: Able to export single expanded monomer to SVG Image, system not throws error: array: invalid index 0 (size=0)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/Indigo/issues/2888
     * Description: Able to export single expanded monomer to SVG Image, system not throws error: array: invalid index 0 (size=0)
     * Scenario:
     * 1. Load from KET
     * 2. Go to Micro mode
     * 3. Expand monomer (and flip Vertically - OPTIONALLY)
     * 4. Save canvas to SVG Image and check the result
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(page, 'KET/Bugs/Edc-monomer.ket');
    await expandMonomer(page, page.getByText('Edc'));
    await clickInTheMiddleOfTheScreen(page);
    await selectAllStructuresOnCanvas(page);
    await pressButton(page, 'Vertical Flip (Alt+V)');
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await takeEditorScreenshot(page);
  });

  test('Case 42: System not ignores carrige return in text blocks in loaded CDX', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/Indigo/issues/1679
     * Description: System not ignores carrige return in text blocks in loaded CDX
     * Scenario:
     * 1. Go to Micro mode
     * 2. Open from pptx file
     * 3. Take screenshot
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openPPTXFileAndValidateStructurePreview(
      page,
      'PPTX/Text.messages.pptx',
    );
    await takeEditorScreenshot(page);
  });

  test('Case 43: Indigo not fails to calculate properties when two chains are connected via a CHEM', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/Indigo/issues/2904
     * Description: Indigo not fails to calculate properties when two chains are connected via a CHEM.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from KET
     * 3. Open the "Calculate Properties" window
     * 4. Verify that the properties are calculated correctly for the Peptides tab
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Bugs/sequenses-connected-through-chem.ket',
    );
    await MacromoleculesTopToolbar(page).calculateProperties();
    await CalculateVariablesPanel(page).setMolecularMassUnits(
      MolecularMassUnit.Da,
    );
    expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
      '471.45',
    );
    expect(await CalculateVariablesPanel(page).getMolecularFormula()).toEqual(
      'C21H23N6O7',
    );
    await CalculateVariablesPanel(page).peptidesTab.click();
    expect(
      await CalculateVariablesPanel(page).getIsoelectricPointValue(),
    ).toEqual('2.39');
    expect(
      await CalculateVariablesPanel(page).getExtinctionCoefficientValue(),
    ).toEqual('0');
    await MacromoleculesTopToolbar(page).calculateProperties();
  });

  test('Case 44: Correct Calculate Properties result when monomers are connected via not a R2-R1', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/Indigo/issues/2905
     * Description: Correct Calculate Properties result when monomers are connected via not a R2-R1.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from KET
     * 3. Open the "Calculate Properties" window
     * 4. Verify that the properties are calculated correctly for the Peptides tab
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Bugs/a-a-monomers-connected-through-r2-r2.ket',
    );
    await MacromoleculesTopToolbar(page).calculateProperties();
    await CalculateVariablesPanel(page).setMolecularMassUnits(
      MolecularMassUnit.Da,
    );
    expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
      '144.174',
    );
    expect(await CalculateVariablesPanel(page).getMolecularFormula()).toEqual(
      'C6H12N2O2',
    );
    expect(
      await CalculateVariablesPanel(page).getIsoelectricPointValue(),
    ).toEqual('9.53');
    expect(
      await CalculateVariablesPanel(page).getExtinctionCoefficientValue(),
    ).toEqual('0');
    await MacromoleculesTopToolbar(page).calculateProperties();
  });

  test('Case 45: Calculated Values work if reaction arrow overlaps reactant bounding box', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/Indigo/issues/2897
     * Description: Calculated Values work if reaction arrow overlaps reactant bounding box.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from KET
     * 3. Press Calculated Values button
     */

    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Bugs/Calculated Values work if reaction arrow overlaps reactant bounding box.ket',
    );
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(
      CalculatedValuesDialog(page).chemicalFormulaInput,
    ).toContainText('[C8H10BrN3O]+[C18H15P] > [C8H10BrN3O]');
    await expect(CalculatedValuesDialog(page).molecularWeightInput).toHaveValue(
      '[244.092]+[262.292] > [244.092]',
    );
    await expect(CalculatedValuesDialog(page).exactMassInput).toHaveValue(
      '[243.001]+[262.091] > [243.001]',
    );
    await expect(
      CalculatedValuesDialog(page).elementalAnalysisInput,
    ).toHaveValue(
      '[C 39.4 H 4.1 Br 32.7 N 17.2 O 6.5]+[C 82.4 H 5.8 P 11.8] > [C 39.4 H 4.1 Br 32.7 N 17.2 O 6.5]',
    );
  });

  test.fail(
    'Case 46: Calculated values work for "rich" monomer chain',
    async () => {
      // Test fails because of the bug: https://github.com/epam/Indigo/issues/3053
      /*
       * Test case: https://github.com/epam/ketcher/issues/7243
       * Bug: https://github.com/epam/Indigo/issues/2931
       * Description: Calculated values work for "rich" monomer chain.
       * Scenario:
       * 1. Go to Macro
       * 2. Load from KET
       * 3. Open the "Calculate Properties" window
       * 4. Verify that the properties are calculated correctly for the Peptides tab
       */
      await openFileAndAddToCanvasAsNewProject(
        page,
        'KET/Bugs/Calculated values work for _rich_ monomer chain.ket',
      );
      await MacromoleculesTopToolbar(page).calculateProperties();
      expect(
        await CalculateVariablesPanel(
          page,
        ).getNucleotideNaturalAnalogCountList(),
      ).toEqual(['A0', 'C3', 'G0', 'T0', 'U3', 'Other37']);
      await MacromoleculesTopToolbar(page).calculateProperties();
    },
  );

  test('Case 47: Molecular mass and Molecular formula are calculated for Molecule (custom CHEM)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/Indigo/issues/2917
     * Description: Molecular mass and Molecular formula are calculated for Molecule (custom CHEM).
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Open the "Calculate Properties" window
     * 4. Verify that the properties are calculated correctly
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'CHEM1{[[H]([*:1])[He]1[Li][Be]2[K]3[Ca]4[Sc]5C([B]2)[N]O2[V]6[Ti]5[Rb]5[Kr]7[Br]4[SeH]4[In]8[Cd]9[Ag]%10[Pd]%11[Os]%12[Re]([W][Ru][Rh]%11[Zn][Ga]%11S([PH])[Cl]1[Ar]3[AsH]4[Ge]%10%11)[Db][Sg]1[Bh]3[Hs]4[Pm]%10[Nd]%11[Pr]1[Ce]([La])[Th][Pa][U]%11[Np][Pu]1[Am][Cm]%11[Gd]%13[Eu]([Sm]%101)[Ds]1[Mt]4[Au]([Pt]9[Ir]%123)[Hg]3[Tl]4[PbH]9[BiH]%10[PoH]%12[Xe]%14[I]([TeH]9[SbH]7[SnH]83)[Sr]5[Y]3[Cr]6[Mn]5[Ne](F2)[Na][Mg]2[Co]6[Fe]5[Nb]5[Zr]3[Cs]%14[Ba]3[Rn]7[At]%12[Mc]8[Fl]9[Nh]%10[Cn]([Tb]%13[Dy]%10[Ho]9[Er]9[Tm]%12[Yb]([No]([Md][Fm]9[Es][Cf]%10[Bk]%11)[Lr])[Lu]([Ac])[Og][Ts]([Fr]7[Ra]([Rf])[Ta][Hf]3[Mo]5[Tc][Ni]6[Cu][Si][Al]2)[Lv]%128)[Rg]41 |^3:8,34,115,^1:9,10,16,18,28,30,31,33,60,62,65,67,84,116,$;_R1;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;$|]}$$$$V2.0',
    );
    await MacromoleculesTopToolbar(page).calculateProperties();
    expect(await CalculateVariablesPanel(page).getMolecularFormula()).toEqual(
      'CH17AcAgAlAmArAsAtAuBBaBeBhBiBkBrCaCdCeCfClCmCnCoCrCsCuDbDsDyErEsEuFFeFlFmFrGaGdGeHeHfHgHoHsIInIrKKrLaLiLrLuLvMcMdMgMnMoMtNNaNbNdNeNhNiNoNpOOgOsPPaPbPdPmPoPrPtPuRaRbReRfRgRhRnRuSSbScSeSgSiSmSnSrTaTbTcTeThTiTlTmTsUVWXeYYbZnZr',
    );
    await MacromoleculesTopToolbar(page).calculateProperties();
  });

  test('Case 48: System calculate melting temperature for GC nucleotides pair', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/Indigo/issues/2939
     * Description: System calculate melting temperature for GC nucleotides pair.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Open the "Calculate Properties" window
     * 4. Verify that the properties are calculated correctly
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(G)P.R(C)}|RNA2{R(G)P.R(C)}$RNA1,RNA2,5:pair-2:pair|RNA1,RNA2,2:pair-5:pair$$$V2.0',
    );
    await MacromoleculesTopToolbar(page).calculateProperties();
    await CalculateVariablesPanel(page).setMolecularMassUnits(
      MolecularMassUnit.Da,
    );
    expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
      '1176.854',
    );
    expect(await CalculateVariablesPanel(page).getMolecularFormula()).toEqual(
      'C38H50N16O24P2',
    );
    expect(
      await CalculateVariablesPanel(page).getMeltingTemperatureValue(),
    ).toEqual('17');
    await MacromoleculesTopToolbar(page).calculateProperties();
  });

  test('Case 49: System not count bases that are not part of a nucleotide/nucleoside as RNA/DNA', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/Indigo/issues/2930
     * Description: System not count bases that are not part of a nucleotide/nucleoside as RNA/DNA.
     * "Calculate Properties" window should set to blank and be grayed out, and the window should contain an error message: "Select monomer, chain or part of a chain".
     * Scenario:
     * 1. Go to Macro
     * 2. Load from KET
     * 3. Open the "Calculate Properties" window
     * 4. Go to RNA/DNA tab
     * 5. Verify that the properties are not calculated for bases that are not part of a nucleotide/nucleoside
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Bugs/System shouldnt count bases that are not part of a nucleotide_nucleoside as RNA_DNA.ket',
    );
    await MacromoleculesTopToolbar(page).calculateProperties();
    await CalculateVariablesPanel(page).rnaTab.click();
    await takePageScreenshot(page);
    await MacromoleculesTopToolbar(page).calculateProperties();
  });

  test('Case 50: Melting temperature value is missed if UPC or NAC value set to zero', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/Indigo/issues/2987
     * Description: Melting temperature value is missed if UPC or NAC value set to zero.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Open the "Calculate Properties" window
     * 4. Verify that the properties are calculated correctly
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)}|RNA2{[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)}$RNA1,RNA2,11:pair-5:pair|RNA1,RNA2,8:pair-8:pair|RNA1,RNA2,5:pair-11:pair|RNA1,RNA2,2:pair-14:pair|RNA1,RNA2,14:pair-2:pair$$$V2.0',
    );
    await MacromoleculesTopToolbar(page).calculateProperties();
    await takePageScreenshot(page);
    await CalculateVariablesPanel(page).setUnipositiveIonsValue('0');
    await takePageScreenshot(page);
    await CalculateVariablesPanel(page).setUnipositiveIonsValue('140');
    await CalculateVariablesPanel(page).setOligonucleotidesValue('0');
    await takePageScreenshot(page);
    await MacromoleculesTopToolbar(page).calculateProperties();
  });

  test('Case 51: Correct structure for PHE-L-Phenylalanine in template library', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/ketcher/issues/4838
     * Description: Correct structure for PHE-L-Phenylalanine in template library.
     * Scenario:
     * 1. Open L-aminoacids or D-aminoacids in template library
     * 2. Put selected template to canvas
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openStructureLibrary(page);
    await page.getByRole('tab', { name: 'Template Library' }).click();
    await page.getByRole('button', { name: 'D-Amino Acids' }).click();
    await selectUserTemplate(TemplateLibrary.PHEDPhenylalanine, page);
    await clickOnTheCanvas(page, 200, 200);
    await openStructureLibrary(page);
    await page.getByRole('tab', { name: 'Template Library' }).click();
    await page.getByRole('button', { name: 'L-Amino Acids' }).click();
    await selectUserTemplate(TemplateLibrary.PHELPhenylalanine, page);
    await clickOnTheCanvas(page, 100, 100);
    await takeEditorScreenshot(page);
  });

  test('Case 52: Settings for the "attachment point tool" update with changed pixel settings', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7243
     * Bug: https://github.com/epam/ketcher/issues/4189
     * Description: Settings for the "attachment point tool" update with changed pixel settings.
     * Scenario:
     * 1. Put benzene ring with attachment point on the canvas
     * 2. Go to Setting->Bonds and change Bond thickness to 5
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Bugs/benzene-ring-with-ap.ket',
    );
    await takeEditorScreenshot(page);
    await setSettingsOptions(page, [
      {
        option: BondsSetting.BondThicknessUnits,
        value: MeasurementUnit.Px,
      },
      { option: BondsSetting.BondThickness, value: '5' },
    ]);
    await takeEditorScreenshot(page);
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).reset();
    await SettingsDialog(page).apply();
  });
});
