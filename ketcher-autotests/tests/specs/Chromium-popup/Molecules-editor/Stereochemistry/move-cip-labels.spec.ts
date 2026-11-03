import { expect, test, Page, Locator } from '@fixtures';
import { openFileAndAddToCanvasAsNewProject } from '@utils';
import { dragMouseTo } from '@utils/clicks';
import { getKet, setMolecule } from '@utils/formats';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
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
  shift: { x: number; y: number },
) {
  const { x, y } = await centerOf(locator);
  await page.mouse.move(x, y);
  await dragMouseTo(page, x + shift.x, y + shift.y);
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
    await getCipLabelLocator(page, { owner: 'atom' }).waitFor();
    await getCipLabelLocator(page, { owner: 'bond' }).waitFor();
  });

  test('Case 1 - Dragging the CIP label of an atom moves only the label', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/3672
     * Description: The R/S label of a stereocenter follows the drag, the atoms stay in place
     * Scenario:
     * 1. Open a structure with a stereocenter and a double bond, and calculate CIP
     * 2. Drag the atom CIP label 80 px to the right and 60 px down
     * 3. Verify that the label moved by the same distance
     * 4. Verify that the stereocenter and the fluorine atom did not move
     *
     * Version 3.21.0
     */
    const label = getCipLabelLocator(page, { owner: 'atom' });
    const stereocenter = getAtomLocator(page, { atomId: 1 });
    const fluorine = getAtomLocator(page, { atomLabel: 'F' });
    const labelBefore = await centerOf(label);
    const stereocenterBefore = await centerOf(stereocenter);
    const fluorineBefore = await centerOf(fluorine);

    await dragFromCenter(page, label, { x: 80, y: 60 });

    const labelAfter = await centerOf(label);
    expect(labelAfter.x).toBeCloseTo(labelBefore.x + 80, 0);
    expect(labelAfter.y).toBeCloseTo(labelBefore.y + 60, 0);
    expect(await centerOf(stereocenter)).toEqual(stereocenterBefore);
    expect(await centerOf(fluorine)).toEqual(fluorineBefore);
  });

  test('Case 2 - Dragging the CIP label of a double bond moves only the label', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/3672
     * Description: The E/Z label of a double bond follows the drag, the atoms stay in place
     * Scenario:
     * 1. Open a structure with a stereocenter and a double bond, and calculate CIP
     * 2. Drag the bond CIP label 60 px to the left and 70 px down
     * 3. Verify that the label moved by the same distance
     * 4. Verify that the atoms of the double bond did not move
     *
     * Version 3.21.0
     */
    const label = getCipLabelLocator(page, { owner: 'bond' });
    const firstAtom = getAtomLocator(page, { atomId: 3 });
    const secondAtom = getAtomLocator(page, { atomId: 4 });
    const labelBefore = await centerOf(label);
    const firstAtomBefore = await centerOf(firstAtom);
    const secondAtomBefore = await centerOf(secondAtom);

    await dragFromCenter(page, label, { x: -60, y: 70 });

    const labelAfter = await centerOf(label);
    expect(labelAfter.x).toBeCloseTo(labelBefore.x - 60, 0);
    expect(labelAfter.y).toBeCloseTo(labelBefore.y + 70, 0);
    expect(await centerOf(firstAtom)).toEqual(firstAtomBefore);
    expect(await centerOf(secondAtom)).toEqual(secondAtomBefore);
  });

  test('Case 3 - A moved CIP label keeps its place relative to the structure when the structure is moved', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/3672
     * Description: Moving the whole structure carries the moved label along
     * Scenario:
     * 1. Open a structure with a stereocenter and a double bond, and calculate CIP
     * 2. Drag the atom CIP label 80 px to the right and 60 px down
     * 3. Select all and drag the structure 50 px to the right and 30 px down
     * 4. Verify that the label moved by 50 px and 30 px as well
     *
     * Version 3.21.0
     */
    const label = getCipLabelLocator(page, { owner: 'atom' });
    await dragFromCenter(page, label, { x: 80, y: 60 });
    const labelBefore = await centerOf(label);

    await selectAllStructuresOnCanvas(page);
    await dragFromCenter(page, getAtomLocator(page, { atomId: 1 }), {
      x: 50,
      y: 30,
    });

    const labelAfter = await centerOf(label);
    expect(labelAfter.x).toBeCloseTo(labelBefore.x + 50, 0);
    expect(labelAfter.y).toBeCloseTo(labelBefore.y + 30, 0);
  });

  test('Case 4 - Undo returns a moved CIP label and redo moves it again', async () => {
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
    const label = getCipLabelLocator(page, { owner: 'atom' });
    const defaultPlace = await centerOf(label);

    await dragFromCenter(page, label, { x: 80, y: 60 });
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

  test('Case 5 - Calculate CIP returns moved CIP labels to their default places', async () => {
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
    const atomLabel = getCipLabelLocator(page, { owner: 'atom' });
    const bondLabel = getCipLabelLocator(page, { owner: 'bond' });
    const atomLabelDefault = await centerOf(atomLabel);
    const bondLabelDefault = await centerOf(bondLabel);

    await dragFromCenter(page, atomLabel, { x: 80, y: 60 });
    await dragFromCenter(page, bondLabel, { x: -60, y: 70 });
    await IndigoFunctionsToolbar(page).calculateCIP();

    const atomLabelAfter = await centerOf(atomLabel);
    const bondLabelAfter = await centerOf(bondLabel);
    expect(atomLabelAfter.x).toBeCloseTo(atomLabelDefault.x, 0);
    expect(atomLabelAfter.y).toBeCloseTo(atomLabelDefault.y, 0);
    expect(bondLabelAfter.x).toBeCloseTo(bondLabelDefault.x, 0);
    expect(bondLabelAfter.y).toBeCloseTo(bondLabelDefault.y, 0);
  });

  test('Case 6 - A moved CIP label is shown at its default place after the structure is saved and opened again', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/3672
     * Description: Moved positions are not part of the saved structure
     * Scenario:
     * 1. Open a structure with a stereocenter and a double bond, and calculate CIP
     * 2. Drag the atom CIP label 80 px to the right and 60 px down
     * 3. Get the structure as KET and open it again on the canvas
     * 4. Verify that the label has the same place relative to its atom as before the move
     *
     * Version 3.21.0
     */
    const label = getCipLabelLocator(page, { owner: 'atom' });
    const stereocenter = getAtomLocator(page, { atomId: 1 });
    const labelBefore = await centerOf(label);
    const stereocenterBefore = await centerOf(stereocenter);

    await dragFromCenter(page, label, { x: 80, y: 60 });
    await setMolecule(page, await getKet(page));
    await label.waitFor();

    const labelAfter = await centerOf(label);
    const stereocenterAfter = await centerOf(stereocenter);
    expect(labelAfter.x - stereocenterAfter.x).toBeCloseTo(
      labelBefore.x - stereocenterBefore.x,
      0,
    );
    expect(labelAfter.y - stereocenterAfter.y).toBeCloseTo(
      labelBefore.y - stereocenterBefore.y,
      0,
    );
  });
});
