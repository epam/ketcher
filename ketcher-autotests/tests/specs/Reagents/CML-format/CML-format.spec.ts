import { test } from '@fixtures';
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
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';

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
      page,
      'KET/benzene-arrow-benzene-reagent-nh3.ket',
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
      page,
      'CML/benzene-arrow-benzene-reagent-nh3-expected.cml',
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
      page,
      'CML/reagents-below-and-above-arrow.cml',
    );
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.CML,
    );
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
      await FILE_TEST_DATA.reagentsBelowAndAboveArrowCml,
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });
});
