/* eslint-disable no-magic-numbers */
import { Page, test } from '@playwright/test';
import { takeEditorScreenshot, selectTopPanelButton } from '@utils/canvas';
import { pressButton, clickInTheMiddleOfTheScreen } from '@utils/clicks';
import {
  TopPanelButton,
  waitForPageInit,
  openFromFileViaClipboard,
  readFileContents,
  waitForLoad,
} from '@utils';
import {
  selectNestedTool,
  SelectTool,
} from '@utils/canvas/tools/selectNestedTool';
import { addTextBoxToCanvas } from '@utils/selectors/addTextBoxToCanvas';

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
    await selectTopPanelButton(TopPanelButton.Save, page);
    await page.getByLabel('File name:').click();
    await page.getByLabel('File name:').fill('ketfile01');
    await page.getByRole('button', { name: 'MDL Molfile V2000' }).click();
    await page.getByRole('option', { name: 'Ket Format' }).click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await selectTopPanelButton(TopPanelButton.Clear, page);
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFromFileViaClipboard('tests/test-data/KET/ketfile01.ket', page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await page.getByText('TEST321').dblclick();
    await page.keyboard.press('Control+a');
    await page.getByRole('button', { name: 'italic' }).click();
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Text tool - Cut/Copy/Paste', async ({ page }) => {
    // Test case: EPMLSOPKET-2272
    // Checking if user is able to copy/cut/paste the created text objects
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill('TEXT001');
    await pressButton(page, 'Apply');
    await page.getByText('TEXT001').click();
    await selectTopPanelButton(TopPanelButton.Copy, page);
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('Control+v');
    await page.getByTestId('canvas').click({ position: { x: 250, y: 300 } });
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await selectNestedTool(page, SelectTool.LASSO_SELECTION);
    await page.mouse.move(97, 79);
    await page.mouse.down();
    await page.mouse.move(943, 114);
    await page.mouse.move(844, 579);
    await page.mouse.move(66, 611);
    await page.mouse.up();
    await selectTopPanelButton(TopPanelButton.Cut, page);
    await page.keyboard.press('Control+v');
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await takeEditorScreenshot(page);
  });

  test('Text tool - Selection of different types of text objects', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-2274
    // Checking if its possible to select a text objects of any size by clicking on green frame
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill('TEXT');
    await page.getByRole('dialog').getByRole('textbox').inputValue;
    await pressButton(page, 'Apply');
    await page.getByText('TEXT').hover();
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
    await page
      .getByText(
        'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP',
      )
      .hover();
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
    await takeEditorScreenshot(page);
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
    await takeEditorScreenshot(page);
  });
});

export async function openFromFileViaTextBox(filename: string, page: Page) {
  const fileText = await readFileContents(filename);
  await page.getByTestId('text').click();
  await clickInTheMiddleOfTheScreen(page);
  await page.getByRole('dialog').getByRole('textbox').fill(fileText);
  await waitForLoad(page, () => {
    pressButton(page, 'Apply');
  });
}
