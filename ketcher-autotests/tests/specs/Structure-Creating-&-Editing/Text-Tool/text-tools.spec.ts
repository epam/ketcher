import { test, expect } from '@fixtures';
import {
  addTextBoxToCanvas,
  TextEditorDialog,
} from '@tests/pages/molecules/canvas/TextEditorDialog';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import {
  clickInTheMiddleOfTheCanvas,
  openFileAndAddToCanvas,
  takeEditorScreenshot,
} from '@utils';
import { waitForPageInit } from '@utils/common';

test.describe('Text tools test cases', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test(' Button and tooltip: verification', async ({ page }) => {
    // Test case: EPMLSOPKET-2225
    const button = LeftToolbar(page).addTextButton;
    await expect(button).toHaveAttribute('title', 'Add text (Alt+T)');
    await takeEditorScreenshot(page);
  });

  test('UI', async ({ page }) => {
    // Test case: EPMLSOPKET-2226
    // Verify if the text box displayed properly all elements
    await addTextBoxToCanvas(page);
    await clickInTheMiddleOfTheCanvas(page);
    await takeEditorScreenshot(page);
  });

  test('Multi-line imported text hangs downward from anchor (#7043)', async ({
    page,
  }) => {
    await openFileAndAddToCanvas(
      page,
      'KET/huge-text-greater-than-viewport.ket',
    );

    const isCorrectlyPositioned = await page.evaluate(() => {
      const textElements = Array.from(
        document.querySelectorAll('[data-testid="text-label"]'),
      ) as SVGTextElement[];

      const hugeText = textElements.find((el) =>
        el.textContent?.includes('Huge'),
      );

      if (!hugeText) return false;

      const anchorY = Number(hugeText.getAttribute('y'));
      const bbox = hugeText.getBBox();
      const tspans = hugeText.querySelectorAll('tspan');
      const lineCount = tspans.length;
      const oneLineHeight =
        lineCount > 1 ? bbox.height / lineCount : bbox.height;

      const transformAttr = hugeText.getAttribute('transform') ?? '';
      const translateYMatch = transformAttr.match(
        /matrix\([^,]+,[^,]+,[^,]+,[^,]+,[^,]+,([^)]+)\)/,
      );
      const translateY = translateYMatch ? Number(translateYMatch[1]) : 0;
      const visualTopY = bbox.y + translateY;

      return visualTopY >= anchorY - oneLineHeight;
    });

    expect(isCorrectlyPositioned).toBe(true);
  });

  test(' Create a single text object', async ({ page }) => {
    // Test case: EPMLSOPKET-2227
    // Verify action of adding text object to canvas
    await addTextBoxToCanvas(page);
    await TextEditorDialog(page).setText('Ketcher');
    await TextEditorDialog(page).cancel();
    await takeEditorScreenshot(page);
    await addTextBoxToCanvas(page);
    await TextEditorDialog(page).setText('Ketcher');
    await TextEditorDialog(page).apply();
    await takeEditorScreenshot(page);
  });
});
