import { test } from '@playwright/test';
import {
  selectTopPanelButton,
  takeEditorScreenshot,
  TopPanelButton,
} from '@utils';

test.describe('Templates - Template Library', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test.only('Template with chiral flag 0 with ignoreChiralFlag enabled/disabled', async ({
    page,
  }) => {
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page.getByText('Stereochemistry', { exact: true }).click();
    await page.getByLabel('Ignore the chiral flag').click();
    // await pressButton(page, 'Labels Only');
    // await page.getByRole('option', { name: color }).click();
    // await pressButton(page, 'Apply');
  });
});
