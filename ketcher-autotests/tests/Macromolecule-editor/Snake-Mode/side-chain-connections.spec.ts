import { Page, test } from '@playwright/test';
import {
  selectSnakeLayoutModeTool,
  takeEditorScreenshot,
  waitForPageInit,
  openFileAndAddToCanvasMacro,
  moveMouseAway,
  selectFlexLayoutModeTool,
  selectSequenceLayoutModeTool,
  selectEraseTool,
  clickUndo,
  selectRectangleSelectionTool,
  waitForRender,
  selectTopPanelButton,
  TopPanelButton,
  getKet,
  saveToFile,
  receiveFileComparisonData,
  getMolfile,
} from '@utils';
import {
  turnOnMacromoleculesEditor,
  turnOnMicromoleculesEditor,
} from '@utils/macromolecules';

async function clickNthConnectionLine(page: Page, n: number) {
  const bondLine = page.locator('g[pointer-events="stroke"]').nth(n);
  await bondLine.click();
}

enum FileFormat {
  SVGDocument = 'SVG Document',
  PNGImage = 'PNG Image',
}

async function clickOnFileFormatDropdown(page: Page) {
  await page.getByRole('combobox').click();
}

async function closeSaveStrutureDialog(page: Page) {
  await page.getByRole('button', { name: 'Cancel' }).click();
}
async function saveFileAsPngOrSvgFormat(page: Page, FileFormat: string) {
  await selectTopPanelButton(TopPanelButton.Save, page);
  await clickOnFileFormatDropdown(page);
  await page.getByRole('option', { name: FileFormat }).click();
}

async function saveToKet(page: Page, fileName: string) {
  const expectedKetFile = await getKet(page);
  await saveToFile(`KET/Side-Chain-Connections/${fileName}`, expectedKetFile);

  const { fileExpected: ketFileExpected, file: ketFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName: `tests/test-data/KET/Side-Chain-Connections/${fileName}`,
    });

  expect(ketFile).toEqual(ketFileExpected);
}

async function saveToMol(page: Page, fileName: string) {
  const ignoredLineIndigo = 1;
  const expectedMolFile = await getMolfile(page, 'v3000');
  await saveToFile(`KET/Side-Chain-Connections/${fileName}`, expectedMolFile);

  const { fileExpected: molFileExpected, file: molFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName: `tests/test-data/KET/Side-Chain-Connections/${fileName}`,
      metaDataIndexes: [ignoredLineIndigo],
      fileFormat: 'v3000',
    });

  expect(molFile).toEqual(molFileExpected);
}

test.describe('Side chain connections', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Open file with rna side chain connections', async ({ page }) => {
    /* 
    Github ticket: #3532 - Displaying side chain connections in snake-like mode
    Description: Open file and check how side connections look for rna chain in snake mode
    */

    await selectSnakeLayoutModeTool(page);
    await openFileAndAddToCanvasMacro(`KET/side-connections-rna.ket`, page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('Open file with peptide side chain connection', async ({ page }) => {
    /*
    Github ticket: #3532 - Displaying side chain connections in snake-like mode
    Description: Open file and check how side connections look for peptide chain in snake mode
    */

    await selectSnakeLayoutModeTool(page);
    await openFileAndAddToCanvasMacro(`KET/side-connections-peptide.ket`, page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('Open file with cycled side chain connection', async ({ page }) => {
    /*
    Github ticket: #3532 - Displaying side chain connections in snake-like mode
    Description: Open file and check how side connections look for cycled chain in snake mode
    */

    await selectSnakeLayoutModeTool(page);
    await openFileAndAddToCanvasMacro(
      `KET/side-connection-in-cycle-chain.ket`,
      page,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('1.1 Verify correct display of side-chain connections when two monomers are in the same row', async ({
    page,
  }) => {
    /*
    /* Case 1.1: Verify correct display of side-chain connections when two monomers are in the same row 
    /* (connection should be drawn horizontally above these monomers)
    /* All canvases (4 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected by all possible combinations horisontally. 
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/1.1.ket`,
      page,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('1.2 Verify correct display of side-chain connections when two monomers are in the same row', async ({
    page,
  }) => {
    /*
    /* Case 1.2: Verify correct display of side-chain connections when two monomers are in the same row 
    /* (connection should be drawn horizontally above these monomers)
    /* All canvases (4 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected by all possible combinations horisontally. 
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/1.2.ket`,
      page,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('1.3 Verify correct display of side-chain connections when two monomers are in the same row', async ({
    page,
  }) => {
    /*
    /* Case 1.3: Verify correct display of side-chain connections when two monomers are in the same row 
    /* (connection should be drawn horizontally above these monomers)
    /* All canvases (4 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected by all possible combinations horisontally. 
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/1.3.ket`,
      page,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('1.4 Verify correct display of side-chain connections when two monomers are in the same row', async ({
    page,
  }) => {
    /*
    /* Case 1.4: Verify correct display of side-chain connections when two monomers are in the same row 
    /* (connection should be drawn horizontally above these monomers)
    /* All canvases (4 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected by all possible combinations horisontally. 
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/1.4.ket`,
      page,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('2.1 Verify correct display of side-chain connections when two monomers are in different rows', async ({
    page,
  }) => {
    /*
    /* Case 2.1: Verify correct display of side-chain connections when two monomers are in different rows 
    /* (connection curve should go from topmost monomer upside down and left to right (or right to left) using free space between monomers)
    /* All canvases (7 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected by all possible combinations. 
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/2.1.ket`,
      page,
    );
    await moveMouseAway(page);
    // Zoom out to see whole picture
    await page.keyboard.press('Control+Minus');
    await takeEditorScreenshot(page);
  });

  test('2.2 Verify correct display of side-chain connections when two monomers are in different rows', async ({
    page,
  }) => {
    /*
    /* Case 2.2: Verify correct display of side-chain connections when two monomers are in different rows 
    /* (connection curve should go from topmost monomer upside down and left to right (or right to left) using free space between monomers)
    /* All canvases (7 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected by all possible combinations. 
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/2.2.ket`,
      page,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('2.3 Verify correct display of side-chain connections when two monomers are in different rows', async ({
    page,
  }) => {
    /*
    /* Case 2.3: Verify correct display of side-chain connections when two monomers are in different rows 
    /* (connection curve should go from topmost monomer upside down and left to right (or right to left) using free space between monomers)
    /* All canvases (7 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected by all possible combinations. 
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/2.3.ket`,
      page,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('2.4 Verify correct display of side-chain connections when two monomers are in different rows', async ({
    page,
  }) => {
    /*
    /* Case 2.4: Verify correct display of side-chain connections when two monomers are in different rows 
    /* (connection curve should go from topmost monomer upside down and left to right (or right to left) using free space between monomers)
    /* All canvases (7 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected by all possible combinations. 
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/2.4.ket`,
      page,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('2.5 Verify correct display of side-chain connections when two monomers are in different rows', async ({
    page,
  }) => {
    /*
    /* Case 2.5: Verify correct display of side-chain connections when two monomers are in different rows 
    /* (connection curve should go from topmost monomer upside down and left to right (or right to left) using free space between monomers)
    /* All canvases (7 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected by all possible combinations. 
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/2.5.ket`,
      page,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('2.6 Verify correct display of side-chain connections when two monomers are in different rows', async ({
    page,
  }) => {
    /*
    /* Case 2.6: Verify correct display of side-chain connections when two monomers are in different rows 
    /* (connection curve should go from topmost monomer upside down and left to right (or right to left) using free space between monomers)
    /* All canvases (7 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected by all possible combinations. 
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/2.5.ket`,
      page,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('2.7 Verify correct display of side-chain connections when two monomers are in different rows', async ({
    page,
  }) => {
    /*
    /* Case 2.7: Verify correct display of side-chain connections when two monomers are in different rows 
    /* (connection curve should go from topmost monomer upside down and left to right (or right to left) using free space between monomers)
    /* All canvases (7 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected by all possible combinations. 
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/2.5.ket`,
      page,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('3.1 Check that R1-R1 connection is established between two monomers occupying first positions in different backbone chains', async ({
    page,
  }) => {
    /*
    /* Case 3.1 Check that R1-R1 connection is established between two monomers occupying first positions in different backbone chains, 
    /* connection drawn on the left from these monomers 
    /* 
    /* All canvases (7 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected from the left. 
    /*
    /* IMPORTANT: Test results is incorrect now because we have bug https://github.com/epam/ketcher/issues/5069
    /* Screenshot should be updated after fix.
    /*
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/3.1.ket`,
      page,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('3.2 Check that R1-R1 connection is established between two monomers occupying first positions in different backbone chains', async ({
    page,
  }) => {
    /*
    /* Case 3.2 Check that R1-R1 connection is established between two monomers occupying first positions in different backbone chains, 
    /* connection drawn on the left from these monomers 
    /* 
    /* All canvases (7 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected from the left. 
    /*
    /* IMPORTANT: Test results is incorrect now because we have bug https://github.com/epam/ketcher/issues/5069
    /* Screenshot should be updated after fix.
    /*
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/3.2.ket`,
      page,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('3.3 Check that R1-R1 connection is established between two monomers occupying first positions in different backbone chains', async ({
    page,
  }) => {
    /*
    /* Case 3.3 Check that R1-R1 connection is established between two monomers occupying first positions in different backbone chains, 
    /* connection drawn on the left from these monomers 
    /* 
    /* All canvases (7 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected from the left. 
    /*
    /* IMPORTANT: Test results is incorrect now because we have bug https://github.com/epam/ketcher/issues/5069
    /* Screenshot should be updated after fix.
    /*
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/3.3.ket`,
      page,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('3.4 Check that R1-R1 connection is established between two monomers occupying first positions in different backbone chains', async ({
    page,
  }) => {
    /*
    /* Case 3.4 Check that R1-R1 connection is established between two monomers occupying first positions in different backbone chains, 
    /* connection drawn on the left from these monomers 
    /* 
    /* All canvases (7 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected from the left. 
    /*
    /* IMPORTANT: Test results is incorrect now because we have bug https://github.com/epam/ketcher/issues/5069
    /* Screenshot should be updated after fix.
    /*
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/3.4.ket`,
      page,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('3.5 Check that R1-R1 connection is established between two monomers occupying first positions in different backbone chains', async ({
    page,
  }) => {
    /*
    /* Case 3.5 Check that R1-R1 connection is established between two monomers occupying first positions in different backbone chains, 
    /* connection drawn on the left from these monomers 
    /* 
    /* All canvases (7 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected from the left. 
    /*
    /* IMPORTANT: Test results is incorrect now because we have bug https://github.com/epam/ketcher/issues/5069
    /* Screenshot should be updated after fix.
    /*
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/3.5.ket`,
      page,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('3.6 Check that R1-R1 connection is established between two monomers occupying first positions in different backbone chains', async ({
    page,
  }) => {
    /*
    /* Case 3.6 Check that R1-R1 connection is established between two monomers occupying first positions in different backbone chains, 
    /* connection drawn on the left from these monomers 
    /* 
    /* All canvases (7 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected from the left. 
    /*
    /* IMPORTANT: Test results is incorrect now because we have bug https://github.com/epam/ketcher/issues/5069
    /* Screenshot should be updated after fix.
    /*
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/3.6.ket`,
      page,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('3.7 Check that R1-R1 connection is established between two monomers occupying first positions in different backbone chains', async ({
    page,
  }) => {
    /*
    /* Case 3.7 Check that R1-R1 connection is established between two monomers occupying first positions in different backbone chains, 
    /* connection drawn on the left from these monomers 
    /* 
    /* All canvases (7 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected from the left. 
    /*
    /* IMPORTANT: Test results is incorrect now because we have bug https://github.com/epam/ketcher/issues/5069
    /* Screenshot should be updated after fix.
    /*
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/3.7.ket`,
      page,
    );
    await moveMouseAway(page);
    // Zoom out to see bottom chians
    await page.keyboard.press('Control+Minus');
    await takeEditorScreenshot(page);
  });

  test('4.1 In case of R2-R2 bond connecting the last monomers of the chains the connection should be drawn on the right from these monomers', async ({
    page,
  }) => {
    /*
    /* Case 4.1 In case of R2-R2 bond connecting the last monomers of the chains the connection should be drawn on the right from these monomers
    /* connection drawn on the left from these monomers 
    /* 
    /* All canvases (7 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected from the right of each chain. 
    /*
    /* IMPORTANT: Test results is incorrect now because we have bug https://github.com/epam/ketcher/issues/5070
    /* Screenshot should be updated after fix.
    /*
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/4.1.ket`,
      page,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('4.2 In case of R2-R2 bond connecting the last monomers of the chains the connection should be drawn on the right from these monomers', async ({
    page,
  }) => {
    /*
    /* Case 4.2 In case of R2-R2 bond connecting the last monomers of the chains the connection should be drawn on the right from these monomers
    /* connection drawn on the left from these monomers 
    /* 
    /* All canvases (7 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected from the right of each chain. 
    /*
    /* IMPORTANT: Test results is incorrect now because we have bug https://github.com/epam/ketcher/issues/5070
    /* Screenshot should be updated after fix.
    /*
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/4.2.ket`,
      page,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('4.3 In case of R2-R2 bond connecting the last monomers of the chains the connection should be drawn on the right from these monomers', async ({
    page,
  }) => {
    /*
    /* Case 4.3 In case of R2-R2 bond connecting the last monomers of the chains the connection should be drawn on the right from these monomers
    /* connection drawn on the left from these monomers 
    /* 
    /* All canvases (7 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected from the right of each chain. 
    /*
    /* IMPORTANT: Test results is incorrect now because we have bug https://github.com/epam/ketcher/issues/5070
    /* Screenshot should be updated after fix.
    /*
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/4.3.ket`,
      page,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('4.4 In case of R2-R2 bond connecting the last monomers of the chains the connection should be drawn on the right from these monomers', async ({
    page,
  }) => {
    /*
    /* Case 4.4 In case of R2-R2 bond connecting the last monomers of the chains the connection should be drawn on the right from these monomers
    /* connection drawn on the left from these monomers 
    /* 
    /* All canvases (7 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected from the right of each chain. 
    /*
    /* IMPORTANT: Test results is incorrect now because we have bug https://github.com/epam/ketcher/issues/5070
    /* Screenshot should be updated after fix.
    /*
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/4.4.ket`,
      page,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('4.5 In case of R2-R2 bond connecting the last monomers of the chains the connection should be drawn on the right from these monomers', async ({
    page,
  }) => {
    /*
    /* Case 4.5 In case of R2-R2 bond connecting the last monomers of the chains the connection should be drawn on the right from these monomers
    /* connection drawn on the left from these monomers 
    /* 
    /* All canvases (7 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected from the right of each chain. 
    /*
    /* IMPORTANT: Test results is incorrect now because we have bug https://github.com/epam/ketcher/issues/5070
    /* Screenshot should be updated after fix.
    /*
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/4.5.ket`,
      page,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('4.6 In case of R2-R2 bond connecting the last monomers of the chains the connection should be drawn on the right from these monomers', async ({
    page,
  }) => {
    /*
    /* Case 4.6 In case of R2-R2 bond connecting the last monomers of the chains the connection should be drawn on the right from these monomers
    /* connection drawn on the left from these monomers 
    /* 
    /* All canvases (7 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected from the right of each chain. 
    /*
    /* IMPORTANT: Test results is incorrect now because we have bug https://github.com/epam/ketcher/issues/5070
    /* Screenshot should be updated after fix.
    /*
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/4.6.ket`,
      page,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('4.7 In case of R2-R2 bond connecting the last monomers of the chains the connection should be drawn on the right from these monomers', async ({
    page,
  }) => {
    /*
    /* Case 4.7 In case of R2-R2 bond connecting the last monomers of the chains the connection should be drawn on the right from these monomers
    /* connection drawn on the left from these monomers 
    /* 
    /* All canvases (7 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected from the right of each chain. 
    /*
    /* IMPORTANT: Test results is incorrect now because we have bug https://github.com/epam/ketcher/issues/5070
    /* Screenshot should be updated after fix.
    /*
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/4.7.ket`,
      page,
    );
    await moveMouseAway(page);
    // Zoom out to see bottom chians
    await page.keyboard.press('Control+Minus');
    await takeEditorScreenshot(page);
  });

  test('5. Verify side-chain connections alignment and avoidance of overlap (horizontal)', async ({
    page,
  }) => {
    /*
    /* Case 5: Side chain connections may intersect backbone and other side chain connections but should not overlap. 
    /* If more than one side connection is drawn horizontally between two monomer rows, they should be shifted vertically against each other.
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(`KET/Side-Chain-Connections/5.ket`, page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('6. Verify side-chain connections alignment and avoidance of overlap (vertical)', async ({
    page,
  }) => {
    /*
    /* Case 6: Similarly to point 5, vertically oriented connections should not overlap. 
    /* If multiple connections run vertically in the space between two monomers, they should be shifted horizontally relative to each other.
    /*
    /* All canvases (3 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected from the vertically. 
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(`KET/Side-Chain-Connections/6.ket`, page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('6.1 Verify side-chain connections alignment and avoidance of overlap (vertical)', async ({
    page,
  }) => {
    /*
    /* Case 6.1: Similarly to point 5, vertically oriented connections should not overlap. 
    /* If multiple connections run vertically in the space between two monomers, they should be shifted horizontally relative to each other.
    /*
    /* All canvases (3 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected from the vertically. 
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/6.1.ket`,
      page,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('6.2 Verify side-chain connections alignment and avoidance of overlap (vertical)', async ({
    page,
  }) => {
    /*
    /* Case 6.2: Similarly to point 5, vertically oriented connections should not overlap. 
    /* If multiple connections run vertically in the space between two monomers, they should be shifted horizontally relative to each other.
    /*
    /* All canvases (3 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected from the vertically. 
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/6.2.ket`,
      page,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('7.1 Verify handling of RNA monomer connections between R1 of base and R3 of sugar (should be displayed as a straight line (usual way))', async ({
    page,
  }) => {
    /*
    /* Case 7.1: Specific case for RNA monomers: the bond between R1 of base and R3 of sugar should not be 
    /* considered side chain connection and should be displayed as a straight line (usual way). All other 
    /* bonds connected to the base are considered side chain connections.
    /* 
    /* All canvases (5 in total) contain all combinations of connections between base and sugar
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/7.1.ket`,
      page,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('7.2 Verify handling of RNA monomer connections between R1 of base and R3 of sugar (should be displayed as a straight line (usual way))', async ({
    page,
  }) => {
    /*
    /* Case 7.2: Specific case for RNA monomers: the bond between R1 of base and R3 of sugar should not be 
    /* considered side chain connection and should be displayed as a straight line (usual way). All other 
    /* bonds connected to the base are considered side chain connections.
    /* 
    /* All canvases (5 in total) contain all combinations of connections between base and sugar
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/7.2.ket`,
      page,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('7.3 Verify handling of RNA monomer connections between R1 of base and R3 of sugar (should be displayed as a straight line (usual way))', async ({
    page,
  }) => {
    /*
    /* Case 7.3: Specific case for RNA monomers: the bond between R1 of base and R3 of sugar should not be 
    /* considered side chain connection and should be displayed as a straight line (usual way). All other 
    /* bonds connected to the base are considered side chain connections.
    /* 
    /* All canvases (5 in total) contain all combinations of connections between base and sugar
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/7.3.ket`,
      page,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('7.4 Verify handling of RNA monomer connections between R1 of base and R3 of sugar (should be displayed as a straight line (usual way))', async ({
    page,
  }) => {
    /*
    /* Case 7.4: Specific case for RNA monomers: the bond between R1 of base and R3 of sugar should not be 
    /* considered side chain connection and should be displayed as a straight line (usual way). All other 
    /* bonds connected to the base are considered side chain connections.
    /* 
    /* All canvases (5 in total) contain all combinations of connections between base and sugar
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/7.4.ket`,
      page,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('7.5 Verify handling of RNA monomer connections between R1 of base and R3 of sugar (should be displayed as a straight line (usual way))', async ({
    page,
  }) => {
    /*
    /* Case 7.5: Specific case for RNA monomers: the bond between R1 of base and R3 of sugar should not be 
    /* considered side chain connection and should be displayed as a straight line (usual way). All other 
    /* bonds connected to the base are considered side chain connections.
    /* 
    /* All canvases (5 in total) contain all combinations of connections between base and sugar
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/7.5.ket`,
      page,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('8. Verify display of side-chain connections when switching from snake mode to flex mode', async ({
    page,
  }) => {
    /*
    /* Case 8: Verify display of side-chain connections when switching from snake mode to flex mode
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(`KET/Side-Chain-Connections/8.ket`, page);
    await selectFlexLayoutModeTool(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('9. Verify display of side-chain connections when switching from snake mode to sequence mode', async ({
    page,
  }) => {
    /*
    /* Case 9: Verify display of side-chain connections when switching from snake mode to sequence mode
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(`KET/Side-Chain-Connections/9.ket`, page);
    await selectSequenceLayoutModeTool(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('10. Verify display of side-chain connections when switching from sequence mode to flex mode', async ({
    page,
  }) => {
    /*
    /* Case 10: Verify display of side-chain connections when switching from sequence mode to flex mode
    */

    await selectSequenceLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/10.ket`,
      page,
    );
    await selectFlexLayoutModeTool(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('11. Verify selection of a single side-chain connection', async ({
    page,
  }) => {
    /*
    /* Case 11: Verify selection of a single side-chain connection
    */

    await selectFlexLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/11.ket`,
      page,
    );

    const randomSideBondToSelect = 12;
    await clickNthConnectionLine(page, randomSideBondToSelect);
    await takeEditorScreenshot(page);
  });

  test('12. Verify deletion of a single side-chain connection and Undo', async ({
    page,
  }) => {
    /*
    /* Case 12: Verify deletion of a single side-chain connection and Undo
    */

    await selectFlexLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/12.ket`,
      page,
    );

    const randomSideBondToSelect = 12;
    await clickNthConnectionLine(page, randomSideBondToSelect);
    // await takeEditorScreenshot(page);
    await selectEraseTool(page);
    await takeEditorScreenshot(page);
    await clickUndo(page);
    await takeEditorScreenshot(page);
  });

  test('13. Verify deletion of multiple side-chain connections and Undo', async ({
    page,
  }) => {
    /*
    /* Case 13: Verify deletion of multiple side-chain connections and Undo
    */

    await selectFlexLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/13.ket`,
      page,
    );

    // Selectiong ALL 60 available bonds
    const numberOfBondsToSelectAndDelete = 60;
    await selectRectangleSelectionTool(page);
    for (let i = 0; i < numberOfBondsToSelectAndDelete; i = i + 1) {
      await page.keyboard.down('Shift');
      await clickNthConnectionLine(page, i);
      await page.keyboard.up('Shift');
    }
    await selectEraseTool(page);
    await takeEditorScreenshot(page);

    await clickUndo(page);
    await takeEditorScreenshot(page);
  });

  test('14. Verify deletion of a side-chain connection in a complex RNA structure and Undo', async ({
    page,
  }) => {
    /*
    /* Case 14: Verify deletion of a side-chain connection in a complex RNA structure and Undo
    */

    await selectFlexLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/14.ket`,
      page,
    );

    // Selecting ALL 53 available bonds
    const numberOfBondsToSelectAndDelete = 53;
    await selectRectangleSelectionTool(page);
    for (let i = 0; i < numberOfBondsToSelectAndDelete; i = i + 1) {
      await page.keyboard.down('Shift');
      await clickNthConnectionLine(page, i);
      await page.keyboard.up('Shift');
    }
    await selectEraseTool(page);
    await takeEditorScreenshot(page);

    await clickUndo(page);
    await takeEditorScreenshot(page);
  });

  test('15. Verify copy-paste of a structure with side-chain connections', async ({
    page,
  }) => {
    /*
    /* Case 15: Verify copy-paste of a structure with side-chain connections
    */

    await selectSnakeLayoutModeTool(page);
    // Closing Library to enlarge canvas
    await page.getByText('Hide').click();
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/15.ket`,
      page,
    );
    await takeEditorScreenshot(page);

    await page.keyboard.press('Control+a');
    await waitForRender(page, async () => {
      await page.keyboard.press('Control+c');
    });
    await waitForRender(page, async () => {
      await page.keyboard.press('Control+v');
    });
    await takeEditorScreenshot(page);
  });

  test('16. Verify saving structure with side-chain connections in SVG Document format', async ({
    page,
  }) => {
    /*
    /*  
      Case 16: Verify saving structure with side-chain connections in SVG Document format
    */
    await selectSnakeLayoutModeTool(page);
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/16.ket`,
      page,
    );
    await saveFileAsPngOrSvgFormat(page, FileFormat.SVGDocument);
    await takeEditorScreenshot(page);
    // Closing Save dialog
    await closeSaveStrutureDialog(page);
  });

  test('17. Verify saving structure with side-chain connections in SVG Document format', async ({
    page,
  }) => {
    /*
    /*  
      Case 17: Verify saving structure with side-chain connections in SVG Document format
    */
    await selectSnakeLayoutModeTool(page);
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/17.ket`,
      page,
    );

    await waitForRender(page, async () => {
      await turnOnMicromoleculesEditor(page);
    });

    await takeEditorScreenshot(page);
  });

  test('18. Check that display of side-chain connections does not visually change when switching between Micro and Macro modes', async ({
    page,
  }) => {
    /*
    /*  
      Case 18: Check that display of side-chain connections does not visually change when switching between Micro and Macro modes
    */
    await openFileAndAddToCanvasMacro(
      `KET/Side-Chain-Connections/18.ket`,
      page,
    );

    await waitForRender(page, async () => {
      await turnOnMicromoleculesEditor(page);
    });

    await waitForRender(page, async () => {
      await turnOnMacromoleculesEditor(page);
    });

    await selectFlexLayoutModeTool(page);
    await takeEditorScreenshot(page);

    await selectSnakeLayoutModeTool(page);
    await takeEditorScreenshot(page);

    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  // test('19. Verify saving and opening structure with side-chain connections in KET format', async ({
  //   page,
  // }) => {
  //   /*
  //   /*
  //   /* Case 19: Verify saving and opening structure with side-chain connections in KET format
  //   */
  //   await selectSequenceLayoutModeTool(page);
  //   // await openFileAndAddToCanvasMacro(
  //   //   `KET/Side-Chain-Connections/19.ket`,
  //   //   page,
  //   // );
  //   await saveToKet(page, '19-expected.ket');
  // });

  // test('20. Verify saving and opening structure with side-chain connections in MOL V3000 format', async ({
  //   page,
  // }) => {
  //   /*
  //   /*
  //   /* Case 20: Verify saving and opening structure with side-chain connections in MOL V3000 format
  //   */
  //   await selectSequenceLayoutModeTool(page);
  //   await openFileAndAddToCanvasMacro(
  //     `KET/Side-Chain-Connections/20.ket`,
  //     page,
  //   );
  //   await saveToMol(page, '20-expected.mol');
  // });
});
