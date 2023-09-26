import { Page, test } from '@playwright/test';
import {
  LeftPanelButton,
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  selectLeftPanelButton,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';

test.describe('Selection and hover for simple objects', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });
  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

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

  test('Selection highlight appears immediately for simple objects', async ({
    page,
  }) => {
    await setupEllipse(page);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Hover highlight appears immediately for simple objects', async ({
    page,
  }) => {
    const ellipseCoordinates = await setupEllipse(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.mouse.move(ellipseCoordinates.x, ellipseCoordinates.y);
  });
});
