import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  selectTopPanelButton,
  delay,
} from '@utils/canvas';
import { clickInTheMiddleOfTheScreen, pressButton } from '@utils/clicks';
import { waitForPageInit } from '@utils/common';
import { openFileAndAddToCanvas } from '@utils/files';
import { DELAY_IN_SECONDS } from '@utils/globals';
import { RingButton, TopPanelButton, selectRing } from '@utils/selectors';
import { addTextBoxToCanvas } from '@utils/selectors/addTextBoxToCanvas';

test.describe('Clear canvas', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Clear Canvas - "Clear canvas" button', async ({ page }) => {
    // Test case:EPMLSOPKET-1702
    // Checking apperance of the tooltip and deleting object with Clear canvas button
    // await selectTopPanelButton(TopPanelButton.Clear, page);
    await page.getByRole('button', { name: 'Clear Canvas (Ctrl+Del)' }).hover();
    await page.getByTitle('Clear Canvas (Ctrl+Del)').click();
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill('12345');
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Clear, page);
    await takeEditorScreenshot(page);
  });

  test('Clear Canvas - Undo/Redo', async ({ page }) => {
    // Test case: EPMLSOPKET-1704
    // Checking deleting object with Clear canvas button with funcion of Undo/Redo buttons
    await openFileAndAddToCanvas('reaction-dif-prop.rxn', page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Clear, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await takeEditorScreenshot(page);
  });

  test('Clear Canvas - Structure is opened from ket-file', async ({ page }) => {
    // Test case:EPMLSOPKET-1705
    // Checking deleting object with Clear canvas button with funcion of hotkyes (Ctrl+ Del)
    await openFileAndAddToCanvas('ketcher.ket', page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Clear, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await page.keyboard.press('Control+Delete');
    await takeEditorScreenshot(page);
  });

  test('Clear Canvas - Hotkeys', async ({ page }) => {
    // Test case:EPMLSOPKET-2864
    // Checking deleting object with Clear canvas button with funcion of hotkyes (Ctrl+ Del)
    await addTextBoxToCanvas(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByRole('dialog').getByRole('textbox').fill('12345');
    await pressButton(page, 'Apply');
    await selectRing(RingButton.Benzene, page);
    await page.getByTestId('canvas').click({ position: { x: 500, y: 250 } });
    await delay(DELAY_IN_SECONDS.TWO);
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+Delete');
    await openFileAndAddToCanvas('ketcher.mol', page);
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+Delete');
    await takeEditorScreenshot(page);
  });

  test('Clear Canvas - Structure is opened from smile-string', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-1706
    // Checking deleting object with Clear canvas button with funcion of hotkyes (Ctrl+ Del) andf Undo/Redo button
    await openFileAndAddToCanvas('chain-with-r-group.smi', page);
    await clickInTheMiddleOfTheScreen(page);
    await selectTopPanelButton(TopPanelButton.Clear, page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await page.keyboard.press('Control+Delete');
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await takeEditorScreenshot(page);
  });

  // test('Clear Canvas - Pressing Clear Canvas with Reaction Arrow under mouse cursor not causes errors in DevTool console', async ({
  //   page,
  // }) => {
  // Test case: EPMLSOPKET-16456
  // Checking  if pressing Clear Canvas with Reaction Arrow under mouse cursor not causes errors in DevTool console
  // await selectLeftPanelButton(LeftPanelButton.ArrowOpenAngleTool, page);
  // await clickInTheMiddleOfTheScreen(page);
  // await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
  // await clickInTheMiddleOfTheScreen(page);
  // await page.keyboard.press('Control+c');
  // await page.keyboard.press('Control+v');
  // await page.getByTestId('canvas').click({ position: { x: 500, y: 250 } });
  // await takeEditorScreenshot(page);
  // await selectTopPanelButton(TopPanelButton.Clear, page);
  // await takeEditorScreenshot(page);
  // });
});
