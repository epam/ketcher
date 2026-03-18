import { Page, test } from '@playwright/test';
import {
  clickOnAtom,
  clickOnCanvas,
  doubleClickOnAtom,
  dragMouseTo,
  openFileAndAddToCanvas,
  screenshotBetweenUndoRedo,
  takeEditorScreenshot,
  waitForPageInit,
  waitForRender,
} from '@utils';
import { clickOnArrow } from '@utils/canvas/arrow-signes/getArrow';
import { getRightAtomByAttributes } from '@utils/canvas/atoms/getRightAtomByAttributes/getRightAtomByAttributes';
import { getAtomByIndex } from '@utils/canvas/atoms/getAtomByIndex/getAtomByIndex';
import { clickOnPlus } from '@utils/canvas/plus-signes/getPluses';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';

const xMark = 300;
const yMark = 200;

async function selectObjects(page: Page) {
  await page.keyboard.down('Shift');
  await clickOnPlus(page, 1);
  await clickOnArrow(page, 0);
  const atomToClick = 7;
  await doubleClickOnAtom(page, 'C', atomToClick);
}

async function selectSomeObjects(page: Page) {
  await waitForRender(page, async () => {
    await page.keyboard.down('Shift');
    await clickOnPlus(page, 1);
    await clickOnArrow(page, 0);
    await clickOnPlus(page, 0);
    await page.mouse.down();
  });
}

test.describe('Fragment selection tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Molecule selection', async ({ page }) => {
    // Test case: EPMLSOPKET-1355
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/glutamine.mol');
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Fragment,
    );
    await clickOnAtom(page, 'C', 1);
    await takeEditorScreenshot(page);
  });

  test('Reaction component selection', async ({ page }) => {
    test.fail();
    //  Test case: EPMLSOPKET-1356
    await openFileAndAddToCanvas(page, 'Rxn-V2000/reaction_4.rxn');
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Fragment,
    );
    await clickOnPlus(page, 1);
    await takeEditorScreenshot(page);
    await clickOnArrow(page, 0);
    await takeEditorScreenshot(page);
  });

  test('Select and drag reaction components', async ({ page }) => {
    test.fail();
    //  Test case: EPMLSOPKET-1357
    await openFileAndAddToCanvas(page, 'Rxn-V2000/reaction_4.rxn');
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Fragment,
    );
    await selectObjects(page);
    await dragMouseTo(xMark, yMark, page);
    await takeEditorScreenshot(page);
  });

  test('Fuse atoms together', async ({ page }) => {
    //  Test case: EPMLSOPKET-1358
    const atomNumber = 4;
    const atomLabel = 9;
    await openFileAndAddToCanvas(page, 'KET/two-benzene-with-atoms.ket');
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Fragment,
    );
    await clickOnAtom(page, 'C', atomNumber);
    const atomPoint = await getAtomByIndex(page, { label: 'C' }, atomLabel);
    await dragMouseTo(atomPoint.x, atomPoint.y, page);
    await takeEditorScreenshot(page);
  });

  test('Deleting molecule', async ({ page }) => {
    //  Test case: EPMLSOPKET-1359
    await openFileAndAddToCanvas(page, 'Rxn-V2000/reaction_4.rxn');
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Fragment,
    );
    await clickOnAtom(page, 'Br', 0);
    await page.keyboard.press('Delete');
    await takeEditorScreenshot(page);
  });

  test('Undo - Redo moving of structures', async ({ page }) => {
    test.fail();
    // Test case: EPMLSOPKET-1360
    // Move some parts off structure - plus and arrow - then use Undo?redo
    await openFileAndAddToCanvas(page, 'Rxn-V2000/reaction_4.rxn');
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Fragment,
    );
    await selectSomeObjects(page);
    await dragMouseTo(xMark, yMark, page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Drawing selection contours correctly for hovered structures', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-17664
    // Verify the bond contours are not intersected with atom contours
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/glutamine.mol');
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Fragment,
    );
    const point = await getRightAtomByAttributes(page, { label: 'N' });
    await clickOnCanvas(page, point.x, point.y);
    await page.mouse.move(point.x, point.y);
    await takeEditorScreenshot(page);
  });
});
