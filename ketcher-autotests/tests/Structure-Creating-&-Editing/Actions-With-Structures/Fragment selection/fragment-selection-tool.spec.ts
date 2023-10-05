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
import { clickOnArrow } from '@utils/canvas/arrow-signes/getArrow';
import { getAtomByIndex } from '@utils/canvas/atoms';
import { getBondByIndex } from '@utils/canvas/bonds';
import { clickOnPlus } from '@utils/canvas/plus-signes/getPluses';

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

  test('Reaction component selection', async ({ page }) => {
    //  Test case: EPMLSOPKET-1349
    await openFileAndAddToCanvas('RXN-V2000/reaction_4.rxn', page);
    // await clickOnPlus(page, 1);
    // await takeEditorScreenshot(page);
    await clickOnArrow(page, 0);
    await takeEditorScreenshot(page);
  });
});
