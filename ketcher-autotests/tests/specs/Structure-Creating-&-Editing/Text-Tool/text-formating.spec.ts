import { Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  waitForPageInit,
  pressButton,
  clickInTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  copyAndPaste,
  cutAndPaste,
  waitForRender,
  clickOnCanvas,
  readFileContent,
  pasteFromClipboardAndAddToCanvas,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas';
import { addTextBoxToCanvas } from '@utils/selectors/addTextBoxToCanvas';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { waitForLoadAndRender } from '@utils/common/loaders/waitForLoad/waitForLoad';

async function openFromFileViaTextBox(filename: string, page: Page) {
  const fileText = await readFileContent(filename);
  await page.getByTestId('text').click();
  await clickInTheMiddleOfTheScreen(page);
  await page.getByRole('dialog').getByRole('textbox').fill(fileText);
  await waitForLoadAndRender(page, () => {
    pressButton(page, 'Apply');
  });
}
type buttonType = 'bold' | 'italic' | 'subscript' | 'superscript';

async function applyTextFormat(
  page: Page,
  text: string,
  buttonName: buttonType,
) {
  await page.getByRole('dialog').getByRole('textbox').fill(text);
  await selectAllStructuresOnCanvas(page);
  await page.getByRole('button', { name: buttonName }).click();
  await pressButton(page, 'Apply');
  await takeEditorScreenshot(page);
  await page.getByText(text).dblclick();
  await selectAllStructuresOnCanvas(page);
  await page.getByRole('button', { name: buttonName }).click();
  await page.getByRole('button', { name: buttonName }).click();
}

test.describe('Text tools test cases', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test(' Font size', async ({ page }) => {
    // Test case:EPMLSOPKET-2885
    // Verify if possible is changing font size on the created text object
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill('TEST');
    await selectAllStructuresOnCanvas(page);
    await page.getByRole('button', { name: '13' }).click();
    await page.getByText('20', { exact: true }).click();
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await page.getByText('TEST').dblclick();
    await selectAllStructuresOnCanvas(page);
    await page.getByRole('button', { name: '20' }).click();
    await page.getByText('10', { exact: true }).click();
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test(' Applying styles - Bold', async ({ page }) => {
    // Test case: EPMLSOPKET-2256
    // Verify if possible to put bold style on the created text object
    await addTextBoxToCanvas(page);
    await applyTextFormat(page, 'ABC', 'bold');
    await takeEditorScreenshot(page);
  });

  test(' Applying styles - Italic', async ({ page }) => {
    // Test case: EPMLSOPKET-2257
    // Verify if possible to put Italic style on the created text object
    await addTextBoxToCanvas(page);
    await applyTextFormat(page, 'ABCDE', 'italic');
    await takeEditorScreenshot(page);
  });

  test(' Applying styles - Subscript', async ({ page }) => {
    // Test case: EPMLSOPKET-2258
    // Verify if possible to put Subscript style on the created text object
    await addTextBoxToCanvas(page);
    await applyTextFormat(page, 'ABC123', 'subscript');
    await takeEditorScreenshot(page);
  });

  test('Applying styles - Superscript', async ({ page }) => {
    // Test case: EPMLSOPKET-2259
    // Verify if possible to put Superscript style on the created text object
    await addTextBoxToCanvas(page);
    await applyTextFormat(page, 'ABC123', 'superscript');
    await takeEditorScreenshot(page);
  });

  test('Applying styles - Combination of styles', async ({ page }) => {
    // Test case: EPMLSOPKET-2260
    // Verify if possible to put different styles on the created text object
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill('TEST123');
    await selectAllStructuresOnCanvas(page);
    await page.getByRole('button', { name: '13' }).click();
    await page.getByText('25', { exact: true }).click();
    await page.getByRole('button', { name: 'bold' }).click();
    await page.getByRole('button', { name: 'italic' }).click();
    await page.getByRole('button', { name: 'superscript' }).click();
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await page.getByText('TEST123').dblclick();
    await selectAllStructuresOnCanvas(page);
    await page.getByRole('button', { name: 'subscript' }).click();
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Create text object and save it as .ket file', async ({ page }) => {
    // Test case: EPMLSOPKET-2235
    // Verify if possible to put different styles on the created text object
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill('TEST321');
    await pressButton(page, 'Apply');
    await page.getByText('TEST321').dblclick();
    await selectAllStructuresOnCanvas(page);
    await page.getByRole('button', { name: '13' }).click();
    await page.getByText('20', { exact: true }).click();
    await page.getByRole('button', { name: 'bold' }).click();
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Saving text object as a .ket file', async ({ page }) => {
    // Test case: EPMLSOPKET-2235
    await openFileAndAddToCanvas('KET/ketfile01.ket', page);

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
    await page.getByRole('button', { name: 'italic' }).click();
    await waitForRender(page, async () => {
      await pressButton(page, 'Apply');
    });
    await takeEditorScreenshot(page);
  });

  test(' Cut/Copy/Paste', async ({ page }) => {
    // Test case: EPMLSOPKET-2272
    // Verify if user is able to copy and paste the created text objects
    const x = 250;
    const y = 300;
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill('TEXT001');
    await pressButton(page, 'Apply');
    await copyAndPaste(page);
    await clickOnCanvas(page, x, y);
    await takeEditorScreenshot(page);
  });

  test(' Checking if user is able to cut and paste the created text objects', async ({
    page,
  }) => {
    // Opening a file with created ealier text (task EPMLSOPKET-2272 ) and doing copy/paste action on it
    await openFileAndAddToCanvas('KET/two-text-objects.ket', page);
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
    await openFileAndAddToCanvas('KET/text-object.ket', page);
    await page.getByText('TEXT').dblclick();
    await page.getByRole('dialog').getByRole('textbox').click();
    await selectAllStructuresOnCanvas(page);
    await page
      .getByRole('dialog')
      .getByRole('textbox')
      .fill(
        'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP',
      );
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await page
      .getByText(
        'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP',
      )
      .dblclick();
    await selectAllStructuresOnCanvas(page);
    await page.keyboard.press('Delete');
    await pressButton(page, 'Apply');
    await openFromFileViaTextBox('Txt/longtext_test.txt', page);
    await clickInTheMiddleOfTheScreen(page);
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
