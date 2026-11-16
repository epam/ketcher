import { test, expect, Page } from '@fixtures';
import { waitForPageInit, getCanvasByMode } from '@utils';
import { addAtoms } from '@utils/canvas/atoms/addAtoms';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { Library } from '@tests/pages/macromolecules/Library';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { getBondLocator } from '@utils/macromolecules/polymerBond';
import { MicroBondTool } from '@tests/pages/constants/bondSelectionTool/Constants';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { MonomerOption } from '@tests/pages/constants/contextMenu/Constants';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { ArrowTool } from '@tests/pages/constants/arrowSelectionTool/Constants';
import { getArrowLocator } from '@utils/canvas/arrow-signes/getArrowLocator';
import { clickOnCanvas, dragTo } from '@utils/clicks';

async function expectMicroMode(page: Page) {
  await expect(getCanvasByMode(page, 'molecules')).toBeVisible();
}

async function expectMacroMode(page: Page) {
  await expect(getCanvasByMode(page, 'macromolecules')).toBeVisible();
}

test.describe('Retain history between macro and micro molecules modes', () => {
  // Pattern B: every case asserts history order or boundaries, so each test
  // starts from a fresh page with an empty undo/redo stack.
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Case 7 - Reaction arrow edits in Macro remain undoable after switching to Micro', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12672
     * Description: A reaction arrow moved in Macro retains its position history.
     * Scenario:
     * 1. Draw an arrow in Micro and move it in Macro
     * 2. Switch to Micro and undo the switch and movement
     * 3. Redo the movement and switch and verify the arrow remains present
     *
     * Version 3.21.0
     */
    await LeftToolbar(page).selectArrowTool(ArrowTool.ArrowOpenAngle);
    await clickOnCanvas(page, 200, 200);
    await expect(getArrowLocator(page)).toHaveCount(1);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await CommonLeftToolbar(page).areaSelectionTool();
    const arrow = getArrowLocator(page).filter({ visible: true });
    const initial = await arrow.boundingBox();
    if (!initial) throw new Error('Reaction arrow is not visible');
    await dragTo(page, arrow, {
      x: initial.x + initial.width / 2 + 70,
      y: initial.y + initial.height / 2 + 70,
    });
    const moved = await arrow.boundingBox();
    if (!moved) throw new Error('Moved reaction arrow is not visible');
    expect(moved.x).toBeGreaterThan(initial.x + 30);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await CommonTopLeftToolbar(page).undo();
    await expectMacroMode(page);
    await expect(arrow).toHaveCount(1);
    await CommonTopLeftToolbar(page).undo();
    const restored = await arrow.boundingBox();
    if (!restored) throw new Error('Restored reaction arrow is not visible');
    expect(restored.x).toBeCloseTo(initial.x, 0);
    expect(restored.y).toBeCloseTo(initial.y, 0);
    await CommonTopLeftToolbar(page).redo();
    const redone = await arrow.boundingBox();
    if (!redone) throw new Error('Redone reaction arrow is not visible');
    expect(redone.x).toBeCloseTo(moved.x, 0);
    expect(redone.y).toBeCloseTo(moved.y, 0);
    await CommonTopLeftToolbar(page).redo();
    await expectMicroMode(page);
    await expect(arrow).toHaveCount(1);
  });

  test('Case 9 - Monomer deletion and additions survive switches in a mixed history', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12672
     * Description: Undo and redo replay micro edits, mode switches, and macro
     *              monomer addition and deletion in the original order.
     * Scenario:
     * 1. Add a carbon and a bond in Molecules mode, then switch to Macro
     * 2. Add two monomers and delete one, then switch back to Molecules mode
     * 3. Undo the switch, deletion, additions, and first switch and carbon
     * 4. Redo each action and verify the corresponding mode and structure
     *
     * Version 3.21.0
     */
    await addAtoms(page, Atom.Carbon, [{ x: 400, y: 300 }]);
    await expect(getAtomLocator(page, { atomLabel: 'C' })).toHaveCount(1);
    await CommonLeftToolbar(page).bondTool(MicroBondTool.Single);
    await getAtomLocator(page, { atomLabel: 'C' }).click();
    await expect(getBondLocator(page, {})).toHaveCount(1);
    await expect(getAtomLocator(page, { atomLabel: 'C' })).toHaveCount(2);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await Library(page).dragMonomerOnCanvas(Peptide.Tza, { x: 300, y: 300 });
    await Library(page).dragMonomerOnCanvas(Peptide.Tza, { x: 150, y: 300 });
    await expect(getMonomerLocator(page, Peptide.Tza)).toHaveCount(2);
    await ContextMenu(page, getMonomerLocator(page, Peptide.Tza).first()).click(
      MonomerOption.Delete,
    );
    await expect(getMonomerLocator(page, Peptide.Tza)).toHaveCount(1);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await expectMicroMode(page);
    await expect(getAtomLocator(page, { atomLabel: 'C' })).toHaveCount(2);
    await expect(getBondLocator(page, {})).toHaveCount(1);

    await CommonTopLeftToolbar(page).undo();
    await expectMacroMode(page);
    await expect(getMonomerLocator(page, Peptide.Tza)).toHaveCount(1);
    await CommonTopLeftToolbar(page).undo();
    await expect(getMonomerLocator(page, Peptide.Tza)).toHaveCount(2);
    await CommonTopLeftToolbar(page).undo();
    await expect(getMonomerLocator(page, Peptide.Tza)).toHaveCount(1);
    await CommonTopLeftToolbar(page).undo();
    await expect(getMonomerLocator(page, Peptide.Tza)).toHaveCount(0);
    await CommonTopLeftToolbar(page).undo();
    await expectMicroMode(page);
    await expect(getAtomLocator(page, { atomLabel: 'C' })).toHaveCount(2);
    await expect(getBondLocator(page, {})).toHaveCount(1);
    await CommonTopLeftToolbar(page).undo();
    await expect(getAtomLocator(page, { atomLabel: 'C' })).toHaveCount(1);
    await expect(getBondLocator(page, {})).toHaveCount(0);
    await CommonTopLeftToolbar(page).undo();
    await expect(getAtomLocator(page, { atomLabel: 'C' })).toHaveCount(0);
    await expect(CommonTopLeftToolbar(page).undoButton).toBeDisabled();

    await CommonTopLeftToolbar(page).redo();
    await expect(getAtomLocator(page, { atomLabel: 'C' })).toHaveCount(1);
    await CommonTopLeftToolbar(page).redo();
    await expect(getAtomLocator(page, { atomLabel: 'C' })).toHaveCount(2);
    await expect(getBondLocator(page, {})).toHaveCount(1);
    await CommonTopLeftToolbar(page).redo();
    await expectMacroMode(page);
    await expect(getMonomerLocator(page, Peptide.Tza)).toHaveCount(0);
    await CommonTopLeftToolbar(page).redo();
    await expect(getMonomerLocator(page, Peptide.Tza)).toHaveCount(1);
    await CommonTopLeftToolbar(page).redo();
    await expect(getMonomerLocator(page, Peptide.Tza)).toHaveCount(2);
    await CommonTopLeftToolbar(page).redo();
    await expect(getMonomerLocator(page, Peptide.Tza)).toHaveCount(1);
    await CommonTopLeftToolbar(page).redo();
    await expectMicroMode(page);
    await expect(getAtomLocator(page, { atomLabel: 'C' })).toHaveCount(2);
    await expect(getBondLocator(page, {})).toHaveCount(1);
    await expect(CommonTopLeftToolbar(page).redoButton).toBeDisabled();
  });

  test('Case 12 - A longer history remains traversable across repeated mode switches', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12672
     * Description: Multiple edits and switches remain ordered throughout a
     *              complete undo and redo traversal.
     * Scenario:
     * 1. Add six separate carbons, switching to Macro and back after each pair
     * 2. Undo all edits and switches, checking each mode and atom count
     * 3. Redo all edits and switches, checking each mode and atom count
     *
     * Version 3.21.0
     */
    test.setTimeout(120_000);
    for (let pair = 0; pair < 3; pair++) {
      await addAtoms(page, Atom.Carbon, [
        { x: 300 + pair * 100, y: 250 },
        { x: 300 + pair * 100, y: 350 },
      ]);
      await expect(getAtomLocator(page, { atomLabel: 'C' })).toHaveCount(
        (pair + 1) * 2,
      );
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    }
    for (let pair = 3; pair > 0; pair--) {
      await CommonTopLeftToolbar(page).undo();
      await expectMacroMode(page);
      await CommonTopLeftToolbar(page).undo();
      await expectMicroMode(page);
      await expect(getAtomLocator(page, { atomLabel: 'C' })).toHaveCount(
        pair * 2,
      );
      await CommonTopLeftToolbar(page).undo();
      await expect(getAtomLocator(page, { atomLabel: 'C' })).toHaveCount(
        pair * 2 - 1,
      );
      await CommonTopLeftToolbar(page).undo();
      await expect(getAtomLocator(page, { atomLabel: 'C' })).toHaveCount(
        pair * 2 - 2,
      );
    }
    await expect(CommonTopLeftToolbar(page).undoButton).toBeDisabled();

    for (let pair = 0; pair < 3; pair++) {
      await CommonTopLeftToolbar(page).redo();
      await expect(getAtomLocator(page, { atomLabel: 'C' })).toHaveCount(
        pair * 2 + 1,
      );
      await CommonTopLeftToolbar(page).redo();
      await expect(getAtomLocator(page, { atomLabel: 'C' })).toHaveCount(
        pair * 2 + 2,
      );
      await CommonTopLeftToolbar(page).redo();
      await expectMacroMode(page);
      await CommonTopLeftToolbar(page).redo();
      await expectMicroMode(page);
      await expect(getAtomLocator(page, { atomLabel: 'C' })).toHaveCount(
        pair * 2 + 2,
      );
    }
    await expect(CommonTopLeftToolbar(page).redoButton).toBeDisabled();
  });
});
