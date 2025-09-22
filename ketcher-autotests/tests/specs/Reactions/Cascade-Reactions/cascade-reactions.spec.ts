/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Page, test, expect } from '@fixtures';
import {
  takeEditorScreenshot,
  waitForPageInit,
  openFileAndAddToCanvasAsNewProject,
  openFile,
  pressButton,
  openFileAndAddToCanvas,
  resetZoomLevelToDefault,
  screenshotBetweenUndoRedo,
  selectPartOfMolecules,
  moveOnAtom,
  dragMouseTo,
  clickOnCanvas,
  waitForRender,
  RdfFileFormat,
} from '@utils';
import {
  copyAndPaste,
  cutAndPaste,
  selectAllStructuresOnCanvas,
} from '@utils/canvas/selectSelection';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { selectRingButton } from '@tests/pages/molecules/BottomToolbar';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { MultiTailedArrowOption } from '@tests/pages/constants/contextMenu/Constants';
import { addTextToCanvas } from '@tests/pages/molecules/canvas/TextEditorDialog';
import { ErrorMessageDialog } from '@tests/pages/common/ErrorMessageDialog';
import { PasteFromClipboardDialog } from '@tests/pages/common/PasteFromClipboardDialog';

async function addTail(page: Page, x: number, y: number) {
  await waitForRender(page, async () => {
    await ContextMenu(page, { x, y }).click(MultiTailedArrowOption.AddNewTail);
  });
}

test.describe('Cascade Reactions', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();

    await waitForPageInit(page);
  });

  test.afterEach(async ({ context: _ }) => {
    await CommonTopLeftToolbar(page).clearCanvas();
    await resetZoomLevelToDefault(page);
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
      page,
      'RDF-V2000/rdf-rxn-v2000-single-reaction-0x0.rdf',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that RDF file with RXN V3000 empty reaction (0:0) can be loaded, nothing is added to Canvas', async () => {
    /* 
    Test case: https://github.com/epam/Indigo/issues/2102
    Description: RDF file with RXN V3000 empty reaction (0:0) can be loaded, nothing is added to Canvas. 
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'RDF-V3000/rdf-rxn-v3000-single-reaction-0x0.rdf',
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
    await openFileAndAddToCanvasAsNewProject(
      page,
      'RDF-V2000/rdf-mol-v2000-no-reaction-3-elements.rdf',
      // error expected
      true,
    );
    const errorMessage = await ErrorMessageDialog(page).getErrorMessage();
    expect(errorMessage).toContain('Molfile version unknown:');
    await ErrorMessageDialog(page).close();
    await PasteFromClipboardDialog(page).cancel();
  });

  test('Verify that RDF file with elements without reaction MOL V3000 cant be loaded and error is displayed', async () => {
    /* 
    Test case: https://github.com/epam/Indigo/issues/2102
    Description: RDF file with elements without reaction MOL V3000 can't be loaded and error is displayed - 
    Convert error! struct data not recognized as molecule, query, reaction or reaction query. 
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'RDF-V3000/rdf-mol-v3000-no-reaction-3-elements.rdf',
      // error expected
      true,
    );
    const errorMessage = await ErrorMessageDialog(page).getErrorMessage();
    expect(errorMessage).toContain(
      "Convert error!\nGiven string could not be loaded as (query or plain) molecule or reaction, see the error messages: 'scanner: readIntFix(3): invalid number representation: \"M  \"', 'RXN loader: bad header ', 'SEQUENCE loader: Unknown polymer type ''.', 'scanner: readIntFix(3): invalid number representation: \"M  \"', 'scanner: readIntFix(3): invalid number representation: \"M  \"', 'RXN loader: bad header '",
    );
    await ErrorMessageDialog(page).close();
    await PasteFromClipboardDialog(page).cancel();
  });

  const testCases = [
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-single-reaction-1x0.rdf',
      ketFile: 'KET/rdf-rxn-v2000-single-reaction-1x0-expected.ket',
      testCaseDescription: '1. RDF file with RXN V2000 single reactions (1:0)',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-single-reaction-1x1.rdf',
      ketFile: 'KET/rdf-rxn-v2000-single-reaction-1x1-expected.ket',
      testCaseDescription: '2. RDF file with RXN V2000 single reactions (1:1)',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-single-reaction-1x2.rdf',
      ketFile: 'KET/rdf-rxn-v2000-single-reaction-1x2-expected.ket',
      testCaseDescription: '3. RDF file with RXN V2000 single reactions (1:2)',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-single-reaction-2x0.rdf',
      ketFile: 'KET/rdf-rxn-v2000-single-reaction-2x0-expected.ket',
      testCaseDescription: '4. RDF file with RXN V2000 single reactions (2:0)',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-single-reaction-2x1.rdf',
      ketFile: 'KET/rdf-rxn-v2000-single-reaction-2x1-expected.ket',
      testCaseDescription: '5. RDF file with RXN V2000 single reactions (2:1)',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-single-reaction-2x2.rdf',
      ketFile: 'KET/rdf-rxn-v2000-single-reaction-2x2-expected.ket',
      testCaseDescription: '6. RDF file with RXN V2000 single reactions (2:2)',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-single-reaction-3x1.rdf',
      ketFile: 'KET/rdf-rxn-v2000-single-reaction-3x1-expected.ket',
      testCaseDescription: '7. RDF file with RXN V2000 single reactions (3:1)',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-single-reaction-3x3.rdf',
      ketFile: 'KET/rdf-rxn-v2000-single-reaction-3x3-expected.ket',
      testCaseDescription: '8. RDF file with RXN V2000 single reactions (3:3)',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-single-reaction-1x0.rdf',
      ketFile: 'KET/rdf-rxn-v3000-single-reaction-1x0-expected.ket',
      testCaseDescription: '9. RDF file with RXN V3000 single reactions (1:0)',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-single-reaction-1x1.rdf',
      ketFile: 'KET/rdf-rxn-v3000-single-reaction-1x1-expected.ket',
      testCaseDescription: '10. RDF file with RXN V3000 single reactions (1:1)',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-single-reaction-1x2.rdf',
      ketFile: 'KET/rdf-rxn-v3000-single-reaction-1x2-expected.ket',
      testCaseDescription: '11. RDF file with RXN V3000 single reactions (1:2)',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-single-reaction-2x0.rdf',
      ketFile: 'KET/rdf-rxn-v3000-single-reaction-2x0-expected.ket',
      testCaseDescription: '12. RDF file with RXN V3000 single reactions (2:0)',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-single-reaction-2x1.rdf',
      ketFile: 'KET/rdf-rxn-v3000-single-reaction-2x1-expected.ket',
      testCaseDescription: '13. RDF file with RXN V3000 single reactions (2:1)',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-single-reaction-2x2.rdf',
      ketFile: 'KET/rdf-rxn-v3000-single-reaction-2x2-expected.ket',
      testCaseDescription: '14. RDF file with RXN V3000 single reactions (2:2)',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-single-reaction-3x1.rdf',
      ketFile: 'KET/rdf-rxn-v3000-single-reaction-3x1-expected.ket',
      testCaseDescription: '15. RDF file with RXN V3000 single reactions (3:1)',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-single-reaction-3x3.rdf',
      ketFile: 'KET/rdf-rxn-v3000-single-reaction-3x3-expected.ket',
      testCaseDescription: '16. RDF file with RXN V3000 single reactions (3:3)',
    },
  ];

  testCases.forEach(({ rdfFile, ketFile, testCaseDescription }) => {
    test(`${testCaseDescription} can be loaded, after that they can be saved/loaded to KET`, async () => {
      /* 
      Test case: https://github.com/epam/Indigo/issues/2102
      Description: ${testCaseDescription} can be loaded, reactions are displayed on Canvas with a single filled arrow 
      and correct positions, after that they can be saved to KET with correct sizes and positions, after that loaded from KET with correct sizes and positions.
      Case:
        1. Open RDF file
        2. Save and verify KET file
        3. Open saved KET file 
      */
      await openFileAndAddToCanvasAsNewProject(page, rdfFile);
      await takeEditorScreenshot(page);
      await verifyFileExport(page, ketFile, FileType.KET);
      await openFileAndAddToCanvasAsNewProject(page, ketFile);
      await takeEditorScreenshot(page);
    });
  });

  const testCases1 = [
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-single-reaction-24x24.rdf',
      ketFile: 'KET/rdf-rxn-v2000-single-reaction-24x24-expected.ket',
      testCaseDescription:
        '1. RDF file with RXN V2000 single reactions (24:24)',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-single-reaction-24x24.rdf',
      ketFile: 'KET/rdf-rxn-v3000-single-reaction-24x24-expected.ket',
      testCaseDescription:
        '2. RDF file with RXN V3000 single reactions (24:24)',
    },
  ];

  testCases1.forEach(({ rdfFile, ketFile, testCaseDescription }) => {
    test(`${testCaseDescription} can be loaded, after that they can be saved/loaded to KET`, async () => {
      /* 
      Test case: https://github.com/epam/Indigo/issues/2102
      Description: ${testCaseDescription} can be loaded, reactions are displayed on Canvas with a single filled arrow 
      and correct positions, after that they can be saved to KET with correct sizes and positions, after that loaded from KET with correct sizes and positions. 
      Case:
        1. Open RDF file
        2. Save and verify KET file
        3. Open saved KET file
      */
      await openFileAndAddToCanvasAsNewProject(page, rdfFile);
      await takeEditorScreenshot(page);
      await verifyFileExport(page, ketFile, FileType.KET);
      await openFileAndAddToCanvasAsNewProject(page, ketFile);
      await takeEditorScreenshot(page);
    });
  });

  const testCases2 = [
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-single-reactions-4.rdf',
      ketFile: 'KET/rdf-rxn-v2000-single-reactions-4-expected.ket',
      testCaseDescription:
        '1. RDF file with RXN V2000 4 single reactions (1:1, 2:2, 1:0, 2:0)',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-single-reactions-4.rdf',
      ketFile: 'KET/rdf-rxn-v3000-single-reactions-4-expected.ket',
      testCaseDescription:
        '2. RDF file with RXN V3000 4 single reactions (1:1, 2:2, 1:0, 2:0)',
    },
  ];

  testCases2.forEach(({ rdfFile, ketFile, testCaseDescription }) => {
    test(`${testCaseDescription} can be loaded, after that they can be saved/loaded to KET`, async () => {
      /* 
      Test case: https://github.com/epam/Indigo/issues/2102
      Description: ${testCaseDescription} can be loaded, reactions are displayed on Canvas with a single filled arrow 
      and correct positions, after that they can be saved to KET with correct sizes and positions, after that loaded from KET with correct sizes and positions.
      Case:
        1. Open RDF file
        2. Save and verify KET file
        3. Open saved KET file 
      */
      await openFileAndAddToCanvasAsNewProject(page, rdfFile);
      await takeEditorScreenshot(page);
      await verifyFileExport(page, ketFile, FileType.KET);
      await openFileAndAddToCanvasAsNewProject(page, ketFile);
      await takeEditorScreenshot(page);
    });
  });

  const testCases3 = [
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-cascade-reaction-2-1-1-atoms.rdf',
      ketFile: 'KET/rdf-rxn-v2000-cascade-reaction-2-1-1-atoms-expected.ket',
      testCaseDescription:
        '1. RDF file with RXN V2000 single cascade reaction 2-1-1 with atoms',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-cascade-reaction-3-1-1-atoms.rdf',
      ketFile: 'KET/rdf-rxn-v2000-cascade-reaction-3-1-1-atoms-expected.ket',
      testCaseDescription:
        '2. RDF file with RXN V2000 single cascade reaction 3-1-1 with atoms',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-cascade-reaction-2-1-1-atoms.rdf',
      ketFile: 'KET/rdf-rxn-v3000-cascade-reaction-2-1-1-atoms-expected.ket',
      testCaseDescription:
        '3. RDF file with RXN V3000 single cascade reaction 2-1-1 with atoms',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-cascade-reaction-3-1-1-atoms.rdf',
      ketFile: 'KET/rdf-rxn-v3000-cascade-reaction-3-1-1-atoms-expected.ket',
      testCaseDescription:
        '4. RDF file with RXN V3000 single cascade reaction 3-1-1 with atoms',
    },
  ];

  testCases3.forEach(({ rdfFile, ketFile, testCaseDescription }) => {
    test(`${testCaseDescription} can be loaded, after that they can be saved/loaded to KET`, async () => {
      /* 
      Test case: https://github.com/epam/Indigo/issues/2102
      Description: ${testCaseDescription} RDF file with RXN V2000/V3000 single cascade reaction 2-1-1 and 3-1-1 with atoms can be loaded, reactions are displayed on Canvas with 
      Multi-Tailed and filled single arrows, verify that sizes of arrows are correct (single arrow: length = 7, Multi-Tailed arrow: head = 6.5, tail = 0.5, spine = 2.5).
      We have a bug https://github.com/epam/Indigo/issues/2583 after fix we need update snapshots and test files.
      Case:
        1. Open RDF file
        2. Save and verify KET file
        3. Open saved KET file
      */
      await openFileAndAddToCanvasAsNewProject(page, rdfFile);
      await takeEditorScreenshot(page);
      await verifyFileExport(page, ketFile, FileType.KET);
      await openFileAndAddToCanvasAsNewProject(page, ketFile);
      await takeEditorScreenshot(page);
    });
  });

  const testCases4 = [
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-cascade-reaction-2-1-1.rdf',
      ketFile: 'KET/rdf-rxn-v2000-cascade-reaction-2-1-1-expected.ket',
      testCaseDescription:
        '1. RDF file with RXN V2000 single cascade reaction 2-1-1',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-cascade-reaction-2-2-1.rdf',
      ketFile: 'KET/rdf-rxn-v2000-cascade-reaction-2-2-1-expected.ket',
      testCaseDescription:
        '2. RDF file with RXN V2000 single cascade reaction 2-2-1',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-cascade-reaction-2-3-1.rdf',
      ketFile: 'KET/rdf-rxn-v2000-cascade-reaction-2-3-1-expected.ket',
      testCaseDescription:
        '3. RDF file with RXN V2000 single cascade reaction 2-3-1',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-cascade-reaction-2-1-2-1.rdf',
      ketFile: 'KET/rdf-rxn-v2000-cascade-reaction-2-1-2-1-expected.ket',
      testCaseDescription:
        '4. RDF file with RXN V2000 single cascade reaction 2-1-2-1',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-cascade-reaction-2-2-3-1.rdf',
      ketFile: 'KET/rdf-rxn-v2000-cascade-reaction-2-2-3-1-expected.ket',
      testCaseDescription:
        '5. RDF file with RXN V2000 single cascade reaction 2-2-3-1',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-cascade-reaction-2-3-4-1.rdf',
      ketFile: 'KET/rdf-rxn-v2000-cascade-reaction-2-3-4-1-expected.ket',
      testCaseDescription:
        '6. RDF file with RXN V2000 single cascade reaction 2-3-4-1',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-cascade-reaction-7-1.rdf',
      ketFile: 'KET/rdf-rxn-v2000-cascade-reaction-7-1-expected.ket',
      testCaseDescription:
        '7. RDF file with RXN V2000 single cascade reaction 7-1',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-cascade-reaction-tails-5.rdf',
      ketFile: 'KET/rdf-rxn-v2000-cascade-reaction-tails-5-expected.ket',
      testCaseDescription:
        '8. RDF file with RXN V2000 single cascade reaction 5 tails',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-cascade-reaction-tails-12.rdf',
      ketFile: 'KET/rdf-rxn-v2000-cascade-reaction-tails-12-expected.ket',
      testCaseDescription:
        '9. RDF file with RXN V2000 single cascade reaction 12 tails',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-cascade-reaction-2-1-1.rdf',
      ketFile: 'KET/rdf-rxn-v3000-cascade-reaction-2-1-1-expected.ket',
      testCaseDescription:
        '10. RDF file with RXN V3000 single cascade reaction 2-1-1',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-cascade-reaction-2-2-1.rdf',
      ketFile: 'KET/rdf-rxn-v3000-cascade-reaction-2-2-1-expected.ket',
      testCaseDescription:
        '11. RDF file with RXN V3000 single cascade reaction 2-2-1',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-cascade-reaction-2-3-1.rdf',
      ketFile: 'KET/rdf-rxn-v3000-cascade-reaction-2-3-1-expected.ket',
      testCaseDescription:
        '12. RDF file with RXN V3000 single cascade reaction 2-3-1',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-cascade-reaction-2-1-2-1.rdf',
      ketFile: 'KET/rdf-rxn-v3000-cascade-reaction-2-1-2-1-expected.ket',
      testCaseDescription:
        '13. RDF file with RXN V3000 single cascade reaction 2-1-2-1',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-cascade-reaction-2-2-3-1.rdf',
      ketFile: 'KET/rdf-rxn-v3000-cascade-reaction-2-2-3-1-expected.ket',
      testCaseDescription:
        '14. RDF file with RXN V3000 single cascade reaction 2-2-3-1',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-cascade-reaction-2-3-4-1.rdf',
      ketFile: 'KET/rdf-rxn-v3000-cascade-reaction-2-3-4-1-expected.ket',
      testCaseDescription:
        '15. RDF file with RXN V3000 single cascade reaction 2-3-4-1',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-cascade-reaction-7-1.rdf',
      ketFile: 'KET/rdf-rxn-v3000-cascade-reaction-7-1-expected.ket',
      testCaseDescription:
        '16. RDF file with RXN V3000 single cascade reaction 7-1',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-cascade-reaction-tails-5.rdf',
      ketFile: 'KET/rdf-rxn-v3000-cascade-reaction-tails-5-expected.ket',
      testCaseDescription:
        '17. RDF file with RXN V3000 single cascade reaction 5 tails',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-cascade-reaction-tails-12.rdf',
      ketFile: 'KET/rdf-rxn-v3000-cascade-reaction-tails-12-expected.ket',
      testCaseDescription:
        '18. RDF file with RXN V3000 single cascade reaction 12 tails',
    },
  ];

  testCases4.forEach(({ rdfFile, ketFile, testCaseDescription }) => {
    test(`${testCaseDescription} can be loaded, after that they can be saved/loaded to KET`, async () => {
      /* 
      Test case: https://github.com/epam/Indigo/issues/2102
      Description: ${testCaseDescription} RDF file with RXN V2000/V3000 single cascade reaction 2-1-1 and 3-1-1 with atoms can be loaded, reactions are displayed on Canvas with 
      Multi-Tailed and filled single arrows, verify that sizes of arrows are correct (single arrow: length = 7, Multi-Tailed arrow: head = 6.5, tail = 0.5, spine = 2.5).
      Case:
        1. Open RDF file
        2. Save and verify KET file
        3. Open saved KET file
      */
      await openFileAndAddToCanvasAsNewProject(page, rdfFile);
      await takeEditorScreenshot(page);
      await verifyFileExport(page, ketFile, FileType.KET);
      await openFileAndAddToCanvasAsNewProject(page, ketFile);
      await takeEditorScreenshot(page);
    });
  });

  const testCases5 = [
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-cascade-reactions-3.rdf',
      ketFile: 'KET/rdf-rxn-v2000-cascade-reactions-3-expected.ket',
      testCaseDescription:
        '1. RDF file with RXN V2000 3 cascade reactions together',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-cascade-reactions-2-single-2.rdf',
      ketFile: 'KET/rdf-rxn-v2000-cascade-reactions-2-single-2-expected.ket',
      testCaseDescription:
        '2. RDF file with RXN V2000 2 cascade and 2 single reactions',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-cascade-reactions-3.rdf',
      ketFile: 'KET/rdf-rxn-v3000-cascade-reactions-3-expected.ket',
      testCaseDescription:
        '3. RDF file with RXN V3000 3 cascade reactions together',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-cascade-reactions-2-single-2.rdf',
      ketFile: 'KET/rdf-rxn-v3000-cascade-reactions-2-single-2-expected.ket',
      testCaseDescription:
        '4. RDF file with RXN V3000 2 cascade and 2 single reactions',
    },
  ];

  testCases5.forEach(({ rdfFile, ketFile, testCaseDescription }) => {
    test(`${testCaseDescription} can be loaded, after that they can be saved/loaded to KET`, async () => {
      /* 
      Test case: https://github.com/epam/Indigo/issues/2102
      Description: ${testCaseDescription} can be loaded, reactions are displayed on Canvas with a single filled arrow 
      and correct positions, after that they can be saved to KET with correct sizes and positions, after that loaded from KET with correct sizes and positions.
      Case:
        1. Open RDF file
        2. Save and verify KET file
        3. Open saved KET file
      */
      await openFileAndAddToCanvasAsNewProject(page, rdfFile);
      await takeEditorScreenshot(page);
      await verifyFileExport(page, ketFile, FileType.KET);
      await openFileAndAddToCanvasAsNewProject(page, ketFile);
      await takeEditorScreenshot(page);
    });
  });

  const testCases6 = [
    {
      rdfFile:
        'RDF-V2000/rdf-rxn-v2000-prod-1-react-2-2+-elements-case-1-new.rdf',
      ketFile:
        'KET/rdf-rxn-v2000-prod-1-react-2-2+-elements-case-1-new-expected.ket',
      testCaseDescription:
        '1. RDF file with RXN V2000 3 reactions where 1 product of 1 reaction is matched to 2 same reactants of another 2 reactions by 2+ elements (case 1)',
    },
    {
      rdfFile:
        'RDF-V2000/rdf-rxn-v2000-prod-1-react-2-2+-elements-case-2-new.rdf',
      ketFile:
        'KET/rdf-rxn-v2000-prod-1-react-2-2+-elements-case-2-new-expected.ket',
      testCaseDescription:
        '2. RDF file with RXN V2000 3 reactions where 1 product of 1 reaction is matched to 2 same reactants of another 2 reactions by 2+ elements (case 2)',
    },
    {
      rdfFile:
        'RDF-V2000/rdf-rxn-v2000-prod-1-react-2-2+-elements-case-3-new.rdf',
      ketFile:
        'KET/rdf-rxn-v2000-prod-1-react-2-2+-elements-case-3-new-expected.ket',
      testCaseDescription:
        '3. RDF file with RXN V2000 3 reactions where 1 product of 1 reaction is matched to 2 same reactants of another 2 reactions by 2+ elements (case 3)',
    },
    {
      rdfFile:
        'RDF-V2000/rdf-rxn-v2000-prod-1-react-2-2+-elements-case-4-new.rdf',
      ketFile:
        'KET/rdf-rxn-v2000-prod-1-react-2-2+-elements-case-4-new-expected.ket',
      testCaseDescription:
        '4. RDF file with RXN V2000 3 reactions where 1 product of 1 reaction is matched to 2 same reactants of another 2 reactions by 2+ elements (case 4)',
    },
    {
      rdfFile:
        'RDF-V2000/rdf-rxn-v2000-prod-1-react-2-2+-elements-case-5-new.rdf',
      ketFile:
        'KET/rdf-rxn-v2000-prod-1-react-2-2+-elements-case-5-new-expected.ket',
      testCaseDescription:
        '5. RDF file with RXN V2000 3 reactions where 1 product of 1 reaction is matched to 2 same reactants of another 2 reactions by 2+ elements (case 5)',
    },
    {
      rdfFile:
        'RDF-V2000/rdf-rxn-v2000-prod-1-react-2-2+-elements-case-6-new.rdf',
      ketFile:
        'KET/rdf-rxn-v2000-prod-1-react-2-2+-elements-case-6-new-expected.ket',
      testCaseDescription:
        '6. RDF file with RXN V2000 3 reactions where 1 product of 1 reaction is matched to 2 same reactants of another 2 reactions by 2+ elements (case 6)',
    },
    {
      rdfFile:
        'RDF-V2000/rdf-rxn-v2000-cascade-1-or-reactions-2-case-1-new.rdf',
      ketFile:
        'KET/rdf-rxn-v2000-cascade-1-or-reactions-2-case-1-new-expected.ket',
      testCaseDescription:
        '7. RDF file with RXN V2000 3 reactions where 2 products of 2 reactions are matched to 2 same reactants of 2 reactions by 2+ elements (case 1)',
    },
    {
      rdfFile:
        'RDF-V2000/rdf-rxn-v2000-cascade-1-or-reactions-2-case-2-new.rdf',
      ketFile:
        'KET/rdf-rxn-v2000-cascade-1-or-reactions-2-case-2-new-expected.ket',
      testCaseDescription:
        '8. RDF file with RXN V2000 3 reactions where 2 products of 2 reactions are matched to 2 same reactants of 2 reactions by 2+ elements (case 2)',
    },
    {
      rdfFile:
        'RDF-V2000/rdf-rxn-v2000-cascade-1-or-reactions-2-case-3-new.rdf',
      ketFile:
        'KET/rdf-rxn-v2000-cascade-1-or-reactions-2-case-3-new-expected.ket',
      testCaseDescription:
        '9. RDF file with RXN V2000 3 reactions where 2 products of 2 reactions are matched to 2 same reactants of 2 reactions by 2+ elements (case 3)',
    },
    {
      rdfFile:
        'RDF-V2000/rdf-rxn-v2000-cascade-1-or-reactions-2-case-4-new.rdf',
      ketFile:
        'KET/rdf-rxn-v2000-cascade-1-or-reactions-2-case-4-new-expected.ket',
      testCaseDescription:
        '10. RDF file with RXN V2000 3 reactions where 2 products of 2 reactions are matched to 2 same reactants of 2 reactions by 2+ elements (case 4)',
    },
    {
      rdfFile:
        'RDF-V2000/rdf-rxn-v2000-cascade-1-or-reactions-2-case-5-new.rdf',
      ketFile:
        'KET/rdf-rxn-v2000-cascade-1-or-reactions-2-case-5-new-expected.ket',
      testCaseDescription:
        '11. RDF file with RXN V2000 3 reactions where 2 products of 2 reactions are matched to 2 same reactants of 2 reactions by 2+ elements (case 5)',
    },
    {
      rdfFile:
        'RDF-V2000/rdf-rxn-v2000-cascade-1-or-reactions-2-case-6-new.rdf',
      ketFile:
        'KET/rdf-rxn-v2000-cascade-1-or-reactions-2-case-6-new-expected.ket',
      testCaseDescription:
        '12. RDF file with RXN V2000 3 reactions where 2 products of 2 reactions are matched to 2 same reactants of 2 reactions by 2+ elements (case 6)',
    },
  ];

  testCases6.forEach(({ rdfFile, ketFile, testCaseDescription }) => {
    test(`${testCaseDescription} can be loaded, after that they can be saved/loaded to KET`, async () => {
      /* 
      Test case: https://github.com/epam/Indigo/issues/2102
      Description: ${testCaseDescription} can be loaded, reactions are displayed on Canvas with a single filled arrow 
      and correct positions, after that they can be saved to KET with correct sizes and positions, after that loaded from KET with correct sizes and positions.
      Case:
        1. Open RDF file
        2. Save and verify KET file
        3. Open saved KET file
      */
      await openFileAndAddToCanvasAsNewProject(page, rdfFile);
      await takeEditorScreenshot(page);
      await verifyFileExport(page, ketFile, FileType.KET);
      await openFileAndAddToCanvasAsNewProject(page, ketFile);
      await takeEditorScreenshot(page);
    });
  });

  test('Verify that Cascade and Single reactions can be added to selected place on Canvas from 2 different RDF files', async () => {
    /* 
    Test case: https://github.com/epam/Indigo/issues/2102
    Description: Cascade and Single reactions can be added to selected place on Canvas from 2 different RDF files with correct positions 
    and they can be saved together to .ket file with correct parameters.
    Case:
        1. Open two RDF file v2000 and v3000
        2. Save and verify KET file
        3. Open saved KET file 
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'RDF-V2000/rdf-rxn-v2000-cascade-reaction-2-1-1.rdf',
    );
    await openFileAndAddToCanvas(
      page,
      'RDF-V3000/rdf-rxn-v3000-single-reaction-1x1.rdf',
      200,
      100,
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'KET/rdf-rxn-v2000-cascade-reaction-2-1-1-and-rdf-rxn-v3000-single-reaction-1x1.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/rdf-rxn-v2000-cascade-reaction-2-1-1-and-rdf-rxn-v3000-single-reaction-1x1.ket',
    );
    await takeEditorScreenshot(page);
  });

  const testCases7 = [
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-single-reaction-reagent-1x1x1.rdf',
      testCaseDescription:
        '1. RDF RXN V2000 file with reaction with reagents (1:1:1)',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-single-reaction-reagents-2x2x2.rdf',
      testCaseDescription:
        '2. RDF RXN V2000 file with reaction with reagents (2:2:2)',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-single-reaction-reagent-1x1x1.rdf',
      testCaseDescription:
        '3. RDF RXN V3000 file with reaction with reagents (1:1:1)',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-single-reaction-reagents-2x2x2.rdf',
      testCaseDescription:
        '4. RDF RXN V3000 file with reaction with reagents (2:2:2)',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-cascade-reaction-2-1-1-reagents.rdf',
      testCaseDescription:
        '5. RDF RXN V2000 file with cascade reaction with reagents',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-cascade-reaction-2-1-1-reagents.rdf',
      testCaseDescription:
        '6. RDF RXN V3000 file with cascade reaction with reagents',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-cascade-1-single-1-reagents.rdf',
      testCaseDescription:
        '7. RDF RXN V2000 file with cascade and single reactions with reagents',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-cascade-1-single-1-reagents.rdf',
      testCaseDescription:
        '8. RDF RXN V3000 file with cascade and single reactions with reagents',
    },
  ];

  testCases7.forEach(({ rdfFile, testCaseDescription }) => {
    test(`Load ${testCaseDescription} verify that reagents are ignored and not added to Canvas`, async () => {
      /* 
      Test case: https://github.com/epam/Indigo/issues/2102
      Description: Reagents are ignored and not added to Canvas.
      Case:
        1. Open RDF file
        2. Take screenshot
      */
      await openFileAndAddToCanvasAsNewProject(page, rdfFile);
      await takeEditorScreenshot(page);
    });
  });

  const testCases8 = [
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-root-reaction-with-same-reactants.rdf',
      ketFile:
        'KET/rdf-rxn-v2000-root-reaction-with-same-reactants-expected.ket',
      testCaseDescription:
        '1. RXN V2000 file with reactions where root reaction has the same reactants',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-single-reaction-with-abbreviation.rdf',
      ketFile:
        'KET/rdf-rxn-v2000-single-reaction-with-abbreviation-expected.ket',
      testCaseDescription:
        '2. RDF RXN V2000 file with several reactants and products with abbreviations',
    },
  ];

  testCases8.forEach(({ rdfFile, ketFile, testCaseDescription }) => {
    test(`${testCaseDescription} can be loaded, after that they can be saved/loaded to KET`, async () => {
      /* 
      Test case: https://github.com/epam/Indigo/issues/2102
      Description: ${testCaseDescription} can be loaded, reactions are displayed on Canvas with a single filled arrow 
      and correct positions, after that they can be saved to KET with correct sizes and positions, after that loaded from KET with correct sizes and positions.
      We have a bugs: 
      https://github.com/epam/Indigo/issues/2406
      https://github.com/epam/Indigo/issues/2320
      https://github.com/epam/Indigo/issues/2408
      After fix we should update snapshots and test files.
      Case:
        1. Open RDF file
        2. Save and verify KET file
        3. Open saved KET file
      */
      await openFileAndAddToCanvasAsNewProject(page, rdfFile);
      await takeEditorScreenshot(page);
      await verifyFileExport(page, ketFile, FileType.KET);
      await openFileAndAddToCanvasAsNewProject(page, ketFile);
      await takeEditorScreenshot(page);
    });
  });

  const testCases9 = [
    {
      testName:
        '1. Verify that Cascade Reaction is correctly displayed in RDF RXN V2000 format in Open Structure Preview',
      rdfFile: 'RDF-V2000/rdf-mol-v2000-no-reaction-3-elements.rdf',
    },
    {
      testName:
        '2. Verify that Cascade Reaction is correctly displayed in RDF RXN V3000 format in Open Structure Preview',
      rdfFile: 'RDF-V3000/rdf-mol-v3000-no-reaction-3-elements.rdf',
    },
  ];

  testCases9.forEach(({ testName, rdfFile }) => {
    test(testName, async () => {
      /* 
      Test case: https://github.com/epam/Indigo/issues/2102
      Description: Cascade Reaction is correctly displayed in RDF RXN V2000/V3000 format in Open Structure Preview
      Case:
        1. Open RDF file Open Structure Preview
        2. Take screenshot
      */
      await CommonTopLeftToolbar(page).openFile();
      await openFile(page, rdfFile);
      await takeEditorScreenshot(page);
    });
  });

  const testCases10 = [
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-cascade-reaction-2-1-1-reagents.rdf',
      testCaseDescription:
        '1. RDF RXN V2000 file with cascade reaction with reagents',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-cascade-reaction-2-1-1-reagents.rdf',
      testCaseDescription:
        '2. RDF RXN V3000 file with cascade reaction with reagents',
    },
  ];

  testCases10.forEach(({ rdfFile, testCaseDescription }) => {
    test(`${testCaseDescription} can be loaded, after that they can be zoomed in/out (20, 400, 100)`, async () => {
      /* 
      Test case: https://github.com/epam/Indigo/issues/2102
      Description: ${testCaseDescription} can be loaded, reactions are displayed on Canvas with a single filled arrow 
      and correct positions, after that they can be zoomed in/out (20, 400, 100).
      Case:
        1. Open RDF file
        2. Zoom to 20, 400, 100%
      */
      await openFileAndAddToCanvasAsNewProject(page, rdfFile);
      await takeEditorScreenshot(page);
      await CommonTopRightToolbar(page).setZoomInputValue('20');
      await takeEditorScreenshot(page);
      await CommonTopRightToolbar(page).setZoomInputValue('400');
      await takeEditorScreenshot(page);
      await CommonTopRightToolbar(page).setZoomInputValue('100');
      await takeEditorScreenshot(page);
    });
  });

  const testCases11 = [
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-cascade-reaction-2-1-1-reagents.rdf',
      testCaseDescription:
        '1. RDF RXN V2000 file with cascade reaction with reagents',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-cascade-reaction-2-1-1-reagents.rdf',
      testCaseDescription:
        '2. RDF RXN V3000 file with cascade reaction with reagents',
    },
  ];

  testCases11.forEach(({ rdfFile, testCaseDescription }) => {
    test(`${testCaseDescription} can be loaded, after that they can be Undo/Redo`, async () => {
      /* 
      Test case: https://github.com/epam/Indigo/issues/2102
      Description: ${testCaseDescription} can be loaded, reactions are displayed on Canvas with a single filled arrow 
      and correct positions, after that they can be Undo/Redo.
      Case:
        1. Open RDF file
        2. Perform Undo and Redo actions
      */
      await openFileAndAddToCanvasAsNewProject(page, rdfFile);
      await takeEditorScreenshot(page);
      await screenshotBetweenUndoRedo(page);
      await takeEditorScreenshot(page);
    });
  });

  const testCases12 = [
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-cascade-reaction-2-1-1-reagents.rdf',
      testCaseDescription:
        '1. RDF RXN V2000 file with cascade reaction with reagents',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-cascade-reaction-2-1-1-reagents.rdf',
      testCaseDescription:
        '2. RDF RXN V3000 file with cascade reaction with reagents',
    },
  ];

  testCases12.forEach(({ rdfFile, testCaseDescription }) => {
    test(`${testCaseDescription} can be loaded, after that they can be deleted by Erase tool`, async () => {
      /* 
      Test case: https://github.com/epam/Indigo/issues/2102
      Description: ${testCaseDescription} can be loaded, reactions are displayed on Canvas with a single filled arrow 
      and correct positions, after that they can be deleted by Erase tool and can be Undo/Redo.
      Case:
        1. Open RDF file
        2. Select part of structure
        3. Delete part of structure by Erase button
        4. Perform Undo/Redo actions 
      */
      await openFileAndAddToCanvasAsNewProject(page, rdfFile);
      await takeEditorScreenshot(page);
      await selectPartOfMolecules(page);
      await CommonLeftToolbar(page).selectEraseTool();
      await takeEditorScreenshot(page);
      await screenshotBetweenUndoRedo(page);
      await takeEditorScreenshot(page);
    });
  });

  const testCases13 = [
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-cascade-reaction-2-1-1-reagents.rdf',
      testCaseDescription:
        '1. RDF RXN V2000 file with cascade reaction with reagents',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-cascade-reaction-2-1-1-reagents.rdf',
      testCaseDescription:
        '2. RDF RXN V3000 file with cascade reaction with reagents',
    },
  ];

  testCases13.forEach(({ rdfFile, testCaseDescription }) => {
    test(`${testCaseDescription} can be loaded, after that they can be copy/pasted and Undo/Redo`, async () => {
      /* 
      Test case: https://github.com/epam/Indigo/issues/2102
      Description: ${testCaseDescription} can be loaded, reactions are displayed on Canvas with a single filled arrow 
      and correct positions, after that they can be copy/pasted and Undo/Redo.
      Case:
        1. Open RDF file
        2. Select all structures on canvas
        3. Perform Copy/Paste actions
        4. Perform Undo/Redo actions
      */
      await openFileAndAddToCanvasAsNewProject(page, rdfFile);
      await takeEditorScreenshot(page);
      await selectAllStructuresOnCanvas(page);
      await copyAndPaste(page);
      await clickOnCanvas(page, 500, 500, { from: 'pageTopLeft' });
      await takeEditorScreenshot(page);
      await screenshotBetweenUndoRedo(page);
      await takeEditorScreenshot(page);
    });
  });

  const testCases14 = [
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-cascade-reaction-2-1-1-reagents.rdf',
      testCaseDescription:
        '1. RDF RXN V2000 file with cascade reaction with reagents',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-cascade-reaction-2-1-1-reagents.rdf',
      testCaseDescription:
        '2. RDF RXN V3000 file with cascade reaction with reagents',
    },
  ];

  testCases14.forEach(({ rdfFile, testCaseDescription }) => {
    test(`${testCaseDescription} can be loaded, after that they can be cut/pasted and Undo/Redo`, async () => {
      /* 
      Test case: https://github.com/epam/Indigo/issues/2102
      Description: ${testCaseDescription} can be loaded, reactions are displayed on Canvas with a single filled arrow 
      and correct positions, after that they can be cut/pasted and Undo/Redo.
      Case:
        1. Open RDF file
        2. Select all structures on canvas
        3. Perform Cut/Paste actions
        4. Perform Undo/Redo actions 
      */
      await openFileAndAddToCanvasAsNewProject(page, rdfFile);
      await takeEditorScreenshot(page);
      await selectAllStructuresOnCanvas(page);
      await cutAndPaste(page);
      await clickOnCanvas(page, 500, 500, { from: 'pageTopLeft' });
      await takeEditorScreenshot(page);
      await screenshotBetweenUndoRedo(page);
      await takeEditorScreenshot(page);
    });
  });

  const testCases15 = [
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-cascade-reaction-2-1-1-reagents.rdf',
      testCaseDescription:
        '1. RDF RXN V2000 file with cascade reaction with reagents',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-cascade-reaction-2-1-1-reagents.rdf',
      testCaseDescription:
        '2. RDF RXN V3000 file with cascade reaction with reagents',
    },
  ];

  testCases15.forEach(({ rdfFile, testCaseDescription }) => {
    test(`${testCaseDescription} can be loaded, after that they can be selected/moved and Undo/Redo`, async () => {
      /* 
      Test case: https://github.com/epam/Indigo/issues/2102
      Description: ${testCaseDescription} can be loaded, reactions are displayed on Canvas with a single filled arrow 
      and correct positions, after that they can be selected/moved and Undo/Redo.
      Case:
        1. Open RDF file
        2. Select all structures on canvas
        3. Perform move to new position action
        4. Perform Undo/Redo actions 
      */
      await openFileAndAddToCanvasAsNewProject(page, rdfFile);
      await takeEditorScreenshot(page);
      await selectAllStructuresOnCanvas(page);
      await moveOnAtom(page, 'C', 2);
      await dragMouseTo(300, 600, page);
      await takeEditorScreenshot(page);
      await screenshotBetweenUndoRedo(page);
      await takeEditorScreenshot(page);
    });
  });

  test('Verify that empty Canvas with single Arrow (0:0 reactions) can be saved to RDF RXN V2000', async () => {
    /* 
    Test case: https://github.com/epam/Indigo/issues/2102
    Description: Empty Canvas with single Arrow (0:0 reactions) can be saved to RDF RXN V2000. 
    */
    await openFileAndAddToCanvasAsNewProject(page, 'KET/single-arrow.ket');
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'RDF-V2000/single-arrow-expected.rdf',
      FileType.RDF,
      RdfFileFormat.v2000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'RDF-V2000/single-arrow-expected.rdf',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that empty Canvas with single Arrow (0:0 reactions) can be saved to RDF RXN V3000', async () => {
    /* 
    Test case: https://github.com/epam/Indigo/issues/2102
    Description: Empty Canvas with single Arrow (0:0 reactions) can be saved to RDF RXN V3000. 
    */
    await openFileAndAddToCanvasAsNewProject(page, 'KET/single-arrow.ket');
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'RDF-V3000/single-arrow-expected.rdf',
      FileType.RDF,
      RdfFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'RDF-V3000/single-arrow-expected.rdf',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that empty Canvas with Multi-Tailed Arrow (0:0 reactions) can be saved to RDF RXN V2000', async () => {
    /* 
    Test case: https://github.com/epam/Indigo/issues/2237
    Description: Empty Canvas with Multi-Tailed Arrow (0:0 reactions) can be saved to RDF RXN V2000. 
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/multi-tailed-arrow-default.ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'RDF-V2000/multi-tailed-arrow-default-expected.rdf',
      FileType.RDF,
      RdfFileFormat.v2000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'RDF-V2000/multi-tailed-arrow-default-expected.rdf',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that empty Canvas with Multi-Tailed Arrow (0:0 reactions) can be saved to RDF RXN V3000', async () => {
    /* 
    Test case: https://github.com/epam/Indigo/issues/2237
    Description: Empty Canvas with Multi-Tailed Arrow (0:0 reactions) can be saved to RDF RXN V3000. 
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/multi-tailed-arrow-default.ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'RDF-V3000/multi-tailed-arrow-default-expected.rdf',
      FileType.RDF,
      RdfFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'RDF-V3000/multi-tailed-arrow-default-expected.rdf',
    );
    await takeEditorScreenshot(page);
  });

  const testCases16 = [
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-single-reaction-1x0.rdf',
      rdfFileExpected:
        'RDF-V2000/rdf-rxn-v2000-single-reaction-1x0-expected.rdf',
      testCaseDescription: '1. RDF file with RXN V2000 single reactions (1:0)',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-single-reaction-1x1.rdf',
      rdfFileExpected:
        'RDF-V2000/rdf-rxn-v2000-single-reaction-1x1-expected.rdf',
      testCaseDescription: '2. RDF file with RXN V2000 single reactions (1:1)',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-single-reaction-1x2.rdf',
      rdfFileExpected:
        'RDF-V2000/rdf-rxn-v2000-single-reaction-1x2-expected.rdf',
      testCaseDescription: '3. RDF file with RXN V2000 single reactions (1:2)',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-single-reaction-2x0.rdf',
      rdfFileExpected:
        'RDF-V2000/rdf-rxn-v2000-single-reaction-2x0-expected.rdf',
      testCaseDescription: '4. RDF file with RXN V2000 single reactions (2:0)',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-single-reaction-2x1.rdf',
      rdfFileExpected:
        'RDF-V2000/rdf-rxn-v2000-single-reaction-2x1-expected.rdf',
      testCaseDescription: '5. RDF file with RXN V2000 single reactions (2:1)',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-single-reaction-2x2.rdf',
      rdfFileExpected:
        'RDF-V2000/rdf-rxn-v2000-single-reaction-2x2-expected.rdf',
      testCaseDescription: '6. RDF file with RXN V2000 single reactions (2:2)',
      // We have a bug https://github.com/epam/Indigo/issues/2412
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-single-reaction-3x1.rdf',
      rdfFileExpected:
        'RDF-V2000/rdf-rxn-v2000-single-reaction-3x1-expected.rdf',
      testCaseDescription: '7. RDF file with RXN V2000 single reactions (3:1)',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-single-reaction-3x3.rdf',
      rdfFileExpected:
        'RDF-V2000/rdf-rxn-v2000-single-reaction-3x3-expected.rdf',
      testCaseDescription: '8. RDF file with RXN V2000 single reactions (3:3)',
      // We have a bug https://github.com/epam/Indigo/issues/2412
    },
  ];

  testCases16.forEach(({ rdfFile, rdfFileExpected, testCaseDescription }) => {
    test(`${testCaseDescription} can be loaded, after that they can be saved/loaded from RDF V2000`, async () => {
      /* 
      Test case: https://github.com/epam/Indigo/issues/2237
      Description: ${testCaseDescription} can be loaded, reactions are displayed on Canvas with a single filled arrow 
      and correct positions, after that they can be saved to RDF V2000 with correct sizes and positions, after that loaded from RDF V2000 with correct sizes and positions.
      Case:
        1. Open RDF file
        2. Save and verify RDF file
        3. Open saved RDF file 
      */
      await openFileAndAddToCanvasAsNewProject(page, rdfFile);
      await takeEditorScreenshot(page);
      await verifyFileExport(
        page,
        `${rdfFileExpected}`,
        FileType.RDF,
        RdfFileFormat.v2000,
      );
      await openFileAndAddToCanvasAsNewProject(page, `${rdfFileExpected}`);
      await takeEditorScreenshot(page);
    });
  });

  const testCases17 = [
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-single-reaction-1x0.rdf',
      rdfFileExpected:
        'RDF-V3000/rdf-rxn-v3000-single-reaction-1x0-expected.rdf',
      testCaseDescription: '1. RDF file with RXN V3000 single reactions (1:0)',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-single-reaction-1x1.rdf',
      rdfFileExpected:
        'RDF-V3000/rdf-rxn-v3000-single-reaction-1x1-expected.rdf',
      testCaseDescription: '2. RDF file with RXN V3000 single reactions (1:1)',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-single-reaction-1x2.rdf',
      rdfFileExpected:
        'RDF-V3000/rdf-rxn-v3000-single-reaction-1x2-expected.rdf',
      testCaseDescription: '3. RDF file with RXN V3000 single reactions (1:2)',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-single-reaction-2x0.rdf',
      rdfFileExpected:
        'RDF-V3000/rdf-rxn-v3000-single-reaction-2x0-expected.rdf',
      testCaseDescription: '4. RDF file with RXN V3000 single reactions (2:0)',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-single-reaction-2x1.rdf',
      rdfFileExpected:
        'RDF-V3000/rdf-rxn-v3000-single-reaction-2x1-expected.rdf',
      testCaseDescription: '5. RDF file with RXN V3000 single reactions (2:1)',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-single-reaction-2x2.rdf',
      rdfFileExpected:
        'RDF-V3000/rdf-rxn-v3000-single-reaction-2x2-expected.rdf',
      testCaseDescription: '6. RDF file with RXN V3000 single reactions (2:2)',
      // We have a bug https://github.com/epam/Indigo/issues/2412
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-single-reaction-3x1.rdf',
      rdfFileExpected:
        'RDF-V3000/rdf-rxn-v3000-single-reaction-3x1-expected.rdf',
      testCaseDescription: '7. RDF file with RXN V3000 single reactions (3:1)',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-single-reaction-3x3.rdf',
      rdfFileExpected:
        'RDF-V3000/rdf-rxn-v3000-single-reaction-3x3-expected.rdf',
      testCaseDescription: '8. RDF file with RXN V3000 single reactions (3:3)',
      // We have a bug https://github.com/epam/Indigo/issues/2412
    },
  ];

  testCases17.forEach(({ rdfFile, rdfFileExpected, testCaseDescription }) => {
    test(`${testCaseDescription} can be loaded, after that they can be saved/loaded from RDF V3000`, async () => {
      /* 
      Test case: https://github.com/epam/Indigo/issues/2237
      Description: ${testCaseDescription} can be loaded, reactions are displayed on Canvas with a single filled arrow 
      and correct positions, after that they can be saved to RDF V2000 with correct sizes and positions, after that loaded from RDF V3000 with correct sizes and positions.
      Case:
        1. Open RDF file
        2. Save and verify RDF file
        3. Open saved RDF file 
      */
      await openFileAndAddToCanvasAsNewProject(page, rdfFile);
      await takeEditorScreenshot(page);
      await verifyFileExport(
        page,
        `${rdfFileExpected}`,
        FileType.RDF,
        RdfFileFormat.v3000,
      );
      await openFileAndAddToCanvasAsNewProject(page, `${rdfFileExpected}`);
      await takeEditorScreenshot(page);
    });
  });

  const testCases18 = [
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-single-reaction-24x24.rdf',
      rdfFileExpected:
        'RDF-V2000/rdf-rxn-v2000-single-reaction-24x24-expected.rdf',
      testCaseDescription:
        '1. RDF file with RXN V2000 single reactions (24:24)',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-single-reaction-24x24.rdf',
      rdfFileExpected:
        'RDF-V3000/rdf-rxn-v3000-single-reaction-24x24-expected.rdf',
      testCaseDescription:
        '2. RDF file with RXN V3000 single reactions (24:24)',
    },
  ];

  testCases18.forEach(({ rdfFile, rdfFileExpected, testCaseDescription }) => {
    test(`${testCaseDescription} can be loaded, after that they can be saved/loaded to RDF`, async () => {
      /* 
      Test case: https://github.com/epam/Indigo/issues/2237
      Description: ${testCaseDescription} can be loaded, reactions are displayed on Canvas with a single filled arrow 
      and correct positions, after that they can be saved to RDF with correct sizes and positions, after that loaded from RDF with correct sizes and positions. 
      Now test working not in proper way because we have a bug https://github.com/epam/Indigo/issues/2412
      After fix we should update snapshots and test files
      Case:
        1. Open RDF file
        2. Save and verify RDF file
        3. Open saved RDF file
      */
      const fileFormat = rdfFile.includes('V2000')
        ? RdfFileFormat.v2000
        : RdfFileFormat.v3000;
      await openFileAndAddToCanvasAsNewProject(page, rdfFile);
      await takeEditorScreenshot(page);
      await verifyFileExport(
        page,
        `${rdfFileExpected}`,
        FileType.RDF,
        fileFormat,
      );
      await openFileAndAddToCanvasAsNewProject(page, rdfFileExpected);
      await takeEditorScreenshot(page);
    });
  });

  const testCases19 = [
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-cascade-reaction-2-1-1.rdf',
      rdfFileExpected:
        'RDF-V2000/rdf-rxn-v2000-cascade-reaction-2-1-1-expected.rdf',
      testCaseDescription:
        '1. RDF file with RXN V2000 single cascade reaction 2-1-1',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-cascade-reaction-2-2-1.rdf',
      rdfFileExpected:
        'RDF-V2000/rdf-rxn-v2000-cascade-reaction-2-2-1-expected.rdf',
      testCaseDescription:
        '2. RDF file with RXN V2000 single cascade reaction 2-2-1',
      // We have bug and after fix need to update snapshots and test files https://github.com/epam/Indigo/issues/2416
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-cascade-reaction-2-3-1.rdf',
      rdfFileExpected:
        'RDF-V2000/rdf-rxn-v2000-cascade-reaction-2-3-1-expected.rdf',
      testCaseDescription:
        '3. RDF file with RXN V2000 single cascade reaction 2-3-1',
      // We have bug and after fix need to update snapshots and test files https://github.com/epam/Indigo/issues/2416
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-cascade-reaction-2-1-2-1.rdf',
      rdfFileExpected:
        'RDF-V2000/rdf-rxn-v2000-cascade-reaction-2-1-2-1-expected.rdf',
      testCaseDescription:
        '4. RDF file with RXN V2000 single cascade reaction 2-1-2-1',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-cascade-reaction-2-2-3-1.rdf',
      rdfFileExpected:
        'RDF-V2000/rdf-rxn-v2000-cascade-reaction-2-2-3-1-expected.rdf',
      testCaseDescription:
        '5. RDF file with RXN V2000 single cascade reaction 2-2-3-1',
      // We have bug and after fix need to update snapshots and test files https://github.com/epam/Indigo/issues/2416
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-cascade-reaction-2-3-4-1.rdf',
      rdfFileExpected:
        'RDF-V2000/rdf-rxn-v2000-cascade-reaction-2-3-4-1-expected.rdf',
      testCaseDescription:
        '6. RDF file with RXN V2000 single cascade reaction 2-3-4-1',
      // We have bug and after fix need to update snapshots and test files https://github.com/epam/Indigo/issues/2416
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-cascade-reaction-7-1.rdf',
      rdfFileExpected:
        'RDF-V2000/rdf-rxn-v2000-cascade-reaction-7-1-expected.rdf',
      testCaseDescription:
        '7. RDF file with RXN V2000 single cascade reaction 7-1',
      // We have bug and after fix need to update snapshots and test files https://github.com/epam/Indigo/issues/2416
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-cascade-reaction-tails-5.rdf',
      rdfFileExpected:
        'RDF-V2000/rdf-rxn-v2000-cascade-reaction-tails-5-expected.rdf',
      testCaseDescription:
        '8. RDF file with RXN V2000 single cascade reaction 5 tails',
    },
    {
      rdfFile: 'RDF-V2000/rdf-rxn-v2000-cascade-reaction-tails-12.rdf',
      rdfFileExpected:
        'RDF-V2000/rdf-rxn-v2000-cascade-reaction-tails-12-expected.rdf',
      testCaseDescription:
        '9. RDF file with RXN V2000 single cascade reaction 12 tails',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-cascade-reaction-2-1-1.rdf',
      rdfFileExpected:
        'RDF-V3000/rdf-rxn-v3000-cascade-reaction-2-1-1-expected.rdf',
      testCaseDescription:
        '10. RDF file with RXN V3000 single cascade reaction 2-1-1',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-cascade-reaction-2-2-1.rdf',
      rdfFileExpected:
        'RDF-V3000/rdf-rxn-v3000-cascade-reaction-2-2-1-expected.rdf',
      testCaseDescription:
        '11. RDF file with RXN V3000 single cascade reaction 2-2-1',
      // We have bug and after fix need to update snapshots and test files https://github.com/epam/Indigo/issues/2416
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-cascade-reaction-2-3-1.rdf',
      rdfFileExpected:
        'RDF-V3000/rdf-rxn-v3000-cascade-reaction-2-3-1-expected.rdf',
      testCaseDescription:
        '12. RDF file with RXN V3000 single cascade reaction 2-3-1',
      // We have bug and after fix need to update snapshots and test files https://github.com/epam/Indigo/issues/2416
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-cascade-reaction-2-1-2-1.rdf',
      rdfFileExpected:
        'RDF-V3000/rdf-rxn-v3000-cascade-reaction-2-1-2-1-expected.rdf',
      testCaseDescription:
        '13. RDF file with RXN V3000 single cascade reaction 2-1-2-1',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-cascade-reaction-2-2-3-1.rdf',
      rdfFileExpected:
        'RDF-V3000/rdf-rxn-v3000-cascade-reaction-2-2-3-1-expected.rdf',
      testCaseDescription:
        '14. RDF file with RXN V3000 single cascade reaction 2-2-3-1',
      // We have bug and after fix need to update snapshots and test files https://github.com/epam/Indigo/issues/2416
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-cascade-reaction-2-3-4-1.rdf',
      rdfFileExpected:
        'RDF-V3000/rdf-rxn-v3000-cascade-reaction-2-3-4-1-expected.rdf',
      testCaseDescription:
        '15. RDF file with RXN V3000 single cascade reaction 2-3-4-1',
      // We have bug and after fix need to update snapshots and test files https://github.com/epam/Indigo/issues/2416
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-cascade-reaction-7-1.rdf',
      rdfFileExpected:
        'RDF-V3000/rdf-rxn-v3000-cascade-reaction-7-1-expected.rdf',
      testCaseDescription:
        '16. RDF file with RXN V3000 single cascade reaction 7-1',
      // We have bug and after fix need to update snapshots and test files https://github.com/epam/Indigo/issues/2416
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-cascade-reaction-tails-5.rdf',
      rdfFileExpected:
        'RDF-V3000/rdf-rxn-v3000-cascade-reaction-tails-5-expected.rdf',
      testCaseDescription:
        '17. RDF file with RXN V3000 single cascade reaction 5 tails',
    },
    {
      rdfFile: 'RDF-V3000/rdf-rxn-v3000-cascade-reaction-tails-12.rdf',
      rdfFileExpected:
        'RDF-V3000/rdf-rxn-v3000-cascade-reaction-tails-12-expected.rdf',
      testCaseDescription:
        '18. RDF file with RXN V3000 single cascade reaction 12 tails',
    },
  ];

  testCases19.forEach(({ rdfFile, rdfFileExpected, testCaseDescription }) => {
    test(`${testCaseDescription} can be loaded, after that they can be saved/loaded to RDF`, async () => {
      /* 
      Test case: https://github.com/epam/Indigo/issues/2237
      Description: ${testCaseDescription} RDF file with RXN V2000/V3000 can be loaded, after that they can be saved/loaded to RDF.
      Case:
        1. Open RDF file
        2. Save and verify RDF file
        3. Open saved RDF file
      */
      const fileFormat = rdfFile.includes('V2000')
        ? RdfFileFormat.v2000
        : RdfFileFormat.v3000;
      await openFileAndAddToCanvasAsNewProject(page, rdfFile);
      await takeEditorScreenshot(page);
      await verifyFileExport(
        page,
        `${rdfFileExpected}`,
        FileType.RDF,
        fileFormat,
      );
      await openFileAndAddToCanvasAsNewProject(page, rdfFileExpected);
      await takeEditorScreenshot(page);
    });
  });

  const testCases20 = [
    {
      ketFile: 'KET/ket-single-reaction-1x1-with-several-tails.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-single-reaction-1x1-with-several-tails-expected.rdf',
      rdfFileExpectedV3000:
        'RDF-V3000/ket-single-reaction-1x1-with-several-tails-expected.rdf',
      testCaseDescription: 'KET single reaction (1:1) with several tails',
    },
  ];

  testCases20.forEach(
    ({
      ketFile,
      rdfFileExpectedV2000,
      rdfFileExpectedV3000,
      testCaseDescription,
    }) => {
      ([RdfFileFormat.v2000, RdfFileFormat.v3000] as const).forEach(
        (format) => {
          test(`Verify that ${testCaseDescription} can be save/load to/from ${format.toUpperCase()} and verify that there are only one reactant`, async () => {
            /* 
          Test case: https://github.com/epam/Indigo/issues/2237
          Description: Now test working not in proper way because we have a bug https://github.com/epam/Indigo/issues/2426
          After fix we should update snapshots and test files.
          Case:
            1. Open KET file
            2. Save and verify RDF file
            3. Open saved RDF file
          */
            const rdfFileExpected =
              format === RdfFileFormat.v2000
                ? rdfFileExpectedV2000
                : rdfFileExpectedV3000;
            await openFileAndAddToCanvasAsNewProject(page, ketFile);
            await takeEditorScreenshot(page);
            await verifyFileExport(
              page,
              `${rdfFileExpected}`,
              FileType.RDF,
              format,
            );
            await openFileAndAddToCanvasAsNewProject(page, rdfFileExpected);
            await takeEditorScreenshot(page);
          });
        },
      );
    },
  );

  const testCases21 = [
    {
      ketFile: 'KET/ket-cascade-reaction-with-reagents.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-cascade-reaction-with-reagents-expected.rdf',
      rdfFileExpectedV3000:
        'RDF-V3000/ket-cascade-reaction-with-reagents-expected.rdf',
      testCaseDescription: 'KET cascade reaction with reagents',
    },
  ];

  testCases21.forEach(
    ({
      ketFile,
      rdfFileExpectedV2000,
      rdfFileExpectedV3000,
      testCaseDescription,
    }) => {
      ([RdfFileFormat.v2000, RdfFileFormat.v3000] as const).forEach(
        (format) => {
          test(`Verify that ${testCaseDescription} can be save/load to/from ${format.toUpperCase()} and verify that there are no reagents and cascade reactions`, async () => {
            /* 
          Test case: https://github.com/epam/Indigo/issues/2237
          Description: Now test working not in proper way because we have a bug https://github.com/epam/Indigo/issues/2550
          After fix we should update snapshots and test files.
          Case:
            1. Open KET file
            2. Save and verify RDF file
            3. Open saved RDF file
          */
            const rdfFileExpected =
              format === RdfFileFormat.v2000
                ? rdfFileExpectedV2000
                : rdfFileExpectedV3000;
            await openFileAndAddToCanvasAsNewProject(page, ketFile);
            await takeEditorScreenshot(page);
            await verifyFileExport(
              page,
              `${rdfFileExpected}`,
              FileType.RDF,
              format,
            );
            await openFileAndAddToCanvasAsNewProject(page, rdfFileExpected);
            await takeEditorScreenshot(page);
          });
        },
      );
    },
  );

  const testCases22 = [
    {
      ketFile: 'KET/ket-cascade-single-reactions-with-matching.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-cascade-single-reactions-with-matching-expected.rdf',
      rdfFileExpectedV3000:
        'RDF-V3000/ket-cascade-single-reactions-with-matching-expected.rdf',
      testCaseDescription:
        'KET several single and cascade reactions with single and Multi-Tailed arrows, pluses and with matched products/reactants',
    },
    {
      ketFile: 'KET/ket-cascade-single-reactions-without-matching.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-cascade-single-reactions-without-matching-expected.rdf',
      rdfFileExpectedV3000:
        'RDF-V3000/ket-cascade-single-reactions-without-matching-expected.rdf',
      testCaseDescription:
        'KET several single and cascade reactions with single and Multi-Tailed arrows, pluses and without matched products/reactants',
    },
  ];

  testCases22.forEach(
    ({
      ketFile,
      rdfFileExpectedV2000,
      rdfFileExpectedV3000,
      testCaseDescription,
    }) => {
      ([RdfFileFormat.v2000, RdfFileFormat.v3000] as const).forEach(
        (format) => {
          test(`Verify that ${testCaseDescription} can be saved/loaded to/from ${format.toUpperCase()}`, async () => {
            /* 
          Test case: https://github.com/epam/Indigo/issues/2237
          Description: ${testCaseDescription} can be saved to RDF ${format.toUpperCase()} format, then reloaded with correct structure.
          Case:
            1. Open KET file
            2. Save and verify RDF file
            3. Open saved RDF file
          */

            const rdfFileExpected =
              format === RdfFileFormat.v2000
                ? rdfFileExpectedV2000
                : rdfFileExpectedV3000;

            await openFileAndAddToCanvasAsNewProject(page, ketFile);
            await takeEditorScreenshot(page);
            await verifyFileExport(
              page,
              `${rdfFileExpected}`,
              FileType.RDF,
              format,
            );
            await openFileAndAddToCanvasAsNewProject(page, rdfFileExpected);
            await takeEditorScreenshot(page);
          });
        },
      );
    },
  );

  const testCases23 = [
    {
      ketFile: 'KET/ket-single-reaction-0x1.ket',
      rdfFileExpectedV2000: 'RDF-V2000/ket-single-reaction-0x1-expected.rdf',
      rdfFileExpectedV3000: 'RDF-V3000/ket-single-reaction-0x1-expected.rdf',
      testCaseDescription: '1. KET single reaction (0:1)',
    },
    {
      ketFile: 'KET/ket-single-reaction-0x2.ket',
      rdfFileExpectedV2000: 'RDF-V2000/ket-single-reaction-0x2-expected.rdf',
      rdfFileExpectedV3000: 'RDF-V3000/ket-single-reaction-0x2-expected.rdf',
      testCaseDescription: '2. KET single reaction (0:2)',
    },
    {
      ketFile: 'KET/ket-single-reaction-2x0.ket',
      rdfFileExpectedV2000: 'RDF-V2000/ket-single-reaction-2x0-expected.rdf',
      rdfFileExpectedV3000: 'RDF-V3000/ket-single-reaction-2x0-expected.rdf',
      testCaseDescription: '3. KET single reaction (2:0)',
    },
    {
      ketFile: 'KET/ket-single-reaction-1x1-with-several-tails.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-single-reaction-1x1-with-several-tails-expected.rdf',
      rdfFileExpectedV3000:
        'RDF-V3000/ket-single-reaction-1x1-with-several-tails-expected.rdf',
      testCaseDescription: '4. KET single reaction (1:1 with several tails)',
    },
    {
      ketFile: 'KET/ket-single-reaction-2x2-with-pluses.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-single-reaction-2x2-with-pluses-expected.rdf',
      rdfFileExpectedV3000:
        'RDF-V3000/ket-single-reaction-2x2-with-pluses-expected.rdf',
      testCaseDescription: '5. KET single reaction (2:2 with pluses)',
    },
    {
      ketFile: 'KET/ket-single-reaction-3x1.ket',
      rdfFileExpectedV2000: 'RDF-V2000/ket-single-reaction-3x1-expected.rdf',
      rdfFileExpectedV3000: 'RDF-V3000/ket-single-reaction-3x1-expected.rdf',
      testCaseDescription: '6. KET single reaction (3:1)',
    },
    {
      ketFile: 'KET/ket-cascade-reaction-3-1-2-1-1.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-cascade-reaction-3-1-2-1-1-expected.rdf',
      rdfFileExpectedV3000:
        'RDF-V3000/ket-cascade-reaction-3-1-2-1-1-expected.rdf',
      testCaseDescription: '7. KET cascade reaction (3-1-2-1-1)',
    },
    {
      ketFile:
        'KET/ket-cascade-single-reactions-3-1-2-1-1-2x2-with-pluses-row.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-cascade-single-reactions-3-1-2-1-1-2x2-with-pluses-row-expected.rdf',
      rdfFileExpectedV3000:
        'RDF-V3000/ket-cascade-single-reactions-3-1-2-1-1-2x2-with-pluses-row-expected.rdf',
      testCaseDescription:
        '8. KET cascade single reaction (3-1-2-1-1-2x2-with-pluses-row)',
    },
    {
      ketFile:
        'KET/ket-cascade-single-reactions-3-1-2-1-1-2x2-with-pluses-bottom-top.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-cascade-single-reactions-3-1-2-1-1-2x2-with-pluses-bottom-top-expected.rdf',
      rdfFileExpectedV3000:
        'RDF-V3000/ket-cascade-single-reactions-3-1-2-1-1-2x2-with-pluses-bottom-top-expected.rdf',
      testCaseDescription:
        '9. KET cascade single reaction (3-1-2-1-1-2x2-with-pluses-bottom-top)',
    },
  ];

  testCases23.forEach(
    ({
      ketFile,
      rdfFileExpectedV2000,
      rdfFileExpectedV3000,
      testCaseDescription,
    }) => {
      ([RdfFileFormat.v2000, RdfFileFormat.v3000] as const).forEach(
        (format) => {
          test(`${testCaseDescription} can be saved/loaded to/from ${format.toUpperCase()}`, async () => {
            /* 
          Test case: https://github.com/epam/Indigo/issues/2237
          Description: ${testCaseDescription} can be saved to RDF ${format.toUpperCase()} format, then reloaded with correct structure.
          We have a bug https://github.com/epam/Indigo/issues/2424 After fix we should update test files and snapshots.
          Case:
            1. Open KET file
            2. Save and verify RDF file
            3. Open saved RDF file
          */

            const rdfFileExpected =
              format === RdfFileFormat.v2000
                ? rdfFileExpectedV2000
                : rdfFileExpectedV3000;

            await openFileAndAddToCanvasAsNewProject(page, ketFile);
            await takeEditorScreenshot(page);
            await verifyFileExport(
              page,
              `${rdfFileExpected}`,
              FileType.RDF,
              format,
            );
            await openFileAndAddToCanvasAsNewProject(page, rdfFileExpected);
            await takeEditorScreenshot(page);
          });
        },
      );
    },
  );

  [MoleculesFileFormatType.RDFV2000, MoleculesFileFormatType.RDFV3000].forEach(
    (format) => {
      test(`Canvas is empty, click on Save as..., verify that ${format} is placed under SDF V2000, SDF V3000 in a File format dropdown`, async () => {
        /**
         * Test case: https://github.com/epam/Indigo/issues/2237
         * Description: Canvas is empty, click on Save as..., verify that ${format} option is placed under SDF V2000, SDF V3000
         * in a File format dropdown, empty canvas can't be saved to ${format}, error "Convert error! core: <molecule> is not a base reaction" is displayed.
         */
        await CommonTopLeftToolbar(page).saveFile();
        await SaveStructureDialog(page).chooseFileFormat(format);
        const errorMessage = await ErrorMessageDialog(page).getErrorMessage();
        expect(errorMessage).toContain(
          'Convert error!\ncore: <molecule> is not a base reaction',
        );
        await ErrorMessageDialog(page).close();
        await SaveStructureDialog(page).cancel();
      });
    },
  );

  const testCases24 = [
    {
      rdfFileV2000: 'RDF-V2000/rdf-rxn-v2000-cascade-reaction-2-1-1.rdf',
      rdfFileV3000: 'RDF-V3000/rdf-rxn-v3000-cascade-reaction-2-1-1.rdf',
      rdfFileExpectedV2000:
        'RDF-V2000/rdf-rxn-v2000-cascade-reaction-2-1-1-expected1.rdf',
      rdfFileExpectedV3000:
        'RDF-V3000/rdf-rxn-v3000-cascade-reaction-2-1-1-expected1.rdf',
      testCaseDescription:
        'Cascade reaction with elements saved to RDF V2000/V3000 after various operations of adding tail, deleted structures, copy/paste, undo/redo on the canvas',
    },
  ];

  testCases24.forEach(
    ({
      rdfFileV2000,
      rdfFileV3000,
      rdfFileExpectedV2000,
      rdfFileExpectedV3000,
      testCaseDescription,
    }) => {
      ([RdfFileFormat.v2000, RdfFileFormat.v3000] as const).forEach(
        (format) => {
          test(`Verify that ${testCaseDescription} can be saved/loaded to/from ${format.toUpperCase()}`, async () => {
            /*
            Test case: https://github.com/epam/Indigo/issues/2237
            Description: Loaded from RDF RXN file, added cascade reaction to Canvas, added other elements,
            cascade reactions with elements saved to RDF formats with the correct positions.
            Case:
            1. Open RDF file
            2. Add Benzene ring to canvas
            3. Add tail to multi-tailed arrow
            4. Erase part of structure
            5. Perform Undo/Redo actions
            6. Perform Copy/Paste actions
            7. Save and verify RDF file
            8. Open saved RDF file
          */
            const rdfFile = format === 'v2000' ? rdfFileV2000 : rdfFileV3000;
            const rdfFileExpected =
              format === RdfFileFormat.v2000
                ? rdfFileExpectedV2000
                : rdfFileExpectedV3000;

            await openFileAndAddToCanvas(page, rdfFile);
            await clickOnCanvas(page, 500, 600, { from: 'pageTopLeft' });
            await selectRingButton(page, RingButton.Benzene);
            await clickOnCanvas(page, 200, 600, { from: 'pageTopLeft' });
            await CommonLeftToolbar(page).selectAreaSelectionTool(
              SelectionToolType.Rectangle,
            );
            await addTail(page, 482, 464);
            await takeEditorScreenshot(page);
            await selectPartOfMolecules(page);
            await CommonLeftToolbar(page).selectEraseTool();
            await takeEditorScreenshot(page);
            await CommonTopLeftToolbar(page).undo();
            await takeEditorScreenshot(page);
            await copyAndPaste(page);
            await clickOnCanvas(page, 500, 200, { from: 'pageTopLeft' });
            await takeEditorScreenshot(page);
            await CommonTopLeftToolbar(page).undo();
            await verifyFileExport(
              page,
              `${rdfFileExpected}`,
              FileType.RDF,
              format,
            );
            await openFileAndAddToCanvasAsNewProject(page, rdfFileExpected);
            await takeEditorScreenshot(page);
          });
        },
      );
    },
  );

  const testCases25 = [
    {
      ketFile: 'KET/ket-single-reaction-5x3-with-pluses.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-single-reaction-5x3-with-pluses-expected.rdf',
      rdfFileExpectedV3000:
        'RDF-V3000/ket-single-reaction-5x3-with-pluses-expected.rdf',
      testCaseDescription:
        '1. KET single reaction with Multi-Tailed arrow and pluses near reactants and products (5:3)',
    },
    {
      ketFile: 'KET/ket-single-reactions-2-5x3-with-pluses-top-bottom.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-single-reactions-2-5x3-with-pluses-top-bottom-expected.rdf',
      rdfFileExpectedV3000:
        'RDF-V3000/ket-single-reactions-2-5x3-with-pluses-top-bottom-expected.rdf',
      testCaseDescription:
        '2. KET two single reactions (one under another) with Multi-Tailed arrow and pluses near reactants and products (5:3)',
    },
    {
      ketFile: 'KET/ket-single-reactions-2-5x3-with-pluses-left-right.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-single-reactions-2-5x3-with-pluses-left-right-expected.rdf',
      rdfFileExpectedV3000:
        'RDF-V3000/ket-single-reactions-2-5x3-with-pluses-left-right-expected.rdf',
      testCaseDescription:
        '3. KET two single reactions (two in a row) with Multi-Tailed arrow and pluses near reactants and products (5:3)',
    },
    {
      ketFile: 'KET/ket-cascade-reaction-tails-5-with-pluses.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-cascade-reaction-tails-5-with-pluses-expected.rdf',
      rdfFileExpectedV3000:
        'RDF-V3000/ket-cascade-reaction-tails-5-with-pluses-expected.rdf',
      testCaseDescription:
        '4. KET cascade reaction (5 tails with pluses) with single/Multi-Tailed arrows and pluses near reactants and products',
    },
    {
      ketFile:
        'KET/ket-single-cascade-reactions-with-pluses-5x3-tails-5-top-bottom.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-single-cascade-reactions-with-pluses-5x3-tails-5-top-bottom-expected.rdf',
      rdfFileExpectedV3000:
        'RDF-V3000/ket-single-cascade-reactions-with-pluses-5x3-tails-5-top-bottom-expected.rdf',
      testCaseDescription:
        '5. KET cascade and single reactions (one under another 5:3, 5 tails) with Multi-Tailed arrow and pluses near reactants and products',
    },
    {
      ketFile:
        'KET/ket-single-cascade-reactions-with-pluses-5x3-tails-5-row.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-single-cascade-reactions-with-pluses-5x3-tails-5-row-expected.rdf',
      rdfFileExpectedV3000:
        'RDF-V3000/ket-single-cascade-reactions-with-pluses-5x3-tails-5-row-expected.rdf',
      testCaseDescription:
        '6. KET two cascade and single reactions (two in a row 5:3, 5 tails) with Multi-Tailed arrow and pluses near reactants and products',
    },
  ];

  testCases25.forEach(
    ({
      ketFile,
      rdfFileExpectedV2000,
      rdfFileExpectedV3000,
      testCaseDescription,
    }) => {
      ([RdfFileFormat.v2000, RdfFileFormat.v3000] as const).forEach(
        (format) => {
          test(`${testCaseDescription} can be saved/loaded to/from ${format.toUpperCase()}`, async () => {
            /* 
          Test case: https://github.com/epam/Indigo/issues/2237
          Description: ${testCaseDescription} can be saved to RDF ${format.toUpperCase()} format, then reloaded with correct structure.
          We have a bug https://github.com/epam/Indigo/issues/2424 After fix we should update test files and snapshots.
          Case:
            1. Open KET file
            2. Save and verify RDF file
            3. Open saved RDF file
          */

            const rdfFileExpected =
              format === RdfFileFormat.v2000
                ? rdfFileExpectedV2000
                : rdfFileExpectedV3000;

            await openFileAndAddToCanvasAsNewProject(page, ketFile);
            await takeEditorScreenshot(page);
            await verifyFileExport(
              page,
              `${rdfFileExpected}`,
              FileType.RDF,
              format,
            );
            await openFileAndAddToCanvasAsNewProject(page, rdfFileExpected);
            await takeEditorScreenshot(page);
          });
        },
      );
    },
  );

  const testCases26 = [
    {
      rdfFile: 'RDF-V2000/rdf-single-reaction-1x1-no-wrap-30-symbols.rdf',
      testCaseDescription:
        '1. RDF V2000 single reaction with Multi-Tailed or single arrow (1:1) and reactions name and conditions with no wrapping (30 symbols in a line)',
      testCaseExpectedResult:
        'Text of name is in bold, text of conditions is in italic, font size is 13, empty line between name and conditions',
    },
    {
      rdfFile: 'RDF-V2000/rdf-single-reaction-2x1-no-wrap-30-symbols.rdf',
      testCaseDescription:
        '2. RDF V2000 single reaction with Multi-Tailed or single arrow (2:1) and reactions name and conditions with no wrapping (30 symbols in a line)',
      testCaseExpectedResult:
        'Text of name is in bold, text of conditions is in italic, font size is 13, empty line between name and conditions',
    },
    {
      rdfFile: 'RDF-V2000/rdf-single-reaction-1x1-auto-wrap-9-lines.rdf',
      testCaseDescription:
        '3. RDF V2000 single reaction with Multi-Tailed or single arrow (1:1) and reactions name and conditions with auto wrapping (9 lines)',
      testCaseExpectedResult:
        'Text of name is in bold, text of conditions is in italic, font size is 13, empty line between name and conditions',
    },
    {
      rdfFile: 'RDF-V2000/rdf-single-reaction-2x1-auto-wrap-9-lines.rdf',
      testCaseDescription:
        '4. RDF V2000 single reaction with Multi-Tailed or single arrow (2:1) and reactions name and conditions with auto wrapping (9 lines)',
      testCaseExpectedResult:
        'Text of name is in bold, text of conditions is in italic, font size is 13, empty line between name and conditions',
    },
    {
      rdfFile:
        'RDF-V2000/rdf-single-reaction-1x1-auto-wrap-9-lines-truncated.rdf',
      testCaseDescription:
        '5. RDF V2000 single reaction with Multi-Tailed or single arrow (1:1) and reactions name and conditions with auto wrapping and truncating (more than 9 lines)',
      testCaseExpectedResult:
        'Text of name is in bold, text of conditions is in italic and truncated (last 3 points are replaced by points), font size is 13, empty line between name and conditions',
    },
    {
      rdfFile:
        'RDF-V2000/rdf-single-reaction-2x1-auto-wrap-9-lines-truncated.rdf',
      testCaseDescription:
        '6. RDF V2000 single reaction with Multi-Tailed or single arrow (2:1) and reactions name and conditions with auto wrapping and truncating (more than 9 lines)',
      testCaseExpectedResult:
        'Text of name is in bold, text of conditions is in italic and truncated (last 3 points are replaced by points), font size is 13, empty line between name and conditions',
    },
    {
      rdfFile:
        'RDF-V2000/rdf-single-reaction-5x1-auto-wrap-spaces-all-elements.rdf',
      testCaseDescription:
        '7. RDF V2000 single reaction with Multi-Tailed or single arrow (5:1) and reactions name and conditions with spaces, all possible elements, auto wrapping',
      testCaseExpectedResult:
        'Text of name is in bold, text of conditions is in italic, font size is 13, empty line between name and conditions',
    },
    {
      rdfFile: 'RDF-V2000/rdf-single-reaction-1x1-auto-wrap-spaces.rdf',
      testCaseDescription:
        '8. RDF V2000 single reaction with Multi-Tailed or single arrow (1:1) and reactions name and conditions with spaces, all possible elements, auto wrapping',
      testCaseExpectedResult:
        'Text of name is in bold, text of conditions is in italic, font size is 13, empty line between name and conditions',
    },
    {
      rdfFile:
        'RDF-V2000/rdf-single-reaction-1x1-auto-wrap-spaces-all-elements-truncated.rdf',
      testCaseDescription:
        '9. RDF V2000 single reaction with Multi-Tailed or single arrow (1:1) and reactions name and conditions with spaces, all possible elements, auto wrapping and truncating (more than 9 lines)',
      testCaseExpectedResult:
        'Text of conditions is truncated, name is in bold, conditions is in italic, font is 13',
    },
    {
      rdfFile:
        'RDF-V2000/rdf-single-reaction-2x1-auto-wrap-spaces-all-elements-truncated.rdf',
      testCaseDescription:
        '10. RDF V2000 single reaction with Multi-Tailed or single arrow (2:1) and reactions name and conditions with spaces, all possible elements, auto wrapping and truncating (more than 9 lines)',
      testCaseExpectedResult:
        'Text of conditions is truncated, name is in bold, conditions is in italic, font is 13',
    },
    {
      rdfFile: 'RDF-V2000/rdf-single-reaction-2x1-name-no-wrap-30-symbols.rdf',
      testCaseDescription:
        '11. RDF V2000 single reaction with Multi-Tailed or single arrow (2:1) and only reactions name and empty conditions with no wrapping (30 symbols in a line)',
      testCaseExpectedResult: ' Text of name is in bold, font size is 13',
    },
    {
      rdfFile:
        'RDF-V2000/rdf-single-reaction-1x1-conditions-not-available-no-wrap-30-symbols.rdf',
      testCaseDescription:
        '12. RDF V2000 single reaction with Single arrow (1:1) and only reactions name and not available conditions with no wrapping (30 symbols in a line)',
      testCaseExpectedResult: ' Text of name is in bold, font size is 13',
    },
    {
      rdfFile: 'RDF-V2000/rdf-single-reaction-2x1-auto-wrap-name-9-lines.rdf',
      testCaseDescription:
        '13. RDF V2000 single reaction with Multi-Tailed arrow (2:1) and only reactions name with auto wrapping (9 lines)',
      testCaseExpectedResult: 'Text of name is in bold, font size is 13',
    },
    {
      rdfFile:
        'RDF-V2000/rdf-single-reaction-2x1-auto-wrap-name-9-lines-truncated.rdf',
      testCaseDescription:
        '14. RDF V2000 single reaction with Multi-Tailed arrow (2:1) and only reactions name with auto wrapping and truncating (more than 9 lines)',
      testCaseExpectedResult:
        'Text of name is in bold and truncated (last 3 points are replaced by points), font size is 13',
    },
    {
      rdfFile:
        'RDF-V2000/rdf-single-reaction-2x1-conditions-no-wrap-30-symbols.rdf',
      testCaseDescription:
        '15. RDF V2000 single reaction with Multi-Tailed arrow (2:1) and only reactions conditions and empty name with no wrapping (30 symbols in a line)',
      testCaseExpectedResult:
        'Text of conditions is in italic, first line is empty, font size is 13',
    },
    {
      rdfFile:
        'RDF-V2000/rdf-single-reaction-1x1-name-not-available-no-wrap-30-symbols.rdf',
      testCaseDescription:
        '16. RDF V2000 single reaction with Single arrow (1:1) and only reactions conditions and not available name with no wrapping (30 symbols in a line)',
      testCaseExpectedResult:
        'Text of conditions is in italic, first line is empty, font size is 13',
    },
    {
      rdfFile:
        'RDF-V2000/rdf-single-reaction-2x1-auto-wrap-conditions-9-lines.rdf',
      testCaseDescription:
        '17. RDF V2000 single reaction with Multi-Tailed arrow (2:1) and only reactions conditions with auto wrapping (9 lines)',
      testCaseExpectedResult:
        'Text of conditions is in italic, font size is 13, the first line is empty',
    },
    {
      rdfFile:
        'RDF-V2000/rdf-single-reaction-2x1-auto-wrap-conditions-9-lines-truncated.rdf',
      testCaseDescription:
        '18. RDF V2000 single reaction with Multi-Tailed arrow (2:1) and only reactions conditions with auto wrapping and truncating (more than 9 lines)',
      testCaseExpectedResult:
        'Text of conditions is in italic  and truncated (last 3 points are replaced by points), font size is 13, the first line is empty',
    },
    {
      rdfFile:
        'RDF-V2000/rdf-single-reaction-2x1-auto-wrap-space-after-30-symbols.rdf',
      testCaseDescription:
        '19. RDF V2000 single reaction with Multi-Tailed arrow (2:1) and reactions name and conditions with spaces and auto wrapping (after 30 symbols)',
      testCaseExpectedResult:
        'Text of name is in bold, text of conditions is in italic, font size is 13, empty line between name and conditions',
    },
    {
      rdfFile:
        'RDF-V2000/rdf-single-reaction-2x1-auto-wrap-space-after-30-symbols-with-space.rdf',
      testCaseDescription:
        '20. RDF V2000 single reaction with Multi-Tailed arrow (2:1) and reactions name and conditions with spaces and auto wrapping (after 30 symbols with space)',
      testCaseExpectedResult:
        'Text of name is in bold, text of conditions is in italic, font size is 13, empty line between name and conditions',
    },
    {
      rdfFile:
        'RDF-V2000/rdf-single-reaction-2x1-auto-wrap-space-before-30-symbols.rdf',
      testCaseDescription:
        '21. RDF V2000 single reaction with Multi-Tailed arrow (2:1) and reactions name and conditions with spaces and auto wrapping (before 30 symbols)',
      testCaseExpectedResult:
        'Text of name is in bold, text of conditions is in italic, font size is 13, empty line between name and conditions',
    },
    {
      rdfFile: 'RDF-V2000/rdf-single-reaction-2x1-manual-wrap-9-lines.rdf',
      testCaseDescription:
        '22. RDF V2000 single reaction with Multi-Tailed arrow (2:1) and reactions name and conditions with manual wrapping (9 lines)',
      testCaseExpectedResult:
        'Text of name is in bold, text of conditions is in italic, font size is 13, empty line between name and conditions',
    },
    {
      rdfFile:
        'RDF-V2000/rdf-single-reaction-2x1-manual-wrap-9-lines-truncated.rdf',
      testCaseDescription:
        '23. RDF V2000 single reaction with Multi-Tailed arrow (2:1) and reactions name and conditions with manual wrapping and truncating (more than 9 lines)',
      testCaseExpectedResult:
        'Text of name is in bold, text of conditions is in italic and truncated (last 3 points are replaced by points), font size is 13, empty line between name and conditions',
    },
    {
      rdfFile:
        'RDF-V2000/rdf-single-reaction-2x1-not-available-name-conditions.rdf',
      testCaseDescription:
        '24. RDF V2000 single reaction with Multi-Tailed arrow (2:1) and not available reactions name and conditions',
      testCaseExpectedResult: 'There is no text',
    },
    {
      rdfFile:
        'RDF-V2000/rdf-single-reaction-2x1-auto-wrap-special-symbols.rdf',
      testCaseDescription:
        '25. RDF V2000 single reaction with Multi-Tailed arrow (2:1) and reactions name and conditions with special symbols and auto wrapping',
      testCaseExpectedResult:
        'Text of name is in bold, text of conditions is in italic, font size is 13, empty line between name and conditions',
    },
    {
      rdfFile:
        'RDF-V2000/rdf-v2000-cascade-reaction-2-1-1-auto-wrap-9-lines-and-truncated.rdf',
      testCaseDescription:
        '26. RDF V2000 cascade reaction with Multi-Tailed and single arrow (2:1:1) and reactions name and conditions with auto wrapping/truncating',
      testCaseExpectedResult:
        'Text of name and conditions is displayed correctly',
    },
    {
      rdfFile:
        'RDF-V3000/rdf-v3000-cascade-reaction-2-1-1-auto-wrap-9-lines-and-truncated.rdf',
      testCaseDescription:
        '27. RDF V3000 cascade reaction with Multi-Tailed and single arrow (2:1:1) and reactions name and conditions with auto wrapping/truncating',
      testCaseExpectedResult:
        'Text of name and conditions is displayed correctly',
    },
    {
      rdfFile:
        'RDF-V2000/rdf-v2000-cascade-reaction-2-1-2-1-auto-wrap-9-lines-and-truncated.rdf',
      testCaseDescription:
        '28. RDF V2000 cascade reaction with Multi-Tailed and single arrow (2:1:2:1) and reactions name and conditions with auto wrapping/truncating',
      testCaseExpectedResult:
        'Text of name and conditions is displayed correctly',
    },
    {
      rdfFile:
        'RDF-V3000/rdf-v3000-cascade-reaction-2-1-2-1-auto-wrap-9-lines-and-truncated.rdf',
      testCaseDescription:
        '29. RDF V3000 cascade reaction with Multi-Tailed and single arrow (2:1:2:1) and reactions name and conditions with auto wrapping/truncating',
      testCaseExpectedResult:
        'Text of name and conditions is displayed correctly',
    },
    {
      rdfFile: 'RDF-V2000/rdf-single-reaction-2x1-atoms-no-wrap-30-symbols.rdf',
      testCaseDescription:
        '30. RDF V2000 single reaction with Multi-Tailed arrow (2:1), atoms and reactions name and conditions with no wrapping (30 symbols in a line)',
      testCaseExpectedResult:
        'Text of name is in bold, text of conditions is in italic, font size is 13, empty line between name and conditions',
    },
  ];

  testCases26.forEach(({ rdfFile, testCaseDescription }) => {
    test(`Add to Canvas from ${testCaseDescription} and verify that the text is added correctly`, async () => {
      /* 
      Test case: https://github.com/epam/Indigo/issues/2559
      Description: ${testCaseExpectedResult}
      Case:
        1. Open RDF file
        2. Take screenshot
      */
      await openFileAndAddToCanvasAsNewProject(page, rdfFile);
      await takeEditorScreenshot(page);
    });
  });

  const testCases27 = [
    {
      rdfFile: 'RDF-V2000/rdf-cascade-reactions-name-conditions.rdf',
      ketFile: 'KET/rdf-cascade-reactions-name-conditions-expected.ket',
      testCaseDescription:
        'RDF V2000 cascade reactions with Multi-Tailed and single arrow (5-tails and 2:1:1) and reactions name and conditions',
    },
  ];

  testCases27.forEach(({ rdfFile, ketFile, testCaseDescription }) => {
    test(`Add to Canvas from ${testCaseDescription}, after that they can be saved/loaded to KET`, async () => {
      /* 
      Test case: https://github.com/epam/Indigo/issues/2559
      Description: Text of name and conditions is displayed correctly (7 different cases), after that saved to KET and load from KET, and it's displayed correctly.
      Case:
        1. Open RDF file
        2. Save and verify KET file
        3. Open saved KET file 
      */
      await openFileAndAddToCanvasAsNewProject(page, rdfFile);
      await takeEditorScreenshot(page);
      await verifyFileExport(page, ketFile, FileType.KET);
      await openFileAndAddToCanvasAsNewProject(page, ketFile);
      await takeEditorScreenshot(page);
    });
  });

  const testCases28 = [
    {
      ketFile: 'KET/ket-single-2x1-text-top-match.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-single-2x1-text-top-match-expected.rdf',
      testCaseDescription:
        '1. KET reaction with text name and matching with bounding box on the different sides (top) from Multi-Tailed Arrow (2:1)',
    },
    {
      ketFile: 'KET/ket-single-2x1-text-bottom-match.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-single-2x1-text-bottom-match-expected.rdf',
      testCaseDescription:
        '2. KET reaction with text name and matching with bounding box on the different sides (bottom) from Multi-Tailed Arrow (2:1)',
    },
    {
      ketFile: 'KET/ket-single-2x1-text-left-match.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-single-2x1-text-left-match-expected.rdf',
      testCaseDescription:
        '3. KET reaction with text name and matching with bounding box on the different sides (left) from Multi-Tailed Arrow (2:1)',
    },
    {
      ketFile: 'KET/ket-single-2x1-text-right-match.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-single-2x1-text-right-match-expected.rdf',
      testCaseDescription:
        '4. KET reaction with text name and matching with bounding box on the different sides (right) from Multi-Tailed Arrow (2:1)',
    },
  ];

  testCases28.forEach(
    ({ ketFile, rdfFileExpectedV2000, testCaseDescription }) => {
      test(`Add to Canvas from ${testCaseDescription} save to RDF V2000, add to Canvas from RDF V2000, verify that reaction with text name is displayed correctly`, async () => {
        /* 
        Test case: https://github.com/epam/Indigo/issues/2404
        Description: ${testCaseDescription} can be saved to RDF V2000 format, then reloaded with correct structure.
        Case:
          1. Open KET file
          2. Save and verify RDF file
          3. Open saved RDF file
        */
        await openFileAndAddToCanvasAsNewProject(page, ketFile);
        await takeEditorScreenshot(page);
        await verifyFileExport(
          page,
          `${rdfFileExpectedV2000}`,
          FileType.RDF,
          RdfFileFormat.v2000,
        );
        await openFileAndAddToCanvasAsNewProject(page, rdfFileExpectedV2000);
        await takeEditorScreenshot(page);
      });
    },
  );

  const testCases29 = [
    {
      ketFile: 'KET/ket-single-2x1-text-top-no-match.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-single-2x1-text-top-no-match-expected.rdf',
      testCaseDescription:
        '1. KET reaction with text name and no matching with bounding box on the different sides (top) from Multi-Tailed Arrow (2:1)',
    },
    {
      ketFile: 'KET/ket-single-2x1-text-bottom-no-match.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-single-2x1-text-bottom-no-match-expected.rdf',
      testCaseDescription:
        '2. KET reaction with text name and no matching with bounding box on the different sides (bottom) from Multi-Tailed Arrow (2:1)',
    },
    {
      ketFile: 'KET/ket-single-2x1-text-left-no-match.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-single-2x1-text-left-no-match-expected.rdf',
      testCaseDescription:
        '3. KET reaction with text name and no matching with bounding box on the different sides (left) from Multi-Tailed Arrow (2:1)',
    },
    {
      ketFile: 'KET/ket-single-2x1-text-right-no-match.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-single-2x1-text-right-no-match-expected.rdf',
      testCaseDescription:
        '4. KET reaction with text name and no matching with bounding box on the different sides (right) from Multi-Tailed Arrow (2:1)',
    },
  ];

  testCases29.forEach(
    ({ ketFile, rdfFileExpectedV2000, testCaseDescription }) => {
      test(`Add to Canvas from ${testCaseDescription} save to RDF V2000, add to Canvas from RDF V2000, verify that reaction without text name is displayed correctly`, async () => {
        /* 
        Test case: https://github.com/epam/Indigo/issues/2404
        Description: ${testCaseDescription} can be saved to RDF V2000 format, then reloaded with correct structure.
        Case:
          1. Open KET file
          2. Save and verify RDF file
          3. Open saved RDF file
        */
        await openFileAndAddToCanvasAsNewProject(page, ketFile);
        await takeEditorScreenshot(page);
        await verifyFileExport(
          page,
          `${rdfFileExpectedV2000}`,
          FileType.RDF,
          RdfFileFormat.v2000,
        );
        await openFileAndAddToCanvasAsNewProject(page, rdfFileExpectedV2000);
        await takeEditorScreenshot(page);
      });
    },
  );

  const testCases30 = [
    {
      ketFile: 'KET/ket-single-1x1-2x1-text-top-match.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-single-1x1-2x1-text-top-match-expected.rdf',
      testCaseDescription:
        '1. KET reaction with text name and matching with bounding box on the different sides (top) from Single Arrow (1:1), Multi-Tailed Arrow is also added',
    },
    {
      ketFile: 'KET/ket-single-1x1-2x1-text-bottom-match.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-single-1x1-2x1-text-bottom-match-expected.rdf',
      testCaseDescription:
        '2. KET reaction with text name and matching with bounding box on the different sides (bottom) from Single Arrow (1:1), Multi-Tailed Arrow is also added',
    },
    {
      ketFile: 'KET/ket-single-1x1-2x1-text-left-match.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-single-1x1-2x1-text-left-match-expected.rdf',
      testCaseDescription:
        '3. KET reaction with text name and matching with bounding box on the different sides (left) from Single Arrow (1:1), Multi-Tailed Arrow is also added',
    },
    {
      ketFile: 'KET/ket-single-1x1-2x1-text-right-match.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-single-1x1-2x1-text-right-match-expected.rdf',
      testCaseDescription:
        '4. KET reaction with text name and matching with bounding box on the different sides (right) from Single Arrow (1:1), Multi-Tailed Arrow is also added',
    },
  ];

  testCases30.forEach(
    ({ ketFile, rdfFileExpectedV2000, testCaseDescription }) => {
      test(`Add to Canvas from ${testCaseDescription} save to RDF V2000, add to Canvas from RDF V2000, verify that reaction with text name is displayed correctly`, async () => {
        /* 
        Test case: https://github.com/epam/Indigo/issues/2404
        Description: ${testCaseDescription} can be saved to RDF V2000 format, then reloaded with correct structure.
        Case:
          1. Open KET file
          2. Save and verify RDF file
          3. Open saved RDF file
        */
        await openFileAndAddToCanvasAsNewProject(page, ketFile);
        await takeEditorScreenshot(page);
        await verifyFileExport(
          page,
          `${rdfFileExpectedV2000}`,
          FileType.RDF,
          RdfFileFormat.v2000,
        );
        await openFileAndAddToCanvasAsNewProject(page, rdfFileExpectedV2000);
        await takeEditorScreenshot(page);
      });
    },
  );

  const testCases31 = [
    {
      ketFile: 'KET/ket-single-1x1-2x1-text-top-no-match.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-single-1x1-2x1-text-top-no-match-expected.rdf',
      testCaseDescription:
        '1. KET reaction with text name and no matching with bounding box on the different sides (top) from Single Arrow (1:1), Multi-Tailed Arrow is also added',
    },
    {
      ketFile: 'KET/ket-single-1x1-2x1-text-bottom-no-match.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-single-1x1-2x1-text-bottom-no-match-expected.rdf',
      testCaseDescription:
        '2. KET reaction with text name and no matching with bounding box on the different sides (bottom) from Single Arrow (1:1), Multi-Tailed Arrow is also added',
    },
    {
      ketFile: 'KET/ket-single-1x1-2x1-text-left-no-match.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-single-1x1-2x1-text-left-no-match-expected.rdf',
      testCaseDescription:
        '3. KET reaction with text name and no matching with bounding box on the different sides (left) from Single Arrow (1:1), Multi-Tailed Arrow is also added',
    },
    {
      ketFile: 'KET/ket-single-1x1-2x1-text-right-no-match.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-single-1x1-2x1-text-right-no-match-expected.rdf',
      testCaseDescription:
        '4. KET reaction with text name and no matching with bounding box on the different sides (right) from Single Arrow (1:1), Multi-Tailed Arrow is also added',
    },
  ];

  testCases31.forEach(
    ({ ketFile, rdfFileExpectedV2000, testCaseDescription }) => {
      test(`Add to Canvas from ${testCaseDescription} save to RDF V2000, add to Canvas from RDF V2000, verify that reaction without text name is displayed correctly`, async () => {
        /* 
        Test case: https://github.com/epam/Indigo/issues/2404
        Description: ${testCaseDescription} can be saved to RDF V2000 format, then reloaded with correct structure.
        Case:
          1. Open KET file
          2. Save and verify RDF file
          3. Open saved RDF file
        */
        await openFileAndAddToCanvasAsNewProject(page, ketFile);
        await takeEditorScreenshot(page);
        await verifyFileExport(
          page,
          `${rdfFileExpectedV2000}`,
          FileType.RDF,
          RdfFileFormat.v2000,
        );
        await openFileAndAddToCanvasAsNewProject(page, rdfFileExpectedV2000);
        await takeEditorScreenshot(page);
      });
    },
  );

  const testCases32 = [
    {
      ketFile: 'KET/ket-cascade-2-1-1-text-name-conditions-match.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-cascade-2-1-1-text-name-conditions-match-expected.rdf',
      testCaseDescription:
        '1. KET cascade reaction (2:1:1) with text name, conditions and matching with bounding box',
      testCaseExpectedResult:
        'Reaction with text name in bold and conditions in italic are displayed correctly with font = 13',
    },
    {
      ketFile: 'KET/ket-cascade-2-1-1-text-name-match.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-cascade-2-1-1-text-name-match-expected.rdf',
      testCaseDescription:
        '2. KET cascade reaction (2:1:1) with text name only and matching with bounding box',
      testCaseExpectedResult:
        'Reaction only with name in bold is displayed correctly with font = 13',
    },
    {
      ketFile: 'KET/ket-cascade-2-1-1-text-conditions-match.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-cascade-2-1-1-text-conditions-match-expected.rdf',
      testCaseDescription:
        '3. KET cascade reaction (2:1:1) with text conditions only and matching with bounding box',
      testCaseExpectedResult:
        'Reaction only with name in italic is displayed correctly with font = 13, the first line is empty',
    },
    {
      ketFile: 'KET/ket-cascade-2-1-1-text-name-conditions-no-match.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-cascade-2-1-1-text-name-conditions-no-match-expected.rdf',
      testCaseDescription:
        '4. KET cascade reaction (2:1:1) with text name, conditions and no matching with bounding box',
      testCaseExpectedResult: 'There are no reactions name and conditions',
    },
    {
      ketFile: 'KET/ket-cascade-reaction-2-1-1-auto-wrap-9-lines.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-cascade-reaction-2-1-1-auto-wrap-9-lines-expected.rdf',
      testCaseDescription:
        '5. KET cascade reaction (2:1:1) with text name, conditions, matching with bounding box and future auto wrapping (9 lines)',
      testCaseExpectedResult:
        'Reaction with text name in bold and conditions in italic are displayed correctly with font = 13',
    },
    {
      ketFile: 'KET/ket-cascade-reaction-2-1-1-auto-wrap-9-lines-truncated.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-cascade-reaction-2-1-1-auto-wrap-9-lines-truncated-expected.rdf',
      testCaseDescription:
        '6. KET cascade reaction (2:1:1) with text name, conditions, matching with bounding box and future auto wrapping and truncating (more than 9 lines)',
      testCaseExpectedResult:
        'Reaction with text name in bold and conditions in italic (truncated) are displayed correctly with font = 13',
    },
    {
      ketFile:
        'KET/ket-cascade-reaction-2-1-1-auto-wrap-name-9-lines-truncated.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-cascade-reaction-2-1-1-auto-wrap-name-9-lines-truncated-expected.rdf',
      testCaseDescription:
        '7. KET cascade reaction (2:1:1) with only text name, matching with bounding box and future auto wrapping and truncating (more than 9 lines)',
      testCaseExpectedResult:
        'Reaction with text name in bold (truncated) is displayed correctly with font = 13',
    },
    {
      ketFile:
        'KET/ket-cascade-reaction-2-1-1-auto-wrap-conditions-9-lines-truncated.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-cascade-reaction-2-1-1-auto-wrap-conditions-9-lines-truncated-expected.rdf',
      testCaseDescription:
        '8. KET cascade reaction (2:1:1) with only text conditions, matching with bounding box and future auto wrapping and truncating (more than 9 lines)',
      testCaseExpectedResult:
        'Reaction with text conditions in italic (truncated) is displayed correctly with font = 13',
    },
    {
      ketFile: 'KET/ket-cascade-reaction-2-1-1-auto-wrap-spaces-9-lines.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-cascade-reaction-2-1-1-auto-wrap-spaces-9-lines-expected.rdf',
      testCaseDescription:
        '9. KET cascade reaction (2:1:1) with text name, conditions, matching with bounding box and future auto wrapping  (9 lines), spaces',
      testCaseExpectedResult:
        'Reaction with text name in bold and conditions in italic are displayed correctly with font = 13',
    },
    {
      ketFile:
        'KET/ket-cascade-reaction-2-1-1-auto-wrap-spaces-all-elements-9-lines-truncated.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-cascade-reaction-2-1-1-auto-wrap-spaces-all-elements-9-lines-truncated-expected.rdf',
      testCaseDescription:
        '10. KET cascade reaction (2:1:1) with text name, conditions, matching with bounding box and future auto wrapping, spaces, truncating (more than 9 lines)',
      testCaseExpectedResult:
        'Reaction with text name in bold and conditions in italic (truncated) are displayed correctly with font = 13',
    },
    {
      ketFile: 'KET/ket-cascade-reaction-2-1-1-manual-wrap-9-lines.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-cascade-reaction-2-1-1-manual-wrap-9-lines-expected.rdf',
      testCaseDescription:
        '11. KET cascade reaction with Multi-Tailed arrow (2:1:1) and reactions name and conditions with manual wrapping (9 lines)',
      testCaseExpectedResult:
        'Text of name is in bold, text of conditions is in italic, font size is 13, empty line between name and conditions',
    },
    {
      ketFile: 'KET/ket-single-reaction-2x1-name-conditions-long.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-single-reaction-2x1-name-conditions-long-expected.rdf',
      testCaseDescription:
        '12. KET single reaction (2:1) with very long text name, conditions, matching with bounding box',
      testCaseExpectedResult: 'Truncated symbols are saved',
    },
    {
      ketFile: 'KET/ket-cascade-reaction-2-1-1-multiple-texts.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-cascade-reaction-2-1-1-multiple-texts-expected.rdf',
      testCaseDescription:
        '13. KET cascade reaction (2:1:1) with multiple texts and matching with bounding box',
      testCaseExpectedResult:
        'Only nearest one is saved (algorithm checks minimal distance between start of head arrow and left bottom corner of text box), load from RDF V2000, reaction displayed correctly with only one text box near each part of reaction',
    },
    {
      ketFile: 'KET/ket-single-reaction-2x1-atoms-no-wrap-30-symbols.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-single-reaction-2x1-atoms-no-wrap-30-symbols-expected.rdf',
      testCaseDescription:
        '14. KET single reaction (2:1) with atoms, text name, conditions, matching with bounding box',
      testCaseExpectedResult:
        'Text of name and conditions is displayed correctly',
    },
    {
      ketFile: 'KET/ket-single-reaction-2x1-text-modified.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-single-reaction-2x1-text-modified-expected.rdf',
      testCaseDescription:
        '15. KET single reaction with Multi-Tailed (2:1) and reactions name and conditions, text of them is modified using editor',
      testCaseExpectedResult: 'The modifications are lost',
    },
  ];

  testCases32.forEach(
    ({ ketFile, rdfFileExpectedV2000, testCaseDescription }) => {
      test(`Add to Canvas from ${testCaseDescription} save to RDF V2000, add to Canvas from RDF V2000`, async () => {
        /* 
        Test case: https://github.com/epam/Indigo/issues/2404
        Description: ${testCaseDescription} can be saved to RDF V2000 format, then reloaded with correct structure.
        Case:
          1. Open KET file
          2. Save and verify RDF file
          3. Open saved RDF file
        */
        await openFileAndAddToCanvasAsNewProject(page, ketFile);
        await takeEditorScreenshot(page);
        await verifyFileExport(
          page,
          `${rdfFileExpectedV2000}`,
          FileType.RDF,
          RdfFileFormat.v2000,
        );
        await openFileAndAddToCanvasAsNewProject(page, rdfFileExpectedV2000);
        await takeEditorScreenshot(page);
      });
    },
  );

  const testCases33 = [
    {
      ketFile: 'KET/ket-cascade-reactions-name-conditions.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-cascade-reactions-name-conditions-expected.rdf',
      rdfFileExpectedV3000:
        'RDF-V3000/ket-cascade-reactions-name-conditions-expected.rdf',
      testCaseDescription:
        'KET cascade reactions with Multi-Tailed and single arrow (5-tails and 2:1:1) and reactions name and conditions',
    },
  ];

  testCases33.forEach(
    ({
      ketFile,
      rdfFileExpectedV2000,
      rdfFileExpectedV3000,
      testCaseDescription,
    }) => {
      ([RdfFileFormat.v2000, RdfFileFormat.v3000] as const).forEach(
        (format) => {
          test(`Verify that ${testCaseDescription} can be saved/loaded to/from ${format.toUpperCase()}`, async () => {
            /* 
          Test case: https://github.com/epam/Indigo/issues/2404
          Description: ${testCaseDescription} can be saved to RDF ${format.toUpperCase()} format, then reloaded with correct structure.
          Case:
            1. Open KET file
            2. Save and verify RDF file
            3. Open saved RDF file
          */
            const rdfFileExpected =
              format === RdfFileFormat.v2000
                ? rdfFileExpectedV2000
                : rdfFileExpectedV3000;

            await openFileAndAddToCanvasAsNewProject(page, ketFile);
            await takeEditorScreenshot(page);
            await verifyFileExport(
              page,
              `${rdfFileExpected}`,
              FileType.RDF,
              format,
            );
            await openFileAndAddToCanvasAsNewProject(page, rdfFileExpected);
            await takeEditorScreenshot(page);
          });
        },
      );
    },
  );

  const testCases34 = [
    {
      rdfFile: 'RDF-V2000/ket-cascade-reactions-name-conditions-expected.rdf',
      rdfFileExpectedV3000:
        'RDF-V3000/ket-cascade-reactions-name-conditions-v3000.rdf',
      testCaseDescription:
        'RDF V2000 cascade reactions with Multi-Tailed and single arrow (5-tails and 2:1:1) and reactions name and conditions',
      testCaseExpectedResult:
        'Reaction with text name in bold and conditions in italic are displayed correctly with font = 13',
    },
  ];

  testCases34.forEach(
    ({ rdfFile, rdfFileExpectedV3000, testCaseDescription }) => {
      test(`Add to Canvas from ${testCaseDescription} save to RDF V3000, add to Canvas from RDF V3000`, async () => {
        /* 
        Test case: https://github.com/epam/Indigo/issues/2404
        Description: ${testCaseDescription} can be saved to RDF V3000 format, then reloaded with correct structure.
        Case:
          1. Open RDF file
          2. Save and verify RDF file
          3. Open saved RDF file
        */
        await openFileAndAddToCanvasAsNewProject(page, rdfFile);
        await takeEditorScreenshot(page);
        await verifyFileExport(
          page,
          `${rdfFileExpectedV3000}`,
          FileType.RDF,
          RdfFileFormat.v3000,
        );
        await openFileAndAddToCanvasAsNewProject(page, rdfFileExpectedV3000);
        await takeEditorScreenshot(page);
      });
    },
  );

  const testCases35 = [
    {
      ketFile: 'KET/ket-single-reaction-2-1-1-no-text.ket',
      rdfFileExpectedV2000:
        'RDF-V2000/ket-single-reaction-2-1-1-no-text-expected.rdf',
      rdfFileExpectedV3000:
        'RDF-V3000/ket-single-reaction-2-1-1-no-text-expected.rdf',
      testCaseDescription:
        'KET cascade reaction (2-1-1) without text, using "Add Text" tool, add text name and conditions for each part of reaction',
    },
  ];

  testCases35.forEach(
    ({
      ketFile,
      rdfFileExpectedV2000,
      rdfFileExpectedV3000,
      testCaseDescription,
    }) => {
      ([RdfFileFormat.v2000, RdfFileFormat.v3000] as const).forEach(
        (format) => {
          test(`Add to Canvas from ${testCaseDescription} then can be saved/loaded to/from ${format.toUpperCase()}`, async () => {
            /*
            Test case: https://github.com/epam/Indigo/issues/2404
            Description: Added to Canvas from KET cascade reaction (2-1-1) without text, using "Add Text" tool, 
            added text name and conditions for each part of reaction, saved to RDF V2000/V3000 formats, after that loaded from RDF V2000/V3000, 
            verified that they are displayed correctly with name and conditions.
            Case:
            1. Open KET file
            2. Add text above arrows
            3. Save and verify RDF file
            4. Open saved RDF file
          */
            const rdfFileExpected =
              format === RdfFileFormat.v2000
                ? rdfFileExpectedV2000
                : rdfFileExpectedV3000;

            await openFileAndAddToCanvas(page, ketFile);
            await addTextToCanvas(
              page,
              'abcde FGHIJKLMNOP!@##$%^^^&*',
              470,
              360,
            );
            await pressButton(page, 'Apply');
            await addTextToCanvas(
              page,
              'abcde FGHIJKLMNOP!@##$%^^^&*',
              700,
              360,
            );
            await pressButton(page, 'Apply');
            await takeEditorScreenshot(page);
            await verifyFileExport(
              page,
              `${rdfFileExpected}`,
              FileType.RDF,
              format,
            );
            await openFileAndAddToCanvasAsNewProject(page, rdfFileExpected);
            await takeEditorScreenshot(page);
          });
        },
      );
    },
  );

  const testCases36 = [
    {
      ketFile: 'KET/ket-single-reaction-2x1-name-conditions-layout.ket',
      testCaseDescription:
        '1. KET single reaction (2:1) with very text name, conditions, matching with bounding box',
      testCaseExpectedResult:
        'Text of name is in bold, text of conditions is in italic, font size is 13, empty line between name and conditions',
    },
    {
      ketFile: 'KET/ket-cascade-reactions-name-conditions.ket',
      testCaseDescription:
        '2. KET cascade reactions with Multi-Tailed and single arrow (5-tails and 2:1:1) and reactions name and conditions',
      testCaseExpectedResult:
        'Text of name and conditions is displayed correctly',
    },
  ];

  testCases36.forEach(({ ketFile, testCaseDescription }) => {
    test(`Add to Canvas from ${testCaseDescription} make Layout and verify that the text is looked correctly`, async () => {
      /* 
      Test case: https://github.com/epam/Indigo/issues/2559
      Description: ${testCaseExpectedResult}
      Case:
        1. Open KET file
        2. Make Layout
        3. Take screenshot
      */
      await openFileAndAddToCanvasAsNewProject(page, ketFile);
      await takeEditorScreenshot(page);
      await IndigoFunctionsToolbar(page).layout();
      await takeEditorScreenshot(page);
    });
  });
});
