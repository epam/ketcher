import { Page, test, expect } from '@playwright/test';
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
  saveToFile,
  receiveFileComparisonData,
  pressButton,
  STRUCTURE_LIBRARY_BUTTON_NAME,
  cutAndPaste,
} from '@utils';
import { getKet } from '@utils/formats';

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
  await page.keyboard.press('Enter');
}

async function selectAndMoveSimpleObjects(page: Page) {
  const point = { x: 727, y: 359 };
  const point1 = { x: 83, y: 207 };
  await openFileAndAddToCanvas('KET/simple-objects.ket', page);
  await page.keyboard.press('Control+a');
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await dragMouseTo(point1.x, point1.y, page);
}

async function saveToTemplates(page: Page) {
  await selectTopPanelButton(TopPanelButton.Save, page);
  await page.getByRole('button', { name: 'Save to Templates' }).click();
  await page.getByPlaceholder('template').click();
  await page.getByPlaceholder('template').fill('My New Template');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
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
    await waitForRender(page, async () => {
      await setZoomInputValue(page, '100');
    });
  });

  test('Simple objest - Simple Objects and Structures selection', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-1981
    // Move the elements by dragging and dropping
    const point = { x: 639, y: 359 };
    const point1 = { x: 401, y: 179 };
    const point2 = { x: 492, y: 184 };
    const point3 = { x: 306, y: 224 };
    await setupEllipse(page);
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    await dragMouseTo(point1.x, point1.y, page);
    await drawBenzeneRing(page);
    await takeEditorScreenshot(page);
    await selectDropdownTool(page, 'select-rectangle', 'select-lasso');
    await waitForRender(page, async () => {
      await page.mouse.click(point2.x, point2.y);
      await dragMouseTo(point3.x, point3.y, page);
    });
  });

  test('Simple object - Delete Simple Objects with Delete button', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-1983
    await openFileAndAddToCanvas('KET/simple-objects.ket', page);
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Delete');
  });

  test('Simple object - Delete Simple Objects with Backspace button', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-1983
    await openFileAndAddToCanvas('KET/simple-objects.ket', page);
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Backspace');
  });

  test('Simple Objects - Copy/Cut/Paste actions on simple objects', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-1984
    const numberOfPressZoomOut = 5;
    const numberOfPress = 1;
    const anyPointX = 200;
    const anyPointY = 200;
    await openFileAndAddToCanvas('KET/simple-objects.ket', page);
    for (let i = 0; i < numberOfPressZoomOut; i++) {
      await waitForRender(page, async () => {
        await page.keyboard.press('Control+_');
      });
    }
    await waitForRender(page, async () => {
      await copyAndPaste(page);
    });
    await page.mouse.click(anyPointX, anyPointY);
    await takeEditorScreenshot(page);
    for (let i = 0; i < numberOfPress; i++) {
      await selectTopPanelButton(TopPanelButton.Undo, page);
    }
    await waitForRender(page, async () => {
      await cutAndPaste(page);
    });
    await page.mouse.click(anyPointX, anyPointY);
    await takeEditorScreenshot(page);
    for (let i = 0; i < numberOfPress; i++) {
      await selectTopPanelButton(TopPanelButton.Undo, page);
    }
  });

  test('Simple Objects - Adding structure to simple objects', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-1982
    // Open file with simple object and adding some structure
    await selectAndMoveSimpleObjects(page);
    await waitForRender(page, async () => {
      await drawBenzeneRing(page);
    });
  });

  test('Simple objects - Open and save as .ket file', async ({ page }) => {
    // Test case: EPMLSOPKET-1982
    await openFileAndAddToCanvas('KET/simple-objects-with-changes.ket', page);
    const expectedFile = await getKet(page);
    await saveToFile(
      'KET/simple-objects-with-changes-expected.ket',
      expectedFile,
    );

    const { fileExpected: ketFileExpected, file: ketFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/KET/simple-objects-with-changes-expected.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);
  });

  test('Simple Objects - Save to Templates', async ({ page }) => {
    // Test case: EPMLSOPKET-14027
    await selectAndMoveSimpleObjects(page);
    await clickInTheMiddleOfTheScreen(page);
    await drawBenzeneRing(page);
    await saveToTemplates(page);
    await selectTopPanelButton(TopPanelButton.Clear, page);
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByRole('button', { name: 'User Templates (1)' }).click();
  });
});
