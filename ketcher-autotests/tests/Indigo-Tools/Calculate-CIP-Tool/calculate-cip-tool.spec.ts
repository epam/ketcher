/* eslint-disable no-magic-numbers */
import { expect, test } from '@playwright/test';
import {
  selectTopPanelButton,
  openFileAndAddToCanvas,
  TopPanelButton,
  takeEditorScreenshot,
  DELAY_IN_SECONDS,
  delay,
  getAndCompareInchi,
  getAndCompareSmiles,
  BondType,
  selectLeftPanelButton,
  LeftPanelButton,
  selectRingButton,
  RingButton,
  clickInTheMiddleOfTheScreen,
  resetCurrentTool,
  copyAndPaste,
  cutAndPaste,
  receiveFileComparisonData,
  saveToFile,
  BondTool,
  selectNestedTool,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';
import { getBondByIndex } from '@utils/canvas/bonds';
import { getRotationHandleCoordinates } from '@utils/clicks/selectButtonByTitle';
import { getKet, getMolfile } from '@utils/formats';

test.describe('Indigo Tools - Calculate CIP Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Operation with a structure without stereo properties', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1886
    Description: The structure isn`t changed.
    */
    await openFileAndAddToCanvas('Ket/chain.ket', page);
    await selectTopPanelButton(TopPanelButton.Calculate, page);
  });

  test('Operation with structure including stereo properties (R/S labels)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1887
    Description: (R) and (S) stereo labels appear near stereobonds.
    */
    await openFileAndAddToCanvas('structure-with-stereo-bonds.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculate, page);
  });

  test('Operation with empty canvas', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1885
    Description: Nothing happens on the canvas when it is empty.
    Ketcher functions work correctly after clicking the 'Calculate CIP' button on the empty canvas.
    */
    await selectTopPanelButton(TopPanelButton.Calculate, page);
    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
  });

  test.fixme(
    'Layout/Undo with structure that contain stereo labels',
    async ({ page }) => {
      /*
    Test case: EPMLSOPKET-1900
    Description: Stereo labels appear near stereobonds after 'Calculate CIP' action.
    Stereo labels disappear after 'Layout' action.
    'Undo' action leads to the previous structure with stereo labels.
    */
      // will work after bugfix in 2.13-rc.3 bug#3025
      await openFileAndAddToCanvas('structure-with-stereo-bonds.mol', page);
      await selectTopPanelButton(TopPanelButton.Calculate, page);
      await selectTopPanelButton(TopPanelButton.Layout, page);

      await takeEditorScreenshot(page);

      await selectTopPanelButton(TopPanelButton.Undo, page);
    },
  );

  test.fixme(
    'Copy/Paste of structure that contain stereo labels',
    async ({ page }) => {
      /*
    Test case: EPMLSOPKET-1896
    Description: The structure is copied.
    Stereo labels don't disappear after paste of the structure on the canvas.
    */
      const x = 300;
      const y = 300;
      await openFileAndAddToCanvas('structure-with-stereo-bonds.mol', page);
      await selectTopPanelButton(TopPanelButton.Calculate, page);
      await copyAndPaste(page);
      await page.mouse.click(x, y);
    },
  );

  test.fixme(
    'Cut/Paste of structure that contain stereo labels',
    async ({ page }) => {
      /*
    Test case: EPMLSOPKET-1898
    Description: The structure is cut.
    Stereo labels don't disappear after paste of the structure on the canvas.
    */
      const x = 300;
      const y = 300;
      await openFileAndAddToCanvas('structure-with-stereo-bonds.mol', page);
      await selectTopPanelButton(TopPanelButton.Calculate, page);
      await cutAndPaste(page);
      await page.mouse.click(x, y);
    },
  );

  test('Operation with structure including stereo properties (E/Z labels)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1888
    Description: (E) and (Z) stereo labels appear near stereobonds.
    */
    await openFileAndAddToCanvas('structures-with-stereo-bonds-ez.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculate, page);
  });

  test('(1 structure) Calculate files that contain stereo labels (various structure combinations)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1889
    Description: Stereo labels appear near stereobonds.
    */
    await openFileAndAddToCanvas('structure-with-stereo-bonds-1.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculate, page);
  });

  test('(2 structure) Calculate files that contain stereo labels (various structure combinations)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1889
    Description: Stereo labels appear near stereobonds.
    */
    await openFileAndAddToCanvas('structure-with-stereo-bonds-2.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculate, page);
  });

  test('(3 structure) Calculate files that contain stereo labels (various structure combinations)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1889
    Description: Stereo labels appear near stereobonds.
    */
    await openFileAndAddToCanvas('structure-with-stereo-bonds-3.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculate, page);
  });

  test('(4 structure) Calculate files that contain stereo labels (various structure combinations)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1889
    Description: Stereo labels appear near stereobonds.
    */
    await openFileAndAddToCanvas('structure-with-stereo-bonds-4.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculate, page);
  });

  test('(5 structure) Calculate files that contain stereo labels (various structure combinations)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1889
    Description: Stereo labels appear near stereobonds.
    */
    await openFileAndAddToCanvas('structure-with-stereo-bonds-5.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculate, page);
  });

  test('(6 structure) Calculate files that contain stereo labels (various structure combinations)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1889
    Description: Stereo labels appear near stereobonds.
    */
    await openFileAndAddToCanvas('structure-with-stereo-bonds-6.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculate, page);
  });

  test('(7 structure) Calculate files that contain stereo labels (various structure combinations)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1889
    Description: Stereo labels appear near stereobonds.
    */
    await openFileAndAddToCanvas('structure-with-stereo-bonds-7.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculate, page);
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
    await openFileAndAddToCanvas('aromatic-with-stereolabels.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculate, page);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Aromatize, page);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Undo, page);
  });

  test('3D View_structure with stereo labels', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1919
    Description: Stereo labels appear near stereobonds after the 'Calculate CIP' action.
    The structure appears in 3D Viewer dialog without stereo labels.
    */
    await openFileAndAddToCanvas('structure-with-stereo-bonds.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculate, page);
    await selectTopPanelButton(TopPanelButton.ThreeD, page);
  });

  test.fixme(
    '(Erase bond with stereo labels and Undo) Manipulations with structure with stereo labels',
    async ({ page }) => {
      /*
    Test case: EPMLSOPKET-1925
    Description: Stereo labels appear near stereobonds after 'Calculate CIP' action.
    Bond with stereo label is deleted after removing by the 'Erase' tool.
    'Undo' action leads to the previous structure with stereo labels.
    */
      await openFileAndAddToCanvas('structure-with-stereo-bonds.mol', page);
      await selectTopPanelButton(TopPanelButton.Calculate, page);
      await selectLeftPanelButton(LeftPanelButton.Erase, page);
      const point = await getBondByIndex(page, { type: BondType.SINGLE }, 3);
      await page.mouse.click(point.x, point.y);

      await takeEditorScreenshot(page);

      await selectTopPanelButton(TopPanelButton.Undo, page);
    },
  );

  test('(Erase atom with stereo labels and Undo) Manipulations with structure with stereo labels', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1925
    Description: An atom of a stereo bond is deleted after removing by the 'Erase' tool.
    'Undo' action leads to the previous structure with stereo labels.
    */
    await openFileAndAddToCanvas('chain-with-stereo-bonds.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculate, page);
    await selectLeftPanelButton(LeftPanelButton.Erase, page);
    const point = await getAtomByIndex(page, { label: 'N' }, 0);
    await page.mouse.click(point.x, point.y);

    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Undo, page);
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
    await openFileAndAddToCanvas('structure-with-stereo-bonds.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculate, page);
    await delay(DELAY_IN_SECONDS.TWO);
    await page.keyboard.press('Control+a');
    const coordinates = await getRotationHandleCoordinates(page);
    const { x: rotationHandleX, y: rotationHandleY } = coordinates;

    await page.mouse.move(rotationHandleX, rotationHandleY);
    await page.mouse.down();
    await page.mouse.move(
      COORDINATES_TO_PERFORM_ROTATION.x,
      COORDINATES_TO_PERFORM_ROTATION.y,
    );
    await page.mouse.up();
  });

  test('(Add a new stereobond to the structure) Manipulations with structure with stereo labels', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1925
    Description: New stereobond is added to the Chain structure.
    */
    await openFileAndAddToCanvas('chain-with-stereo-bonds.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculate, page);
    await delay(DELAY_IN_SECONDS.TWO);
    await selectNestedTool(page, BondTool.UP);
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 5);
    await page.mouse.click(point.x, point.y);
  });

  test('Check tooltip and labels', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-11841
    Description: The labels are next to the stereo bonds. When you hover over the label, the tooltip does not appear.
    */
    await openFileAndAddToCanvas('chain-with-stereo-bonds.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculate, page);
    await delay(DELAY_IN_SECONDS.TWO);
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 3);
    await page.mouse.move(point.x, point.y);
  });
});

test.describe('Indigo Tools - Calculate CIP Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test('Check .ket file CIP data must be moved from s-group properties to atom properties', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-11842
    Description: CIP data located in file at atom properties section
    */
    await openFileAndAddToCanvas('structure-with-stereo-bonds.mol', page);
    const expectedFile = await getKet(page);
    await saveToFile(
      'Ket/structure-with-stereo-bonds-expected.ket',
      expectedFile,
    );
    await selectTopPanelButton(TopPanelButton.Calculate, page);
    const { file: ketFile, fileExpected: ketFileExpected } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Ket/structure-with-stereo-bonds-expected.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);
  });

  test('Save as .mol V2000 file structure with stereo labels', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1911
    Description: The file is saved as .mol V2000 file.
    */
    await openFileAndAddToCanvas('structure-with-stereo-bonds.mol', page);
    const expectedFile = await getMolfile(page, 'v2000');
    await saveToFile(
      'structure-with-stereo-bonds-expectedV2000.mol',
      expectedFile,
    );
    await selectTopPanelButton(TopPanelButton.Calculate, page);
    const METADATA_STRING_INDEX = [1];
    const { file: molFile, fileExpected: molFileExpected } =
      await receiveFileComparisonData({
        page,
        metaDataIndexes: METADATA_STRING_INDEX,
        expectedFileName:
          'tests/test-data/structure-with-stereo-bonds-expectedV2000.mol',
        fileFormat: 'v2000',
      });

    expect(molFile).toEqual(molFileExpected);
  });

  test.fixme(
    'Save as .mol V3000 file structure with stereo labels',
    async ({ page }) => {
      /*
    Test case: EPMLSOPKET-1911
    Description: The file is saved as .mol V3000 file.
    */
      await openFileAndAddToCanvas('structure-with-stereo-bonds.mol', page);
      const expectedFile = await getMolfile(page, 'v3000');
      await saveToFile(
        'structure-with-stereo-bonds-expectedV3000.mol',
        expectedFile,
      );
      await selectTopPanelButton(TopPanelButton.Calculate, page);
      const METADATA_STRING_INDEX = [1];
      const { file: molFile, fileExpected: molFileExpected } =
        await receiveFileComparisonData({
          page,
          metaDataIndexes: METADATA_STRING_INDEX,
          expectedFileName:
            'tests/test-data/structure-with-stereo-bonds-expectedV3000.mol',
          fileFormat: 'v3000',
        });

      expect(molFile).toEqual(molFileExpected);
    },
  );

  test('Save as .smi file structure with stereo labels', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1912
    Description: The file is saved as .smi file.
    */
    await openFileAndAddToCanvas('structure-with-stereo-bonds.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculate, page);
    await getAndCompareSmiles(
      page,
      'tests/test-data/structure-with-stereo-bonds.smi',
    );
  });

  test('Save as .inchi file structure with stereo labels', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1918
    Description: The file is saved as .inchi file.
    */
    await openFileAndAddToCanvas('structure-with-stereo-bonds.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculate, page);
    await getAndCompareInchi(
      page,
      'tests/test-data/structure-with-stereo-bonds.inchi',
    );
  });
});
