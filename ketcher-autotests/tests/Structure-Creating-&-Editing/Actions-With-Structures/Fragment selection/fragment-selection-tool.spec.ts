import { Page, test } from '@playwright/test';
import {
  clickOnAtom,
  doubleClickOnAtom,
  dragMouseTo,
  getControlModifier,
  openFileAndAddToCanvas,
  selectDropdownTool,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { clickOnArrow } from '@utils/canvas/arrow-signes/getArrow';
import { getAtomByIndex } from '@utils/canvas/atoms';
import { clickOnPlus } from '@utils/canvas/plus-signes/getPluses';

const xMark = 300;
const yMark = 200;

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
    async function selectObjects() {
      await page.keyboard.down('Shift');
      await clickOnPlus(page, 1);
      await clickOnArrow(page, 0);
      const atomToClick = 7;
      await doubleClickOnAtom(page, 'C', atomToClick);
    }
    await openFileAndAddToCanvas('RXN-V2000/reaction_4.rxn', page);
    await selectDropdownTool(page, 'select-rectangle', 'select-fragment');
    await selectObjects();
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
});
