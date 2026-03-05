/* eslint-disable no-magic-numbers */
import { test } from '@fixtures';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import { FunctionalGroupsTabItems } from '@tests/pages/constants/structureLibraryDialog/Constants';
import { BottomToolbar } from '@tests/pages/molecules/BottomToolbar';
import { StructureLibraryDialog } from '@tests/pages/molecules/canvas/StructureLibraryDialog';
import {
  takeEditorScreenshot,
  clickInTheMiddleOfTheScreen,
  moveMouseToTheMiddleOfTheScreen,
  waitForPageInit,
} from '@utils';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { getBondLocator } from '@utils/macromolecules/polymerBond';

/* Show abbreviated structure preview when hovering over atoms or bonds
 * with the template tool selected
 * related to GitHub issue: https://github.com/epam/ketcher/issues/2939
 */
test.describe('Preview for abbreviated structures: functional groups', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    // place a benzene ring in the middle of the screen
    await BottomToolbar(page).clickRing(RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Should show a preview of a functional group when hovering over atom', async ({
    page,
  }) => {
    await BottomToolbar(page).structureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.Boc,
    );
    await getAtomLocator(page, { atomId: 7 }).hover({
      force: true,
    });
    await page.waitForTimeout(200);
    await takeEditorScreenshot(page);
  });

  test('Should hide preview of a functional group when hovering over atom and then moving the mouse away', async ({
    page,
  }) => {
    await BottomToolbar(page).structureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.Boc,
    );
    await getAtomLocator(page, { atomId: 7 }).hover({
      force: true,
    });
    await page.waitForTimeout(200);
    await moveMouseToTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Should remove preview and add the functional group to atom in contracted state when clicked', async ({
    page,
  }) => {
    await BottomToolbar(page).structureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.Boc,
    );
    await getAtomLocator(page, { atomId: 7 }).click({
      force: true,
    });
    await moveMouseToTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Should remove preview when context menu is shown after right click', async ({
    page,
  }) => {
    await BottomToolbar(page).structureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.Boc,
    );
    const atom = getAtomLocator(page, { atomId: 7 });
    await atom.hover({
      force: true,
    });
    await page.waitForTimeout(200);
    await takeEditorScreenshot(page);
    await ContextMenu(page, atom).open();
    await takeEditorScreenshot(page);
  });

  test('Should show a preview for a benzene ring on bond', async ({ page }) => {
    const shiftCoords2 = { x: 10, y: 25 };
    const bondLocator = getBondLocator(page, { bondId: 7 });
    const box = await bondLocator.boundingBox();
    if (!box) throw new Error('Bond bounding box not found');

    const centerX = box.x + box.width / 2; // eslint-disable-line no-magic-numbers
    const centerY = box.y + box.height / 2; // eslint-disable-line no-magic-numbers

    await page.mouse.move(centerX + shiftCoords2.x, centerY + shiftCoords2.y);

    await takeEditorScreenshot(page);
  });

  test('Should show a preview following the mouse cursor', async ({ page }) => {
    await BottomToolbar(page).clickRing(RingButton.Benzene);
    const shiftCoords2 = { x: 100, y: 100 };
    const bondLocator = getBondLocator(page, { bondId: 7 });
    const box = await bondLocator.boundingBox();
    if (!box) throw new Error('Bond bounding box not found');

    const centerX = box.x + box.width / 2; // eslint-disable-line no-magic-numbers
    const centerY = box.y + box.height / 2; // eslint-disable-line no-magic-numbers

    await page.mouse.move(centerX + shiftCoords2.x, centerY + shiftCoords2.y);

    await takeEditorScreenshot(page);
  });

  test('Should show a preview following the mouse cursor and hide it when a bond is hovered over', async ({
    page,
  }) => {
    await BottomToolbar(page).clickRing(RingButton.Benzene);
    const shiftCoords2 = { x: 100, y: 100 };
    const bondLocator = getBondLocator(page, { bondId: 7 });
    const box = await bondLocator.boundingBox();
    if (!box) throw new Error('Bond bounding box not found');

    const centerX = box.x + box.width / 2; // eslint-disable-line no-magic-numbers
    const centerY = box.y + box.height / 2; // eslint-disable-line no-magic-numbers

    await takeEditorScreenshot(page);

    await page.mouse.move(centerX + shiftCoords2.x, centerY + shiftCoords2.y);
    await takeEditorScreenshot(page);
  });
});
