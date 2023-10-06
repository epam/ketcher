import { test } from '@playwright/test';
import {
  openFileAndAddToCanvas,
  takeEditorScreenshot,
  selectAction,
  waitForPageInit,
} from '@utils';
import { TopPanelButton } from '@utils/selectors';

test.describe('Paste Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('InfoModal with hotkey display for Paste action', async ({ page }) => {
    const anyStructure = 'mol_1855_to_open.mol';
    await openFileAndAddToCanvas(anyStructure, page);
    await page.keyboard.press('Control+a');
    await selectAction(TopPanelButton.Copy, page);
    await selectAction(TopPanelButton.Paste, page);
    await page.getByTestId('infoModal-shortcut-for-paste').first().isVisible();
    await takeEditorScreenshot(page);
  });
});
