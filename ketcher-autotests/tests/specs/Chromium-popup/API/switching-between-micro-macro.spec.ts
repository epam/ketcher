import { test } from '@fixtures';
import { Page } from '@playwright/test';
import { takePageScreenshot } from '@utils';

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
    await takePageScreenshot(page);
    await page.evaluate(() => window.ketcher.switchToMacromoleculesMode());
    await takePageScreenshot(page);
  });

  test('Case 2: Check that API ketcher.switchToMoleculesMode() switching from molecules mode to macromolecules', async ({
    SequenceCanvas: _,
  }) => {
    /*
     * Version 3.8
     * Test case: https://github.com/epam/ketcher/issues/7535
     * Description: API ketcher.switchToMoleculesMode() switching from molecules mode to macromolecules
     * Scenario:
     * 1. Add command through API
     */
    await takePageScreenshot(page);
    await page.evaluate(() => window.ketcher.switchToMoleculesMode());
    await takePageScreenshot(page);
  });
});
