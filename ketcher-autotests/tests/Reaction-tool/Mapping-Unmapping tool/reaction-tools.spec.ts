import { test } from '@playwright/test';
import {
  takeLeftToolbarScreenshot,
  LeftPanelButton,
  selectLeftPanelButton,
  waitForPageInit,
  openDropdown,
  takeEditorScreenshot,
} from '@utils';

test.describe('Reaction Tools', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeLeftToolbarScreenshot(page);
  });

  test('Icons for Plus Tool', async ({ page }) => {
    await selectLeftPanelButton(LeftPanelButton.ReactionPlusTool, page);
  });
});

test.describe('Reaction Tools', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Icons for Reaction Mapping tools', async ({ page }) => {
    await openDropdown(page, 'reaction-map');
  });

  test('Icons for Arrow Tools', async ({ page }) => {
    await openDropdown(page, 'reaction-arrow-open-angle');
  });
});
