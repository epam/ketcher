import { test, expect } from '@fixtures';
import { Page } from '@playwright/test';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { ErrorMessageDialog } from '@tests/pages/common/ErrorMessageDialog';
import { OpenStructureDialog } from '@tests/pages/common/OpenStructureDialog';
import { PasteFromClipboardDialog } from '@tests/pages/common/PasteFromClipboardDialog';
import { getKet, openFile, openFileAndAddToCanvasAsNewProject } from '@utils';

let page: Page;

test.describe('Corrupted image in KET file', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Verify that corrupted image in KET file is rejected with a specific error and canvas content remains unchanged', async () => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5146
     * Description: Opening a KET file with corrupted image data should show a dedicated error
     * and should not replace the current canvas content.
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/image-svg-demo-expected.ket',
    );
    const ketBeforeOpenAttempt = await getKet(page);

    await CommonTopLeftToolbar(page).openFile();
    await openFile(page, 'KET/corrupted-image-png.ket');
    await PasteFromClipboardDialog(page).openAsNew({
      errorMessageExpected: true,
    });

    const errorMessage = await ErrorMessageDialog(page).getErrorMessage();
    expect(errorMessage).toContain(
      "The file contains corrupted images and couldn't be loaded.",
    );

    const ketAfterOpenAttempt = await getKet(page);
    expect(ketAfterOpenAttempt).toEqual(ketBeforeOpenAttempt);

    await ErrorMessageDialog(page).close();
    await OpenStructureDialog(page).closeWindow();
  });
});
