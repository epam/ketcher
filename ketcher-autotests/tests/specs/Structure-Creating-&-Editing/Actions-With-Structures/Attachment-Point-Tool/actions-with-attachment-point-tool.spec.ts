import { test } from '@fixtures';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  waitForPageInit,
  waitForRender,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';

test.describe('Attachment Point Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Opening *.mol V2000 file with S-Group containing Attachment point', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-18024
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/s-group-with-attachment-points.mol',
    );
    await takeEditorScreenshot(page);
  });

  test('Opening the *.ket file with S-Group containing "Attachment point"', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-18026
    await openFileAndAddToCanvas(
      page,
      'KET/s-group-with-attachment-points.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Saving the S-Group structure with Attachment point in *.ket file', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-18025
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/s-group-with-attachment-points.mol',
    );
    await verifyFileExport(
      page,
      'KET/S-Group-structure-with-Attachment-point.ket',
      FileType.KET,
    );
  });

  test('Opening saved .ket file and doing some action on it', async ({
    page,
  }) => {
    await openFileAndAddToCanvas(
      page,
      'KET/S-Group-structure-with-Attachment-point.ket',
    );
    await selectAllStructuresOnCanvas(page);
    await waitForRender(page, async () => {
      await page.keyboard.press('Control++');
      page.getByTestId('floating-tools');
    });
    await takeEditorScreenshot(page);
  });
});
