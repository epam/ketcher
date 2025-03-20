import { test } from '@playwright/test';
import {
  clickOnCanvas,
  copyAndPaste,
  cutAndPaste,
  openFileAndAddToCanvas,
  screenshotBetweenUndoRedo,
  takeEditorScreenshot,
  takeLeftToolbarScreenshot,
  waitForPageInit,
} from '@utils';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';

test.describe('R-Group', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
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
    await takeEditorScreenshot(page);
  });

  test('Copy and paste R-Group structure', async ({ page }) => {
    /*
  Test case: EPMLSOPKET-1671
  Description: All Rgroup members, Rgroup definition, occurence, brackets, 
  attachment points are rendered correctly in any structure drawing application.
  */
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas(
      'Molfiles-V2000/r-group-with-allkind-attachment-points.mol',
      page,
    );
    await copyAndPaste(page);
    await clickOnCanvas(page, x, y);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Cut and Paste R-Group structure', async ({ page }) => {
    /*
  Test case: EPMLSOPKET-1671
  Description: All Rgroup members, Rgroup definition, occurence, brackets, 
  attachment points are rendered correctly in any structure drawing application.
  */
    const x = 300;
    const y = 300;
    await openFileAndAddToCanvas(
      'Molfiles-V2000/r-group-with-allkind-attachment-points.mol',
      page,
    );
    await cutAndPaste(page);
    await clickOnCanvas(page, x, y);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Save as .mol V2000 file with R-Group features', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1672
    Description: The file is saved as .mol V2000 file.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/r-group-with-allkind-attachment-points.mol',
      page,
    );
    await verifyFileExport(
      page,
      'Molfiles-V2000/r-group-with-allkind-attachment-points-expectedV2000.mol',
      FileType.MOL,
      'v2000',
    );
    await takeEditorScreenshot(page);
  });

  test('Save as .mol V3000 file with R-Group features', async ({ page }) => {
    /*
     * Test case: EPMLSOPKET-1672
     * Description: The file is saved as .mol V3000 file.
     */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/r-group-with-allkind-attachment-points.mol',
      page,
    );
    await verifyFileExport(
      page,
      'Molfiles-V3000/r-group-with-allkind-attachment-points-expectedV3000.mol',
      FileType.MOL,
      'v3000',
    );
    await takeEditorScreenshot(page);
  });

  test('Open .smi file with R-Group features', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1673
    Description: The file is opened as .smi file.
    */
    await openFileAndAddToCanvas(
      'SMILES/r-group-with-allkind-attachment-points.smi',
      page,
    );
    await takeEditorScreenshot(page);
  });
});
