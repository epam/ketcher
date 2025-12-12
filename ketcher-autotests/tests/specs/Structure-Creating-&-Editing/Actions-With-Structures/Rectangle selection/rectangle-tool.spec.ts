import { Page, test } from '@fixtures';
import {
  clickOnCanvas,
  deleteByKeyboard,
  dragMouseTo,
  dragTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { AtomsSetting } from '@tests/pages/constants/settingsDialog/Constants';
import { setSettingsOption } from '@tests/pages/molecules/canvas/SettingsDialog';
import { getBondLocator } from '@utils/macromolecules/polymerBond';

test.describe('Rectangle selection tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  const xDelta = 30;
  const yDelta = 60;

  async function selectObjects(
    page: Page,
    xAxisRadius: number,
    yAxisRadius: number,
  ) {
    const point = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await page.mouse.move(point.x - xAxisRadius, point.y - yAxisRadius);
    await page.mouse.down();
    await page.mouse.move(point.x + xAxisRadius, point.y + yAxisRadius);
    await page.mouse.up();
    return point;
  }

  const selectionCoords = { x: 280, y: 200 };
  async function clickCanvas(page: Page) {
    await clickOnCanvas(page, selectionCoords.x, selectionCoords.y, {
      from: 'pageTopLeft',
    });
  }

  test('Structure selection with rectangle selection tool', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-1347
    await openFileAndAddToCanvas(page, 'KET/two-benzene-with-atoms.ket');
    await CommonLeftToolbar(page).areaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await clickCanvas(page);
    await selectObjects(page, selectionCoords.x, selectionCoords.y);
    await takeEditorScreenshot(page);
  });

  test('Drag structure', async ({ page }) => {
    // Test case: EPMLSOPKET-1348
    const objectSelection = 100;
    await openFileAndAddToCanvas(page, 'KET/two-benzene-with-atoms.ket');
    await CommonLeftToolbar(page).areaSelectionTool(
      SelectionToolType.Rectangle,
    );
    const point = await selectObjects(page, objectSelection, objectSelection);
    await getAtomLocator(page, { atomLabel: 'C', atomId: 19 }).click({
      force: true,
    });
    await dragMouseTo(point.x + xDelta, point.y - yDelta, page);
    await takeEditorScreenshot(page);
  });

  test('Reaction components selection', async ({ page }) => {
    //  Test case: EPMLSOPKET-1349
    const atomNumber = 5;
    const moveMouseCoordinatesY = 10;
    const moveMouseCoordinatesX = 270;
    await openFileAndAddToCanvas(page, 'Rxn-V2000/benzene-chain-reaction.rxn');
    await CommonLeftToolbar(page).areaSelectionTool(
      SelectionToolType.Rectangle,
    );
    const point = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await clickCanvas(page);

    await page.keyboard.down('Shift');
    await clickOnCanvas(
      page,
      point.x - moveMouseCoordinatesX,
      point.y + moveMouseCoordinatesY,
    );
    await clickOnCanvas(page, point.x, point.y + atomNumber, {
      from: 'pageTopLeft',
    });
    await page.keyboard.up('Shift');
    await clickCanvas(page);

    await selectAllStructuresOnCanvas(page);
    await takeEditorScreenshot(page);
  });

  test('Reaction components dragging', async ({ page }) => {
    //  Test case: EPMLSOPKET-1350
    const objectSelection = 100;
    await openFileAndAddToCanvas(page, 'Rxn-V2000/benzene-chain-reaction.rxn');
    await CommonLeftToolbar(page).areaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await clickCanvas(page);
    const point = await selectObjects(
      page,
      selectionCoords.x,
      selectionCoords.y,
    );
    await getAtomLocator(page, { atomLabel: 'C', atomId: 37 }).click({
      force: true,
    });
    await dragMouseTo(
      point.x - objectSelection,
      point.y - selectionCoords.y,
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Fusing atoms together', async ({ page }) => {
    //  Test case: EPMLSOPKET-1351
    await openFileAndAddToCanvas(page, 'KET/two-benzene-with-atoms.ket');
    await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
    await CommonLeftToolbar(page).areaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await getAtomLocator(page, { atomLabel: 'C', atomId: 2 }).click({
      force: true,
    });
    await dragTo(
      page,
      getAtomLocator(page, { atomLabel: 'C', atomId: 2 }),
      getAtomLocator(page, { atomLabel: 'C', atomId: 12 }),
    );
    await takeEditorScreenshot(page);
  });

  test('Fusing bonds together', async ({ page }) => {
    //  Test case: EPMLSOPKET-1351

    await openFileAndAddToCanvas(page, 'KET/two-benzene-with-atoms.ket');
    await CommonLeftToolbar(page).areaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await getBondLocator(page, { bondId: 21 }).click({ force: true });

    const bondLocator = getBondLocator(page, { bondId: 29 });
    const box = await bondLocator.boundingBox();
    if (!box) throw new Error('Bond bounding box not found');

    const centerX = box.x + box.width / 2; // eslint-disable-line no-magic-numbers
    const centerY = box.y + box.height / 2; // eslint-disable-line no-magic-numbers

    await dragMouseTo(centerX, centerY, page);

    await takeEditorScreenshot(page);
  });

  test('Delete with selection', async ({ page }) => {
    //  Test case: EPMLSOPKET-1352

    async function selectReactionLeftPart() {
      const shift = 5;
      const emptySpace = { x: 100, y: 100 };
      const mostRightAtom = await getAtomLocator(page, { atomLabel: 'Br' })
        .first()
        .boundingBox();
      await page.mouse.move(emptySpace.x, emptySpace.y);
      if (mostRightAtom) {
        await dragMouseTo(
          mostRightAtom.x + mostRightAtom.width + shift,
          mostRightAtom.y + mostRightAtom.height + shift,
          page,
        );
      }
    }
    await openFileAndAddToCanvas(page, 'Rxn-V2000/benzene-chain-reaction.rxn');
    await CommonLeftToolbar(page).areaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await selectReactionLeftPart();
    await deleteByKeyboard(page);
    await getAtomLocator(page, { atomLabel: 'C', atomId: 41 }).click({
      force: true,
    });
    await deleteByKeyboard(page);
    await takeEditorScreenshot(page);
  });
});
