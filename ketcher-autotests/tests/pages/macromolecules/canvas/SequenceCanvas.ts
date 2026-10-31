import { expect, Page } from '@playwright/test';

export const SequenceCanvas = (page: Page) => {
  const canvas = page
    .getByTestId('ketcher-canvas')
    .filter({ has: page.locator(':visible') });
  const caret = canvas.getByTestId('sequence-caret');

  return {
    canvas,
    caret,

    async expectCaretInViewport() {
      await expect(caret).toBeAttached();
      await expect
        .poll(async () => {
          const canvasBounds = await canvas.boundingBox();
          const caretBounds = await caret.evaluate((element) =>
            element.getBoundingClientRect().toJSON(),
          );
          if (!canvasBounds) {
            throw new Error('Sequence canvas has no bounding box');
          }
          return (
            caretBounds.y >= canvasBounds.y &&
            caretBounds.y + caretBounds.height <=
              canvasBounds.y + canvasBounds.height
          );
        })
        .toBe(true);
    },
  };
};
