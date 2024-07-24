/* eslint-disable no-magic-numbers */
import { test, expect } from '@playwright/test';
import {
  getKet,
  openFileAndAddToCanvas,
  openFileAndAddToCanvasAsNewProject,
  openImageAndAddToCanvas,
  receiveFileComparisonData,
  saveToFile,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';

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
    const expectedFile = await getKet(page);
    await saveToFile('KET/image-svg-demo-expected.ket', expectedFile);

    const { fileExpected: ketFileExpected, file: ketFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/KET/image-svg-demo-expected.ket',
      });
    expect(ketFile).toEqual(ketFileExpected);
    await openFileAndAddToCanvasAsNewProject(
      'KET/image-svg-demo-expected.ket',
      page,
    );
    await takeEditorScreenshot(page);
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
    const expectedFile = await getKet(page);
    await saveToFile('KET/image-png-expected.ket', expectedFile);

    const { fileExpected: ketFileExpected, file: ketFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/KET/image-png-expected.ket',
      });
    expect(ketFile).toEqual(ketFileExpected);
    await openFileAndAddToCanvasAsNewProject(
      'KET/image-png-expected.ket',
      page,
    );
    await takeEditorScreenshot(page);
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
    const expectedFile = await getKet(page);
    await saveToFile('KET/image-svg-and-png-expected.ket', expectedFile);

    const { fileExpected: ketFileExpected, file: ketFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/KET/image-svg-and-png-expected.ket',
      });
    expect(ketFile).toEqual(ketFileExpected);
    await openFileAndAddToCanvasAsNewProject(
      'KET/image-svg-and-png-expected.ket',
      page,
    );
    await takeEditorScreenshot(page);
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
    const expectedFile = await getKet(page);
    await saveToFile('KET/four-images-svg-and-png-expected.ket', expectedFile);

    const { fileExpected: ketFileExpected, file: ketFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/KET/four-images-svg-and-png-expected.ket',
      });
    expect(ketFile).toEqual(ketFileExpected);
    await openFileAndAddToCanvasAsNewProject(
      'KET/four-images-svg-and-png-expected.ket',
      page,
    );
    await takeEditorScreenshot(page);
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
    const expectedFile = await getKet(page);
    await saveToFile(
      'KET/images-with-benzene-ring-and-arrow-expected.ket',
      expectedFile,
    );

    const { fileExpected: ketFileExpected, file: ketFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/KET/images-with-benzene-ring-and-arrow-expected.ket',
      });
    expect(ketFile).toEqual(ketFileExpected);
    await openFileAndAddToCanvasAsNewProject(
      'KET/images-with-benzene-ring-and-arrow-expected.ket',
      page,
    );
    await takeEditorScreenshot(page);
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
    const expectedFile = await getKet(page);
    await saveToFile(
      'KET/images-png-svg-with-elements-expected.ket',
      expectedFile,
    );

    const { fileExpected: ketFileExpected, file: ketFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/KET/images-png-svg-with-elements-expected.ket',
      });
    expect(ketFile).toEqual(ketFileExpected);
    await openFileAndAddToCanvasAsNewProject(
      'KET/images-png-svg-with-elements-expected.ket',
      page,
    );
    await takeEditorScreenshot(page);
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
    const expectedFile = await getKet(page);
    await saveToFile(
      'KET/images-png-svg-30-with-30-elements-expected.ket',
      expectedFile,
    );

    const { fileExpected: ketFileExpected, file: ketFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/KET/images-png-svg-30-with-30-elements-expected.ket',
      });
    expect(ketFile).toEqual(ketFileExpected);
    await openFileAndAddToCanvasAsNewProject(
      'KET/images-png-svg-30-with-30-elements-expected.ket',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that images of SVG and PNG format can be added from two different KET files saved and opened', async ({
    page,
  }) => {
    /**
     * Test case: #4911
     * Description: Images of SVG and PNG format can be added from two different KET files and opened
     */
    await openFileAndAddToCanvas('KET/images-png-svg-with-elements.ket', page);
    await openFileAndAddToCanvas(
      'KET/images-with-benzene-ring-and-arrow.ket',
      page,
      200,
      200,
    );

    await takeEditorScreenshot(page);
    const expectedFile = await getKet(page);
    await saveToFile(
      'KET/two-images-with-many-elements-expected.ket',
      expectedFile,
    );

    const { fileExpected: ketFileExpected, file: ketFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/KET/two-images-with-many-elements-expected.ket',
      });
    expect(ketFile).toEqual(ketFileExpected);
    await openFileAndAddToCanvasAsNewProject(
      'KET/two-images-with-many-elements-expected.ket',
      page,
    );
    await takeEditorScreenshot(page);
  });
});
