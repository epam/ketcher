import { test, expect, Page } from '@fixtures';
import { ErrorMessageDialog } from '@tests/pages/common/ErrorMessageDialog';
import { getImageLocator } from '@utils/canvas/image/getImageLocator';
import {
  getDistanceFromImageTo as getDistance,
  getImageNodesFromKet as getKetImages,
} from '@utils/canvas/image/imagePosition';
import {
  PagePoint,
  clickOnCanvas,
  dragFileOutOfCanvas,
  dragFileOverCanvas,
  dropFileOnCanvas,
  getCanvasCenter,
  redoByKeyboard,
  undoByKeyboard,
  waitForRender,
} from '@utils';

const PNG_IMAGE = 'Images/image-png-demo.png';
const SVG_IMAGE = 'Images/image-svg-demo.svg';
const JPEG_IMAGE = 'Images/image-jpeg.jpeg';
const TOO_SMALL_PNG_IMAGE = 'Images/image-png-15px.png';
const TEXT_FILE = 'Txt/1837-inchi-1.txt';
const MOLFILE = 'Molfiles-V2000/Chiral.mol';

const TARGET_OFFSET: PagePoint = { x: 150, y: 100 };
const POSITION_TOLERANCE_IN_PIXELS = 10;

let page: Page;

const getDistanceFromImageTo = (point: PagePoint) => getDistance(page, point);

const getImageNodesFromKet = () => getKetImages(page);

const getTargetPoint = async (): Promise<PagePoint> => {
  const center = await getCanvasCenter(page);
  return { x: center.x + TARGET_OFFSET.x, y: center.y + TARGET_OFFSET.y };
};

const placeDroppedImage = async (point: PagePoint) => {
  await clickOnCanvas(page, point.x, point.y, { from: 'pageTopLeft' });
};

test.describe('Drag and drop images from outside Ketcher', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });

  test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Verify that a dropped PNG image appears under the drop position and sticks to the mouse pointer', async () => {
    /*
    Test case: #4913
    Description: After the drop the image is attached to the pointer and is not placed until a click
    */
    const dropPoint = await getCanvasCenter(page);
    const movedPoint = await getTargetPoint();

    await dropFileOnCanvas(page, PNG_IMAGE, dropPoint);

    await expect(getImageLocator(page, {})).toHaveCount(1);
    await expect
      .poll(() => getDistanceFromImageTo(dropPoint))
      .toBeLessThan(POSITION_TOLERANCE_IN_PIXELS);

    await waitForRender(page, async () => {
      await page.mouse.move(movedPoint.x, movedPoint.y);
    });
    await expect
      .poll(() => getDistanceFromImageTo(movedPoint))
      .toBeLessThan(POSITION_TOLERANCE_IN_PIXELS);
  });

  test('Verify that a dropped PNG image is placed on the canvas by a click under the mouse pointer', async () => {
    /*
    Test case: #4913
    Description: Click places the dropped image at the pointer position and it stays there
    */
    const placePoint = await getTargetPoint();
    await dropFileOnCanvas(page, PNG_IMAGE);

    await placeDroppedImage(placePoint);

    await expect(getImageLocator(page, {})).toHaveCount(1);
    const imageNodes = await getImageNodesFromKet();
    expect(imageNodes).toHaveLength(1);
    expect(imageNodes[0].format).toBe('image/png');

    await waitForRender(page, async () => {
      await page.mouse.move(placePoint.x - 200, placePoint.y - 150);
    });
    await expect
      .poll(() => getDistanceFromImageTo(placePoint))
      .toBeLessThan(POSITION_TOLERANCE_IN_PIXELS);
  });

  test('Verify that a dropped SVG image can be placed on the canvas', async () => {
    /*
    Test case: #4913
    Description: SVG images are supported by drag and drop as well as PNG
    */
    await dropFileOnCanvas(page, SVG_IMAGE);

    await placeDroppedImage(await getTargetPoint());

    await expect(getImageLocator(page, {})).toHaveCount(1);
    const imageNodes = await getImageNodesFromKet();
    expect(imageNodes).toHaveLength(1);
    expect(imageNodes[0].format).toBe('image/svg+xml');
  });

  test('Verify that placing a dropped image can be undone and redone', async () => {
    /*
    Test case: #4913
    Description: Undo removes the placed image, Redo returns it
    */
    await dropFileOnCanvas(page, PNG_IMAGE);
    await placeDroppedImage(await getTargetPoint());
    await expect(getImageLocator(page, {})).toHaveCount(1);

    await undoByKeyboard(page);
    await expect(getImageLocator(page, {})).toHaveCount(0);
    expect(await getImageNodesFromKet()).toHaveLength(0);

    await redoByKeyboard(page);
    await expect(getImageLocator(page, {})).toHaveCount(1);
    expect(await getImageNodesFromKet()).toHaveLength(1);
  });

  test('Verify that the drop highlight is shown while a file is dragged over the canvas and hidden when it leaves', async () => {
    /*
    Test case: #4913
    Description: "Drop image here" highlight follows the drag over the canvas
    */
    const highlight = page.getByTestId('image-drop-overlay');
    await expect(highlight).toBeHidden();

    await dragFileOverCanvas(page, PNG_IMAGE);
    await expect(highlight).toBeVisible();
    await expect(highlight).toHaveText('Drop image here');

    await dragFileOutOfCanvas(page, PNG_IMAGE);
    await expect(highlight).toBeHidden();
  });

  test('Verify that the drop highlight is hidden after the image is dropped', async () => {
    /*
    Test case: #4913
    Description: Highlight disappears on drop
    */
    await dropFileOnCanvas(page, PNG_IMAGE);

    await expect(page.getByTestId('image-drop-overlay')).toBeHidden();
  });

  test('Verify that the drop highlight is not shown for a file that is not an image', async () => {
    /*
    Test case: #4913
    Description: Only image files are highlighted as a drop target
    */
    await dragFileOverCanvas(page, TEXT_FILE);

    await expect(page.getByTestId('image-drop-overlay')).toBeHidden();
  });

  test('Verify that an image of an unsupported type is rejected with an error and nothing is added', async () => {
    /*
    Test case: #4913
    Description: JPEG is not supported, canvas stays empty
    */
    await dropFileOnCanvas(page, JPEG_IMAGE);

    expect(await ErrorMessageDialog(page).getErrorMessage()).toContain(
      'Unsupported image type',
    );
    await ErrorMessageDialog(page).close();
    await expect(getImageLocator(page, {})).toHaveCount(0);
    expect(await getImageNodesFromKet()).toHaveLength(0);
  });

  test('Verify that an image smaller than 16x16 pixels is rejected with an error and nothing is added', async () => {
    /*
    Test case: #4913
    Description: Too small images are not accepted, canvas stays empty
    */
    await dropFileOnCanvas(page, TOO_SMALL_PNG_IMAGE);

    expect(await ErrorMessageDialog(page).getErrorMessage()).toContain(
      'Image should be at least 16x16 pixels',
    );
    await ErrorMessageDialog(page).close();
    await expect(getImageLocator(page, {})).toHaveCount(0);
    expect(await getImageNodesFromKet()).toHaveLength(0);
  });

  test('Verify that a file that is not an image is ignored without an error', async () => {
    /*
    Test case: #4913
    Description: Dropping a molfile does not add anything and does not show an error
    */
    await dropFileOnCanvas(page, MOLFILE);

    await expect(ErrorMessageDialog(page).window).toBeHidden();
    await expect(getImageLocator(page, {})).toHaveCount(0);
  });
});
