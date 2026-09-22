import { Page, Locator } from '@fixtures';
import { Monomer, PresetType } from '@utils/types';
import { Library } from '@tests/pages/macromolecules/Library';
import { getVisibleCanvas } from '@utils/canvas';
import { waitForRender } from '@utils/common/loaders/waitForRender';

/**
 * Utilities for the drag-and-drop monomer replacement feature (issue #7455):
 * dropping a library item onto an existing canvas monomer/preset replaces it.
 */

/** Canvas-relative coordinates of the center of a canvas element (e.g. a monomer). */
export async function getElementCenterInCanvasCoords(
  page: Page,
  target: Locator,
): Promise<{ x: number; y: number }> {
  const canvasBB = await (await getVisibleCanvas(page)).boundingBox();
  const targetBB = await target.boundingBox();
  if (!canvasBB || !targetBB) {
    throw new Error('Canvas or target bounding box is not available');
  }
  return {
    x: targetBB.x + targetBB.width / 2 - canvasBB.x,
    y: targetBB.y + targetBB.height / 2 - canvasBB.y,
  };
}

/**
 * Drags a library item (monomer or preset) and drops it on the center of an
 * existing canvas monomer. If the drop lands within the replacement radius
 * (10 px from the monomer center), the target is replaced by the library item.
 */
export async function dragLibraryItemOntoMonomer(
  page: Page,
  libraryItem: Monomer | PresetType,
  target: Locator,
) {
  const center = await getElementCenterInCanvasCoords(page, target);
  await Library(page).dragMonomerOnCanvas(libraryItem, center);
}

/**
 * Starts dragging a library item (hovers its card and presses the mouse
 * button) without releasing — use with `moveDragToCanvasCoords` +
 * `releaseDrag` / `cancelDrag` to assert mid-drag states.
 */
export async function startDragLibraryItem(
  page: Page,
  libraryItem: Monomer | PresetType,
) {
  await Library(page).hoverMonomer(libraryItem);
  await page.mouse.down();
}

/** Moves the in-progress drag to canvas-relative coordinates without releasing the mouse. */
export async function moveDragToCanvasCoords(
  page: Page,
  coords: { x: number; y: number },
) {
  const canvasBB = await (await getVisibleCanvas(page)).boundingBox();
  if (!canvasBB) {
    throw new Error('Canvas bounding box is not available');
  }
  await page.mouse.move(canvasBB.x + coords.x, canvasBB.y + coords.y);
}

/** Releases the in-progress drag at the current mouse position. */
export async function releaseDrag(page: Page) {
  await waitForRender(page, async () => {
    await page.mouse.up();
  });
}

/**
 * Moves over the monomer library (outside the canvas) and releases the mouse,
 * cancelling the drag without placing anything on the canvas.
 */
export async function cancelDrag(page: Page) {
  const libraryBB = await Library(page).libraryBody.boundingBox();
  if (!libraryBB) {
    throw new Error('Library bounding box is not available');
  }
  await page.mouse.move(
    libraryBB.x + libraryBB.width / 2,
    libraryBB.y + libraryBB.height / 2,
  );
  await waitForRender(page, async () => {
    await page.mouse.up();
  });
}
