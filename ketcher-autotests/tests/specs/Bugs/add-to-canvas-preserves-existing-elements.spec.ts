import { test } from '@fixtures';
import {
  waitForPageInit,
  takeEditorScreenshot,
  clickOnCanvas,
  readFileContent,
  pasteFromClipboardAndAddToCanvas,
} from '@utils';
import { drawBenzeneRing } from '@tests/pages/molecules/BottomToolbar';

test.describe('Add to Canvas - Preserve Existing Elements', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Existing elements on canvas should not be moved when adding new element from file', async ({
    page,
  }) => {
    /**
     * Test case: When using "Add to Canvas" to load a structure from a file,
     * the existing elements should not be moved to the new element position.
     * The new element should be centered initially, and the user can position it
     * by moving the mouse.
     */
    // Draw a benzene ring on the canvas
    await drawBenzeneRing(page);

    // Take screenshot of initial state with one benzene ring
    await takeEditorScreenshot(page);

    // Read benzene ring from file and add to canvas
    const benzeneFileContent = await readFileContent('KET/chain.ket');
    await pasteFromClipboardAndAddToCanvas(page, benzeneFileContent);

    // Move mouse away and click to place the pasted element
    await clickOnCanvas(page, 500, 300);

    // Take screenshot of final state with both elements
    await takeEditorScreenshot(page);
  });
});
