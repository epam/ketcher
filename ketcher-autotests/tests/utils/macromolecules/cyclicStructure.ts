import { expect, Page } from '@playwright/test';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { getVisibleCanvas, selectCanvasArea } from '../canvas/helpers';

// Creates a cyclic structure by selecting it with the rectangle on canvas

type CanvasAreaRatios = {
  startX: number;
  endX: number;
  startY: number;
  endY: number;
};

export async function selectAreaAndArrangeAsRing(
  page: Page,
  area: CanvasAreaRatios,
) {
  const canvas = await getVisibleCanvas(page);
  const canvasBox = await canvas.boundingBox();

  if (!canvasBox) {
    throw new Error('Unable to determine canvas bounds');
  }

  const { x, y, width, height } = canvasBox;

  await selectCanvasArea(
    page,
    {
      x: x + width * area.startX,
      y: y + height * area.startY,
    },
    {
      x: x + width * area.endX,
      y: y + height * area.endY,
    },
  );

  const toolbar = MacromoleculesTopToolbar(page);

  await expect(toolbar.arrangeAsARingButton).toBeEnabled();
  await toolbar.arrangeAsARing();
}
