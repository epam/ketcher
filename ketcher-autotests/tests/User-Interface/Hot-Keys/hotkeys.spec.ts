/* eslint-disable no-magic-numbers */
import { expect, test } from '@playwright/test';
import {
  waitForIndigoToLoad,
  selectNestedTool,
  SelectTool,
  selectTool,
  LeftPanelButton,
  clickInTheMiddleOfTheScreen,
} from '@utils';

test.describe('Hot keys', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await waitForIndigoToLoad(page);
  });

  test.afterEach(async ({ page }) => {
    await expect(page).toHaveScreenshot();
  });

  test('select last chosen selected tool when user press ESC', async ({
    page,
  }) => {
    await selectNestedTool(page, SelectTool.FRAGMENT_SELECTION);
    await selectTool(LeftPanelButton.AddText, page);
    await page.keyboard.press('Escape');
    expect(page.getByTestId('select-fragment')).toBeTruthy();
  });

  test('Shift+Tab to switch selection tool', async ({ page }) => {
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Shift+Tab');
    expect(page.getByTestId('select-fragment')).toBeTruthy();
  });
});
