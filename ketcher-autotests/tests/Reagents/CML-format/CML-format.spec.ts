import { expect, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  waitForPageInit,
  saveToFile,
  receiveFileComparisonData,
} from '@utils';
import { getCml } from '@utils/formats';

test.describe('Reagents CML format', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('File saves in "CML" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-14793
    Description: File saved in format (e.g. "ketcher.cml")
    results of this test case are not correct. bug - https://github.com/epam/ketcher/issues/1933
    */

    await openFileAndAddToCanvas(
      'KET/benzene-arrow-benzene-reagent-nh3.ket',
      page,
    );
    const expectedFile = await getCml(page);
    await saveToFile(
      'benzene-arrow-benzene-reagent-nh3-expected.cml',
      expectedFile,
    );

    const { fileExpected: cmlFileExpected, file: cmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/benzene-arrow-benzene-reagent-nh3-expected.cml',
      });

    expect(cmlFile).toEqual(cmlFileExpected);
  });

  test('Open file in "CML" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-14794
    results of this test case are not correct. bug - https://github.com/epam/ketcher/issues/1933
    */
    await openFileAndAddToCanvas(
      'benzene-arrow-benzene-reagent-nh3-expected.cml',
      page,
    );
  });
});
