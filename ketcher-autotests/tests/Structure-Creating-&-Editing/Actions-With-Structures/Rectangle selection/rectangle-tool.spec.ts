import { Page, test } from '@playwright/test';
import {
  BondType,
  clickOnAtom,
  clickOnBond,
  dragMouseTo,
  getControlModifier,
  getCoordinatesOfTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  selectDropdownTool,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';
import { getBondByIndex } from '@utils/canvas/bonds';

test.describe('Rectangle selection tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  const xDelta = 30;
  const yDelta = 60;
  const modifier = getControlModifier();

  async function selectObjects(
    page: Page,
    xAxisRadius: number,
    yAxisRadius: number,
  ) {
    const point = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await page.mouse.move(point.x - xAxisRadius, point.y - yAxisRadius);
    await page.mouse.down();
    await page.mouse.move(point.x + xAxisRadius, point.y + yAxisRadius);
    await page.mouse.up();
    return point;
  }

  const selectionCoords = { x: 300, y: 200 };
  async function clickCanvas(page: Page) {
    await page.mouse.click(selectionCoords.x, selectionCoords.y);
  }

  test('Structure selection with rectangle selection tool', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-1347
    await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
    await page.getByTestId('select-rectangle').click();
    await clickCanvas(page);
    await selectObjects(page, selectionCoords.x, selectionCoords.y);
  });

  test('Drag structure', async ({ page }) => {
    // Test case: EPMLSOPKET-1348
    const objectSelection = 100;
    const atomNumber = 5;
    await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
    await page.getByTestId('select-rectangle').click();
    const point = await selectObjects(page, objectSelection, objectSelection);
    await clickOnAtom(page, 'C', atomNumber);
    await dragMouseTo(point.x + xDelta, point.y - yDelta, page);
  });

  test('Reaction components selection', async ({ page }) => {
    //  Test case: EPMLSOPKET-1349
    const atomNumber = 5;
    const moveMouseCoordinatesY = 10;
    const moveMouseCoordinatesX = 270;
    await openFileAndAddToCanvas('Rxn-V2000/benzene-chain-reaction.rxn', page);
    await page.getByTestId('select-rectangle').click();
    const point = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await clickCanvas(page);

    await page.keyboard.down('Shift');
    await page.mouse.click(
      point.x - moveMouseCoordinatesX,
      point.y + moveMouseCoordinatesY,
    );
    await page.mouse.click(point.x, point.y + atomNumber);
    await page.keyboard.up('Shift');
    await clickCanvas(page);

    await page.keyboard.press(`${modifier}+KeyA`);
  });

  test('Reaction components dragging', async ({ page }) => {
    //  Test case: EPMLSOPKET-1350
    const objectSelection = 100;
    const moveMouseCoordinatesY = 10;
    await openFileAndAddToCanvas('Rxn-V2000/benzene-chain-reaction.rxn', page);
    await page.getByTestId('select-rectangle').click();
    await clickCanvas(page);
    const point = await selectObjects(
      page,
      selectionCoords.x,
      selectionCoords.y,
    );
    await clickOnAtom(page, 'C', moveMouseCoordinatesY);
    await dragMouseTo(
      point.x - objectSelection,
      point.y - selectionCoords.y,
      page,
    );
  });

  test('Fusing atoms together', async ({ page }) => {
    //  Test case: EPMLSOPKET-1351
    const firstAtomNumber = 4;
    const secondAtomNumber = 9;
    await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
    await page.getByTestId('select-rectangle').click();
    await clickOnAtom(page, 'C', firstAtomNumber);
    const atomPoint = await getAtomByIndex(
      page,
      { label: 'C' },
      secondAtomNumber,
    );
    await dragMouseTo(atomPoint.x, atomPoint.y, page);
  });

  test('Fusing bonds together', async ({ page }) => {
    //  Test case: EPMLSOPKET-1351
    const firstBondNumber = 3;
    const secondBondnumber = 8;
    await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
    await page.getByTestId('select-rectangle').click();
    await clickOnBond(page, BondType.SINGLE, firstBondNumber);
    const bondPoint = await getBondByIndex(
      page,
      { type: BondType.SINGLE },
      secondBondnumber,
    );
    await dragMouseTo(bondPoint.x, bondPoint.y, page);
  });

  test('Delete with selection', async ({ page }) => {
    //  Test case: EPMLSOPKET-1352

    async function selectReactionLeftPart() {
      const shift = 5;
      const emptySpace = { x: 100, y: 100 };
      const mostRightAtom = await getAtomByIndex(page, { label: 'Br' }, 0);
      await page.mouse.move(emptySpace.x, emptySpace.y);
      await dragMouseTo(mostRightAtom.x + shift, mostRightAtom.y + shift, page);
    }
    const atomOnTheRightSide = 14;
    await openFileAndAddToCanvas('Rxn-V2000/benzene-chain-reaction.rxn', page);
    await selectDropdownTool(page, 'select-rectangle', 'select-rectangle');
    await selectReactionLeftPart();
    await page.keyboard.press('Delete');
    await clickOnAtom(page, 'C', atomOnTheRightSide);
    await page.keyboard.press('Delete');
  });
});
