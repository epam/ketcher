import { test, expect } from '@playwright/test';
import {
  pressButton,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  DELAY_IN_SECONDS,
  TopPanelButton,
  selectRing,
  RingButton,
  clickInTheMiddleOfTheScreen,
  selectTopPanelButton,
  delay,
  waitForPageInit,
} from '@utils';
import { addTextBoxToCanvas } from '@utils/selectors/addTextBoxToCanvas';

test.describe('Clear canvas', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Clear Canvas - checking button tooltip', async ({ page }) => {
    // Test case: EPMLSOPKET-1702
    await selectTopPanelButton(TopPanelButton.Clear, page);
    const button = page.getByTestId('clear-canvas-button');
    await expect(button).toHaveAttribute('title', 'Clear Canvas (Ctrl+Del)');
  });

  test('Clear Canvas - "Clear canvas" button', async ({ page }) => {
    // Test case: EPMLSOPKET-1702
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill('one two three');
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Clear, page);
  });

  test('Clear Canvas - Undo/Redo', async ({ page }) => {
    // Test case: EPMLSOPKET-1704
    await openFileAndAddToCanvas('Rxn-V2000/reaction-dif-prop.rxn', page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Clear, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
  });

  test('Clear Canvas - Structure is opened from ket-file ', async ({
    page,
  }) => {
    // Test case:EPMLSOPKET-1705
    await openFileAndAddToCanvas('KET/ketcher.ket', page);
    await clickInTheMiddleOfTheScreen(page);
    await selectTopPanelButton(TopPanelButton.Clear, page);
  });

  test('Clear Canvas - Structure is opened from ket-file + hothey', async ({
    page,
  }) => {
    // Test case:EPMLSOPKET-1705
    // Checking clearing canvas with hotkey
    await openFileAndAddToCanvas('KET/ketcher.ket', page);
    await page.keyboard.press('Control+Delete');
  });

  test('Clear Canvas - Hotkeys', async ({ page }) => {
    // Test case:EPMLSOPKET-2864
    await addTextBoxToCanvas(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByRole('dialog').getByRole('textbox').fill('one two three');
    await pressButton(page, 'Apply');
    await selectRing(RingButton.Benzene, page);
    await page.getByTestId('canvas').click({ position: { x: 500, y: 250 } });
    await delay(DELAY_IN_SECONDS.TWO);
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+Delete');
    await openFileAndAddToCanvas('ketcher.mol', page);
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+Delete');
  });

  test('Clear Canvas - Structure is opened from smile-string', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-1706
    await openFileAndAddToCanvas('SMILES/chain-with-r-group.smi', page);
    await clickInTheMiddleOfTheScreen(page);
    await selectTopPanelButton(TopPanelButton.Clear, page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await page.keyboard.press('Control+Delete');
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
  });
});
