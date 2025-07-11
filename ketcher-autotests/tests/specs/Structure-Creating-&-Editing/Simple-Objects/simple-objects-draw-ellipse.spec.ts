import { Page, test } from '@playwright/test';
import { clickOnCanvas, openFileAndAddToCanvas, waitForPageInit } from '@utils';
import { takeEditorScreenshot } from '@utils/canvas/helpers';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import {
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
} from '@utils/clicks';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { ShapeType } from '@tests/pages/constants/shapeSelectionTool/Constants';

const ellipseWidth = 120;
const ellipseHeight = 100;

const setupEllipse = async (page: Page) => {
  await LeftToolbar(page).selectShapeTool(ShapeType.Ellipse);
  const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
  const ellipseCoordinates = { x: x + ellipseWidth, y: y + ellipseHeight };
  await clickInTheMiddleOfTheScreen(page);
  await dragMouseTo(ellipseCoordinates.x, ellipseCoordinates.y, page);
  return ellipseCoordinates;
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

async function separetingAndMovingEllipse(page: Page) {
  const point = { x: 665, y: 365 };
  const point1 = { x: 530, y: 344 };
  const point2 = { x: 850, y: 367 };
  const point3 = { x: 840, y: 262 };
  const point4 = { x: 509, y: 367 };
  const point5 = { x: 464, y: 239 };
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
test.describe('Draw Ellipse', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Simple Objects - Draw a Ellipse - draw and highlightt elllipse', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-1959
    const ellipseCoordinates = await setupEllipse(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.mouse.move(ellipseCoordinates.x, ellipseCoordinates.y);
    await takeEditorScreenshot(page);
  });

  test('Simple Objects - Edit a Ellipse  - moving object', async ({ page }) => {
    // Test case: EPMLSOPKET-1960
    const point = { x: 645, y: 367 };
    const point1 = { x: 759, y: 183 };
    await setupEllipse(page);
    await clickInTheMiddleOfTheScreen(page);
    await selectAllStructuresOnCanvas(page);
    await clickOnCanvas(page, point.x, point.y);
    await dragMouseTo(point1.x, point1.y, page);
    await takeEditorScreenshot(page);
  });

  test('Simple Objects - Edit a Ellipse  - changing sizes of the object', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-1960
    const point = { x: 332, y: 401 };
    const point1 = { x: 692, y: 410 };
    const point2 = { x: 690, y: 410 };
    const point3 = { x: 220, y: 200 };
    await setupEllipse(page);
    await clickInTheMiddleOfTheScreen(page);
    await dragMouseTo(point.x, point.y, page);
    await takeEditorScreenshot(page);
    await dragMouseTo(point1.x, point1.y, page);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Lasso,
    );
    await createSomeStructure(page);
    await page.mouse.move(point2.x, point2.y);
    await page.mouse.down();
    await dragMouseTo(point3.x, point3.y, page);
    await takeEditorScreenshot(page);
  });

  test('Simple Objects - Draw a lot of ellipses', async ({ page }) => {
    // Test case: EPMLSOPKET-1966
    // Separeting and moving few objects on canvas
    await openFileAndAddToCanvas(page, 'KET/ellipse-test-EPMLSOPKET-1966.ket');
    await separetingAndMovingEllipse(page);
    await takeEditorScreenshot(page);
  });
});
