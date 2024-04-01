import { Page, expect, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  receiveFileComparisonData,
  openFileAndAddToCanvas,
  saveToFile,
  waitForPageInit,
} from '@utils';
import { getCml } from '@utils/formats';

async function openFileAddToCanvasTakeScreenshot(page: Page, fileName: string) {
  await openFileAndAddToCanvas(fileName, page);
  await takeEditorScreenshot(page);
}

test.describe('CML files', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Open and Save files - CML - CML for empty canvas', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1944
     * Description: Save a clear canvas in CML format with preset parameters:
     * The input field contains <?xml version="1.0" ?> <cml> <molecule title="" /> </cml>.
     */

    const { fileExpected: cmlFileExpected, file: cmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/CML/cml-12492-compare.cml',
      });
    // comparing cml file with golden cml file
    expect(cmlFile).toEqual(cmlFileExpected);
  });

  test('Open and Save file - CML - CML for structure', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1945
     * Description: Saved cml file with structure is compering with paste cml structure golden file
     */
    await openFileAddToCanvasTakeScreenshot(page, 'CML/cml-molecule.cml');
    // check that structure opened from file is displayed correctly

    const expectedFile = await getCml(page);
    await saveToFile('CML/cml-molecule-expected.cml', expectedFile);
    const { file: cmlFile, fileExpected: cmlFileExpected } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/CML/cml-molecule-expected.cml',
      });
    // comparing cml file with golden cml file

    expect(cmlFile).toEqual(cmlFileExpected);
  });

  test('Open and Save file - CML - CML for some structures', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1946
     * Description: Saved cml file with structure is compering with paste cml 3 structures
     */
    await openFileAddToCanvasTakeScreenshot(page, 'CML/cml-1946.cml');
    // check that structure opened from file is displayed correctly

    const expectedFile = await getCml(page);
    await saveToFile('CML/cml-1946-expected.cml', expectedFile);
    const { file: cmlFile, fileExpected: cmlFileExpected } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/CML/cml-1946-expected.cml',
      });
    // comparing cml file with golden cml file

    expect(cmlFile).toEqual(cmlFileExpected);
  });

  test('Open and Save file - CML - CML for reaction', async ({ page }) => {
    /**
   * Test case: EPMLSOPKET-1947
    Description: Saved cml file with structure is compering with paste reaction from rxn file
  */
    await openFileAddToCanvasTakeScreenshot(
      page,
      'Rxn-V2000/cml-1947-reaction.rxn',
    );
    // check that structure opened from file is displayed correctly

    const expectedFile = await getCml(page);
    await saveToFile('CML/cml-1947-reaction-expected.cml', expectedFile);
    const { file: cmlFile, fileExpected: cmlFileExpected } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/CML/cml-1947-reaction-expected.cml',
      });
    // comparing cml file with golden cml file

    expect(cmlFile).toEqual(cmlFileExpected);
  });

  test('Open and Save file - CML - CML for R-group and other features', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1948
     * Description: Saved cml file with structure is compering with paste R-group from a mol file
     */

    await openFileAddToCanvasTakeScreenshot(
      page,
      'Molfiles-V2000/cml-1948-R-group.mol',
    );
    // check that structure opened from file is displayed correctly

    const expectedFile = await getCml(page);
    await saveToFile('CML/cml-1948-r-group-expected.cml', expectedFile);
    const { file: cmlFile, fileExpected: cmlFileExpected } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/CML/cml-1948-r-group-expected.cml',
      });
    // comparing cml file with golden cml file

    expect(cmlFile).toEqual(cmlFileExpected);
  });
});
