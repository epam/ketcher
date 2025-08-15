/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { Bases } from '@constants/monomers/Bases';
import { Peptides } from '@constants/monomers/Peptides';
import { Phosphates } from '@constants/monomers/Phosphates';
import { Sugars } from '@constants/monomers/Sugars';
import { Page, test } from '@fixtures';
import {
  takeEditorScreenshot,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  MacroFileType,
  openFileAndAddToCanvasAsNewProject,
  moveMouseAway,
  openFileAndAddToCanvasAsNewProjectMacro,
  FILE_TEST_DATA,
  resetZoomLevelToDefault,
  clickOnCanvas,
  setMolecule,
  MolFileFormat,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import { waitForPageInit, waitForSpinnerFinishedWork } from '@utils/common';
import {
  FileType,
  verifyFileExport,
  verifyHELMExport,
} from '@utils/files/receiveFileComparisonData';
import {
  createDNAAntisenseChain,
  createRNAAntisenseChain,
  deleteHydrogenBond,
  getMonomerLocator,
  getSymbolLocator,
} from '@utils/macromolecules/monomer';
import { processResetToDefaultState } from '@utils/testAnnotations/resetToDefaultState';
import {
  keyboardPressOnCanvas,
  keyboardTypeOnCanvas,
} from '@utils/keyboard/index';
import { SequenceMonomerType } from '@tests/pages/constants/monomers/Constants';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { MonomerOnMicroOption } from '@tests/pages/constants/contextMenu/Constants';
import { KETCHER_CANVAS } from '@tests/pages/constants/canvas/Constants';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';

let page: Page;

test.describe('Ketcher bugs in 3.2.0', () => {
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

  test(
    'Case 1: All snapping related elements (and bonds) not become invisible after switching to Molecules mode and back',
    { tag: ['@chromium-popup'] },
    async () => {
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
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Flex,
      );
      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        'PEPTIDE1{C}|PEPTIDE2{A}$PEPTIDE1,PEPTIDE2,1:pair-1:pair$$$V2.0',
      );
      await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      await getMonomerLocator(page, Peptides.A).click();
      await page.mouse.down();
      await page.mouse.move(600, 400);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test(
    'Case 2: Library ambiguius RNA bases loaded from HELM as bases with labels from the Library',
    { tag: ['@chromium-popup'] },
    async () => {
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
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Flex,
      );
      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        'RNA1{R(A,C,G,U)P.R(C,G,U)P.R(A,G,U)P.R(A,C,U)P.R(G,U)P.R(A,U)P.R(C,U)P}$$$$V2.0',
      );
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test(
    'Case 3: Able to paste HELM from clipboard to the canvas. System not throws an error: Convert error! option manager: Property "sequence-type" not defined',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/6764
       * Bug: https://github.com/epam/ketcher/issues/6709
       * Description: Able to paste HELM from clipboard to the canvas. System not throws an error: Convert error! option manager: Property "sequence-type" not defined.
       * Scenario:
       * 1. Go to Macro - Sequence mode (clean canvas).
       * 2. Load from HELM
       * 3. Take a screenshot.
       */
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Sequence,
      );
      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P.R(U)}$RNA1,RNA2,8:pair-2:pair|RNA1,RNA2,5:pair-5:pair|RNA1,RNA2,2:pair-8:pair$$$V2.0',
      );
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Flex,
      );
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test(
    'Case 4: Create RNA/DNA Strand work for B, K, Y and S ambiguous bases',
    { tag: ['@chromium-popup'] },
    async () => {
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
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Sequence,
      );
      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        [MacroFileType.Sequence, SequenceMonomerType.RNA],
        'ACGTUNBDHKWYMRSV',
      );
      await resetZoomLevelToDefault(page);
      await selectAllStructuresOnCanvas(page);
      await createRNAAntisenseChain(page, anySymbolA);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test(
    'Case 5: Snapping (and invisible monomer moving) should be disabled on Sequence mode',
    { tag: ['@chromium-popup'] },
    async () => {
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
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Sequence,
      );
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
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Flex,
      );
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test(
    'Case 6: System allow to select single antisense symbol that not causes an error if it got deleted',
    { tag: ['@chromium-popup'] },
    async () => {
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
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Sequence,
      );
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
    },
  );

  test(
    'Case 7: Empty element not appears after undoing line deletion in Sequence mode and switching to Flex/Snake mode',
    { tag: ['@chromium-popup'] },
    async () => {
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
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Sequence,
      );
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
      await CommonTopLeftToolbar(page).undo();
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Flex,
      );
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test(
    'Case 8: Sense and antisense chains not switch places during editing based on monomer count',
    { tag: ['@chromium-popup'] },
    async () => {
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
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Sequence,
      );
      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        'RNA1{R(A)P.R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P.R(U)P.R(U)}$RNA1,RNA2,11:pair-2:pair|RNA1,RNA2,8:pair-5:pair|RNA1,RNA2,5:pair-8:pair|RNA1,RNA2,2:pair-11:pair$$$V2.0',
      );
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await MacromoleculesTopToolbar(page).turnSyncEditModeOff();
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
    },
  );

  test(
    'Case 9: System create antisense phosphate if it sistuated to the left from nucleotide',
    { tag: ['@chromium-popup'] },
    async () => {
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
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Snake,
      );
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
    },
  );

  test(
    'Case 10: System creates ambiguous DNA nucleotides (with Uracil) instead of DNA ones (with Thymine)',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/6764
       * Bug: https://github.com/epam/ketcher/issues/6609
       * Description: System creates ambiguous DNA nucleotides (with Uracil) instead of DNA ones (with Thymine).
       * Scenario:
       * 1. Go to Macro - Sequence mode (clean canvas)
       * 2. Load from KET
       * 3. Select all nucleotides and call context menu
       * 4. Click Create DNA antisense stand option
       * 5. Validate HELM export.
       */
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Sequence,
      );
      await openFileAndAddToCanvasAsNewProject(
        page,
        'KET/Chromium-popup/Bugs/System creates ambiguous RNA nucleotides instead of DNA ones in case of DNA antisense stand creation.ket',
      );
      await selectAllStructuresOnCanvas(page);
      const anySymbolR = getSymbolLocator(page, { symbolAlias: 'R' }).first();
      await createDNAAntisenseChain(page, anySymbolR);
      await verifyHELMExport(
        page,
        'RNA1{r(A,C,G,T)p.r(A,G,T)p.r(A,C,T)p.r(A,T)}|RNA2{r(A,C,G,U)p.r(A,G,U)p.r(A,C,U)p.r(A,U)}|RNA3{r(A,C)p.r(A,G)p.r(A,C,G)}|RNA4{d(A,T)p.d(A,G,T)p.d(A,C,T)p.d(A,C,G,T)}|RNA5{d(A,T)p.d(A,G,T)p.d(A,C,T)p.d(A,C,G,T)}|RNA6{d(C,G,T)p.d(C,T)p.d(G,T)}$RNA1,RNA4,11:pair-2:pair|RNA1,RNA4,8:pair-5:pair|RNA1,RNA4,5:pair-8:pair|RNA1,RNA4,2:pair-11:pair|RNA2,RNA5,11:pair-2:pair|RNA2,RNA5,8:pair-5:pair|RNA2,RNA5,5:pair-8:pair|RNA2,RNA5,2:pair-11:pair|RNA3,RNA6,8:pair-2:pair|RNA3,RNA6,5:pair-5:pair|RNA3,RNA6,2:pair-8:pair$$$V2.0',
      );
    },
  );

  test(
    'Case 11: Warning message when deleting all hydrogen bonds between two chains',
    { tag: ['@chromium-popup'] },
    async () => {
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
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Sequence,
      );
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
    },
  );

  test(
    'Case 12: System adds both sense and antisense chain nucleosids in SYNC mode',
    { tag: ['@chromium-popup'] },
    async () => {
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
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Sequence,
      );
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
    },
  );

  test(
    'Case 13: System can add nucleotide between phosphate and nucleotide in antisence chain',
    { tag: ['@chromium-popup'] },
    async () => {
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
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Sequence,
      );
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
    },
  );

  test(
    'Case 14: Snapping not wipes monomer labels in some cases',
    { tag: ['@chromium-popup'] },
    async () => {
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
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Flex,
      );
      await openFileAndAddToCanvasAsNewProjectMacro(
        page,
        'KET/Chromium-popup/Bugs/Snapping wipes monomer labels in some cases.ket',
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
    },
  );

  test(
    'Case 15: Adding nucleotide to first position at sense/antisense chain',
    { tag: ['@chromium-popup'] },
    async () => {
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
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Sequence,
      );
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
    },
  );

  test(
    'Case 16: New sequence not appears gray after clearing the canvas in non-sync mode',
    { tag: ['@chromium-popup'] },
    async () => {
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
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Sequence,
      );
      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P.R(U)}$RNA1,RNA2,8:pair-2:pair|RNA1,RNA2,2:pair-8:pair|RNA1,RNA2,5:pair-5:pair$$$V2.0',
      );
      await MacromoleculesTopToolbar(page).turnSyncEditModeOff();
      await getSymbolLocator(page, {
        symbolAlias: 'A',
        nodeIndexOverall: 0,
      }).dblclick();
      await keyboardPressOnCanvas(page, 'ArrowDown');
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await CommonTopLeftToolbar(page).clearCanvas();
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await keyboardTypeOnCanvas(page, 'AAAAA');
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test(
    'Case 17: Sync mode not causes incorrect letter input after adding a monomer in non-sync mode',
    { tag: ['@chromium-popup'] },
    async () => {
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
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Sequence,
      );
      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        'RNA1{R(A)P.R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P.R(U)P.R(U)}$RNA1,RNA2,11:pair-2:pair|RNA1,RNA2,8:pair-5:pair|RNA1,RNA2,5:pair-8:pair|RNA1,RNA2,2:pair-11:pair$$$V2.0',
      );
      await MacromoleculesTopToolbar(page).turnSyncEditModeOff();
      await getSymbolLocator(page, {
        symbolAlias: 'U',
        nodeIndexOverall: 2,
      }).dblclick();
      await keyboardPressOnCanvas(page, 'ArrowDown');
      await keyboardPressOnCanvas(page, 'ArrowLeft');
      await keyboardPressOnCanvas(page, 'U');
      await MacromoleculesTopToolbar(page).turnSyncEditModeOn();
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await CommonTopLeftToolbar(page).clearCanvas();
      await keyboardTypeOnCanvas(page, 'AAAAA');
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test(
    'Case 18: System add same thing in antisense chain but not connect it with H-bond if it is not nucleotide/nucleoside',
    { tag: ['@chromium-popup'] },
    async () => {
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
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Sequence,
      );
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
      await MacromoleculesTopToolbar(page).peptides();
      await keyboardPressOnCanvas(page, 'E');
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test(
    'Case 19: Adding nucleotide between nucleotide and - symbol not causes appearence of separated phosphate on the canvas',
    { tag: ['@chromium-popup'] },
    async () => {
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
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Sequence,
      );
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
    },
  );

  test(
    'Case 20: API setMolecule not moves molecule off-canvas on second call',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/6764
       * Bug: https://github.com/epam/ketcher/issues/6608
       * Description: API setMolecule not moves molecule off-canvas on second call.
       * Scenario:
       * 1. Go to Micro
       * 2. Make setMolecule call with coordinates (10, 10) twice
       * 3. Take a screenshot.
       */
      await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
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
    },
  );

  test(
    'Case 21: R Group logic condition is not wrong if loaded from MOL',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/6764
       * Bug: https://github.com/epam/Indigo/issues/2699
       * Description: R Group logic condition is not wrong if loaded from MOL.
       * Scenario:
       * 1. Go to Micro
       * 2. Load from MOL
       * 3. Take a screenshot.
       */
      await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
      await openFileAndAddToCanvasAsNewProject(
        page,
        'Molfiles-V2000/Chromium-popup/Bugs/markush.mol',
      );
      await takeEditorScreenshot(page);
    },
  );

  test(
    'Case 22: R Group logic condition is not wrong if loaded from complex structure MOL',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/6764
       * Bug: https://github.com/epam/Indigo/issues/2699
       * Description: R Group logic condition is not wrong if loaded from MOL.
       * Scenario:
       * 1. Go to Micro
       * 2. Load from MOL
       * 3. Take a screenshot.
       */
      await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
      await openFileAndAddToCanvasAsNewProject(
        page,
        'Molfiles-V2000/Chromium-popup/Bugs/complex-r-group-structure.mol',
      );
      await takeEditorScreenshot(page);
    },
  );

  test(
    'Case 23: System not losts one stereo label if load from MOL',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/6764
       * Bug: https://github.com/epam/Indigo/issues/2704
       * Description: System not losts one stereo label if load from MOL.
       * Scenario:
       * 1. Go to Micro
       * 2. Load from MOL
       * 3. Take a screenshot.
       */
      await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
      await openFileAndAddToCanvasAsNewProject(
        page,
        'Molfiles-V2000/Chromium-popup/Bugs/two-stereostructures.mol',
      );
      await takeEditorScreenshot(page);
    },
  );

  test(
    'Case 24: Export molecule which contains atom with five neighbors and stereo-bond not cause error',
    { tag: ['@chromium-popup'] },
    async () => {
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
      await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
      await openFileAndAddToCanvasAsNewProject(
        page,
        'KET/Chromium-popup/Bugs/Unable to save canvas to MOL - system throws an error.ket',
      );
      await takeEditorScreenshot(page);
      await verifyFileExport(
        page,
        'Molfiles-V2000/Chromium-popup/Bugs/Unable to save canvas to MOL - system throws an error-expected.mol',
        FileType.MOL,
        MolFileFormat.v2000,
      );
      await openFileAndAddToCanvasAsNewProject(
        page,
        'Molfiles-V2000/Chromium-popup/Bugs/Unable to save canvas to MOL - system throws an error-expected.mol',
      );
      await takeEditorScreenshot(page);
    },
  );

  test(
    'Case 25: Atom Query feature export: System not lost MOST "Substitution count" values',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/6764
       * Bug: https://github.com/epam/Indigo/issues/2707
       * Description: Atom Query feature export: System not lost MOST "Substitution count" values.
       * Scenario:
       * 1. Go to Micro
       * 2. Load from KET
       * 3. Take a screenshot.
       */
      await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
      await openFileAndAddToCanvasAsNewProject(
        page,
        'KET/Chromium-popup/Bugs/Substitution count.ket',
      );
      await takeEditorScreenshot(page);
    },
  );

  test(
    'Case 26: Export to SMILES works if loaded from MOL',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/6764
       * Bug: https://github.com/epam/Indigo/issues/2708
       * Description: Export to SMILES works if loaded from MOL.
       * Scenario:
       * 1. Go to Micro
       * 2. Load from MOL
       * 3. Save to SMILES
       */
      await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
      await openFileAndAddToCanvasAsNewProject(
        page,
        'Molfiles-V2000/Chromium-popup/Bugs/different-features.mol',
      );
      await takeEditorScreenshot(page);
      await verifyFileExport(
        page,
        'SMILES/Chromium-popup/Bugs/different-features-expected.smi',
        FileType.SMILES,
      );
    },
  );

  test(
    'Case 27: Elliptical arrows can be saved to the png',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/6764
       * Bug: https://github.com/epam/Indigo/issues/2513
       * Description: Elliptical arrows can be saved to the png.
       * Scenario:
       * 1. Go to Micro
       * 2. Load from KET
       * 3. Save to PNG
       */
      await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
      await openFileAndAddToCanvasAsNewProject(
        page,
        'KET/Chromium-popup/Bugs/Elliptical arrows can be saved to the png.ket',
      );
      await CommonTopLeftToolbar(page).saveFile();
      await SaveStructureDialog(page).chooseFileFormat(
        MoleculesFileFormatType.PNGImage,
      );
      await takeEditorScreenshot(page);
    },
  );

  test(
    'Case 28: Image not missing stereochemistry information when using abbreviations',
    { tag: ['@chromium-popup'] },
    async () => {
      // failing due to the bug: https://github.com/epam/Indigo/issues/3049
      /*
       * Test case: https://github.com/epam/ketcher/issues/6764
       * Bug: https://github.com/epam/Indigo/issues/2741
       * Description: SVG Image not missing stereochemistry information when using abbreviations.
       * Scenario:
       * 1. Go to Micro
       * 2. Load from CDXML
       * 3. Save to SVG
       */
      await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
      await openFileAndAddToCanvasAsNewProject(
        page,
        'CDXML/Chromium-popup/Bugs/stereochemistry.cdxml',
      );
      await CommonTopLeftToolbar(page).saveFile();
      await SaveStructureDialog(page).chooseFileFormat(
        MoleculesFileFormatType.SVGDocument,
      );
      await takeEditorScreenshot(page);
    },
  );

  test(
    'Case 29: Correct R1 attachment atom for natural Ribose (R) in the library',
    { tag: ['@chromium-popup'] },
    async () => {
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
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Sequence,
      );
      await keyboardTypeOnCanvas(page, 'AA');
      await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
      await selectAllStructuresOnCanvas(page);
      const symbolP = page
        .getByTestId(KETCHER_CANVAS)
        .getByText('P', { exact: true });
      await ContextMenu(page, symbolP).click(
        MonomerOnMicroOption.ExpandMonomers,
      );
      await clickOnCanvas(page, 500, 500, { from: 'pageTopLeft' });
      await CommonTopRightToolbar(page).setZoomInputValue('60');
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test(
    'Case 30: Able to load ambiguous RNA and ambiguous DNA monomers with same name from HELM',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/6764
       * Bug: https://github.com/epam/Indigo/issues/2826
       * Description: Able to load ambiguous RNA and ambiguous DNA monomers with same name from HELM.
       * Scenario:
       * 1. Go to Macro - Flex mode (clean canvas)
       * 2. Load from HELM
       * 3. Take a screenshot.
       */
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Snake,
      );
      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        'RNA1{[dR](A,C,G,T)P.[dR](A,G,T)P.[dR](A,T)P}|RNA2{R(A,C,G,U)P.R(A,C,U)P.R(A,U)[Ssp]}|RNA3{[RSpabC](A,U)P}$RNA1,RNA2,2:pair-8:pair|RNA1,RNA2,5:pair-5:pair|RNA2,RNA1,2:pair-8:pair$$$V2.0',
      );
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );
});
