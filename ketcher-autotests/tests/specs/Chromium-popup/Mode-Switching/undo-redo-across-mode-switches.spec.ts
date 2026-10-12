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

const CARBON_1_X = 400;
const CARBON_1_Y = 300;
const CARBON_2_X = 500;
const CARBON_2_Y = 300;
const MONOMER_1_X = 300;
const MONOMER_1_Y = 300;
const MONOMER_2_X = 450;
const MONOMER_2_Y = 300;

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
    Test case: https://github.com/epam/ketcher/issues/11899 - R1
    Description: Edits made in molecules mode remain undoable after switching
                 to macromolecules mode; undoing the switch returns to molecules
                 mode with the structure intact.
    */
    await addAtoms(page, Atom.Carbon, [
      { x: CARBON_1_X, y: CARBON_1_Y },
      { x: CARBON_2_X, y: CARBON_2_Y },
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
    Test case: https://github.com/epam/ketcher/issues/11899 - R2
    Description: After undoing the mode switch, further undos revert the
                 original molecules-mode edits.
    */
    await addAtoms(page, Atom.Carbon, [
      { x: CARBON_1_X, y: CARBON_1_Y },
      { x: CARBON_2_X, y: CARBON_2_Y },
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
    Test case: https://github.com/epam/ketcher/issues/11899 - R3
    Description: After undoing everything (edits + switch), redo replays the
                 edits first and re-applies the mode switch last.
    */
    await addAtoms(page, Atom.Carbon, [
      { x: CARBON_1_X, y: CARBON_1_Y },
      { x: CARBON_2_X, y: CARBON_2_Y },
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
    Test case: https://github.com/epam/ketcher/issues/11899 - R4
    Description: Monomer and bond additions in macromolecules mode remain
                 undoable after switching to molecules mode.
    */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    // Flex layout is required for dragged monomers to appear as canvas items
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    const monomer1 = getMonomerLocator(page, Peptide.Tza);
    await Library(page).dragMonomerOnCanvas(Peptide.Tza, {
      x: MONOMER_1_X,
      y: MONOMER_1_Y,
    });
    await Library(page).dragMonomerOnCanvas(Peptide.Tza, {
      x: MONOMER_2_X,
      y: MONOMER_2_Y,
    });
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
    Test case: https://github.com/epam/ketcher/issues/11899 - R5
    Description: Making a new edit after undoing clears the redo portion of
                 the shared stack, even when the undone entry was a mode switch.
    */
    await addAtoms(page, Atom.Carbon, [{ x: CARBON_1_X, y: CARBON_1_Y }]);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    await CommonTopLeftToolbar(page).undo();
    await expectMicroMode(page);
    expect(await carbonCount(page)).toBe(1);

    await addAtoms(page, Atom.Carbon, [{ x: CARBON_2_X, y: CARBON_2_Y }]);
    expect(await carbonCount(page)).toBe(2);

    const redoButton = page
      .getByTestId('redo')
      .filter({ has: page.locator(':visible') });
    await expect(redoButton).toBeDisabled();
  });

  test('Consecutive mode switches are separate undo steps', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/11899 - R6
    Description: Each mode switch is its own history entry; a single undo
                 reverts exactly one switch.
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
    Test case: https://github.com/epam/ketcher/issues/11899 - R7
    Description: Ctrl+Z / Ctrl+Shift+Z revert and re-apply the mode switch
                 from either editor without being intercepted twice.
    */
    await addAtoms(page, Atom.Carbon, [{ x: CARBON_1_X, y: CARBON_1_Y }]);
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
    Test case: https://github.com/epam/ketcher/issues/11899 - R8 (negative)
    Description: Once all entries are undone, the undo button is disabled and
                 an extra undo changes nothing.
    */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();

    // A fresh page starts with an empty history, so the two switches are the
    // only two undoable entries — two undos exhaust the stack.
    await CommonTopLeftToolbar(page).undo();
    await expectMacroMode(page);
    await CommonTopLeftToolbar(page).undo();
    await expectMicroMode(page);

    const undoButton = page
      .getByTestId('undo')
      .filter({ has: page.locator(':visible') });
    await expect(undoButton).toBeDisabled();
    expect(await getAtomLocator(page, {}).count()).toBe(0);

    // extra undo via keyboard — must be a no-op (clicking the disabled
    // button is not possible, so the shortcut is the safe probe)
    await undoByKeyboard(page);
    await expectMicroMode(page);
    expect(await getAtomLocator(page, {}).count()).toBe(0);
  });
});
