import { expect, test, Page, Locator } from '@fixtures';
import { openFileAndAddToCanvasAsNewProject } from '@utils';
import { dragMouseTo } from '@utils/clicks';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { getCipLabelLocator } from '@utils/canvas/cipLabels/getCipLabelLocator';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';

async function centerOf(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error('Element has no bounding box');
  }
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

async function dragFromCenter(
  page: Page,
  locator: Locator,
  x: number,
  y: number,
) {
  const center = await centerOf(locator);
  await page.mouse.move(center.x, center.y);
  await dragMouseTo(page, center.x + x, center.y + y);
}

test.describe('Move CIP labels', () => {
  let page: Page;

  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });
  test.beforeEach(async ({ MoleculesCanvas: _ }) => {
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/movable-cip-labels.ket',
    );
    await CommonLeftToolbar(page).areaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await getCipLabelLocator(page, 'atom').waitFor();
    await getCipLabelLocator(page, 'bond').waitFor();
  });

  test('Case 1 - Dragging a CIP label moves only the label', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/3672
     * Description: The R/S label follows the drag, the atoms stay in place
     * Scenario:
     * 1. Open a structure with a stereocenter and a double bond, and calculate CIP
     * 2. Drag the atom CIP label 80 px to the right and 60 px down
     * 3. Verify that the label moved by the same distance and the atoms did not move
     *
     * Version 3.21.0
     */
    const label = getCipLabelLocator(page, 'atom');
    const stereocenter = getAtomLocator(page, { atomId: 1 });
    const labelBefore = await centerOf(label);
    const stereocenterBefore = await centerOf(stereocenter);

    await dragFromCenter(page, label, 80, 60);

    const labelAfter = await centerOf(label);
    expect(labelAfter.x).toBeCloseTo(labelBefore.x + 80, 0);
    expect(labelAfter.y).toBeCloseTo(labelBefore.y + 60, 0);
    expect(await centerOf(stereocenter)).toEqual(stereocenterBefore);
  });

  test('Case 2 - Undo returns a moved CIP label and redo moves it again', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/3672
     * Description: One drag of a label is one undo step
     * Scenario:
     * 1. Open a structure with a stereocenter and a double bond, and calculate CIP
     * 2. Drag the atom CIP label 80 px to the right and 60 px down
     * 3. Press Undo and verify that the label is back at its default place
     * 4. Press Redo and verify that the label is at the dragged place again
     *
     * Version 3.21.0
     */
    const label = getCipLabelLocator(page, 'atom');
    const defaultPlace = await centerOf(label);

    await dragFromCenter(page, label, 80, 60);
    const movedPlace = await centerOf(label);

    await CommonTopLeftToolbar(page).undo();
    const afterUndo = await centerOf(label);
    expect(afterUndo.x).toBeCloseTo(defaultPlace.x, 0);
    expect(afterUndo.y).toBeCloseTo(defaultPlace.y, 0);

    await CommonTopLeftToolbar(page).redo();
    const afterRedo = await centerOf(label);
    expect(afterRedo.x).toBeCloseTo(movedPlace.x, 0);
    expect(afterRedo.y).toBeCloseTo(movedPlace.y, 0);
  });

  test('Case 3 - Calculate CIP returns moved CIP labels to their default places', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/3672
     * Description: Recalculating CIP resets the label positions
     * Scenario:
     * 1. Open a structure with a stereocenter and a double bond, and calculate CIP
     * 2. Drag the atom CIP label and the bond CIP label
     * 3. Click Calculate CIP again
     * 4. Verify that both labels are back at their default places
     *
     * Version 3.21.0
     */
    const atomLabel = getCipLabelLocator(page, 'atom');
    const bondLabel = getCipLabelLocator(page, 'bond');
    const atomDefault = await centerOf(atomLabel);
    const bondDefault = await centerOf(bondLabel);

    await dragFromCenter(page, atomLabel, 80, 60);
    await dragFromCenter(page, bondLabel, -60, 70);
    await IndigoFunctionsToolbar(page).calculateCIP();

    const atomAfter = await centerOf(atomLabel);
    const bondAfter = await centerOf(bondLabel);
    expect(atomAfter.x).toBeCloseTo(atomDefault.x, 0);
    expect(atomAfter.y).toBeCloseTo(atomDefault.y, 0);
    expect(bondAfter.x).toBeCloseTo(bondDefault.x, 0);
    expect(bondAfter.y).toBeCloseTo(bondDefault.y, 0);
  });
});
