import { test, expect, Page } from '@fixtures';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { ErrorMessageDialog } from '@tests/pages/common/ErrorMessageDialog';
import { MoleculesTopToolbar } from '@tests/pages/molecules/MoleculesTopToolbar';
import { getImageLocator } from '@utils/canvas/image/getImageLocator';
import {
  ImagePoint,
  getDistanceFromImageTo,
  getImageNodesFromKet,
} from '@utils/canvas/image/imagePosition';
import {
  copyToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  redoByKeyboard,
  selectAllStructuresOnCanvas,
  undoByKeyboard,
} from '@utils/canvas';
import {
  clickOnCanvas,
  getCanvasCenter,
  getKet,
  openFileAndAddToCanvasAsNewProject,
  openImageAndAddToCanvas,
  pasteFileFromClipboardEvent,
  putImageOnClipboard,
  waitForRender,
} from '@utils';

const PNG_IMAGE = 'Images/image-png-demo.png';
const SVG_IMAGE = 'Images/image-svg-demo.svg';
const JPEG_IMAGE = 'Images/image-jpeg.jpeg';
const STRUCTURE_FILE = 'Molfiles-V2000/Chiral.mol';
const SMILES_TEXT = 'CC';

const TARGET_OFFSET: ImagePoint = { x: 150, y: 100 };
const POSITION_TOLERANCE_IN_PIXELS = 10;

let page: Page;

const getTargetPoint = async (): Promise<ImagePoint> => {
  const center = await getCanvasCenter(page);
  return { x: center.x + TARGET_OFFSET.x, y: center.y + TARGET_OFFSET.y };
};

const moveMouseTo = async (point: ImagePoint) => {
  await waitForRender(page, async () => {
    await page.mouse.move(point.x, point.y);
  });
};

const placePastedContent = async (point: ImagePoint) => {
  await clickOnCanvas(page, point.x, point.y, { from: 'pageTopLeft' });
};

const getNodesOfKet = async (): Promise<Array<{ type?: string }>> =>
  JSON.parse(await getKet(page)).root.nodes;

test.describe('Paste images from the clipboard', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });

  test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Verify that a PNG image on the clipboard is pasted and sticks to the mouse pointer', async () => {
    /*
    Test case: #4913
    Description: Ctrl+V attaches the image to the pointer, it is not placed until a click
    */
    const movedPoint = await getTargetPoint();
    await putImageOnClipboard(page, PNG_IMAGE);
    await moveMouseTo(await getCanvasCenter(page));

    await pasteFromClipboardByKeyboard(page);

    await expect(getImageLocator(page, {})).toHaveCount(1);
    await moveMouseTo(movedPoint);
    await expect
      .poll(() => getDistanceFromImageTo(page, movedPoint))
      .toBeLessThan(POSITION_TOLERANCE_IN_PIXELS);
  });

  test('Verify that a pasted PNG image is placed on the canvas by a click', async () => {
    /*
    Test case: #4913
    Description: Click places the pasted image at the pointer position and it stays there
    */
    const placePoint = await getTargetPoint();
    await putImageOnClipboard(page, PNG_IMAGE);
    await moveMouseTo(await getCanvasCenter(page));
    await pasteFromClipboardByKeyboard(page);
    await moveMouseTo(placePoint);

    await placePastedContent(placePoint);

    await expect(getImageLocator(page, {})).toHaveCount(1);
    const imageNodes = await getImageNodesFromKet(page);
    expect(imageNodes).toHaveLength(1);
    expect(imageNodes[0].format).toBe('image/png');

    await moveMouseTo({ x: placePoint.x - 200, y: placePoint.y - 150 });
    await expect
      .poll(() => getDistanceFromImageTo(page, placePoint))
      .toBeLessThan(POSITION_TOLERANCE_IN_PIXELS);
  });

  test('Verify that placing a pasted image can be undone and redone', async () => {
    /*
    Test case: #4913
    Description: Undo removes the pasted image, Redo returns it
    */
    await putImageOnClipboard(page, PNG_IMAGE);
    await pasteFromClipboardByKeyboard(page);
    await placePastedContent(await getTargetPoint());
    await expect(getImageLocator(page, {})).toHaveCount(1);

    await undoByKeyboard(page);
    await expect(getImageLocator(page, {})).toHaveCount(0);
    expect(await getImageNodesFromKet(page)).toHaveLength(0);

    await redoByKeyboard(page);
    await expect(getImageLocator(page, {})).toHaveCount(1);
    expect(await getImageNodesFromKet(page)).toHaveLength(1);
  });

  test('Verify that a picture made with Copy Image can be pasted back as an image', async () => {
    /*
    Test case: #4913
    Description: Copy Image puts a PNG on the clipboard, pasting it adds an image to the canvas
    */
    await openFileAndAddToCanvasAsNewProject(page, STRUCTURE_FILE);
    await selectAllStructuresOnCanvas(page);
    await MoleculesTopToolbar(page).copyAsImage();
    await CommonTopLeftToolbar(page).clearCanvas();

    await pasteFromClipboardByKeyboard(page);
    await placePastedContent(await getTargetPoint());

    await expect(getImageLocator(page, {})).toHaveCount(1);
    const imageNodes = await getImageNodesFromKet(page);
    expect(imageNodes).toHaveLength(1);
    expect(imageNodes[0].format).toBe('image/png');
  });

  test('Verify that an SVG image file on the clipboard is pasted', async () => {
    /*
    Test case: #4913
    Description: SVG files are supported as well as PNG
    */
    await pasteFileFromClipboardEvent(page, SVG_IMAGE);
    await placePastedContent(await getTargetPoint());

    await expect(getImageLocator(page, {})).toHaveCount(1);
    const imageNodes = await getImageNodesFromKet(page);
    expect(imageNodes).toHaveLength(1);
    expect(imageNodes[0].format).toBe('image/svg+xml');
  });

  test('Verify that an image file of an unsupported type on the clipboard is rejected with an error', async () => {
    /*
    Test case: #4913
    Description: JPEG is not supported, canvas stays empty
    */
    await pasteFileFromClipboardEvent(page, JPEG_IMAGE);

    expect(await ErrorMessageDialog(page).getErrorMessage()).toContain(
      'Unsupported image type',
    );
    await ErrorMessageDialog(page).close();
    await expect(getImageLocator(page, {})).toHaveCount(0);
    expect(await getImageNodesFromKet(page)).toHaveLength(0);
  });

  test('Verify that text next to an image on the clipboard is pasted as a structure', async () => {
    /*
    Test case: #4913
    Description: Structure text wins over a picture, as it did before images could be pasted
    */
    await putImageOnClipboard(page, PNG_IMAGE, SMILES_TEXT);

    await pasteFromClipboardByKeyboard(page);
    await placePastedContent(await getTargetPoint());

    await expect(getImageLocator(page, {})).toHaveCount(0);
    const nodes = await getNodesOfKet();
    expect(nodes.some((node) => node.type === 'image')).toBe(false);
    expect(nodes.length).toBeGreaterThan(0);
  });

  test('Verify that a placed image can be copied and pasted inside Ketcher', async () => {
    /*
    Test case: #4913
    Description: Copy and paste of a selected image adds a second image that follows the pointer
    */
    await openImageAndAddToCanvas(page, PNG_IMAGE);
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);

    await pasteFromClipboardByKeyboard(page);
    await placePastedContent(await getTargetPoint());

    await expect(getImageLocator(page, {})).toHaveCount(2);
    expect(await getImageNodesFromKet(page)).toHaveLength(2);
  });
});
