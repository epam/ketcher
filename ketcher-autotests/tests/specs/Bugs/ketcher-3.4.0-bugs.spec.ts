/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { Peptides } from '@constants/monomers/Peptides';
import { Page, test, expect } from '@playwright/test';
import {
  takeEditorScreenshot,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  MacroFileType,
  selectAllStructuresOnCanvas,
  selectFlexLayoutModeTool,
  resetZoomLevelToDefault,
  takeMonomerLibraryScreenshot,
  openFileAndAddToCanvasAsNewProjectMacro,
  openFileAndAddToCanvasAsNewProject,
  takeLeftToolbarMacromoleculeScreenshot,
  takeTopToolbarScreenshot,
  SdfFileFormat,
  selectSequenceLayoutModeTool,
  clickInTheMiddleOfTheScreen,
  takePageScreenshot,
  clickOnAtom,
  waitForMonomerPreview,
} from '@utils';
import { waitForPageInit } from '@utils/common';
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
    await selectFlexLayoutModeTool(page);
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
    await selectSequenceLayoutModeTool(page);
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
    await selectFlexLayoutModeTool(page);
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
    await keyboardTypeOnCanvas(page, 'AAAAAAAAAAPPPPPAAAAAAAAAA');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await selectFlexLayoutModeTool(page);
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
    await switchToPeptideMode(page);
    await keyboardTypeOnCanvas(page, 'QQQQQ');
    await switchToRNAMode(page);
    await keyboardTypeOnCanvas(page, 'AAAAAAAAAA');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await selectFlexLayoutModeTool(page);
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
    await Library(page).selectMonomer(Peptides.O);
    await Library(page).selectMonomer(Peptides.K);
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
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)}|RNA2{[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)}$RNA1,RNA2,38:pair-2:pair|RNA1,RNA2,35:pair-5:pair|RNA1,RNA2,32:pair-8:pair|RNA1,RNA2,29:pair-11:pair|RNA1,RNA2,26:pair-14:pair|RNA1,RNA2,23:pair-17:pair|RNA1,RNA2,20:pair-20:pair|RNA1,RNA2,17:pair-23:pair|RNA1,RNA2,14:pair-26:pair|RNA1,RNA2,11:pair-29:pair|RNA1,RNA2,8:pair-32:pair|RNA1,RNA2,5:pair-35:pair|RNA1,RNA2,2:pair-38:pair$$$V2.0',
    );
    await CommonTopLeftToolbar(page).calculateProperties();
    await takePageScreenshot(page);
    await CommonTopLeftToolbar(page).calculateProperties();
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
    await CommonTopLeftToolbar(page).calculateProperties();
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
    await CommonTopLeftToolbar(page).calculateProperties();
    await takePageScreenshot(page);
    await CommonTopLeftToolbar(page).calculateProperties();
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
    await switchToPeptideMode(page);
    await keyboardTypeOnCanvas(page, 'QWERTYASDF');
    await CommonTopLeftToolbar(page).calculateProperties();
    await Library(page).selectMonomer(Peptides.X);
    await Library(page).selectMonomer(Peptides.B);
    await Library(page).selectMonomer(Peptides.J);
    await Library(page).selectMonomer(Peptides.Z);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
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
      await selectFlexLayoutModeTool(page);
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
});
