/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { Peptides } from '@constants/monomers/Peptides';
import { Page, test } from '@playwright/test';
import {
  selectClearCanvasTool,
  selectSnakeLayoutModeTool,
  takeEditorScreenshot,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  MacroFileType,
  selectAllStructuresOnCanvas,
  openFileAndAddToCanvasAsNewProject,
  selectFlexLayoutModeTool,
  selectSequenceLayoutModeTool,
  switchSyncMode,
  SequenceType,
  MonomerType,
  moveMouseAway,
  selectSaveTool,
} from '@utils';
import { waitForPageInit } from '@utils/common';
import {
  chooseFileFormat,
  turnOnMacromoleculesEditor,
  turnOnMicromoleculesEditor,
} from '@utils/macromolecules';
import {
  createDNAAntisenseChain,
  createRNAAntisenseChain,
  getMonomerLocator,
  getSymbolLocator,
} from '@utils/macromolecules/monomer';
import { pressUndoButton } from '@utils/macromolecules/topToolBar';
import { processResetToDefaultState } from '@utils/testAnnotations/resetToDefaultState';

let page: Page;

async function openSaveToHELMDialog(page: Page) {
  await selectSaveTool(page);
  await chooseFileFormat(page, 'HELM');
}

test.describe('Ketcher bugs in 3.1.0', () => {
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page, false, false);
  });

  test.afterEach(async ({ context: _ }, testInfo) => {
    await selectClearCanvasTool(page);
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
      [MacroFileType.Sequence, SequenceType.RNA],
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
    await page.keyboard.press('Delete');
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
    await switchSyncMode(page);
    await getSymbolLocator(page, { symbolAlias: 'U' }).nth(2).dblclick();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Delete');
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
    await switchSyncMode(page);
    await getSymbolLocator(page, { symbolAlias: 'U' }).nth(1).dblclick();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.type('UU');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await page.keyboard.press('Escape');
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
    const phosphateP = getMonomerLocator(page, {
      monomerAlias: 'P',
      monomerType: MonomerType.Phosphate,
    }).first();
    const sugarR = getMonomerLocator(page, {
      monomerAlias: 'R',
      monomerType: MonomerType.Sugar,
    }).nth(1);
    const phosphatebP = getMonomerLocator(page, {
      monomerAlias: 'bP',
      monomerType: MonomerType.Phosphate,
    }).first();
    const baseA = getMonomerLocator(page, {
      monomerAlias: 'A',
      monomerType: MonomerType.Base,
    }).nth(1);

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
    await openSaveToHELMDialog(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });
});
