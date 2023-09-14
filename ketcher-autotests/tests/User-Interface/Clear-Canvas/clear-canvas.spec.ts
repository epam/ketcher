import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  selectTopPanelButton,
  delay,
  selectLeftPanelButton,
} from '@utils/canvas';
import { clickInTheMiddleOfTheScreen, pressButton } from '@utils/clicks';
import { openFileAndAddToCanvas } from '@utils/files';
import { DELAY_IN_SECONDS } from '@utils/globals';
import {
  LeftPanelButton,
  RingButton,
  TopPanelButton,
  selectRing,
} from '@utils/selectors';
import { addTextBoxToCanvas } from '@utils/selectors/addTextBoxToCanvas';

test.describe('Clear canvas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });
  test('Clear Canvas - "Clear canvas" button', async ({ page }) => {
    // Test case:EPMLSOPKET-1702
    await selectTopPanelButton(TopPanelButton.Clear, page);
    await page.getByRole('button', { name: 'Clear Canvas (Ctrl+Del)' }).hover();
    await delay(DELAY_IN_SECONDS.TWO);
    await page.getByTitle('Clear Canvas (Ctrl+Del)').click();
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill('12345');
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Clear, page);
    await takeEditorScreenshot(page);
  });
  test('Clear Canvas - Undo/Redo', async ({ page }) => {
    // Test case: EPMLSOPKET-1704
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
    await openFileAndAddToCanvas('chain-with-r-group.smi', page);
    await clickInTheMiddleOfTheScreen(page);
    await selectTopPanelButton(TopPanelButton.Clear, page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await page.keyboard.press('Control+Delete');
    await delay(DELAY_IN_SECONDS.TWO);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await takeEditorScreenshot(page);
  });
  test('Clear Canvas - Pressing Clear Canvas with Reaction Arrow under mouse cursor not causes errors in DevTool console', async ({
    page,
  }) => {
    // await page.keyboard.press('Control+Shift+j');
    await selectLeftPanelButton(LeftPanelButton.ArrowOpenAngleTool, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('Control+c');
    await page.keyboard.press('Control+v');
    await takeEditorScreenshot(page);
    await delay(DELAY_IN_SECONDS.TWO);
    await selectTopPanelButton(TopPanelButton.Clear, page);
    await takeEditorScreenshot(page);
  });
});
