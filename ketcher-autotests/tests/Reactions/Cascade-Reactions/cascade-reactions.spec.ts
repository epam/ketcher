import { Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  waitForPageInit,
  selectClearCanvasTool,
  openFileAndAddToCanvasAsNewProject,
  selectTopPanelButton,
  TopPanelButton,
  openFile,
  pressButton,
} from '@utils';
import { closeErrorAndInfoModals } from '@utils/common/helpers';
import { FileType, verifyFile } from '@utils/files/receiveFileComparisonData';

test.describe('Cascade Reactions', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();

    await waitForPageInit(page);
  });

  test.afterEach(async ({ context: _ }) => {
    await closeErrorAndInfoModals(page);
    await selectClearCanvasTool(page);
  });

  test.afterAll(async ({ browser }) => {
    await Promise.all(browser.contexts().map((context) => context.close()));
  });

  test('Verify that RDF file with RXN V2000 empty reaction (0:0) can be loaded, nothing is added to Canvas', async () => {
    /* 
    Test case: https://github.com/epam/Indigo/issues/2102
    Description: RDF file with RXN V2000 empty reaction (0:0) can be loaded, nothing is added to Canvas. 
    */
    await openFileAndAddToCanvasAsNewProject(
      'RDF-V2000/rdf-rxn-v2000-single-reaction-0x0.rdf',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that RDF file with RXN V3000 empty reaction (0:0) can be loaded, nothing is added to Canvas', async () => {
    /* 
    Test case: https://github.com/epam/Indigo/issues/2102
    Description: RDF file with RXN V3000 empty reaction (0:0) can be loaded, nothing is added to Canvas. 
    */
    await openFileAndAddToCanvasAsNewProject(
      'RDF-V3000/rdf-rxn-v3000-single-reaction-0x0.rdf',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that RDF file with elements without reaction MOL V2000 cant be loaded and error is displayed', async () => {
    /* 
    Test case: https://github.com/epam/Indigo/issues/2102
    Description: RDF file with elements without reaction MOL V2000 can't be loaded and error is displayed - 
    Convert error! struct data not recognized as molecule, query, reaction or reaction query. 
    We have a bug https://github.com/epam/ketcher/issues/5273
    After fix we should update snapshot.
    */
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('RDF-V2000/rdf-mol-v2000-no-reaction-3-elements.rdf', page);
    await pressButton(page, 'Open as New Project');
    await takeEditorScreenshot(page);
  });

  test('Verify that RDF file with elements without reaction MOL V3000 cant be loaded and error is displayed', async () => {
    /* 
    Test case: https://github.com/epam/Indigo/issues/2102
    Description: RDF file with elements without reaction MOL V3000 can't be loaded and error is displayed - 
    Convert error! struct data not recognized as molecule, query, reaction or reaction query. 
    */
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('RDF-V3000/rdf-mol-v3000-no-reaction-3-elements.rdf', page);
    await pressButton(page, 'Open as New Project');
    await takeEditorScreenshot(page);
  });

  const testCases = [
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-single-reaction-1x0.rdf',
      ketFile: 'KET/rdf-rxn-v2000-single-reaction-1x0-expected.ket',
      testCaseDescription: 'RDF file with RXN V2000 single reactions (1:0)',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-single-reaction-1x1.rdf',
      ketFile: 'KET/rdf-rxn-v2000-single-reaction-1x1-expected.ket',
      testCaseDescription: 'RDF file with RXN V2000 single reactions (1:1)',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-single-reaction-1x2.rdf',
      ketFile: 'KET/rdf-rxn-v2000-single-reaction-1x2-expected.ket',
      testCaseDescription: 'RDF file with RXN V2000 single reactions (1:2)',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-single-reaction-2x0.rdf',
      ketFile: 'KET/rdf-rxn-v2000-single-reaction-2x0-expected.ket',
      testCaseDescription: 'RDF file with RXN V2000 single reactions (2:0)',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-single-reaction-2x1.rdf',
      ketFile: 'KET/rdf-rxn-v2000-single-reaction-2x1-expected.ket',
      testCaseDescription: 'RDF file with RXN V2000 single reactions (2:1)',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-single-reaction-2x2.rdf',
      ketFile: 'KET/rdf-rxn-v2000-single-reaction-2x2-expected.ket',
      testCaseDescription: 'RDF file with RXN V2000 single reactions (2:2)',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-single-reaction-3x1.rdf',
      ketFile: 'KET/rdf-rxn-v2000-single-reaction-3x1-expected.ket',
      testCaseDescription: 'RDF file with RXN V2000 single reactions (3:1)',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-single-reaction-3x3.rdf',
      ketFile: 'KET/rdf-rxn-v2000-single-reaction-3x3-expected.ket',
      testCaseDescription: 'RDF file with RXN V2000 single reactions (3:3)',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-single-reaction-1x0.rdf',
      ketFile: 'KET/rdf-rxn-v3000-single-reaction-1x0-expected.ket',
      testCaseDescription: 'RDF file with RXN V3000 single reactions (1:0)',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-single-reaction-1x1.rdf',
      ketFile: 'KET/rdf-rxn-v3000-single-reaction-1x1-expected.ket',
      testCaseDescription: 'RDF file with RXN V3000 single reactions (1:1)',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-single-reaction-1x2.rdf',
      ketFile: 'KET/rdf-rxn-v3000-single-reaction-1x2-expected.ket',
      testCaseDescription: 'RDF file with RXN V3000 single reactions (1:2)',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-single-reaction-2x0.rdf',
      ketFile: 'KET/rdf-rxn-v3000-single-reaction-2x0-expected.ket',
      testCaseDescription: 'RDF file with RXN V3000 single reactions (2:0)',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-single-reaction-2x1.rdf',
      ketFile: 'KET/rdf-rxn-v3000-single-reaction-2x1-expected.ket',
      testCaseDescription: 'RDF file with RXN V3000 single reactions (2:1)',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-single-reaction-2x2.rdf',
      ketFile: 'KET/rdf-rxn-v3000-single-reaction-2x2-expected.ket',
      testCaseDescription: 'RDF file with RXN V3000 single reactions (2:2)',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-single-reaction-3x1.rdf',
      ketFile: 'KET/rdf-rxn-v3000-single-reaction-3x1-expected.ket',
      testCaseDescription: 'RDF file with RXN V3000 single reactions (3:1)',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-single-reaction-3x3.rdf',
      ketFile: 'KET/rdf-rxn-v3000-single-reaction-3x3-expected.ket',
      testCaseDescription: 'RDF file with RXN V3000 single reactions (3:3)',
    },
  ];

  testCases.forEach(({ rdfFile, ketFile, testCaseDescription }) => {
    test(`Verify that ${testCaseDescription} can be loaded, after that they can be saved/loaded to KET`, async () => {
      /* 
      Test case: https://github.com/epam/Indigo/issues/2102
      Description: ${testCaseDescription} can be loaded, reactions are displayed on Canvas with a single filled arrow 
      and correct positions, after that they can be saved to KET with correct sizes and positions, after that loaded from KET with correct sizes and positions. 
      */
      await openFileAndAddToCanvasAsNewProject(rdfFile, page);
      await takeEditorScreenshot(page);
      await verifyFile(
        page,
        ketFile,
        `tests/test-data/${ketFile}`,
        FileType.KET,
      );
      await openFileAndAddToCanvasAsNewProject(ketFile, page);
      await takeEditorScreenshot(page);
    });
  });

  const testCases1 = [
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-single-reaction-24x24.rdf',
      ketFile: 'KET/rdf-rxn-v2000-single-reaction-24x24-expected.ket',
      testCaseDescription: 'RDF file with RXN V2000 single reactions (24:24)',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-single-reaction-24x24.rdf',
      ketFile: 'KET/rdf-rxn-v3000-single-reaction-24x24-expected.ket',
      testCaseDescription: 'RDF file with RXN V3000 single reactions (24:24)',
    },
  ];

  testCases1.forEach(({ rdfFile, ketFile, testCaseDescription }) => {
    test(`Verify that ${testCaseDescription} can be loaded, after that they can be saved/loaded to KET`, async () => {
      /* 
      Test case: https://github.com/epam/Indigo/issues/2102
      Description: ${testCaseDescription} can be loaded, reactions are displayed on Canvas with a single filled arrow 
      and correct positions, after that they can be saved to KET with correct sizes and positions, after that loaded from KET with correct sizes and positions. 
      */
      await openFileAndAddToCanvasAsNewProject(rdfFile, page);
      await takeEditorScreenshot(page);
      await verifyFile(
        page,
        ketFile,
        `tests/test-data/${ketFile}`,
        FileType.KET,
      );
      await openFileAndAddToCanvasAsNewProject(ketFile, page);
      await takeEditorScreenshot(page);
    });
  });

  const testCases2 = [
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-single-reactions-4.rdf',
      ketFile: 'KET/rdf-rxn-v2000-single-reactions-4-expected.ket',
      testCaseDescription:
        'RDF file with RXN V2000 4 single reactions (1:1, 2:2, 1:0, 2:0)',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-single-reactions-4.rdf',
      ketFile: 'KET/rdf-rxn-v3000-single-reactions-4-expected.ket',
      testCaseDescription:
        'RDF file with RXN V3000 4 single reactions (1:1, 2:2, 1:0, 2:0)',
    },
  ];

  testCases2.forEach(({ rdfFile, ketFile, testCaseDescription }) => {
    test(`Verify that ${testCaseDescription} can be loaded, after that they can be saved/loaded to KET`, async () => {
      /* 
      Test case: https://github.com/epam/Indigo/issues/2102
      Description: ${testCaseDescription} can be loaded, reactions are displayed on Canvas with a single filled arrow 
      and correct positions, after that they can be saved to KET with correct sizes and positions, after that loaded from KET with correct sizes and positions. 
      */
      await openFileAndAddToCanvasAsNewProject(rdfFile, page);
      await takeEditorScreenshot(page);
      await verifyFile(
        page,
        ketFile,
        `tests/test-data/${ketFile}`,
        FileType.KET,
      );
      await openFileAndAddToCanvasAsNewProject(ketFile, page);
      await takeEditorScreenshot(page);
    });
  });

  const testCases3 = [
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-cascade-reaction-2-1-1-atoms.rdf',
      ketFile: 'KET/rdf-rxn-v2000-cascade-reaction-2-1-1-atoms-expected.ket',
      testCaseDescription:
        'RDF file with RXN V2000 single cascade reaction 2-1-1 with atoms',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-cascade-reaction-3-1-1-atoms.rdf',
      ketFile: 'KET/rdf-rxn-v2000-cascade-reaction-3-1-1-atoms-expected.ket',
      testCaseDescription:
        'RDF file with RXN V2000 single cascade reaction 3-1-1 with atoms',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-cascade-reaction-2-1-1-atoms.rdf',
      ketFile: 'KET/rdf-rxn-v3000-cascade-reaction-2-1-1-atoms-expected.ket',
      testCaseDescription:
        'RDF file with RXN V3000 single cascade reaction 2-1-1 with atoms',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-cascade-reaction-3-1-1-atoms.rdf',
      ketFile: 'KET/rdf-rxn-v3000-cascade-reaction-3-1-1-atoms-expected.ket',
      testCaseDescription:
        'RDF file with RXN V3000 single cascade reaction 3-1-1 with atoms',
    },
  ];

  testCases3.forEach(({ rdfFile, ketFile, testCaseDescription }) => {
    test(`Verify that ${testCaseDescription} can be loaded, after that they can be saved/loaded to KET`, async () => {
      /* 
      Test case: https://github.com/epam/Indigo/issues/2102
      Description: ${testCaseDescription} RDF file with RXN V2000/V3000 single cascade reaction 2-1-1 and 3-1-1 with atoms can be loaded, reactions are displayed on Canvas with 
      Multi-Tailed and filled single arrows, verify that sizes of arrows are correct (single arrow: length = 7, Multi-Tailed arrow: head = 6.5, tail = 0.5, spine = 2.5).
      We have a bug https://github.com/epam/Indigo/issues/2583 after fix we need update snapshots and test files.
      */
      await openFileAndAddToCanvasAsNewProject(rdfFile, page);
      await takeEditorScreenshot(page);
      await verifyFile(
        page,
        ketFile,
        `tests/test-data/${ketFile}`,
        FileType.KET,
      );
      await openFileAndAddToCanvasAsNewProject(ketFile, page);
      await takeEditorScreenshot(page);
    });
  });
});
