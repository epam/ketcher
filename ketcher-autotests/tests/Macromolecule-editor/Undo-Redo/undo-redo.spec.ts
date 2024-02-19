import { Locator, test } from '@playwright/test';
import {
  addSingleMonomerToCanvas,
  clickInTheMiddleOfTheScreen,
  clickRedo,
  clickUndo,
  dragMouseTo,
  hideMonomerPreview,
  openFileAndAddToCanvas,
  selectRectangleArea,
  selectSingleBondTool,
  selectSnakeLayoutModeTool,
  takeEditorScreenshot,
  takeLeftToolbarMacromoleculeScreenshot,
  turnOnMacromoleculesEditor,
  waitForPageInit,
} from '@utils';
import {
  connectMonomersWithBonds,
  moveMonomer,
} from '@utils/macromolecules/monomer';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
/* eslint-disable no-magic-numbers */

test.describe('Undo Redo', () => {
  let peptide1: Locator;
  let peptide2: Locator;
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
    const MONOMER_NAME = 'Tza___3-thiazolylalanine';
    const MONOMER_ALIAS = 'Tza';

    peptide1 = await addSingleMonomerToCanvas(
      page,
      MONOMER_NAME,
      MONOMER_ALIAS,
      300,
      300,
      0,
    );
    peptide2 = await addSingleMonomerToCanvas(
      page,
      MONOMER_NAME,
      MONOMER_ALIAS,
      400,
      300,
      1,
    );
    const peptide3 = await addSingleMonomerToCanvas(
      page,
      MONOMER_NAME,
      MONOMER_ALIAS,
      500,
      300,
      2,
    );

    // Select bond tool
    await selectSingleBondTool(page);

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
    await clickRedo(page);
    await clickRedo(page);

    // check undo
    await clickUndo(page);
    await clickUndo(page);
    await takeEditorScreenshot(page);

    // check that history pointer stops on first operation
    await clickUndo(page);
    await clickUndo(page);
    await clickUndo(page);
    await clickUndo(page);
    await clickUndo(page);

    // check redo
    await clickRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo redo for snake mode layout', async ({ page }) => {
    /*
    Description: Add monomers and bonds, activate snake mode and do undo redo
    */

    await selectSnakeLayoutModeTool(page);
    await clickUndo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo redo for monomers movement', async ({ page }) => {
    /*
    Description: Move monomers and do undo redo
    */

    await moveMonomer(page, peptide1, 500, 500);
    await moveMonomer(page, peptide2, 600, 600);
    await moveMonomer(page, peptide2, 400, 400);
    await clickUndo(page);
    await clickUndo(page);
    await takeEditorScreenshot(page);
    await clickRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo redo for imported structure', async ({ page }) => {
    await openFileAndAddToCanvas(
      'KET/peptide-enumeration-one-two-three.ket',
      page,
    );
    await openFileAndAddToCanvas(
      'KET/peptide-enumeration-one-two-three.ket',
      page,
    );
    await clickUndo(page);
    await takeEditorScreenshot(page);

    const startX = 100;
    const startY = 100;
    const endX = 900;
    const endY = 900;
    await selectRectangleArea(page, startX, startY, endX, endY);

    const coords = { x: 840, y: 470 };
    await page.mouse.move(coords.x, coords.y);

    await dragMouseTo(coords.x + 100, coords.y + 100, page);
    await takeEditorScreenshot(page);
  });
});

test.describe('Undo-Redo tests', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Deleting entities(Peptides, RNA, CHEM, Bonds) and then checking Undo and Redo actions', async ({
    page,
  }) => {
    /* 
    Test case: Undo-Redo tests
    Description: Entities(Peptides, RNA, CHEM, Bonds) are deleted and then Undo and Redo actions.
    */
    await openFileAndAddToCanvas('KET/all-entities.ket', page);
    await page.getByTestId('erase').click();
    const entitiesToDelete = [
      'D-aIle',
      'SertBu',
      'Phe-ol',
      'TyrabD',
      '25R',
      'c3A',
      'msp',
      'cpmA',
      'SMPEG2',
    ];

    for (const entity of entitiesToDelete) {
      await page.getByText(entity).locator('..').first().click();
    }

    const numberOfPress = 9;

    for (let i = 0; i < numberOfPress; i++) {
      await page.getByTestId('undo').click();
    }
    await takeEditorScreenshot(page);

    for (let i = 0; i < numberOfPress; i++) {
      await page.getByTestId('redo').click();
    }
    await takeEditorScreenshot(page);
  });

  test('Track 32 steps (Undo,Redo action)', async ({ page }) => {
    /*
    Test case: Undo-Redo tests
    Description: Add 'Bal___beta-Alanine' monomer to canvas 35 times and then press Undo 32 times.
    */

    const addMonomers = async (x: number, y: number) => {
      await page.getByTestId('Bal___beta-Alanine').click();
      await page.mouse.click(x, y);
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
      await page.getByTestId('undo').click();
    }
    await takeEditorScreenshot(page);

    const maxRedoHistorySize = 32;
    for (let i = 0; i < maxRedoHistorySize; i++) {
      await page.getByTestId('redo').click();
    }
    await takeEditorScreenshot(page);
  });

  test('Track 32 steps for CHEMs (Undo,Redo action)', async ({ page }) => {
    /*
    Test case: Undo-Redo tests
    Description: Add 'SMPEG2___SM(PEG)2 linker from Pierce' CHEM to canvas 35 times and then press Undo 32 times.
    */

    const addMonomers = async (x: number, y: number) => {
      await page.getByTestId('CHEM-TAB').click();
      await page.getByTestId('SMPEG2___SM(PEG)2 linker from Pierce').click();
      await page.mouse.click(x, y);
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
      await page.getByTestId('undo').click();
    }
    await takeEditorScreenshot(page);

    const maxRedoHistorySize = 32;
    for (let i = 0; i < maxRedoHistorySize; i++) {
      await page.getByTestId('redo').click();
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
    await openFileAndAddToCanvas('KET/all-entities.ket', page);
    await page.getByTestId('erase').click();
    const entitiesToDelete = [
      'SertBu',
      'TyrabD',
      '25R',
      'c3A',
      'msp',
      'SMPEG2',
    ];

    for (const entity of entitiesToDelete) {
      await page.getByText(entity).locator('..').first().click();
    }

    const numberOfPress = 6;

    for (let i = 0; i < numberOfPress; i++) {
      await page.keyboard.press('Control+z');
    }
    await takeEditorScreenshot(page);

    for (let i = 0; i < numberOfPress; i++) {
      await page.keyboard.press('Control+y');
    }
    await takeEditorScreenshot(page);
  });

  test('Press Undo/Redo after opening  a .ket file with monomers', async ({
    page,
  }) => {
    /* 
    Test case: Undo-Redo tests
    Description: Undo/Redo after opening  a .ket file is working.
    */
    await openFileAndAddToCanvas('KET/all-entities.ket', page);
    await page.getByTestId('undo').click();
    await takeEditorScreenshot(page);
    await page.getByTestId('redo').click();
    await takeEditorScreenshot(page);
  });

  test('Press Undo/Redo after opening  a .mol file with monomers', async ({
    page,
  }) => {
    /* 
    Test case: Undo-Redo tests
    Description: Undo/Redo after opening  a .mol file is working.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V3000/monomers-connected-with-bonds.mol',
      page,
    );
    await page.getByTestId('undo').click();
    await takeEditorScreenshot(page);
    await page.getByTestId('redo').click();
    await takeEditorScreenshot(page);
  });

  test('Check that undo/redo toggle snake mode', async ({ page }) => {
    /* 
    Test case: Undo-Redo tests
    Description: Pressing Undo/Redo toggle snake mode.
    */
    await openFileAndAddToCanvas('KET/peptides-connected-with-bonds.ket', page);
    await selectSnakeLayoutModeTool(page);
    await page.getByTestId('undo').click();
    await takeEditorScreenshot(page);
    await takeLeftToolbarMacromoleculeScreenshot(page);
    await page.getByTestId('redo').click();
    await takeEditorScreenshot(page);
    await takeLeftToolbarMacromoleculeScreenshot(page);
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
    await openFileAndAddToCanvas('KET/ten-peptides-not-connected.ket', page);
    await connectMonomersWithBonds(page, monomerNames);
    const maxUndoHistorySize = 5;
    for (let i = 0; i < maxUndoHistorySize; i++) {
      await page.getByTestId('undo').click();
    }
    await takeEditorScreenshot(page);

    const maxRedoHistorySize = 5;
    for (let i = 0; i < maxRedoHistorySize; i++) {
      await page.getByTestId('redo').click();
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
    await takeLeftToolbarMacromoleculeScreenshot(page);
    await page.getByTestId('Edc___S-ethylthiocysteine').click();
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('undo').click();
    await takeLeftToolbarMacromoleculeScreenshot(page);
    await page.getByTestId('redo').click();
    await takeLeftToolbarMacromoleculeScreenshot(page);
  });
});
