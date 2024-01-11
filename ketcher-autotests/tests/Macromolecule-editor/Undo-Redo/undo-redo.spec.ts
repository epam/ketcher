import { Locator, test } from '@playwright/test';
import {
  addMonomerToCanvas,
  clickRedo,
  clickUndo,
  dragMouseTo,
  openFileAndAddToCanvas,
  selectRectangleArea,
  selectSingleBondTool,
  selectSnakeBondTool,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import {
  hideMonomerPreview,
  turnOnMacromoleculesEditor,
} from '@utils/macromolecules';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
import { moveMonomer } from '@utils/macromolecules/monomer';
/* eslint-disable no-magic-numbers */

test.describe('Undo Redo', () => {
  let peptide1: Locator;
  let peptide2: Locator;
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
    const MONOMER_NAME = 'Tza___3-thiazolylalanine';
    const MONOMER_ALIAS = 'Tza';

    peptide1 = await addMonomerToCanvas(
      page,
      MONOMER_NAME,
      MONOMER_ALIAS,
      300,
      300,
      0,
    );
    peptide2 = await addMonomerToCanvas(
      page,
      MONOMER_NAME,
      MONOMER_ALIAS,
      400,
      300,
      1,
    );
    const peptide3 = await addMonomerToCanvas(
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

    await selectSnakeBondTool(page);
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
