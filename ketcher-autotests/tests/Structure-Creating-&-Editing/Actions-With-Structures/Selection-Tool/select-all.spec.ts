import { test } from '@playwright/test';
import {
  copyAndPaste,
  cutAndPaste,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  LeftPanelButton,
  moveMouseToTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  selectAllStructuresOnCanvas,
  selectLeftPanelButton,
  takeEditorScreenshot,
} from '@utils';

test.describe('Select all', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Select all using hot-key - 1/4 move', async ({ page }) => {
    /*
        Test case: EPMLSOPKET-1337(1)
        Description: All objects on the canvas are selected
 */

    const offset = 100;

    await openFileAndAddToCanvas('Molfiles-V2000/three-structures.mol', page);
    await selectAllStructuresOnCanvas(page);
    await selectLeftPanelButton(LeftPanelButton.HandTool, page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await moveMouseToTheMiddleOfTheScreen(page);
    await dragMouseTo(x + offset, y + offset, page);
  });

  test('Select all using hot-key - 2/4 cut and paste', async ({ page }) => {
    /*
        Test case: EPMLSOPKET-1337(2)
        Description: All objects on the canvas are selected
    */
    const offset = 100;

    await openFileAndAddToCanvas('Molfiles-V2000/three-structures.mol', page);
    await selectAllStructuresOnCanvas(page);
    await cutAndPaste(page);
    await page.mouse.click(offset, offset);
  });

  test('Select all using hot-key - 3/4 copy and paste', async ({ page }) => {
    /*
          Test case: EPMLSOPKET-1337(3)
          Description: All objects on the canvas are selected
        */
    const offset = 100;

    await openFileAndAddToCanvas('Molfiles-V2000/three-structures.mol', page);
    await selectAllStructuresOnCanvas(page);
    await copyAndPaste(page);
    await page.mouse.click(offset, offset);
  });

  test('Select all using hot-key - 4/4 delete', async ({ page }) => {
    /*
          Test case: EPMLSOPKET-1337(4)
          Description: All objects on the canvas are selected
        */

    await openFileAndAddToCanvas('Molfiles-V2000/three-structures.mol', page);
    await selectAllStructuresOnCanvas(page);
    await selectLeftPanelButton(LeftPanelButton.HandTool, page);
    await page.keyboard.press('Delete');
  });
});
