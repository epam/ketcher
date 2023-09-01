/* eslint-disable no-magic-numbers */
import { Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  clickOnAtom,
  selectLeftPanelButton,
  LeftPanelButton,
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
  delay,
  DELAY_IN_SECONDS,
  waitForIndigoToLoad,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';
import { getBondByIndex } from '@utils/canvas/bonds';

test.describe('Lasso Selection tool', () => {
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

  const selectLasso = async (page: Page) => {
    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await page.getByTestId('select-lasso').click();
  };

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
    await page.mouse.click(300, 200);
  }

  test('Selection of atom/bond/molecule', async ({ page }) => {
    /*
     * Test case: EPMLSOPKET-1338
     * Description: Hover and selection of atom/bond/molecule
     */
    await openFileAndAddToCanvas('two-benzene-with-atoms.ket', page);
    const atomPoint = await getAtomByIndex(page, { label: 'C' }, 0);
    await page.mouse.move(atomPoint.x, atomPoint.y);
    await page.mouse.click(atomPoint.x, atomPoint.y);
    await clickCanvas(page);

    const bondPoint = await getBondByIndex(page, {}, 0);
    await page.mouse.move(bondPoint.x, bondPoint.y);
    await page.mouse.click(bondPoint.x, bondPoint.y);
    await clickCanvas(page);

    await page.keyboard.down('Shift');
    await page.mouse.click(atomPoint.x, atomPoint.y);
    await page.mouse.click(bondPoint.x, bondPoint.y);
    await page.keyboard.up('Shift');
    await clickCanvas(page);

    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    delay(DELAY_IN_SECONDS.ONE);
    await selectLasso(page);
    await selectObjects(page, 300, 200);
  });

  test('Drag atom/bond/molecule', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1339
     * Description: Atom/bond/molecule is moved to another place. Structure is not changed. Only selected part changed their place.
     */
    await openFileAndAddToCanvas('two-benzene-with-atoms.ket', page);
    await selectLasso(page);
    const point = await selectObjects(page, 100, 100);
    await clickOnAtom(page, 'C', 5);
    await dragMouseTo(point.x + xDelta, point.y - yDelta, page);
  });

  test('Select the reaction components', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1340
     * Description: Hover and selection of plus sign and reaction arrow
     */
    await openFileAndAddToCanvas('reaction_4.rxn', page);
    await selectLasso(page);
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

  test('Drag the reaction components', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1342
     * Description: Selected structures and components are moved to the another place.
     */
    await openFileAndAddToCanvas('reaction_4.rxn', page);
    await selectLasso(page);
    const point = await selectObjects(page, 300, 200);
    await clickOnAtom(page, 'C', 10);
    await dragMouseTo(point.x - 100, point.y - 200, page);
  });

  test('Fuse atoms together', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1343
     * Description: Atoms are fused.
     */
    await openFileAndAddToCanvas('two-benzene-with-atoms.ket', page);
    await selectLasso(page);
    await clickOnAtom(page, 'C', 4);
    const atomPoint = await getAtomByIndex(page, { label: 'C' }, 9);
    await dragMouseTo(atomPoint.x, atomPoint.y, page);
  });

  test('Fuse bonds together', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-2861
     * Description: When benzene is merged with stereo bond, benzene's bond is not changed.
     * When stereo bond is merged with benzene, benzene's bond is changed.
     * No new labels (abs, Chiral) appears.
     */
    await drawBenzeneRing(page);
    await selectNestedTool(page, BondTool.SINGLE_AROMATIC);
    const coordinates = await getCoordinatesTopAtomOfBenzeneRing(page);
    await page.mouse.click(coordinates.x + xDelta, coordinates.y - yDelta);
    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    delay(DELAY_IN_SECONDS.ONE);
    await selectLasso(page);
    await selectObjects(page, 50, 50);
    const bondPoint = await getBondByIndex(page, {}, 4);
    await page.mouse.move(bondPoint.x, bondPoint.y);
    await dragMouseTo(
      coordinates.x + xDelta + 10,
      coordinates.y - yDelta - 10,
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
    /**
     * Test case: EPMLSOPKET-1345
     * Description: The selected part of the structure or reaction should disappear after pressing the "Delete" button.
     */
    await openFileAndAddToCanvas('reaction_4.rxn', page);
    await selectLasso(page);
    await selectObjects(page, 200, 200);
    await page.keyboard.press('Delete');

    await clickOnAtom(page, 'C', 4);
    await page.keyboard.press('Delete');
  });

  test('UndoRedo moving of structures', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1345
     * Description: Undo/Redo should work correctly for the actions for the selected objects.
     */
    const centerPoint = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await openFileAndAddToCanvas('reaction_4.rxn', page);
    await selectLasso(page);

    await clickOnAtom(page, 'C', 0);
    const atomPoint = await getAtomByIndex(page, { label: 'C' }, 0);
    await dragMouseTo(atomPoint.x - 20, atomPoint.y - 20, page);

    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);

    const bondPoint = await getBondByIndex(page, { type: BondType.SINGLE }, 5);
    await page.mouse.click(bondPoint.x, bondPoint.y);
    await dragMouseTo(bondPoint.x + 50, bondPoint.y + 50, page);

    await selectObjects(page, 200, 200);
    await page.mouse.click(bondPoint.x + 50, bondPoint.y + 50);
    await dragMouseTo(centerPoint.x + 100, centerPoint.y - 50, page);
    await selectTopPanelButton(TopPanelButton.Undo, page);

    await page.mouse.move(centerPoint.x - 270, centerPoint.y + 10);
    await page.mouse.down();
    await page.mouse.move(centerPoint.x + 40, centerPoint.y - 30);
    await page.mouse.up();

    await page.mouse.move(centerPoint.x, centerPoint.y + 5);
    await page.mouse.down();
    await page.mouse.move(centerPoint.x + 30, centerPoint.y - 20);
    await page.mouse.up();

    for (let index = 0; index < 3; index++) {
      await selectTopPanelButton(TopPanelButton.Undo, page);
    }
    for (let index = 0; index < 3; index++) {
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
    await selectNestedTool(page, BondTool.SINGLE_AROMATIC);
    await page.mouse.click(500, 200);
    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    delay(DELAY_IN_SECONDS.ONE);
    await selectLasso(page);
    await page.mouse.move(300, 100);
    await page.mouse.down();
    await page.mouse.move(300, -100);
    await page.mouse.move(800, -100);
    await page.mouse.move(800, 400);
    await page.mouse.up();
  });
});
