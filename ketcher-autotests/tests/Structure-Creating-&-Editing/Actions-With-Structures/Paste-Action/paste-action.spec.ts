import { test } from '@playwright/test';
import {
  openFileAndAddToCanvas,
  takeEditorScreenshot,
  selectAction,
} from '@utils';
import { TopPanelButton } from '@utils/selectors';

test.describe('Paste Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  const hotKey = 'CTRL/Cmd + V';

  test('InfoModal with hotkey display for Paste action', async ({ page }) => {
    await openFileAndAddToCanvas('mol_1855_to_open.mol', page);
    await page.keyboard.press('Control+a');
    await selectAction(TopPanelButton.Copy, page);
    await selectAction(TopPanelButton.Paste, page);
    await page.locator('div').filter({ hasText: hotKey }).first().isVisible();
    await takeEditorScreenshot(page);
  });
});
