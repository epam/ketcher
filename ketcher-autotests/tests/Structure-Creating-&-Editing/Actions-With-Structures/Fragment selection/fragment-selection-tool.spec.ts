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
  openDropdown,
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

  test('Molecule selection', async ({ page }) => {
    // Test case: EPMLSOPKET-1355
    await openFileAndAddToCanvas('glutamine.mol', page);
    await selectDropdownTool(page, 'select-rectangle', 'select-fragment');
    // await clickCanvas(page);
    await clickOnAtom(page, 'C', 1);
  });

  test('Reaction component selection', async ({ page }) => {
    //  Test case: EPMLSOPKET-1356
    await openFileAndAddToCanvas('RXN-V2000/reaction_4.rxn', page);
    await selectDropdownTool(page, 'select-rectangle', 'select-fragment');
    await clickOnPlus(page, 1);
    await takeEditorScreenshot(page);
    await clickOnArrow(page, 0);
  });

  test('Fuse atoms together', async ({ page }) => {
    //  Test case: EPMLSOPKET-1358
    const atomNumber = 4;
    const atomLabel = 9;
    await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
    await selectDropdownTool(page, 'select-rectangle', 'select-fragment');
    await clickOnAtom(page, 'C', atomNumber);
    const atomPoint = await getAtomByIndex(page, { label: 'C' }, atomLabel);
    await dragMouseTo(atomPoint.x, atomPoint.y, page);
  });

  test('Deleting molecule', async ({ page }) => {
    //  Test case: EPMLSOPKET-1359
    await openFileAndAddToCanvas('Rxn-V2000/reaction_4.rxn', page);
    await selectDropdownTool(page, 'select-rectangle', 'select-fragment');
    await clickOnAtom(page, 'Br', 0);
    await page.keyboard.press('Delete');
    // await clickOnAtom(page, 'C', atomNumber);
    // await page.keyboard.press('Delete');
  });
});
