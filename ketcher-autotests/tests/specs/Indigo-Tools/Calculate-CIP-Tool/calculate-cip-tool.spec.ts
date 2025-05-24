/* eslint-disable no-magic-numbers */
import { expect, test } from '@playwright/test';
import {
  openFileAndAddToCanvas,
  takeEditorScreenshot,
  BondType,
  clickInTheMiddleOfTheScreen,
  resetCurrentTool,
  copyAndPaste,
  cutAndPaste,
  receiveFileComparisonData,
  saveToFile,
  waitForPageInit,
  waitForRender,
  clickOnBond,
  openFileAndAddToCanvasAsNewProject,
  selectAllStructuresOnCanvas,
  clickOnCanvas,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';
import { getBondByIndex } from '@utils/canvas/bonds';
import { getRotationHandleCoordinates } from '@utils/clicks/selectButtonByTitle';
import { getMolfile } from '@utils/formats';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { MicroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { TopLeftToolbar } from '@tests/pages/common/TopLeftToolbar';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { selectRingButton } from '@tests/pages/molecules/BottomToolbar';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';

test.describe('Indigo Tools - Calculate CIP Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Operation with a structure without stereo properties', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1886
    Description: The structure isn`t changed.
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
  });

  test('Operation with structure including stereo properties (R/S labels)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1887
    Description: (R) and (S) stereo labels appear near stereobonds.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/structure-with-stereo-bonds.mol',
      page,
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
  });

  test('Operation with empty canvas', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1885
    Description: Nothing happens on the canvas when it is empty.
    Ketcher functions work correctly after clicking the 'Calculate CIP' button on the empty canvas.
    */
    await IndigoFunctionsToolbar(page).calculateCIP();
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Layout/Undo with structure that contain stereo labels', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1900
    Description: Stereo labels appear near stereobonds after 'Calculate CIP' action.
    Stereo labels disappear after 'Layout' action.
    'Undo' action leads to the previous structure with stereo labels.
    */
    // will work after bugfix in 2.13-rc.3 bug#3025
    await openFileAndAddToCanvas(
      'Molfiles-V2000/structure-with-stereo-bonds.mol',
      page,
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await IndigoFunctionsToolbar(page).layout();

    await takeEditorScreenshot(page);

    await TopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
  });

  test('Copy/Paste of structure that contain stereo labels', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1896
    Description: The structure is copied.
    Stereo labels don't disappear after paste of the structure on the canvas.
    */
    const x = 300;
    const y = 300;
    await openFileAndAddToCanvas(
      'Molfiles-V2000/structure-with-stereo-bonds.mol',
      page,
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await copyAndPaste(page);
    await clickOnCanvas(page, x, y);
    await takeEditorScreenshot(page);
  });

  test('Cut/Paste of structure that contain stereo labels', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1898
    Description: The structure is cut.
    Stereo labels don't disappear after paste of the structure on the canvas.
    */
    const x = 300;
    const y = 300;
    await openFileAndAddToCanvas(
      'Molfiles-V2000/structure-with-stereo-bonds.mol',
      page,
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await cutAndPaste(page);
    await clickOnCanvas(page, x, y);
    await takeEditorScreenshot(page);
  });

  test('Operation with structure including stereo properties (E/Z labels)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1888
    Description: (E) and (Z) stereo labels appear near stereobonds.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/structures-with-stereo-bonds-ez.mol',
      page,
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
  });

  test('(1 structure) Calculate files that contain stereo labels (various structure combinations)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1889
    Description: Stereo labels appear near stereobonds.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/structure-with-stereo-bonds-1.mol',
      page,
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
  });

  test('(2 structure) Calculate files that contain stereo labels (various structure combinations)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1889
    Description: Stereo labels appear near stereobonds.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/structure-with-stereo-bonds-2.mol',
      page,
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
  });

  test('(3 structure) Calculate files that contain stereo labels (various structure combinations)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1889
    Description: Stereo labels appear near stereobonds.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/structure-with-stereo-bonds-3.mol',
      page,
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
  });

  test('(4 structure) Calculate files that contain stereo labels (various structure combinations)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1889
    Description: Stereo labels appear near stereobonds.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/structure-with-stereo-bonds-4.mol',
      page,
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
  });

  test('(5 structure) Calculate files that contain stereo labels (various structure combinations)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1889
    Description: Stereo labels appear near stereobonds.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/structure-with-stereo-bonds-5.mol',
      page,
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
  });

  test('(6 structure) Calculate files that contain stereo labels (various structure combinations)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1889
    Description: Stereo labels appear near stereobonds.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/structure-with-stereo-bonds-6.mol',
      page,
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
  });

  test('(7 structure) Calculate files that contain stereo labels (various structure combinations)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1889
    Description: Stereo labels appear near stereobonds.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/structure-with-stereo-bonds-7.mol',
      page,
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
  });

  test('Aromatize/Undo with structure that contain stereo labels', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1910
    Description: Stereo labels appear near stereobonds after 'Calculate CIP' action.
    Stereo labels disappear after 'Aromatize' action.
    'Undo' action leads to previous structure with stereo labels.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/aromatic-with-stereolabels.mol',
      page,
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);

    await IndigoFunctionsToolbar(page).aromatize();
    await takeEditorScreenshot(page);

    await TopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
  });

  test('3D View_structure with stereo labels', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1919
    Description: Stereo labels appear near stereobonds after the 'Calculate CIP' action.
    The structure appears in 3D Viewer dialog without stereo labels.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/structure-with-stereo-bonds.mol',
      page,
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await IndigoFunctionsToolbar(page).ThreeDViewer();
    await takeEditorScreenshot(page);
  });

  test('(Erase bond with stereo labels and Undo) Manipulations with structure with stereo labels', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1925
    Description: Stereo labels appear near stereobonds after 'Calculate CIP' action.
    Bond with stereo label is deleted after removing by the 'Erase' tool.
    'Undo' action leads to the previous structure with stereo labels.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/structure-with-stereo-bonds.mol',
      page,
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await waitForRender(page, async () => {
      await clickOnBond(page, BondType.SINGLE, 3);
    });
    await page.keyboard.press('Delete');

    await takeEditorScreenshot(page);

    await TopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
  });

  test('(Erase atom with stereo labels and Undo) Manipulations with structure with stereo labels', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1925
    Description: An atom of a stereo bond is deleted after removing by the 'Erase' tool.
    'Undo' action leads to the previous structure with stereo labels.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/chain-with-stereo-bonds.mol',
      page,
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await CommonLeftToolbar(page).selectEraseTool();
    const point = await getAtomByIndex(page, { label: 'N' }, 0);
    await clickOnCanvas(page, point.x, point.y);

    await takeEditorScreenshot(page);

    await TopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
  });

  test('(Rotate structure) Manipulations with structure with stereo labels', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1925
    Description: The whole fragment is rotated around the structure center. Stereo labels are rotated with structure.
    */
    const COORDINATES_TO_PERFORM_ROTATION = {
      x: 20,
      y: 160,
    };
    await openFileAndAddToCanvas(
      'Molfiles-V2000/structure-with-stereo-bonds.mol',
      page,
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await selectAllStructuresOnCanvas(page);
    const coordinates = await getRotationHandleCoordinates(page);
    const { x: rotationHandleX, y: rotationHandleY } = coordinates;

    await page.mouse.move(rotationHandleX, rotationHandleY);
    await page.mouse.down();
    await page.mouse.move(
      COORDINATES_TO_PERFORM_ROTATION.x,
      COORDINATES_TO_PERFORM_ROTATION.y,
    );
    await page.mouse.up();
    await takeEditorScreenshot(page);
  });

  test('(Add a new stereobond to the structure) Manipulations with structure with stereo labels', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1925
    Description: New stereobond is added to the Chain structure.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/chain-with-stereo-bonds.mol',
      page,
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await CommonLeftToolbar(page).selectBondTool(MicroBondType.SingleUp);
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 5);
    await clickOnCanvas(page, point.x, point.y);
    await takeEditorScreenshot(page);
  });

  test('Check tooltip and labels', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-11841
    Description: The labels are next to the stereo bonds. When you hover over the label, the tooltip does not appear.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/chain-with-stereo-bonds.mol',
      page,
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 3);
    await page.mouse.move(point.x, point.y);
    await takeEditorScreenshot(page);
  });

  test(
    'Validate that the schema with retrosynthetic arrow after clicking on Calculate CIP tool',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /*
    Test case: #2071
    Description: Validate that schema with retrosynthetic arrow could be saved to Cdxml file and loaded back
    Test working not in proper way because we have bug https://github.com/epam/Indigo/issues/2318
    After fix we need update file and screenshot.
     */
      await openFileAndAddToCanvasAsNewProject(
        'KET/schema-with-retrosynthetic-arrow-for-options.ket',
        page,
      );
      await IndigoFunctionsToolbar(page).calculateCIP();
      await takeEditorScreenshot(page);
    },
  );
});

test.describe('Indigo Tools - Calculate CIP Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Check .ket file CIP data must be moved from s-group properties to atom properties', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-11842
    Description: CIP data located in file at atom properties section
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/structure-with-stereo-bonds.mol',
      page,
    );
    await IndigoFunctionsToolbar(page).calculateCIP();

    await verifyFileExport(
      page,
      'KET/structure-with-stereo-bonds-expected.ket',
      FileType.KET,
    );
  });

  // TODO: It's unstable, skip for now
  test.skip(
    'Save as .mol V2000 file structure with stereo labels',
    {
      tag: ['@FlackyTest'],
    },
    async ({ page }) => {
      /*
    Test case: EPMLSOPKET-1911
    Description: The file is saved as .mol V2000 file.

    IMPORTANT: This test some times fails because of https://github.com/epam/ketcher/issues/2647 and https://github.com/epam/ketcher/issues/3951
    */
      await openFileAndAddToCanvas(
        'Molfiles-V2000/structure-with-stereo-bonds.mol',
        page,
      );
      const expectedFile = await getMolfile(page, 'v2000');
      await saveToFile(
        'Molfiles-V2000/structure-with-stereo-bonds-expectedV2000.mol',
        expectedFile,
      );
      await IndigoFunctionsToolbar(page).calculateCIP();
      const METADATA_STRING_INDEX = [1];
      const { file: molFile, fileExpected: molFileExpected } =
        await receiveFileComparisonData({
          page,
          metaDataIndexes: METADATA_STRING_INDEX,
          expectedFileName:
            'Molfiles-V2000/structure-with-stereo-bonds-expectedV2000.mol',
          fileFormat: 'v2000',
        });

      expect(molFile).toEqual(molFileExpected);
    },
  );

  test('Save as .mol V3000 file structure with stereo labels', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1911
    Description: The file is saved as .mol V3000 file.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/structure-with-stereo-bonds.mol',
      page,
    );
    await verifyFileExport(
      page,
      'Molfiles-V3000/structure-with-stereo-bonds-expectedV3000.mol',
      FileType.MOL,
      'v3000',
    );
  });

  test('Save as .smi file structure with stereo labels', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1912
    Description: The file is saved as .smi file.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/structure-with-stereo-bonds.mol',
      page,
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await verifyFileExport(
      page,
      'SMILES/structure-with-stereo-bonds.smi',
      FileType.SMILES,
    );
  });

  test('Save as .inchi file structure with stereo labels', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1918
    Description: The file is saved as .inchi file.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/structure-with-stereo-bonds.mol',
      page,
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await verifyFileExport(
      page,
      'InChI/structure-with-stereo-bonds.inchi',
      FileType.InChI,
    );
  });
});
