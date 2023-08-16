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

  test('Floating icons are shown', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1685
      Description: Floating icon are shown, when structure is selected
    */
    const anyStructure = 'benzene-bond-fg.mol';
    await openFileAndAddToCanvas(anyStructure, page);
    await page.keyboard.press('Control+a');
    await page.getByTestId('floating-tools').isVisible();
    await takeEditorScreenshot(page);
  });

  test('Floating icons have tooltips', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1685
      Description: Floating icon have tooltips
    */
    const anyStructure = 'benzene-bond-fg.mol';
    await openFileAndAddToCanvas(anyStructure, page);
    await page.keyboard.press('Control+a');
    await page.getByTestId('floating-tools').isVisible();
    const icons = [
      {
        testId: 'transform-flip-h',
        title: 'Horizontal Flip (Alt+H)',
      },
      {
        testId: 'transform-flip-v',
        title: 'Vertical Flip (Alt+V)',
      },
      {
        testId: 'delete',
        title: 'Erase (Del)',
      },
    ];
    for (const icon of icons) {
      const iconButton = page.getByTestId(icon.testId);
      await expect(iconButton).toHaveAttribute('title', icon.title);
    }
  });
});
