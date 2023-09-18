import { Page, test } from '@playwright/test';
import {
  BondTool,
  BondType,
  TopPanelButton,
  clickOnAtom,
  dragMouseTo,
  drawBenzeneRing,
  getControlModifier,
  getCoordinatesOfTheMiddleOfTheScreen,
  getCoordinatesTopAtomOfBenzeneRing,
  openFileAndAddToCanvas,
  selectNestedTool,
  selectTopPanelButton,
  takeEditorScreenshot,
  waitForIndigoToLoad,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';
import { getBondByIndex } from '@utils/canvas/bonds';

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

  const xMark = 300;
  const yMark = 200;

  async function selectObjects(page: Page, xAxis: number, yAxis: number) {
    const point = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await page.mouse.move(point.x - xAxis, point.y - yAxis);
    await page.mouse.down();
    await page.mouse.move(point.x + xAxis, point.y + yAxis);
    await page.mouse.up();
    return point;
  }

  async function clickCanvas(page: Page) {
    await page.mouse.click(xMark, yMark);
  }

  test('Structure selection with rectangle selection tool', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-1347
    await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
    await page.getByTestId('select-rectangle').click();
    await clickCanvas(page);
    await selectObjects(page, xMark, yMark);
  });

  test('Drag structure', async ({ page }) => {
    // Test case: EPMLSOPKET-1348
    const objectSelection = 100;
    const atomNumb = 5;
    await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
    await page.getByTestId('select-rectangle').click();
    const point = await selectObjects(page, objectSelection, objectSelection);
    await clickOnAtom(page, 'C', atomNumb);
    await dragMouseTo(point.x + xDelta, point.y - yDelta, page);
  });

  test('Reaction components selection', async ({ page }) => {
    //  Test case: EPMLSOPKET-1349
    const atomNumb = 5;
    const moveMouseCordY = 10;
    const moveMouseCordX = 270;
    await openFileAndAddToCanvas('Rxn-V2000/reaction-4.rxn', page);
    await page.getByTestId('select-rectangle').click();
    const point = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await page.mouse.move(point.x - moveMouseCordX, point.y + moveMouseCordY);
    await page.mouse.down();
    await page.mouse.up();
    await clickCanvas(page);

    await page.mouse.move(point.x, point.y + atomNumb);
    await page.mouse.down();
    await page.mouse.up();
    await clickCanvas(page);

    await page.keyboard.down('Shift');
    await page.mouse.click(point.x - moveMouseCordX, point.y + moveMouseCordY);
    await page.mouse.click(point.x, point.y + atomNumb);
    await page.keyboard.up('Shift');
    await clickCanvas(page);

    await page.keyboard.press(`${modifier}+KeyA`);
  });

  test('Reaction components dragging', async ({ page }) => {
    //  Test case: EPMLSOPKET-
    const objectSelection = 100;
    const moveMouseCordY = 10;
    await openFileAndAddToCanvas('Rxn-V2000/reaction-4.rxn', page);
    await page.getByTestId('select-rectangle').click();
    await clickCanvas(page);
    const point = await selectObjects(page, xMark, yMark);
    await clickOnAtom(page, 'C', moveMouseCordY);
    await dragMouseTo(point.x - objectSelection, point.y - yMark, page);
  });

  test('Fusing atoms together', async ({ page }) => {
    //  Test case: EPMLSOPKET-1351
    const atomNumb = 4;
    const atomLabel = 9;
    await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
    await page.getByTestId('select-rectangle').click();
    await clickOnAtom(page, 'C', atomNumb);
    const atomPoint = await getAtomByIndex(page, { label: 'C' }, atomLabel);
    await dragMouseTo(atomPoint.x, atomPoint.y, page);
  });

  test('Fusing bonds together', async ({ page }) => {
    //  Test case: EPMLSOPKET-1351
    const moveMouseCordY = 10;
    const objectSelection = 50;
    await drawBenzeneRing(page);
    await selectNestedTool(page, BondTool.SINGLE_AROMATIC);
    const coordinates = await getCoordinatesTopAtomOfBenzeneRing(page);
    await page.mouse.click(coordinates.x + xDelta, coordinates.y - yDelta);
    await page.getByTestId('select-rectangle').click();
    await selectObjects(page, objectSelection, objectSelection);
    const atomNumb = 4;
    const bondPoint = await getBondByIndex(page, {}, atomNumb);
    await page.mouse.move(bondPoint.x, bondPoint.y);
    await dragMouseTo(
      coordinates.x + xDelta + moveMouseCordY,
      coordinates.y - yDelta - moveMouseCordY,
      page,
    );
    await selectTopPanelButton(TopPanelButton.Undo, page);
    const point = await getBondByIndex(
      page,
      { type: BondType.SINGLE_OR_AROMATIC },
      0,
    );
    await page.mouse.click(point.x, point.y);
    await dragMouseTo(point.x - xDelta, point.y + yDelta, page);
  });

  test('Delete with selection', async ({ page }) => {
    //  Test case: EPMLSOPKET-1352
    const atomNumb = 4;
    await openFileAndAddToCanvas('Rxn-V2000/reaction-4.rxn', page);
    await page.getByTestId('select-rectangle').click();
    await selectObjects(page, yMark, yMark);
    await page.keyboard.press('Delete');
    await clickOnAtom(page, 'C', atomNumb);
    await page.keyboard.press('Delete');
  });
});
