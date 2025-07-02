import { test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  waitForPageInit,
  moveMouseAway,
  pasteFromClipboardAndAddToCanvas,
} from '@utils';
import {
  verifyFileExport,
  FileType,
} from '@utils/files/receiveFileComparisonData';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';

test.describe('Reagents SMARTS format', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test(`Detection molecule as reagent
  and write reagent information in "Daylight SMARTS" format in "Preview" tab`, async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4681
    Description: System detect molecule as reagent and write reagent in "Daylight SMARTS'
    format in "Preview" tab (e.g. [#6]-1=[#6]-[#6]=[#6]-[#6]=[#6]-1>[#7]>[#6]-1=[#6]-[#6]=[#6]-[#6]=[#6]-1)
    */
    await openFileAndAddToCanvas(
      page,
      'KET/benzene-arrow-benzene-reagent-nh3.ket',
    );

    await verifyFileExport(
      page,
      'SMARTS/expected-smarts-file.smarts',
      FileType.SMARTS,
    );

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.DaylightSMARTS,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test(`Detection molecule below arrow as reagent
  and write reagent information in "Daylight SMARTS" format in "Preview" tab`, async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4681
    Description: System detect molecule as reagent and write reagent in "Daylight SMARTS'
    format in "Preview" tab (e.g.
      [#6]1(-[#6])-[#6](-[#8])=[#6]-[#6](-[#16])=[#6](-[#7])-[#6]=1>[#17]>[#6]1(-[#35])-[#6](-[#6])=[#6]-[#6](-[#53])=[#6](-[#8])-[#6]=1
    )
    */
    await openFileAndAddToCanvas(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );

    await verifyFileExport(
      page,
      'SMARTS/expected-smarts-below.smarts',
      FileType.SMARTS,
    );

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.DaylightSMARTS,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('Paste from clipboard in "Daylight SMARTS" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4687
    Description: Reagent 'Cl' displays above reaction arrow
    */
    await pasteFromClipboardAndAddToCanvas(
      page,
      '[#6]-[#6]1-[#6](-[#8])=[#6]-[#6](-[#16])=[#6](-[#7])-[#6]=1>[#17]>[#6]-[#6]1-[#6](-,:[#35])=[#6]-[#6](-[#8])=[#6](-,:[#53])-[#6]=1',
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Open from file in "Daylight SMARTS" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4689
    Description: Reagent 'Cl' below the reaction arrow
    */
    await openFileAndAddToCanvas(page, 'SMARTS/expected-smarts-below.smarts');
    await takeEditorScreenshot(page);
  });

  test('Structure is opened with Not List atoms saved in "Daylight SMARTS" format', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4706
    Description: Chain is opened with Not List atoms ![Zr,Au,Zn]
    */
    await openFileAndAddToCanvas(page, 'SMARTS/not-list-atoms-smarts.smarts');
    await takeEditorScreenshot(page);
  });
});

test.describe('Reagents SMARTS format', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('File saves in "Daylight SMARTS" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4685
    Description: File saved in format (e.g. "ketcher.smarts")
    */
    await openFileAndAddToCanvas(
      page,
      'KET/benzene-arrow-benzene-reagent-nh3.ket',
    );

    await verifyFileExport(
      page,
      'SMARTS/expected-smarts-file.smarts',
      FileType.SMARTS,
    );

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.DaylightSMARTS,
    );
    await SaveStructureDialog(page).save();
  });
});
