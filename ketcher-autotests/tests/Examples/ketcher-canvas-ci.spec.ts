import { BondTypeName } from '@utils/canvas/selectBond';
import { test, expect } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  selectBond,
  takeEditorScreenshot,
  resetCurrentTool,
} from '@utils';

test.describe('Drawing atom, Benzene ring, Single and Double Bond', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('single bond tool', async ({ page }) => {
    /*
     *   Test case: EPMLSOPKET-1371
     */

    await selectBond(BondTypeName.Single, page);

    await clickInTheMiddleOfTheScreen(page);
  });

  test('calculation', () => {
    expect(1 + 1).toBe(2);
  });
});
