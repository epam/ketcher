import { test, expect, Page } from '@fixtures';
import { waitForPageInit, getCanvasByMode } from '@utils';
import { undoByKeyboard, redoByKeyboard } from '@utils/canvas';
import { addAtoms } from '@utils/canvas/atoms/addAtoms';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { Library } from '@tests/pages/macromolecules/Library';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import {
  bondTwoMonomers,
  getBondLocator,
} from '@utils/macromolecules/polymerBond';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';

async function expectMicroMode(page: Page) {
  await expect(getCanvasByMode(page, 'molecules')).toBeVisible();
}

async function expectMacroMode(page: Page) {
  await expect(getCanvasByMode(page, 'macromolecules')).toBeVisible();
}

const carbonCount = (page: Page) =>
  getAtomLocator(page, { atomLabel: 'C' }).count();
const tzaCount = (page: Page) => getMonomerLocator(page, Peptide.Tza).count();
const peptideBondCount = (page: Page) =>
  getBondLocator(page, { bondType: MacroBondType.Single }).count();

test.describe('Undo/redo across micro-macro mode switches', () => {
  // Pattern B: each test gets a fresh page (new browser context), so the canvas
  // is empty and the undo/redo history starts clean — no state leaks between
  // tests and no leftover fixture-cleanup history entry to account for.
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Undo reverts a micro-to-macro switch and keeps the micro structure', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/11899
     * Description: Edits made in molecules mode remain undoable after switching
     *              to macromolecules mode; undoing the switch returns to molecules
     *              mode with the structure intact.
     * Scenario:
     * 1. Add two carbon atoms in Molecules mode
     * 2. Switch to Macromolecules mode
     * 3. Press Undo
     * 4. Verify that Molecules mode is shown again and both carbons are on the canvas
     *
     * Version 3.21.0
     */
    await addAtoms(page, Atom.Carbon, [
      { x: 400, y: 300 },
      { x: 500, y: 300 },
    ]);
    expect(await carbonCount(page)).toBe(2);

    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await expectMacroMode(page);

    await CommonTopLeftToolbar(page).undo();
    await expectMicroMode(page);
    expect(await carbonCount(page)).toBe(2);
  });

  test('Undo continues into pre-switch micro edits one step at a time', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/11899
     * Description: After undoing the mode switch, further undos revert the
     *              original molecules-mode edits.
     * Scenario:
     * 1. Add two carbon atoms in Molecules mode
     * 2. Switch to Macromolecules mode
     * 3. Undo — back in Molecules mode with both carbons
     * 4. Undo — one carbon is removed
     * 5. Undo — the canvas is empty
     *
     * Version 3.21.0
     */
    await addAtoms(page, Atom.Carbon, [
      { x: 400, y: 300 },
      { x: 500, y: 300 },
    ]);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    await CommonTopLeftToolbar(page).undo();
    await expectMicroMode(page);
    expect(await carbonCount(page)).toBe(2);

    await CommonTopLeftToolbar(page).undo();
    expect(await carbonCount(page)).toBe(1);

    await CommonTopLeftToolbar(page).undo();
    expect(await carbonCount(page)).toBe(0);
  });

  test('Redo restores the micro edits and the mode switch in reverse order', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/11899
     * Description: After undoing everything (edits + switch), redo replays the
     *              edits first and re-applies the mode switch last.
     * Scenario:
     * 1. Add two carbon atoms in Molecules mode
     * 2. Switch to Macromolecules mode
     * 3. Undo three times — back to an empty Molecules canvas
     * 4. Redo — the first carbon is restored
     * 5. Redo — the second carbon is restored
     * 6. Redo — Macromolecules mode is shown again
     *
     * Version 3.21.0
     */
    await addAtoms(page, Atom.Carbon, [
      { x: 400, y: 300 },
      { x: 500, y: 300 },
    ]);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).undo();
    await expectMicroMode(page);
    expect(await carbonCount(page)).toBe(0);

    await CommonTopLeftToolbar(page).redo();
    expect(await carbonCount(page)).toBe(1);

    await CommonTopLeftToolbar(page).redo();
    expect(await carbonCount(page)).toBe(2);

    await CommonTopLeftToolbar(page).redo();
    await expectMacroMode(page);
  });

  test('Undo chain across a macro-to-micro switch reverts switch, bond and monomers', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/11899
     * Description: Monomer and bond additions in macromolecules mode remain
     *              undoable after switching to molecules mode.
     * Scenario:
     * 1. Switch to Macromolecules mode with Flex layout
     * 2. Drag two Tza monomers onto the canvas and connect them with a bond
     * 3. Switch to Molecules mode
     * 4. Undo — back in Macro mode, both monomers and the bond are intact
     * 5. Undo — the bond is removed
     * 6. Undo twice — the monomers are removed one by one
     *
     * Version 3.21.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    // Flex layout is required for dragged monomers to appear as canvas items
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    const monomer1 = getMonomerLocator(page, Peptide.Tza);
    await Library(page).dragMonomerOnCanvas(Peptide.Tza, { x: 300, y: 300 });
    await Library(page).dragMonomerOnCanvas(Peptide.Tza, { x: 450, y: 300 });
    await bondTwoMonomers(
      page,
      monomer1.nth(0),
      getMonomerLocator(page, Peptide.Tza).nth(1),
    );
    expect(await tzaCount(page)).toBe(2);
    expect(await peptideBondCount(page)).toBe(1);

    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await expectMicroMode(page);

    // undo #1 — the mode switch itself
    await CommonTopLeftToolbar(page).undo();
    await expectMacroMode(page);
    expect(await tzaCount(page)).toBe(2);
    expect(await peptideBondCount(page)).toBe(1);

    // undo #2 — the bond
    await CommonTopLeftToolbar(page).undo();
    expect(await tzaCount(page)).toBe(2);
    expect(await peptideBondCount(page)).toBe(0);

    // undo #3 and #4 — the monomers
    await CommonTopLeftToolbar(page).undo();
    expect(await tzaCount(page)).toBe(1);
    await CommonTopLeftToolbar(page).undo();
    expect(await tzaCount(page)).toBe(0);
  });

  test('A new edit after undo invalidates redo in the shared history', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/11899
     * Description: Making a new edit after undoing clears the redo portion of
     *              the shared stack, even when the undone entry was a mode switch.
     * Scenario:
     * 1. Add a carbon atom in Molecules mode
     * 2. Switch to Macromolecules mode
     * 3. Undo — back in Molecules mode with the carbon
     * 4. Add another carbon atom
     * 5. Verify that the Redo button is disabled
     *
     * Version 3.21.0
     */
    await addAtoms(page, Atom.Carbon, [{ x: 400, y: 300 }]);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    await CommonTopLeftToolbar(page).undo();
    await expectMicroMode(page);
    expect(await carbonCount(page)).toBe(1);

    await addAtoms(page, Atom.Carbon, [{ x: 500, y: 300 }]);
    expect(await carbonCount(page)).toBe(2);

    await expect(CommonTopLeftToolbar(page).redoButton).toBeDisabled();
  });

  test('Consecutive mode switches are separate undo steps', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/11899
     * Description: Each mode switch is its own history entry; a single undo
     *              reverts exactly one switch.
     * Scenario:
     * 1. Switch to Macromolecules mode
     * 2. Switch back to Molecules mode
     * 3. Undo — Macromolecules mode is shown again
     * 4. Undo — Molecules mode is shown again
     *
     * Version 3.21.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await expectMacroMode(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await expectMicroMode(page);

    await CommonTopLeftToolbar(page).undo();
    await expectMacroMode(page);

    await CommonTopLeftToolbar(page).undo();
    await expectMicroMode(page);
  });

  test('Keyboard undo and redo work in both modes after a switch', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/11899
     * Description: Ctrl+Z / Ctrl+Shift+Z revert and re-apply the mode switch
     *              from either editor without being intercepted twice.
     * Scenario:
     * 1. Add a carbon atom in Molecules mode
     * 2. Switch to Macromolecules mode
     * 3. Press Ctrl+Z — back in Molecules mode with the carbon
     * 4. Press Ctrl+Shift+Z — Macromolecules mode is shown again
     * 5. Press Ctrl+Z — back in Molecules mode with the carbon
     *
     * Version 3.21.0
     */
    await addAtoms(page, Atom.Carbon, [{ x: 400, y: 300 }]);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await expectMacroMode(page);

    await undoByKeyboard(page);
    await expectMicroMode(page);
    expect(await carbonCount(page)).toBe(1);

    await redoByKeyboard(page);
    await expectMacroMode(page);

    await undoByKeyboard(page);
    await expectMicroMode(page);
    expect(await carbonCount(page)).toBe(1);
  });

  test('Undo at the start of history is a no-op across mode switches', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/11899
     * Description: Once all entries are undone, the undo button is disabled and
     *              an extra undo changes nothing.
     * Scenario:
     * 1. Switch to Macromolecules mode and back to Molecules mode
     * 2. Undo twice — the two switch entries are exhausted, the canvas is empty
     * 3. Verify that the Undo button is disabled
     * 4. Press Ctrl+Z — nothing changes on the canvas
     *
     * Version 3.21.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();

    // A fresh page starts with an empty history, so the two switches are the
    // only two undoable entries — two undos exhaust the stack.
    await CommonTopLeftToolbar(page).undo();
    await expectMacroMode(page);
    await CommonTopLeftToolbar(page).undo();
    await expectMicroMode(page);

    await expect(CommonTopLeftToolbar(page).undoButton).toBeDisabled();
    expect(await getAtomLocator(page, {}).count()).toBe(0);

    // extra undo via keyboard — must be a no-op (clicking the disabled
    // button is not possible, so the shortcut is the safe probe)
    await undoByKeyboard(page);
    await expectMicroMode(page);
    expect(await getAtomLocator(page, {}).count()).toBe(0);
  });
});
