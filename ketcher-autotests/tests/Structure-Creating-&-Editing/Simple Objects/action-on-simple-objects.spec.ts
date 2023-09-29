import { Page, test } from '@playwright/test';
import {
  LeftPanelButton,
  openFileAndAddToCanvas,
  waitForPageInit,
  waitForRender,
  drawBenzeneRing,
  resetCurrentTool,
  selectLeftPanelButton,
  takeEditorScreenshot,
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  selectDropdownTool,
  copyAndPaste,
  selectTopPanelButton,
  TopPanelButton,
  clickOnTheCanvas,
} from '@utils';

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

async function setZoomInputValue(page: Page, value: string) {
  await page.getByTestId('zoom-input').click();
  await page.getByTestId('top-toolbar').getByRole('textbox').fill(value);
  // await page.getByTestId('zoom-value').fill(value);
  await page.keyboard.press('Enter');
}

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

async function createSomeMove(page: Page) {
  const a = 330;
  const b = 324;
  const c = 720;
  const d = 335;
  const e = 706;
  const f = 530;
  await page.mouse.move(a, b);
  await page.mouse.down();
  await page.mouse.move(c, d);
  await page.mouse.move(e, f);
  await page.mouse.up();
}

test.describe('Action on simples objects', () => {
  // selecting 'Shape Line', drawing it on canvas, highlighting created line
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Simple Objects - Zoom In, Zoom Out', async ({ page }) => {
    // Test case: EPMLSOPKET-1978
    const numberOfPressZoomOut = 5;
    const numberOfPressZoomIn = 5;
    await openFileAndAddToCanvas('KET/simple-objects.ket', page);
    for (let i = 0; i < numberOfPressZoomOut; i++) {
      await waitForRender(page, async () => {
        await page.keyboard.press('Control+_');
      });
    }
    await takeEditorScreenshot(page);
    for (let i = 0; i < numberOfPressZoomIn; i++) {
      await waitForRender(page, async () => {
        await page.keyboard.press('Control+=');
      });
    }
  });

  test('Simple Object - Action with zoom tool', async ({ page }) => {
    // Test case: EPMLSOPKET-1980
    await setZoomInputValue(page, '20');
    await resetCurrentTool(page);
    await setupEllipse(page);
    await setZoomInputValue(page, '200');
    await clickInTheMiddleOfTheScreen(page);
    await setupEllipse(page);
    await setZoomInputValue(page, '100');
  });

  test('Simple objest - Simple Objects and Structures selection', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-1981
    // Move the elements by dragging and dropping
    const a = 639;
    const b = 359;
    const c = 401;
    const d = 179;
    const e = 492;
    const f = 184;
    const g = 306;
    const h = 224;
    await setupEllipse(page);
    await page.mouse.move(a, b);
    await page.mouse.down();
    await dragMouseTo(c, d, page);
    await drawBenzeneRing(page);
    await takeEditorScreenshot(page);
    await selectDropdownTool(page, 'select-rectangle', 'select-lasso');
    await page.mouse.click(e, f);
    await dragMouseTo(g, h, page);
  });

  test('Simple object - Delete Simple Objects', async ({ page }) => {
    // Test case: EPMLSOPKET-1983
    await openFileAndAddToCanvas('KET/simple-objects.ket', page);
    await page.keyboard.press('Control+-');
    await page.keyboard.press('Control+-');
    await selectDropdownTool(page, 'select-rectangle', 'select-lasso');
    await createSomeMove(page);
    await page.keyboard.press('Delete');
    await takeEditorScreenshot(page);
    await createSomeStructure(page);
    await page.keyboard.press('Backspace');
  });

  test('Simple Objects - Copy/Cut/Paste actions on simple objects', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-1984
    const numberOfPressZoomOut = 5;
    const numberOfUndo = 3;
    const numberOfRedo = 3;
    await openFileAndAddToCanvas('KET/simple-objects.ket', page);
    for (let i = 0; i < numberOfPressZoomOut; i++) {
      await waitForRender(page, async () => {
        await page.keyboard.press('Control+_');
      });
    }
    await copyAndPaste(page);
    await clickInTheMiddleOfTheScreen(page);
    await copyAndPaste(page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    for (let i = 0; i < numberOfUndo; i++) {
      await selectTopPanelButton(TopPanelButton.Undo, page);
    }
    await clickInTheMiddleOfTheScreen(page);
    for (let i = 0; i < numberOfRedo; i++) {
      await selectTopPanelButton(TopPanelButton.Redo, page);
    }
  });
});
