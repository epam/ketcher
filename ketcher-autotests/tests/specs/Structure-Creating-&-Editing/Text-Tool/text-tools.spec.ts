import { test, expect } from '@fixtures';
import {
  addTextBoxToCanvas,
  TextEditorDialog,
} from '@tests/pages/molecules/canvas/TextEditorDialog';
import { clickInTheMiddleOfTheScreen, takeEditorScreenshot } from '@utils';
import { waitForPageInit } from '@utils/common';

test.describe('Text tools test cases', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test(' Button and tooltip: verification', async ({ page }) => {
    // Test case: EPMLSOPKET-2225
    const button = page.getByTestId('text');
    await expect(button).toHaveAttribute('title', 'Add text (Alt+T)');
    await takeEditorScreenshot(page);
  });

  test('UI', async ({ page }) => {
    // Test case: EPMLSOPKET-2226
    // Verify if the text box displayed properly all elements
    await addTextBoxToCanvas(page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test(' Create a single text object', async ({ page }) => {
    // Test case: EPMLSOPKET-2227
    // Verify action of adding text object to canvas
    await addTextBoxToCanvas(page);
    await TextEditorDialog(page).setText('Ketcher');
    await TextEditorDialog(page).cancel();
    await takeEditorScreenshot(page);
    await addTextBoxToCanvas(page);
    await TextEditorDialog(page).setText('Ketcher');
    await TextEditorDialog(page).apply();
    await takeEditorScreenshot(page);
  });
});
