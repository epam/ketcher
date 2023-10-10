import { test } from '@playwright/test';
import {
  doubleClickOnAtom,
  selectRing,
  resetCurrentTool,
  takeEditorScreenshot,
  waitForPageInit,
  RingButton,
  clickInTheMiddleOfTheScreen,
  waitForRender,
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
    await page.getByText('Query properties').click();
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
    await page.getByText('Query properties').click();
    await page.getByText('Ring bond count').click();
    await takeEditorScreenshot(page);
    await page.getByText('H count').first().click();
    await takeEditorScreenshot(page);
    await page.getByText('Substitution count').click();
    await takeEditorScreenshot(page);
    await page.getByText('Unsaturated').first().click();
    await takeEditorScreenshot(page);
    await page.getByText('Implicit H count').click();
    await takeEditorScreenshot(page);
    await page.getByText('Aromaticity').click();
    await takeEditorScreenshot(page);
    await page.getByText('Ring membership').click();
    await takeEditorScreenshot(page);
    await page.getByText('Ring size').click();
    await takeEditorScreenshot(page);
    await page.getByText('Connectivity').click();
  });

  test('Query Specific under Atom Properties - list of properties', async ({
    page,
  }) => {
    /*
      Description: Checking if list of properties at Query Specific under Atom Properties is correct.
    */
    const deltaX = 0;
    const deltaY = 80;
    const titleOfGeneralTab = 'General';
    const titleOfQuerySpecificTab = 'Query specific';

    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);

    await doubleClickOnAtom(page, 'C', 1);
    await page.getByText(titleOfGeneralTab).click();
    await page.getByText(titleOfQuerySpecificTab).click();
    await waitForRender(page, async () => {
      await page.mouse.wheel(deltaX, deltaY);
    });
  });
});
