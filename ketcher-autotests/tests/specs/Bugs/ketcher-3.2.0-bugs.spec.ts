/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { Bases } from '@constants/monomers/Bases';
import { Peptides } from '@constants/monomers/Peptides';
import { Phosphates } from '@constants/monomers/Phosphates';
import { Sugars } from '@constants/monomers/Sugars';
import { Page, test } from '@playwright/test';
import {
  selectSnakeLayoutModeTool,
  takeEditorScreenshot,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  MacroFileType,
  selectAllStructuresOnCanvas,
  openFileAndAddToCanvasAsNewProject,
  selectFlexLayoutModeTool,
  selectSequenceLayoutModeTool,
  moveMouseAway,
  openFileAndAddToCanvasAsNewProjectMacro,
  FILE_TEST_DATA,
  resetZoomLevelToDefault,
  resetCurrentTool,
  clickOnCanvas,
  setMolecule,
} from '@utils';
import {
  waitForPageInit,
  waitForRender,
  waitForSpinnerFinishedWork,
} from '@utils/common';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import {
  pressUndoButton,
  selectClearCanvasTool,
  selectSaveTool,
} from '@tests/pages/common/TopLeftToolbar';
import {
  setZoomInputValue,
  turnOnMacromoleculesEditor,
  turnOnMicromoleculesEditor,
} from '@tests/pages/common/TopRightToolbar';
import {
  createDNAAntisenseChain,
  createRNAAntisenseChain,
  deleteHydrogenBond,
  getMonomerLocator,
  getSymbolLocator,
  turnSyncEditModeOff,
  turnSyncEditModeOn,
} from '@utils/macromolecules/monomer';
import { switchToPeptideMode } from '@utils/macromolecules/sequence';
import { processResetToDefaultState } from '@utils/testAnnotations/resetToDefaultState';
import {
  keyboardPressOnCanvas,
  keyboardTypeOnCanvas,
} from '@utils/keyboard/index';
import { SequenceMonomerType } from '@tests/pages/constants/monomers/Constants';
import { MacromoleculesFileFormatType } from '@tests/pages/constants/fileFormats/macroFileFormats';
import { chooseFileFormat } from '@tests/pages/common/SaveStructureDialog';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';

let page: Page;

async function callContexMenu(page: Page, locatorText: string) {
  const canvasLocator = page.getByTestId('ketcher-canvas');
  await canvasLocator.getByText(locatorText, { exact: true }).click({
    button: 'right',
  });
}

async function expandMonomer(page: Page, locatorText: string) {
  await callContexMenu(page, locatorText);
  await waitForRender(page, async () => {
    await page.getByText('Expand monomer').click();
  });
}

test.describe('Ketcher bugs in 3.2.0', () => {
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page, {
      enableFlexMode: false,
      goToPeptides: false,
    });
  });

  test.afterEach(async ({ context: _ }, testInfo) => {
    await selectClearCanvasTool(page);
    await resetZoomLevelToDefault(page);
    await processResetToDefaultState(testInfo, page);
  });

  test.afterAll(async ({ browser }) => {
    await Promise.all(browser.contexts().map((context) => context.close()));
  });

  test('Case 1: All snapping related elements (and bonds) not become invisible after switching to Molecules mode and back', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6764
     * Bug: https://github.com/epam/ketcher/issues/6627
     * Description: All snapping related elements (and bonds) not become invisible after switching to Molecules mode and back.
     * Scenario:
     * 1. Go to Macro - Flex mode (clean canvas)
     * 2. Load from HELM
     * 3. Go to Molecules mode and return back to Macro - Flex mode
     * 4. Grab one monomer and move it
     */
    await selectFlexLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{C}|PEPTIDE2{A}$PEPTIDE1,PEPTIDE2,1:pair-1:pair$$$V2.0',
    );
    await turnOnMicromoleculesEditor(page);
    await turnOnMacromoleculesEditor(page);
    await getMonomerLocator(page, Peptides.A).click();
    await page.mouse.down();
    await page.mouse.move(600, 400);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 2: Library ambiguius RNA bases loaded from HELM as bases with labels from the Library', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6764
     * Bug: https://github.com/epam/Indigo/issues/2818
     * Description: Library ambiguius RNA bases loaded from HELM as bases with labels from the Library.
     * Scenario:
     * 1. Switch to Flex Mode in Macromolecules.
     * 2. Load from HELM
     * 3. Take a screenshot.
     * Need to update screenshot after Indigo will be updated.
     */
    await selectFlexLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A,C,G,U)P.R(C,G,U)P.R(A,G,U)P.R(A,C,U)P.R(G,U)P.R(A,U)P.R(C,U)P}$$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 3: Able to paste HELM from clipboard to the canvas. System not throws an error: Convert error! option manager: Property "sequence-type" not defined', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6764
     * Bug: https://github.com/epam/ketcher/issues/6709
     * Description: Able to paste HELM from clipboard to the canvas. System not throws an error: Convert error! option manager: Property "sequence-type" not defined.
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas).
     * 2. Load from HELM
     * 3. Take a screenshot.
     */
    await selectSequenceLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P.R(U)}$RNA1,RNA2,8:pair-2:pair|RNA1,RNA2,5:pair-5:pair|RNA1,RNA2,2:pair-8:pair$$$V2.0',
    );
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

  test('Case 4: Create RNA/DNA Strand work for B, K, Y and S ambiguous bases', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6764
     * Bug: https://github.com/epam/ketcher/issues/6729
     * Description: Create RNA/DNA Strand work for B, K, Y and S ambiguous bases.
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas).
     * 2. Load from HELM
     * 3. Select all (press Ctrl+A), call context menu and click Create RNA Antisense Strand
     * 4. Take a screenshot.
     */
    const anySymbolA = getSymbolLocator(page, { symbolAlias: 'A' }).first();
    await selectSequenceLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      [MacroFileType.Sequence, SequenceMonomerType.RNA],
      'ACGTUNBDHKWYMRSV',
    );
    await selectAllStructuresOnCanvas(page);
    await createRNAAntisenseChain(page, anySymbolA);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 5: Snapping (and invisible monomer moving) should be disabled on Sequence mode', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6764
     * Bug: https://github.com/epam/ketcher/issues/6723
     * Description: Snapping (and invisible monomer moving) should be disabled on Sequence mode.
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas).
     * 2. Load from HELM
     * 3. Grab p symbol and move it across canvas
     * 4. Switch to Flex mode
     * 5. Take a screenshot.
     */
    await selectSequenceLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.R(A)P}|RNA2{R(A)P}|RNA3{R(U)P.R(U)P.R(U)}|PEPTIDE1{E}$RNA1,RNA3,2:pair-8:pair|RNA1,PEPTIDE1,6:R2-1:R1|PEPTIDE1,RNA2,1:R2-1:R1|PEPTIDE1,RNA3,1:pair-5:pair$$$V2.0',
    );
    await getSymbolLocator(page, { symbolAlias: 'p' }).first().click();
    await page.mouse.down();
    await page.mouse.move(600, 400);
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

  test('Case 6: System allow to select single antisense symbol that not causes an error if it got deleted', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6764
     * Bug: https://github.com/epam/ketcher/issues/6443
     * Description: System allow to select single antisense symbol that not causes an error if it got deleted.
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas).
     * 2. Load from HELM
     * 3. Select symbol in the middle using area selection
     * 4. Press Delete button
     * 5. Take a screenshot.
     */
    await selectSequenceLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P.R(U)}$RNA1,RNA2,2:pair-2:pair|RNA1,RNA2,5:pair-5:pair|RNA1,RNA2,8:pair-8:pair$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await getSymbolLocator(page, { symbolAlias: 'U' }).nth(1).click();
    await keyboardPressOnCanvas(page, 'Delete');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 7: Empty element not appears after undoing line deletion in Sequence mode and switching to Flex/Snake mode', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6764
     * Bug: https://github.com/epam/ketcher/issues/6617
     * Description: Empty element not appears after undoing line deletion in Sequence mode and switching to Flex/Snake mode.
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas).
     * 2. Load from HELM
     * 3. Delete a line between Adenine monomers.
     * 4. Press Undo (Ctrl+Z).
     * 5. Switch to Flex mode or Snake mode.
     * 6. Take a screenshot.
     */
    await selectSequenceLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P.R(U)P.R(U)P.R(U)}$RNA1,RNA2,11:pair-2:pair|RNA1,RNA2,8:pair-5:pair|RNA1,RNA2,5:pair-11:pair|RNA1,RNA2,2:pair-14:pair$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await getSymbolLocator(page, { symbolAlias: 'U' }).nth(2).dblclick();
    await keyboardPressOnCanvas(page, 'ArrowDown');
    await keyboardPressOnCanvas(page, 'Delete');
    await pressUndoButton(page);
    await selectFlexLayoutModeTool(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 8: Sense and antisense chains not switch places during editing based on monomer count', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6764
     * Bug: https://github.com/epam/ketcher/issues/6623
     * Description: Sense and antisense chains not switch places during editing based on monomer count.
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas).
     * 2. Load from HELM
     * 3. Enter edit mode and turn off sync mode
     * 4. Add Uracil to antisense strand.
     * 5. Exit edit mode
     * 6. Take a screenshot.
     */
    await selectSequenceLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P.R(U)P.R(U)}$RNA1,RNA2,11:pair-2:pair|RNA1,RNA2,8:pair-5:pair|RNA1,RNA2,5:pair-8:pair|RNA1,RNA2,2:pair-11:pair$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await turnSyncEditModeOff(page);
    await getSymbolLocator(page, { symbolAlias: 'U' }).nth(1).dblclick();
    await keyboardPressOnCanvas(page, 'ArrowDown');
    await keyboardTypeOnCanvas(page, 'UU');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await keyboardPressOnCanvas(page, 'Escape');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 9: System create antisense phosphate if it sistuated to the left from nucleotide', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6764
     * Bug: https://github.com/epam/ketcher/issues/6619
     * Description: System create antisense phosphate if it sistuated to the left from nucleotide.
     * Scenario:
     * 1. Go to Macro - Snake mode (clean canvas)
     * 2. Load from HELM
     * 3. Select phosphates and nucleoside between
     * 4. Create antisense chain for selection
     * 5. Take a screenshot.
     */
    await selectSnakeLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.R(A)[bP].R(A)}$$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    const phosphateP = getMonomerLocator(page, Phosphates.P).first();
    const sugarR = getMonomerLocator(page, Sugars.R).nth(1);
    const phosphatebP = getMonomerLocator(page, Phosphates.bP).first();
    const baseA = getMonomerLocator(page, Bases.A).nth(1);

    await page.keyboard.down('Shift');
    await phosphateP.click();
    await sugarR.click();
    await phosphatebP.click();
    await moveMouseAway(page);
    await baseA.click();
    await page.keyboard.up('Shift');
    await createRNAAntisenseChain(page, phosphateP);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 10: System creates ambiguous DNA nucleotides (with Uracil) instead of DNA ones (with Thymine)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6764
     * Bug: https://github.com/epam/ketcher/issues/6609
     * Description: System creates ambiguous DNA nucleotides (with Uracil) instead of DNA ones (with Thymine).
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from KET
     * 3. Select all nucleotides and call context menu
     * 4. Click Create DNA antisense stand option
     * 5. Take a screenshot.
     */
    await selectSequenceLayoutModeTool(page);
    await openFileAndAddToCanvasAsNewProject(
      'KET/Bugs/System creates ambiguous RNA nucleotides instead of DNA ones in case of DNA antisense stand creation.ket',
      page,
    );
    await selectAllStructuresOnCanvas(page);
    const anySymbolR = getSymbolLocator(page, { symbolAlias: 'R' }).first();
    await createDNAAntisenseChain(page, anySymbolR);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await selectSaveTool(page);
    await chooseFileFormat(page, MacromoleculesFileFormatType.HELM);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 11: Warning message when deleting all hydrogen bonds between two chains', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6764
     * Bug: https://github.com/epam/ketcher/issues/6615
     * Description: Warning message when deleting all hydrogen bonds between two chains.
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from HELM
     * 3. Select all nucleotides and call context menu
     * 4. Click Create DNA antisense stand option
     * 5. Take a screenshot.
     */
    await selectSequenceLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.R(A)P.R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P.R(U)P.R(U)P.R(U)}$RNA1,RNA2,14:pair-2:pair|RNA1,RNA2,11:pair-5:pair|RNA1,RNA2,8:pair-8:pair|RNA1,RNA2,5:pair-11:pair|RNA1,RNA2,2:pair-14:pair$$$V2.0',
    );
    await selectAllStructuresOnCanvas(page);
    const anySymbolA = getSymbolLocator(page, { symbolAlias: 'A' }).first();
    await deleteHydrogenBond(page, anySymbolA);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 12: System adds both sense and antisense chain nucleosids in SYNC mode', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6764
     * Bug: https://github.com/epam/ketcher/issues/6606
     * Description: System adds both sense and antisense chain nucleosids in SYNC mode.
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from HELM
     * 3. Switch to edit mode and try to add nucleotide (RNA or DNA - C in my case) to the last position
     * 4. Take a screenshot.
     */
    await selectSequenceLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.R(A)P.R(A)}|RNA2{P.R(U)}$RNA1,RNA2,2:pair-3:pair|RNA1,RNA2,8:pair-1:pair$$$V2.0',
    );
    await getSymbolLocator(page, {
      symbolAlias: 'A',
      nodeIndexOverall: 2,
    }).dblclick();
    await keyboardPressOnCanvas(page, 'ArrowRight');
    await keyboardPressOnCanvas(page, 'C');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 13: System can add nucleotide between phosphate and nucleotide in antisence chain', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6764
     * Bug: https://github.com/epam/ketcher/issues/6531
     * Description: System can add nucleotide between phosphate and nucleotide in antisence chain.
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from HELM
     * 3. Switch to edit mode and try to add nucleotide (RNA or DNA, C in my case) between @ and U
     * 4. Take a screenshot.
     */
    await selectSequenceLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'CHEM1{[4aPEGMal]}|RNA1{R(U)P}|CHEM2{[4aPEGMal]}|CHEM3{[4aPEGMal]}|RNA2{R(A)P}|RNA3{P}$RNA1,CHEM2,3:R2-1:R1|CHEM3,CHEM2,1:pair-1:pair|CHEM1,RNA1,1:R2-1:R1|RNA2,RNA3,3:R2-1:R1|RNA2,CHEM3,1:R1-1:R2|CHEM1,RNA3,1:pair-1:pair|RNA1,RNA2,2:pair-2:pair$$$V2.0',
    );
    await getSymbolLocator(page, {
      symbolAlias: 'U',
      nodeIndexOverall: 1,
    }).dblclick();
    await keyboardPressOnCanvas(page, 'ArrowLeft');
    await keyboardPressOnCanvas(page, 'C');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 14: Snapping not wipes monomer labels in some cases', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6764
     * Bug: https://github.com/epam/ketcher/issues/6621
     * Description: Snapping not wipes monomer labels in some cases.
     * Scenario:
     * 1. Go to Macro - Flex mode (clean canvas)
     * 2. Load from HELM
     * 3. Grab central sugar and move it around whole structure petals
     * 4. Take a screenshot.
     */
    await selectFlexLayoutModeTool(page);
    await openFileAndAddToCanvasAsNewProjectMacro(
      'KET/Bugs/Snapping wipes monomer labels in some cases.ket',
      page,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await getMonomerLocator(page, Sugars.R).first().click();
    await page.mouse.down();
    const coords = [
      [750, 250],
      [587, 100],
      [365, 150],
      [300, 550],
      [750, 600],
    ];
    for (let i = 0; i < coords.length; i++) {
      const [x, y] = coords[i];
      await page.mouse.move(x, y);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    }
  });

  test('Case 15: Adding nucleotide to first position at sense/antisense chain', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6764
     * Bug: https://github.com/epam/ketcher/issues/6554
     * Description: Adding nucleotide to first position at sense/antisense chain.
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from HELM
     * 3. Switch to edit mode and try to add nucleotide (RNA or DNA - C in my case) to the first position
     * 4. Take a screenshot.
     */
    await selectSequenceLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P.R(U)}$RNA1,RNA2,8:pair-2:pair|RNA1,RNA2,2:pair-8:pair|RNA1,RNA2,5:pair-5:pair$$$V2.0',
    );
    await getSymbolLocator(page, {
      symbolAlias: 'A',
      nodeIndexOverall: 0,
    }).dblclick();
    await keyboardPressOnCanvas(page, 'ArrowLeft');
    await keyboardPressOnCanvas(page, 'C');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 16: New sequence not appears gray after clearing the canvas in non-sync mode', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6764
     * Bug: https://github.com/epam/ketcher/issues/6632
     * Description: New sequence not appears gray after clearing the canvas in non-sync mode.
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from HELM
     * 3. Switch to the antisense chain
     * 4. Notice that the sense chain becomes grayed out
     * 5. Click Clear Canvas
     * 6. Start typing a new sequence
     * 7. Take a screenshot.
     */
    await selectSequenceLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P.R(U)}$RNA1,RNA2,8:pair-2:pair|RNA1,RNA2,2:pair-8:pair|RNA1,RNA2,5:pair-5:pair$$$V2.0',
    );
    await turnSyncEditModeOff(page);
    await getSymbolLocator(page, {
      symbolAlias: 'A',
      nodeIndexOverall: 0,
    }).dblclick();
    await keyboardPressOnCanvas(page, 'ArrowDown');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await selectClearCanvasTool(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await keyboardTypeOnCanvas(page, 'AAAAA');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 17: Sync mode not causes incorrect letter input after adding a monomer in non-sync mode', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6764
     * Bug: https://github.com/epam/ketcher/issues/6631
     * Description: Sync mode not causes incorrect letter input after adding a monomer in non-sync mode.
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from HELM
     * 3. Disable sync mode and add monomer "U" in the antisense chain.
     * 4. Notice that the antisense strand flips during editing.
     * 5. Enable sync mode and click Clear Canvas.
     * 6. Try to type "A" or "U" on the keyboard.
     * 7. Take a screenshot.
     */
    await selectSequenceLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P.R(U)P.R(U)}$RNA1,RNA2,11:pair-2:pair|RNA1,RNA2,8:pair-5:pair|RNA1,RNA2,5:pair-8:pair|RNA1,RNA2,2:pair-11:pair$$$V2.0',
    );
    await turnSyncEditModeOff(page);
    await getSymbolLocator(page, {
      symbolAlias: 'U',
      nodeIndexOverall: 2,
    }).dblclick();
    await keyboardPressOnCanvas(page, 'ArrowDown');
    await keyboardPressOnCanvas(page, 'ArrowLeft');
    await keyboardPressOnCanvas(page, 'U');
    await turnSyncEditModeOn(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await selectClearCanvasTool(page);
    await keyboardTypeOnCanvas(page, 'AAAAA');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 18: System add same thing in antisense chain but not connect it with H-bond if it is not nucleotide/nucleoside', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6764
     * Bug: https://github.com/epam/ketcher/issues/6539
     * Description: System add same thing in antisense chain but not connect it with H-bond if it is not nucleotide/nucleoside.
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from HELM
     * 3. Switch to edit mode and try to add peptide (E in my case) between two As
     * 4. Take a screenshot.
     */
    await selectSequenceLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)}$RNA1,RNA2,5:pair-2:pair|RNA1,RNA2,2:pair-5:pair$$$V2.0',
    );
    await getSymbolLocator(page, {
      symbolAlias: 'A',
      nodeIndexOverall: 1,
    }).dblclick();
    await keyboardPressOnCanvas(page, 'ArrowLeft');
    await switchToPeptideMode(page);
    await keyboardPressOnCanvas(page, 'E');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 19: Adding nucleotide between nucleotide and - symbol not causes appearence of separated phosphate on the canvas', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6764
     * Bug: https://github.com/epam/ketcher/issues/6530
     * Description: Adding nucleotide between nucleotide and - symbol not causes appearence of separated phosphate on the canvas.
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from HELM
     * 3. Switch to edit mode and try to add nucleotide (RNA or DNA - C in my case) before first U and - symbol
     * 4. Take a screenshot.
     */
    await selectSequenceLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)}|RNA2{R(U)P.R(U)}|RNA3{R(A)}$RNA1,RNA2,2:pair-2:pair|RNA2,RNA3,5:pair-2:pair$$$V2.0',
    );
    await getSymbolLocator(page, {
      symbolAlias: 'U',
      nodeIndexOverall: 0,
    }).dblclick();
    await keyboardPressOnCanvas(page, 'ArrowRight');
    await keyboardPressOnCanvas(page, 'ArrowLeft');
    await keyboardPressOnCanvas(page, 'C');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 20: API setMolecule not moves molecule off-canvas on second call', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6764
     * Bug: https://github.com/epam/ketcher/issues/6608
     * Description: API setMolecule not moves molecule off-canvas on second call.
     * Scenario:
     * 1. Go to Micro
     * 2. Make setMolecule call with coordinates (10, 10) twice
     * 3. Take a screenshot.
     */
    await turnOnMicromoleculesEditor(page);
    await waitForSpinnerFinishedWork(
      page,
      async () =>
        await setMolecule(
          page,
          FILE_TEST_DATA.moleculeWithSpecificCoordinates,
          { x: 10, y: 10 },
        ),
    );
    await takeEditorScreenshot(page);
    await waitForSpinnerFinishedWork(
      page,
      async () =>
        await setMolecule(
          page,
          FILE_TEST_DATA.moleculeWithSpecificCoordinates,
          { x: 10, y: 10 },
        ),
    );
    await takeEditorScreenshot(page);
  });

  test('Case 21: R Group logic condition is not wrong if loaded from MOL', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6764
     * Bug: https://github.com/epam/Indigo/issues/2699
     * Description: R Group logic condition is not wrong if loaded from MOL.
     * Scenario:
     * 1. Go to Micro
     * 2. Load from MOL
     * 3. Take a screenshot.
     */
    await turnOnMicromoleculesEditor(page);
    await openFileAndAddToCanvasAsNewProject(
      'Molfiles-V2000/Bugs/markush.mol',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Case 22: R Group logic condition is not wrong if loaded from complex structure MOL', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6764
     * Bug: https://github.com/epam/Indigo/issues/2699
     * Description: R Group logic condition is not wrong if loaded from MOL.
     * Scenario:
     * 1. Go to Micro
     * 2. Load from MOL
     * 3. Take a screenshot.
     */
    await turnOnMicromoleculesEditor(page);
    await openFileAndAddToCanvasAsNewProject(
      'Molfiles-V2000/Bugs/complex-r-group-structure.mol',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Case 23: System not losts one stereo label if load from MOL', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6764
     * Bug: https://github.com/epam/Indigo/issues/2704
     * Description: System not losts one stereo label if load from MOL.
     * Scenario:
     * 1. Go to Micro
     * 2. Load from MOL
     * 3. Take a screenshot.
     */
    await turnOnMicromoleculesEditor(page);
    await openFileAndAddToCanvasAsNewProject(
      'Molfiles-V2000/Bugs/two-stereostructures.mol',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Case 24: Export molecule which contains atom with five neighbors and stereo-bond not cause error', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6764
     * Bug: https://github.com/epam/Indigo/issues/2702
     * Description: Export molecule which contains atom with five neighbors and stereo-bond not cause error and can be saved to MOL V2000.
     * Scenario:
     * 1. Go to Micro
     * 2. Load from KET
     * 3. Save to MOL V2000
     * 4. Take a screenshot.
     */
    await turnOnMicromoleculesEditor(page);
    await openFileAndAddToCanvasAsNewProject(
      'KET/Bugs/Unable to save canvas to MOL - system throws an error.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'Molfiles-V2000/Bugs/Unable to save canvas to MOL - system throws an error-expected.mol',
      FileType.MOL,
      'v2000',
    );
    await openFileAndAddToCanvasAsNewProject(
      'Molfiles-V2000/Bugs/Unable to save canvas to MOL - system throws an error-expected.mol',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Case 25: Atom Query feature export: System not lost MOST "Substitution count" values', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6764
     * Bug: https://github.com/epam/Indigo/issues/2707
     * Description: Atom Query feature export: System not lost MOST "Substitution count" values.
     * Scenario:
     * 1. Go to Micro
     * 2. Load from KET
     * 3. Take a screenshot.
     */
    await turnOnMicromoleculesEditor(page);
    await openFileAndAddToCanvasAsNewProject(
      'KET/Bugs/Substitution count.ket',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Case 26: Export to SMILES works if loaded from MOL', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6764
     * Bug: https://github.com/epam/Indigo/issues/2708
     * Description: Export to SMILES works if loaded from MOL.
     * Scenario:
     * 1. Go to Micro
     * 2. Load from MOL
     * 3. Save to SMILES
     */
    await turnOnMicromoleculesEditor(page);
    await openFileAndAddToCanvasAsNewProject(
      'Molfiles-V2000/Bugs/different-features.mol',
      page,
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'SMILES/Bugs/different-features-expected.smi',
      FileType.SMILES,
    );
  });

  test('Case 27: Elliptical arrows can be saved to the png', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6764
     * Bug: https://github.com/epam/Indigo/issues/2513
     * Description: Elliptical arrows can be saved to the png.
     * Scenario:
     * 1. Go to Micro
     * 2. Load from KET
     * 3. Save to PNG
     */
    await turnOnMicromoleculesEditor(page);
    await openFileAndAddToCanvasAsNewProject(
      'KET/Bugs/Elliptical arrows can be saved to the png.ket',
      page,
    );
    await selectSaveTool(page);
    await chooseFileFormat(page, MoleculesFileFormatType.PNGImage);
    await takeEditorScreenshot(page);
  });

  test('Case 28: Image not missing stereochemistry information when using abbreviations', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6764
     * Bug: https://github.com/epam/Indigo/issues/2741
     * Description: SVG Image not missing stereochemistry information when using abbreviations.
     * Scenario:
     * 1. Go to Micro
     * 2. Load from CDXML
     * 3. Save to SVG
     */
    await turnOnMicromoleculesEditor(page);
    await openFileAndAddToCanvasAsNewProject(
      'CDXML/Bugs/stereochemistry.cdxml',
      page,
    );
    await selectSaveTool(page);
    await chooseFileFormat(page, MoleculesFileFormatType.SVGDocument);
    await takeEditorScreenshot(page);
  });

  test('Case 29: Correct R1 attachment atom for natural Ribose (R) in the library', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6764
     * Bug: https://github.com/epam/ketcher/issues/6750
     * Description: Correct R1 attachment atom for natural Ribose (R) in the library.
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Type AA (RNA typing type)
     * 3. Go to small molecules and expand the ribose monomers
     * 4. Take a screenshot.
     */
    await selectSequenceLayoutModeTool(page);
    await keyboardTypeOnCanvas(page, 'AA');
    await turnOnMicromoleculesEditor(page);
    await selectAllStructuresOnCanvas(page);
    await expandMonomer(page, 'P');
    await clickOnCanvas(page, 500, 500);
    await setZoomInputValue(page, '60');
    await resetCurrentTool(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 30: Able to load ambiguous RNA and ambiguous DNA monomers with same name from HELM', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6764
     * Bug: https://github.com/epam/Indigo/issues/2826
     * Description: Able to load ambiguous RNA and ambiguous DNA monomers with same name from HELM.
     * Scenario:
     * 1. Go to Macro - Flex mode (clean canvas)
     * 2. Load from HELM
     * 3. Take a screenshot.
     */
    await turnOnMacromoleculesEditor(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[dR](A,C,G,T)P.[dR](A,G,T)P.[dR](A,T)P}|RNA2{R(A,C,G,U)P.R(A,C,U)P.R(A,U)[Ssp]}|RNA3{[RSpabC](A,U)P}$RNA1,RNA2,2:pair-8:pair|RNA1,RNA2,5:pair-5:pair|RNA2,RNA1,2:pair-8:pair$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });
});
