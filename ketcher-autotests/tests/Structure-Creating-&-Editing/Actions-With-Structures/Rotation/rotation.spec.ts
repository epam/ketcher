import { test } from '@playwright/test';
import {
  selectAllStructuresOnCanvas,
  selectRotationTool,
  takeEditorScreenshot,
} from '@utils/canvas';
import { openFileAndAddToCanvas } from '@utils/files';

test.describe('Rotation', () => {
  const MOUSE_COORDS = {
    x: 20,
    y: 160,
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await openFileAndAddToCanvas('benzene-bromobutane-reaction.rxn', page);
    await selectAllStructuresOnCanvas(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Cancel rotation on right click', async ({ page }) => {
    const editor = await page.locator('[class*="App-module_canvas"]');

    // 1. take snapshot of current structure in editor
    const snapshotBeforeRotation = await editor.screenshot();

    // 2. select rotation tool
    await selectRotationTool(page);

    // 3. hold left mouse button, mouse move
    await page.mouse.down();
    await page.mouse.move(MOUSE_COORDS.x, MOUSE_COORDS.y);

    // 4. right click
    await page.mouse.click(MOUSE_COORDS.x, MOUSE_COORDS.y, { button: 'right' });

    // 5. get current structure on canvas
    const snapshotAfterRotation = await editor.screenshot();

    // 6. compare with snapshot on step 1
    expect(snapshotBeforeRotation).toMatchScreenshot(snapshotAfterRotation);
  });
});
