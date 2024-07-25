/* eslint-disable no-magic-numbers */
import { test, expect, Page } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  clickOnFileFormatDropdown,
  getKet,
  openFile,
  openFileAndAddToCanvas,
  openFileAndAddToCanvasAsNewProject,
  openImageAndAddToCanvas,
  openPasteFromClipboard,
  pressButton,
  readFileContents,
  receiveFileComparisonData,
  saveToFile,
  selectTopPanelButton,
  takeEditorScreenshot,
  TopPanelButton,
  waitForPageInit,
} from '@utils';

async function verifyFile(
  page: Page,
  filename: string,
  expectedFilename: string,
) {
  const expectedFile = await getKet(page);
  await saveToFile(filename, expectedFile);

  const { fileExpected: ketFileExpected, file: ketFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName: expectedFilename,
    });

  expect(ketFile).toEqual(ketFileExpected);
  await openFileAndAddToCanvasAsNewProject(filename, page);
  await takeEditorScreenshot(page);
}

test.describe('Image files', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Verify that single image of SVG format can be saved to KET file and load', async ({
    page,
  }) => {
    /**
     * Test case: #4911
     * Description: Single image of SVG format can be saved to KET file and load
     * The test does not work as expected. The test runs locally but on CI/CD it constantly crashes due to the
     * difference in the returned data in \"bitmap\": \"data:image/
     * Should be fixed by ticket https://github.com/epam/Indigo/issues/2144
     */
    test.fail();
    await openImageAndAddToCanvas('Images/image-svg-demo.svg', page);
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/image-svg-demo-expected.ket',
      'tests/test-data/KET/image-svg-demo-expected.ket',
    );
  });

  test('Verify that single image of PNG format can be saved to KET file and load', async ({
    page,
  }) => {
    /**
     * Test case: #4911
     * Description: Single image of PNG format can be saved to KET file and load
     */
    await openImageAndAddToCanvas('Images/image-png.png', page);
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/image-png-expected.ket',
      'tests/test-data/KET/image-png-expected.ket',
    );
  });

  test('Verify that images of SVG and PNG format can be saved to KET file and load', async ({
    page,
  }) => {
    /**
     * Test case: #4911
     * Description: Images of SVG and PNG format can be saved to KET file and load
     * The test does not work as expected. The test runs locally but on CI/CD it constantly crashes due to the
     * difference in the returned data in \"bitmap\": \"data:image/
     * Should be fixed by ticket https://github.com/epam/Indigo/issues/2144
     */
    test.fail();
    await openImageAndAddToCanvas('Images/image-svg-demo.svg', page);
    await openImageAndAddToCanvas('Images/image-png.png', page, 200, 200);
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/image-svg-and-png-expected.ket',
      'tests/test-data/KET/image-svg-and-png-expected.ket',
    );
  });

  test('Verify that images of SVG and PNG format can be saved to KET file and added to canvas with correct positions and layer levels (last added image is on top)', async ({
    page,
  }) => {
    /**
     * Test case: #4911
     * Description: Images of SVG and PNG format can be saved to KET file and added to canvas
     * with correct positions and layer levels (last added image is on top)
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/four-images-svg-and-png.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/four-images-svg-and-png-expected.ket',
      'tests/test-data/KET/four-images-svg-and-png-expected.ket',
    );
  });

  test('Verify that images of SVG and PNG format can be saved to KET file and added to canvas with structures', async ({
    page,
  }) => {
    /**
     * Test case: #4911
     * Description: Images of SVG and PNG format can be saved to KET file and added to canvas with structures
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/images-with-benzene-ring-and-arrow.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/images-with-benzene-ring-and-arrow-expected.ket',
      'tests/test-data/KET/images-with-benzene-ring-and-arrow-expected.ket',
    );
  });

  test('Verify that images of SVG and PNG format with Structure library elements can be saved to KET file and added to canvas', async ({
    page,
  }) => {
    /**
     * Test case: #4911
     * Description: Images of SVG and PNG format with Structure library elements can be saved to KET file and added to canvas
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/images-png-svg-with-elements.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/images-png-svg-with-elements-expected.ket',
      'tests/test-data/KET/images-png-svg-with-elements-expected.ket',
    );
  });

  test('Verify that images of SVG and PNG format with 30 structure elements can be saved to KET file and added to canvas', async ({
    page,
  }) => {
    /**
     * Test case: #4911
     * Description: Images of SVG and PNG format with 30 structure elements can be saved to KET file and added to canvas
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/images-png-svg-30-with-30-elements.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/images-png-svg-30-with-30-elements-expected.ket',
      'tests/test-data/KET/images-png-svg-30-with-30-elements-expected.ket',
    );
  });

  test('Verify that images of SVG and PNG format can be added from two different KET files saved and opened', async ({
    page,
  }) => {
    /**
     * Test case: #4911
     * Description: Images of SVG and PNG format can be added from two different KET files saved and opened
     */
    await openFileAndAddToCanvas('KET/images-png-svg-with-elements.ket', page);
    await openFileAndAddToCanvas(
      'KET/images-with-benzene-ring-and-arrow.ket',
      page,
      200,
      200,
    );
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/two-images-with-many-elements-expected.ket',
      'tests/test-data/KET/two-images-with-many-elements-expected.ket',
    );
  });

  test('Verify that images of (PNG, SVG) are copied from .ket format and added to canvas using "PASTE FROM CLIPBOARD - Add to Canvas"', async ({
    page,
  }) => {
    /**
     * Test case: #4911
     * Description: Images of (PNG, SVG) are copied from .ket format and added to canvas using "PASTE FROM CLIPBOARD - Add to Canvas"
     */
    const fileContent = await readFileContents(
      'tests/test-data/KET/images-png-svg.ket',
    );
    await openPasteFromClipboard(page, fileContent);
    await pressButton(page, 'Add to Canvas');
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that images of (PNG, SVG) are copied from .ket format and added to canvas using "PASTE FROM CLIPBOARD - Open as New Project"', async ({
    page,
  }) => {
    /**
     * Test case: #4911
     * Description: Images of (PNG, SVG) are copied from .ket format and added to canvas using "PASTE FROM CLIPBOARD - Open as New Project"
     */
    const fileContent = await readFileContents(
      'tests/test-data/KET/images-png-svg.ket',
    );
    await openPasteFromClipboard(page, fileContent);
    await pressButton(page, 'Open as New Project');
    await takeEditorScreenshot(page);
  });

  test('Verify that images together (PNG, SVG) are copied from .ket format and added from clipboard directly to selected place on Canvas with correct positions', async ({
    page,
  }) => {
    /**
     * Test case: #4911
     * Description: Images together (PNG, SVG) are copied from .ket format and added from clipboard directly to selected place on Canvas with correct positions
     */
    const fileContent = await readFileContents(
      'tests/test-data/KET/images-png-svg.ket',
    );
    await openPasteFromClipboard(page, fileContent);
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    await page.getByTestId('close-icon').click();
    await page.keyboard.press('Control+v');
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that images together (PNG, SVG) are correctly displayed in .ket format in Open Structure Preview', async ({
    page,
  }) => {
    /**
     * Test case: #4911
     * Description: Images together (PNG, SVG) are correctly displayed in .ket format in Open Structure Preview
     */
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('KET/images-png-svg.ket', page);
    await takeEditorScreenshot(page);
  });

  test('Verify that images together (PNG, SVG) are correctly displayed in .ket format in Save Structure Preview', async ({
    page,
  }) => {
    /**
     * Test case: #4911
     * Description: Images together (PNG, SVG) are correctly displayed in .ket format in Save Structure Preview
     */
    await openFileAndAddToCanvas('KET/images-png-svg.ket', page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await clickOnFileFormatDropdown(page);
    await page.getByTestId('Ket Format-option').click();
    await takeEditorScreenshot(page);
  });

  const fileNames = [
    'image-bmp',
    'image-gif',
    'image-ico',
    'image-jpeg',
    'image-jpg',
    'image-tiff',
    'image-webp',
  ];

  for (const fileName of fileNames) {
    test(`Verify that image of not supported format ${fileName} cannot be added from .ket file to Canvas`, async ({
      page,
    }) => {
      /**
       * Test case: #4911
       * Description: Error message is displayed - "Cannot deserialize input JSON."
       */
      await selectTopPanelButton(TopPanelButton.Open, page);
      await openFile(`KET/${fileName}.ket`, page);
      await pressButton(page, 'Add to Canvas');
      await takeEditorScreenshot(page);
    });
  }
});
