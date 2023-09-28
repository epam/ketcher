import { Page, test } from '@playwright/test';
import { openFileAndAddToCanvas, waitForPageInit } from '@utils';
import { takeEditorScreenshot } from '@utils/canvas';
import {
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  openDropdown,
  selectDropdownTool,
} from '@utils/clicks';

const rectangleWidth = 150;
const rectangleHeight = 100;

const setupRectangle = async (page: Page) => {
  await openDropdown(page, 'shape-ellipse');
  await page.getByTestId('shape-rectangle').click();
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
  const a = 97;
  const b = 79;
  const c = 943;
  const d = 114;
  const e = 844;
  const f = 579;
  const g = 66;
  const h = 611;
  await page.mouse.move(a, b);
  await page.mouse.down();
  await page.mouse.move(c, d);
  await page.mouse.move(e, f);
  await page.mouse.move(g, h);
  await page.mouse.up();
}

async function resizeRectangle(page: Page) {
  const a = 642;
  const b = 357;
  const c = 276;
  const d = 171;
  const e = 787;
  const f = 462;
  const g = 880;
  const h = 596;
  const i = 881;
  const j = 174;
  const k = 584;
  const l = 371;
  await page.mouse.click(a, b);
  await dragMouseTo(c, d, page);
  await page.mouse.click(e, f);
  await await dragMouseTo(g, h, page);
  await page.mouse.click(i, j);
  await await dragMouseTo(k, l, page);
  await clickInTheMiddleOfTheScreen(page);
}

async function separetingAndMovingRecatngles(page: Page) {
  const a = 524;
  const b = 306;
  const c = 421;
  const d = 315;
  const e = 969;
  const f = 386;
  const g = 817;
  const h = 471;
  const i = 496;
  const j = 280;
  const k = 194;
  const l = 167;
  await page.mouse.click(a, b);
  await dragMouseTo(c, d, page);
  await page.mouse.click(e, f);
  await dragMouseTo(g, h, page);
  await takeEditorScreenshot(page);
  await clickInTheMiddleOfTheScreen(page);
  await selectDropdownTool(page, 'select-rectangle', 'select-lasso');
  await createSomeStructure(page);
  await page.mouse.click(i, j);
  await page.mouse.down();
  await dragMouseTo(k, l, page);
}

test.describe('Draw Rectangle', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Simple Objects - Draw a Rectangle - draw and highlightt rectangle', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-1972

    const rectangleCoordinates = await setupRectangle(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.mouse.move(rectangleCoordinates.x, rectangleCoordinates.y);
  });

  test('Simple Objects - Edit the Rectangle - move object', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-1973
    const a = 645;
    const b = 367;
    const c = 759;
    const d = 183;
    await setupRectangle(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('Control+a');
    await page.mouse.click(a, b);
    await dragMouseTo(c, d, page);
  });

  test('Simple Object - Edit the Rectangle - changing size', async ({
    page,
  }) => {
    const m = 584;
    const n = 371;
    const o = 830;
    const p = 424;
    await setupRectangle(page);
    await page.keyboard.press('Control+a');
    await resizeRectangle(page);
    await createSomeStructure(page);
    await page.mouse.click(m, n);
    await dragMouseTo(o, p, page);
  });

  test('Simple Objects - Draw a lot of rectangles - moving and separeting crossed lines', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-1958
    await openFileAndAddToCanvas(
      'KET/rectangle-test-EPMLSOPKET-1977.ket',
      page,
    );
    await separetingAndMovingRecatngles(page);
  });
});
