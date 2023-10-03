import { Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  selectLeftPanelButton,
  selectTopPanelButton,
  delay,
  waitForPageInit,
  pressButton,
  LeftPanelButton,
  TopPanelButton,
  DELAY_IN_SECONDS,
  openFileAndAddToCanvas,
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  selectRing,
  RingButton,
  selectDropdownTool,
  selectNestedTool,
  SelectTool,
  resetCurrentTool,
} from '@utils';
import { addTextBoxToCanvas } from '@utils/selectors/addTextBoxToCanvas';

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

async function createSomeMovement(page: Page) {
  const i = 656;
  const j = 359;
  const k = 906;
  const l = 245;
  await page.mouse.move(i, j);
  await page.mouse.down();
  await dragMouseTo(k, l, page);
  await page.mouse.up();
}

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
  test('Text tool - Delete created text object with Selection Tool and "Delete" button on a keyboard', async ({
    page,
  }) => {
    await openFileAndAddToCanvas('KET/text-object-for-test.ket', page);
    await selectDropdownTool(page, 'select-rectangle', 'select-lasso');
    await page.getByText('TEXT').hover();
    await page.getByText('TEXT').click();
    await page.keyboard.press('Delete');
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
  });

  // Delete created text object in the text editor field
  test('Text tool - Delete created text object in the text editor field', async ({
    page,
  }) => {
    await openFileAndAddToCanvas('KET/test-text-object.ket', page);
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
    await page.getByTestId('text').click();
    await clickInTheMiddleOfTheScreen(page);
    await page.getByRole('dialog').getByRole('textbox').click();
    await clickInTheMiddleOfTheScreen(page);
    const pasteText =
      'Ketcher is a tool to draw molecular structures and chemical reactions';
    await page.getByRole('dialog').getByRole('textbox').fill(pasteText);
    await pressButton(page, 'Apply');
  });

  test('Text tool - Create several text objects and modifited them', async ({
    page,
  }) => {
    const x = 150;
    const y = 145;
    // Test case: EPMLSOPKET-2231 & EPMLSOPKET-2232
    // Checking if possible is created few text object and modify them
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill('&&&');
    await pressButton(page, 'Cancel');
    await clickInTheMiddleOfTheScreen(page);
    await page.getByRole('dialog').getByRole('textbox').fill('+++');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await page.getByTestId('canvas').click({ position: { x, y } });
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

  test('Text tool - Delete with Erase tool', async ({ page }) => {
    await openFileAndAddToCanvas('KET/two-different-text-objects.ket', page);
    await selectLeftPanelButton(LeftPanelButton.Erase, page);
    await page.getByText('&&&').hover();
    await page.getByText('&&&').click();
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
  });

  test('Text tool - Delete with and Lasso Selection Tool and "Delete" button on a keyboard', async ({
    page,
  }) => {
    const text2 = 'Ketcher is a cool tool';
    await openFileAndAddToCanvas('KET/two-different-text-objects.ket', page);
    await selectDropdownTool(page, 'select-rectangle', 'select-lasso');
    await page.getByText(text2).hover();
    await page.getByText(text2).click();
    await page.keyboard.press('Delete');
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await delay(DELAY_IN_SECONDS.TWO);
    await selectTopPanelButton(TopPanelButton.Undo, page);
  });

  test('Text tool - Delete two objects with Erase and Lasso Selection Tool and "Delete" button on a keyboard', async ({
    page,
  }) => {
    await openFileAndAddToCanvas('KET/two-different-text-objects.ket', page);
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('Control+a');
    await page.getByTestId('erase').click();
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await takeEditorScreenshot(page);
    await selectDropdownTool(page, 'select-rectangle', 'select-lasso');
    await createSomeStructure(page);
    await page.keyboard.press('Delete');
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
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
    await page.keyboard.press('Control+a');
    await page.getByText(text3).hover();
    await createSomeMovement(page);
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
    // await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    // await selectNestedTool(page, SelectTool.FRAGMENT_SELECTION);
    // await page.getByText(text4).hover();
    await page.keyboard.press('Control+a');
    await page.getByText(text4).click();
    await createSomeMovement(page);
    await page.getByTestId('zoom-input').click();
    await page.getByText('Zoom in').click();
    await page.getByText('Zoom in').click();
    await page.getByText('Zoom out').click();
    await page.getByText('Zoom out').click();
  });

  test('Text tool - Selection of a text object and a structure', async ({
    page,
  }) => {
    const x = 500;
    const y = 250;
    // Test case: EPMLSOPKET-2236
    // Checking if all created and selected elements are moved together
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill('OneTwoThree');
    await pressButton(page, 'Apply');
    await selectRing(RingButton.Benzene, page);
    await page.getByTestId('canvas').click({ position: { x, y } });
    await takeEditorScreenshot(page);
    await selectDropdownTool(page, 'select-rectangle', 'select-lasso');
    await createSomeStructure(page);
    await createSomeMovement(page);
  });
});
