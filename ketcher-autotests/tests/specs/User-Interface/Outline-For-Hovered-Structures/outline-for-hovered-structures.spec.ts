import { test } from '@fixtures';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  getCoordinatesOfTheMiddleOfTheScreen,
  waitForPageInit,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';

// shift of coordinates relative to the center, for the hover of the entire structure:
const screenCenterShift = 50;

test.describe('Outline for hovered structures', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  /* Draw selection outline correctly for hovered structures:
   * related to GitHub issue: https://github.com/epam/ketcher/issues/2595
   */
  /* Arrangement by layers of structures from top to bottom:
		text, bond, outline of atoms, outline of bonds, selection of atoms (with hover), selection of bonds (with hover) */
  test('Should draw selection outline correctly for hovered structures', async ({
    page,
  }) => {
    await openFileAndAddToCanvas(page, 'KET/benzene-ring-with-two-atoms.ket');

    await selectAllStructuresOnCanvas(page);
    await page.keyboard.down('Alt');

    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);

    // mouse movement start coordinate to get the hover of the entire selected structure:
    await page.mouse.move(x, y);

    await page.mouse.move(x, y + screenCenterShift, { steps: 10 });

    await takeEditorScreenshot(page);
  });
});
