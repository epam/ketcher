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

async function createSomeMovement(page: Page) {
  const k = 759;
  const l = 183;
  await clickInTheMiddleOfTheScreen(page);
  await page.mouse.down();
  await dragMouseTo(k, l, page);
  await page.mouse.up();
}

async function separetingAndMovingLines(page: Page) {
  const a = 296;
  const b = 478;
  const c = 740;
  const d = 393;
  const e = 529;
  const f = 409;
  const g = 267;
  const h = 518;
  const i = 534;
  const j = 467;
  const k = 588;
  const l = 277;
  await page.mouse.click(a, b);
  await dragMouseTo(c, d, page);
  await page.mouse.click(e, f);
  await dragMouseTo(g, h, page);
  await takeEditorScreenshot(page);
  await clickInTheMiddleOfTheScreen(page);
  await selectDropdownTool(page, 'select-rectangle', 'select-lasso');
  await createSomeStructure(page);
  await page.mouse.click(i, j);
  await dragMouseTo(k, l, page);
}

const setupLine = async (page: Page) => {
  await openDropdown(page, 'shape-ellipse');
  await page.getByTestId('shape-line').click();
  const moveTo = 250;
  await clickInTheMiddleOfTheScreen(page);
  const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
  const LineCoordinates = { x: x + moveTo, y };
  await dragMouseTo(LineCoordinates.x, LineCoordinates.y, page);
  return LineCoordinates;
};

test.describe('draw and highlight line', () => {
  // selecting 'Shape Line', drawing it on canvas, highlighting created line
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('drawing and highlighting', async ({ page }) => {
    // test case: EPMLSOPKET-16750
    await openDropdown(page, 'shape-ellipse');
    await page.getByTestId('shape-line').click();

    const moveTo = 250;
    await clickInTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + moveTo;
    await dragMouseTo(coordinatesWithShift, y, page);

    await page.keyboard.press('Control+a');
  });

  test('Simple Objects - Edit Line - Moving', async ({ page }) => {
    // Test case: EPMLSOPKET-1957
    // Moving the line on the canvas
    const a = 686;
    const b = 358;
    const c = 125;
    const d = 161;
    const LineCoordinates = await setupLine(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.mouse.move(LineCoordinates.x, LineCoordinates.y);
    await page.mouse.click(a, b);
    await dragMouseTo(c, d, page);
  });

  test('Simple Objects - Edit Line - changing size', async ({ page }) => {
    const a = 251;
    const b = 363;
    const c = 757;
    const d = 362;
    await setupLine(page);
    await page.keyboard.press('Control+a');
    await dragMouseTo(a, b, page);
    await takeEditorScreenshot(page);
    await dragMouseTo(c, d, page);
  });

  test('Simple Objects - Edit Line - changing directions', async ({ page }) => {
    const a = 302;
    const b = 510;
    const c = 397;
    const d = 220;
    await setupLine(page);
    await page.keyboard.press('Control+a');
    await dragMouseTo(a, b, page);
    await takeEditorScreenshot(page);
    await dragMouseTo(c, d, page);
  });

  test('Simple Objects - Edit Line - highlighting and changing directions', async ({
    page,
  }) => {
    await setupLine(page);
    await selectDropdownTool(page, 'select-rectangle', 'select-lasso');
    await createSomeStructure(page);
    await takeEditorScreenshot(page);
    await createSomeMovement(page);
  });

  test('Simple Objects - Draw a lot of lines - moving and separeting crossed lines', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-1958
    await openFileAndAddToCanvas('KET/lines-EPMLSOPKET-1958.ket', page);
    await separetingAndMovingLines(page);
  });
});
