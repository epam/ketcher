import { expect, test } from '@playwright/test';
import {
  getEditorScreenshot,
  drawBenzeneRing,
  selectSingleBondTool,
} from '@utils';
import { getRotationHandleCoordinates } from '@utils/clicks/selectButtonByTitle';

test.describe('Rotation', () => {
  const MOUSE_COORDS = {
    x: 20,
    y: 160,
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await drawBenzeneRing(page);
    await selectSingleBondTool(page);
  });

  test('Cancel rotation on right click', async ({ page }) => {
    const snapshotBeforeRotation = await getEditorScreenshot(page);

    const coordinates = await getRotationHandleCoordinates(page);

    const { x, y } = coordinates;

    await page.mouse.click(x, y);

    await page.mouse.move(MOUSE_COORDS.x, MOUSE_COORDS.y);

    await page.mouse.click(MOUSE_COORDS.x, MOUSE_COORDS.y, { button: 'right' });

    const snapshotAfterRotation = await getEditorScreenshot(page);

    expect(snapshotBeforeRotation).toEqual(snapshotAfterRotation);
  });
});
