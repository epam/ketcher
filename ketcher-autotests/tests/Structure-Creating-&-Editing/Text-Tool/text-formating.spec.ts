import { Page, test, expect } from '@playwright/test';
import {
  takeEditorScreenshot,
  selectTopPanelButton,
  waitForPageInit,
  pressButton,
  TopPanelButton,
  clickInTheMiddleOfTheScreen,
  openFromFileViaClipboard,
  waitForLoad,
  readFileContents,
  saveToFile,
  openFileAndAddToCanvas,
  copyAndPaste,
  cutAndPaste,
  waitForRender,
  receiveFileComparisonData,
} from '@utils';
import { getKet } from '@utils/formats';
import { addTextBoxToCanvas } from '@utils/selectors/addTextBoxToCanvas';

async function openFromFileViaTextBox(filename: string, page: Page) {
  const fileText = await readFileContents(filename);
  await page.getByTestId('text').click();
  await clickInTheMiddleOfTheScreen(page);
  await page.getByRole('dialog').getByRole('textbox').fill(fileText);
  await waitForLoad(page, () => {
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
  await page.keyboard.press('Control+a');
  await page.getByRole('button', { name: buttonName }).click();
  await pressButton(page, 'Apply');
  await takeEditorScreenshot(page);
  await page.getByText(text).dblclick();
  await page.keyboard.press('Control+a');
  await page.getByRole('button', { name: buttonName }).click();
  await page.getByRole('button', { name: buttonName }).click();
}

test.describe('Text tools test cases', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test(' Font size', async ({ page }) => {
    // Test case:EPMLSOPKET-2885
    // Verify if possible is changing font size on the created text object
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill('TEST');
    await page.keyboard.press('Control+a');
    await page.getByRole('button', { name: '13' }).click();
    await page.getByText('20', { exact: true }).click();
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await page.getByText('TEST').dblclick();
    await page.keyboard.press('Control+a');
    await page.getByRole('button', { name: '20' }).click();
    await page.getByText('10', { exact: true }).click();
    await pressButton(page, 'Apply');
  });

  test(' Applying styles - Bold', async ({ page }) => {
    // Test case: EPMLSOPKET-2256
    // Verify if possible to put bold style on the created text object
    await addTextBoxToCanvas(page);
    await applyTextFormat(page, 'ABC', 'bold');
  });

  test(' Applying styles - Italic', async ({ page }) => {
    // Test case: EPMLSOPKET-2257
    // Verify if possible to put Italic style on the created text object
    await addTextBoxToCanvas(page);
    await applyTextFormat(page, 'ABCDE', 'italic');
  });

  test(' Applying styles - Subscript', async ({ page }) => {
    // Test case: EPMLSOPKET-2258
    // Verify if possible to put Subscript style on the created text object
    await addTextBoxToCanvas(page);
    await applyTextFormat(page, 'ABC123', 'subscript');
  });

  test('Applying styles - Superscript', async ({ page }) => {
    // Test case: EPMLSOPKET-2259
    // Verify if possible to put Superscript style on the created text object
    await addTextBoxToCanvas(page);
    await applyTextFormat(page, 'ABC123', 'superscript');
  });

  test('Applying styles - Combination of styles', async ({ page }) => {
    // Test case: EPMLSOPKET-2260
    // Verify if possible to put different styles on the created text object
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill('TEST123');
    await page.keyboard.press('Control+a');
    await page.getByRole('button', { name: '13' }).click();
    await page.getByText('25', { exact: true }).click();
    await page.getByRole('button', { name: 'bold' }).click();
    await page.getByRole('button', { name: 'italic' }).click();
    await page.getByRole('button', { name: 'superscript' }).click();
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await page.getByText('TEST123').dblclick();
    await page.keyboard.press('Control+a');
    await page.getByRole('button', { name: 'subscript' }).click();
    await pressButton(page, 'Apply');
  });

  test('Create text object and save it as .ket file', async ({ page }) => {
    // Test case: EPMLSOPKET-2235
    // Verify if possible to put different styles on the created text object
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill('TEST321');
    await pressButton(page, 'Apply');
    await page.getByText('TEST321').dblclick();
    await page.keyboard.press('Control+a');
    await page.getByRole('button', { name: '13' }).click();
    await page.getByText('20', { exact: true }).click();
    await page.getByRole('button', { name: 'bold' }).click();
    await pressButton(page, 'Apply');
  });

  test('Saving text object as a .ket file', async ({ page }) => {
    // Test case: EPMLSOPKET-2235
    await openFileAndAddToCanvas('KET/ketfile01.ket', page);
    const expectedFile = await getKet(page);
    await saveToFile('KET/ketfile01-expected.ket', expectedFile);

    const { fileExpected: ketFileExpected, file: ketFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/KET/ketfile01-expected.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);
  });

  test('Open saved .ket file', async ({ page }) => {
    // Test case: EPMLSOPKET-2235
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFromFileViaClipboard('tests/test-data/KET/ketfile01.ket', page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await page.getByText('TEST321').dblclick();
    await page.keyboard.press('Control+a');
    await page.getByRole('button', { name: 'italic' }).click();
    await waitForRender(page, async () => {
      await pressButton(page, 'Apply');
    });
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
    await page.mouse.click(x, y);
  });

  test(' Checking if user is able to cut and paste the created text objects', async ({
    page,
  }) => {
    // Opening a file with created ealier text (task EPMLSOPKET-2272 ) and doing copy/paste action on it
    await openFileAndAddToCanvas('KET/two-text-objects.ket', page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await cutAndPaste(page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await waitForRender(page, async () => {
      await selectTopPanelButton(TopPanelButton.Undo, page);
      await selectTopPanelButton(TopPanelButton.Redo, page);
    });
  });

  test(' Selection of different types of text objects', async ({ page }) => {
    // Test case: EPMLSOPKET-2274
    // Verify if its possible to select a text objects of any size by clicking on green frame
    await openFileAndAddToCanvas('KET/text-object.ket', page);
    await page.getByText('TEXT').dblclick();
    await page.getByRole('dialog').getByRole('textbox').click();
    await page.keyboard.press('Control+a');
    await page
      .getByRole('dialog')
      .getByRole('textbox')
      .fill(
        'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP',
      );
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+a');
    await page
      .getByText(
        'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP',
      )
      .dblclick();
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Delete');
    await pressButton(page, 'Apply');
    await openFromFileViaTextBox('tests/test-data/Txt/longtext_test.txt', page);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('UTF-8 compatible ("Paste from Clipboard")', async ({ page }) => {
    // Test case: EPMLSOPKET-5253
    // Verify if possible is add UTF-8 data format  to canvas
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFromFileViaClipboard(
      'tests/test-data/KET/utf-8-svg-png.ket',
      page,
    );
    await clickInTheMiddleOfTheScreen(page);
  });
});
