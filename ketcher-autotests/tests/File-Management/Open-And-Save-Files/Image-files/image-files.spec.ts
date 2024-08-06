/* eslint-disable no-magic-numbers */
import { test, expect, Page } from '@playwright/test';
import {
  applyAutoMapMode,
  clickInTheMiddleOfTheScreen,
  clickOnFileFormatDropdown,
  copyAndPaste,
  cutAndPaste,
  dragMouseTo,
  getKet,
  LeftPanelButton,
  moveOnAtom,
  openFile,
  openFileAndAddToCanvas,
  openFileAndAddToCanvasAsNewProject,
  openImageAndAddToCanvas,
  openPasteFromClipboard,
  pressButton,
  readFileContents,
  receiveFileComparisonData,
  resetCurrentTool,
  RingButton,
  saveToFile,
  saveToTemplates,
  screenshotBetweenUndoRedo,
  selectLeftPanelButton,
  selectRectangleSelectionTool,
  selectRing,
  selectTopPanelButton,
  selectWithLasso,
  setZoomInputValue,
  takeEditorScreenshot,
  takeLeftToolbarScreenshot,
  TopPanelButton,
  waitForPageInit,
  waitForSpinnerFinishedWork,
} from '@utils';
import { openStructureLibrary } from '@utils/templates';

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
     */
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
     */
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
      'KET/images-png-svg-80-with-50-structures.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/images-png-svg-80-with-50-structures-expected.ket',
      'tests/test-data/KET/images-png-svg-80-with-50-structures-expected.ket',
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

  const corruptedFiles = [
    'image-png-corrupted-data-field.ket',
    'image-png-corrupted-height-field.ket',
    'image-png-corrupted-height-negative.ket',
    'image-png-corrupted-height-zero.ket',
    'image-png-corrupted-type-value.ket',
    'image-png-corrupted-width-field.ket',
    'image-png-corrupted-width-negative.ket',
    'image-png-corrupted-width-zero.ket',
    'image-svg-corrupted.ket',
    'image-svg-corrupted-boundingbox.ket',
    'image-svg-corrupted-format-field.ket',
    'image-svg-corrupted-format-value.ket',
  ];

  for (const file of corruptedFiles) {
    test(`Verify that image with corrupted data from ${file} cannot be added from .ket file to Canvas`, async ({
      page,
    }) => {
      /**
       * Test case: #4911
       * Description: Error message is displayed - "Cannot deserialize input JSON."
       */
      await selectTopPanelButton(TopPanelButton.Open, page);
      await openFile(`KET/${file}`, page);
      await pressButton(page, 'Add to Canvas');
      await takeEditorScreenshot(page);
    });
  }

  test('Verify that image cannot be loaded from .ket file if the length of bitmap is less than 160 symbols', async ({
    page,
  }) => {
    /**
     * Test case: #4911
     * Description: Error message is displayed - "Cannot deserialize input JSON."
     */
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile(`KET/image-png-159-symbols.ket`, page);
    await pressButton(page, 'Add to Canvas');
    await takeEditorScreenshot(page);
  });

  test('Verify adding SVG and PNG images with the canvas zoomed to 400%. After placing the images, zoom out to 20% and then press the 100% zoom button', async ({
    page,
  }) => {
    /**
     * Test case: #4911
     * Description: Zoom In and Zoom Out work for Images
     */
    await setZoomInputValue(page, '400');
    await resetCurrentTool(page);
    await openFileAndAddToCanvas('KET/images-png-svg.ket', page);
    await takeEditorScreenshot(page);
    await setZoomInputValue(page, '20');
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
    await setZoomInputValue(page, '100');
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that action of adding to Canvas images of allowed formats (PNG, SVG) together from .ket file can be Undo/Redo', async ({
    page,
  }) => {
    /**
     * Test case: #4911
     * Description: Action of adding to Canvas images of allowed formats (PNG, SVG) together from .ket file can be Undo/Redo
     */
    await openFileAndAddToCanvas('KET/images-png-svg.ket', page);
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that action of adding to Canvas images of allowed formats (PNG, SVG) using "Add Image" button can be Undo/Redo', async ({
    page,
  }) => {
    /**
     * Test case: #4911
     * Description: Action of adding to Canvas images of allowed formats (PNG, SVG) using "Add Image" button can be Undo/Redo
     */
    await openImageAndAddToCanvas('Images/image-svg.svg', page);
    await openImageAndAddToCanvas('Images/image-png.png', page, 200, 200);
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that "Add Image" button is on left panel, icon can be selected and it displays with filling', async ({
    page,
  }) => {
    /**
     * Test case: #4897
     * Description: "Add Image" button is on left panel, icon can be selected and it displays with filling, after
     * clicking on another tool or Esc, the icon selection with filling is removed
     */
    await selectLeftPanelButton(LeftPanelButton.AddImage, page);
    await takeLeftToolbarScreenshot(page);
    await selectLeftPanelButton(LeftPanelButton.AddText, page);
    await takeLeftToolbarScreenshot(page);
  });

  test('Verify that images can be added to different selected places on Canvas one by one using "Add Image" button and can be selected and moved to another place', async ({
    page,
  }) => {
    /**
     * Test case: #4897
     * Description: Images can be added to different selected places on Canvas one by one using "Add Image" button
     * and can be selected and moved to another place on Canvas with appropriate layer level (including partial and complete overlap of elements)
     */
    await openImageAndAddToCanvas('Images/image-png.png', page);
    await openImageAndAddToCanvas('Images/image-png.png', page, 200, 200);
    await takeEditorScreenshot(page);
    await page.mouse.move(200, 200);
    await dragMouseTo(200, 500, page);
    await takeEditorScreenshot(page);
  });

  test('Verify that images can be added to different selected places on Canvas one by one using "Add Image" button and can be selected and moved to another image', async ({
    page,
  }) => {
    /**
     * Test case: #4897
     * Description: Images can be added to different selected places on Canvas one by one using "Add Image" button
     * and can be selected and moved to another place on Canvas with appropriate layer level (including partial overlap of elements)
     */
    await openImageAndAddToCanvas('Images/image-png.png', page);
    await openImageAndAddToCanvas('Images/image-png.png', page, 200, 200);
    await takeEditorScreenshot(page);
    await page.mouse.move(200, 200);
    await dragMouseTo(600, 400, page);
    await takeEditorScreenshot(page);
  });

  test('Verify that loaded from .ket file and added to Canvas images with elements can be selected and moved together and separately to other places on Canvas', async ({
    page,
  }) => {
    /**
     * Test case: #4897
     * Description: Loaded from .ket file and added to selected place on Canvas images with elements can be selected and
     * moved together and separately to other places on Canvas with appropriate layer level (including partial and complete overlap of elements)
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/images-png-svg-with-elements.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await dragMouseTo(900, 100, page);
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await dragMouseTo(800, 100, page);
    await takeEditorScreenshot(page);
  });

  test('Verify that loaded from .ket file and added to Canvas images with elements can be selected and moved together to other places on Canvas', async ({
    page,
  }) => {
    /**
     * Test case: #4897
     * Description: Loaded from .ket file and added to Canvas images with elements can be selected and moved together to other places on Canvas
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/images-png-svg-with-elements.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+a');
    await dragMouseTo(600, 300, page);
    await takeEditorScreenshot(page);
  });

  test('Verify that images of allowed formats (PNG, SVG) can be zoomed in/out (20, 400, 100) after adding to Canvas using "Add Image" button', async ({
    page,
  }) => {
    /**
     * Test case: #4911
     * Description: Zoom In and Zoom Out work for Images with mouse wheel
     */
    await openImageAndAddToCanvas('Images/image-svg.svg', page);
    await openImageAndAddToCanvas('Images/image-png.png', page, 200, 200);
    await takeEditorScreenshot(page);
    await setZoomInputValue(page, '20');
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
    await setZoomInputValue(page, '400');
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
    await setZoomInputValue(page, '100');
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that moving actions of images (PNG, SVG) on Canvas can be Undo/Redo', async ({
    page,
  }) => {
    /**
     * Test case: #4897
     * Description: Moving actions of images (PNG, SVG) on Canvas can be Undo/Redo
     */
    await openImageAndAddToCanvas('Images/image-svg.svg', page);
    await openImageAndAddToCanvas('Images/image-png.png', page, 200, 200);
    await takeEditorScreenshot(page);
    await page.mouse.move(200, 200);
    await dragMouseTo(200, 500, page);
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that scaling actions of image (PNG) on Canvas can be Undo/Redo', async ({
    page,
  }) => {
    /**
     * Test case: #4897
     * Description: Scaling actions of images (PNG) on Canvas can be Undo/Redo
     */
    await openImageAndAddToCanvas('Images/image-svg.svg', page);
    await openImageAndAddToCanvas('Images/image-png.png', page, 200, 200);
    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await page.mouse.click(200, 200);
    await takeEditorScreenshot(page);

    // Ensure the element is in view
    const resizeHandle = page.getByTestId('imageResize-bottomRightPosition');
    await resizeHandle.scrollIntoViewIfNeeded();
    await resizeHandle.hover({ force: true });

    await dragMouseTo(500, 500, page);
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that scaling actions of image (SVG) on Canvas can be Undo/Redo', async ({
    page,
  }) => {
    /**
     * Test case: #4897
     * Description: Scaling actions of images (SVG) on Canvas can be Undo/Redo
     */
    await openImageAndAddToCanvas('Images/image-svg.svg', page);
    await openImageAndAddToCanvas('Images/image-png.png', page, 200, 200);
    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);

    // Ensure the element is in view
    const resizeHandle = page.getByTestId('imageResize-rightMiddlePosition');
    await resizeHandle.scrollIntoViewIfNeeded();
    await resizeHandle.hover({ force: true });

    await dragMouseTo(500, 500, page);
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that deleting actions of images (PNG, SVG) on Canvas can be Undo/Redo', async ({
    page,
  }) => {
    /**
     * Test case: #4897
     * Description: Deleting actions of images (PNG, SVG) on Canvas can be Undo/Redo
     */
    await openImageAndAddToCanvas('Images/image-svg.svg', page);
    await openImageAndAddToCanvas('Images/image-png.png', page, 200, 200);
    await takeEditorScreenshot(page);
    await selectLeftPanelButton(LeftPanelButton.Erase, page);
    await page.mouse.click(200, 200);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    for (let i = 0; i < 2; i++) {
      await selectTopPanelButton(TopPanelButton.Undo, page);
    }
    await takeEditorScreenshot(page);
    for (let i = 0; i < 2; i++) {
      await selectTopPanelButton(TopPanelButton.Redo, page);
    }
    await takeEditorScreenshot(page);
  });

  test('Verify that copying actions of images (PNG, SVG) on Canvas can be Undo/Redo', async ({
    page,
  }) => {
    /**
     * Test case: #4897
     * Description: Copying actions of images (PNG, SVG) on Canvas can be Undo/Redo
     */
    await openImageAndAddToCanvas('Images/image-svg.svg', page);
    await openImageAndAddToCanvas('Images/image-png.png', page, 200, 200);
    await takeEditorScreenshot(page);
    await copyAndPaste(page);
    await page.mouse.click(200, 200);
    await takeEditorScreenshot(page);
    for (let i = 0; i < 2; i++) {
      await selectTopPanelButton(TopPanelButton.Undo, page);
    }
    await takeEditorScreenshot(page);
    for (let i = 0; i < 2; i++) {
      await selectTopPanelButton(TopPanelButton.Redo, page);
    }
    await takeEditorScreenshot(page);
  });

  test('Verify that cut actions of images (PNG, SVG) on Canvas can be Undo/Redo', async ({
    page,
  }) => {
    /**
     * Test case: #4897
     * Description: Cut actions of images (PNG, SVG) on Canvas can be Undo/Redo
     */
    await openImageAndAddToCanvas('Images/image-svg.svg', page);
    await openImageAndAddToCanvas('Images/image-png.png', page, 200, 200);
    await takeEditorScreenshot(page);
    await cutAndPaste(page);
    await page.mouse.click(200, 200);
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that loaded from .ket file and added to selected place on Canvas images of (PNG, SVG) can be deleted using "Clear Canvas" (or Ctrl+Delete)', async ({
    page,
  }) => {
    /**
     * Test case: #4897
     * Description: Loaded from .ket file and added to selected place on Canvas images of (PNG, SVG) can be deleted using "Clear Canvas" (or Ctrl+Delete)
     */
    await openFileAndAddToCanvasAsNewProject('KET/images-png-svg.ket', page);
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Clear, page);
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+Delete');
    await takeEditorScreenshot(page);
  });

  test('Verify that adding to selected place on Canvas images of (PNG, SVG) using "Add Image" can be deleted using "Clear Canvas" (or Ctrl+Delete)', async ({
    page,
  }) => {
    /**
     * Test case: #4897
     * Description: Adding to selected place on Canvas images of (PNG, SVG) using "Add Image" can be deleted using "Clear Canvas" (or Ctrl+Delete)
     */
    await openImageAndAddToCanvas('Images/image-svg.svg', page);
    await openImageAndAddToCanvas('Images/image-png.png', page, 200, 200);
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Clear, page);
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+Delete');
    await takeEditorScreenshot(page);
  });

  test('Verify that loaded from .ket file and added to selected place on Canvas images of (PNG, SVG) can be deleted using "Erase" (or Delete, Backspace buttons)', async ({
    page,
  }) => {
    /**
     * Test case: #4897
     * Description: Loaded from .ket file and added to selected place on Canvas images of (PNG, SVG)
     * can be deleted using "Erase" (or Delete, Backspace buttons)
     */
    await openFileAndAddToCanvasAsNewProject('KET/images-png-svg.ket', page);
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Delete');
    await takeEditorScreenshot(page);
  });

  test('Verify that adding to selected place on Canvas images of (PNG, SVG) using "Add Image" can be deleted using "Erase" (or Delete, Backspace buttons)', async ({
    page,
  }) => {
    /**
     * Test case: #4897
     * Description: Adding to selected place on Canvas images of (PNG, SVG) using "Add Image" can be deleted using "Erase" (or Delete, Backspace buttons)
     */
    await openImageAndAddToCanvas('Images/image-svg.svg', page);
    await openImageAndAddToCanvas('Images/image-png.png', page, 200, 200);
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Backspace');
    await takeEditorScreenshot(page);
  });

  const fileNames1 = [
    'image-bmp.bmp',
    'image-gif.gif',
    'image-ico.ico',
    'image-jpeg.jpeg',
    'image-jpg.jpg',
    'image-tif.tif',
    'image-webp.webp',
    'image-heic.heic',
  ];

  for (const fileName of fileNames1) {
    test(`Verify that image of not supported format ${fileName} cannot be added using "Add Image" button`, async ({
      page,
    }) => {
      /**
       * Test case: #4897
       * Description: Error message is displayed - "Unsupported image type"
       */
      await openImageAndAddToCanvas(`Images/${fileName}`, page);
      await takeEditorScreenshot(page);
    });
  }

  test('Verify that image with size less than 16 pixels cannot be added to Canvas using "Add Image" button', async ({
    page,
  }) => {
    /**
     * Test case: #4897
     * Description: Error message is displayed - "Image should be at least 16x16 pixels"
     */
    await openImageAndAddToCanvas('Images/image-png-15px.png', page);
    await takeEditorScreenshot(page);
  });

  test('Verify that images of formats (PNG, SVG) can be selected using "Rectangle Selection" in "Add Image" mode', async ({
    page,
  }) => {
    /**
     * Test case: #4897
     * Description: Images of formats (PNG, SVG) can be selected using "Rectangle Selection" in "Add Image" mode
     */
    await openImageAndAddToCanvas('Images/image-svg.svg', page);
    await openImageAndAddToCanvas('Images/image-png.png', page, 200, 200);
    await selectRectangleSelectionTool(page);
    await page.mouse.move(100, 100);
    await dragMouseTo(800, 800, page);
    await takeEditorScreenshot(page);
  });

  test('Verify that images of formats (PNG, SVG) can be selected using "Lasso Selection" in "Add Image" mode', async ({
    page,
  }) => {
    /**
     * Test case: #4897
     * Description: Images of formats (PNG, SVG) can be selected using "Lasso Selection" in "Add Image" mode
     */
    await openImageAndAddToCanvas('Images/image-svg.svg', page);
    await openImageAndAddToCanvas('Images/image-png.png', page, 200, 200);
    await selectRectangleSelectionTool(page);
    await page.keyboard.press('Shift+Tab');
    await selectWithLasso(page, 100, 100, [
      { x: 800, y: 800 },
      { x: 100, y: 800 },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify that images of formats (PNG, SVG) can be selected using "Fragment Selection" in "Add Image" mode', async ({
    page,
  }) => {
    /**
     * Test case: #4897
     * Description: Images of formats (PNG, SVG) can be selected using "Fragment Selection" in "Add Image" mode
     */
    await openImageAndAddToCanvas('Images/image-svg.svg', page);
    await openImageAndAddToCanvas('Images/image-png.png', page, 200, 200);
    await selectRectangleSelectionTool(page);
    for (let i = 0; i < 2; i++) {
      await page.keyboard.press('Shift+Tab');
    }
    await page.mouse.click(200, 200);
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that if image is selected then green selection frame is displayed and image can be scaled vertically, horizontally and diagonally', async ({
    page,
  }) => {
    /**
     * Test case: #4897
     * Description: Image is selected then green selection frame is displayed and
     * image can be scaled vertically, horizontally and diagonally.
     */
    await openImageAndAddToCanvas('Images/image-png.png', page);
    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);

    const resizeHandles = [
      { id: 'imageResize-rightMiddlePosition', moveX: 300, moveY: 0 },
      { id: 'imageResize-topMiddlePosition', moveX: 0, moveY: -200 },
      { id: 'imageResize-bottomLeftPosition', moveX: -200, moveY: 200 },
    ];

    for (const handle of resizeHandles) {
      const resizeHandle = page.getByTestId(handle.id);
      await resizeHandle.scrollIntoViewIfNeeded();
      await resizeHandle.hover({ force: true });

      const box = await resizeHandle.boundingBox();
      if (!box) {
        throw new Error(`${handle.id} bounding box not found`);
      }

      const startX = box.x + box.width / 2;
      const startY = box.y + box.height / 2;

      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX + handle.moveX, startY + handle.moveY, {
        steps: 10,
      });
      await page.mouse.up();

      await takeEditorScreenshot(page);
    }
  });

  test('Verify that images of (PNG, SVG) cannot be saved to template - "Save to Template" button is disabled', async ({
    page,
  }) => {
    /**
     * Test case: #4897
     * Description: Images of (PNG, SVG) cannot be saved to template - "Save to Template" button is disabled
     */
    await openImageAndAddToCanvas('Images/image-svg.svg', page);
    await openImageAndAddToCanvas('Images/image-png.png', page, 200, 200);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await page.getByText('Save to Templates').isDisabled();
    await takeEditorScreenshot(page, {
      masks: [page.getByTestId('mol-preview-area-text')],
    });
  });

  test('Verify that images of (PNG, SVG) with elements can be saved to template and added to Canvas with correct position and layer level', async ({
    page,
  }) => {
    /**
     * Test case: #4897
     * Description: Images of (PNG, SVG) with elements can be saved to template and added to Canvas with correct position and layer level
     */
    await openImageAndAddToCanvas('Images/image-svg.svg', page);
    await openImageAndAddToCanvas('Images/image-png.png', page, 200, 200);
    await selectRing(RingButton.Benzene, page);
    await page.mouse.click(200, 400);
    await saveToTemplates(page, 'My Custom Template');
    await selectTopPanelButton(TopPanelButton.Clear, page);
    await openStructureLibrary(page);
    await page.getByRole('button', { name: 'User Templates (1)' }).click();
    await page
      .getByPlaceholder('Search by elements...')
      .fill('My Custom Template');
    await takeEditorScreenshot(page);
    await page.getByText('My Custom Template').click();
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that images of (PNG, SVG) with elements can be saved to .ket file with correct coordinates of images after moving of them and then opened', async ({
    page,
  }) => {
    /**
     * Test case: #4897
     * Description: Images of (PNG, SVG) with elements can be saved to .ket file with correct coordinates of images after
     * moving of them and after that can be loaded from .ket file with correct positions and layer level.
     */
    await openImageAndAddToCanvas('Images/image-svg.svg', page);
    await openImageAndAddToCanvas('Images/image-png.png', page, 200, 200);
    await takeEditorScreenshot(page);
    await page.mouse.move(200, 200);
    await dragMouseTo(200, 500, page);
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/image-svg-png-after-moving-expected.ket',
      'tests/test-data/KET/image-svg-png-after-moving-expected.ket',
    );
  });

  test('Verify that images of (PNG, SVG) with elements can be saved to .ket file with correct coordinates of images after scaling of them and then opened', async ({
    page,
  }) => {
    /**
     * Test case: #4897
     * Description: Images of (PNG, SVG) with elements can be saved to .ket file with correct coordinates of images after
     * scaling of them and after that can be loaded from .ket file with correct positions and layer level.
     */
    await openImageAndAddToCanvas('Images/image-svg.svg', page);
    await openImageAndAddToCanvas('Images/image-png.png', page, 200, 200);
    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await page.mouse.click(200, 200);
    await takeEditorScreenshot(page);

    // Ensure the element is in view
    const resizeHandle = page.getByTestId('imageResize-bottomRightPosition');
    await resizeHandle.scrollIntoViewIfNeeded();
    await resizeHandle.hover({ force: true });

    await dragMouseTo(500, 500, page);
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/image-svg-png-after-scaling-expected.ket',
      'tests/test-data/KET/image-svg-png-after-scaling-expected.ket',
    );
  });

  test('Verify that images of (PNG, SVG) with elements can be saved to .ket file with correct coordinates of images after deleting of them and then opened', async ({
    page,
  }) => {
    /**
     * Test case: #4897
     * Description: Images of (PNG, SVG) with elements can be saved to .ket file with correct coordinates of images after
     * deleting of them and after that can be loaded from .ket file with correct positions and layer level.
     */
    await openImageAndAddToCanvas('Images/image-svg.svg', page);
    await openImageAndAddToCanvas('Images/image-png.png', page, 200, 200);
    await takeEditorScreenshot(page);
    await selectLeftPanelButton(LeftPanelButton.Erase, page);
    await page.mouse.click(200, 200);
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/image-svg-png-after-deleting-expected.ket',
      'tests/test-data/KET/image-svg-png-after-deleting-expected.ket',
    );
  });

  test('Verify that images of (PNG, SVG) with elements can be saved to .ket file with correct coordinates of images after copying of them and then opened', async ({
    page,
  }) => {
    /**
     * Test case: #4897
     * Description: Images of (PNG, SVG) with elements can be saved to .ket file with correct coordinates of images after
     * copying of them and after that can be loaded from .ket file with correct positions and layer level.
     */
    await openImageAndAddToCanvas('Images/image-svg.svg', page);
    await openImageAndAddToCanvas('Images/image-png.png', page, 200, 200);
    await takeEditorScreenshot(page);
    await copyAndPaste(page);
    await page.mouse.click(200, 200);
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/image-svg-png-after-copying-expected.ket',
      'tests/test-data/KET/image-svg-png-after-copying-expected.ket',
    );
  });

  test('Verify that added to Canvas images of (PNG, SVG) and Benzene Rings are on the same positions after Aromatize (Ctrl+A)/Dearomatize (Ctrl+Alt+A) actions', async ({
    page,
  }) => {
    /**
     * Test case: #2144
     * Description: Images of (PNG, SVG) and Benzene Rings are on the same positions after Aromatize (Ctrl+A)/Dearomatize (Ctrl+Alt+A) actions and can be
     * saved to .ket file with correct coordinates, after that loaded from .ket file with correct positions and layer level.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/images-png-svg-with-benzene.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Aromatize, page);
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Dearomatize, page);
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/images-png-svg-with-benzene-expected.ket',
      'tests/test-data/KET/images-png-svg-with-benzene-expected.ket',
    );
  });

  test('Verify that added to Canvas images of (PNG, SVG) are on the same positions after Layout (Ctrl+L) action, only Benzene Rings are moved and aligned', async ({
    page,
  }) => {
    /**
     * Test case: #2144
     * Description: Images of (PNG, SVG) are on the same positions after Layout (Ctrl+L) action, only Benzene Rings are moved
     * and aligned, they can be saved to .ket file with correct coordinates, after that loaded from .ket file with correct positions and layer levels.
     * Need to be updated after fixing bug https://github.com/epam/Indigo/issues/2172
     */
    const x = 400;
    const y = 300;
    await openFileAndAddToCanvasAsNewProject(
      'KET/images-png-svg-with-benzene-for-distorting.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await moveOnAtom(page, 'C', 0);
    await dragMouseTo(x, y, page);
    await page.mouse.click(100, 100);
    await takeEditorScreenshot(page);
    await waitForSpinnerFinishedWork(
      page,
      async () => await selectTopPanelButton(TopPanelButton.Layout, page),
    );
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/images-png-svg-with-benzene-for-distorting-expected.ket',
      'tests/test-data/KET/images-png-svg-with-benzene-for-distorting-expected.ket',
    );
  });

  test('Verify that added to Canvas images of (PNG, SVG) are on the same positions after Clean Up (Ctrl+Shift+L) action, only Benzene Rings are moved and aligned', async ({
    page,
  }) => {
    /**
     * Test case: #2144
     * Description: Images of (PNG, SVG) are on the same positions after Clean Up (Ctrl+Shift+L) action, only Benzene Rings are moved
     * and aligned, they can be saved to .ket file with correct coordinates, after that loaded from .ket file with correct positions and layer levels.
     */
    const x = 400;
    const y = 300;
    await openFileAndAddToCanvasAsNewProject(
      'KET/images-png-svg-with-benzene-for-distorting.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await moveOnAtom(page, 'C', 0);
    await dragMouseTo(x, y, page);
    await page.mouse.click(100, 100);
    await takeEditorScreenshot(page);
    await waitForSpinnerFinishedWork(
      page,
      async () => await selectTopPanelButton(TopPanelButton.Clean, page),
    );
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/images-png-svg-with-benzene-for-cleanup-expected.ket',
      'tests/test-data/KET/images-png-svg-with-benzene-for-cleanup-expected.ket',
    );
  });

  test('Verify that added to Canvas images of (PNG, SVG) are on the same positions after Calculate CIP (Ctrl+P) action, CIP is calculated for elements', async ({
    page,
  }) => {
    /**
     * Test case: #2144
     * Description: Images of (PNG, SVG) are on the same positions after Calculate CIP (Ctrl+P) action, CIP is calculated for elements, they can be
     * saved together to .ket file with correct coordinates, after that loaded from .ket file with correct positions and layer levels.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/images-png-svg-with-benzene-for-calculateCIP.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await waitForSpinnerFinishedWork(
      page,
      async () => await selectTopPanelButton(TopPanelButton.Calculate, page),
    );
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/images-png-svg-with-benzene-for-calculateCIP-expected.ket',
      'tests/test-data/KET/images-png-svg-with-benzene-for-calculateCIP-expected.ket',
    );
  });

  test('Verify that added to Canvas images of (PNG, SVG) are on the same positions after Check structure (Alt+S) action, it is calculated for elements', async ({
    page,
  }) => {
    /**
     * Test case: #2144
     * Description: Images of (PNG, SVG) are on the same positions after Check structure (Alt+S) action, CIP is calculated for elements, they can be
     * saved together to .ket file with correct coordinates, after that loaded from .ket file with correct positions and layer levels.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/images-png-svg-with-benzene-for-distorting.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await waitForSpinnerFinishedWork(
      page,
      async () => await selectTopPanelButton(TopPanelButton.Check, page),
    );
    await takeEditorScreenshot(page, {
      masks: [page.locator('[class*="Check-module_checkInfo"] > span')],
    });
    await pressButton(page, 'Cancel');
    await verifyFile(
      page,
      'KET/images-png-svg-with-benzene-for-check-structure-expected.ket',
      'tests/test-data/KET/images-png-svg-with-benzene-for-check-structure-expected.ket',
    );
  });

  test('Verify that added to Canvas images of (PNG, SVG) are on the same positions after Calculate Values (Alt+C) action, it is calculated for elements', async ({
    page,
  }) => {
    /**
     * Test case: #2144
     * Description: Images of (PNG, SVG) are on the same positions after Calculate Values (Alt+C) action, CIP is calculated for elements, they can be
     * saved together to .ket file with correct coordinates, after that loaded from .ket file with correct positions and layer levels.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/images-png-svg-with-benzene-for-distorting.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await waitForSpinnerFinishedWork(
      page,
      async () => await selectTopPanelButton(TopPanelButton.Calculated, page),
    );
    await takeEditorScreenshot(page);
    await pressButton(page, 'Close');
    await verifyFile(
      page,
      'KET/images-png-svg-with-benzene-for-calculate-values-expected.ket',
      'tests/test-data/KET/images-png-svg-with-benzene-for-calculate-values-expected.ket',
    );
  });

  test('Verify that added to Canvas images of (PNG, SVG) are on the same positions after Add/Remove explicit hydrogens actions, it is calculated for elements', async ({
    page,
  }) => {
    /**
     * Test case: #2144
     * Description: Images of (PNG, SVG) are on the same positions after Add/Remove explicit hydrogens actions, it is calculated for elements, they can be
     * saved together to .ket file with correct coordinates, after that loaded from .ket file with correct positions and layer levels.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/images-png-svg-with-benzene-for-distorting.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await waitForSpinnerFinishedWork(
      page,
      async () =>
        await selectTopPanelButton(
          TopPanelButton.toggleExplicitHydrogens,
          page,
        ),
    );
    await takeEditorScreenshot(page);
    await waitForSpinnerFinishedWork(
      page,
      async () =>
        await selectTopPanelButton(
          TopPanelButton.toggleExplicitHydrogens,
          page,
        ),
    );
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/images-png-svg-with-benzene-for-explicit-expected.ket',
      'tests/test-data/KET/images-png-svg-with-benzene-for-explicit-expected.ket',
    );
  });

  test('Verify that added to Canvas images of (PNG, SVG) are on the same positions after using of 3D mode, only elements are displayed in 3D mode', async ({
    page,
  }) => {
    /**
     * Test case: #2144
     * Description: Images of (PNG, SVG) are on the same positions after using of 3D mode, only elements are displayed in 3D mode.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/images-png-svg-with-benzene-for-distorting.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await waitForSpinnerFinishedWork(
      page,
      async () => await selectTopPanelButton(TopPanelButton.ThreeD, page),
    );
    await takeEditorScreenshot(page);
    await pressButton(page, 'Cancel');
    await verifyFile(
      page,
      'KET/images-png-svg-with-benzene-for-calculate-values-expected.ket',
      'tests/test-data/KET/images-png-svg-with-benzene-for-calculate-values-expected.ket',
    );
  });

  test('Verify that added to Canvas images of (PNG, SVG) are on the same positions after using of Auto-Mapping Tool (Discard), only elements are affected', async ({
    page,
  }) => {
    /**
     * Test case: #2144
     * Description: Images of (PNG, SVG) are on the same positions after using of Auto-Mapping Tool (Discard), only elements are affected,
     * they can be saved together to .ket file with correct coordinates, after that loaded from .ket file with correct positions and layer levels.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/images-png-svg-with-benzene-for-distorting.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await applyAutoMapMode(page, 'Discard');
    await verifyFile(
      page,
      'KET/images-png-svg-with-benzene-discard-expected.ket',
      'tests/test-data/KET/images-png-svg-with-benzene-discard-expected.ket',
    );
  });

  test('Verify that added to Canvas images of (PNG, SVG) are on the same positions after using of Auto-Mapping Tool (Keep), only elements are affected', async ({
    page,
  }) => {
    /**
     * Test case: #2144
     * Description: Images of (PNG, SVG) are on the same positions after using of Auto-Mapping Tool (Keep), only elements are affected,
     * they can be saved together to .ket file with correct coordinates, after that loaded from .ket file with correct positions and layer levels.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/images-png-svg-with-benzene-for-distorting.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await applyAutoMapMode(page, 'Keep');
    await verifyFile(
      page,
      'KET/images-png-svg-with-benzene-keep-expected.ket',
      'tests/test-data/KET/images-png-svg-with-benzene-keep-expected.ket',
    );
  });

  test('Verify that added to Canvas images of (PNG, SVG) are on the same positions after using of Auto-Mapping Tool (Alter), only elements are affected', async ({
    page,
  }) => {
    /**
     * Test case: #2144
     * Description: Images of (PNG, SVG) are on the same positions after using of Auto-Mapping Tool (Alter), only elements are affected,
     * they can be saved together to .ket file with correct coordinates, after that loaded from .ket file with correct positions and layer levels.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/images-png-svg-with-benzene-for-distorting.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await applyAutoMapMode(page, 'Alter');
    await verifyFile(
      page,
      'KET/images-png-svg-with-benzene-alter-expected.ket',
      'tests/test-data/KET/images-png-svg-with-benzene-alter-expected.ket',
    );
  });

  test('Verify that added to Canvas images of (PNG, SVG) are on the same positions after using of Auto-Mapping Tool (Clear), only elements are affected', async ({
    page,
  }) => {
    /**
     * Test case: #2144
     * Description: Images of (PNG, SVG) are on the same positions after using of Auto-Mapping Tool (Clear), only elements are affected,
     * they can be saved together to .ket file with correct coordinates, after that loaded from .ket file with correct positions and layer levels.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/images-png-svg-with-benzene-for-distorting.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await applyAutoMapMode(page, 'Alter');
    await applyAutoMapMode(page, 'Clear');
    await verifyFile(
      page,
      'KET/images-png-svg-with-benzene-clear-expected.ket',
      'tests/test-data/KET/images-png-svg-with-benzene-clear-expected.ket',
    );
  });

  const autoMapModes = ['Discard', 'Keep', 'Alter', 'Clear'];
  const expectedFiles = [
    'KET/images-png-svg-with-benzene-discard-expected.ket',
    'KET/images-png-svg-with-benzene-keep-expected.ket',
    'KET/images-png-svg-with-benzene-alter-expected.ket',
    'KET/images-png-svg-with-benzene-clear-expected.ket',
  ];
  const testDescription =
    'Verify that added to Canvas images of (PNG, SVG) are on the same positions after using of Auto-Mapping Tool';

  autoMapModes.forEach((mode, index) => {
    test(`${testDescription} (${mode}), only elements are affected - ${index}`, async ({
      page,
    }) => {
      /**
       * Test case: #2144
       * Description: Images of (PNG, SVG) are on the same positions after using of Auto-Mapping Tools, only elements are affected,
       * they can be saved together to .ket file with correct coordinates, after that loaded from .ket file with correct positions and layer levels.
       */
      await openFileAndAddToCanvasAsNewProject(
        'KET/images-png-svg-with-benzene-for-distorting.ket',
        page,
      );
      await takeEditorScreenshot(page);

      if (mode === 'Clear') {
        await applyAutoMapMode(page, 'Alter');
      }

      await applyAutoMapMode(page, mode);

      await verifyFile(
        page,
        expectedFiles[index],
        `tests/test-data/${expectedFiles[index]}`,
      );
    });
  });
});
