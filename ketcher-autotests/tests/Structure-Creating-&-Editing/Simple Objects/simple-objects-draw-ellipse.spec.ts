import { Page, test } from '@playwright/test';
import {
  LeftPanelButton,
  openFileAndAddToCanvas,
  waitForPageInit,
} from '@utils';
import { selectLeftPanelButton, takeEditorScreenshot } from '@utils/canvas';
import {
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  selectDropdownTool,
} from '@utils/clicks';

const ellipseWidth = 120;
const ellipseHeight = 100;

const setupEllipse = async (page: Page) => {
  await selectLeftPanelButton(LeftPanelButton.ShapeEllipse, page);
  const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
  const ellipseCoordinates = { x: x + ellipseWidth, y: y + ellipseHeight };
  await clickInTheMiddleOfTheScreen(page);
  await dragMouseTo(ellipseCoordinates.x, ellipseCoordinates.y, page);
  return ellipseCoordinates;
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

async function separetingAndMovingEllipse(page: Page) {
  const a = 665;
  const b = 365;
  const c = 530;
  const d = 344;
  const e = 850;
  const f = 367;
  const g = 870;
  const h = 262;
  const i = 509;
  const j = 367;
  const k = 464;
  const l = 239;
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
test.describe('Draw Ellipse', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Simple Objects - Draw a Ellipse - draw and highlightt elllipse', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-1959
    const ellipseCoordinates = await setupEllipse(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.mouse.move(ellipseCoordinates.x, ellipseCoordinates.y);
  });

  test('Simple Objects - Edit a Ellipse  - moving object', async ({ page }) => {
    const a = 645;
    const b = 367;
    const c = 759;
    const d = 183;
    await setupEllipse(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('Control+a');
    await page.mouse.click(a, b);
    await dragMouseTo(c, d, page);
  });

  test('Simple Objects - Edit a Ellipse  - changing sizes of the object', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-1960
    const a = 332;
    const b = 401;
    const c = 692;
    const d = 410;
    const e = 690;
    const f = 410;
    const g = 220;
    const h = 200;
    await setupEllipse(page);
    await clickInTheMiddleOfTheScreen(page);
    await dragMouseTo(a, b, page);
    await takeEditorScreenshot(page);
    await dragMouseTo(c, d, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectDropdownTool(page, 'select-rectangle', 'select-lasso');
    await createSomeStructure(page);
    await page.mouse.move(e, f);
    await page.mouse.down();
    await dragMouseTo(g, h, page);
  });

  test('Simple Objects - Draw a lot of ellipses', async ({ page }) => {
    // Test case: EPMLSOPKET-1966
    // Separeting and moving few objects on canvas
    await openFileAndAddToCanvas('KET/ellipse-test-EPMLSOPKET-1966.ket', page);
    await separetingAndMovingEllipse(page);
  });
});
