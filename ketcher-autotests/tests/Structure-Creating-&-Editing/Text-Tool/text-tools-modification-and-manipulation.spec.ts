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
  selectRing,
  RingButton,
  waitForPageInit,
  openFileAndAddToCanvas,
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

  test('Text tool - Modify the created text object', async ({ page }) => {
    // Test case: EPMLSOPKET-2228
    // Checking if possible is modify created text object by adding some extra symbols
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill('TEST');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await page.getByText('TEST').dblclick();
    await page.getByRole('dialog').getByRole('textbox').click();
    await page.getByRole('dialog').getByRole('textbox').fill('TEST123');
    await pressButton(page, 'Apply');
  });

  test('Text tool - Delete the created text object', async ({ page }) => {
    // Test case: EPMLSOPKET-2229
    // Delte created text object with Erase tool
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill('TEST');
    await pressButton(page, 'Apply');
    await selectLeftPanelButton(LeftPanelButton.Erase, page);
    await page.getByText('TEST').click();
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await delay(DELAY_IN_SECONDS.TWO);
    await selectTopPanelButton(TopPanelButton.Undo, page);
  });

  // Delete created text object with and Lasso Selection Tool and 'Delete' button on a keyboard
  test('Delete created text object with Selection Tool and "Delete" button on a keyboard', async ({
    page,
  }) => {
    await openFileAndAddToCanvas('KET/test-EPMLSOPKET-2229.ket', page);
    // await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await selectNestedTool(page, SelectTool.LASSO_SELECTION);
    await page.getByText('TEST').hover();
    await page.getByText('TEST').click();
    await page.keyboard.press('Delete');
    await delay(DELAY_IN_SECONDS.TWO);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await delay(DELAY_IN_SECONDS.TWO);
  });

  // Delete created text object in the text editor field
  test('Delete created text object in the text editor field', async ({
    page,
  }) => {
    await openFileAndAddToCanvas('KET/test-EPMLSOPKET-2229.ket', page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await page.getByText('TEST').dblclick();
    await pressButton(page, 'Cancel');
    await page.getByText('TEST').dblclick();
    await page.getByRole('dialog').getByText('TEST').dblclick();
    await page.keyboard.press('Delete');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
  });

  test('Text tool - Create a single text object by pasting text', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-2230
    // Checking if possible is create text object by pasting text
    await addTextBoxToCanvas(page);
    await page
      .getByRole('dialog')
      .getByRole('textbox')
      .fill(
        'Ketcher is a tool to draw molecular structures and chemical reactions',
      );
    await pressButton(page, 'Cancel');
    await takeEditorScreenshot(page);
    await page.getByTestId('text').click();
    await clickInTheMiddleOfTheScreen(page);
    await page.getByRole('dialog').getByRole('textbox').click();
    await clickInTheMiddleOfTheScreen(page);
    const paseText =
      'Ketcher is a tool to draw molecular structures and chemical reactions';
    await page.getByRole('dialog').getByRole('textbox').fill(paseText);
    await pressButton(page, 'Apply');
  });

  test('Text tool - Create several text objects and modifited them', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-2231 & EPMLSOPKET-2232
    // Checking if possible is created few text object and modify them
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill('&&&');
    await pressButton(page, 'Cancel');
    await clickInTheMiddleOfTheScreen(page);
    await page.getByRole('dialog').getByRole('textbox').fill('+++');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await page.getByTestId('canvas').click({ position: { x: 150, y: 145 } });
    await page.getByRole('dialog').getByRole('textbox').click();
    const text1 =
      'Ketcher is a tool to draw molecular structures and chemical reactions';
    await page.getByRole('dialog').getByRole('textbox').fill(text1);
    await pressButton(page, 'Apply');

    await page.getByText('+++').dblclick();
    await page.getByRole('dialog').getByRole('textbox').fill('+++123');
    await pressButton(page, 'Cancel');
    await page.getByText('+++').dblclick();
    await page.getByRole('dialog').getByRole('textbox').fill('+++123');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await page.getByText(text1).dblclick();
    await page.getByRole('dialog').getByRole('textbox').fill(`${text1}123`);
    await pressButton(page, 'Cancel');
    await page.getByText(text1).dblclick();
    await page.getByRole('dialog').getByRole('textbox').fill(`${text1}123`);
    await pressButton(page, 'Apply');
  });

  test('Text tool - Delete several created text objects', async ({ page }) => {
    // Test case: EPMLSOPKET-2233
    // Delete several created ealier text objects with hotkey (Delete) and  'Erase' tool.
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill('&&&');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await page.getByTestId('canvas').click({ position: { x: 100, y: 100 } });
    await page.getByRole('dialog').getByRole('textbox').click();
    const text2 = 'Ketcher is a coool tool';
    await page.getByRole('dialog').getByRole('textbox').fill(text2);
    await pressButton(page, 'Apply');
  });

  test('Delete with Erase tool', async ({ page }) => {
    await openFileAndAddToCanvas('KET/test-EPMLSOPKET-2233.ket', page);
    await selectLeftPanelButton(LeftPanelButton.Erase, page);
    await page.getByText('&&&').hover();
    await page.getByText('&&&').click();
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await delay(DELAY_IN_SECONDS.TWO);
    await selectTopPanelButton(TopPanelButton.Undo, page);
  });

  test('Delete with and Lasso Selection Tool and "Delete" button on a keyboard', async ({
    page,
  }) => {
    const text2 = 'Ketcher is a coool tool';
    await openFileAndAddToCanvas('KET/test-EPMLSOPKET-2233.ket', page);
    await selectNestedTool(page, SelectTool.LASSO_SELECTION);
    await page.getByText(text2).hover();
    await page.getByText(text2).click();
    await page.keyboard.press('Delete');
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await delay(DELAY_IN_SECONDS.TWO);
    await selectTopPanelButton(TopPanelButton.Undo, page);
  });

  test('Delete two objects with Erase and Lasso Selection Tool and "Delete" button on a keyboard', async ({
    page,
  }) => {
    await openFileAndAddToCanvas('KET/test-EPMLSOPKET-2233.ket', page);
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('Control+a');
    await page.getByTestId('erase').click();
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await delay(DELAY_IN_SECONDS.TWO);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await takeEditorScreenshot(page);
    await selectNestedTool(page, SelectTool.LASSO_SELECTION);
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
    await page.keyboard.press('Delete');
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await delay(DELAY_IN_SECONDS.TWO);
    await selectTopPanelButton(TopPanelButton.Undo, page);
  });

  test('Text tool - Manipulations with the created text object', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-2234
    // Checking if possible to modify created ealier text object and moving it with use Selection Tool
    await addTextBoxToCanvas(page);
    const text3 = 'Test123';
    await page.getByRole('dialog').getByRole('textbox').fill(text3);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await selectNestedTool(page, SelectTool.LASSO_SELECTION);
    await page.getByText(text3).hover();
    const i = 656;
    const j = 359;
    const k = 943;
    const l = 114;
    await page.mouse.move(i, j);
    await page.mouse.down();
    await page.mouse.move(k, l);
    await page.mouse.up();
  });

  test('Text tool - Manipulations with the another created text object', async ({
    page,
  }) => {
    // Checking if possible is perform different manipulations with text objects using different tools (zoom)
    await addTextBoxToCanvas(page);
    const text4 = 'ABC123';
    await page.getByRole('dialog').getByRole('textbox').fill(text4);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await selectNestedTool(page, SelectTool.FRAGMENT_SELECTION);
    await page.getByText(text4).hover();
    await page.getByText(text4).click();
    const m = 656;
    const n = 359;
    const o = 844;
    const p = 579;
    await page.mouse.move(m, n);
    await page.mouse.down();
    await page.mouse.move(o, p);
    await page.mouse.up();
    await page.getByTestId('zoom-input').click();
    await page.getByText('Zoom in').click();
    await page.getByText('Zoom in').click();
    await takeEditorScreenshot(page);
    await page.getByText('Zoom out').click();
    await page.getByText('Zoom out').click();
  });

  test('Text tool - Selection of a text object and a structure', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-2236
    // Checking if all created and selected elements are moved together
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill('OneTwoThree');
    await pressButton(page, 'Apply');
    await selectRing(RingButton.Benzene, page);
    await page.getByTestId('canvas').click({ position: { x: 500, y: 250 } });
    await takeEditorScreenshot(page);
    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await selectNestedTool(page, SelectTool.LASSO_SELECTION);
    const a = 97;
    const b = 79;
    const c = 943;
    const d = 114;
    const e = 844;
    const f = 579;
    const g = 66;
    const h = 611;
    const i = 656;
    const j = 359;
    const k = 906;
    const l = 245;
    await page.mouse.move(a, b);
    await page.mouse.down();
    await page.mouse.move(c, d);
    await page.mouse.move(e, f);
    await page.mouse.move(g, h);
    await page.mouse.up();
    await page.mouse.move(i, j);
    await page.mouse.down();
    await dragMouseTo(k, l, page);
    await page.mouse.up();
  });

  // test('Text tool - Restore Down the window', async ({ page }) => {
  // Test case: EPMLSOPKET-2237
  //   await clickInTheMiddleOfTheScreen(page);
  //   await page.keyboard.press('F11');
  //   await delay(DELAY_IN_SECONDS.TWO);
  //   await page.getByTestId('text').focus();
  //   await page.getByTestId('text').hover();
  //   await takeEditorScreenshot(page);
  //   await delay(DELAY_IN_SECONDS.TWO);
  //   await page.keyboard.press('F11');
  // });
});
