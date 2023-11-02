import { Page, expect, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  waitForPageInit,
  saveToFile,
  receiveFileComparisonData,
  pasteFromClipboardAndAddToCanvas,
  FILE_TEST_DATA,
  clickInTheMiddleOfTheScreen,
  selectTopPanelButton,
  TopPanelButton,
} from '@utils';
import { getCdx } from '@utils/formats';

async function saveFileAsCdxFormat(page: Page) {
  await selectTopPanelButton(TopPanelButton.Save, page);
  await page.getByRole('button', { name: 'MDL Rxnfile V2000' }).click();
  await page.getByRole('option', { name: 'CDX', exact: true }).click();
}

test.describe('Reagents CDX format', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('File saves in "CDX" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4709
    Description: File saved in format (e.g. "ketcher.cdx")
    */

    await openFileAndAddToCanvas('KET/two-reagents-above-and-below.ket', page);
    const expectedFile = await getCdx(page);
    await saveToFile(
      'CDX/two-reagents-above-and-below-expected.cdx',
      expectedFile,
    );

    const { fileExpected: cdxFileExpected, file: cdxFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDX/two-reagents-above-and-below-expected.cdx',
      });

    expect(cdxFile).toEqual(cdxFileExpected);
  });

  test('Open file in "CDX" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4711
    Description: File open in CDX format.
    */
    await openFileAndAddToCanvas('CDX/two-reagents.cdx', page);
  });

  test('Paste from clipboard in "CDX" format', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4710
      Description: Reagents 'NH3' displays above reaction arrow and HCl below.
      */
    await pasteFromClipboardAndAddToCanvas(
      page,
      FILE_TEST_DATA.reagentsBelowAndAboveArrowCdx,
    );
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Detection molecule as reagent and write reagent information in CDX format in "Preview" tab', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4707, EPMLSOPKET-4708
    Description: 'Can not display binary content' in Preview window.
    */
    await openFileAndAddToCanvas('CDX/two-reagents.cdx', page);
    await saveFileAsCdxFormat(page);
  });
});
