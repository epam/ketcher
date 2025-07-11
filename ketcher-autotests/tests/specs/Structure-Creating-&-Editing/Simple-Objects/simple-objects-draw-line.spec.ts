import { Page, test } from '@playwright/test';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { ShapeType } from '@tests/pages/constants/shapeSelectionTool/Constants';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { clickOnCanvas, openFileAndAddToCanvas, waitForPageInit } from '@utils';
import { takeEditorScreenshot } from '@utils/canvas';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import {
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
} from '@utils/clicks';

async function selectLineWithSelectionTool(page: Page) {
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

async function moveLineToNewPosition(page: Page) {
  const x = 759;
  const y = 183;
  await clickInTheMiddleOfTheScreen(page);
  await page.mouse.down();
  await dragMouseTo(x, y, page);
  await page.mouse.up();
}

async function separetingAndMovingLines(page: Page) {
  const point = { x: 296, y: 478 };
  const point1 = { x: 740, y: 393 };
  const point2 = { x: 529, y: 409 };
  const point3 = { x: 267, y: 518 };
  const point4 = { x: 534, y: 467 };
  const point5 = { x: 588, y: 277 };
  await clickOnCanvas(page, point.x, point.y);
  await dragMouseTo(point1.x, point1.y, page);
  await clickOnCanvas(page, point2.x, point2.y);
  await dragMouseTo(point3.x, point3.y, page);
  await takeEditorScreenshot(page);
  await clickInTheMiddleOfTheScreen(page);
  await CommonLeftToolbar(page).selectAreaSelectionTool(
    SelectionToolType.Lasso,
  );
  await selectLineWithSelectionTool(page);
  await clickOnCanvas(page, point4.x, point4.y);
  await dragMouseTo(point5.x, point5.y, page);
}

const setupLine = async (page: Page) => {
  await LeftToolbar(page).selectShapeTool(ShapeType.Line);
  const moveTo = 250;
  await clickInTheMiddleOfTheScreen(page);
  const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
  const LineCoordinates = { x: x + moveTo, y };
  await dragMouseTo(LineCoordinates.x, LineCoordinates.y, page);
  return LineCoordinates;
};

test.describe('draw and highlight line', () => {
  // Test case: EPMLSOPKET-16105
  // selecting 'Shape Line', drawing it on canvas, highlighting created line
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('drawing and highlighting', async ({ page }) => {
    // test case: EPMLSOPKET-16750
    await LeftToolbar(page).selectShapeTool(ShapeType.Line);

    const moveTo = 250;
    await clickInTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + moveTo;
    await dragMouseTo(coordinatesWithShift, y, page);

    await selectAllStructuresOnCanvas(page);
    await takeEditorScreenshot(page);
  });

  test('Simple Objects - Edit Line - Moving', async ({ page }) => {
    // Test case: EPMLSOPKET-1957
    // Moving the line on the canvas
    const point = { x: 686, y: 358 };
    const point1 = { x: 125, y: 161 };
    const LineCoordinates = await setupLine(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.mouse.move(LineCoordinates.x, LineCoordinates.y);
    await clickOnCanvas(page, point.x, point.y);
    await dragMouseTo(point1.x, point1.y, page);
    await takeEditorScreenshot(page);
  });

  test('Simple Objects - Edit Line - changing size', async ({ page }) => {
    // Test case: EPMLSOPKET-1957
    const point = { x: 251, y: 363 };
    const point1 = { x: 757, y: 362 };
    await setupLine(page);
    await selectAllStructuresOnCanvas(page);
    await dragMouseTo(point.x, point.y, page);
    await takeEditorScreenshot(page);
    await dragMouseTo(point1.x, point1.y, page);
    await takeEditorScreenshot(page);
  });

  test('Simple Objects - Edit Line - changing directions', async ({ page }) => {
    // Test case: EPMLSOPKET-1957
    const point = { x: 302, y: 510 };
    const point1 = { x: 397, y: 220 };
    await setupLine(page);
    await selectAllStructuresOnCanvas(page);
    await dragMouseTo(point.x, point.y, page);
    await takeEditorScreenshot(page);
    await dragMouseTo(point1.x, point1.y, page);
    await takeEditorScreenshot(page);
  });

  test('Simple Objects - Edit Line - highlighting and changing directions', async ({
    // Test case: EPMLSOPKET-16750
    page,
  }) => {
    await setupLine(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Lasso,
    );
    await selectLineWithSelectionTool(page);
    await takeEditorScreenshot(page);
    await moveLineToNewPosition(page);
    await takeEditorScreenshot(page);
  });

  test('Simple Objects - Draw a lot of lines - moving and separeting crossed lines', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-1958
    await openFileAndAddToCanvas(page, 'KET/lines-EPMLSOPKET-1958.ket');
    await separetingAndMovingLines(page);
    await takeEditorScreenshot(page);
  });
});
