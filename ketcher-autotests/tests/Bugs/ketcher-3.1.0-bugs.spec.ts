/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { Bases } from '@constants/monomers/Bases';
import { Peptides } from '@constants/monomers/Peptides';
import { Presets } from '@constants/monomers/Presets';
import { Page, test } from '@playwright/test';
import {
  selectClearCanvasTool,
  selectFlexLayoutModeTool,
  selectSequenceLayoutModeTool,
  selectSnakeLayoutModeTool,
  takeEditorScreenshot,
  takePageScreenshot,
  openFileAndAddToCanvasAsNewProjectMacro,
  selectMacroBond,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  MacroFileType,
  MonomerType,
  selectAllStructuresOnCanvas,
  addMonomerToCenterOfCanvas,
  copyToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  openFileAndAddToCanvasMacro,
  dragMouseTo,
  selectMonomer,
  pressButton,
  drawBenzeneRing,
  moveOnAtom,
  selectRectangleSelection,
  clickOnAtom,
  openFileAndAddToCanvasAsNewProject,
  selectEraseTool,
  selectPartOfMolecules,
  selectAromatizeTool,
  selectDearomatizeTool,
  selectLayoutTool,
  selectCleanTool,
  selectCalculateTool,
  selectAddRemoveExplicitHydrogens,
  clickOnCanvas,
  selectTopPanelButton,
  TopPanelButton,
  setMolecule,
  FILE_TEST_DATA,
  moveMouseAway,
  selectRing,
  RingButton,
  addMonomersToFavorites,
  takeMonomerLibraryScreenshot,
  delay,
  openLayoutModeMenu,
} from '@utils';
import { MacroBondTool } from '@utils/canvas/tools/selectNestedTool/types';
import {
  waitForPageInit,
  waitForRender,
  waitForSpinnerFinishedWork,
} from '@utils/common';
import { pageReload } from '@utils/common/helpers';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import {
  chooseFileFormat,
  turnOnMacromoleculesEditor,
  turnOnMicromoleculesEditor,
} from '@utils/macromolecules';
import {
  goToFavoritesTab,
  goToPeptidesTab,
  goToRNATab,
} from '@utils/macromolecules/library';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import {
  clickOnSequenceSymbol,
  hoverOnSequenceSymbol,
  switchToDNAMode,
  switchToPeptideMode,
} from '@utils/macromolecules/sequence';
import { pressUndoButton } from '@utils/macromolecules/topToolBar';
import { processResetToDefaultState } from '@utils/testAnnotations/resetToDefaultState';

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
});
