import { test } from '@playwright/test';
import { waitForPageInit } from '@utils';
import { takeEditorScreenshot } from '@utils/canvas';
import {
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  openDropdown,
} from '@utils/clicks';

test.describe('draw and highlight line', () => {
  // selecting 'Shape Line', drawing it on canvas, highlighting created line
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('drawing and highlighting', async ({ page }) => {
    // test case: EPMLSOPKET-16750
    await openDropdown(page, 'shape-ellipse');
    await page.getByTestId('shape-line').click();

    const moveTo = 250;
    await clickInTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + moveTo;
    await dragMouseTo(coordinatesWithShift, y, page);

    await page.keyboard.press('Control+a');
  });
});
