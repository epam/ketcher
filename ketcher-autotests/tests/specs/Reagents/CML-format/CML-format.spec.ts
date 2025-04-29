import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  waitForPageInit,
  FILE_TEST_DATA,
  clickInTheMiddleOfTheScreen,
  pasteFromClipboardAndAddToCanvas,
  moveMouseAway,
} from '@utils';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { selectSaveTool } from '@tests/pages/common/TopLeftToolbar';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';
import { chooseFileFormat } from '@tests/pages/common/SaveStructureDialog';

test.describe('Reagents CML format', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
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

    await verifyFileExport(
      page,
      'CML/benzene-arrow-benzene-reagent-nh3-expected.cml',
      FileType.CML,
    );

    await takeEditorScreenshot(page);
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
    await takeEditorScreenshot(page);
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
    await selectSaveTool(page);
    await chooseFileFormat(page, MoleculesFileFormatType.CML);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
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
    await takeEditorScreenshot(page);
  });
});
