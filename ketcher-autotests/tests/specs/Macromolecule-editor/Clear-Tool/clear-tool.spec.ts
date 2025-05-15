import { Peptides } from '@constants/monomers/Peptides';
import { test, expect } from '@playwright/test';
import {
  addSingleMonomerToCanvas,
  openFileAndAddToCanvasAsNewProject,
  selectPartOfMolecules,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import {} from '@utils/macromolecules';
import { goToPeptidesTab } from '@utils/macromolecules/library';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { TopLeftToolbar } from '@tests/pages/common/TopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/TopRightToolbar';
/* eslint-disable no-magic-numbers */

test.describe('Clear Canvas Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await goToPeptidesTab(page);
  });

  test('Clear canvas with monomer bonded with another monomers', async ({
    page,
  }) => {
    /* 
    Description: Clear Tool
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

    // Get rid of flakiness because of preview
    const coords = [100, 100];
    await page.mouse.move(coords[0], coords[1]);

    await takeEditorScreenshot(page);

    // Click Clear Canvas Tool
    await TopLeftToolbar(page).clearCanvas();

    await takeEditorScreenshot(page);
  });

  test('Check tooltip for a Clear canvas button', async ({ page }) => {
    /* 
    Test case: Clear canvas Tool
    Description: Clear canvas button tooltip is located in the left toolbar.
    */
    const icon = {
      testId: 'clear-canvas',
      title: 'Clear Canvas (Ctrl+Del)',
    };
    const iconButton = page
      .getByTestId(icon.testId)
      .filter({ has: page.locator(':visible') });
    await expect(iconButton).toHaveAttribute('title', icon.title);
    await iconButton.hover();
    expect(icon.title).toBeTruthy();
  });

  test('Check clearing canvas by use short key "CTRL+Delete"', async ({
    page,
  }) => {
    /* 
    Test case: Clear canvas Tool
    Description: Canvas cleared.
    */
    await openFileAndAddToCanvasAsNewProject(
      `KET/peptides-flex-chain.ket`,
      page,
    );
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+Delete');
    await takeEditorScreenshot(page);
  });

  test('Press Clear canvas after loading .mol file containing monomers structure (i.e. arter open .mol file)', async ({
    page,
  }) => {
    /* 
    Test case: Clear canvas Tool
    Description: Canvas cleared.
    */
    await openFileAndAddToCanvasAsNewProject(
      `Molfiles-V3000/monomers-and-chem.mol`,
      page,
    );
    await takeEditorScreenshot(page);
    await TopLeftToolbar(page).clearCanvas();
    await takeEditorScreenshot(page);
  });

  test('Chceck that using Clear canvas Tool on empty canvas not cause any errors in DevTool Console', async ({
    page,
  }) => {
    /* 
    Test case: Clear canvas Tool
    Description: Clear canvas Tool on empty canvas not cause any errors in DevTool Console.
    */
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        test.fail(
          msg.type() === 'error',
          `There is error in console: ${msg.text}`,
        );
      }
    });
    await TopLeftToolbar(page).clearCanvas();
  });

  test('Check that after creating a monomer structure and click Clear Canvas button and then Undo structure back for same place', async ({
    page,
  }) => {
    /* 
    Test case: Clear canvas Tool
    Description: After click Undo structure back for same place.
    */
    await openFileAndAddToCanvasAsNewProject(`KET/chems-connected.ket`, page);
    await TopLeftToolbar(page).clearCanvas();
    await takeEditorScreenshot(page);
    await TopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
  });

  test('Check that after creating and deleting a structure with the Clear Canvas button, the Undo/Redo functionality works properly', async ({
    page,
  }) => {
    /* 
    Test case: Clear canvas Tool
    Description: Undo/Redo functionality works properly.
    */
    await openFileAndAddToCanvasAsNewProject(`KET/chems-connected.ket`, page);
    await TopLeftToolbar(page).clearCanvas();
    await takeEditorScreenshot(page);
    await TopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
    await TopLeftToolbar(page).redo();
    await takeEditorScreenshot(page);
  });

  test('Check that after creating monomer structure and then select part of it (Selection Tool) and then click Clear Canvas button all structure is deleted', async ({
    page,
  }) => {
    /* 
    Test case: Clear canvas Tool
    Description: All structure is deleted.
    */
    await openFileAndAddToCanvasAsNewProject(
      `KET/peptides-flex-chain.ket`,
      page,
    );
    await selectPartOfMolecules(page);
    await takeEditorScreenshot(page);
    await TopLeftToolbar(page).clearCanvas();
    await takeEditorScreenshot(page);
  });

  test('Adding structure on canvas, switching to Molecules and use Clear canvas button when you switch back to Macromonecules structure is still deleted from canvas', async ({
    page,
  }) => {
    /* 
    Test case: Clear canvas Tool
    Description: When you switch back to Macromonecules structure is still deleted from canvas.
    */
    await openFileAndAddToCanvasAsNewProject(
      `KET/peptides-flex-chain.ket`,
      page,
    );
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await TopLeftToolbar(page).clearCanvas();
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await takeEditorScreenshot(page);
  });
});
