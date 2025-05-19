import { test } from '@playwright/test';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import {
  waitForPageInit,
  takeMultitoolDropdownScreenshot,
  takeLeftToolbarScreenshot,
} from '@utils';

test.describe('Reaction Tools', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Icons for Plus Tool', async ({ page }) => {
    await LeftToolbar(page).reactionPlusTool();
    await takeLeftToolbarScreenshot(page);
  });
});

test.describe('Reaction Tools', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Icons for Reaction Mapping tools', async ({ page }) => {
    await LeftToolbar(page).expandReactionMappingToolsDropdown();
    await takeMultitoolDropdownScreenshot(page);
  });

  test('Icons for Arrow Tools', async ({ page }) => {
    await LeftToolbar(page).expandArrowToolsDropdown();
    await takeMultitoolDropdownScreenshot(page);
  });
});
