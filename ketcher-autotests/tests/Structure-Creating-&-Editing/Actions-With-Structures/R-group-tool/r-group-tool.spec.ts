import { expect, test } from '@playwright/test';
import {
  copyAndPaste,
  cutAndPaste,
  openFileAndAddToCanvas,
  receiveFileComparisonData,
  saveToFile,
  screenshotBetweenUndoRedo,
  takeEditorScreenshot,
  takeLeftToolbarScreenshot,
  waitForPageInit,
} from '@utils';
import { getMolfile } from '@utils/formats';

test.describe('R-Group', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Icons and tooltips', async ({ page }) => {
    /* Test case: EPMLSOPKET-1555+EPMLSOPKET-1554
        Description: 'Ctrl+R' change tooltips. Correct icon of a tooltip is shown. Check all 3 values from drop-down list
    */
    await page.waitForSelector('.Ketcher-root');

    await page.keyboard.press('Control+r');
    await takeLeftToolbarScreenshot(page);

    await page.keyboard.press('Control+r');
    await takeLeftToolbarScreenshot(page);

    await page.keyboard.press('Control+r');
    await takeLeftToolbarScreenshot(page);
  });

  test.fixme('Copy and paste R-Group structure', async ({ page }) => {
    /*
  Test case: EPMLSOPKET-1671
  Description: All Rgroup members, Rgroup definition, occurence, brackets, 
  attachment points are rendered correctly in any structure drawing application.
  */
    // Error when test is running by playwright. Manually it's working.
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas(
      'r-group-with-allkind-attachment-points.mol',
      page,
    );
    await copyAndPaste(page);
    await page.mouse.click(x, y);
    await screenshotBetweenUndoRedo(page);
  });

  test.fixme('Cut and Paste R-Group structure', async ({ page }) => {
    /*
  Test case: EPMLSOPKET-1671
  Description: All Rgroup members, Rgroup definition, occurence, brackets, 
  attachment points are rendered correctly in any structure drawing application.
  */
    // Error when test is running by playwright. Manually it's working.
    const x = 300;
    const y = 300;
    await openFileAndAddToCanvas(
      'r-group-with-allkind-attachment-points.mol',
      page,
    );
    await cutAndPaste(page);
    await page.mouse.click(x, y);
    await screenshotBetweenUndoRedo(page);
  });

  test('Save as .mol V2000 file with R-Group features', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1672
    Description: The file is saved as .mol V2000 file.
    */
    await openFileAndAddToCanvas(
      'r-group-with-allkind-attachment-points.mol',
      page,
    );
    const expectedFile = await getMolfile(page, 'v2000');
    await saveToFile(
      'r-group-with-allkind-attachment-points-expectedV2000.mol',
      expectedFile,
    );
    const METADATA_STRING_INDEX = [1];
    const { file: molFile, fileExpected: molFileExpected } =
      await receiveFileComparisonData({
        page,
        metaDataIndexes: METADATA_STRING_INDEX,
        expectedFileName:
          'tests/test-data/r-group-with-allkind-attachment-points-expectedV2000.mol',
        fileFormat: 'v2000',
      });

    expect(molFile).toEqual(molFileExpected);
  });

  test('Save as .mol V3000 file with R-Group features', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1672
    Description: The file is saved as .mol V3000 file.
    */
    await openFileAndAddToCanvas(
      'r-group-with-allkind-attachment-points.mol',
      page,
    );
    const expectedFile = await getMolfile(page, 'v3000');
    await saveToFile(
      'r-group-with-allkind-attachment-points-expectedV3000.mol',
      expectedFile,
    );
    const METADATA_STRING_INDEX = [1];
    const { file: molFile, fileExpected: molFileExpected } =
      await receiveFileComparisonData({
        page,
        metaDataIndexes: METADATA_STRING_INDEX,
        expectedFileName:
          'tests/test-data/r-group-with-allkind-attachment-points-expectedV3000.mol',
        fileFormat: 'v3000',
      });

    expect(molFile).toEqual(molFileExpected);
  });

  test('Open .smi file with R-Group features', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1673
    Description: The file is opened as .smi file.
    */
    await openFileAndAddToCanvas(
      'r-group-with-allkind-attachment-points.smi',
      page,
    );
  });
});
