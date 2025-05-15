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
  selectMonomer,
  clickInTheMiddleOfTheScreen,
  takeMonomerLibraryScreenshot,
  takePageScreenshot,
  selectSequenceLayoutModeTool,
  openFileAndAddToCanvasAsNewProjectMacro,
  selectRingButton,
  RingButton,
  clickOnCanvas,
  selectSaltsAndSolvents,
  SaltsAndSolvents,
  openFileAndAddToCanvasAsNewProject,
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
import { keyboardPressOnCanvas } from '@utils/keyboard/index';
import { Phosphates } from '@constants/monomers/Phosphates';
import {
  pressSaveButton,
  selectBaseSlot,
  selectPhosphateSlot,
  selectSugarSlot,
  toggleRnaBuilder,
} from '@utils/macromolecules/rnaBuilder';
import { MacromoleculesFileFormatType } from '@tests/pages/constants/fileFormats/macroFileFormats';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { TopLeftToolbar } from '@tests/pages/common/TopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/TopRightToolbar';

let page: Page;

async function callContextMenuForAnySymbol(page: Page) {
  const anySymbol = getSymbolLocator(page, {}).first();
  await anySymbol.click({ button: 'right', force: true });
}

test.describe('Ketcher bugs in 3.3.0', () => {
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
    await resetZoomLevelToDefault(page);
    await processResetToDefaultState(testInfo, page);
  });

  test.afterAll(async ({ browser }) => {
    await Promise.all(browser.contexts().map((context) => context.close()));
  });

  test('Case 1: Able to create antisense RNA/DNA chain in case of multipal chain selection (if not eligable for antisense chain selected)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6937
     * Bug: https://github.com/epam/ketcher/issues/6695
     * Description: Able to create antisense RNA/DNA chain in case of multipal chain selection (if not eligable for antisense chain selected).
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from HELM
     * 3. Select all canvas and call context menu
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A}|RNA1{R(A)}$$$$V2.0',
    );
    await selectAllStructuresOnCanvas(page);
    await callContextMenuForAnySymbol(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 2: Check correct name for sugar in the library for fR', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6937
     * Bug: https://github.com/epam/ketcher/issues/6695
     * Description: There correct name for sugar in the library for fR.
     * Scenario:
     * 1. Go to Macro - Flex mode (clean canvas)
     * 2. Add sugar from library
     * 3. Check name for sugar in the library for fR
     */
    await selectFlexLayoutModeTool(page);
    await selectMonomer(page, Sugars.fR);
    await clickInTheMiddleOfTheScreen(page);
    await keyboardPressOnCanvas(page, 'Escape');
    await getMonomerLocator(page, Sugars.fR).first().hover();
    await waitForMonomerPreview(page);
    // Screenshot suppression is not used on purpose, as it’s required for the test
    await takeEditorScreenshot(page);
  });

  test('Case 3: Tooltip not appears behind monomer icons in the library', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6937
     * Bug: https://github.com/epam/ketcher/issues/6585
     * Description: Tooltip not appears behind monomer icons in the library.
     * Scenario:
     * 1. Go to Macro
     * 2. Navigate to the monomer library
     * 3. Click on any monomer
     * 4. Without clicking again, hover over another monomer in the library
     */
    await page.getByTestId('summary-Sugars').click();
    await page.getByTestId('5R6Sm5___5-(R)-Methyl-(S)-cEt BNA').click();
    await page.getByTestId('ALmecl___alpha-L-Methylene cLNA').hover();
    await waitForMonomerPreview(page);
    // Screenshot suppression is not used on purpose, as it’s required for the test
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 4: Tooltip not appears when dragging a monomer and pausing without releasing mouse button in Macro mode', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6937
     * Bug: https://github.com/epam/ketcher/issues/6332
     * Description: Tooltip not appears when dragging a monomer and pausing without releasing mouse button in Macro mode.
     * Scenario:
     * 1. Go to Macro
     * 2. Select any monomer from the library and put on canvas
     * 3. Click and hold mouse button to pick up monomer
     * 4. Drag monomer across canvas and stop moving it while still holding mouse button
     * 5. Observe that a tooltip appears after monomer stops moving, even though mouse button remains pressed
     */
    await selectFlexLayoutModeTool(page);
    await selectMonomer(page, Peptides._2Nal);
    await clickInTheMiddleOfTheScreen(page);
    await keyboardPressOnCanvas(page, 'Escape');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await getMonomerLocator(page, Peptides._2Nal).click();
    await page.mouse.down();
    await page.mouse.move(300, 400);
    // Screenshot suppression is not used on purpose, as it’s required for the test
    await takeEditorScreenshot(page);
  });

  test('Case 5: Monomer framing should disappear if monomer selected but not hovered', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6937
     * Bug: https://github.com/epam/ketcher/issues/6293
     * Description: Monomer framing should disappear if monomer selected but not hovered.
     * Scenario:
     * 1. Go to Macro - Flex mode
     * 2. Put any monomer on the canvas click on it and move mouse away
     */
    await selectFlexLayoutModeTool(page);
    await selectMonomer(page, Peptides.meC);
    await clickInTheMiddleOfTheScreen(page);
    await keyboardPressOnCanvas(page, 'Escape');
    await getMonomerLocator(page, Peptides.meC).click();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await page.mouse.move(300, 400);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 6: Am- peptide should have symbol -Am', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6937
     * Bug: https://github.com/epam/ketcher/issues/6126
     * Description: Am- peptide should have symbol -Am.
     * Scenario:
     * 1. Go to Macro - Snake mode
     * 2. Load from HELM
     */
    await selectSnakeLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{[-Am]}$$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 7: Name for h456UR and e6A monomers are correct', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6937
     * Bug: https://github.com/epam/ketcher/issues/5648
     * Description: Name for h456UR and e6A monomers are correct.
     * Scenario:
     * 1. Go to Macro mode
     * 2. Go to Library - RNA tab
     * 3. Select h456UR and e6A monomers
     */
    await selectMonomer(page, Bases.h456UR);
    await waitForMonomerPreview(page);
    // Screenshot suppression is not used on purpose, as it’s required for the test
    await takePageScreenshot(page);
    await keyboardPressOnCanvas(page, 'Escape');
    await selectMonomer(page, Bases.e6A);
    await waitForMonomerPreview(page);
    // Screenshot suppression is not used on purpose, as it’s required for the test
    await takePageScreenshot(page);
  });

  test('Case 8: Horizontal/vertical snap-to-distance work for hydrogen bonds', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6937
     * Bug: https://github.com/epam/ketcher/issues/6863
     * Description: Horizontal/vertical snap-to-distance work for hydrogen bonds.
     * Scenario:
     * 1. Go to Macro mode
     * 2. Load from HELM
     * 3. Try to find horizontal snap-to-distance area
     */
    await selectFlexLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.C}|PEPTIDE2{D}$PEPTIDE1,PEPTIDE2,2:pair-1:pair$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await getMonomerLocator(page, Peptides.D).click();
    await page.mouse.down();
    await page.mouse.move(630, 340);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test(
    'Case 9: Tooltips on monomer cards in all sections instantly not disappear on hover in popup Ketcher',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/6937
       * Bug: https://github.com/epam/ketcher/issues/6833
       * Description: Tooltips on monomer cards in all sections instantly not disappear on hover in popup Ketcher.
       * Scenario:
       * 1. Open the popup version of Ketcher
       * 2. Navigate to any section: Peptides, RNA (Sugars, Bases, or Phosphates), CHEM
       * 3. Hover over any monomer card.
       */
      await selectMonomer(page, Sugars._25d3r);
      await waitForMonomerPreview(page);
      // Screenshot suppression is not used on purpose, as it’s required for the test
      await takePageScreenshot(page, {
        hideMacromoleculeEditorScrollBars: true,
      });
      await keyboardPressOnCanvas(page, 'Escape');
      await selectMonomer(page, Bases._5meC);
      await waitForMonomerPreview(page);
      // Screenshot suppression is not used on purpose, as it’s required for the test
      await takePageScreenshot(page, {
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test(
    'Case 10: Last row of monomers in Sugars, Bases, and Phosphates sections is visible in popup Ketcher',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/6937
       * Bug: https://github.com/epam/ketcher/issues/6831
       * Description: Last row of monomers in Sugars, Bases, and Phosphates sections is visible in popup Ketcher.
       * Scenario:
       * 1. Open the popup version of Ketcher
       * 2. Switch to RNA Tab
       * 3. Open the Sugars, Bases, or Phosphates section.
       * 4. Scroll to the bottom of the list
       */
      await selectFlexLayoutModeTool(page);
      await selectMonomer(page, Sugars.UNA);
      await takePageScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await keyboardPressOnCanvas(page, 'Escape');
      await selectMonomer(page, Bases.V);
      await takePageScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await keyboardPressOnCanvas(page, 'Escape');
      await selectMonomer(page, Phosphates.Test_6_Ph);
      await takePageScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test('Case 11: RNA Builder section (Base, Sugar, Phosphate) highlight corresponding monomer in library on first click', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6937
     * Bug: https://github.com/epam/ketcher/issues/6830
     * Description: RNA Builder section (Base, Sugar, Phosphate) highlight corresponding monomer in library on first click.
     * Scenario:
     * 1. Go to Macro
     * 2. Expand RNA Builder
     * 3. Add to RNA Builder monomers
     * 3. Click on any monomer in the RNA Builder section
     * 4. Observe that the corresponding monomer in the library is highlighted
     */
    await selectFlexLayoutModeTool(page);
    await toggleRnaBuilder(page, 'expand');
    await selectMonomer(page, Sugars.UNA);
    await selectMonomer(page, Bases.V);
    await selectMonomer(page, Phosphates.Test_6_Ph);
    await takeMonomerLibraryScreenshot(page);
    await selectSugarSlot(page);
    await takeMonomerLibraryScreenshot(page);
    await selectBaseSlot(page);
    await takeMonomerLibraryScreenshot(page);
    await selectPhosphateSlot(page);
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 12: Able to delete multiple sequences at once via right-click menu in Sequence mode', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6937
     * Bug: https://github.com/epam/ketcher/issues/6824
     * Description: Able to delete multiple sequences at once via right-click menu in Sequence mode.
     * Scenario:
     * 1. Switch to Sequence mode.
     * 2. Load from HELM
     * 3. Select multiple sequences on the canvas.
     * 4. Right-click on the selected sequences and choose "Delete" from the context menu.
     * 5. Observe that all selected sequences are deleted.
     */
    await selectSequenceLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)}|RNA2{[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)}|PEPTIDE1{P.P.P.P.P.P.P.P}|RNA3{R(U)P.R(U)P.R(U)P.R(U)P.R(U)P.R(U)P.R(U)P.R(U)}$$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await selectAllStructuresOnCanvas(page);
    await callContextMenuForAnySymbol(page);
    await page.getByTestId('delete').click();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 13: System should turn nucleotide to nucleoside on sequence break by Enter', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6937
     * Bug: https://github.com/epam/ketcher/issues/6814
     * Description: System should turn nucleotide to nucleoside on sequence break by Enter.
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from HELM
     * 3. Turn it to edit mode, move cursor to the center
     * 4. Press Enter
     * 5. Observe that nucleotide is turned to nucleoside
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)}$$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await getSymbolLocator(page, {
      symbolAlias: 'A',
      nodeIndexOverall: 2,
    }).dblclick();
    await keyboardPressOnCanvas(page, 'Enter');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 14: Cursor not jumps after phosphate insertion in middle or at end of sequence', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6937
     * Bug: https://github.com/epam/ketcher/issues/6783
     * Description: Cursor not jumps after phosphate insertion in middle or at end of sequence.
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from HELM
     * 3. Turn it to edit mode, move cursor to the center
     * 4. Press the P key twice.
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.R(A)P.R(A)P.R(A)P.R(A)}$$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await getSymbolLocator(page, {
      symbolAlias: 'A',
      nodeIndexOverall: 1,
    }).dblclick();
    await keyboardPressOnCanvas(page, 'ArrowRight');
    for (let i = 0; i < 2; i++) {
      await keyboardPressOnCanvas(page, 'p');
    }
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 15: Phosphates added via keyboard in SYNC mode are can be reverted by Undo', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6937
     * Bug: https://github.com/epam/ketcher/issues/6781
     * Description: Phosphates added via keyboard in SYNC mode are can be reverted by Undo.
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from HELM
     * 3. Use the keyboard to type "P" to add a phosphate to antisense and sense strand:
     *    At the beginning of the sequence
     *    In the middle
     *    At the end
     * 4. Undo all added phosphates
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.R(A)P.R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P.R(U)P.R(U)P.R(U)}$RNA1,RNA2,14:pair-2:pair|RNA1,RNA2,11:pair-5:pair|RNA1,RNA2,8:pair-8:pair|RNA1,RNA2,5:pair-11:pair|RNA1,RNA2,2:pair-14:pair$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await getSymbolLocator(page, {
      symbolAlias: 'A',
      nodeIndexOverall: 1,
    }).dblclick();
    for (let i = 0; i < 3; i++) {
      await keyboardPressOnCanvas(page, 'ArrowRight');
      await keyboardPressOnCanvas(page, 'p');
    }
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    for (let i = 0; i < 3; i++) {
      await TopLeftToolbar(page).undo();
    }
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 16: Phosphate added to antisense strand in non-SYNC mode when targeting antisense strand', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6937
     * Bug: https://github.com/epam/ketcher/issues/6780
     * Description: Phosphate added to antisense strand in non-SYNC mode when targeting antisense strand.
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from HELM (turn off SYNC mode)
     * 3. Use the keyboard to type "P" to add a phosphate to antisense strand:
     *    At the beginning of the sequence
     *    In the middle
     *    At the end
     * 4. Observe the canvas
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.R(A)P.R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P.R(U)P.R(U)P.R(U)}$RNA1,RNA2,14:pair-2:pair|RNA1,RNA2,11:pair-5:pair|RNA1,RNA2,8:pair-8:pair|RNA1,RNA2,5:pair-11:pair|RNA1,RNA2,2:pair-14:pair$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await turnSyncEditModeOff(page);
    await getSymbolLocator(page, {
      symbolAlias: 'U',
      nodeIndexOverall: 1,
    }).dblclick();
    await keyboardPressOnCanvas(page, 'ArrowDown');
    for (let i = 0; i < 3; i++) {
      await keyboardPressOnCanvas(page, 'ArrowRight');
      await keyboardPressOnCanvas(page, 'p');
    }
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 17: Able to add phosphate to antisense strand in SYNC mode via keyboard', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6937
     * Bug: https://github.com/epam/ketcher/issues/6779
     * Description: Able to add phosphate to antisense strand in SYNC mode via keyboard.
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from HELM (do not turn off SYNC mode)
     * 3. Use the keyboard to type "P" to add a phosphate to antisense strand:
     *    At the beginning of the sequence
     *    In the middle
     *    At the end
     * 4. Observe the canvas
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.R(A)P.R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P.R(U)P.R(U)P.R(U)}$RNA1,RNA2,14:pair-2:pair|RNA1,RNA2,11:pair-5:pair|RNA1,RNA2,8:pair-8:pair|RNA1,RNA2,5:pair-11:pair|RNA1,RNA2,2:pair-14:pair$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await getSymbolLocator(page, {
      symbolAlias: 'U',
      nodeIndexOverall: 1,
    }).dblclick();
    await keyboardPressOnCanvas(page, 'ArrowDown');
    for (let i = 0; i < 3; i++) {
      await keyboardPressOnCanvas(page, 'ArrowRight');
      await keyboardPressOnCanvas(page, 'p');
    }
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 18: Adding monomer to first from the left position of antisense chain works correct', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6937
     * Bug: https://github.com/epam/ketcher/issues/6775
     * Description: Adding monomer to first from the left position of antisense chain works correct.
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from HELM (turn off SYNC mode)
     * 3. Use the keyboard to type "c" to the beginning of antisense strand
     * 4. Observe the canvas
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P.R(U)}$RNA1,RNA2,8:pair-2:pair|RNA1,RNA2,5:pair-5:pair|RNA1,RNA2,2:pair-8:pair$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await turnSyncEditModeOff(page);
    await getSymbolLocator(page, {
      symbolAlias: 'U',
      nodeIndexOverall: 0,
    }).dblclick();
    await keyboardPressOnCanvas(page, 'ArrowDown');
    await keyboardPressOnCanvas(page, 'ArrowLeft');
    await keyboardPressOnCanvas(page, 'c');
    await keyboardPressOnCanvas(page, 'Escape');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 19: Modified bases selected via RNA Builder not revert to natural analogs in all modes', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6937
     * Bug: https://github.com/epam/ketcher/issues/6774
     * Description: Modified bases selected via RNA Builder not revert to natural analogs in all modes.
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from HELM (turn off SYNC mode)
     * 3. Select a base (e.g. "U") and by right-click select Modify in RNA Builder
     * 4. From the base list, choose a any modified base instead of U
     * 5. Observe the preview inside the builder.
     * 6. Click Update to apply changes and exit the builder.
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.R(U)P.R(G)P.R(C)}$$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await getSymbolLocator(page, {
      symbolAlias: 'U',
      nodeIndexOverall: 1,
    }).click();
    const symbolLocator = getSymbolLocator(page, {
      symbolAlias: 'U',
      nodeIndexOverall: 1,
    });
    await modifyInRnaBuilder(page, symbolLocator);
    await selectBaseSlot(page);
    await selectMonomer(page, Bases.V);
    await pressSaveButton(page);
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

  test('Case 20: Adding RNA/DNA before empty space in sence sequense is possible', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6937
     * Bug: https://github.com/epam/ketcher/issues/6712
     * Description: Adding RNA/DNA before empty space in sence sequense is possible.
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from HELM (not turn off SYNC mode)
     * 3. Add nucleotide (RNA or DNA - C in my case) to the very first position
     * 4. Observe the canvas
     */
    await selectSequenceLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.R(A)}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,2:pair-2:pair|RNA2,CHEM1,3:R2-1:R1$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await getSymbolLocator(page, {
      symbolAlias: 'A',
      nodeIndexOverall: 1,
    }).dblclick();
    for (let i = 0; i < 2; i++) {
      await keyboardPressOnCanvas(page, 'ArrowLeft');
    }
    await keyboardPressOnCanvas(page, 'c');
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

  test('Case 21: Antisense complement is skipped when terminal monomer lacks an attachment point (R1/R2), not causing incorrect structure on canvas', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6937
     * Bug: https://github.com/epam/ketcher/issues/6705
     * Description: Antisense complement is skipped when terminal monomer lacks an attachment point (R1/R2), not causing incorrect structure on canvas.
     * Scenario:
     * 1. Go to Macro - Flex mode (clean canvas)
     * 2. Load from HELM
     * 3. Generate the antisense sequence.
     * 4. Observe the canvas
     */
    await selectFlexLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)}|PEPTIDE1{[Ala-ol]}$RNA1,PEPTIDE1,19:R2-1:R1$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await selectAllStructuresOnCanvas(page);
    const sugarR = getMonomerLocator(page, Sugars.R).first();
    await createRNAAntisenseChain(page, sugarR);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 22: Removing dash should turn aligned nucleotide to nucleoside', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6937
     * Bug: https://github.com/epam/ketcher/issues/6671
     * Description: Removing dash should turn aligned nucleotide to nucleoside.
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from HELM (turn off SYNC mode)
     * 3. Remove dash (line)
     * 4. Observe the canvas
     */
    await selectSequenceLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)}$RNA1,RNA2,8:pair-2:pair|RNA1,RNA2,2:pair-5:pair$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await turnSyncEditModeOff(page);
    await getSymbolLocator(page, {
      symbolAlias: 'U',
      nodeIndexOverall: 0,
    }).dblclick();
    await keyboardPressOnCanvas(page, 'ArrowDown');
    await keyboardPressOnCanvas(page, 'ArrowRight');
    await keyboardPressOnCanvas(page, 'Backspace');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 23: Undo of clear canvas operation not causes molecules bonds overlap atom labels', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6937
     * Bug: https://github.com/epam/ketcher/issues/6541
     * Description: Undo of clear canvas operation not causes molecules bonds overlap atom labels.
     * Scenario:
     * 1. Go to Macro - Flex mode (clean canvas)
     * 2. Load from MOL V3000
     * 3. Press Clear canvas button
     * 4. Press Undo button
     */
    await selectFlexLayoutModeTool(page);
    await openFileAndAddToCanvasAsNewProjectMacro(
      'Molfiles-V2000/Bugs/benzene-ring-with-n-atoms.mol',
      page,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await TopLeftToolbar(page).clearCanvas();
    await TopLeftToolbar(page).undo();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 24: System not replaces A base with always RNA N base (alternatives of A,C,G,U) even if user selected DNA N base (alternatives of A,C,G,T)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6937
     * Bug: https://github.com/epam/ketcher/issues/6495
     * Description: System not replaces A base with always RNA N base (alternatives of A,C,G,U) even if user selected DNA N base (alternatives of A,C,G,T).
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from HELM
     * 3. Select any nucleotide and select Modify in RNA Builder
     * 4. Select DNA N base from the library and press Update button
     * 5. Press Save button and select HELM file format
     */
    await selectSequenceLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.R(A)P.R(A)}$$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await getSymbolLocator(page, {
      symbolAlias: 'A',
      nodeIndexOverall: 1,
    }).click();
    const symbolLocator = getSymbolLocator(page, {
      symbolAlias: 'A',
      nodeIndexOverall: 1,
    });
    await modifyInRnaBuilder(page, symbolLocator);
    await selectBaseSlot(page);
    await selectMonomer(page, Bases.DNA_N);
    await pressSaveButton(page);
    await TopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.HELM,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 25: Correct bond length and angle for non-natural monomers in the library', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6937
     * Bug: https://github.com/epam/ketcher/issues/6573
     * Description: Correct bond length and angle for non-natural monomers in the library.
     * Scenario:
     * 1. Go to Macro
     * 2. Add peptide monomer 1Nal to the canvas
     * 3. Go to small molecules mode
     * 4. Expand the monomer
     * 5. Draw cyclohexane and compare the bond length and angle
     */
    await selectFlexLayoutModeTool(page);
    await selectMonomer(page, Peptides._1Nal);
    await clickInTheMiddleOfTheScreen(page);
    await keyboardPressOnCanvas(page, 'Escape');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await selectAllStructuresOnCanvas(page);
    await page
      .getByTestId('ketcher-canvas')
      .filter({ has: page.locator(':visible') })
      .getByText('1Nal')
      .click({ button: 'right' });
    await page.getByText('Expand monomer').click();
    await selectRingButton(RingButton.Cyclohexane, page);
    await clickOnCanvas(page, 505, 400);
    await takeEditorScreenshot(page);
  });

  test('Case 26: Correct structure of DBU (solvent in the structure library)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6937
     * Bug: https://github.com/epam/ketcher/issues/6553
     * Description: Correct structure of DBU (solvent in the structure library).
     * Scenario:
     * 1. Go to Micro
     * 2. Go to the Structure library, Salts and Solvents tab
     * 3. Select DBU
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await selectSaltsAndSolvents(SaltsAndSolvents.DBU, page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Case 27: System not assign stereo label to every atom after load from MOL', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6937
     * Bug: https://github.com/epam/ketcher/issues/6190
     * Description: System not assign stereo label to every atom after load from MOL.
     * Scenario:
     * 1. Go to Micro
     * 2. Load from MOL
     * 3. Take a screenshot
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      'Molfiles-V2000/Bugs/structure-with-stereo-bonds-4.mol',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Case 28: Able to load MOL file if it contain R8 rgroup inside r-group - system not throws an error: Cannot read properties of undefined (reading toLowerCase)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6937
     * Bug: https://github.com/epam/ketcher/issues/6189
     * Description: Able to load MOL file if it contain R8 rgroup inside r-group - system not throws an error: Cannot read properties of undefined (reading toLowerCase).
     * Scenario:
     * 1. Go to Micro
     * 2. Load from MOL
     * 3. Take a screenshot
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      'Molfiles-V2000/Bugs/R-fragment-structure.mol',
      page,
    );
    await takeEditorScreenshot(page);
  });
});
