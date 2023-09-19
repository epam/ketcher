import { Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  clickOnAtom,
  dragMouseTo,
  selectTopPanelButton,
  TopPanelButton,
  drawBenzeneRing,
  getCoordinatesTopAtomOfBenzeneRing,
  BondType,
  getCoordinatesOfTheMiddleOfTheScreen,
  getControlModifier,
  BondTool,
  selectNestedTool,
  SelectTool,
  waitForPageInit,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';
import { getBondByIndex } from '@utils/canvas/bonds';

test.describe('Lasso Selection tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  const xDelta = 30;
  const yDelta = 60;
  const xAxis = 300;
  const yAxis = 200;
  const modifier = getControlModifier();

  async function selectObjects(page: Page, xAxis: number, yAxis: number) {
    const point = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await page.mouse.move(point.x - xAxis, point.y - yAxis);
    await page.mouse.down();
    await page.mouse.move(point.x + xAxis, point.y - yAxis);
    await page.mouse.move(point.x + xAxis, point.y + yAxis);
    await page.mouse.move(point.x - xAxis, point.y + yAxis);
    await page.mouse.up();
    return point;
  }

  async function clickCanvas(page: Page) {
    await page.mouse.click(xAxis, yAxis);
  }

  test('Selection of atom/bond/molecule', async ({ page }) => {
    /*
     * Test case: EPMLSOPKET-1338
     * Description: Hover and selection of atom/bond/molecule
     */
    await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
    const atomPoint = await getAtomByIndex(page, { label: 'C' }, 0);
    await page.mouse.move(atomPoint.x, atomPoint.y);
    await page.mouse.click(atomPoint.x, atomPoint.y);
    await takeEditorScreenshot(page);
    await clickCanvas(page);

    const bondPoint = await getBondByIndex(page, {}, 0);
    await page.mouse.move(bondPoint.x, bondPoint.y);
    await page.mouse.click(bondPoint.x, bondPoint.y);
    await takeEditorScreenshot(page);
    await clickCanvas(page);

    await page.keyboard.down('Shift');
    await page.mouse.click(atomPoint.x, atomPoint.y);
    await page.mouse.click(bondPoint.x, bondPoint.y);
    await page.keyboard.up('Shift');
    await takeEditorScreenshot(page);
    await clickCanvas(page);

    await selectNestedTool(page, SelectTool.LASSO_SELECTION);
    await selectObjects(page, xAxis, yAxis);
  });

  test('Drag atom/bond/molecule', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1339
     * Description: Atom/bond/molecule is moved to another place. Structure is not changed. Only selected part changed their place.
     */
    const selectCoords = { x: 100, y: 100 };
    await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
    await selectNestedTool(page, SelectTool.LASSO_SELECTION);
    const point = await selectObjects(page, selectCoords.x, selectCoords.y);
    const atomIndex = 5;
    await clickOnAtom(page, 'C', atomIndex);
    await dragMouseTo(point.x + xDelta, point.y - yDelta, page);
  });

  test('Select the reaction components', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1340
     * Description: Hover and selection of plus sign and reaction arrow
     */
    const yShift = 5;
    const shiftCoords = { x: 270, y: 10 };
    await openFileAndAddToCanvas('Rxn-V2000/benzene-chain-reaction.rxn', page);
    await selectNestedTool(page, SelectTool.LASSO_SELECTION);
    const point = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await page.mouse.move(point.x - shiftCoords.x, point.y + shiftCoords.y);
    await page.mouse.down();
    await page.mouse.up();
    await clickCanvas(page);

    await page.mouse.move(point.x, point.y + yShift);
    await page.mouse.down();
    await page.mouse.up();
    await clickCanvas(page);

    await page.keyboard.down('Shift');
    await page.mouse.click(point.x - shiftCoords.x, point.y + shiftCoords.y);
    await page.mouse.click(point.x, point.y + yShift);
    await page.keyboard.up('Shift');
    await clickCanvas(page);

    await page.keyboard.press(`${modifier}+KeyA`);
  });

  test('Drag the reaction components', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1342
     * Description: Selected structures and components are moved to the another place.
     */
    await openFileAndAddToCanvas('Rxn-V2000/benzene-chain-reaction.rxn', page);
    await selectNestedTool(page, SelectTool.LASSO_SELECTION);
    const point = await selectObjects(page, xAxis, yAxis);
    const atomIndex = 10;
    const xShift = 100;
    await clickOnAtom(page, 'C', atomIndex);
    await dragMouseTo(point.x - xShift, point.y - yAxis, page);
  });

  test('Fuse atoms together', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1343
     * Description: Atoms are fused.
     */
    await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
    await selectNestedTool(page, SelectTool.LASSO_SELECTION);
    const atomIndex = 4;
    await clickOnAtom(page, 'C', atomIndex);
    const aimAtomIndex = 7;
    const atomPoint = await getAtomByIndex(page, { label: 'C' }, aimAtomIndex);
    await dragMouseTo(atomPoint.x, atomPoint.y, page);
  });

  test('Fuse bonds together', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-2861
     * Description: When benzene is merged with stereo bond, benzene's bond is changed.
     * When stereo bond is merged with benzene, benzene's bond is not changed.
     * No new labels (abs, Chiral) appears.
     */
    const selectCoords = { x: 50, y: 50 };
    const shiftCoords = { x: 10, y: 10 };
    await drawBenzeneRing(page);
    await selectNestedTool(page, BondTool.SINGLE_AROMATIC);
    const coordinates = await getCoordinatesTopAtomOfBenzeneRing(page);
    await page.mouse.click(coordinates.x + xDelta, coordinates.y - yDelta);
    await page.getByTestId('select-rectangle').click();
    await selectNestedTool(page, SelectTool.LASSO_SELECTION);
    await selectObjects(page, selectCoords.x, selectCoords.y);
    const bondIndex = 3;
    const bondPoint = await getBondByIndex(page, {}, bondIndex);
    await page.mouse.move(bondPoint.x, bondPoint.y);
    await dragMouseTo(
      coordinates.x + xDelta + shiftCoords.x,
      coordinates.y - yDelta - shiftCoords.y,
      page,
    );
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Undo, page);
    const point = await getBondByIndex(
      page,
      { type: BondType.SINGLE_OR_AROMATIC },
      0,
    );
    await page.mouse.click(point.x, point.y);
    const shiftCoords2 = { x: 5, y: 15 };
    await dragMouseTo(
      point.x - xDelta + shiftCoords2.x,
      point.y + yDelta + shiftCoords2.y,
      page,
    );
  });

  test('Delete with selection', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1345
     * Description: The selected part of the structure or reaction should disappear after pressing the "Delete" button.
     */
    await openFileAndAddToCanvas('Rxn-V2000/benzene-chain-reaction.rxn', page);
    await selectNestedTool(page, SelectTool.LASSO_SELECTION);
    await selectObjects(page, yAxis, yAxis);
    await page.keyboard.press('Delete');

    const atomIndex = 4;
    await clickOnAtom(page, 'C', atomIndex);
    await page.keyboard.press('Delete');
  });

  test('UndoRedo moving of structures', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1345
     * Description: Undo/Redo should work correctly for the actions for the selected objects.
     */
    const randomCoords = { x: 20, y: 20 };
    const shiftCoords = { x: 50, y: 50 };
    const centerPoint = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await openFileAndAddToCanvas('Rxn-V2000/benzene-chain-reaction.rxn', page);
    await selectNestedTool(page, SelectTool.LASSO_SELECTION);

    await clickOnAtom(page, 'C', 0);
    const atomPoint = await getAtomByIndex(page, { label: 'C' }, 0);
    await dragMouseTo(
      atomPoint.x - randomCoords.x,
      atomPoint.y - randomCoords.y,
      page,
    );

    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);

    const bondIndex = 5;
    const bondPoint = await getBondByIndex(
      page,
      { type: BondType.SINGLE },
      bondIndex,
    );
    await page.mouse.click(bondPoint.x, bondPoint.y);
    await dragMouseTo(
      bondPoint.x + shiftCoords.x,
      bondPoint.y + shiftCoords.y,
      page,
    );

    await selectObjects(page, yAxis, yAxis);

    await page.mouse.click(
      bondPoint.x + shiftCoords.x,
      bondPoint.y + shiftCoords.y,
    );
    await dragMouseTo(
      centerPoint.x + randomCoords.x,
      centerPoint.y - randomCoords.y,
      page,
    );
    await selectTopPanelButton(TopPanelButton.Undo, page);

    const plusSignCoords = [
      { x: 270, y: 10 },
      { x: 40, y: 30 },
    ];
    await page.mouse.move(
      centerPoint.x - plusSignCoords[0].x,
      centerPoint.y + plusSignCoords[0].y,
    );
    await page.mouse.down();
    await page.mouse.move(
      centerPoint.x + plusSignCoords[1].x,
      centerPoint.y - plusSignCoords[1].y,
    );
    await page.mouse.up();

    const equalSignCoords = [
      { x: 0, y: 5 },
      { x: 30, y: 20 },
    ];
    await page.mouse.move(
      centerPoint.x + equalSignCoords[0].x,
      centerPoint.y + equalSignCoords[0].y,
    );
    await page.mouse.down();
    await page.mouse.move(
      centerPoint.x + equalSignCoords[1].x,
      centerPoint.y - equalSignCoords[1].y,
    );
    await page.mouse.up();

    const loopCount = 3;
    for (let index = 0; index < loopCount; index++) {
      await selectTopPanelButton(TopPanelButton.Undo, page);
    }
    for (let index = 0; index < loopCount; index++) {
      await selectTopPanelButton(TopPanelButton.Redo, page);
    }
  });

  test("Don't break the selection if the user's cursor goes beyond the canvas", async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-8923
     * Description: Don't break the selection if the user's cursor goes beyond the canvas.
     * GitHub issue: https://github.com/epam/ketcher/issues/2060
     */
    const yShift = 100;
    const xShift = 500;
    await selectNestedTool(page, BondTool.SINGLE_AROMATIC);
    await page.mouse.click(xAxis, yAxis);
    await page.getByTestId('select-rectangle').click();
    await selectNestedTool(page, SelectTool.LASSO_SELECTION);
    await page.mouse.move(xAxis - xDelta, yAxis - yDelta);
    await page.mouse.down();
    await page.mouse.move(xShift, -yShift);
    await page.mouse.move(xShift, yAxis + yShift);
    await page.mouse.move(xAxis - xDelta, yAxis + yShift);
    await page.mouse.up();
  });
});
