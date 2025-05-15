/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { Bases } from '@constants/monomers/Bases';
import { Peptides } from '@constants/monomers/Peptides';
import { Presets } from '@constants/monomers/Presets';
import { Page, test } from '@playwright/test';
import {
  selectFlexLayoutModeTool,
  selectSequenceLayoutModeTool,
  selectSnakeLayoutModeTool,
  takeEditorScreenshot,
  takePageScreenshot,
  openFileAndAddToCanvasAsNewProjectMacro,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  MacroFileType,
  selectAllStructuresOnCanvas,
  addMonomerToCenterOfCanvas,
  copyToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  openFileAndAddToCanvasMacro,
  dragMouseTo,
  selectMonomer,
  pressButton,
  moveOnAtom,
  clickOnAtom,
  openFileAndAddToCanvasAsNewProject,
  selectPartOfMolecules,
  clickOnCanvas,
  setMolecule,
  FILE_TEST_DATA,
  moveMouseAway,
} from '@utils';
import { waitForPageInit, waitForSpinnerFinishedWork } from '@utils/common';
import { pageReload } from '@utils/common/helpers';
import {
  FileType,
  verifyFileExport,
  verifyHELMExport,
} from '@utils/files/receiveFileComparisonData';
import { goToRNATab } from '@utils/macromolecules/library';
import {
  modifyInRnaBuilder,
  getSymbolLocator,
  getMonomerLocator,
  MonomerLocatorOptions,
} from '@utils/macromolecules/monomer';
import {
  hoverOnSequenceSymbol,
  switchToDNAMode,
  switchToPeptideMode,
  switchToRNAMode,
} from '@utils/macromolecules/sequence';
import { TopLeftToolbar } from '@tests/pages/common/TopLeftToolbar';
import { processResetToDefaultState } from '@utils/testAnnotations/resetToDefaultState';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import {
  keyboardPressOnCanvas,
  keyboardTypeOnCanvas,
} from '@utils/keyboard/index';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { MacromoleculesFileFormatType } from '@tests/pages/constants/fileFormats/macroFileFormats';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/TopRightToolbar';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/indigo2';
import {
  drawBenzeneRing,
  selectRingButton,
} from '@tests/pages/molecules/BottomToolbar';

let page: Page;

async function connectMonomerToAtom(page: Page) {
  await getMonomerLocator(page, Peptides.A).hover();
  await page
    .getByTestId('monomer')
    .locator('g')
    .filter({ hasText: 'R2' })
    .locator('path')
    .hover();
  await page.mouse.down();
  await page.locator('g').filter({ hasText: /^H2N$/ }).locator('rect').hover();
  await page.mouse.up();
}

async function interactWithMicroMolecule(
  page: Page,
  labelText: string,
  action: 'hover' | 'click',
  index: number = 0,
): Promise<void> {
  const element = page
    .locator('g')
    .filter({ hasText: new RegExp(`^${labelText}$`) })
    .locator('rect')
    .nth(index);

  // Wait for the element to be visible
  await element.waitFor({ state: 'visible' });

  // Perform the requested action
  if (action === 'hover') {
    await element.hover();
  } else if (action === 'click') {
    await element.click();
  }
}

async function callContextMenuForMonomer(
  page: Page,
  monomerLocatorOptions: MonomerLocatorOptions,
) {
  const canvasLocator = getMonomerLocator(page, monomerLocatorOptions).first();
  await canvasLocator.click({ button: 'right', force: true });
}

test.describe('Ketcher bugs in 3.0.0', () => {
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
    await processResetToDefaultState(testInfo, page);
  });

  test.afterAll(async ({ browser }) => {
    await Promise.all(browser.contexts().map((context) => context.close()));
  });

  test('Case 1: In the Text-editing mode, the canvas is moved to make the newly added sequence visible', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/4526
     * Description: In the Text-editing mode, the canvas is moved to make the newly added sequence visible.
     * Scenario:
     * 1. Switch to the Macro mode - the Text-editing mode
     * 2. Add sequences to the canvas until they vertically fill the viewport (without using the scroll bar)
     * 3. Press the “Enter” key, and enter one more sequence by typing it manually
     */
    await switchToRNAMode(page);
    const sequences = [
      'AAAA',
      'CCC',
      'TTT',
      'UUU',
      'GGG',
      'CCC',
      'TTT',
      'UUU',
      'CCC',
    ];
    for (const sequence of sequences) {
      await keyboardTypeOnCanvas(page, sequence);
      await keyboardPressOnCanvas(page, 'Enter');
    }
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 2: Switching from Sequence mode to Flex mode and back not shifts visible area of canvas beyond visible frame', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/5115
     * Description: Switching from Sequence mode to Flex mode and back not shifts visible area of canvas beyond visible frame.
     * Scenario:
     * 1. Go to Macromolecules - Snake mode
     * 2. Load from file
     * 3. Switch view to Sequence mode
     * 4. Switch back to Flex mode
     */
    await selectSnakeLayoutModeTool(page);
    await openFileAndAddToCanvasAsNewProjectMacro(
      'KET/switching-from-sequence-mode-to-snake-mode-and-back.ket',
      page,
    );
    await takePageScreenshot(page);
    await selectSequenceLayoutModeTool(page);
    await takePageScreenshot(page);
    await selectFlexLayoutModeTool(page);
    await takePageScreenshot(page);
  });

  test('Case 3: Connection between molecule and monomer affect an amount of implicit hydrogens', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/6021
     * Description: Connection between molecule and monomer affect an amount of implicit hydrogens.
     * Scenario:
     * 1. Open prepared file in Macro mode -> Flex mode
     * 2. Connect monomer to molecule's atom with implicit hydrogen in label
     */
    await selectFlexLayoutModeTool(page);
    await openFileAndAddToCanvasAsNewProjectMacro(
      'KET/monomer-and-micro-structure.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
    await connectMonomerToAtom(page);
    await takeEditorScreenshot(page);
  });

  test(`Case 4: Replacing all monomers (or part of them) in edit mode system not cuts sequence on two`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/5341
     * Description: Replacing all monomers (or part of them) in edit mode system not cuts sequence on two
     * Scenario:
     * 1. Go to Macromolecules mode - Sequence mode
     * 2. Load from file
     * 3. Select three @ symbols in edit mode (having blinking cursor somewhere in the middle of sequence - this is important!
     * 4. Click any monomer from the library (C peptide in my case) - click Yes in appeared Confirm Your Action dialog
     */
    await selectSequenceLayoutModeTool(page);
    await openFileAndAddToCanvasAsNewProjectMacro(
      'KET/Bugs/Replacing all monomers (or part of them) in edit mode - works wrong - system cuts sequence on two.ket',
      page,
    );
    await page.keyboard.down('Shift');
    await getSymbolLocator(page, {
      symbolAlias: '@',
      nodeIndexOverall: 0,
    }).click();
    await getSymbolLocator(page, {
      symbolAlias: '@',
      nodeIndexOverall: 2,
    }).click();
    await getSymbolLocator(page, {
      symbolAlias: '@',
      nodeIndexOverall: 4,
    }).click();
    await page.keyboard.up('Shift');
    await selectMonomer(page, Peptides.C);
    await pressButton(page, 'Yes');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test(`Case 5: Side chain attachment point shown in wrong place in Snake mode`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/6022
     * Description: Side chain attachment point shown in wrong place in Snake mode
     * Scenario:
     * 1. Go to Macro - Snake mode
     * 2. Put on the canvas A preset
     * 3. Turn on Bond tool
     * 4. Hover mouse cursor over base
     * 5. Take a screenshot to validate the side chain attachment point is shown in the right place
     */
    await selectSnakeLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P}$$$$V2.0',
    );
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
    const baseLocator = getMonomerLocator(page, Bases.A).first();
    await baseLocator.hover({ force: true });
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test(`Case 6: When pressing Enter, a user can create new sequences in the “Modify RNA Builder” mode`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/4723
     * Description: When pressing Enter, a user can create new sequences in the “Modify RNA Builder” mode
     * Scenario:
     * 1. Switch to the Macro mode – the Sequence mode
     * 2. Add a sequence of letters and select any
     * 3. Right-click on selected letters and choose the “Modify in RNA Builder” option
     * 4. Press the “Enter” key
     * 5. Enter letters
     * 6. Take a screenshot to validate user can not create new sequences in the “Modify RNA Builder” mode
     */
    await selectSequenceLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(U)P.R(U)P.R(U)}$$$$V2.0',
    );
    await selectAllStructuresOnCanvas(page);
    const symbolU = getSymbolLocator(page, { symbolAlias: 'U' }).first();
    await symbolU.click();
    await modifyInRnaBuilder(page, symbolU);
    await keyboardPressOnCanvas(page, 'Enter');
    await keyboardTypeOnCanvas(page, 'AAA');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test(`Case 7: Bond length is different for monomers loaded from HELM and from the library`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/4723
     * Description: Bond length is different for monomers loaded from HELM and from the library
     * Scenario:
     * 1. Switch to the Macro mode – Flex mode
     * 2. Load HELM paste from clipboard way: RNA1{R(A)P}$$$$V2.0
     * 3. Put the same preset from the library and put it above first one
     * 4. Take a screenshot to validate bonds length should be the same (1.5 angstroms)
     */
    await selectFlexLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P}$$$$V2.0',
    );
    await addMonomerToCenterOfCanvas(page, Presets.A);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test(`Case 8: After inserting a nucleotide in the Text-editing mode, the cursor blinks in the wrong place`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/4533
     * Description: After inserting a nucleotide in the Text-editing mode, the cursor blinks in the wrong place
     * Scenario:
     * 1. Switch to the Macro mode – Flex mode
     * 2. Put T preset from the library select all and copy it to clipboard
     * 3. Switch to the Sequence mode - the Text-editing mode
     * 4. Enter any sequence (for example, UUU)
     * 5. Paste the copied preset to the beginning of the sequence
     * 6. Take a screenshot to validate the cursor blinks in the right place
     */
    await selectFlexLayoutModeTool(page);
    await addMonomerToCenterOfCanvas(page, Presets.T);
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await TopLeftToolbar(page).clearCanvas();
    await selectSequenceLayoutModeTool(page);
    await keyboardTypeOnCanvas(page, 'UUU');
    await keyboardPressOnCanvas(page, 'ArrowUp');
    await pasteFromClipboardByKeyboard(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test(`Case 9: Movement of microstructures on Sequence mode doesn't work`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/5663
     * Description: Movement of microstructures on Sequence mode doesn't work
     * Scenario:
     * 1. Go to Macro mode - Sequence mode
     * 2. Load from file: Movement of microstructures on Sequence mode doesn't work.ket
     * 3. Select all (press CTRL+A)
     * 4. Drag any atom and try to move it
     * 5. Take a screenshot to validate movement of microstructures on Sequence mode works as expected
     */
    await openFileAndAddToCanvasMacro(
      "KET/Bugs/Movement of microstructures on Sequence mode doesn't work.ket",
      page,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await selectAllStructuresOnCanvas(page);
    await interactWithMicroMolecule(page, 'H3C', 'hover', 1);
    await dragMouseTo(200, 200, page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test(`Case 10: System not opens "intellisence"-like dropdown control`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/6112
     * Description: System not opens "intellisence"-like dropdown control
     * Scenario:
     * 1. Draw structure on ketcher canvas
     * 2. Change C1 of a molecule to O using the keyboard and then try to change C2 to N very
     * quickly afterward
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await drawBenzeneRing(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await clickOnAtom(page, 'C', 0);
    await page.keyboard.press('O');
    await moveOnAtom(page, 'C', 1);
    await page.keyboard.press('N');
    await takeEditorScreenshot(page);
  });

  test(`Case 11: Undo operation work for monomer at micro mode if it was deleted`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/6112
     * Description: Undo operation work for monomer at micro mode if it was deleted
     * Scenario:
     * 1. Load from file any ambiguous monomer
     * 2. Delete it
     * 3. Press Undo
     * 4. Take a screenshot
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      'KET/Bugs/1. Peptide X (ambiguouse, alternatives, from library).ket',
      page,
    );
    await selectAllStructuresOnCanvas(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await takeEditorScreenshot(page);
    await TopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
  });

  test(`Case 12: Canvas remain in edit mode if we insert monomer from the library`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/5231
     * Description: Canvas remain in edit mode if we insert monomer from the library
     * Scenario:
     * 1. Go to Macromolecules mode - Sequence mode
     * 2. Go to the Library - Peptide tab
     * 3. Click on A peptide
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: false,
      goToPeptides: false,
    });
    await selectMonomer(page, Peptides.A);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test(`Case 13: After Undo/Redo actions Enter not repeats these actions`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/4338
     * Description: After Undo/Redo actions Enter not repeats these actions and switch to new line
     * Scenario:
     * 1. Go to Macromolecules mode - Sequence mode
     * 2. Sequence mode >> RNA >>add AAATTT >> DNA >> add AAATTT >> Peptides >>add AAATTT
     * 3. Undo several times >> Enter several times.
     * 4. Take a screenshot
     */
    await switchToRNAMode(page);
    await keyboardTypeOnCanvas(page, 'AAATT');
    await switchToDNAMode(page);
    await keyboardTypeOnCanvas(page, 'AAATT');
    await switchToPeptideMode(page);
    await keyboardTypeOnCanvas(page, 'AAATT');
    for (let i = 0; i < 3; i++) {
      await TopLeftToolbar(page).undo();
    }
    await keyboardPressOnCanvas(page, 'Enter');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test(`Case 14: After pressing the Clear Canvas button in sequence-editing view, the Enter button start a new sequence not erases it`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/5139
     * Description: After pressing the Clear Canvas button in sequence-editing view, the Enter button start a new sequence not erases it
     * Scenario:
     * 1. Go to Macromolecules mode - Sequence mode
     * 2. Add any sequences to canvas ( start each new sequence with the enter button )
     * 3. Press 'Clear canvas' button
     * 4. Repeat p.2
     * 5. Take a screenshot
     */
    await keyboardTypeOnCanvas(page, 'AAATT');
    await keyboardPressOnCanvas(page, 'Enter');
    await keyboardTypeOnCanvas(page, 'AAATT');
    await keyboardPressOnCanvas(page, 'Enter');
    await keyboardTypeOnCanvas(page, 'AAATT');
    await keyboardPressOnCanvas(page, 'Enter');
    await TopLeftToolbar(page).clearCanvas();
    await keyboardTypeOnCanvas(page, 'AAATT');
    await keyboardPressOnCanvas(page, 'Enter');
    await keyboardTypeOnCanvas(page, 'AAATT');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test(`Case 15: Selection of monomers disappear when the user moves the cursor`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/5032
     * Description: Selection of monomers disappear when the user moves the cursor
     * Scenario:
     * 1. Go to Macromolecules mode - Sequence mode
     * 2. Enter any sequence with at least 2 symbols.
     * 3. Select a few monomers.
     * 4. Press left on the keyboard.
     * 5. Take a screenshot
     */
    await switchToRNAMode(page);
    await keyboardTypeOnCanvas(page, 'AAATT');
    await page.keyboard.down('Shift');
    for (let i = 0; i < 3; i++) {
      await keyboardPressOnCanvas(page, 'ArrowLeft');
    }
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await page.keyboard.up('Shift');
    await keyboardPressOnCanvas(page, 'ArrowLeft');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test(`Case 16: Undo/Redo operation for bonds and molecules (multi-select) works`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/5966
     * Description: Undo/Redo operation for bonds and molecules (multi-select) works
     * Scenario:
     * 1. Go to Macro - Flex
     * 2. Load from file
     * 3. Select bonds and atoms in the center of chain (using area selection tool)
     * 4. Click Erase button
     * 5. Press Undo button
     * 6. Take a screenshot
     */
    await selectFlexLayoutModeTool(page);
    await openFileAndAddToCanvasAsNewProject(
      'KET/Bugs/Undo_Redo operation for bonds and molecules (multi-select) works wrong.ket',
      page,
    );
    await selectPartOfMolecules(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await TopLeftToolbar(page).undo();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test(`Case 17: Indigo functions work if monomer on micro canvas - system not throws an error: Error: Cannot deserialize input JSON`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/5796
     * Description: Indigo functions work if monomer on micro canvas - system not throws an error: Error: Cannot deserialize input JSON
     * Scenario:
     * 1. Toggle to Molecules mode
     * 2. Load from file any ambiguous monomer
     * 3. Press Aromatize | Dearomatize | Layout | Clean Up | Calculate CIP | Add/Remove explicit hydrogens button
     * 4. Take a screenshot
     */
    const indigoFunctionsToolbar = IndigoFunctionsToolbar(page);

    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      'KET/Bugs/1. Peptide X (ambiguouse, alternatives, from library).ket',
      page,
    );
    await indigoFunctionsToolbar.aromatize();
    await indigoFunctionsToolbar.dearomatize();
    await indigoFunctionsToolbar.layout();
    await indigoFunctionsToolbar.cleanUp();
    await indigoFunctionsToolbar.calculateCIP();
    await IndigoFunctionsToolbar(page).addRemoveExplicitHydrogens();
    await takeEditorScreenshot(page);
  });

  test(`Case 18: All side chain bonds are shown in Sequence mode for bases, CHEMs, phosphates and sugars`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/5317
     * Description: All side chain bonds are shown in Sequence mode for bases, CHEMs, phosphates and sugars
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Load from file
     * 3. Switch to Sequence mode
     * 4. Take a screenshot
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: false,
      goToPeptides: false,
    });
    await selectFlexLayoutModeTool(page);
    await openFileAndAddToCanvasAsNewProject(
      'KET/Bugs/two sequences of bases (nC6n5U).ket',
      page,
    );
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test(`Case 19: Hover mouse over ambiguous monomer on Micromolecules canvas not causes app crash`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/6127
     * Description: Hover mouse over ambiguous monomer on Micromolecules canvas not causes app crash
     * Scenario:
     * 1. Reload Ketcher <--- Important
     * 2. Toggle to Molecules mode (DO NOT SWITCH TO Macro!)
     * 3. Load from file any ambiguous monomer using Open As New Project way
     * 4. Hover mouse over ambiguous monomer
     * 5. Take a screenshot
     */
    await pageReload(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      'KET/Bugs/1. Peptide X (ambiguouse, alternatives, from library).ket',
      page,
    );
    await hoverOnSequenceSymbol(page, 'X', 0);
    await takeEditorScreenshot(page);
  });

  test(`Case 20: Entire element bounding box should be clickable, not only black dots`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/6127
     * Description: Entire element bounding box should be clickable, not only black dots
     * Scenario:
     * 1. Go to Macro - Flex mode
     * 2. Load from file
     * 3. Click on the center of double bond (e.g. between two black lines)
     * 4. Take a screenshot
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
      goToPeptides: false,
    });
    await openFileAndAddToCanvasAsNewProject(
      'KET/Bugs/Entire element bounding box should be clickable, not only black dots.ket',
      page,
    );
    await clickOnCanvas(page, 530, 380);
    await takeEditorScreenshot(page);
  });

  test(`Case 21: Structural distortion not occurs during multi expand and multi collapse of macromolecule abbreviations in Micro mode`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/5670
     * Description: Structural distortion not occurs during multi expand and multi collapse of macromolecule abbreviations in Micro mode
     * Scenario:
     * 1. Open file in Macro mode (Flex mode)
     * 2. Switch to Micro mode
     * 3. Select all monomers and expand it and collapse it
     * 4. Take a screenshot
     */
    await selectFlexLayoutModeTool(page);
    await openFileAndAddToCanvasAsNewProject(
      'KET/Bugs/monomers-cycled.ket',
      page,
    );
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await selectAllStructuresOnCanvas(page);
    await page.getByText('1Nal').click({ button: 'right' });
    await page.getByText('Expand monomers').click();
    await takeEditorScreenshot(page);
    await page.getByText('NH').click({ button: 'right' });
    await page.getByText('Collapse monomers').click();
    await takeEditorScreenshot(page);
  });

  test(`Case 22: Atom properties not missing on initial load in Macro mode and correct hydrogen rendering on mode switch`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/6237
     * Description: Atom properties not missing on initial load in Macro mode and correct hydrogen rendering on mode switch
     * Scenario:
     * 1. Open saved file in Macro mode
     * 2. Switch to Micro mode
     * 3. Take a screenshot
     * 4. Switch back to Macro mode
     * 5. Take a screenshot
     */
    await pageReload(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
      goToPeptides: false,
    });
    await openFileAndAddToCanvasAsNewProject(
      'KET/Bugs/ketcher - 2025-01-06T161755.116.ket',
      page,
    );
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
      goToPeptides: false,
    });
    await takeEditorScreenshot(page);
  });

  test(`Case 23: Correct representation of hydrogens for Alias, Charge, Valence, and Radical properties in Macro mode`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/6235
     * Description: Correct representation of hydrogens for Alias, Charge, Valence, and Radical properties in Macro mode
     * Scenario:
     * 1. Open Ketcher in Micro mode
     * 2. Open prepared file with all atom properties in macromolecules mode
     * 3. Switch to Macro mode
     * 4. Take a screenshot
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      'KET/Bugs/ketcher - 2025-01-06T160012.582.ket',
      page,
    );
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
      goToPeptides: false,
    });
    await takeEditorScreenshot(page);
  });

  test(`Case 24: Export to 3-letter sequence work`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/6240
     * Description: Export to 3-letter sequence work
     * Scenario:
     * 1. Go to Macro - Flex mode
     * 2. Load from HELM: PEPTIDE1{A.C.D}$$$$V2.0
     * 3. Open Save dialog and choose Sequence (3-letter code)
     * 4. Press Save button
     */
    test.slow();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
      goToPeptides: false,
    });
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.C.D}$$$$V2.0',
    );
    await TopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.Sequence3LetterCode,
    );
    await takeEditorScreenshot(page);
    await SaveStructureDialog(page).save();
    await takeEditorScreenshot(page);
  });

  test(`Case 25: Super G and Super T monomers can be load from a saved RXN V3000 file`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/6291
     * Description: Super G and Super T monomers can be load from a saved RXN V3000 file
     * Scenario:
     * 1. Open Ketcher in Micro mode
     * 2. Load RXN V3000 file with Super G and Super T monomers
     * 3. Take a screenshot
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      'KET/Bugs/super-g-and-super-t.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'Rxn-V3000/Bugs/super-g-and-super-t-expected.rxn',
      FileType.RXN,
      'v3000',
    );
    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V3000/Bugs/super-g-and-super-t-expected.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test(`Case 26: Consistent zoom behavior when inserting a molecule via setMolecule and Paste from Clipboard/Open from File`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/6370
     * Description: Consistent zoom behavior when inserting a molecule via setMolecule and Paste from Clipboard/Open from File
     * Scenario:
     * 1. Open Ketcher -> Macro mode -> Flex
     * 2. Load RXN V3000 file with Super G and Super T monomers
     * 3. Take a screenshot
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
      goToPeptides: false,
    });
    await openFileAndAddToCanvasAsNewProjectMacro(
      'Molfiles-V3000/Bugs/macromol.mol',
      page,
    );
    await takeEditorScreenshot(page);
    await waitForSpinnerFinishedWork(
      page,
      async () => await setMolecule(page, FILE_TEST_DATA.macromol),
    );
    await takeEditorScreenshot(page);
  });

  test(`Case 27: Layout in case of two sense chains connected to same antisense works as expected`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/6106
     * Description: Layout in case of two sense chains connected to same antisense works as expected
     * Scenario:
     * 1. Go to Macro - Snake mode
     * 2. Load from HELM using paste from clipboard
     * 3. Take a screenshot
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: false,
      goToPeptides: false,
    });
    await selectSnakeLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.R(C)P.R(G)P}|RNA2{R(T)P.R(C)P.R(C)P.R(C)P}|RNA3{R(C)P.R(C)P}$RNA1,RNA2,2:pair-2:pair|RNA3,RNA1,5:pair-8:pair$$$V2.0',
    );
    await takeEditorScreenshot(page);
  });

  test.skip(`Case 28: Ambiguous DNA bases (N, D, H, W) not converted to DNA bases on antisense creation`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/6196
     * Description: Ambiguous DNA bases (N, D, H, W) not converted to DNA bases on antisense creation
     * Scenario:
     * 1. Go to Macro - Snake mode
     * 2. Load from HELM using paste from clipboard
     * 3. Create antisense for that chain
     * 4. Take a screenshot
     */
    // test.slow();
    await selectSnakeLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A,C,G,T)P.R(A,G,T)P.R(A,C,T)P.R(A,T)P}$$$$V2.0',
    );
    await selectAllStructuresOnCanvas(page);
    await callContextMenuForMonomer(page, Bases.DNA_N);
    const createAntisenseStrandOption = page
      .getByTestId('create_antisense_rna_chain')
      .first();

    await createAntisenseStrandOption.click();
    await takeEditorScreenshot(page);
    await verifyHELMExport(
      page,
      `RNA1{R(A,C,G,T)P.R(A,G,T)P.R(A,C,T)P.R(A,T)P}|RNA2{P.R(A,U)P.R(A,G,U)P.R(A,C,U)P.R(A,C,G,U)}$RNA1,RNA2,11:pair-3:pair|RNA1,RNA2,8:pair-6:pair|RNA1,RNA2,5:pair-9:pair|RNA1,RNA2,2:pair-12:pair$$$V2.0`,
    );
  });

  test(`Case 29: Cursor position after adding preset in sequence mode not causes an incorrect sequence formation`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/6272
     * Description: Cursor position after adding preset in sequence mode not causes an incorrect sequence formation
     * Scenario:
     * 1. Open Ketcher in Macro mode -> Sequence mode and navigate to the RNA tab.
     * 2. Start clicking one by one on presets A, U, C, A, U
     * 3. Observe the cursor position after adding the first nucleotide.
     * 4. Continue adding presets and observe the chain formation.
     * 5. Take a screenshot
     */
    await selectSequenceLayoutModeTool(page);
    await goToRNATab(page);
    await selectMonomer(page, Presets.A);
    await selectMonomer(page, Presets.U);
    await selectMonomer(page, Presets.C);
    await selectMonomer(page, Presets.A);
    await selectMonomer(page, Presets.U);
    await takeEditorScreenshot(page);
  });

  test(`Case 30: Macro structure not duplicated on canvas when using ketcher.getMolfile()`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/6546
     * Description: Macro structure not duplicated on canvas when using ketcher.getMolfile()
     * Scenario:
     * 1. Open Ketcher in Macro mode
     * 2. Add any Macro structure to canvas (in my case it was MOE(A)P triplet) and switch to Micro mode
     * 3. Run ketcher.getMolfile()
     * 4. Open saved MOL file.
     * 5. Take a screenshot
     */
    await goToRNATab(page);
    await selectMonomer(page, Presets.MOE_A_P);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await verifyFileExport(
      page,
      'Molfiles-V3000/Bugs/moe-a-p-expected.mol',
      FileType.MOL,
      'v3000',
    );
    await openFileAndAddToCanvasAsNewProject(
      'Molfiles-V3000/Bugs/moe-a-p-expected.mol',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test(`Case 31: Modified phosphates not shift away from main structure during expand in Micro Mode`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/6557
     * Description: Modified phosphates not shift away from main structure during expand in Micro Mode
     * Scenario:
     * 1. Open Ketcher in Macro mode
     * 2. Select all structure
     * 3. Expand structure
     * 4. Take a screenshot
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      'KET/Bugs/modified-phosphates.ket',
      page,
    );
    await selectAllStructuresOnCanvas(page);
    await page.getByText('mph').first().click({ button: 'right' });
    await page.getByText('Expand monomers').click();
    await takeEditorScreenshot(page);
  });

  test(`Case 32: Natural monomer have standard bond lengths and angles`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/6563
     * Description: Natural monomer have standard bond lengths and angles
     * Scenario:
     * 1. Open Ketcher in Macro mode
     * 2. Add base A to the canvas
     * 3. Switch to Micro mode
     * 4. Expand structure
     * 5. Draw a cyclohexane
     * 6. Compare bond lengths
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: false,
      goToPeptides: false,
    });
    await selectMonomer(page, Bases.A);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await selectAllStructuresOnCanvas(page);
    await page.getByText('A', { exact: true }).click({ button: 'right' });
    await page.getByText('Expand monomer').click();
    await selectRingButton(page, 'Cyclohexane');
    await clickOnCanvas(page, 180, 180);
    await takeEditorScreenshot(page);
  });
});
