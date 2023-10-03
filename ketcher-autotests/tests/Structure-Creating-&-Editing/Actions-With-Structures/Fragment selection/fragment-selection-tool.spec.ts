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
  selectDropdownTool,
  selectFragmentSelectionTool,
  selectNestedTool,
  selectRectangleSelectionTool,
  selectTopPanelButton,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';
import { getBondByIndex } from '@utils/canvas/bonds';

const xMark = 300;
const yMark = 200;
const modifier = getControlModifier();

async function clickCanvas(page: Page) {
  await page.mouse.click(xMark, yMark);
}

test.describe('Fragment selection tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Structure selection with fragment selection tool', async ({ page }) => {
    // Test case: EPMLSOPKET-1347
    await openFileAndAddToCanvas('glutamine.mol', page);
    await selectDropdownTool(page, 'select-rectangle', 'select-fragment');
    // await clickCanvas(page);
    await clickOnAtom(page, 'C', 1);
  });

  test('Reaction components selection', async ({ page }) => {
    //  Test case: EPMLSOPKET-1349
    const atomNumber = 5;
    const moveMouseCoordinatesY = 10;
    const moveMouseCoordinatesX = 270;
    await openFileAndAddToCanvas('reaction_4.rxn', page);
    await selectDropdownTool(page, 'select-rectangle', 'select-fragment');
    const point = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await page.mouse.move(
      point.x - moveMouseCoordinatesX,
      point.y + moveMouseCoordinatesY,
    );
    await page.mouse.down();
    await page.mouse.up();
    await clickCanvas(page);

    await page.mouse.move(point.x, point.y + atomNumber);
    await page.mouse.down();
    await page.mouse.up();
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
});
