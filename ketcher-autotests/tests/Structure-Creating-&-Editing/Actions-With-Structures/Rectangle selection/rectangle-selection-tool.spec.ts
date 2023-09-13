/* eslint-disable no-magic-numbers */
import { Page, test } from '@playwright/test';
import {
  clickOnAtom,
  dragMouseTo,
  getControlModifier,
  getCoordinatesOfTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  takeEditorScreenshot,
  waitForIndigoToLoad,
  waitForPageInit,
} from '@utils';

test.describe('Rectangle selection tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await waitForIndigoToLoad(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  const xDelta = 30;
  const yDelta = 60;
  const modifier = getControlModifier();

  async function selectObjects(page: Page, xAxis: number, yAxis: number) {
    const point = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await page.mouse.move(point.x - xAxis, point.y - yAxis);
    await page.mouse.down();
    await page.mouse.move(point.x + xAxis, point.y + yAxis);
    await page.mouse.up();
    return point;
  }

  async function clickCanvas(page: Page) {
    await page.mouse.click(300, 200);
  }

  test('Structure selection with rectangle selection tool', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-1347
    await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
    await page.getByTestId('select-rectangle').click();
    await clickCanvas(page);
    await selectObjects(page, 300, 200);
  });

  test('Drag structure', async ({ page }) => {
    // Test case: EPMLSOPKET-1348
    await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
    await page.getByTestId('select-rectangle').click();
    const point = await selectObjects(page, 100, 100);
    await clickOnAtom(page, 'C', 5);
    await dragMouseTo(point.x + xDelta, point.y - yDelta, page);
  });

  test.skip('Reaction components selection', async ({ page }) => {
    //  Test case: EPMLSOPKET-1349
    await openFileAndAddToCanvas('Rxn-V2000/reaction-4.rxn', page);
    await page.getByTestId('select-rectangle').click();
    const point = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await page.mouse.move(point.x - 270, point.y + 10);
    await page.mouse.down();
    await page.mouse.up();
    await clickCanvas(page);

    await page.mouse.move(point.x, point.y + 5);
    await page.mouse.down();
    await page.mouse.up();
    await clickCanvas(page);

    await page.keyboard.down('Shift');
    await page.mouse.click(point.x - 270, point.y + 10);
    await page.mouse.click(point.x, point.y + 5);
    await page.keyboard.up('Shift');
    await clickCanvas(page);

    await page.keyboard.press(`${modifier}+KeyA`);
  });

  test('Reaction components dragging', async ({ page }) => {
    //  Test case: EPMLSOPKET-1350
    await openFileAndAddToCanvas('Rxn-V2000/reaction-4.rxn', page);
    await page.getByTestId('select-rectangle').click();
    await clickCanvas(page);
    const point = await selectObjects(page, 300, 200);
    await clickOnAtom(page, 'C', 10);
    await dragMouseTo(point.x - 100, point.y - 200, page);
  });
});
