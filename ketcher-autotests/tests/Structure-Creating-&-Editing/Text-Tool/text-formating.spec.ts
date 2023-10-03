import { Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  selectTopPanelButton,
  selectNestedTool,
  SelectTool,
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
} from '@utils';
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

async function createSomeStructure(page: Page) {
  const a = 97;
  const b = 79;
  const c = 943;
  const d = 114;
  const e = 844;
  const f = 579;
  const g = 66;
  const h = 611;
  await page.mouse.move(a, b);
  await page.mouse.down();
  await page.mouse.move(c, d);
  await page.mouse.move(e, f);
  await page.mouse.move(g, h);
  await page.mouse.up();
}

test.describe('Text tools test cases', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Text tool - Font size', async ({ page }) => {
    // Test case:EPMLSOPKET-2885
    // Checking if possible is changing font size on the created text object
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

  test('Text tool - Applying styles - Bold', async ({ page }) => {
    // Test case: EPMLSOPKET-2256
    // Checking if possible to put bold style on the created text object
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill('ABC');
    await page.keyboard.press('Control+a');
    await page.getByRole('button', { name: 'bold' }).click();
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await page.getByText('ABC').dblclick();
    await page.keyboard.press('Control+a');
    await page.getByRole('button', { name: 'bold' }).click();
    await page.getByRole('button', { name: 'bold' }).click();
  });

  test('Text tool - Applying styles - Italic', async ({ page }) => {
    // Test case: EPMLSOPKET-2257
    // Checking if possible to put Italic style on the created text object
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill('ABCDE');
    await page.keyboard.press('Control+a');
    await page.getByRole('button', { name: 'italic' }).click();
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await page.getByText('ABCDE').dblclick();
    await page.keyboard.press('Control+a');
    await page.getByRole('button', { name: 'italic' }).click();
    await page.getByRole('button', { name: 'italic' }).click();
  });

  test('Text tool - Applying styles - Subscript', async ({ page }) => {
    // Test case: EPMLSOPKET-2258
    // Checking if possible to put Subscript style on the created text object
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill('ABC123');
    await page.keyboard.press('Control+a');
    await page.getByRole('button', { name: 'subscript' }).click();
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await page.getByText('ABC123').dblclick();
    await page.keyboard.press('Control+a');
    await page.getByRole('button', { name: 'subscript' }).click();
    await page.getByRole('button', { name: 'subscript' }).click();
  });

  test('Text tool -  Applying styles - Superscript', async ({ page }) => {
    // Test case: EPMLSOPKET-2259
    // Checking if possible to put Superscript style on the created text object
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill('ABC123');
    await page.keyboard.press('Control+a');
    await page.getByRole('button', { name: 'superscript' }).click();
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await page.getByText('ABC123').dblclick();
    await page.keyboard.press('Control+a');
    await page.getByRole('button', { name: 'superscript' }).click();
    await page.getByRole('button', { name: 'superscript' }).click();
  });

  test('Text tool - Applying styles - Combination of styles', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-2260
    // Checking if possible to put different styles on the created text object
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

  test('Text tool - Save as .ket file', async ({ page }) => {
    // Test case: EPMLSOPKET-2235
    // Checking if possible to put different styles on the created text object
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill('TEST321');
    await pressButton(page, 'Apply');
    await page.getByText('TEST321').dblclick();
    await page.keyboard.press('Control+a');
    await page.getByRole('button', { name: '13' }).click();
    await page.getByText('20', { exact: true }).click();
    await page.getByRole('button', { name: 'bold' }).click();
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await saveToFile('ketfile01.ket', 'ketFile');
    await selectTopPanelButton(TopPanelButton.Clear, page);
  });

  test('Text tool - Open saved .ket file', async ({ page }) => {
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFromFileViaClipboard('tests/test-data/KET/ketfile01.ket', page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await page.getByText('TEST321').dblclick();
    await page.keyboard.press('Control+a');
    await page.getByRole('button', { name: 'italic' }).click();
    await pressButton(page, 'Apply');
  });

  test('Text tool - Cut/Copy/Paste', async ({ page }) => {
    // Test case: EPMLSOPKET-2272
    // Checking if user is able to copy and paste the created text objects
    const x = 250;
    const y = 300;
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill('TEXT001');
    await pressButton(page, 'Apply');
    await copyAndPaste(page);
    await page.getByTestId('canvas').click({ position: { x, y } });
    await takeEditorScreenshot(page);
  });

  test('Text tool - Checking if user is able to cut and paste the created text objects', async ({
    page,
  }) => {
    // Opening a file with created ealier text (task EPMLSOPKET-2272 ) and doing copy/paste action on it
    await openFileAndAddToCanvas('KET/two-text-objects.ket', page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await cutAndPaste(page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
  });

  test('Text tool - Selection of different types of text objects', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-2274
    // Checking if its possible to select a text objects of any size by clicking on green frame
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

  test("Text tool - UTF-8 compatible ('Paste from Clipboard')", async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-5253
    // Checking if possible is add UTF-8 data format  to canvas
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFromFileViaClipboard(
      'tests/test-data/KET/utf-8-svg-png.ket',
      page,
    );
    await clickInTheMiddleOfTheScreen(page);
  });
});
