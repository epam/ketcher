import { test } from '@playwright/test';
import {
  selectTopPanelButton,
  TopPanelButton,
  takeEditorScreenshot,
} from '@utils';

test.describe('Indigo Tools - Clean Tools', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test('Clean bonds lenght', async ({ page }) => {
    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);
  });
});
