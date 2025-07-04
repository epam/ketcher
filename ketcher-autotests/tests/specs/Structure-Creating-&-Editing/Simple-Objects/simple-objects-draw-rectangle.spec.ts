import { Page, test } from '@playwright/test';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { ShapeType } from '@tests/pages/constants/shapeSelectionTool/Constants';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { clickOnCanvas, openFileAndAddToCanvas, waitForPageInit } from '@utils';
import { takeEditorScreenshot } from '@utils/canvas/helpers';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import {
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
} from '@utils/clicks';

const rectangleWidth = 150;
const rectangleHeight = 100;

const setupRectangle = async (page: Page) => {
  await LeftToolbar(page).selectShapeTool(ShapeType.Rectangle);
  const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
  const rectangleCoordinates = {
    x: x + rectangleWidth,
    y: y + rectangleHeight,
  };
  await clickInTheMiddleOfTheScreen(page);
  await dragMouseTo(rectangleCoordinates.x, rectangleCoordinates.y, page);
  return rectangleCoordinates;
};

async function createSomeStructure(page: Page) {
  const point = { x: 97, y: 79 };
  const point1 = { x: 943, y: 114 };
  const point2 = { x: 844, y: 579 };
  const point3 = { x: 66, y: 611 };
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await page.mouse.move(point1.x, point1.y);
  await page.mouse.move(point2.x, point2.y);
  await page.mouse.move(point3.x, point3.y);
  await page.mouse.up();
}

async function resizeRectangle(page: Page) {
  const point = { x: 642, y: 357 };
  const point1 = { x: 276, y: 171 };
  const point2 = { x: 787, y: 462 };
  const point3 = { x: 880, y: 596 };
  const point4 = { x: 881, y: 174 };
  const point5 = { x: 584, y: 371 };
  await clickOnCanvas(page, point.x, point.y);
  await dragMouseTo(point1.x, point1.y, page);
  await clickOnCanvas(page, point2.x, point2.y);
  await await dragMouseTo(point3.x, point3.y, page);
  await clickOnCanvas(page, point4.x, point4.y);
  await await dragMouseTo(point5.x, point5.y, page);
  await clickInTheMiddleOfTheScreen(page);
}

async function separetingAndMovingRecatngles(page: Page) {
  const point = { x: 524, y: 306 };
  const point1 = { x: 421, y: 315 };
  const point2 = { x: 969, y: 386 };
  const point3 = { x: 817, y: 471 };
  const point4 = { x: 496, y: 280 };
  const point5 = { x: 194, y: 167 };
  await clickOnCanvas(page, point.x, point.y);
  await dragMouseTo(point1.x, point1.y, page);
  await clickOnCanvas(page, point2.x, point2.y);
  await dragMouseTo(point3.x, point3.y, page);
  await takeEditorScreenshot(page);
  await clickInTheMiddleOfTheScreen(page);
  await CommonLeftToolbar(page).selectAreaSelectionTool(
    SelectionToolType.Lasso,
  );
  await createSomeStructure(page);
  await clickOnCanvas(page, point4.x, point4.y);
  await page.mouse.down();
  await dragMouseTo(point5.x, point5.y, page);
}

test.describe('Draw Rectangle', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Simple Objects - Draw a Rectangle - draw and highlightt rectangle', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-1972

    const rectangleCoordinates = await setupRectangle(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.mouse.move(rectangleCoordinates.x, rectangleCoordinates.y);
    await takeEditorScreenshot(page);
  });

  test('Simple Objects - Edit the Rectangle - move object', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-1973
    const point = { x: 645, y: 367 };
    const point1 = { x: 759, y: 183 };
    await setupRectangle(page);
    await clickInTheMiddleOfTheScreen(page);
    await selectAllStructuresOnCanvas(page);
    await clickOnCanvas(page, point.x, point.y);
    await dragMouseTo(point1.x, point1.y, page);
    await takeEditorScreenshot(page);
  });

  test('Simple Object - Edit the Rectangle - changing size', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-1973
    const point = { x: 584, y: 371 };
    const point1 = { x: 830, y: 424 };
    await setupRectangle(page);
    await selectAllStructuresOnCanvas(page);
    await resizeRectangle(page);
    await createSomeStructure(page);
    await clickOnCanvas(page, point.x, point.y);
    await dragMouseTo(point1.x, point1.y, page);
    await takeEditorScreenshot(page);
  });

  test('Simple Objects - Draw a lot of rectangles - moving and separeting crossed lines', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-1958
    await openFileAndAddToCanvas(
      page,
      'KET/rectangle-test-EPMLSOPKET-1977.ket',
    );
    await separetingAndMovingRecatngles(page);
    await takeEditorScreenshot(page);
  });
});
