import { test, expect } from '@playwright/test';
import {
  pressButton,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  TopPanelButton,
  selectRing,
  RingButton,
  clickInTheMiddleOfTheScreen,
  selectTopPanelButton,
  waitForPageInit,
  waitForRender,
  selectClearCanvasTool,
} from '@utils';
import { addTextBoxToCanvas } from '@utils/addTextBoxToCanvas';
import {
  pressRedoButton,
  pressUndoButton,
} from '@utils/macromolecules/topToolBar';

test.describe('Clear canvas', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Clear Canvas - checking button tooltip', async ({ page }) => {
    // Test case: EPMLSOPKET-1702
    await selectTopPanelButton(TopPanelButton.Clear, page);
    const button = page.getByTestId('clear-canvas');
    await expect(button).toHaveAttribute('title', 'Clear Canvas (Ctrl+Del)');
    await takeEditorScreenshot(page);
  });

  test('Clear Canvas - "Clear canvas" button', async ({ page }) => {
    // Test case: EPMLSOPKET-1702
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill('one two three');
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Clear, page);
    await takeEditorScreenshot(page);
  });

  test('Clear Canvas - Undo/Redo', async ({ page }) => {
    // Test case: EPMLSOPKET-1704
    await openFileAndAddToCanvas('Rxn-V2000/reaction-dif-prop.rxn', page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Clear, page);
    await clickInTheMiddleOfTheScreen(page);
    await waitForRender(page, async () => {
      await pressUndoButton(page);
      await pressRedoButton(page);
      await pressUndoButton(page);
    });
    await takeEditorScreenshot(page);
  });

  test('Clear Canvas - Structure is opened from ket-file ', async ({
    page,
  }) => {
    // Test case:EPMLSOPKET-1705
    await openFileAndAddToCanvas('KET/ketcher.ket', page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Clear Canvas - Structure is opened from ket-file + hothey', async ({
    page,
  }) => {
    // Test case:EPMLSOPKET-1705
    // Checking clearing canvas with hotkey
    await openFileAndAddToCanvas('KET/ketcher.ket', page);
    await selectClearCanvasTool(page);
    await takeEditorScreenshot(page);
  });

  test('Clear Canvas - Hotkeys', async ({ page }) => {
    // Test case:EPMLSOPKET-2864
    const x = 500;
    const y = 250;
    await addTextBoxToCanvas(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByRole('dialog').getByRole('textbox').fill('one two three');
    await pressButton(page, 'Apply');
    await selectRing(RingButton.Benzene, page);
    await page.getByTestId('canvas').click({ position: { x, y } });
    await takeEditorScreenshot(page);
    await selectClearCanvasTool(page);
    await openFileAndAddToCanvas('Molfiles-V2000/ketcher.mol', page);
    await takeEditorScreenshot(page);
    await selectClearCanvasTool(page);
    await takeEditorScreenshot(page);
  });

  test('Clear Canvas - Structure is opened from smile-string', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-1706
    await openFileAndAddToCanvas('SMILES/chain-with-r-group.smi', page);
    await clickInTheMiddleOfTheScreen(page);
    await selectTopPanelButton(TopPanelButton.Clear, page);
    await pressUndoButton(page);
    await selectClearCanvasTool(page);
    await pressUndoButton(page);
    await pressUndoButton(page);
    await pressRedoButton(page);
    await pressRedoButton(page);
    await takeEditorScreenshot(page);
  });
});
