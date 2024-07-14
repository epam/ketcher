import { test } from '@playwright/test';
import {
  selectSnakeLayoutModeTool,
  takeEditorScreenshot,
  waitForPageInit,
  openFileAndAddToCanvasMacro,
  moveMouseAway,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

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
});
