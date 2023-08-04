import { test } from '@playwright/test';
import { takeEditorScreenshot } from '@utils/canvas';
import {
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
} from '@utils/clicks';

test.describe('draw and highlight line', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('drawing and highlighting', async ({ page }) => {
    // test case: EPMLSOPKET-16750
    await page.getByTitle('Shape Ellipse').click();
    await page.getByTitle('Shape Ellipse').click();
    await page.getByTestId('shape-line').click();

    await page
      .locator('svg')
      .filter({ hasText: 'Created with Raphaël 2.3.0' })
      .click();

    const moveTo = 500;
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + moveTo;
    await dragMouseTo(coordinatesWithShift, y, page);

    await page.keyboard.press('Control+a');
  });
});
