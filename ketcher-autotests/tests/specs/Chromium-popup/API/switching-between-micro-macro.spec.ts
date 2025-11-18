import { test, expect } from '@fixtures';
import { Page } from '@playwright/test';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';

let page: Page;

test.describe('API for switching between modes', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1: Check that API ketcher.switchToMacromoleculesMode() switching from molecules mode to macromolecules', async () => {
    /*
     * Version 3.8
     * Test case: https://github.com/epam/ketcher/issues/7535
     * Description: API ketcher.switchToMacromoleculesMode() switching from molecules mode to macromolecules
     * Scenario:
     * 1. Add command through API
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await page.evaluate(() => window.ketcher.switchToMacromoleculesMode());
    const macroCanvas = page.locator('[data-canvasmode="macromolecules-mode"]');
    expect(macroCanvas).toBeVisible();
  });

  test('Case 2: Check that API ketcher.switchToMoleculesMode() switching from molecules mode to macromolecules', async () => {
    /*
     * Version 3.8
     * Test case: https://github.com/epam/ketcher/issues/7535
     * Description: API ketcher.switchToMoleculesMode() switching from molecules mode to macromolecules
     * Scenario:
     * 1. Add command through API
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await page.evaluate(() => window.ketcher.switchToMoleculesMode());
    const microCanvas = page.locator('[data-canvasmode="molecules-mode"]');
    expect(microCanvas).toBeVisible();
  });
});
