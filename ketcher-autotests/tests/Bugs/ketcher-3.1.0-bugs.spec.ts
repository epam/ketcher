/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { Peptides } from '@constants/monomers/Peptides';
import { Page, test } from '@playwright/test';
import {
  selectClearCanvasTool,
  selectSnakeLayoutModeTool,
  takeEditorScreenshot,
  takePageScreenshot,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  MacroFileType,
  selectAllStructuresOnCanvas,
  clickOnAtom,
  openFileAndAddToCanvasAsNewProject,
  clickOnCanvas,
  selectRing,
  RingButton,
  addMonomersToFavorites,
  takeMonomerLibraryScreenshot,
  delay,
  openLayoutModeMenu,
  clickOnBond,
  BondType,
  selectFlexLayoutModeTool,
  copyToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  selectSequenceLayoutModeTool,
  pasteFromClipboard,
  openStructurePasteFromClipboard,
} from '@utils';
import { waitForPageInit, waitForRender } from '@utils/common';
import { closeErrorAndInfoModals } from '@utils/common/helpers';
import {
  turnOnMacromoleculesEditor,
  turnOnMicromoleculesEditor,
} from '@utils/macromolecules';
import {
  goToFavoritesTab,
  goToPeptidesTab,
} from '@utils/macromolecules/library';
import { getMonomerLocator, moveMonomer } from '@utils/macromolecules/monomer';
import {
  pressSaveButton,
  selectBaseSlot,
} from '@utils/macromolecules/rnaBuilder';
import {
  clickOnSequenceSymbol,
  doubleClickOnSequenceSymbol,
  switchToPeptideMode,
} from '@utils/macromolecules/sequence';
import { pressUndoButton } from '@utils/macromolecules/topToolBar';
import { processResetToDefaultState } from '@utils/testAnnotations/resetToDefaultState';

let page: Page;

async function callContextMenuForMonomer(
  page: Page,
  monomerLocatorIndex: number,
) {
  const canvasLocator = page.getByTestId('ketcher-canvas');
  await canvasLocator
    .locator('g.monomer')
    .nth(monomerLocatorIndex)
    .click({ button: 'right', force: true });
}

async function setRotationStep(page: Page, value: string) {
  await page.getByTestId('settings-button').click();
  await page.getByTestId('rotationStep-input').click();
  await page.getByTestId('rotationStep-input').fill(value);
  await page.getByTestId('OK').click();
}

async function switchSyncMode(page: Page) {
  await page.locator('.e1846tr80').click();
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

  test('Case 1: Circular hydrogen bond connection between three (or more) chains, those hydrogen bonds is considered as side chain connection for layout purposes', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6602
     * Bug: https://github.com/epam/ketcher/issues/6201
     * Description: Circular hydrogen bond connection between three (or more) chains, those hydrogen bonds is considered as side chain connection for layout purposes.
     * Scenario:
     * 1. Go to Macro mode - Snake mode <---IMPORTANT
     * 2. Load from HELM
     * 3. Take a screenshot
     */
    await selectSnakeLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(C)P.R(A)P.R(A)P}|RNA2{R(G)P.R(T)P.R(U)P}|RNA3{R(C)P.R(A)P.R(A)P}$RNA1,RNA2,8:pair-8:pair|RNA2,RNA3,2:pair-2:pair|RNA3,RNA1,8:pair-2:pair$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 2: Unknown monomer and CHEM not overlap to each other if both are the side chain for same chain', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6602
     * Bug: https://github.com/epam/ketcher/issues/6194
     * Description: Unknown monomer and CHEM not overlap to each other if both are the side chain for same chain.
     * Scenario:
     * 1. Go to Macro mode - Snake mode <---IMPORTANT
     * 2. Load from KET
     * 3. Take a screenshot
     */
    await selectSnakeLayoutModeTool(page);
    await openFileAndAddToCanvasAsNewProject(
      'KET/Bugs/Unknown monomer and CHEM overlap to each other if both are the side chain for same chain.ket',
      page,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 3: Unknown monomer and CHEM not overlap to each other if both are the side chain for same chain (Additional case)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6602
     * Bug: https://github.com/epam/ketcher/issues/6194
     * Description: Unknown monomer and CHEM not overlap to each other if both are the side chain for same chain.
     * Scenario:
     * 1. Go to Macro mode - Snake mode <---IMPORTANT
     * 2. Load from HELM
     * 3. Take a screenshot
     */
    await selectSnakeLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R([nC6n8A])}|CHEM1{[4aPEGMal]}|PEPTIDE1{(A,C,D,E,F,G,H,I,K,L,M,N,O,P,Q,R,S,T,U,V,W,Y)}$CHEM1,RNA1,1:pair-2:pair|RNA1,PEPTIDE1,1:pair-1:pair$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 4: Nucleotide not become antisense oriented if have hydrogen connection to sugar', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6602
     * Bug: https://github.com/epam/ketcher/issues/6195
     * Description: Nucleotide not become antisense oriented if have hydrogen connection to sugar.
     * Scenario:
     * 1. Go to Macro mode - Snake mode <---IMPORTANT
     * 2. Load from HELM
     * 3. Take a screenshot
     */
    await selectSnakeLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R([nC6n8A])P}|CHEM1{[4aPEGMal]}|RNA2{R(A)P}$CHEM1,RNA1,1:pair-2:pair|RNA1,RNA2,3:pair-1:pair$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 5: Adding attachment point to microstructure already connected to monomer - causes problems when switch to Macro mode', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6602
     * Bug: https://github.com/epam/ketcher/issues/5696
     * Description: Implemented a check for monomer connections when adding attachment points.
     * Disabled the "Add Attachment Point" button if a molecule is connected to a monomer..
     * Scenario:
     * 1. Go to Micromolecules mode
     * 2. Load from file
     * 3. Try add attachment point to the atom
     * 4. Switch to Macro mode
     * 5. Take a screenshot
     */
    await turnOnMicromoleculesEditor(page);
    await openFileAndAddToCanvasAsNewProject(
      'KET/Bugs/Adding Attachment point to microstructure already connected to monomer - causes problems (sometimes crash).ket',
      page,
    );
    await clickOnAtom(page, 'C', 4, 'right');
    await takeEditorScreenshot(page);
    await turnOnMacromoleculesEditor(page, true, false);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 6: Create Antisense Strand option is disabled even if antisensless base present in chain selection', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6602
     * Bug: https://github.com/epam/ketcher/issues/6088
     * Description: Create Antisense Strand option is disabled even if antisensless base present in chain selection.
     * Scenario:
     * 1. Go to Macro mode - Snake mode
     * 2. Load from HELM
     * 3. Select all monomers on the canvas and call context menu
     * 4. Take a screenshot
     */
    await selectSnakeLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.[dR](A+C+G+U)P.R(A)P}$$$$V2.0',
    );
    await selectAllStructuresOnCanvas(page);
    await callContextMenuForMonomer(page, 0);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 7: Color schema for Favorites tab at RNA Library is like in the library for Peptides', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6602
     * Bug: https://github.com/epam/ketcher/issues/6166
     * Description: Color schema for Favorites tab at RNA Library is like in the library for Peptides.
     * Scenario:
     * 1. Go to Macro mode
     * 2. Go to Peptides tab and add A and C peptides to Favorites
     * 3. Switch to Favorites tab
     * 4. Take a screenshot
     */
    await goToPeptidesTab(page);
    await addMonomersToFavorites(page, [Peptides.A, Peptides.C]);
    await goToFavoritesTab(page);
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 8: Changing any parameter at Settings not cause Undo/Redo work wrong (or delete undo history)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6602
     * Bug: https://github.com/epam/ketcher/issues/6164
     * Description: Changing any parameter at Settings not cause Undo/Redo work wrong (or delete undo history).
     * Scenario:
     * 1. Toggle to Molecules mode
     * 2. Put three Benzene rings on the canvas
     * 3. Change any parameter at Settings (Rotation Step in my case)
     * 4. Press Apply button
     * 5. Press Undo button
     * 6. Take a screenshot
     */
    await turnOnMicromoleculesEditor(page);
    await selectRing(RingButton.Benzene, page);
    await clickOnCanvas(page, 200, 200);
    await clickOnCanvas(page, 400, 400);
    await clickOnCanvas(page, 600, 600);
    await setRotationStep(page, '20');
    for (let i = 0; i < 2; i++) {
      await pressUndoButton(page);
    }
    await takeEditorScreenshot(page);
  });

  test('Case 9: Chain bonds not appear on Sequence screenshots', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6602
     * Bug: https://github.com/epam/ketcher/issues/6423
     * Description: Chain bonds not appear on Sequence screenshots.
     * Scenario:
     * 1. Go to Macro - Sequence mode
     * 2. Type few letters A and click away to exit mode
     * 3. Single click on any symbol
     * 4. Single click on the same symbol one more time (after shot pause)
     * 5. Take a screenshot
     */
    await waitForRender(page, async () => {
      await page.keyboard.type('AAAAAAAAAAAA');
    });
    await clickOnCanvas(page, 400, 400);
    await clickOnSequenceSymbol(page, 'A', { nthNumber: 11 });
    await delay(2);
    await clickOnSequenceSymbol(page, 'A', { nthNumber: 11 });
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 10: There is no gap between button and drop-down list of Macro modes', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6602
     * Bug: https://github.com/epam/ketcher/issues/4352
     * Description: There is no gap between button and drop-down list of Macro modes.
     * Scenario:
     * 1. Go to Macro
     * 2. Click on Modes list button
     * 3. Take a screenshot
     */
    await openLayoutModeMenu(page);
    await takePageScreenshot(page);
  });

  test(`Case 11: System not shows Edit S-Group option for bond of molecule if it has attachment point`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/4941
     * Description: System not shows Edit S-Group option for bond of molecule if it has attachment point
     * Scenario:
     * 1. Open KET file
     * 2. Right click on the bond
     * 3. Take a screenshot
     */
    await turnOnMicromoleculesEditor(page);
    await openFileAndAddToCanvasAsNewProject(
      'KET/Bugs/Unable to change atom to another if molecule has attachment point.ket',
      page,
    );
    await clickOnBond(page, BondType.SINGLE, 2, 'right');
    await takeEditorScreenshot(page);
  });

  test(`Case 12: For D-OAla named monomer it should be D-Lactic acid name in preview tooltip`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/5195
     * Description: For D-OAla named monomer it should be D-Lactic acid name in preview tooltip
     * Scenario:
     * 1. Go to Macro
     * 2. Switch to Flex mode
     * 3. Hover over D-OAla monomer
     * 4. Take a screenshot
     */
    await turnOnMacromoleculesEditor(page, true, false);
    await goToPeptidesTab(page);
    await waitForRender(page, async () => {
      await page.getByTestId('D-OAla___D-Lactic acid').hover();
    });
    await takePageScreenshot(page);
  });

  test(`Case 13: Separate selenocysteine from cysteine and pyrrolysine from lysine`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/4722
     * Description: Selenocysteine is a separate amino acid from cysteine.
     * It should have its own section in the library under the symbol U containing the following monomersseC (new symbol U)
     * and dSec (new symbol dU)Pyrrolysine is a separate amino acid from lysine.It should have its own section in the library
     * under the symbol O containing the following monomers:Pyl (new symbol O) and dPyl( new symbol dO)
     * Scenario:
     * 1. Go to Macro
     * 2. Switch to Flex mode
     * 3. Hover over O monomer
     * 4. Take a screenshot
     * 5. Hover over U monomer
     * 6. Take a screenshot
     */
    await selectFlexLayoutModeTool(page);
    await goToPeptidesTab(page);
    await waitForRender(page, async () => {
      await page.getByTestId('O___Pyrrolysine').hover();
    });
    await takePageScreenshot(page);
    await waitForRender(page, async () => {
      await page.getByTestId('U___Selenocysteine').hover();
    });
    await takePageScreenshot(page);
  });

  test('Case 14: Selection work in sequence editing with Shift+Up/Down arrow combination', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6602
     * Bug: https://github.com/epam/ketcher/issues/4349
     * Description: Selection work in sequence editing with Shift+Up/Down arrow combination.
     * Scenario:
     * 1. Switch to Macro mode - > Sequence mode
     * 2. Add any sequence to canvas
     * 3. Select sequence with Shift+Up/Down arrow combination
     * 4. Take a screenshot
     */
    await selectSequenceLayoutModeTool(page);
    await waitForRender(page, async () => {
      await page.keyboard.type(
        'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      );
    });
    await page.keyboard.down('Shift');
    for (let i = 0; i < 2; i++) {
      await page.keyboard.press('ArrowUp');
    }
    await page.keyboard.up('Shift');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await page.keyboard.down('Shift');
    for (let i = 0; i < 1; i++) {
      await page.keyboard.press('ArrowDown');
    }
    await page.keyboard.up('Shift');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test(`Case 15: Long bond not appears behind the structure after Copy-Paste in Flex Mode`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6600
     * Bug: https://github.com/epam/ketcher/issues/6456
     * Description: Long bond not appears behind the structure after Copy-Paste in Flex Mode
     * Scenario:
     * 1. Go to Macro
     * 2. Switch to Flex mode
     * 3. Draw or load a structure that contains a long bond.
     * 4. Copy (Ctrl+C) and Paste (Ctrl+V) the structure onto the canvas.
     * 5. Take a screenshot
     */
    await selectFlexLayoutModeTool(page);
    await openFileAndAddToCanvasAsNewProject(
      'KET/Bugs/peptides-with-long-bond.ket',
      page,
    );
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await page.mouse.move(500, 500);
    await pasteFromClipboardByKeyboard(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 16: Removing peptide from sense/antisence chain not cause unnessussary phosphate removal', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6602
     * Bug: https://github.com/epam/ketcher/issues/6471
     * Description: Removing peptide from sense/antisence chain not cause unnessussary phosphate removal.
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from HELM
     * 3. Click between E symbols to switch to Edit mode
     * 4. Press Backspace key to delete left E symbol
     * 5. Take a screenshot
     */
    await selectSequenceLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P}|RNA2{R(U)P.R(U)}|PEPTIDE1{E.E}|RNA3{R(A)}$RNA1,PEPTIDE1,3:R2-1:R1|PEPTIDE1,RNA3,2:R2-1:R1|RNA1,RNA2,2:pair-5:pair|RNA3,RNA2,2:pair-2:pair$$$V2.0',
    );
    await switchSyncMode(page);
    await doubleClickOnSequenceSymbol(page, 'E', { nthNumber: 0 });
    await page.keyboard.press('Backspace');
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

  test('Case 17: Adding peptide between RNA and - symbol not breaks sense/antisense chain', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6602
     * Bug: https://github.com/epam/ketcher/issues/6462
     * Description: Adding peptide between RNA and - symbol not breaks sense/antisense chain.
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from HELM
     * 3. Click between A and - symbols to switch to Edit mode
     * 4. Switch editor to PEP mode and press C key
     * 5. Take a screenshot
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.R(G)}|RNA2{R(U)}|RNA3{R(C)}$RNA1,RNA2,2:pair-2:pair|RNA1,RNA3,5:pair-2:pair$$$V2.0',
    );
    await switchSyncMode(page);
    await doubleClickOnSequenceSymbol(page, 'G', { nthNumber: 0 });
    for (let i = 0; i < 2; i++) {
      await page.keyboard.press('ArrowLeft');
    }
    await goToPeptidesTab(page);
    await page.keyboard.type('C');
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

  test('Case 18: System split chian pair on two if - symbol deleted', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6602
     * Bug: https://github.com/epam/ketcher/issues/6447
     * Description: System split chian pair on two if - symbol deleted.
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from HELM
     * 3. Switch to Edit mode and remove - symbol
     * 4. Take a screenshot
     */
    await selectSequenceLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(C)P.R(A)}|RNA2{R(U)}|RNA3{R(G)}$RNA2,RNA1,2:pair-5:pair|RNA1,RNA3,2:pair-2:pair$$$V2.0',
    );
    await switchSyncMode(page);
    await doubleClickOnSequenceSymbol(page, 'A', { nthNumber: 0 });
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Backspace');
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

  test('Case 19: System not merge two antisense chains if separator monomer got deleted', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6602
     * Bug: https://github.com/epam/ketcher/issues/6446
     * Description: System not merge two antisense chains if separator monomer got deleted.
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from HELM
     * 3. Switch to Edit mode and remove first A nucleotide
     * 4. Take a screenshot
     */
    await selectSequenceLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(C)P.R(A)P.R(C)P.R(A)P.R(A)}|RNA2{R(U)}|RNA3{R(G)}|RNA4{R(G)}$RNA1,RNA2,14:pair-2:pair|RNA1,RNA3,8:pair-2:pair|RNA1,RNA4,2:pair-2:pair$$$V2.0',
    );
    await doubleClickOnSequenceSymbol(page, 'C', { nthNumber: 1 });
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Backspace');
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

  test('Case 20: Adding second chain with antisese chain to the canvas not cause layout problem', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6602
     * Bug: https://github.com/epam/ketcher/issues/6098
     * Description: Adding second chain with antisese chain to the canvas not cause layout problem.
     * Scenario:
     * 1. Go to Macro - Snake mode
     * 2. Load from HELM
     * 3. Paste same HELM once again
     * 4. Take a screenshot
     */
    await selectSnakeLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.R(A)}|RNA2{R(T)P.R(T)}|RNA3{R(A)P}$RNA1,RNA2,5:pair-5:pair|RNA2,RNA3,2:pair-2:pair$$$V2.0',
    );
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 21: Changing of ambiguous base via RNA Builder on Sequence mode not causes sequence corruption', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6602
     * Bug: https://github.com/epam/ketcher/issues/6085
     * Description: Changing of ambiguous base via RNA Builder on Sequence mode not causes sequence corruption.
     * Scenario:
     * 1. Go to Macro - Sequence mode <--- Important
     * 2. Load from HELM
     * 3. Select any N nucleotide and select Modify in RNA Builder
     * 4. Select 4ime6A base from the library and press Update button
     * 5. Take a screenshot
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.R(A,C,G,T)P.R(A)}$$$$V2.0',
    );
    await clickOnSequenceSymbol(page, 'N', { nthNumber: 0 });
    await clickOnSequenceSymbol(page, 'N', { nthNumber: 0, button: 'right' });
    await page.getByTestId('modify_in_rna_builder').click();
    await selectBaseSlot(page);
    await page.getByTestId('4ime6A___N6-[2-(4-Imidazoyl)ethyl]adenine').click();
    await pressSaveButton(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 22: Undo of deleted bond on sequence mode not causes "ghost" monomer appearence on the canvas', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6602
     * Bug: https://github.com/epam/ketcher/issues/6493
     * Description: Undo of deleted bond on sequence mode not causes "ghost" monomer appearence on the canvas.
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from HELM
     * 3. Switch to Edit mode and remove - symbol
     * 4. Press Undo button
     * 5. Switch to Flex mode
     * 6. Take a screenshot
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(C)P.R(A)}|RNA2{R(U)}|RNA3{R(G)}$RNA2,RNA1,2:pair-5:pair|RNA1,RNA3,2:pair-2:pair$$$V2.0',
    );
    await doubleClickOnSequenceSymbol(page, 'A', { nthNumber: 0 });
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Backspace');
    await pressUndoButton(page);
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

  test('Case 23: Connection points not appear visually disconnected when moving monomers in Flex and Snake mode', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6602
     * Bug: https://github.com/epam/ketcher/issues/5780
     * Description: Connection points not appear visually disconnected when moving monomers in Flex and Snake mode.
     * Scenario:
     * 1. Open Macro -> Snake mode
     * 2. Open structure
     * 3. Move monomer
     * 4. Take a screenshot
     */
    const firstMonomer = getMonomerLocator(page, Peptides.F).first();
    await selectSnakeLayoutModeTool(page);
    await openFileAndAddToCanvasAsNewProject(
      'KET/Bugs/structure-in-snake-mode.ket',
      page,
    );
    await moveMonomer(page, firstMonomer, 200, 400);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 24: Peptide sequence not pasting directly on canvas', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6602
     * Bug: https://github.com/epam/ketcher/issues/6588
     * Description: Peptide sequence not pasting directly on canvas.
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Copy and paste directly onto the canvas sequence GATYLIK
     * 3. Take a screenshot
     * It’s not working properly now. After the release of Ketcher 3.2.0-rc.2, the screenshot should be updated
     */
    await selectSequenceLayoutModeTool(page);
    await switchToPeptideMode(page);
    await openStructurePasteFromClipboard(page);
    await pasteFromClipboard(page, 'GATYLIK');
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await closeErrorAndInfoModals(page);
    await pasteFromClipboardByKeyboard(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });
});
