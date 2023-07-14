import { expect, test } from '@playwright/test';
import { openFileAndAddToCanvas, takeEditorScreenshot } from '@utils';
import { getRotationHandleCoordinates } from '@utils/clicks/selectButtonByTitle';

test.describe('Rotation', () => {
  const COORDINATES_TO_PERFORM_ROTATION = {
    x: 20,
    y: 160,
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test('Cancel rotation on right click', async ({ page }) => {
    await openFileAndAddToCanvas('mol_1855_to_open.mol', page);
    await page.keyboard.press('Control+a');
    const screenBeforeRotation = await takeEditorScreenshot(page);
    const coordinates = await getRotationHandleCoordinates(page);
    const { x: rotationHandleX, y: rotationHandleY } = coordinates;

    await page.mouse.move(rotationHandleX, rotationHandleY);
    await page.mouse.down();
    await page.mouse.move(
      COORDINATES_TO_PERFORM_ROTATION.x,
      COORDINATES_TO_PERFORM_ROTATION.y,
    );
    await page.mouse.click(
      COORDINATES_TO_PERFORM_ROTATION.x,
      COORDINATES_TO_PERFORM_ROTATION.y,
      { button: 'right' },
    );

    const screenAfterRotation = await takeEditorScreenshot(page);
    expect(screenAfterRotation).toEqual(screenBeforeRotation);
  });
});
