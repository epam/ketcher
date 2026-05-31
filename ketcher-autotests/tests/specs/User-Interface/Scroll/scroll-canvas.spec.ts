import { test } from '@fixtures';
import { drawBenzeneRing } from '@tests/pages/molecules/BottomToolbar';
import { takeEditorScreenshot, waitForPageInit } from '@utils';

test.describe('Scroll canvas', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Scroll canvas by mouse wheel or touchpad/trackpad', async ({
    page,
  }) => {
    const deltaX = 1400;
    const deltaY = 750;
    await drawBenzeneRing(page);

    await page.mouse.wheel(deltaX, deltaY);
    await takeEditorScreenshot(page);
  });

  test('Scroll canvas horizontally with `Shift` pressed', async ({ page }) => {
    const wheelDelta = 100;
    await drawBenzeneRing(page);

    await page.keyboard.down('Shift');
    await page.mouse.wheel(0, wheelDelta);
    await page.keyboard.up('Shift');
    await takeEditorScreenshot(page);
  });
});
