/* eslint-disable no-magic-numbers */
import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  waitForPageInit,
  clickInTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  clickOnCanvas,
  readFileContent,
  pasteFromClipboardAndAddToCanvas,
  deleteByKeyboard,
} from '@utils';
import {
  copyAndPaste,
  cutAndPaste,
  selectAllStructuresOnCanvas,
} from '@utils/canvas/selectSelection';
import { addTextBoxToCanvas } from '@utils/selectors/addTextBoxToCanvas';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { TextEditorDialog } from '@tests/pages/molecules/canvas/TextEditorDialog';

test.describe('Text tools test cases', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test(' Font size', async ({ page }) => {
    // Test case:EPMLSOPKET-2885
    // Verify if possible is changing font size on the created text object
    await addTextBoxToCanvas(page);
    await TextEditorDialog(page).setText('TEST');
    await selectAllStructuresOnCanvas(page);
    await TextEditorDialog(page).selectFontSize(20);
    await TextEditorDialog(page).apply();
    await takeEditorScreenshot(page);
    await page.getByText('TEST').dblclick();
    await selectAllStructuresOnCanvas(page);
    await TextEditorDialog(page).selectFontSize(10);
    await TextEditorDialog(page).apply();
    await takeEditorScreenshot(page);
  });

  test(' Applying styles - Bold', async ({ page }) => {
    // Test case: EPMLSOPKET-2256
    // Verify if possible to put bold style on the created text object
    await addTextBoxToCanvas(page);
    await TextEditorDialog(page).setOptions({
      content: 'ABC',
      isBold: true,
    });
    await takeEditorScreenshot(page);
  });

  test(' Applying styles - Italic', async ({ page }) => {
    // Test case: EPMLSOPKET-2257
    // Verify if possible to put Italic style on the created text object
    await addTextBoxToCanvas(page);
    await TextEditorDialog(page).setOptions({
      content: 'ABCDE',
      isItalic: true,
    });
    await takeEditorScreenshot(page);
  });

  test(' Applying styles - Subscript', async ({ page }) => {
    // Test case: EPMLSOPKET-2258
    // Verify if possible to put Subscript style on the created text object
    await addTextBoxToCanvas(page);
    await TextEditorDialog(page).setOptions({
      content: 'ABC123',
      isSubscript: true,
    });
    await takeEditorScreenshot(page);
  });

  test('Applying styles - Superscript', async ({ page }) => {
    // Test case: EPMLSOPKET-2259
    // Verify if possible to put Superscript style on the created text object
    await addTextBoxToCanvas(page);
    await TextEditorDialog(page).setOptions({
      content: 'ABC123',
      isSuperscript: true,
    });
    await takeEditorScreenshot(page);
  });

  test('Applying styles - Combination of styles', async ({ page }) => {
    // Test case: EPMLSOPKET-2260
    // Verify if possible to put different styles on the created text object
    await addTextBoxToCanvas(page);
    await TextEditorDialog(page).setText('TEST123');
    await selectAllStructuresOnCanvas(page);
    await TextEditorDialog(page).setOptions({
      fontSize: 25,
      isBold: true,
      isItalic: true,
      isSuperscript: true,
    });
    await takeEditorScreenshot(page);
    await page.getByText('TEST123').dblclick();
    await selectAllStructuresOnCanvas(page);
    await TextEditorDialog(page).setOptions({
      isSubscript: true,
    });
    await takeEditorScreenshot(page);
  });

  test('Create text object and save it as .ket file', async ({ page }) => {
    // Test case: EPMLSOPKET-2235
    // Verify if possible to put different styles on the created text object
    await addTextBoxToCanvas(page);
    await TextEditorDialog(page).setText('TEST321');
    await page.getByText('TEST321').dblclick();
    await selectAllStructuresOnCanvas(page);
    await TextEditorDialog(page).setOptions({
      fontSize: 20,
      isBold: true,
    });
    await takeEditorScreenshot(page);
  });

  test('Saving text object as a .ket file', async ({ page }) => {
    // Test case: EPMLSOPKET-2235
    await openFileAndAddToCanvas(page, 'KET/ketfile01.ket');
    await verifyFileExport(page, 'KET/ketfile01-expected.ket', FileType.KET);
    await takeEditorScreenshot(page);
  });

  test('Open saved .ket file', async ({ page }) => {
    // Test case: EPMLSOPKET-2235
    const fileContent = await readFileContent('KET/ketfile01.ket');

    await pasteFromClipboardAndAddToCanvas(page, fileContent);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await page.getByText('TEST321').dblclick();
    await selectAllStructuresOnCanvas(page);
    await TextEditorDialog(page).setOptions({
      isItalic: true,
    });
    await takeEditorScreenshot(page);
  });

  test(' Cut/Copy/Paste', async ({ page }) => {
    // Test case: EPMLSOPKET-2272
    // Verify if user is able to copy and paste the created text objects
    const x = 250;
    const y = 300;
    await addTextBoxToCanvas(page);
    await TextEditorDialog(page).setText('TEXT001');
    await TextEditorDialog(page).apply();
    await copyAndPaste(page);
    await clickOnCanvas(page, x, y);
    await takeEditorScreenshot(page);
  });

  test(' Checking if user is able to cut and paste the created text objects', async ({
    page,
  }) => {
    // Opening a file with created ealier text (task EPMLSOPKET-2272 ) and doing copy/paste action on it
    await openFileAndAddToCanvas(page, 'KET/two-text-objects.ket');
    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).redo();
    await cutAndPaste(page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).redo();
    await takeEditorScreenshot(page);
  });

  test(' Selection of different types of text objects', async ({ page }) => {
    // Test case: EPMLSOPKET-2274
    // Verify if its possible to select a text objects of any size by clicking on green frame
    await openFileAndAddToCanvas(page, 'KET/text-object.ket');
    await page.getByText('TEXT').dblclick();
    await selectAllStructuresOnCanvas(page);
    await TextEditorDialog(page).setText('PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP');
    await TextEditorDialog(page).apply();
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await page.keyboard.press('Delete');
    const content = await readFileContent('Txt/longtext_test.txt');
    await addTextBoxToCanvas(page);
    await TextEditorDialog(page).setOptions({ content });
    await takeEditorScreenshot(page);
  });

  test('UTF-8 compatible ("Paste from Clipboard")', async ({ page }) => {
    // Test case: EPMLSOPKET-5253
    // Verify if possible is add UTF-8 data format  to canvas
    const fileContent = await readFileContent('KET/utf-8-svg-png.ket');

    await pasteFromClipboardAndAddToCanvas(page, fileContent);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });
});
