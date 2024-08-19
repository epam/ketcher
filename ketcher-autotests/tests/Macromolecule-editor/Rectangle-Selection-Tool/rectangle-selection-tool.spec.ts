import { Page, test } from '@playwright/test';
import {
  addChemOnCanvas,
  addSingleMonomerToCanvas,
  addPeptideOnCanvas,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  openFileAndAddToCanvasMacro,
  selectEraseTool,
  selectRectangleArea,
  selectRectangleSelectionTool,
  selectSingleBondTool,
  takeEditorScreenshot,
  waitForPageInit,
  selectSnakeLayoutModeTool,
  moveMouseAway,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
import { moveMonomer } from '@utils/macromolecules/monomer';
import { Peptides } from '@utils/selectors/macromoleculeEditor';
/* eslint-disable no-magic-numbers */

async function moveMonomersToNewPosition(
  page: Page,
  filePath: string,
  monomerName: string,
  x: number,
  y: number,
) {
  await openFileAndAddToCanvasMacro(filePath, page);
  await selectRectangleSelectionTool(page);
  await page.keyboard.press('Control+a');
  await page.getByText(monomerName).locator('..').first().click();
  await dragMouseTo(x, y, page);
  await takeEditorScreenshot(page);
}

test.describe('Rectangle Selection Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });
  test('Select monomer and bonds and then erase', async ({ page }) => {
    /* 
    Test case: #2360 - "Select" tool for Macromolecules editor
    Description: Rectangle Selection Tool
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
    await selectSingleBondTool(page);

    // Create bonds between peptides
    await bondTwoMonomers(page, peptide1, peptide2);
    await bondTwoMonomers(page, peptide3, peptide2);
    await bondTwoMonomers(page, peptide3, peptide4);

    // Get rid of flakiness because of preview
    const coords = [100, 100];
    await page.mouse.move(coords[0], coords[1]);
    await takeEditorScreenshot(page);

    await selectRectangleSelectionTool(page);

    // Coordinates for rectangle selection
    const startX = 100;
    const startY = 100;
    const endX = 500;
    const endY = 500;

    await selectRectangleArea(page, startX, startY, endX, endY);

    // Get rid of flakiness because of preview
    await page.mouse.move(coords[0], coords[1]);
    await takeEditorScreenshot(page);

    // Erase selected elements
    await selectEraseTool(page);

    // Get rid of flakiness because of preview
    await page.mouse.move(coords[0], coords[1]);

    await takeEditorScreenshot(page);
  });

  test('Move monomer bonded with another monomers', async ({ page }) => {
    /* 
    Test case: #2367 - move items on the canvas
    Description: check ability to move items on the canvas
    */

    // Choose peptide
    await page.getByText('Tza').click();

    // Create 4 peptides on canvas
    await page.mouse.click(300, 300);
    await page.mouse.click(400, 400);
    await page.mouse.click(500, 500);
    await page.mouse.click(600, 600);

    // Get 4 peptides locators
    const peptides = await page.getByText('Tza').locator('..');
    const peptide1 = peptides.nth(0);
    const peptide2 = peptides.nth(1);
    const peptide3 = peptides.nth(2);
    const peptide4 = peptides.nth(3);

    // Select bond tool
    await selectSingleBondTool(page);

    // Create bonds between peptides
    await bondTwoMonomers(page, peptide1, peptide2);
    await bondTwoMonomers(page, peptide3, peptide2);
    await bondTwoMonomers(page, peptide3, peptide4);

    await takeEditorScreenshot(page);

    await moveMonomer(page, peptide2, 200, 400);

    await takeEditorScreenshot(page);
  });

  test('Monomer appears above other monomers, when selected', async ({
    page,
  }) => {
    /*
      Test case: Selected monomer does not appear above the others
      See issue https://github.com/epam/ketcher/issues/3703 for more detailes
    */
    const center = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const shift = 12;
    const betaAlaninePosition = {
      x: center.x - shift,
      y: center.y,
    };
    await page.getByTestId(Peptides.BetaAlanine).click();
    await page.mouse.click(betaAlaninePosition.x, betaAlaninePosition.y);

    await page.getByTestId(Peptides.Ethylthiocysteine).click();
    // Ethylthiocysteine was added later, so it is located above Beta Alanine
    await page.mouse.click(center.x + shift, center.y);
    await page.keyboard.press('Escape');

    // Now Beta Alanine must be above Ethylthiocysteine
    await page.mouse.click(betaAlaninePosition.x, betaAlaninePosition.y);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('Group selection using `Shift+LClick`', async ({ page }) => {
    /* 
    Test case: #3728 - Group selection using Shift+LClick for Macromolecules editor
    Description: Selection elements pointly
    */

    // Create 4 peptides on canvas
    const MONOMER_NAME = 'Tza___3-(4-Thiazolyl)-alanine';
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

    // Select rectangle selection tool
    await selectRectangleSelectionTool(page);

    // Select monomers pointly by clicking Shift+LClick
    await page.keyboard.down('Shift');

    await page.mouse.click(300, 300);
    await page.mouse.click(400, 400);
    await page.mouse.click(500, 350);

    await page.keyboard.up('Shift');

    await takeEditorScreenshot(page);
  });

  test('Move selected by selection tool peptide to new position on canvas', async ({
    page,
  }) => {
    /* 
    Test case: #2507 - Add Peptides monomers to canvas
    Description: Selected by selection tool peptide moved to new position on canvas
    */
    const x = 200;
    const y = 200;
    await addPeptideOnCanvas(page, 'meD___N-Methyl-Aspartic acid');
    await selectRectangleSelectionTool(page);
    await page.getByText('meD').locator('..').first().click();
    await dragMouseTo(x, y, page);
    await takeEditorScreenshot(page);
  });

  const testCases = [
    {
      description:
        'Move multiple selected Peptides not connected by bonds to new position on canvas',
      filePath: 'KET/three-peptides-not-connected.ket',
    },
    {
      description:
        'Move multiple selected Peptides connected by bonds to new position on canvas',
      filePath: 'KET/three-peptides-connected.ket',
    },
  ];

  for (const testCase of testCases) {
    test(testCase.description, async ({ page }) => {
      const x = 400;
      const y = 500;
      await moveMonomersToNewPosition(page, testCase.filePath, 'meD', x, y);
    });
  }

  test('Move selected by selection tool CHEM to new position on canvas', async ({
    page,
  }) => {
    /* 
    Test case: #2507 - Add CHEM monomers to canvas
    Description: Selected by selection tool CHEM moved to new position on canvas
    */
    const x = 200;
    const y = 200;
    await addChemOnCanvas(page, 'A6OH___6-amino-hexanol');
    await selectRectangleSelectionTool(page);
    await page.getByText('A6OH').locator('..').first().click();
    await dragMouseTo(x, y, page);
    await takeEditorScreenshot(page);
  });

  const testCasesForChems = [
    {
      description:
        'Move multiple selected CHEMs not connected by bonds to new position on canvas',
      filePath: 'KET/chems-not-connected.ket',
    },
    {
      description:
        'Move multiple selected CHEMs connected by bonds to new position on canvas',
      filePath: 'KET/chems-connected.ket',
    },
  ];

  for (const testCase of testCasesForChems) {
    test(testCase.description, async ({ page }) => {
      const x = 400;
      const y = 500;
      await moveMonomersToNewPosition(page, testCase.filePath, 'A6OH', x, y);
    });
  }

  const testCasesForMolfiles = [
    {
      description:
        'Check that you can open .mol file with connected peptide structure, select and move it on canvas',
      filePath: 'Molfiles-V3000/peptides-connected.mol',
      monomerName: 'meD',
    },
    {
      description:
        'Check that you can open .mol file with connected CHEMs structure, select and move it on canvas',
      filePath: 'Molfiles-V3000/chems-connected.mol',
      monomerName: 'A6OH',
    },
    {
      description:
        'Check that you can open .mol file with connected RNA structure, select and move it on canvas',
      filePath: 'Molfiles-V3000/rna-connected.mol',
      monomerName: '25R',
    },
  ];

  for (const testCase of testCasesForMolfiles) {
    test(testCase.description, async ({ page }) => {
      const x = 400;
      const y = 500;
      await moveMonomersToNewPosition(
        page,
        testCase.filePath,
        testCase.monomerName,
        x,
        y,
      );
    });
  }

  test('Check selection/deselection for all kind monomers (Peptides, RNA, CHEM)', async ({
    page,
  }) => {
    /* 
    Test case: Selection tool
    Description: Selection of monomers looks in accordance with the design.
    */
    const x = 100;
    const y = 100;
    await openFileAndAddToCanvasMacro('KET/all-kind-of-monomers.ket', page);
    await page.keyboard.press('Control+a');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await page.mouse.click(x, y);
    await takeEditorScreenshot(page);
  });

  test('Move a monomer, then use the Undo/Redo function', async ({ page }) => {
    /* 
    Test case: Selection tool
    Description: Undo/Redo functions works after selection and moving monomer.
    */
    const x = 200;
    const y = 200;
    await addPeptideOnCanvas(page, '2Nal___3-(2-naphthyl)-alanine');
    await selectRectangleSelectionTool(page);
    await page.getByText('2Nal').locator('..').first().hover();
    await dragMouseTo(x, y, page);
    await page.getByTestId('undo').click();
    await takeEditorScreenshot(page);
    await page.getByTestId('redo').click();
    await takeEditorScreenshot(page);
  });

  test('Check that you can move monomers on canvas in snake-view', async ({
    page,
  }) => {
    /* 
    Test case: Selection tool
    Description: Monomers moved to new position in Snake mode view.
    */
    const x = 850;
    const y = 500;
    await openFileAndAddToCanvasMacro('KET/snake-mode-peptides.ket', page);
    await selectSnakeLayoutModeTool(page);
    await page.keyboard.press('Control+a');
    await page.getByText('Hhs').locator('..').first().hover();
    await dragMouseTo(x, y, page);
    await takeEditorScreenshot(page);
  });

  test('Create multiple rows of monomers and move monomer between different rows', async ({
    page,
  }) => {
    /* 
    Test case: Selection tool
    Description: Monomer moved to new position through rows of monomers.
    */
    const x = 900;
    const y = 500;
    await openFileAndAddToCanvasMacro('KET/two-rows-of-monomers.ket', page);
    await page.getByText('Hhs').locator('..').first().hover();
    await dragMouseTo(x, y, page);
    await takeEditorScreenshot(page);
  });

  test('Check that you can select all kind of monomers and delete by pressing Delete button and then can Undo it', async ({
    page,
  }) => {
    /* 
    Test case: Selection tool
    Description: Monomers are deleted from canvas and then appears after pressing Undo.
    */
    await openFileAndAddToCanvasMacro('KET/all-kind-of-monomers.ket', page);
    await page.keyboard.press('Control+a');
    await page.getByTestId('erase').click();
    await takeEditorScreenshot(page);
    await page.getByTestId('undo').click();
    await takeEditorScreenshot(page);
  });
});
