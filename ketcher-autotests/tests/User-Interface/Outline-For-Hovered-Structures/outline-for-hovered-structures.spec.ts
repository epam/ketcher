import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  getCoordinatesOfTheMiddleOfTheScreen,
} from '@utils';

// shift of coordinates relative to the center, for the hover of the entire structure:
const screenCenterShift = 50;

test.describe('Outline for hovered structures', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  /* Draw selection outline correctly for hovered structures:
   * related to GitHub issue: https://github.com/epam/ketcher/issues/2595
   */
  /* Arrangement by layers of structures from top to bottom:
		text, bond, outline of atoms, outline of bonds, selection of atoms (with hover), selection of bonds (with hover) */
  test('Should draw selection outline correctly for hovered structures', async ({
    page,
  }) => {
    await openFileAndAddToCanvas('Ket/benzene-ring-with-two-atoms.ket', page);

    await page.keyboard.press('Control+KeyA');
    await page.keyboard.down('Control');

    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);

    // mouse movement start coordinate to get the hover of the entire selected structure:
    await page.mouse.move(x, y);

    await page.mouse.move(x, y + screenCenterShift, { steps: 10 });

    await takeEditorScreenshot(page);
  });
});
