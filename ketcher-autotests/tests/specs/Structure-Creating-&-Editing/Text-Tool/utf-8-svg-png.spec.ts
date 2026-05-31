import { test } from '@fixtures';
import { openFileAndAddToCanvas, waitForPageInit } from '@utils';
import {
  verifyPNGExport,
  verifySVGExport,
} from '@utils/files/receiveFileComparisonData';

test.describe('Open UTF-8 and save as SVG and PNG', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Open UTF-8 file and save as SVG', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5252
    Description: A file with UTF-8 encoding opens and, when saved in a SVG preview, contains all characters
  */
    await openFileAndAddToCanvas(page, 'KET/utf-8-svg-png.ket');
    await verifySVGExport(page);
  });

  test('Open UTF-8 file and save as PNG', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5252
    Description: A file with UTF-8 encoding opens and, when saved in a PNG preview, contains all characters
  */
    await openFileAndAddToCanvas(page, 'KET/utf-8-svg-png.ket');

    await verifyPNGExport(page);
  });
});
