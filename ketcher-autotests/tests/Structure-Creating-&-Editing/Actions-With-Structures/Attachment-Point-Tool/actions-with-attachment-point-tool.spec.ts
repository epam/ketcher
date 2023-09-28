import { test, expect } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  TopPanelButton,
  waitForPageInit,
  selectTopPanelButton,
  saveToFile,
  receiveFileComparisonData,
} from '@utils';
import { getKet } from '@utils/formats';

test.describe('Attachment Point Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Opening *.mol V2000 file with S-Group containing Attachment point', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-18024
    await openFileAndAddToCanvas('s-group-with-attachment-points.mol', page);
    await takeEditorScreenshot(page);
  });

  test('Opening the *.ket file with S-Group containing "Attachment point" instruction', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-18026
    await openFileAndAddToCanvas('s-group-with-attachment-points.ket', page);
    await takeEditorScreenshot(page);
  });

  test('Saving the S-Group structure with Attachment point in *.ket file', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-18025
    await openFileAndAddToCanvas(
      'Molfiles-V2000/test-EPMLSOPKET-18025.mol',
      page,
    );
    const expectedFile = await getKet(page);
    await saveToFile(
      'KET/S-Group structure with Attachment point-EPMLSOPKET-18025.ket',
      expectedFile,
    );

    const { fileExpected: ketFileExpected, file: ketFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/KET/S-Group structure with Attachment point-EPMLSOPKET-18025.ket',
      });
    expect(ketFile).toEqual(ketFileExpected);
    await selectTopPanelButton(TopPanelButton.Clear, page);
    await openFileAndAddToCanvas(
      'KET/S-Group structure with Attachment point-EPMLSOPKET-18025.ket',
      page,
    );
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control++');
    await takeEditorScreenshot(page);
  });
});
