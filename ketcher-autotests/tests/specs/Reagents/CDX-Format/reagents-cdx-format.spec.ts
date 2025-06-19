import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  waitForPageInit,
  pasteFromClipboardAndAddToCanvas,
  FILE_TEST_DATA,
  clickInTheMiddleOfTheScreen,
} from '@utils';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';

test.describe('Reagents CDX format', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('File saves in "CDX" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4709
    Description: File saved in format (e.g. "ketcher.cdx")
    */

    // The reason of test failing will be investigated after release 2.21.0-rc.1
    test.fail();
    await openFileAndAddToCanvas(page, 'KET/two-reagents-above-and-below.ket');

    await verifyFileExport(
      page,
      'CDX/two-reagents-above-and-below-expected.cdx',
      FileType.CDX,
    );
  });

  test('Open file in "CDX" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4711
    Description: File open in CDX format.
    */
    await openFileAndAddToCanvas(page, 'CDX/two-reagents.cdx');
    await takeEditorScreenshot(page);
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
    await takeEditorScreenshot(page);
  });

  test('Detection molecule as reagent and write reagent information in CDX format in "Preview" tab', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4707, EPMLSOPKET-4708
    Description: 'Can not display binary content' in Preview window.
    */
    await openFileAndAddToCanvas(page, 'CDX/two-reagents.cdx');
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.CDX,
    );
    await takeEditorScreenshot(page);
  });
});
