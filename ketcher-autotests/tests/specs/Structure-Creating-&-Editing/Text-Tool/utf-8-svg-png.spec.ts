import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  waitForPageInit,
} from '@utils';
import { selectSaveTool } from '@tests/pages/common/TopLeftToolbar';
import { chooseFileFormat } from '@tests/pages/common/SaveStructureDialog';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';

test.describe('Open UTF-8 and save as SVG and PNG', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Open UTF-8 file and save as SVG', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5252
    Description: A file with UTF-8 encoding opens and, when saved in a SVG preview, contains all characters
  */
    await openFileAndAddToCanvas('KET/utf-8-svg-png.ket', page);
    await selectSaveTool(page);
    await chooseFileFormat(page, MoleculesFileFormatType.SVGDocument);

    await takeEditorScreenshot(page);
  });

  test('Open UTF-8 file and save as PNG', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5252
    Description: A file with UTF-8 encoding opens and, when saved in a PNG preview, contains all characters
  */
    await openFileAndAddToCanvas('KET/utf-8-svg-png.ket', page);

    await selectSaveTool(page);
    await chooseFileFormat(page, MoleculesFileFormatType.PNGImage);

    await takeEditorScreenshot(page);
  });
});
