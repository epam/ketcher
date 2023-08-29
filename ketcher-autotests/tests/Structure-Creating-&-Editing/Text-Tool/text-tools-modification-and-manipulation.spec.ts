import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  selectLeftPanelButton,
  selectTopPanelButton,
  selectAllStructuresOnCanvas,
} from '@utils/canvas';
import {
  pressButton,
  clickInTheMiddleOfTheScreen,
  clickOnTheCanvas,
} from '@utils/clicks';
import { TopPanelButton, LeftPanelButton, resetCurrentTool } from '@utils';

test.describe('Text tools test cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });
  test('Text tool - Modify the created text object', async ({ page }) => {
    // Test case: EPMLSOPKET-2228
    const textToolButton = await page.getByTestId('text').click();
    await clickInTheMiddleOfTheScreen(page);
    await page.getByRole('dialog').getByRole('textbox').click();
    await page.getByRole('dialog').getByRole('textbox').fill('TEST');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await page.getByText('TEST').dblclick();
    await page.getByRole('dialog').getByRole('textbox').click();
    await page.getByRole('dialog').getByRole('textbox').fill('TEST123');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Text tool - Delete the created text object', async ({ page }) => {
    // Test case: EPMLSOPKET-2229
    // Delte with Erase tool
    const textToolButton = await page.getByTestId('text').click();
    await clickInTheMiddleOfTheScreen(page);
    await page.getByRole('dialog').getByRole('textbox').click();
    await page.getByRole('dialog').getByRole('textbox').fill('TEST');
    await pressButton(page, 'Apply');
    await resetCurrentTool(page);
    await selectLeftPanelButton(LeftPanelButton.Erase, page);
    await page.getByText('TEST').hover();
    await takeEditorScreenshot(page);
    await resetCurrentTool(page);

    // Delete with and Lasso Selection Tool and 'Delete' button on a keyboard.
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await page.getByTitle('Rectangle Selection (Esc)').dblclick();
    // await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page).;
    await page.getByRole('button', { name: 'Lasso Selection (Esc)' }).click();
    // await page.getByTitle('Lasso Selection (Esc)').click();
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('Delete');
    await takeEditorScreenshot(page);
    await resetCurrentTool(page);

    // Delete in the in the text editor field
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await page.getByText('TEST').dblclick();
    await pressButton(page, 'Cancel');
    await page.getByText('TEST').dblclick();
    await page.getByText('TEST').click();
    await page.keyboard.press('Delete');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await takeEditorScreenshot(page);
  });

  test('Text tool - Create a single text object by pasting text', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-2230
    const textToolButton = await page.getByTestId('text').click();
    await clickInTheMiddleOfTheScreen(page);
    await page.getByRole('dialog').getByRole('textbox').click();
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
    await takeEditorScreenshot(page);
  });

  test('Text tool - Create several text objects and modifited them', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-2231 & EPMLSOPKET-2232
    const textToolButton = await page.getByTestId('text').click();
    await clickInTheMiddleOfTheScreen(page);
    await page.getByRole('dialog').getByRole('textbox').click();
    await page.getByRole('dialog').getByRole('textbox').fill('&&&');
    await pressButton(page, 'Cancel');
    await clickInTheMiddleOfTheScreen(page);
    await page.getByRole('dialog').getByRole('textbox').fill('+++');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await page.getByTestId('canvas').click({ position: { x: 23, y: 32 } });
    await page.getByRole('dialog').getByRole('textbox').click();
    const text1 =
      'Ketcher is a tool to draw molecular structures and chemical reactions';
    await page.getByRole('dialog').getByRole('textbox').fill(text1);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);

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
    await takeEditorScreenshot(page);
  });

  test('Text tool - Delete several created text objects', async ({ page }) => {
    // Test case: EPMLSOPKET-2233
    const textToolButton = await page.getByTestId('text').click();
    await clickInTheMiddleOfTheScreen(page);
    await page.getByRole('dialog').getByRole('textbox').click();
    await page.getByRole('dialog').getByRole('textbox').fill('&&&');
    await pressButton(page, 'Apply');
    // await takeEditorScreenshot(page);
    await page.getByTestId('canvas').click({ position: { x: 23, y: 32 } });
    await page.getByRole('dialog').getByRole('textbox').click();
    const text2 = 'Ketcher is a coool tool';
    await page.getByRole('dialog').getByRole('textbox').fill(text2);
    await pressButton(page, 'Apply');
    // await takeEditorScreenshot(page);
    // await resetCurrentTool(page);

    // // Delete with Erase tool
    // await selectLeftPanelButton(LeftPanelButton.Erase, page);
    // await page.getByText('&&&').hover();
    // await page.getByText('&&&').click();
    // await selectTopPanelButton(TopPanelButton.Undo, page);
    // await selectTopPanelButton(TopPanelButton.Redo, page);
    // await selectTopPanelButton(TopPanelButton.Undo, page);
    // // await takeEditorScreenshot(page);
    // // await resetCurrentTool(page);

    // // Delete with and Lasso Selection Tool and 'Delete' button on a keyboard.
    // await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    // await page.getByRole('button', { name: 'Lasso Selection (Esc)' }).click();
    // await page.getByTitle('Lasso Selection (Esc)').click();
    // await page.getByText(text2).hover();
    // await page.keyboard.press('Delete');
    // await selectTopPanelButton(TopPanelButton.Undo, page);
    // await selectTopPanelButton(TopPanelButton.Redo, page);
    // await selectTopPanelButton(TopPanelButton.Undo, page);
    // // await takeEditorScreenshot(page);

    await selectLeftPanelButton(LeftPanelButton.Erase, page);
    await selectAllStructuresOnCanvas(page).catch();
    // await page.getByText('&&&'+ text2).hover();
    // await page.getByText('&&&' + text2).click();
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    // await takeEditorScreenshot(page);
    // await resetCurrentTool(page);

    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await page.getByTitle('Lasso Selection (Esc)').click();
    await selectAllStructuresOnCanvas(page).catch();
    await page.keyboard.press('Delete');
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    // await takeEditorScreenshot(page);
    // await resetCurrentTool(page);
  });
  test('Text tool - Manipulations with the created text object', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-2234
    const textToolButton = await page.getByTestId('text').click();
    await clickInTheMiddleOfTheScreen(page);
    await page.getByRole('dialog').getByRole('textbox').click();
    const text3 = 'Test123';
    await page.getByRole('dialog').getByRole('textbox').fill(text3);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    // await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    // await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    // await page.getByTitle('Rectangle Selection (Esc)').dblclick();
    await page.getByRole('button', { name: 'Lasso Selection (Esc)' }).click();
    // await page.getByTitle('Lasso Selection (Esc)').click();
    await page.getByText(text3).hover();
    await page.getByText(text3).click({ position: { x: 23, y: 32 } });
    // await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await page.getByTestId('text').click();
    await clickInTheMiddleOfTheScreen(page);
    await page.getByRole('dialog').getByRole('textbox').click();
    const text4 = 'ABC123';
    await page.getByRole('dialog').getByRole('textbox').fill(text4);
    // await takeEditorScreenshot(page);
    await page.getByTitle('Rectangle Selection (Esc)').click();
    await page.getByText(text3 + text4).hover();
    await page.getByText(text3).click({ position: { x: 65, y: 75 } });
    await page.getByTestId('zoom-input').click();
    await page.getByText('Zoom in').click();
    await page.getByText('Zoom in').click();
    // await takeEditorScreenshot(page);
    await page.getByText('Zoom out').click();
    await page.getByText('Zoom out').click();
    // await takeEditorScreenshot(page);
  });
});
