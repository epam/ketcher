/* eslint-disable no-magic-numbers */
import { test } from '@fixtures';
import {
  clickOnAtom,
  clickOnCanvas,
  deleteByKeyboard,
  doubleClickOnAtom,
  dragMouseTo,
  dragTo,
  openFileAndAddToCanvas,
  takeEditorScreenshot,
  waitForPageInit,
  waitForRender,
} from '@utils';
import {
  getArrowLocator,
  getPlusLocator,
} from '@utils/canvas/arrow-signes/getArrow';
import { getRightAtomByAttributes } from '@utils/canvas/atoms/getRightAtomByAttributes/getRightAtomByAttributes';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { AtomsSetting } from '@tests/pages/constants/settingsDialog/Constants';
import { setSettingsOption } from '@tests/pages/molecules/canvas/SettingsDialog';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';

const xMark = 300;
const yMark = 200;

test.describe('Fragment selection tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Molecule selection', async ({ page }) => {
    // Test case: EPMLSOPKET-1355
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/glutamine.mol');
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
    await clickOnAtom(page, 'C', 1);
    await takeEditorScreenshot(page);
  });

  test('Reaction component selection', async ({ page }) => {
    //  Test case: EPMLSOPKET-1356
    await openFileAndAddToCanvas(page, 'Rxn-V2000/reaction_4.rxn');
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
    await getPlusLocator(page).nth(1).click();
    await takeEditorScreenshot(page);
    await getArrowLocator(page, {}).nth(0).click({ force: true });
    await takeEditorScreenshot(page);
  });

  test('Select and drag reaction components', async ({ page }) => {
    //  Test case: EPMLSOPKET-1357
    await openFileAndAddToCanvas(page, 'Rxn-V2000/reaction_4.rxn');
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
    await page.keyboard.down('Shift');
    await getPlusLocator(page).nth(1).click({ force: true });
    await getArrowLocator(page, {}).nth(0).click({ force: true });
    const atomToClick = 7;
    await doubleClickOnAtom(page, 'C', atomToClick);
    await dragMouseTo(xMark, yMark, page);
    await takeEditorScreenshot(page);
  });

  test('Fuse atoms together', async ({ page }) => {
    //  Test case: EPMLSOPKET-1358
    await openFileAndAddToCanvas(page, 'KET/two-benzene-with-atoms.ket');
    await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
    await clickOnAtom(page, 'C', 2);
    await dragTo(
      page,
      getAtomLocator(page, { atomLabel: 'C', atomId: 2 }),
      getAtomLocator(page, { atomLabel: 'C', atomId: 12 }),
    );
    await takeEditorScreenshot(page);
  });

  test('Deleting molecule', async ({ page }) => {
    //  Test case: EPMLSOPKET-1359
    await openFileAndAddToCanvas(page, 'Rxn-V2000/reaction_4.rxn');
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
    await clickOnAtom(page, 'Br', 0);
    await deleteByKeyboard(page);
    await takeEditorScreenshot(page);
  });

  test('Undo - Redo moving of structures', async ({ page }) => {
    // Test case: EPMLSOPKET-1360
    // Move some parts off structure - plus and arrow - then use Undo?redo
    await openFileAndAddToCanvas(page, 'Rxn-V2000/reaction_4.rxn');
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
    await waitForRender(page, async () => {
      await page.keyboard.down('Shift');
      await getPlusLocator(page).nth(1).click({ force: true });
      await getArrowLocator(page, {}).nth(0).click({ force: true });
      await getPlusLocator(page).nth(0).click({ force: true });
      await page.mouse.down();
    });
    await dragMouseTo(xMark, yMark, page);
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page, {
      maxDiffPixels: 1,
    });
    await CommonTopLeftToolbar(page).redo();
    await takeEditorScreenshot(page);
  });

  test('Drawing selection contours correctly for hovered structures', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-17664
    // Verify the bond contours are not intersected with atom contours
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/glutamine.mol');
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
    const point = await getRightAtomByAttributes(page, { label: 'N' });
    await clickOnCanvas(page, point.x, point.y, { from: 'pageTopLeft' });
    await page.mouse.move(point.x, point.y);
    await takeEditorScreenshot(page);
  });
});
