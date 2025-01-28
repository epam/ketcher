import { Bases, Chem, Peptides } from '@constants/monomers';
import { test, expect } from '@playwright/test';
import {
  addSingleMonomerToCanvas,
  clickInTheMiddleOfTheScreen,
  getMolfile,
  moveMouseAway,
  openFileAndAddToCanvasAsNewProject,
  openFileAndAddToCanvasMacro,
  receiveFileComparisonData,
  saveToFile,
  selectEraseTool,
  selectPartOfMolecules,
  selectSnakeLayoutModeTool,
  takeEditorScreenshot,
  waitForPageInit,
  selectMonomer,
  clickOnTheCanvas,
  selectRectangleSelectionTool,
  selectAllStructuresOnCanvas,
  clickOnCanvas,
  selectMacroBond,
  selectZoomInTool,
  selectZoomOutTool,
} from '@utils';
import { MacroBondTool } from '@utils/canvas/tools/selectNestedTool/types';
import {
  hideMonomerPreview,
  turnOnMacromoleculesEditor,
  zoomWithMouseWheel,
} from '@utils/macromolecules';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
import { pressUndoButton } from '@utils/macromolecules/topToolBar';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
/* eslint-disable no-magic-numbers */

test.describe('Erase Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Delete monomer bonded with another monomers', async ({ page }) => {
    /* 
    Test case: #2370 - "Erase" tool for macromolecules editor
    Description: Erase Tool
    */

    // Create 4 peptides on canvas
    const MONOMER_NAME = Peptides.Tza;
    const MONOMER_ALIAS = 'Tza';

    const peptide1 = await addSingleMonomerToCanvas(
      page,
      MONOMER_NAME,
      MONOMER_ALIAS,
      300,
      300,
      0,
    );
    const peptide2 = await addSingleMonomerToCanvas(
      page,
      MONOMER_NAME,
      MONOMER_ALIAS,
      400,
      400,
      1,
    );
    const peptide3 = await addSingleMonomerToCanvas(
      page,
      MONOMER_NAME,
      MONOMER_ALIAS,
      500,
      500,
      2,
    );
    const peptide4 = await addSingleMonomerToCanvas(
      page,
      MONOMER_NAME,
      MONOMER_ALIAS,
      500,
      200,
      3,
    );

    // Select bond tool
    await selectMacroBond(page, MacroBondTool.SINGLE);

    // Create bonds between peptides
    await bondTwoMonomers(page, peptide1, peptide2);
    await bondTwoMonomers(page, peptide3, peptide2);
    await bondTwoMonomers(page, peptide3, peptide4);

    await takeEditorScreenshot(page);

    await selectEraseTool(page);

    // Delete peptide linked with two other peptides by bonds
    await peptide3.click();

    // Get rid of flakiness because of preview
    await hideMonomerPreview(page);

    await takeEditorScreenshot(page);
  });

  test('Check tooltip for a Erase button', async ({ page }) => {
    /* 
    Test case: Erase Tool
    Description: Erase button tooltip is located in the left toolbar.
    */
    const icon = {
      testId: 'erase',
      title: 'Erase (Del)',
    };
    const iconButton = page.getByTestId(icon.testId);
    await expect(iconButton).toHaveAttribute('title', icon.title);
    await iconButton.hover();
    expect(icon.title).toBeTruthy();
  });

  test('Check that RNA and its bonds are deleted when deleting monomer from RNA chain using Erase Tool', async ({
    page,
  }) => {
    /* 
    Test case: Erase Tool
    Description: RNA and its bonds are deleted when deleting monomer from RNA chain using Erase Tool.
    */
    await openFileAndAddToCanvasAsNewProject(
      `KET/rna-with-fmoe-sugar.ket`,
      page,
    );
    await selectEraseTool(page);
    await page.getByText('FMOE').locator('..').first().click();
    await takeEditorScreenshot(page);
  });

  test('Delete placed CHEM on canvas using Erase Tool', async ({ page }) => {
    /* 
    Test case: Erase Tool
    Description: CHEM is deleted.
    */
    await selectMonomer(page, Chem.Test_6_Ch);
    await clickInTheMiddleOfTheScreen(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await selectEraseTool(page);
    await page.getByText('Test-6-Ch').locator('..').first().click();
    await takeEditorScreenshot(page);
  });

  test('Delete bond between two CHEMs on canvas using Erase Tool', async ({
    page,
  }) => {
    /* 
    Test case: Erase Tool
    Description: Bond between two CHEMs are deleted.
    */
    const bondLine = await page.locator('g[pointer-events="stroke"]').first();
    await openFileAndAddToCanvasAsNewProject(
      `KET/two-chems-connected.ket`,
      page,
    );
    await takeEditorScreenshot(page);
    await selectEraseTool(page);
    await bondLine.locator('..').click();
    await takeEditorScreenshot(page);
  });

  test('Delete bond between two CHEMs on canvas using Erase Tool and check that it restored after pressing Undo ', async ({
    page,
  }) => {
    /* 
    Test case: Erase Tool
    Description: Bond between two CHEMs are deleted and restored.
    */
    const bondLine = await page.locator('g[pointer-events="stroke"]').first();
    await openFileAndAddToCanvasAsNewProject(
      `KET/two-chems-connected.ket`,
      page,
    );
    await selectEraseTool(page);
    await bondLine.locator('..').click();
    await takeEditorScreenshot(page);
    await pressUndoButton(page);
    await takeEditorScreenshot(page);
  });

  test('Delete structure by clicking Erase tool button after selecting with short key "Control + A"', async ({
    page,
  }) => {
    /* 
    Test case: Erase Tool
    Description: Structure deleted.
    */
    await openFileAndAddToCanvasAsNewProject(
      `KET/rna-with-fmoe-sugar.ket`,
      page,
    );
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await selectEraseTool(page);
    await takeEditorScreenshot(page);
  });

  test('Check that CHEM and its bonds are deleted when deleting using Erase Tool', async ({
    page,
  }) => {
    /* 
    Test case: Erase Tool
    Description: Bonds and CHEN are deleted.
    */
    await openFileAndAddToCanvasAsNewProject(`KET/chems-connected.ket`, page);
    await takeEditorScreenshot(page);
    await selectEraseTool(page);
    await page.getByText('A6OH').locator('..').first().click();
    await takeEditorScreenshot(page);
  });

  test('Check erasing by use short key "Delete"', async ({ page }) => {
    /* 
    Test case: Erase Tool
    Description: Structures are deleted from canvas.
    */
    await openFileAndAddToCanvasAsNewProject(
      `KET/peptides-flex-chain.ket`,
      page,
    );
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await page.keyboard.press('Delete');
    await takeEditorScreenshot(page);
  });

  test('Check erasing part of structure by use short key "Delete"', async ({
    page,
  }) => {
    /* 
    Test case: Erase Tool
    Description: Part of structures are deleted from canvas.
    */
    await openFileAndAddToCanvasAsNewProject(
      `KET/peptides-flex-chain.ket`,
      page,
    );
    await takeEditorScreenshot(page);
    await selectPartOfMolecules(page);
    await page.keyboard.press('Delete');
    await takeEditorScreenshot(page);
  });

  test('Check that deleted entity from the middle of chain restored after pressing Undo', async ({
    page,
  }) => {
    /* 
    Test case: Erase Tool
    Description: Deleted entity from the middle of chain restored after pressing Undo.
    */
    await openFileAndAddToCanvasAsNewProject(`KET/chems-connected.ket`, page);
    await selectEraseTool(page);
    await page.getByText('A6OH').locator('..').first().click();
    await takeEditorScreenshot(page);
    await pressUndoButton(page);
    await takeEditorScreenshot(page);
  });

  test('Check if you delete one part of chain and click Undo button elements will return to the same place', async ({
    page,
  }) => {
    /* 
    Test case: Snake Mode
    Description: Elements return to the same place.
    */
    await openFileAndAddToCanvasAsNewProject(
      `KET/peptides-flex-chain.ket`,
      page,
    );
    await selectPartOfMolecules(page);
    await selectEraseTool(page);
    await takeEditorScreenshot(page);
    await pressUndoButton(page);
    await takeEditorScreenshot(page);
  });

  test('Check if you delete one part of RNA chain and click Undo button elements will return to the same place', async ({
    page,
  }) => {
    /* 
    Test case: Snake Mode
    Description: Elements of RNA chain returns to the same place.
    */
    await openFileAndAddToCanvasAsNewProject(
      `Molfiles-V3000/rna-modified-sugars.mol`,
      page,
    );
    await selectSnakeLayoutModeTool(page);
    await selectPartOfMolecules(page);
    await selectEraseTool(page);
    await takeEditorScreenshot(page);
    await pressUndoButton(page);
    await takeEditorScreenshot(page);
  });

  test('Click on canvas with selected Erase Tool not erase monomers on canvas', async ({
    page,
  }) => {
    /* 
    Test case: Erase Tool
    Description: Monomers are not deleted.
    */
    const x = 100;
    const y = 100;
    await openFileAndAddToCanvasAsNewProject(
      `KET/peptides-flex-chain.ket`,
      page,
    );
    await selectEraseTool(page);
    await clickOnCanvas(page, x, y);
    await takeEditorScreenshot(page);
  });

  test('Check Zoom In/Zoom Out while using erase tool', async ({ page }) => {
    /* 
    Test case: Erase Tool
    Description: Monomers are deleted.
    */
    await openFileAndAddToCanvasAsNewProject(
      `KET/peptides-flex-chain.ket`,
      page,
    );
    await selectEraseTool(page);
    await selectZoomInTool(page, 5);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByText('Bal').locator('..').first().click();
    await takeEditorScreenshot(page);
    await selectZoomOutTool(page, 8);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByText('D-2Nal').locator('..').first().click();
    await takeEditorScreenshot(page);
  });

  test('Chceck that using Erase Tool on empty canvas not cause any errors in DevTool Console', async ({
    page,
  }) => {
    /* 
    Test case: Erase Tool
    Description: Erase Tool on empty canvas not cause any errors in DevTool Console.
    */
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        test.fail(
          msg.type() === 'error',
          `There is error in console: ${msg.text}`,
        );
      }
    });
    await selectEraseTool(page);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Erasing some parts of monomer structure, save it to .ket file and then open it', async ({
    page,
  }) => {
    /* 
    Test case: Erase Tool
    Description: After erasing some parts of monomers structure, saved it to .ket file and then opened 
    erased portions are not reflected in opened file.
    */
    await openFileAndAddToCanvasMacro('KET/peptides-flex-chain.ket', page);
    await selectEraseTool(page);
    await page.getByText('Bal').locator('..').first().click();
    await page.getByText('D-2Nal').locator('..').first().click();

    await verifyFileExport(
      page,
      'KET/peptides-flex-chain-expected.ket',
      FileType.KET,
    );

    await openFileAndAddToCanvasMacro(
      'KET/peptides-flex-chain-expected.ket',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Erasing some parts of monomer structure, save it to .mol file and then open it', async ({
    page,
  }) => {
    /* 
    Test case: Erase Tool
    Description: After erasing some parts of monomers structure, saved it to .ket file and then opened 
    erased portions are not reflected in opened file.
    */
    await openFileAndAddToCanvasMacro('KET/peptides-flex-chain.ket', page);
    await selectEraseTool(page);
    await page.getByText('Bal').locator('..').first().click();
    await page.getByText('D-2Nal').locator('..').first().click();
    await verifyFileExport(
      page,
      'Molfiles-V3000/peptides-flex-chain-expected.mol',
      FileType.MOL,
      'v3000',
      [1],
    );
    await openFileAndAddToCanvasMacro(
      'Molfiles-V3000/peptides-flex-chain-expected.mol',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Verify the deletion of ambiguous peptide (X) from the canvas (by Erase tool)', async ({
    page,
  }) => {
    /* 
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 10.1 Verify the deletion of ambiguous monomers from the canvas (by Erase tool) 
    Case: 1. Put on the center of canvas ambiguous monomer from the library (peptide X)
          2. Take screenshot to make sure it is on canvas
          3. Select it
          4. Press Delete tool
          5. Take screenshot to make sure canvas is empty
    */
    await selectMonomer(page, Peptides.X);
    await clickOnTheCanvas(page, 0, 0);

    await selectRectangleSelectionTool(page);
    await zoomWithMouseWheel(page, -600);
    await takeEditorScreenshot(page);

    await zoomWithMouseWheel(page, 600);
    await clickOnTheCanvas(page, 0, 0);
    await selectEraseTool(page);

    await takeEditorScreenshot(page);
  });

  test('Verify the deletion of ambiguous base (DNA_N) from the canvas (by Erase tool)', async ({
    page,
  }) => {
    /* 
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 10.2 Verify the deletion of ambiguous monomers from the canvas (by Erase tool) 
    Case: 1. Put on the center of canvas ambiguous monomer from the library (peptide DNA_N)
          2. Take screenshot to make sure it is on canvas
          3. Select it
          4. Press Delete tool
          5. Take screenshot to make sure canvas is empty
    */
    await selectMonomer(page, Bases.DNA_N);
    await clickOnTheCanvas(page, 0, 0);

    await selectRectangleSelectionTool(page);
    await zoomWithMouseWheel(page, -600);
    await takeEditorScreenshot(page);

    await zoomWithMouseWheel(page, 600);
    await clickOnTheCanvas(page, 0, 0);
    await selectEraseTool(page);

    await takeEditorScreenshot(page);
  });

  test('Verify the deletion of ambiguous peptide (Z) from the canvas (by Del hotkey)', async ({
    page,
  }) => {
    /* 
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 11.1 Verify the deletion of ambiguous monomers from the canvas (by Erase tool) 
    Case: 1. Put on the center of canvas ambiguous monomer from the library (peptide Z)
          2. Take screenshot to make sure it is on canvas
          3. Select it
          4. Press Del key
          5. Take screenshot to make sure canvas is empty
    */
    await selectMonomer(page, Peptides.Z);
    await clickOnTheCanvas(page, 0, 0);

    await selectRectangleSelectionTool(page);
    await zoomWithMouseWheel(page, -600);
    await takeEditorScreenshot(page);

    await zoomWithMouseWheel(page, 600);
    await clickOnTheCanvas(page, 0, 0);
    await page.keyboard.press('Delete');

    await takeEditorScreenshot(page);
  });

  test('Verify the deletion of ambiguous base (RNA_N) from the canvas (by Del hotkey)', async ({
    page,
  }) => {
    /* 
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 11.2 Verify the deletion of ambiguous monomers from the canvas (by Erase tool) 
    Case: 1. Put on the center of canvas ambiguous monomer from the library (peptide RNA_N)
          2. Take screenshot to make sure it is on canvas
          3. Select it
          4. Press Del key
          5. Take screenshot to make sure canvas is empty
    */
    await selectMonomer(page, Bases.RNA_N);
    await clickOnTheCanvas(page, 0, 0);

    await selectRectangleSelectionTool(page);
    await zoomWithMouseWheel(page, -600);
    await takeEditorScreenshot(page);

    await zoomWithMouseWheel(page, 600);
    await clickOnTheCanvas(page, 0, 0);
    await page.keyboard.press('Delete');

    await takeEditorScreenshot(page);
  });
});
