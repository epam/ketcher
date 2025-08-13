import { test, expect } from '@playwright/test';
import {
  addSingleMonomerToCanvas,
  clickInTheMiddleOfTheScreen,
  moveMouseAway,
  openFileAndAddToCanvasAsNewProject,
  openFileAndAddToCanvasMacro,
  selectPartOfMolecules,
  takeEditorScreenshot,
  waitForPageInit,
  clickOnCanvas,
  MolFileFormat,
  deleteByKeyboard,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import { hideMonomerPreview, zoomWithMouseWheel } from '@utils/macromolecules';
import {
  bondTwoMonomers,
  getBondLocator,
} from '@utils/macromolecules/polymerBond';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { Peptides } from '@constants/monomers/Peptides';
import { Chem } from '@constants/monomers/Chem';
import { Bases } from '@constants/monomers/Bases';
import { Sugars } from '@constants/monomers/Sugars';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import {
  MacroBondDataIds,
  MacroBondType,
} from '@tests/pages/constants/bondSelectionTool/Constants';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
/* eslint-disable no-magic-numbers */

test.describe('Erase Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await Library(page).switchToPeptidesTab();
  });

  test('Delete monomer bonded with another monomers', async ({ page }) => {
    /* 
    Test case: #2370 - "Erase" tool for macromolecules editor
    Description: Erase Tool
    */

    // Create 4 peptides on canvas
    const peptide1 = await addSingleMonomerToCanvas(
      page,
      Peptides.Tza,
      300,
      300,
      0,
    );
    const peptide2 = await addSingleMonomerToCanvas(
      page,
      Peptides.Tza,
      400,
      400,
      1,
    );
    const peptide3 = await addSingleMonomerToCanvas(
      page,
      Peptides.Tza,
      500,
      500,
      2,
    );
    const peptide4 = await addSingleMonomerToCanvas(
      page,
      Peptides.Tza,
      500,
      200,
      3,
    );

    // Select bond tool
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);

    // Create bonds between peptides
    await bondTwoMonomers(page, peptide1, peptide2);
    await bondTwoMonomers(page, peptide3, peptide2);
    await bondTwoMonomers(page, peptide3, peptide4);

    await takeEditorScreenshot(page);

    await CommonLeftToolbar(page).selectEraseTool();

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
    const iconButton = page
      .getByTestId(icon.testId)
      .filter({ has: page.locator(':visible') });
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
      page,
      `KET/rna-with-fmoe-sugar.ket`,
    );
    await CommonLeftToolbar(page).selectEraseTool();
    await getMonomerLocator(page, Sugars.FMOE).click();
    await takeEditorScreenshot(page);
  });

  test('Delete placed CHEM on canvas using Erase Tool', async ({ page }) => {
    /* 
    Test case: Erase Tool
    Description: CHEM is deleted.
    */
    await Library(page).dragMonomerOnCanvas(Chem.Test_6_Ch, {
      x: 0,
      y: 0,
      fromCenter: true,
    });
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await CommonLeftToolbar(page).selectEraseTool();
    await getMonomerLocator(page, Chem.Test_6_Ch).click();
    await takeEditorScreenshot(page);
  });

  test('Delete bond between two CHEMs on canvas using Erase Tool', async ({
    page,
  }) => {
    /* 
    Test case: Erase Tool
    Description: Bond between two CHEMs are deleted.
    */
    const bondLine = getBondLocator(page, {
      bondType: MacroBondDataIds.Single,
    }).first();
    await openFileAndAddToCanvasAsNewProject(
      page,
      `KET/two-chems-connected.ket`,
    );
    await takeEditorScreenshot(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await bondLine.click({ force: true });
    await takeEditorScreenshot(page);
  });

  test('Delete bond between two CHEMs on canvas using Erase Tool and check that it restored after pressing Undo ', async ({
    page,
  }) => {
    /* 
    Test case: Erase Tool
    Description: Bond between two CHEMs are deleted and restored.
    */
    const bondLine = page.locator('g[pointer-events="stroke"]').first();
    await openFileAndAddToCanvasAsNewProject(
      page,
      `KET/two-chems-connected.ket`,
    );
    await CommonLeftToolbar(page).selectEraseTool();
    await bondLine.click();
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).undo();
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
      page,
      `KET/rna-with-fmoe-sugar.ket`,
    );
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await takeEditorScreenshot(page);
  });

  test('Check that CHEM and its bonds are deleted when deleting using Erase Tool', async ({
    page,
  }) => {
    /* 
    Test case: Erase Tool
    Description: Bonds and CHEN are deleted.
    */
    await openFileAndAddToCanvasAsNewProject(page, `KET/chems-connected.ket`);
    await takeEditorScreenshot(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await getMonomerLocator(page, Chem.A6OH).click();
    await takeEditorScreenshot(page);
  });

  test('Check erasing by use short key "Delete"', async ({ page }) => {
    /* 
    Test case: Erase Tool
    Description: Structures are deleted from canvas.
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      `KET/peptides-flex-chain.ket`,
    );
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await deleteByKeyboard(page);
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
      page,
      `KET/peptides-flex-chain.ket`,
    );
    await takeEditorScreenshot(page);
    await selectPartOfMolecules(page);
    await deleteByKeyboard(page);
    await takeEditorScreenshot(page);
  });

  test('Check that deleted entity from the middle of chain restored after pressing Undo', async ({
    page,
  }) => {
    /* 
    Test case: Erase Tool
    Description: Deleted entity from the middle of chain restored after pressing Undo.
    */
    await openFileAndAddToCanvasAsNewProject(page, `KET/chems-connected.ket`);
    await CommonLeftToolbar(page).selectEraseTool();
    await getMonomerLocator(page, Chem.A6OH).click();
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).undo();
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
      page,
      `KET/peptides-flex-chain.ket`,
    );
    await selectPartOfMolecules(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).undo();
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
      page,
      `Molfiles-V3000/rna-modified-sugars.mol`,
    );
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await selectPartOfMolecules(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).undo();
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
      page,
      `KET/peptides-flex-chain.ket`,
    );
    await CommonLeftToolbar(page).selectEraseTool();
    await clickOnCanvas(page, x, y);
    await takeEditorScreenshot(page);
  });

  test('Check Zoom In/Zoom Out while using erase tool', async ({ page }) => {
    /* 
    Test case: Erase Tool
    Description: Monomers are deleted.
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      `KET/peptides-flex-chain.ket`,
    );
    await CommonLeftToolbar(page).selectEraseTool();
    await CommonTopRightToolbar(page).selectZoomInTool(5);
    await clickInTheMiddleOfTheScreen(page);
    await getMonomerLocator(page, Peptides.Bal).click();
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).selectZoomOutTool(8);
    await clickInTheMiddleOfTheScreen(page);
    await getMonomerLocator(page, Peptides.D_2Nal).click();
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
    await CommonLeftToolbar(page).selectEraseTool();
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
    await openFileAndAddToCanvasMacro(page, 'KET/peptides-flex-chain.ket');
    await CommonLeftToolbar(page).selectEraseTool();
    await getMonomerLocator(page, Peptides.Bal).click();
    await getMonomerLocator(page, Peptides.D_2Nal).click();

    await verifyFileExport(
      page,
      'KET/peptides-flex-chain-expected.ket',
      FileType.KET,
    );

    await CommonTopLeftToolbar(page).clearCanvas();

    await openFileAndAddToCanvasMacro(
      page,
      'KET/peptides-flex-chain-expected.ket',
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
    await openFileAndAddToCanvasMacro(page, 'KET/peptides-flex-chain.ket');
    await CommonLeftToolbar(page).selectEraseTool();
    await getMonomerLocator(page, Peptides.Bal).click();
    await getMonomerLocator(page, Peptides.D_2Nal).click();
    await verifyFileExport(
      page,
      'Molfiles-V3000/peptides-flex-chain-expected.mol',
      FileType.MOL,
      MolFileFormat.v3000,
    );

    await CommonTopLeftToolbar(page).clearCanvas();

    await openFileAndAddToCanvasMacro(
      page,
      'Molfiles-V3000/peptides-flex-chain-expected.mol',
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

    await zoomWithMouseWheel(page, 600);
    await clickOnCanvas(page, 0, 0, { from: 'pageCenter' });
    await CommonLeftToolbar(page).selectEraseTool();

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

    await zoomWithMouseWheel(page, 600);
    await clickOnCanvas(page, 0, 0, { from: 'pageCenter' });
    await CommonLeftToolbar(page).selectEraseTool();

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
    await Library(page).dragMonomerOnCanvas(Peptides.Z, {
      x: -10,
      y: -10,
      fromCenter: true,
    });

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await zoomWithMouseWheel(page, -600);
    await takeEditorScreenshot(page);

    await zoomWithMouseWheel(page, 600);
    await clickOnCanvas(page, 0, 0, { from: 'pageCenter' });
    await deleteByKeyboard(page);

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
    await Library(page).dragMonomerOnCanvas(Bases.RNA_N, {
      x: -10,
      y: -10,
      fromCenter: true,
    });

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await zoomWithMouseWheel(page, -600);
    await takeEditorScreenshot(page);

    await zoomWithMouseWheel(page, 600);
    await clickOnCanvas(page, 0, 0, { from: 'pageCenter' });
    await deleteByKeyboard(page);

    await takeEditorScreenshot(page);
  });
});
