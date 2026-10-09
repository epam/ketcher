import { test, expect, Page } from '@fixtures';
import { clickOnCanvas, moveMouseAway } from '@utils';
import { undoByKeyboard, redoByKeyboard } from '@utils/canvas';
import { keyboardPressOnCanvas } from '@utils/keyboard';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
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

let page: Page;

test.beforeAll(async ({ initMoleculesCanvas }) => {
  page = await initMoleculesCanvas();
});

test.afterAll(async ({ closePage }) => {
  await closePage();
});

test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

async function drawCarbons(points: Array<{ x: number; y: number }>) {
  await RightToolbar(page).clickAtom(Atom.Carbon);
  for (const point of points) {
    await clickOnCanvas(page, point.x, point.y);
  }
  await keyboardPressOnCanvas(page, 'Escape');
  await moveMouseAway(page);
}

async function expectMicroMode() {
  await expect(CommonTopRightToolbar(page).moleculesCanvas).toBeVisible();
}

async function expectMacroMode() {
  await expect(CommonTopRightToolbar(page).macromoleculesCanvas).toBeVisible();
}

const carbonCount = () => getAtomLocator(page, { atomLabel: 'C' }).count();
const tzaCount = () => getMonomerLocator(page, Peptide.Tza).count();
const peptideBondCount = () =>
  getBondLocator(page, { bondType: MacroBondType.Single }).count();

test.describe('Undo/redo across micro-macro mode switches', () => {
  test('Undo reverts a micro-to-macro switch and keeps the micro structure', async () => {
    /*
    Test case: https://github.com/epam/ketcher/issues/11899 - R1
    Description: Edits made in molecules mode remain undoable after switching
                 to macromolecules mode; undoing the switch returns to molecules
                 mode with the structure intact.
    */
    await drawCarbons([
      { x: CARBON_1_X, y: CARBON_1_Y },
      { x: CARBON_2_X, y: CARBON_2_Y },
    ]);
    expect(await carbonCount()).toBe(2);

    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await expectMacroMode();

    await CommonTopLeftToolbar(page).undo();
    await expectMicroMode();
    expect(await carbonCount()).toBe(2);
  });

  test('Undo continues into pre-switch micro edits one step at a time', async () => {
    /*
    Test case: https://github.com/epam/ketcher/issues/11899 - R2
    Description: After undoing the mode switch, further undos revert the
                 original molecules-mode edits.
    */
    await drawCarbons([
      { x: CARBON_1_X, y: CARBON_1_Y },
      { x: CARBON_2_X, y: CARBON_2_Y },
    ]);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    await CommonTopLeftToolbar(page).undo();
    await expectMicroMode();
    expect(await carbonCount()).toBe(2);

    await CommonTopLeftToolbar(page).undo();
    expect(await carbonCount()).toBe(1);

    await CommonTopLeftToolbar(page).undo();
    expect(await carbonCount()).toBe(0);
  });

  test('Redo restores the micro edits and the mode switch in reverse order', async () => {
    /*
    Test case: https://github.com/epam/ketcher/issues/11899 - R3
    Description: After undoing everything (edits + switch), redo replays the
                 edits first and re-applies the mode switch last.
    */
    await drawCarbons([
      { x: CARBON_1_X, y: CARBON_1_Y },
      { x: CARBON_2_X, y: CARBON_2_Y },
    ]);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).undo();
    await expectMicroMode();
    expect(await carbonCount()).toBe(0);

    await CommonTopLeftToolbar(page).redo();
    expect(await carbonCount()).toBe(1);

    await CommonTopLeftToolbar(page).redo();
    expect(await carbonCount()).toBe(2);

    await CommonTopLeftToolbar(page).redo();
    await expectMacroMode();
  });

  test('Undo chain across a macro-to-micro switch reverts switch, bond and monomers', async () => {
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
    expect(await tzaCount()).toBe(2);
    expect(await peptideBondCount()).toBe(1);

    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await expectMicroMode();

    // undo #1 — the mode switch itself
    await CommonTopLeftToolbar(page).undo();
    await expectMacroMode();
    expect(await tzaCount()).toBe(2);
    expect(await peptideBondCount()).toBe(1);

    // undo #2 — the bond
    await CommonTopLeftToolbar(page).undo();
    expect(await tzaCount()).toBe(2);
    expect(await peptideBondCount()).toBe(0);

    // undo #3 and #4 — the monomers
    await CommonTopLeftToolbar(page).undo();
    expect(await tzaCount()).toBe(1);
    await CommonTopLeftToolbar(page).undo();
    expect(await tzaCount()).toBe(0);
  });

  test('A new edit after undo invalidates redo in the shared history', async () => {
    /*
    Test case: https://github.com/epam/ketcher/issues/11899 - R5
    Description: Making a new edit after undoing clears the redo portion of
                 the shared stack, even when the undone entry was a mode switch.
    */
    await drawCarbons([{ x: CARBON_1_X, y: CARBON_1_Y }]);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    await CommonTopLeftToolbar(page).undo();
    await expectMicroMode();
    expect(await carbonCount()).toBe(1);

    await drawCarbons([{ x: CARBON_2_X, y: CARBON_2_Y }]);
    expect(await carbonCount()).toBe(2);

    const redoButton = page
      .getByTestId('redo')
      .filter({ has: page.locator(':visible') });
    await expect(redoButton).toBeDisabled();
  });

  test('Consecutive mode switches are separate undo steps', async () => {
    /*
    Test case: https://github.com/epam/ketcher/issues/11899 - R6
    Description: Each mode switch is its own history entry; a single undo
                 reverts exactly one switch.
    */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await expectMacroMode();
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await expectMicroMode();

    await CommonTopLeftToolbar(page).undo();
    await expectMacroMode();

    await CommonTopLeftToolbar(page).undo();
    await expectMicroMode();
  });

  test('Keyboard undo and redo work in both modes after a switch', async () => {
    /*
    Test case: https://github.com/epam/ketcher/issues/11899 - R7
    Description: Ctrl+Z / Ctrl+Shift+Z revert and re-apply the mode switch
                 from either editor without being intercepted twice.
    */
    await drawCarbons([{ x: CARBON_1_X, y: CARBON_1_Y }]);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await expectMacroMode();

    await undoByKeyboard(page);
    await expectMicroMode();
    expect(await carbonCount()).toBe(1);

    await redoByKeyboard(page);
    await expectMacroMode();

    await undoByKeyboard(page);
    await expectMicroMode();
    expect(await carbonCount()).toBe(1);
  });

  test('Undo at the start of history is a no-op across mode switches', async () => {
    /*
    Test case: https://github.com/epam/ketcher/issues/11899 - R8 (negative)
    Description: Once all entries are undone, the undo button is disabled and
                 an extra undo changes nothing.
    */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();

    // Undo until the stack is exhausted. Besides the two switch entries the
    // shared-page fixture leaves one entry of its own (settings reset), so
    // loop instead of hardcoding the count.
    const undoButton = page
      .getByTestId('undo')
      .filter({ has: page.locator(':visible') });
    for (let i = 0; i < 10 && !(await undoButton.isDisabled()); i++) {
      await CommonTopLeftToolbar(page).undo();
    }
    await expect(undoButton).toBeDisabled();
    await expectMicroMode();
    expect(await getAtomLocator(page, {}).count()).toBe(0);

    // extra undo via keyboard — must be a no-op (clicking the disabled
    // button is not possible, so the shortcut is the safe probe)
    await undoByKeyboard(page);
    await expectMicroMode();
    expect(await getAtomLocator(page, {}).count()).toBe(0);
  });
});
