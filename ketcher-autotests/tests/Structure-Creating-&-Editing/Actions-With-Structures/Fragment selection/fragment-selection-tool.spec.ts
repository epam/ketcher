import { Page, test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
    clickOnAtom,
  doubleClickOnAtom,
  dragMouseTo,
  openFileAndAddToCanvas,
  screenshotBetweenUndoRedo,
  selectDropdownTool,
    takeEditorScreenshot,
  waitForPageInit,
  waitForRender,
} from '@utils';
import { clickOnArrow } from '@utils/canvas/arrow-signes/getArrow';
import { getAtomByIndex, getRightAtomByAttributes } from '@utils/canvas/atoms';
import { clickOnPlus } from '@utils/canvas/plus-signes/getPluses';


const xMark = 300;
const yMark = 200;

async function selectObjects (page: Page) {
  await page.keyboard.down('Shift');
  await clickOnPlus(page, 1);
  await clickOnArrow(page, 0);
  const atomToClick = 7;
  await doubleClickOnAtom(page, 'C', atomToClick);
}

async function selectSomeObjects (page: Page) {
  await waitForRender(page, async () => {
    await page.keyboard.down('Shift');
    await clickOnPlus(page, 1);
    await clickOnArrow(page, 0);
    await clickOnPlus(page,0);
    await page.mouse.down();
  });
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

  test('Select and drag reaction components', async ({ page }) => {
    //  Test case: EPMLSOPKET-1357
    await openFileAndAddToCanvas('RXN-V2000/reaction_4.rxn', page);
    await selectDropdownTool(page, 'select-rectangle', 'select-fragment');
    await selectObjects(page);
    await dragMouseTo(xMark, yMark, page);
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
  });

  test('Undo - Redo moving of structures', async ({ page }) => {
    // Test case: EPMLSOPKET-1360
    // Move some parts off structure - plus and arrow - then use Undo?redo
    await openFileAndAddToCanvas('Rxn-V2000/reaction_4.rxn', page);
    await selectDropdownTool(page, 'select-rectangle', 'select-fragment');
    await selectSomeObjects(page);
    await dragMouseTo(xMark, yMark, page);
    await screenshotBetweenUndoRedo(page);
  });

  test('Drawing selection contours correctly for hovered structures', async ({ page }) => {
    // Test case: EPMLSOPKET-17664
    // Verify the bond contours are not intersected with atom contours
    await openFileAndAddToCanvas('glutamine.mol', page);
    await selectDropdownTool(page, 'select-rectangle', 'select-fragment');
    const point = await getRightAtomByAttributes(page, { label: 'N' });
    await page.mouse.click(point.x, point.y);
    await page.mouse.move(point.x, point.y);
  });
});
