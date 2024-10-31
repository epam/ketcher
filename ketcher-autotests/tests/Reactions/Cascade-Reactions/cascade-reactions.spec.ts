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
});
