/* eslint-disable no-magic-numbers */
import { Page, test } from '@fixtures';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvasMacro,
  moveMouseAway,
  waitForRender,
  copyToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  resetZoomLevelToDefault,
  ZoomOutByKeyboard,
  waitForPageInit,
  MolFileFormat,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import { pageReload } from '@utils/common/helpers';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import {
  FileType,
  verifyFileExport,
  verifySVGExport,
} from '@utils/files/receiveFileComparisonData';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { MonomerPreviewTooltip } from '@tests/pages/macromolecules/canvas/MonomerPreviewTooltip';

let page: Page;

async function configureInitialState(page: Page) {
  await Library(page).switchToRNATab();
}

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();

  await waitForPageInit(page);
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  await configureInitialState(page);
});

test.afterEach(async () => {
  await page.keyboard.press('Escape');
  await resetZoomLevelToDefault(page);
  await CommonTopLeftToolbar(page).clearCanvas();
});

test.afterAll(async ({ browser }) => {
  await Promise.all(browser.contexts().map((context) => context.close()));
});

async function clickNthConnectionLine(page: Page, n: number) {
  const bondLine = page.locator('g[pointer-events="stroke"]').nth(n);
  await bondLine.click();
}

test.describe('Side chain connections', () => {
  test('Open file with rna side chain connections', async () => {
    /* 
    Github ticket: #3532 - Displaying side chain connections in snake-like mode
    Description: Open file and check how side connections look for rna chain in snake mode
    */

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await openFileAndAddToCanvasMacro(page, `KET/side-connections-rna.ket`);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Open file with peptide side chain connection', async () => {
    /*
    Github ticket: #3532 - Displaying side chain connections in snake-like mode
    Description: Open file and check how side connections look for peptide chain in snake mode
    */

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await openFileAndAddToCanvasMacro(page, `KET/side-connections-peptide.ket`);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Open file with cycled side chain connection', async () => {
    /*
    Github ticket: #3532 - Displaying side chain connections in snake-like mode
    Description: Open file and check how side connections look for cycled chain in snake mode
    */

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await openFileAndAddToCanvasMacro(
      page,
      `KET/side-connection-in-cycle-chain.ket`,
    );
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('1.1 Verify correct display of side-chain connections when two monomers are in the same row', async () => {
    /*
    /* Case 1.1: Verify correct display of side-chain connections when two monomers are in the same row 
    /* (connection should be drawn horizontally above these monomers)
    /* All canvases (4 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected by all possible combinations horisontally. 
    */

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    // Closing Library to enlarge canvas
    await Library(page).hideLibrary();
    await page.waitForTimeout(200);
    await openFileAndAddToCanvasMacro(
      page,
      `KET/Side-Chain-Connections/1.1.ket`,
    );
    await resetZoomLevelToDefault(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('1.2 Verify correct display of side-chain connections when two monomers are in the same row', async () => {
    /*
    /* Case 1.2: Verify correct display of side-chain connections when two monomers are in the same row 
    /* (connection should be drawn horizontally above these monomers)
    /* All canvases (4 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected by all possible combinations horisontally. 
    */

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    // Closing Library to enlarge canvas
    await Library(page).hideLibrary();
    await openFileAndAddToCanvasMacro(
      page,
      `KET/Side-Chain-Connections/1.2.ket`,
    );
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('1.3 Verify correct display of side-chain connections when two monomers are in the same row', async () => {
    /*
    /* Case 1.3: Verify correct display of side-chain connections when two monomers are in the same row 
    /* (connection should be drawn horizontally above these monomers)
    /* All canvases (4 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected by all possible combinations horisontally. 
    */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    // Closing Library to enlarge canvas
    await Library(page).hideLibrary();
    await openFileAndAddToCanvasMacro(
      page,
      `KET/Side-Chain-Connections/1.3.ket`,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('1.4 Verify correct display of side-chain connections when two monomers are in the same row', async () => {
    /*
    /* Case 1.4: Verify correct display of side-chain connections when two monomers are in the same row 
    /* (connection should be drawn horizontally above these monomers)
    /* All canvases (4 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected by all possible combinations horisontally. 
    */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    // Closing Library to enlarge canvas
    await Library(page).hideLibrary();
    await openFileAndAddToCanvasMacro(
      page,
      `KET/Side-Chain-Connections/1.4.ket`,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('2.1 Verify correct display of side-chain connections when two monomers are in different rows', async () => {
    /*
    /* Case 2.1: Verify correct display of side-chain connections when two monomers are in different rows 
    /* (connection curve should go from topmost monomer upside down and left to right (or right to left) using free space between monomers)
    /* All canvases (7 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected by all possible combinations. 
    */

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    // Closing Library to enlarge canvas
    await Library(page).hideLibrary();
    await openFileAndAddToCanvasMacro(
      page,
      `KET/Side-Chain-Connections/2.1.ket`,
    );
    await moveMouseAway(page);
    // Zoom out to see whole picture
    await ZoomOutByKeyboard(page);
    await takeEditorScreenshot(page);
  });

  test('2.2 Verify correct display of side-chain connections when two monomers are in different rows', async () => {
    /*
    /* Case 2.2: Verify correct display of side-chain connections when two monomers are in different rows 
    /* (connection curve should go from topmost monomer upside down and left to right (or right to left) using free space between monomers)
    /* All canvases (7 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected by all possible combinations. 
    */
    await pageReload(page);
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    // Closing Library to enlarge canvas
    await Library(page).hideLibrary();
    await openFileAndAddToCanvasMacro(
      page,
      `KET/Side-Chain-Connections/2.2.ket`,
    );
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('2.3 Verify correct display of side-chain connections when two monomers are in different rows', async () => {
    /*
    /* Case 2.3: Verify correct display of side-chain connections when two monomers are in different rows 
    /* (connection curve should go from topmost monomer upside down and left to right (or right to left) using free space between monomers)
    /* All canvases (7 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected by all possible combinations. 
    */

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    // Closing Library to enlarge canvas
    await Library(page).hideLibrary();
    await openFileAndAddToCanvasMacro(
      page,
      `KET/Side-Chain-Connections/2.3.ket`,
    );
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('2.4 Verify correct display of side-chain connections when two monomers are in different rows', async () => {
    /*
    /* Case 2.4: Verify correct display of side-chain connections when two monomers are in different rows 
    /* (connection curve should go from topmost monomer upside down and left to right (or right to left) using free space between monomers)
    /* All canvases (7 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected by all possible combinations. 
    */

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    // Closing Library to enlarge canvas
    await Library(page).hideLibrary();
    await openFileAndAddToCanvasMacro(
      page,
      `KET/Side-Chain-Connections/2.4.ket`,
    );
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('2.5 Verify correct display of side-chain connections when two monomers are in different rows', async () => {
    /*
    /* Case 2.5: Verify correct display of side-chain connections when two monomers are in different rows 
    /* (connection curve should go from topmost monomer upside down and left to right (or right to left) using free space between monomers)
    /* All canvases (7 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected by all possible combinations. 
    */

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    // Closing Library to enlarge canvas
    await Library(page).hideLibrary();
    await openFileAndAddToCanvasMacro(
      page,
      `KET/Side-Chain-Connections/2.5.ket`,
    );
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('2.6 Verify correct display of side-chain connections when two monomers are in different rows', async () => {
    /*
    /* Case 2.6: Verify correct display of side-chain connections when two monomers are in different rows 
    /* (connection curve should go from topmost monomer upside down and left to right (or right to left) using free space between monomers)
    /* All canvases (7 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected by all possible combinations. 
    */

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    // Closing Library to enlarge canvas
    await Library(page).hideLibrary();
    await openFileAndAddToCanvasMacro(
      page,
      `KET/Side-Chain-Connections/2.5.ket`,
    );
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('2.7 Verify correct display of side-chain connections when two monomers are in different rows', async () => {
    /*
    /* Case 2.7: Verify correct display of side-chain connections when two monomers are in different rows 
    /* (connection curve should go from topmost monomer upside down and left to right (or right to left) using free space between monomers)
    /* All canvases (7 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected by all possible combinations. 
    */

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    // Closing Library to enlarge canvas
    await Library(page).hideLibrary();
    await openFileAndAddToCanvasMacro(
      page,
      `KET/Side-Chain-Connections/2.5.ket`,
    );
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test(
    '3.1 Check that R1-R1 connection is established between two monomers occupying first positions in different backbone chains',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
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
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Snake,
      );
      // Closing Library to enlarge canvas
      await Library(page).hideLibrary();
      await openFileAndAddToCanvasMacro(
        page,
        `KET/Side-Chain-Connections/3.1.ket`,
      );
      await moveMouseAway(page);
      await takeEditorScreenshot(page, {
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test(
    '3.2 Check that R1-R1 connection is established between two monomers occupying first positions in different backbone chains',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
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

      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Snake,
      );
      // Closing Library to enlarge canvas
      await Library(page).hideLibrary();
      await openFileAndAddToCanvasMacro(
        page,
        `KET/Side-Chain-Connections/3.2.ket`,
      );
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
    },
  );

  test(
    '3.3 Check that R1-R1 connection is established between two monomers occupying first positions in different backbone chains',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
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

      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Snake,
      );
      // Closing Library to enlarge canvas
      await Library(page).hideLibrary();
      await openFileAndAddToCanvasMacro(
        page,
        `KET/Side-Chain-Connections/3.3.ket`,
      );
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
    },
  );

  test(
    '3.4 Check that R1-R1 connection is established between two monomers occupying first positions in different backbone chains',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
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

      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Snake,
      );
      // Closing Library to enlarge canvas
      await Library(page).hideLibrary();
      await openFileAndAddToCanvasMacro(
        page,
        `KET/Side-Chain-Connections/3.4.ket`,
      );
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
    },
  );

  test(
    '3.5 Check that R1-R1 connection is established between two monomers occupying first positions in different backbone chains',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
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

      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Snake,
      );
      // Closing Library to enlarge canvas
      await Library(page).hideLibrary();
      await openFileAndAddToCanvasMacro(
        page,
        `KET/Side-Chain-Connections/3.5.ket`,
      );
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
    },
  );

  test(
    '3.6 Check that R1-R1 connection is established between two monomers occupying first positions in different backbone chains',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
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

      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Snake,
      );
      // Closing Library to enlarge canvas
      await Library(page).hideLibrary();
      await openFileAndAddToCanvasMacro(
        page,
        `KET/Side-Chain-Connections/3.6.ket`,
      );
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
    },
  );

  test(
    '3.7 Check that R1-R1 connection is established between two monomers occupying first positions in different backbone chains',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
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

      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Snake,
      );
      // Closing Library to enlarge canvas
      await Library(page).hideLibrary();
      await openFileAndAddToCanvasMacro(
        page,
        `KET/Side-Chain-Connections/3.7.ket`,
      );
      await moveMouseAway(page);
      // Zoom out to see bottom chians
      await ZoomOutByKeyboard(page);
      await takeEditorScreenshot(page);
    },
  );

  test(
    '4.1 In case of R2-R2 bond connecting the last monomers of the chains the connection should be drawn on the right from these monomers',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
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
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Snake,
      );
      // Closing Library to enlarge canvas
      await Library(page).hideLibrary();
      await openFileAndAddToCanvasMacro(
        page,
        `KET/Side-Chain-Connections/4.1.ket`,
      );
      await moveMouseAway(page);
      await takeEditorScreenshot(page, {
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test(
    '4.2 In case of R2-R2 bond connecting the last monomers of the chains the connection should be drawn on the right from these monomers',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
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

      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Snake,
      );
      // Closing Library to enlarge canvas
      await Library(page).hideLibrary();
      await openFileAndAddToCanvasMacro(
        page,
        `KET/Side-Chain-Connections/4.2.ket`,
      );
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
    },
  );

  test(
    '4.3 In case of R2-R2 bond connecting the last monomers of the chains the connection should be drawn on the right from these monomers',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
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
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Snake,
      );
      // Closing Library to enlarge canvas
      await Library(page).hideLibrary();
      await openFileAndAddToCanvasMacro(
        page,
        `KET/Side-Chain-Connections/4.3.ket`,
      );
      await moveMouseAway(page);
      await takeEditorScreenshot(page, {
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test(
    '4.4 In case of R2-R2 bond connecting the last monomers of the chains the connection should be drawn on the right from these monomers',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
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

      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Snake,
      );
      // Closing Library to enlarge canvas
      await Library(page).hideLibrary();
      await openFileAndAddToCanvasMacro(
        page,
        `KET/Side-Chain-Connections/4.4.ket`,
      );
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
    },
  );

  test(
    '4.5 In case of R2-R2 bond connecting the last monomers of the chains the connection should be drawn on the right from these monomers',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
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

      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Snake,
      );
      // Closing Library to enlarge canvas
      await Library(page).hideLibrary();
      await openFileAndAddToCanvasMacro(
        page,
        `KET/Side-Chain-Connections/4.5.ket`,
      );
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
    },
  );

  test(
    '4.6 In case of R2-R2 bond connecting the last monomers of the chains the connection should be drawn on the right from these monomers',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
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

      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Snake,
      );
      // Closing Library to enlarge canvas
      await Library(page).hideLibrary();
      await openFileAndAddToCanvasMacro(
        page,
        `KET/Side-Chain-Connections/4.6.ket`,
      );
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
    },
  );

  test(
    '4.7 In case of R2-R2 bond connecting the last monomers of the chains the connection should be drawn on the right from these monomers',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
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

      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Snake,
      );
      // Closing Library to enlarge canvas
      await Library(page).hideLibrary();
      await openFileAndAddToCanvasMacro(
        page,
        `KET/Side-Chain-Connections/4.7.ket`,
      );
      await moveMouseAway(page);
      // Zoom out to see bottom chains
      await ZoomOutByKeyboard(page);
      await takeEditorScreenshot(page);
    },
  );

  test('5. Verify side-chain connections alignment and avoidance of overlap (horizontal)', async () => {
    /*
    /* Case 5: Side chain connections may intersect backbone and other side chain connections but should not overlap. 
    /* If more than one side connection is drawn horizontally between two monomer rows, they should be shifted vertically against each other.
    */

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    // Closing Library to enlarge canvas
    await Library(page).hideLibrary();
    await openFileAndAddToCanvasMacro(page, `KET/Side-Chain-Connections/5.ket`);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('6. Verify side-chain connections alignment and avoidance of overlap (vertical)', async () => {
    /*
    /* Case 6: Similarly to point 5, vertically oriented connections should not overlap. 
    /* If multiple connections run vertically in the space between two monomers, they should be shifted horizontally relative to each other.
    /*
    /* All canvases (3 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected from the vertically. 
    */

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    // Closing Library to enlarge canvas
    await Library(page).hideLibrary();
    await openFileAndAddToCanvasMacro(page, `KET/Side-Chain-Connections/6.ket`);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('6.1 Verify side-chain connections alignment and avoidance of overlap (vertical)', async () => {
    /*
    /* Case 6.1: Similarly to point 5, vertically oriented connections should not overlap. 
    /* If multiple connections run vertically in the space between two monomers, they should be shifted horizontally relative to each other.
    /*
    /* All canvases (3 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected from the vertically. 
    */

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    // Closing Library to enlarge canvas
    await Library(page).hideLibrary();
    await openFileAndAddToCanvasMacro(
      page,
      `KET/Side-Chain-Connections/6.1.ket`,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('6.2 Verify side-chain connections alignment and avoidance of overlap (vertical)', async () => {
    /*
    /* Case 6.2: Similarly to point 5, vertically oriented connections should not overlap. 
    /* If multiple connections run vertically in the space between two monomers, they should be shifted horizontally relative to each other.
    /*
    /* All canvases (3 in total) contain all combinations of all types on mnomers (except unresolved monomer because of bug) 
    /* connected from the vertically. 
    */

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    // Closing Library to enlarge canvas
    await Library(page).hideLibrary();
    await openFileAndAddToCanvasMacro(
      page,
      `KET/Side-Chain-Connections/6.2.ket`,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('7.1 Verify handling of RNA monomer connections between R1 of base and R3 of sugar (should be displayed as a straight line (usual way))', async () => {
    /*
    /* Case 7.1: Specific case for RNA monomers: the bond between R1 of base and R3 of sugar should not be 
    /* considered side chain connection and should be displayed as a straight line (usual way). All other 
    /* bonds connected to the base are considered side chain connections.
    /* 
    /* All canvases (5 in total) contain all combinations of connections between base and sugar
    */

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    // Closing Library to enlarge canvas
    await Library(page).hideLibrary();
    await openFileAndAddToCanvasMacro(
      page,
      `KET/Side-Chain-Connections/7.1.ket`,
    );
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('7.2 Verify handling of RNA monomer connections between R1 of base and R3 of sugar (should be displayed as a straight line (usual way))', async () => {
    /*
    /* Case 7.2: Specific case for RNA monomers: the bond between R1 of base and R3 of sugar should not be 
    /* considered side chain connection and should be displayed as a straight line (usual way). All other 
    /* bonds connected to the base are considered side chain connections.
    /* 
    /* All canvases (5 in total) contain all combinations of connections between base and sugar
    */

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    // Closing Library to enlarge canvas
    await Library(page).hideLibrary();
    await openFileAndAddToCanvasMacro(
      page,
      `KET/Side-Chain-Connections/7.2.ket`,
    );
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('7.3 Verify handling of RNA monomer connections between R1 of base and R3 of sugar (should be displayed as a straight line (usual way))', async () => {
    /*
    /* Case 7.3: Specific case for RNA monomers: the bond between R1 of base and R3 of sugar should not be 
    /* considered side chain connection and should be displayed as a straight line (usual way). All other 
    /* bonds connected to the base are considered side chain connections.
    /* 
    /* All canvases (5 in total) contain all combinations of connections between base and sugar
    */

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    // Closing Library to enlarge canvas
    await Library(page).hideLibrary();
    await openFileAndAddToCanvasMacro(
      page,
      `KET/Side-Chain-Connections/7.3.ket`,
    );
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('7.4 Verify handling of RNA monomer connections between R1 of base and R3 of sugar (should be displayed as a straight line (usual way))', async () => {
    /*
    /* Case 7.4: Specific case for RNA monomers: the bond between R1 of base and R3 of sugar should not be 
    /* considered side chain connection and should be displayed as a straight line (usual way). All other 
    /* bonds connected to the base are considered side chain connections.
    /* 
    /* All canvases (5 in total) contain all combinations of connections between base and sugar
    */

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    // Closing Library to enlarge canvas
    await Library(page).hideLibrary();
    await openFileAndAddToCanvasMacro(
      page,
      `KET/Side-Chain-Connections/7.4.ket`,
    );
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('7.5 Verify handling of RNA monomer connections between R1 of base and R3 of sugar (should be displayed as a straight line (usual way))', async () => {
    /*
    /* Case 7.5: Specific case for RNA monomers: the bond between R1 of base and R3 of sugar should not be 
    /* considered side chain connection and should be displayed as a straight line (usual way). All other 
    /* bonds connected to the base are considered side chain connections.
    /* 
    /* All canvases (5 in total) contain all combinations of connections between base and sugar
    */

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    // Closing Library to enlarge canvas
    await Library(page).hideLibrary();
    await openFileAndAddToCanvasMacro(
      page,
      `KET/Side-Chain-Connections/7.5.ket`,
    );
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('8. Verify display of side-chain connections when switching from snake mode to flex mode', async () => {
    /*
    /* Case 8: Verify display of side-chain connections when switching from snake mode to flex mode
    */
    await pageReload(page);
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    // Closing Library to enlarge canvas
    await Library(page).hideLibrary();
    await openFileAndAddToCanvasMacro(page, `KET/Side-Chain-Connections/8.ket`);
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('9. Verify display of side-chain connections when switching from snake mode to sequence mode', async () => {
    /*
    /* Case 9: Verify display of side-chain connections when switching from snake mode to sequence mode
    */

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    // Closing Library to enlarge canvas
    await Library(page).hideLibrary();
    await openFileAndAddToCanvasMacro(page, `KET/Side-Chain-Connections/9.ket`);
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('10. Verify display of side-chain connections when switching from sequence mode to flex mode', async () => {
    /*
    /* Case 10: Verify display of side-chain connections when switching from sequence mode to flex mode
    */

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    // Closing Library to enlarge canvas
    await Library(page).hideLibrary();
    await openFileAndAddToCanvasMacro(
      page,
      `KET/Side-Chain-Connections/10.ket`,
    );
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('11. Verify selection of a single side-chain connection', async () => {
    /*
    /* Case 11: Verify selection of a single side-chain connection
    */

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    // Closing Library to enlarge canvas
    await Library(page).hideLibrary();
    await openFileAndAddToCanvasMacro(
      page,
      `KET/Side-Chain-Connections/11.ket`,
    );

    const randomSideBondToSelect = 12;
    await clickNthConnectionLine(page, randomSideBondToSelect);
    await MonomerPreviewTooltip(page).waitForBecomeVisible();
    await takeEditorScreenshot(page);
  });

  test('12. Verify deletion of a single side-chain connection and Undo', async () => {
    /*
    /* Case 12: Verify deletion of a single side-chain connection and Undo
    */

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    // Closing Library to enlarge canvas
    await Library(page).hideLibrary();
    await openFileAndAddToCanvasMacro(
      page,
      `KET/Side-Chain-Connections/12.ket`,
    );

    const randomSideBondToSelect = 12;
    await clickNthConnectionLine(page, randomSideBondToSelect);
    await CommonLeftToolbar(page).erase();
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
  });

  test('13. Verify deletion of multiple side-chain connections and Undo', async () => {
    /*
    /* Case 13: Verify deletion of multiple side-chain connections and Undo
    */

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    // Closing Library to enlarge canvas
    await Library(page).hideLibrary();
    await openFileAndAddToCanvasMacro(
      page,
      `KET/Side-Chain-Connections/13.ket`,
    );

    // Selectiong ALL 60 available bonds
    const numberOfBondsToSelectAndDelete = 60;
    await CommonLeftToolbar(page).areaSelectionTool(
      SelectionToolType.Rectangle,
    );
    for (let i = 0; i < numberOfBondsToSelectAndDelete; i = i + 1) {
      await page.keyboard.down('Shift');
      await clickNthConnectionLine(page, i);
      await page.keyboard.up('Shift');
    }
    await CommonLeftToolbar(page).erase();
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
  });

  test('14. Verify deletion of a side-chain connection in a complex RNA structure and Undo', async () => {
    /*
    /* Case 14: Verify deletion of a side-chain connection in a complex RNA structure and Undo
    */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    // Closing Library to enlarge canvas
    await Library(page).hideLibrary();
    await openFileAndAddToCanvasMacro(
      page,
      `KET/Side-Chain-Connections/14.ket`,
    );

    // Selecting ALL 53 available bonds
    const numberOfBondsToSelectAndDelete = 53;
    await CommonLeftToolbar(page).areaSelectionTool(
      SelectionToolType.Rectangle,
    );
    for (let i = 0; i < numberOfBondsToSelectAndDelete; i = i + 1) {
      await page.keyboard.down('Shift');
      await clickNthConnectionLine(page, i);
      await page.keyboard.up('Shift');
    }
    await CommonLeftToolbar(page).erase();
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('15. Verify copy-paste of a structure with side-chain connections', async () => {
    /*
    /* Case 15: Verify copy-paste of a structure with side-chain connections
    */

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    // Closing Library to enlarge canvas
    await Library(page).hideLibrary();
    await openFileAndAddToCanvasMacro(
      page,
      `KET/Side-Chain-Connections/15.ket`,
    );
    await takeEditorScreenshot(page);

    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await takeEditorScreenshot(page);
  });

  test('16. Verify saving structure with side-chain connections in SVG Document format', async () => {
    /*
    /*  
      Case 16: Verify saving structure with side-chain connections in SVG Document format
    */
    await Library(page).showLibrary();
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await openFileAndAddToCanvasMacro(
      page,
      `KET/Side-Chain-Connections/16.ket`,
    );
    await verifySVGExport(page);
  });

  test('17. Verify saving structure with side-chain connections in SVG Document format', async () => {
    /*
    /*  
      Case 17: Verify saving structure with side-chain connections in SVG Document format
    */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await openFileAndAddToCanvasMacro(
      page,
      `KET/Side-Chain-Connections/17.ket`,
    );

    await waitForRender(page, async () => {
      await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    });

    await takeEditorScreenshot(page);
  });

  test('18. Check that display of side-chain connections does not visually change when switching between Micro and Macro modes', async () => {
    /*
    /*  
      Case 18: Check that display of side-chain connections does not visually change when switching between Micro and Macro modes
    */
    await waitForRender(page, async () => {
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    });

    await openFileAndAddToCanvasMacro(
      page,
      `KET/Side-Chain-Connections/18.ket`,
    );

    await waitForRender(page, async () => {
      await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    });

    await waitForRender(page, async () => {
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    });

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await takeEditorScreenshot(page);

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page);

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await takeEditorScreenshot(page);
  });

  test('19. Verify saving and opening structure with side-chain connections in KET format', async () => {
    /*
    /*
    /* Case 19: Verify saving and opening structure with side-chain connections in KET format
    */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await openFileAndAddToCanvasMacro(
      page,
      `KET/Side-Chain-Connections/19.ket`,
    );
    await verifyFileExport(
      page,
      'KET/Side-Chain-Connections/19-expected.ket',
      FileType.KET,
    );
  });

  test('20. Verify saving and opening structure with side-chain connections in MOL V3000 format', async () => {
    /*
    /*
    /* Case 20: Verify saving and opening structure with side-chain connections in MOL V3000 format
    */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await openFileAndAddToCanvasMacro(
      page,
      `KET/Side-Chain-Connections/20.ket`,
    );
    await verifyFileExport(
      page,
      'KET/Side-Chain-Connections/20-expected.mol',
      FileType.MOL,
      MolFileFormat.v3000,
      [1],
    );
  });
});
