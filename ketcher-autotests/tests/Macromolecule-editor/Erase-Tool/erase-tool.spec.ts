import { test, expect } from '@playwright/test';
import {
  addSingleMonomerToCanvas,
  clickInTheMiddleOfTheScreen,
  getKet,
  getMolfile,
  moveMouseAway,
  openFileAndAddToCanvasAsNewProject,
  openFileAndAddToCanvasMacro,
  receiveFileComparisonData,
  saveToFile,
  selectEraseTool,
  selectPartOfMolecules,
  selectSingleBondTool,
  selectSnakeLayoutModeTool,
  takeEditorScreenshot,
  waitForPageInit,
  waitForRender,
} from '@utils';
import {
  hideMonomerPreview,
  turnOnMacromoleculesEditor,
} from '@utils/macromolecules';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
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
    const MONOMER_NAME = 'Tza___3-thiazolylalanine';
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
    await selectSingleBondTool(page);

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
    await page.getByTestId('CHEM-TAB').click();
    await page.getByTestId('Test-6-Ch___Test-6-AP-Chem').click();
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
    await page.getByTestId('undo').click();
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
    await page.keyboard.press('Control+a');
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
    await page.keyboard.press('Control+a');
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
    await page.getByTestId('undo').click();
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
    await page.getByTestId('undo').click();
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
    await page.getByTestId('undo').click();
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
    await page.mouse.click(x, y);
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
    await page.getByTestId('zoom-selector').click();
    for (let i = 0; i < 5; i++) {
      await waitForRender(page, async () => {
        await page.getByTestId('zoom-in-button').click();
      });
    }
    await clickInTheMiddleOfTheScreen(page);
    await page.getByText('Bal').locator('..').first().click();
    await takeEditorScreenshot(page);
    await page.getByTestId('zoom-selector').click();
    for (let i = 0; i < 8; i++) {
      await waitForRender(page, async () => {
        await page.getByTestId('zoom-out-button').click();
      });
    }
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
    const expectedFile = await getKet(page);
    await saveToFile('KET/peptides-flex-chain-expected.ket', expectedFile);

    const { fileExpected: ketFileExpected, file: ketFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/KET/peptides-flex-chain-expected.ket',
      });
    expect(ketFile).toEqual(ketFileExpected);
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
    const expectedFile = await getMolfile(page, 'v3000');
    await saveToFile(
      'Molfiles-V3000/peptides-flex-chain-expected.mol',
      expectedFile,
    );
    const METADATA_STRING_INDEX = [1];

    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Molfiles-V3000/peptides-flex-chain-expected.mol',
        fileFormat: 'v3000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(molFile).toEqual(molFileExpected);
    await openFileAndAddToCanvasMacro(
      'Molfiles-V3000/peptides-flex-chain-expected.mol',
      page,
    );
    await takeEditorScreenshot(page);
  });
});
