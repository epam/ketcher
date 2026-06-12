import { Page, test } from '@fixtures';
import { ShapeType } from '@tests/pages/constants/shapeSelectionTool/Constants';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import {
  clickInTheMiddleOfTheCanvas,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';

test.describe('Selection and hover for simple objects', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  const ellipseWidth = 120;
  const ellipseHeight = 100;

  const setupEllipse = async (page: Page) => {
    await LeftToolbar(page).selectShapeTool(ShapeType.Ellipse);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const ellipseCoordinates = { x: x + ellipseWidth, y: y + ellipseHeight };
    await clickInTheMiddleOfTheCanvas(page);
    await dragMouseTo(page, ellipseCoordinates.x, ellipseCoordinates.y);
    return ellipseCoordinates;
  };

  test('Selection highlight appears immediately for simple objects', async ({
    page,
  }) => {
    await setupEllipse(page);
    await clickInTheMiddleOfTheCanvas(page);
    await takeEditorScreenshot(page);
  });

  test('Hover highlight appears immediately for simple objects', async ({
    page,
  }) => {
    const ellipseCoordinates = await setupEllipse(page);
    await clickInTheMiddleOfTheCanvas(page);
    await page.mouse.move(ellipseCoordinates.x, ellipseCoordinates.y);
    await takeEditorScreenshot(page);
  });
});
