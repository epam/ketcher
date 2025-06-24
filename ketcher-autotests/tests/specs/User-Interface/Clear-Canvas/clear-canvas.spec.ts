import { test, expect } from '@playwright/test';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import { selectRingButton } from '@tests/pages/molecules/BottomToolbar';
import {
  pressButton,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  clickInTheMiddleOfTheScreen,
  waitForPageInit,
  clearCanvasByKeyboard,
} from '@utils';
import { addTextBoxToCanvas } from '@utils/addTextBoxToCanvas';

test.describe('Clear canvas', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Clear Canvas - checking button tooltip', async ({ page }) => {
    // Test case: EPMLSOPKET-1702
    await CommonTopLeftToolbar(page).clearCanvas();
    const button = CommonTopLeftToolbar(page).clearCanvasButton;
    await expect(button).toHaveAttribute('title', 'Clear Canvas (Ctrl+Del)');
    await takeEditorScreenshot(page);
  });

  test('Clear Canvas - "Clear canvas" button', async ({ page }) => {
    // Test case: EPMLSOPKET-1702
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill('one two three');
    await pressButton(page, 'Apply');
    await CommonTopLeftToolbar(page).clearCanvas();
    await takeEditorScreenshot(page);
  });

  test('Clear Canvas - Undo/Redo', async ({ page }) => {
    // Test case: EPMLSOPKET-1704
    await openFileAndAddToCanvas(page, 'Rxn-V2000/reaction-dif-prop.rxn');
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).clearCanvas();
    await clickInTheMiddleOfTheScreen(page);
    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).redo();
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
  });

  test('Clear Canvas - Structure is opened from ket-file ', async ({
    page,
  }) => {
    // Test case:EPMLSOPKET-1705
    await openFileAndAddToCanvas(page, 'KET/ketcher.ket');
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Clear Canvas - Structure is opened from ket-file + hothey', async ({
    page,
  }) => {
    // Test case:EPMLSOPKET-1705
    // Checking clearing canvas with hotkey
    await openFileAndAddToCanvas(page, 'KET/ketcher.ket');
    await clearCanvasByKeyboard(page);
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
    await selectRingButton(page, RingButton.Benzene);
    await page.getByTestId('canvas').click({ position: { x, y } });
    await takeEditorScreenshot(page);
    await clearCanvasByKeyboard(page);
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/ketcher.mol');
    await takeEditorScreenshot(page);
    await clearCanvasByKeyboard(page);
    await takeEditorScreenshot(page);
  });

  test('Clear Canvas - Structure is opened from smile-string', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-1706
    await openFileAndAddToCanvas(page, 'SMILES/chain-with-r-group.smi');
    await clickInTheMiddleOfTheScreen(page);
    await CommonTopLeftToolbar(page).clearCanvas();
    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).clearCanvas();
    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).redo();
    await CommonTopLeftToolbar(page).redo();
    await takeEditorScreenshot(page);
  });
});
