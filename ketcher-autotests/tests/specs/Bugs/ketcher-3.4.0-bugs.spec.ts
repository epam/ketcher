/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { Bases } from '@constants/monomers/Bases';
import { Peptides } from '@constants/monomers/Peptides';
import { Sugars } from '@constants/monomers/Sugars';
import { Page, test } from '@playwright/test';
import {
  selectSnakeLayoutModeTool,
  takeEditorScreenshot,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  MacroFileType,
  selectAllStructuresOnCanvas,
  selectFlexLayoutModeTool,
  resetZoomLevelToDefault,
  clickInTheMiddleOfTheScreen,
  takeMonomerLibraryScreenshot,
  takePageScreenshot,
  selectSequenceLayoutModeTool,
  openFileAndAddToCanvasAsNewProjectMacro,
  clickOnCanvas,
  selectSaltsAndSolvents,
  SaltsAndSolvents,
  openFileAndAddToCanvasAsNewProject,
  pressButton,
  takeLeftToolbarMacromoleculeScreenshot,
  takeTopToolbarScreenshot,
  SdfFileFormat,
} from '@utils';
import { waitForMonomerPreview } from '@utils/macromolecules';
import { waitForPageInit } from '@utils/common';
import {
  createRNAAntisenseChain,
  getMonomerLocator,
  getSymbolLocator,
  modifyInRnaBuilder,
  turnSyncEditModeOff,
} from '@utils/macromolecules/monomer';
import { processResetToDefaultState } from '@utils/testAnnotations/resetToDefaultState';
import {
  keyboardPressOnCanvas,
  keyboardTypeOnCanvas,
} from '@utils/keyboard/index';
import { Phosphates } from '@constants/monomers/Phosphates';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import {
  FileType,
  verifyFileExport,
  verifyHELMExport,
} from '@utils/files/receiveFileComparisonData';
import { selectRingButton } from '@tests/pages/molecules/BottomToolbar';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import { Library } from '@tests/pages/macromolecules/Library';
import { RNASection } from '@tests/pages/constants/library/Constants';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { SequenceSymbolOption } from '@tests/pages/constants/contextMenu/Constants';
import { expandMonomer, expandMonomers } from '@utils/canvas/monomer/helpers';
import { KETCHER_CANVAS } from '@tests/pages/constants/canvas/Constants';
import { Presets } from '@constants/monomers/Presets';
import {
  switchToPeptideMode,
  switchToRNAMode,
} from '@utils/macromolecules/sequence';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import {
  MacromoleculesFileFormatName,
  MacromoleculesFileFormatType,
} from '@tests/pages/constants/fileFormats/macroFileFormats';

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
});
