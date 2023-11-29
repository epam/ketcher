import { Page, expect, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  waitForPageInit,
  saveToFile,
  receiveFileComparisonData,
  FILE_TEST_DATA,
  clickInTheMiddleOfTheScreen,
  pasteFromClipboardAndAddToCanvas,
  selectTopPanelButton,
  TopPanelButton,
} from '@utils';
import { clickOnFileFormatDropdown, getCml } from '@utils/formats';

async function saveFileAsCmlFormat(page: Page) {
  await selectTopPanelButton(TopPanelButton.Save, page);
  await clickOnFileFormatDropdown(page);
  await page.getByRole('option', { name: 'CML' }).click();
}

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
      'CML/benzene-arrow-benzene-reagent-nh3-expected.cml',
      expectedFile,
    );

    const { fileExpected: cmlFileExpected, file: cmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CML/benzene-arrow-benzene-reagent-nh3-expected.cml',
      });

    expect(cmlFile).toEqual(cmlFileExpected);
  });

  test('Open file in "CML" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-14794
    results of this test case are not correct. bug - https://github.com/epam/ketcher/issues/1933
    */
    await openFileAndAddToCanvas(
      'CML/benzene-arrow-benzene-reagent-nh3-expected.cml',
      page,
    );
  });

  test('Detection molecule as reagent and write reagent information in CML format in "Preview" tab', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-14791
    results of this test case are not correct. bug - https://github.com/epam/ketcher/issues/1933
    */
    await openFileAndAddToCanvas(
      'CML/reagents-below-and-above-arrow.cml',
      page,
    );
    await saveFileAsCmlFormat(page);
  });

  test('Paste from clipboard in "CML" format', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-14794
      Description: Reagents 'NH3' displays above reaction arrow and HF below.
      results of this test case are not correct. bug - https://github.com/epam/ketcher/issues/1933
      */
    await pasteFromClipboardAndAddToCanvas(
      page,
      FILE_TEST_DATA.reagentsBelowAndAboveArrowCml,
    );
    await clickInTheMiddleOfTheScreen(page);
  });
});
