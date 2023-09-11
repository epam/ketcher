/* eslint-disable no-magic-numbers */
import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  selectLeftPanelButton,
  selectTopPanelButton,
  delay,
} from '@utils/canvas';
import {
  pressButton,
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
} from '@utils/clicks';
import {
  TopPanelButton,
  LeftPanelButton,
  DELAY_IN_SECONDS,
  pasteFromClipboardAndAddToCanvas,
  FILE_TEST_DATA,
  openFileAndAddToCanvas,
} from '@utils';
import {
  selectNestedTool,
  SelectTool,
} from '@utils/canvas/tools/selectNestedTool';
import { openPasteFromClipboard } from './openPasteFromClipboard';

test.describe('Text tools test cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });
  test('Text tool - Font size', async ({ page }) => {
    // Test case:EPMLSOPKET-2885
    await selectLeftPanelButton(LeftPanelButton.AddText, page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByRole('dialog').getByRole('textbox').click();
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
    await takeEditorScreenshot(page);
  });
  test('Text tool - Applying styles - Bold', async ({ page }) => {
    // Test case: EPMLSOPKET-2256
    await selectLeftPanelButton(LeftPanelButton.AddText, page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByRole('dialog').getByRole('textbox').click();
    await page.getByRole('dialog').getByRole('textbox').fill('ABC');
    await page.keyboard.press('Control+a');
    await page.getByRole('button', { name: 'bold' }).click();
    await pressButton(page, 'Apply');
    await delay(DELAY_IN_SECONDS.TWO);
    await takeEditorScreenshot(page);
    await page.getByText('ABC').dblclick();
    await page.keyboard.press('Control+a');
    await page.getByRole('button', { name: 'bold' }).click();
    await delay(DELAY_IN_SECONDS.TWO);
    await page.getByRole('button', { name: 'bold' }).click();
    await takeEditorScreenshot(page);
  });

  test('Text tool - Applying styles - Italic', async ({ page }) => {
    // Test case: EPMLSOPKET-2257
    await selectLeftPanelButton(LeftPanelButton.AddText, page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByRole('dialog').getByRole('textbox').click();
    await page.getByRole('dialog').getByRole('textbox').fill('ABCDE');
    await page.keyboard.press('Control+a');
    await page.getByRole('button', { name: 'italic' }).click();
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await page.getByText('ABCDE').dblclick();
    await page.keyboard.press('Control+a');
    await page.getByRole('button', { name: 'italic' }).click();
    await delay(DELAY_IN_SECONDS.TWO);
    await page.getByRole('button', { name: 'italic' }).click();
    await takeEditorScreenshot(page);
  });
  test('Text tool - Applying styles - Subscript', async ({ page }) => {
    // Test case: EPMLSOPKET-2258
    await selectLeftPanelButton(LeftPanelButton.AddText, page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByRole('dialog').getByRole('textbox').click();
    await page.getByRole('dialog').getByRole('textbox').fill('ABC123');
    await page.keyboard.press('Control+a');
    await page.getByRole('button', { name: 'subscript' }).click();
    await pressButton(page, 'Apply');
    await delay(DELAY_IN_SECONDS.TWO);
    await takeEditorScreenshot(page);
    await page.getByText('ABC123').dblclick();
    await page.keyboard.press('Control+a');
    await page.getByRole('button', { name: 'subscript' }).click();
    await delay(DELAY_IN_SECONDS.TWO);
    await page.getByRole('button', { name: 'subscript' }).click();
    await takeEditorScreenshot(page);
  });
  test('Text tool -  Applying styles - Superscript', async ({ page }) => {
    // Test case: EPMLSOPKET-2259
    await selectLeftPanelButton(LeftPanelButton.AddText, page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByRole('dialog').getByRole('textbox').click();
    await page.getByRole('dialog').getByRole('textbox').fill('ABC123');
    await page.keyboard.press('Control+a');
    await page.getByRole('button', { name: 'superscript' }).click();
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await page.getByText('ABC123').dblclick();
    await page.keyboard.press('Control+a');
    await page.getByRole('button', { name: 'superscript' }).click();
    await delay(DELAY_IN_SECONDS.TWO);
    await page.getByRole('button', { name: 'superscript' }).click();
    await takeEditorScreenshot(page);
  });
  test('Text tool - Applying styles - Combination of styles', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-2260
    await selectLeftPanelButton(LeftPanelButton.AddText, page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByRole('dialog').getByRole('textbox').click();
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
    await takeEditorScreenshot(page);
  });
  test('Text tool - Save as .ket file', async ({ page }) => {
    // Test case: C
    await selectLeftPanelButton(LeftPanelButton.AddText, page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByRole('dialog').getByRole('textbox').click();
    await page.getByRole('dialog').getByRole('textbox').fill('TEST321');
    await pressButton(page, 'Apply');
    await page.getByText('TEST321').dblclick();
    await page.keyboard.press('Control+a');
    await page.getByRole('button', { name: '13' }).click();
    await page.getByText('20', { exact: true }).click();
    await delay(DELAY_IN_SECONDS.TWO);
    await page.getByRole('button', { name: 'bold' }).click();
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await page.getByLabel('File name:').click();
    await page.getByLabel('File name:').fill('ketfile01');
    await page.getByRole('button', { name: 'MDL Molfile V2000' }).click();
    await page.getByRole('option', { name: 'Ket Format' }).click();
    await page.getByRole('button', { name: 'Save', exact: true });
    await openFileAndAddToCanvas('ketfile01t', page);
    await takeEditorScreenshot(page);
  });

  test('Text tool - Cut/Copy/Paste', async ({ page }) => {
    // Test case: EPMLSOPKET-2272
    await selectLeftPanelButton(LeftPanelButton.AddText, page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByRole('dialog').getByRole('textbox').click();
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
    // await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await selectNestedTool(page, SelectTool.LASSO_SELECTION);
    await page.mouse.move(97, 79);
    await page.mouse.down();
    await page.mouse.move(943, 114);
    await page.mouse.move(844, 579);
    await page.mouse.move(66, 611);
    await page.mouse.up();
    await delay(DELAY_IN_SECONDS.TWO);
    await selectTopPanelButton(TopPanelButton.Cut, page);
    await page.keyboard.press('Control+v');
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await delay(DELAY_IN_SECONDS.TWO);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await takeEditorScreenshot(page);
  });
  test('Text tool - Selection of different types of text objects', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-2274
    await selectLeftPanelButton(LeftPanelButton.AddText, page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByRole('dialog').getByRole('textbox').click();
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
    await openFileAndAddToCanvas('longtext_test', page);
    await selectNestedTool(page, SelectTool.RectangleSelection);
    await page.mouse.move(97, 79);
    await page.mouse.down();
    await page.mouse.move(844, 579);
    await page.mouse.up();
    await takeEditorScreenshot(page);
  });

  test("Text tool - UTF-8 compatible ('Paste from Clipboard')", async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-5253
    await selectTopPanelButton(TopPanelButton.Open, page);
    // eslint-disable-next-line prettier/prettier
    await openPasteFromClipboard(page, FILE_TEST_DATA.utfFile);
    await pressButton(page, 'Add to Canvas');
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });
});
