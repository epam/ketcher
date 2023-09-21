import { test } from '@playwright/test';
import {
  BondType,
  drawBenzeneRing,
  moveMouseToTheMiddleOfTheScreen,
  moveOnBond,
  takeEditorScreenshot,
} from '@utils';

test.describe('Select all', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test('Megre preview of abbreviated structures', async ({ page }) => {
    // Test case: EPMLSOPKET-16913, 16914, 16915, 16916, 16917
    // benzene ring preview; 'Benzene' label disappearing; checking reduced opacity of merging structure, 'Benzene' label restoration
    // structure placing with normal opasity
    await drawBenzeneRing(page);
    await page.getByTestId('Benzene (T)').click;
    await moveOnBond(page, BondType.SINGLE, 0);
    await takeEditorScreenshot(page);
    await page.mouse.down();
    await page.mouse.up();
    await moveMouseToTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });
});
