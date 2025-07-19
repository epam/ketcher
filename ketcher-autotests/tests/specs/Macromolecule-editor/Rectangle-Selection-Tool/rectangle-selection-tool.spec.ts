import { Page, test } from '@playwright/test';
import {
  addSingleMonomerToCanvas,
  addPeptideOnCanvas,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  openFileAndAddToCanvasMacro,
  takeEditorScreenshot,
  waitForPageInit,
  moveMouseAway,
  clickOnCanvas,
  clickInTheMiddleOfTheScreen,
  resetZoomLevelToDefault,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import { selectRectangleArea } from '@utils/canvas/tools/helpers';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
import { getMonomerLocator, moveMonomer } from '@utils/macromolecules/monomer';
import { Peptides } from '@constants/monomers/Peptides';
import { Chem } from '@constants/monomers/Chem';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import { TopToolbar } from '@tests/pages/macromolecules/TopToolbar';
import { LayoutMode } from '@tests/pages/constants/topToolbar/Constants';
/* eslint-disable no-magic-numbers */

async function moveMonomersToNewPosition(
  page: Page,
  filePath: string,
  monomerName: string,
  x: number,
  y: number,
) {
  await openFileAndAddToCanvasMacro(page, filePath);
  await CommonLeftToolbar(page).selectAreaSelectionTool(
    SelectionToolType.Rectangle,
  );
  await selectAllStructuresOnCanvas(page);
  await getMonomerLocator(page, { monomerAlias: monomerName }).click();
  await dragMouseTo(x, y, page);
  await takeEditorScreenshot(page);
}

test.describe('Rectangle Selection Tool', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();

    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await Library(page).switchToPeptidesTab();
  });

  test.afterEach(async () => {
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await CommonTopLeftToolbar(page).clearCanvas();
    await resetZoomLevelToDefault(page);
  });

  test.afterAll(async ({ browser }) => {
    await Promise.all(browser.contexts().map((context) => context.close()));
  });

  test('Select monomer and bonds and then erase', async () => {
    /* 
    Test case: #2360 - "Select" tool for Macromolecules editor
    Description: Rectangle Selection Tool
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

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );

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
    await CommonLeftToolbar(page).selectEraseTool();

    // Get rid of flakiness because of preview
    await page.mouse.move(coords[0], coords[1]);

    await takeEditorScreenshot(page);
  });

  test('Move monomer bonded with another monomers', async () => {
    /* 
    Test case: #2367 - move items on the canvas
    Description: check ability to move items on the canvas
    */

    // Choose peptide
    await Library(page).selectMonomer(Peptides.Tza);

    // Create 4 peptides on canvas
    await clickOnCanvas(page, 300, 400);
    await clickOnCanvas(page, 400, 400);
    await clickOnCanvas(page, 500, 500);
    await clickOnCanvas(page, 600, 600);

    // Get 4 peptides locators
    const peptides = getMonomerLocator(page, Peptides.Tza);
    const peptide1 = peptides.nth(0);
    const peptide2 = peptides.nth(1);
    const peptide3 = peptides.nth(2);
    const peptide4 = peptides.nth(3);

    // Select bond tool
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);

    // Create bonds between peptides
    await bondTwoMonomers(page, peptide1, peptide2);
    await bondTwoMonomers(page, peptide3, peptide2);
    await bondTwoMonomers(page, peptide3, peptide4);

    await takeEditorScreenshot(page);

    await moveMonomer(page, peptide2, 200, 400);

    await takeEditorScreenshot(page);
  });

  test('Monomer appears above other monomers, when selected', async () => {
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
    await Library(page).selectMonomer(Peptides.bAla);
    await clickOnCanvas(page, betaAlaninePosition.x, betaAlaninePosition.y);

    await Library(page).selectMonomer(Peptides.Edc);
    // Ethylthiocysteine was added later, so it is located above Beta Alanine
    await clickOnCanvas(page, center.x + shift, center.y);
    await page.keyboard.press('Escape');

    // Now Beta Alanine must be above Ethylthiocysteine
    await clickOnCanvas(page, betaAlaninePosition.x, betaAlaninePosition.y);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Group selection using `Shift+LClick`', async () => {
    /* 
    Test case: #3728 - Group selection using Shift+LClick for Macromolecules editor
    Description: Selection elements pointly
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

    // Select rectangle selection tool
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );

    // Select monomers pointly by clicking Shift+LClick
    await page.keyboard.down('Shift');

    await clickOnCanvas(page, 300, 300);
    await clickOnCanvas(page, 400, 400);
    await clickOnCanvas(page, 500, 350);

    await page.keyboard.up('Shift');

    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Move selected by selection tool peptide to new position on canvas', async () => {
    /* 
    Test case: #2507 - Add Peptides monomers to canvas
    Description: Selected by selection tool peptide moved to new position on canvas
    */
    const x = 200;
    const y = 200;
    await addPeptideOnCanvas(page, Peptides.meD);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await getMonomerLocator(page, Peptides.meD).click();
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
    test(testCase.description, async () => {
      const x = 400;
      const y = 500;
      await moveMonomersToNewPosition(page, testCase.filePath, 'meD', x, y);
    });
  }

  test('Move selected by selection tool CHEM to new position on canvas', async () => {
    /* 
    Test case: #2507 - Add CHEM monomers to canvas
    Description: Selected by selection tool CHEM moved to new position on canvas
    */
    const x = 200;
    const y = 200;
    await Library(page).selectMonomer(Chem.A6OH);
    await clickInTheMiddleOfTheScreen(page);

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await getMonomerLocator(page, Chem.A6OH).click();
    await dragMouseTo(x, y, page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
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
    test(testCase.description, async () => {
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
    test(testCase.description, async () => {
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

  test('Check selection/deselection for all kind monomers (Peptides, RNA, CHEM)', async () => {
    /* 
    Test case: Selection tool
    Description: Selection of monomers looks in accordance with the design.
    */
    const x = 100;
    const y = 100;
    await openFileAndAddToCanvasMacro(page, 'KET/all-kind-of-monomers.ket');
    await selectAllStructuresOnCanvas(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await clickOnCanvas(page, x, y);
    await takeEditorScreenshot(page);
  });

  test('Move a monomer, then use the Undo/Redo function', async () => {
    /* 
    Test case: Selection tool
    Description: Undo/Redo functions works after selection and moving monomer.
    */
    const x = 200;
    const y = 200;
    await addPeptideOnCanvas(page, Peptides._2Nal);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await getMonomerLocator(page, Peptides._2Nal).hover();
    await dragMouseTo(x, y, page);
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).redo();
    await takeEditorScreenshot(page);
  });

  test('Check that you can move monomers on canvas in snake-view', async () => {
    /* 
    Test case: Selection tool
    Description: Monomers moved to new position in Snake mode view.
    */
    const x = 850;
    const y = 500;
    await openFileAndAddToCanvasMacro(page, 'KET/snake-mode-peptides.ket');
    await TopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await selectAllStructuresOnCanvas(page);
    await getMonomerLocator(page, Peptides.Hhs).hover();
    await dragMouseTo(x, y, page);
    await takeEditorScreenshot(page);
  });

  test('Create multiple rows of monomers and move monomer between different rows', async () => {
    /* 
    Test case: Selection tool
    Description: Monomer moved to new position through rows of monomers.
    */
    const x = 900;
    const y = 500;
    await openFileAndAddToCanvasMacro(page, 'KET/two-rows-of-monomers.ket');
    await getMonomerLocator(page, Peptides.Hhs).hover();
    await dragMouseTo(x, y, page);
    await takeEditorScreenshot(page);
  });

  test('Check that you can select all kind of monomers and delete by pressing Delete button and then can Undo it', async () => {
    /* 
    Test case: Selection tool
    Description: Monomers are deleted from canvas and then appears after pressing Undo.
    */
    await openFileAndAddToCanvasMacro(page, 'KET/all-kind-of-monomers.ket');
    await selectAllStructuresOnCanvas(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
  });
});
