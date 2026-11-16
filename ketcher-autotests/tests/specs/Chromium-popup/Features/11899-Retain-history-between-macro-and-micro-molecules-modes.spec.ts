import { test, expect, Page, Locator } from '@fixtures';
import { waitForPageInit, getCanvasByMode } from '@utils';
import { addAtoms } from '@utils/canvas/atoms/addAtoms';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { Library } from '@tests/pages/macromolecules/Library';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { getBondLocator } from '@utils/macromolecules/polymerBond';
import { Mode } from '@tests/pages/constants/commonTopRightToolbar/Constants';
import {
  openFileAndAddToCanvasMacro,
  pasteFromClipboardAndAddToCanvas,
} from '@utils/files/readFile';
import { getKet } from '@utils/formats';
import { MicroBondTool } from '@tests/pages/constants/bondSelectionTool/Constants';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { MonomerOption } from '@tests/pages/constants/contextMenu/Constants';
import {
  getArrowLocator,
  getPlusLocator,
} from '@utils/canvas/arrow-signes/getArrowLocator';
import { clickInTheMiddleOfTheCanvas } from '@utils/clicks';

// The inactive editor keeps its rendered elements in the DOM, so counts are
// scoped to the visible canvas. A visibility filter on the elements themselves
// is not enough: a horizontal bond has zero height and counts as hidden.
const onActiveCanvas = (page: Page, elements: Locator) =>
  getCanvasByMode(page, 'molecules')
    .or(getCanvasByMode(page, 'macromolecules'))
    .filter({ visible: true })
    .locator(elements);
const visibleAtoms = (page: Page, atomLabel?: string) =>
  onActiveCanvas(page, getAtomLocator(page, atomLabel ? { atomLabel } : {}));
const visibleBonds = (page: Page) =>
  onActiveCanvas(page, getBondLocator(page, {}));
const tzaMonomers = (page: Page) => getMonomerLocator(page, Peptide.Tza);

type CanvasState = {
  mode?: 'micro' | 'macro';
  atoms?: number;
  bonds?: number;
  arrows?: number;
  tza?: number;
};

async function expectCanvas(page: Page, state: CanvasState) {
  if (state.mode) {
    const mode = state.mode === 'micro' ? 'molecules' : 'macromolecules';
    await expect(getCanvasByMode(page, mode)).toBeVisible();
  }
  if (state.atoms !== undefined) {
    await expect(visibleAtoms(page)).toHaveCount(state.atoms);
  }
  if (state.bonds !== undefined) {
    await expect(visibleBonds(page)).toHaveCount(state.bonds);
  }
  if (state.arrows !== undefined) {
    await expect(onActiveCanvas(page, getArrowLocator(page))).toHaveCount(
      state.arrows,
    );
  }
  if (state.tza !== undefined) {
    await expect(tzaMonomers(page)).toHaveCount(state.tza);
  }
}

async function undo(page: Page, expected: CanvasState = {}) {
  await CommonTopLeftToolbar(page).undo();
  await expectCanvas(page, expected);
}

async function redo(page: Page, expected: CanvasState = {}) {
  await CommonTopLeftToolbar(page).redo();
  await expectCanvas(page, expected);
}

// Undo/Redo buttons in Macromolecules mode stay enabled regardless of the
// history state, so their disabled state is asserted only in Molecules mode.
async function expectHistoryStart(page: Page) {
  await expect(CommonTopLeftToolbar(page).undoButton).toBeDisabled();
}

async function expectHistoryEnd(page: Page) {
  await expect(CommonTopLeftToolbar(page).redoButton).toBeDisabled();
}

// Flex layout renders both monomers and micro structures on the Macro canvas
async function switchToMacro(page: Page) {
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
    enableFlexMode: true,
  });
}

async function switchToMicro(page: Page) {
  await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
}

async function addBenzene(page: Page) {
  await pasteFromClipboardAndAddToCanvas(page, 'C1=CC=CC=C1');
  // the pasted structure follows the cursor until the canvas is clicked
  await clickInTheMiddleOfTheCanvas(page);
  await expectCanvas(page, { atoms: 6, bonds: 6 });
}

async function addReactionInMacro(page: Page) {
  await openFileAndAddToCanvasMacro(
    page,
    'KET/reaction-with-arrow-and-plus.ket',
  );
}

async function addTza(page: Page, x: number, y: number) {
  await Library(page).dragMonomerOnCanvas(Peptide.Tza, { x, y });
}

test.describe('Retain history between macro and micro molecules modes', () => {
  // Pattern B: every case asserts history order or boundaries, so each test
  // starts from a fresh page with an empty undo/redo stack.
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Case 1 - Molecule added in Micro is undoable after switching to Macro', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12672
     * Description: A molecule added in Molecules mode can still be removed by
     *              Undo after switching to Macromolecules mode.
     * Scenario:
     * 1. Add benzene in Molecules mode
     * 2. Switch to Macromolecules mode
     * 3. Undo — Molecules mode is shown with benzene
     * 4. Undo — benzene is removed and Undo is disabled
     *
     * Version 3.21.0
     */
    await addBenzene(page);
    await switchToMacro(page);

    await undo(page, { mode: 'micro', atoms: 6 });
    await undo(page, { atoms: 0 });
    await expectHistoryStart(page);
  });

  test('Case 2 - Undoing the molecule addition keeps the mode switch as its own history entry', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12672
     * Description: After the molecule addition is undone, Redo re-applies the
     *              addition first and the mode switch as a separate next step.
     * Scenario:
     * 1. Add benzene in Molecules mode and switch to Macromolecules mode
     * 2. Undo twice — the canvas is empty in Molecules mode
     * 3. Redo — benzene is restored and Molecules mode stays active
     * 4. Redo — Macromolecules mode is shown
     * 5. Redo again — nothing changes; Undo returns to Molecules mode with
     *    benzene
     *
     * Version 3.21.0
     */
    await addBenzene(page);
    await switchToMacro(page);
    await undo(page);
    await undo(page, { mode: 'micro', atoms: 0 });

    await redo(page, { mode: 'micro', atoms: 6 });
    await expect(CommonTopLeftToolbar(page).redoButton).toBeEnabled();
    await redo(page, { mode: 'macro', atoms: 6 });

    // the switch was the last entry: an extra Redo changes nothing
    await redo(page, { mode: 'macro' });
    await undo(page, { mode: 'micro', atoms: 6 });
  });

  test('Case 3 - Monomer added in Macro is undoable after switching to Micro', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12672
     * Description: A monomer added in Macromolecules mode can still be removed
     *              by Undo after switching to Molecules mode.
     * Scenario:
     * 1. Switch to Macromolecules mode (Flex) and add a Tza monomer
     * 2. Switch to Molecules mode
     * 3. Undo — Macromolecules mode is shown with the monomer
     * 4. Undo — the monomer is removed
     *
     * Version 3.21.0
     */
    await switchToMacro(page);
    await addTza(page, 300, 300);
    await expectCanvas(page, { tza: 1 });
    await switchToMicro(page);

    await undo(page, { mode: 'macro', tza: 1 });
    await undo(page, { mode: 'macro', tza: 0 });
  });

  test('Case 4 - Undoing the monomer addition keeps the mode switch as its own history entry', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12672
     * Description: After the monomer addition is undone, Redo re-applies the
     *              addition first and the switch to Molecules mode next.
     * Scenario:
     * 1. Switch to Macromolecules mode (Flex), add a Tza monomer, switch to
     *    Molecules mode
     * 2. Undo twice — the monomer is removed in Macromolecules mode
     * 3. Redo — the monomer is restored and Macromolecules mode stays active
     * 4. Redo — Molecules mode is shown and Redo is disabled
     *
     * Version 3.21.0
     */
    await switchToMacro(page);
    await addTza(page, 300, 300);
    await switchToMicro(page);
    await undo(page);
    await undo(page, { tza: 0 });

    await redo(page, { mode: 'macro', tza: 1 });
    await redo(page, { mode: 'micro' });
    await expectHistoryEnd(page);
  });

  test('Case 5 - Atoms added in Micro are undone in reverse order after a switch', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12672
     * Description: Atoms added before a mode switch are removed one per Undo,
     *              latest first.
     * Scenario:
     * 1. Add a carbon atom, then a nitrogen atom in Molecules mode
     * 2. Switch to Macromolecules mode
     * 3. Undo — Molecules mode is shown with both atoms
     * 4. Undo — only the nitrogen atom is removed
     * 5. Undo — the carbon atom is removed
     *
     * Version 3.21.0
     */
    await addAtoms(page, Atom.Carbon, [{ x: 300, y: 300 }]);
    await addAtoms(page, Atom.Nitrogen, [{ x: 400, y: 300 }]);
    await switchToMacro(page);

    await undo(page, { mode: 'micro', atoms: 2 });
    await expect(visibleAtoms(page, 'N')).toHaveCount(1);
    await undo(page, { atoms: 1 });
    await expect(visibleAtoms(page, 'C')).toHaveCount(1);
    await undo(page, { atoms: 0 });
  });

  test('Case 6 - Bond added before a switch is undone as a separate step', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12672
     * Description: A bond added in Molecules mode is its own history entry
     *              behind the mode switch.
     * Scenario:
     * 1. Add a carbon atom and draw a single bond from it in Molecules mode
     * 2. Switch to Macromolecules mode
     * 3. Undo — Molecules mode is shown with two atoms and one bond
     * 4. Undo — the bond and its new atom are removed, the first atom stays
     * 5. Undo — the canvas is empty
     *
     * Version 3.21.0
     */
    await addAtoms(page, Atom.Carbon, [{ x: 400, y: 300 }]);
    await CommonLeftToolbar(page).bondTool(MicroBondTool.Single);
    await visibleAtoms(page, 'C').click();
    await expectCanvas(page, { atoms: 2, bonds: 1 });
    await switchToMacro(page);

    await undo(page, { mode: 'micro', atoms: 2, bonds: 1 });
    await undo(page, { atoms: 1, bonds: 0 });
    await undo(page, { atoms: 0 });
  });

  test('Case 7 - Reaction added in Macro is undoable after switching to Micro', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12672
     * Description: A reaction added in Macromolecules mode is one history entry
     *              that stays undoable and redoable across a switch.
     * Scenario:
     * 1. Switch to Macromolecules mode (Flex) and open a reaction with an
     *    arrow, a plus and three molecules
     * 2. Switch to Molecules mode
     * 3. Undo — Macromolecules mode is shown with the reaction
     * 4. Undo — the reaction is removed
     * 5. Redo — the reaction is restored
     * 6. Redo — Molecules mode is shown with the reaction
     *
     * Version 3.21.0
     */
    await switchToMacro(page);
    await addReactionInMacro(page);
    await expectCanvas(page, { arrows: 1, atoms: 16 });
    await switchToMicro(page);

    await undo(page, { mode: 'macro', arrows: 1 });
    await undo(page, { arrows: 0, atoms: 0 });
    await expect(onActiveCanvas(page, getPlusLocator(page))).toHaveCount(0);

    await redo(page, { arrows: 1, atoms: 16 });
    await redo(page, { mode: 'micro', arrows: 1, atoms: 16 });
  });

  test('Case 8 - One molecule edited in both modes keeps every edit in history', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12672
     * Description: Edits of the same molecule made in Molecules and in
     *              Macromolecules mode are all separate history entries.
     * Scenario:
     * 1. Add benzene in Molecules mode
     * 2. Switch to Macromolecules mode (Flex) and erase one benzene bond
     * 3. Switch to Molecules mode and add a nitrogen atom
     * 4. Undo five times, checking mode, atoms and bonds after each step
     * 5. Redo five times, checking mode, atoms and bonds after each step
     *
     * Version 3.21.0
     */
    await addBenzene(page);
    await switchToMacro(page);
    await CommonLeftToolbar(page).erase();
    // micro bonds in Macro mode accept the Erase click only when forced
    await visibleBonds(page).first().click({ force: true });
    await expectCanvas(page, { bonds: 5 });
    await switchToMicro(page);
    await addAtoms(page, Atom.Nitrogen, [{ x: 300, y: 450 }]);
    await expectCanvas(page, { atoms: 7, bonds: 5 });

    // undo: nitrogen, switch, erased bond, switch, benzene
    await undo(page, { mode: 'micro', atoms: 6, bonds: 5 });
    await undo(page, { mode: 'macro', bonds: 5 });
    await undo(page, { mode: 'macro', bonds: 6 });
    await undo(page, { mode: 'micro', atoms: 6, bonds: 6 });
    await undo(page, { atoms: 0 });

    await redo(page, { mode: 'micro', atoms: 6, bonds: 6 });
    await redo(page, { mode: 'macro', bonds: 6 });
    await redo(page, { mode: 'macro', bonds: 5 });
    await redo(page, { mode: 'micro', atoms: 6, bonds: 5 });
    await redo(page, { atoms: 7 });
    await expectHistoryEnd(page);
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
    await CommonLeftToolbar(page).bondTool(MicroBondTool.Single);
    await visibleAtoms(page, 'C').click();
    await expectCanvas(page, { atoms: 2, bonds: 1 });
    await switchToMacro(page);
    await addTza(page, 300, 300);
    await addTza(page, 150, 300);
    await expectCanvas(page, { tza: 2 });
    await ContextMenu(page, tzaMonomers(page).first()).click(
      MonomerOption.Delete,
    );
    await expectCanvas(page, { tza: 1 });
    await switchToMicro(page);
    await expectCanvas(page, { atoms: 2, bonds: 1 });

    await undo(page, { mode: 'macro', tza: 1 });
    await undo(page, { tza: 2 });
    await undo(page, { tza: 1 });
    await undo(page, { tza: 0 });
    await undo(page, { mode: 'micro', atoms: 2, bonds: 1 });
    await undo(page, { atoms: 1, bonds: 0 });
    await undo(page, { atoms: 0 });
    await expectHistoryStart(page);

    await redo(page, { atoms: 1 });
    await redo(page, { atoms: 2, bonds: 1 });
    await redo(page, { mode: 'macro', tza: 0 });
    await redo(page, { tza: 1 });
    await redo(page, { tza: 2 });
    await redo(page, { tza: 1 });
    await redo(page, { mode: 'micro', atoms: 2, bonds: 1 });
    await expectHistoryEnd(page);
  });

  test('Case 10 - Undo and redo across multiple switches lose no history', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12672
     * Description: Undoing everything and redoing everything across several
     *              switches restores exactly the final structure.
     * Scenario:
     * 1. Add a carbon atom in Molecules mode
     * 2. Switch to Macromolecules mode (Flex) and add a Tza monomer
     * 3. Switch to Molecules mode and add a nitrogen atom
     * 4. Undo until Undo is disabled — the canvas is empty
     * 5. Redo until Redo is disabled — the structure equals the one from step 3
     *
     * Version 3.21.0
     */
    await addAtoms(page, Atom.Carbon, [{ x: 300, y: 300 }]);
    await switchToMacro(page);
    await addTza(page, 300, 450);
    await switchToMicro(page);
    await addAtoms(page, Atom.Nitrogen, [{ x: 400, y: 300 }]);
    const finalKet = await getKet(page);

    // five entries: carbon, switch, monomer, switch, nitrogen
    for (let step = 0; step < 5; step++) {
      await undo(page);
    }
    await expectCanvas(page, { mode: 'micro', atoms: 0 });
    await expectHistoryStart(page);

    for (let step = 0; step < 5; step++) {
      await redo(page);
    }
    await expectCanvas(page, { mode: 'micro' });
    await expectHistoryEnd(page);
    expect(await getKet(page)).toEqual(finalKet);
  });

  test('Case 11 - Undo to the switch point and redo keeps the sequence', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12672
     * Description: After undoing back past a mode switch, Redo replays the
     *              switch and then the edits made after it, in order.
     * Scenario:
     * 1. Add a carbon atom in Molecules mode
     * 2. Switch to Macromolecules mode (Flex) and add two Tza monomers
     * 3. Undo three times — Molecules mode is shown with the carbon atom
     * 4. Redo — Macromolecules mode is shown without monomers
     * 5. Redo twice — the monomers are restored one by one
     * 6. Redo again — nothing changes
     *
     * Version 3.21.0
     */
    await addAtoms(page, Atom.Carbon, [{ x: 300, y: 300 }]);
    await switchToMacro(page);
    await addTza(page, 300, 450);
    await addTza(page, 450, 450);
    await expectCanvas(page, { tza: 2 });

    await undo(page, { tza: 1 });
    await undo(page, { mode: 'macro', tza: 0 });
    await undo(page, { mode: 'micro', atoms: 1 });

    await redo(page, { mode: 'macro', tza: 0 });
    await redo(page, { tza: 1 });
    await redo(page, { tza: 2 });
    // nothing is left to redo
    await redo(page, { mode: 'macro', tza: 2 });
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
    for (let pair = 0; pair < 3; pair++) {
      await addAtoms(page, Atom.Carbon, [
        { x: 300 + pair * 100, y: 250 },
        { x: 300 + pair * 100, y: 350 },
      ]);
      await expectCanvas(page, { atoms: (pair + 1) * 2 });
      await switchToMacro(page);
      await switchToMicro(page);
    }

    for (let pair = 3; pair > 0; pair--) {
      await undo(page, { mode: 'macro' });
      await undo(page, { mode: 'micro', atoms: pair * 2 });
      await undo(page, { atoms: pair * 2 - 1 });
      await undo(page, { atoms: pair * 2 - 2 });
    }
    await expectHistoryStart(page);

    for (let pair = 0; pair < 3; pair++) {
      await redo(page, { atoms: pair * 2 + 1 });
      await redo(page, { atoms: pair * 2 + 2 });
      await redo(page, { mode: 'macro' });
      await redo(page, { mode: 'micro', atoms: pair * 2 + 2 });
    }
    await expectHistoryEnd(page);
  });

  test('Case 13 - Complex sequence with molecules, monomers and a reaction is fully undoable', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12672
     * Description: A history mixing a molecule, monomers and a reaction across
     *              two switches can be undone and redone completely.
     * Scenario:
     * 1. Add benzene in Molecules mode
     * 2. Switch to Macromolecules mode (Flex), add two Tza monomers and open a
     *    reaction
     * 3. Switch to Molecules mode
     * 4. Undo six times, checking the mode and content after each step
     * 5. Redo six times — the structure equals the one from step 3
     *
     * Version 3.21.0
     */
    await addBenzene(page);
    await switchToMacro(page);
    await addTza(page, 150, 450);
    await addTza(page, 300, 450);
    await addReactionInMacro(page);
    await switchToMicro(page);
    const finalKet = await getKet(page);

    await undo(page, { mode: 'macro', arrows: 1, atoms: 22, tza: 2 });
    await undo(page, { arrows: 0, atoms: 6 });
    await undo(page, { tza: 1 });
    await undo(page, { tza: 0 });
    await undo(page, { mode: 'micro', atoms: 6 });
    await undo(page, { atoms: 0 });
    await expectHistoryStart(page);

    for (let step = 0; step < 6; step++) {
      await redo(page);
    }
    await expectCanvas(page, { mode: 'micro' });
    await expectHistoryEnd(page);
    expect(await getKet(page)).toEqual(finalKet);
  });

  test('Case 14 - Switching modes adds no state change and no extra history entry', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12672
     * Description: Re-selecting the active mode adds nothing to history, and
     *              undoing a switch restores the exact previous structure.
     * Scenario:
     * 1. Add benzene in Molecules mode and remember the structure
     * 2. Select Molecules mode again in the mode switcher
     * 3. Switch to Macromolecules mode
     * 4. Undo — Molecules mode is shown and the structure equals step 1
     * 5. Undo — benzene is removed and Undo is disabled, so step 2 added no entry
     *
     * Version 3.21.0
     */
    await addBenzene(page);
    const initialKet = await getKet(page);
    await CommonTopRightToolbar(page).selectModeOption(Mode.Molecules);
    await expectCanvas(page, { mode: 'micro' });
    await switchToMacro(page);

    await undo(page, { mode: 'micro' });
    expect(await getKet(page)).toEqual(initialKet);
    await expect(CommonTopLeftToolbar(page).redoButton).toBeEnabled();

    await undo(page, { atoms: 0 });
    await expectHistoryStart(page);
  });

  test('Case 15 - A full-length history across modes stays traversable', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12672
     * Description: A history filled to its 32-step limit with edits and mode
     *              switches can be undone and redone completely within the
     *              default test timeout.
     * Scenario:
     * 1. Eight times: add two carbon atoms, switch to Macromolecules mode and
     *    back (32 entries)
     * 2. Add one more carbon atom (33rd entry, the oldest one is dropped)
     * 3. Undo 32 times — Undo is disabled and one carbon atom is left
     * 4. Redo 32 times — Redo is disabled and all 17 carbon atoms are present
     *
     * Version 3.21.0
     */
    for (let round = 0; round < 8; round++) {
      await addAtoms(page, Atom.Carbon, [
        { x: 150 + round * 60, y: 200 },
        { x: 150 + round * 60, y: 300 },
      ]);
      await switchToMacro(page);
      await switchToMicro(page);
    }
    await addAtoms(page, Atom.Carbon, [{ x: 150, y: 400 }]);
    await expectCanvas(page, { atoms: 17 });

    for (let step = 0; step < 32; step++) {
      await undo(page);
    }
    await expectCanvas(page, { mode: 'micro', atoms: 1 });
    await expectHistoryStart(page);

    for (let step = 0; step < 32; step++) {
      await redo(page);
    }
    await expectCanvas(page, { mode: 'micro', atoms: 17 });
    await expectHistoryEnd(page);
  });
});
