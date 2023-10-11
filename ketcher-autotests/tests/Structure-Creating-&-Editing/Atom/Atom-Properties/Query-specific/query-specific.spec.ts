import { test } from '@playwright/test';
import {
  selectRing,
  resetCurrentTool,
  takeEditorScreenshot,
  waitForPageInit,
  RingButton,
  clickInTheMiddleOfTheScreen,
  getCoordinatesOfTheMiddleOfTheScreen,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';

test.describe('Click Atom on canvas', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  const testIdForQueryProperties = 'query-properties';

  test('Query Specific under Atom Properties - right click - list of properties', async ({
    page,
  }) => {
    /*
      Description: Checking if list of properties at Query properties under right click is correct.
    */
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);

    const point = await getAtomByIndex(page, { label: 'C' }, 1);
    await page.mouse.click(point.x, point.y, { button: 'right' });
    await page.getByTestId(testIdForQueryProperties).click();
  });

  test('Query Specific under Atom Properties - right click - values for properties', async ({
    page,
  }) => {
    /*
      Description: Checking if values of properties at Query properties under right click are correct.
    */
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const shift = 100;
    const yPointForPlacingAtom = y - shift;

    await selectRing(RingButton.Benzene, page);
    await page.mouse.click(x, yPointForPlacingAtom);
    await resetCurrentTool(page);

    const point = await getAtomByIndex(page, { label: 'C' }, 1);
    await page.mouse.click(point.x, point.y, { button: 'right' });
    await page.getByTestId(testIdForQueryProperties).click();
    await page.getByTestId('context-menu-Ring bond count').click();
    await takeEditorScreenshot(page);
    await page.getByTestId('context-menu-H count').first().click();
    await takeEditorScreenshot(page);
    await page.getByTestId('context-menu-Substitution count').click();
    await takeEditorScreenshot(page);
    await page.getByTestId('context-menu-Unsaturated').first().click();
    await takeEditorScreenshot(page);
    await page.getByTestId('context-menu-Implicit H count').click();
    await takeEditorScreenshot(page);
    await page.getByTestId('context-menu-Aromaticity').click();
    await takeEditorScreenshot(page);
    await page.getByTestId('context-menu-Ring membership').click();
    await takeEditorScreenshot(page);
    await page.getByTestId('context-menu-Ring size').click();
    await takeEditorScreenshot(page);
    await page.getByTestId('context-menu-Connectivity').click();
  });
});
