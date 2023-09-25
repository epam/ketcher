import { test } from '@playwright/test';
import {
  LeftPanelButton,
  selectLeftPanelButton,
  waitForPageInit,
  openDropdown,
  takeMultitoolDropdownScreenshot,
  takeLeftToolbarScreenshot,
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
    await takeMultitoolDropdownScreenshot(page);
  });

  test('Icons for Reaction Mapping tools', async ({ page }) => {
    await openDropdown(page, 'reaction-map');
  });

  test('Icons for Arrow Tools', async ({ page }) => {
    await openDropdown(page, 'reaction-arrow-open-angle');
  });
});
