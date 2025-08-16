import { Bases } from '@constants/monomers/Bases';
import { Chem } from '@constants/monomers/Chem';
import { Peptides } from '@constants/monomers/Peptides';
import { Phosphates } from '@constants/monomers/Phosphates';
import { Presets } from '@constants/monomers/Presets';
import { Sugars } from '@constants/monomers/Sugars';
import { Locator, test } from '@playwright/test';
import {
  addSingleMonomerToCanvas,
  dragMouseTo,
  hideMonomerPreview,
  moveMouseAway,
  openFileAndAddToCanvasMacro,
  takeEditorScreenshot,
  takePageScreenshot,
  waitForPageInit,
  clickOnCanvas,
  zoomWithMouseWheel,
  copyToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  selectAllStructuresOnCanvas,
  selectUndoByKeyboard,
  getControlModifier,
  MacroFileType,
} from '@utils';
import { selectRectangleArea } from '@utils/canvas/tools/helpers';
import {
  connectMonomersWithBonds,
  getMonomerLocator,
  moveMonomer,
} from '@utils/macromolecules/monomer';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { keyboardPressOnCanvas } from '@utils/keyboard/index';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
/* eslint-disable no-magic-numbers */

test.describe('Undo Redo', () => {
  let peptide1: Locator;
  let peptide2: Locator;
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    await Library(page).switchToPeptidesTab();
    peptide1 = await addSingleMonomerToCanvas(page, Peptides.Tza, 300, 300, 0);
    peptide2 = await addSingleMonomerToCanvas(page, Peptides.Tza, 400, 300, 1);
    const peptide3 = await addSingleMonomerToCanvas(
      page,
      Peptides.Tza,
      500,
      300,
      2,
    );

    // Select bond tool
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);

    // Create bonds between peptides
    await bondTwoMonomers(page, peptide1, peptide2);
    await bondTwoMonomers(page, peptide3, peptide2);

    await hideMonomerPreview(page);
  });

  test('Undo redo for monomers and bonds addition', async ({ page }) => {
    /*
    Description: Add monomers and bonds and do undo redo
    */

    // check that history pointer stops on last operation
    await CommonTopLeftToolbar(page).redo();
    await CommonTopLeftToolbar(page).redo();

    // check undo
    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);

    // check that history pointer stops on first operation
    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).undo();

    // check redo
    await CommonTopLeftToolbar(page).redo();
    await takeEditorScreenshot(page);
  });

  test('Undo redo for snake mode layout', async ({ page }) => {
    /*
    Description: Add monomers and bonds, activate snake mode and do undo redo
    */

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
  });

  test('Undo redo for monomers movement', async ({ page }) => {
    /*
    Description: Move monomers and do undo redo
    */

    await moveMonomer(page, peptide1, 500, 500);
    await moveMonomer(page, peptide2, 600, 600);
    await moveMonomer(page, peptide2, 400, 400);
    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).redo();
    await takeEditorScreenshot(page);
  });

  test('Undo redo for imported structure', async ({ page }) => {
    await openFileAndAddToCanvasMacro(
      page,
      'KET/peptide-enumeration-one-two-three.ket',
    );
    await openFileAndAddToCanvasMacro(
      page,
      'KET/peptide-enumeration-one-two-three.ket',
    );
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);

    const startX = 10;
    const startY = 10;
    const endX = 1900;
    const endY = 1900;
    await selectRectangleArea(page, startX, startY, endX, endY);

    const coords = { x: 100, y: 100 };
    await page.mouse.move(coords.x, coords.y);

    await dragMouseTo(coords.x + 500, coords.y + 500, page);
    await takeEditorScreenshot(page);
  });
});

test.describe('Undo-Redo tests', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  });

  test('Deleting entities(Peptides, RNA, CHEM, Bonds) and then checking Undo and Redo actions', async ({
    page,
  }) => {
    /* 
    Test case: Undo-Redo tests
    Description: Entities(Peptides, RNA, CHEM, Bonds) are deleted and then Undo and Redo actions.
    */
    await openFileAndAddToCanvasMacro(page, 'KET/all-entities.ket');
    await CommonLeftToolbar(page).selectEraseTool();
    const entitiesToDelete = [
      Peptides.D_aIle,
      Peptides.SertBu,
      Peptides.Phe_ol,
      Peptides.TyrabD,
      Sugars._25R,
      Bases.c3A,
      Phosphates.msp,
      Bases.cpmA,
      Chem.SMPEG2,
    ];

    for (const entity of entitiesToDelete) {
      await getMonomerLocator(page, entity).click();
    }

    const numberOfPress = 9;

    for (let i = 0; i < numberOfPress; i++) {
      await CommonTopLeftToolbar(page).undo();
    }
    await takeEditorScreenshot(page);

    for (let i = 0; i < numberOfPress; i++) {
      await CommonTopLeftToolbar(page).redo();
    }
    await takeEditorScreenshot(page);
  });

  test('Track 32 steps (Undo,Redo action)', async ({ page }) => {
    /*
    Test case: Undo-Redo tests
    Description: Add 'Bal___beta-Alanine' monomer to canvas 35 times and then press Undo 32 times.
    */

    test.slow();

    const addMonomers = async (x: number, y: number) => {
      await Library(page).dragMonomerOnCanvas(Peptides.bAla, {
        x,
        y,
      });
    };

    const numberOfRows = 6;
    const numberOfColumns = 8;
    const step = 100;
    const coordinates = [];

    for (let row = 0; row < numberOfRows; row++) {
      for (let column = 0; column < numberOfColumns; column++) {
        coordinates.push({ x: column * step, y: row * step });
      }
    }

    for (const { x, y } of coordinates) {
      await addMonomers(x, y);
    }

    const maxUndoHistorySize = 32;
    for (let i = 0; i < maxUndoHistorySize; i++) {
      await CommonTopLeftToolbar(page).undo();
    }
    await takeEditorScreenshot(page);

    const maxRedoHistorySize = 32;
    for (let i = 0; i < maxRedoHistorySize; i++) {
      await CommonTopLeftToolbar(page).redo();
    }
    await takeEditorScreenshot(page);
  });

  test('Track 32 steps for CHEMs (Undo,Redo action)', async ({ page }) => {
    /*
    Test case: Undo-Redo tests
    Description: Add 'SMPEG2___SM(PEG)2 linker from Pierce' CHEM to canvas 35 times and then press Undo 32 times.
    */

    test.slow();

    const addMonomers = async (x: number, y: number) => {
      await Library(page).dragMonomerOnCanvas(Chem.SMPEG2, {
        x,
        y,
      });
    };

    const numberOfRows = 6;
    const numberOfColumns = 8;
    const step = 100;
    const coordinates = [];

    for (let row = 0; row < numberOfRows; row++) {
      for (let column = 0; column < numberOfColumns; column++) {
        coordinates.push({ x: column * step, y: row * step });
      }
    }

    for (const { x, y } of coordinates) {
      await addMonomers(x, y);
    }

    const maxUndoHistorySize = 32;
    for (let i = 0; i < maxUndoHistorySize; i++) {
      await CommonTopLeftToolbar(page).undo();
    }
    await takeEditorScreenshot(page);

    const maxRedoHistorySize = 32;
    for (let i = 0; i < maxRedoHistorySize; i++) {
      await CommonTopLeftToolbar(page).redo();
    }
    await takeEditorScreenshot(page);
  });

  test('After placing a monomers on canvas and deleting some of them check that short key "Control + Z" and "Control+Y" are working', async ({
    page,
  }) => {
    /* 
    Test case: Undo-Redo tests
    Description: Short key "Control + Z" and "Control+Y" are working.
    */
    await openFileAndAddToCanvasMacro(page, 'KET/all-entities.ket');
    await CommonLeftToolbar(page).selectEraseTool();
    const entitiesToDelete = [
      Peptides.SertBu,
      Peptides.TyrabD,
      Sugars._25R,
      Bases.c3A,
      Phosphates.msp,
      Chem.SMPEG2,
    ];

    for (const entity of entitiesToDelete) {
      await getMonomerLocator(page, entity).click();
    }

    const numberOfPress = 6;

    for (let i = 0; i < numberOfPress; i++) {
      await selectUndoByKeyboard(page);
    }
    await takeEditorScreenshot(page);

    const modifier = getControlModifier();
    for (let i = 0; i < numberOfPress; i++) {
      await keyboardPressOnCanvas(page, `${modifier}+KeyY`);
    }
    await takeEditorScreenshot(page);
  });

  test('Press Undo/Redo after opening a .ket file with monomers', async ({
    page,
  }) => {
    /* 
    Test case: Undo-Redo tests
    Description: Undo/Redo after opening  a .ket file is working.
    */
    await openFileAndAddToCanvasMacro(page, 'KET/all-entities.ket');
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).redo();
    await takeEditorScreenshot(page);
  });

  test('Press Undo/Redo after opening  a .mol file with monomers', async ({
    page,
  }) => {
    /* 
    Test case: Undo-Redo tests
    Description: Undo/Redo after opening  a .mol file is working.
    */
    await openFileAndAddToCanvasMacro(
      page,
      'Molfiles-V3000/monomers-connected-with-bonds.mol',
      MacroFileType.MOLv3000,
    );
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).redo();
    await takeEditorScreenshot(page);
  });

  test('Check that undo/redo toggle snake mode', async ({ page }) => {
    /* 
    Test case: Undo-Redo tests
    Description: Pressing Undo/Redo toggle snake mode.
    */
    await Library(page).switchToRNATab();
    await openFileAndAddToCanvasMacro(
      page,
      'KET/peptides-connected-with-bonds.ket',
    );
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await CommonTopLeftToolbar(page).undo();
    await takePageScreenshot(page);
    await CommonTopLeftToolbar(page).redo();
    await takeEditorScreenshot(page);
    await takePageScreenshot(page);
  });

  test('After creating a chain of Peptides and clicking multiple times "Undo" button to verify that the last actions are properly reversed', async ({
    page,
  }) => {
    /*
    Test case: Undo-Redo tests
    Description: Add ten monomers and connect them with bonds and undo 5 times then redo 5 times.
    */
    const monomerNames = [
      'Bal',
      'Edc',
      'dD',
      'dW',
      'meF',
      'Sar',
      'meI',
      'meK',
      'Nle',
      'meM',
      'Mhp',
      'Pen',
    ];
    await openFileAndAddToCanvasMacro(
      page,
      'KET/ten-peptides-not-connected.ket',
    );
    await connectMonomersWithBonds(page, monomerNames);
    const maxUndoHistorySize = 5;
    for (let i = 0; i < maxUndoHistorySize; i++) {
      await CommonTopLeftToolbar(page).undo();
    }
    await takeEditorScreenshot(page);

    const maxRedoHistorySize = 5;
    for (let i = 0; i < maxRedoHistorySize; i++) {
      await CommonTopLeftToolbar(page).redo();
    }
    await takeEditorScreenshot(page);
  });

  test('Check that after undoing and redoing all steps, Undo and Redo buttons turn gray', async ({
    page,
  }) => {
    /* 
    Test case: Undo-Redo tests
    Description: Undo and Redo buttons turn gray.
    The test is not working correctly because we have an unresolved bug. https://github.com/epam/ketcher/issues/3922
    */
    await Library(page).switchToRNATab();
    await takePageScreenshot(page);
    await Library(page).dragMonomerOnCanvas(Peptides.Edc, {
      x: 0,
      y: 0,
      fromCenter: true,
    });
    await CommonTopLeftToolbar(page).undo();
    await takePageScreenshot(page);
    await CommonTopLeftToolbar(page).redo();
    await takePageScreenshot(page);
  });

  test('Press Undo/Redo after copy/pasting Sugar-Base-Phosphate structure on canvas', async ({
    page,
  }) => {
    /* 
    Test case: Undo-Redo tests
    Description: Copy/Paste working as expected and Undo/Redo
    */
    const x = 200;
    const y = 200;
    await Library(page).dragMonomerOnCanvas(Presets.C, {
      x,
      y,
      fromCenter: true,
    });
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await page.mouse.move(x, y);
    await pasteFromClipboardByKeyboard(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).redo();
    await takeEditorScreenshot(page);
  });

  test('Verify the undo/redo functionality with ambiguous peptide (X) on the canvas', async ({
    page,
  }) => {
    /* 
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 12.1 Verify the undo/redo functionality with ambiguous peptide (X) on the canvas
    Case: 1. Put on the center of canvas ambiguous monomer from the library (peptide X)
          2. Take screenshot to make sure it is on canvas
          3. Select it
          4. Press Delete button
          5. Take screenshot to make sure canvas is empty
          6. Press Undo button
          7. Take screenshot to make sure it returned back
          8. Press Redo button
          9. Take screenshot to make sure it is on canvas
    */
    await Library(page).switchToRNATab();
    await Library(page).dragMonomerOnCanvas(Peptides.X, {
      x: -10,
      y: -10,
      fromCenter: true,
    });

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await zoomWithMouseWheel(page, -600);
    await takeEditorScreenshot(page);

    await clickOnCanvas(page, 0, 0, { from: 'pageCenter' });
    await CommonLeftToolbar(page).selectEraseTool();

    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).undo();

    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).redo();

    await takeEditorScreenshot(page);
    await zoomWithMouseWheel(page, 600);
  });

  test('Verify the undo/redo functionality with ambiguous Base (RNA_N) on the canvas', async ({
    page,
  }) => {
    /* 
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 12.2 Verify the undo/redo functionality with ambiguous Base (RNA_N) on the canvas
    Case: 1. Put on the center of canvas ambiguous monomer from the library (peptide X)
          2. Take screenshot to make sure it is on canvas
          3. Select it
          4. Press Delete button
          5. Take screenshot to make sure canvas is empty
          6. Press Undo button
          7. Take screenshot to make sure it returned back
          8. Press Redo button
          9. Take screenshot to make sure it is on canvas
    */
    await Library(page).switchToRNATab();
    await Library(page).dragMonomerOnCanvas(Bases.DNA_N, {
      x: -10,
      y: -10,
      fromCenter: true,
    });

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await zoomWithMouseWheel(page, -600);
    await takeEditorScreenshot(page);

    await clickOnCanvas(page, 0, 0, { from: 'pageCenter' });
    await CommonLeftToolbar(page).selectEraseTool();

    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).undo();

    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).redo();

    await takeEditorScreenshot(page);
    await zoomWithMouseWheel(page, 600);
  });
});
