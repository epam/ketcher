/**
 * #9370 — Editing monomers from the macromolecules canvas (requirements 2.0–2.5).
 *
 * Right-clicking a single monomer (flex/snake) or a sequence symbol shows "Edit Monomer"
 * and "Edit All [code] (N)" in their own section above Delete; composite sequence symbols
 * show the options disabled. "Edit All" highlights all matching monomers on hover and
 * opens a confirmation dialog before the wizard.
 *
 * Verified app behavior (probed while writing this spec):
 * - "Edit Monomer" opens the wizard directly in instance mode; the code field is
 *   pre-filled with "<code>_Copy", so saving without changing it renames the instance.
 * - "Edit All" opens a confirmation dialog ("You are going to edit N monomers. Are you
 *   sure?") before the wizard (all mode, same "_Copy" pre-fill).
 * - Saving an edit replaces the affected canvas instances with the saved code; the save
 *   is NOT an undo entry (Ctrl+Z leaves the canvas unchanged — asserted in 2.3b).
 * - Composite sequence symbols: both options visible but disabled, title "Edit All R (1)".
 */
import { Page, expect } from '@playwright/test';
import { test } from '@fixtures';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import {
  MacroMonomerOption,
  MonomerOption,
} from '@tests/pages/constants/contextMenu/Constants';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import { ConfirmYourActionDialog } from '@tests/pages/macromolecules/canvas/ConfirmYourActionDialog';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { CreateMonomerDialog } from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import {
  getMonomerLocator,
  getSymbolLocator,
} from '@utils/macromolecules/monomer';
import {
  openFileAndAddToCanvasAsNewProjectMacro,
  takeEditorScreenshot,
  undoByKeyboard,
} from '@utils';

const SEQUENCE_FIXTURE =
  'KET/Chromium-popup/Bugs/ketcher-3.9.0-bugs/micro-and-macro-structures.ket';

/** Drags two alanines from the library; the last drop leaves it selected. */
async function dragTwoAs(page: Page): Promise<void> {
  const library = Library(page);
  await library.dragMonomerOnCanvas(Peptide.A, { x: 200, y: 250 });
  await library.dragMonomerOnCanvas(Peptide.A, { x: 380, y: 420 });
}

let page: Page;

test.describe('#9370 Editing monomers from the flex canvas', () => {
  test.beforeAll(async ({ initFlexCanvas }) => {
    page = await initFlexCanvas();
  });

  test.beforeEach(async ({ FlexCanvas: _ }) => {});

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('2.0a: In flex, right-clicking a single monomer shows enabled edit options', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 2.0)
     * Description: Right-clicking a selection of exactly one monomer in flex mode shows
     * "Edit Monomer" and "Edit All [code] (N)", both enabled.
     * Scenario:
     * 1. Drag two alanines onto the flex canvas (the last drop is selected)
     * 2. Right-click the selected alanine and check the menu
     *
     * Version 3.21.0
     */
    await dragTwoAs(page);
    const monomerA = getMonomerLocator(page, Peptide.A).last();
    await expect(monomerA).toBeVisible();
    const menu = ContextMenu(page, monomerA);
    await menu.open();

    const editOption = menu.getOptionLocator(MacroMonomerOption.EditMonomer);
    const editAllOption = menu.getOptionLocator(
      MacroMonomerOption.EditAllMonomers,
    );
    await expect(editOption).toBeVisible();
    await expect(editOption).toBeEnabled();
    await expect(editAllOption).toBeVisible();
    await expect(editAllOption).toBeEnabled();
    const title = (await editAllOption.textContent())?.trim() ?? '';
    expect(title).toMatch(/^Edit All A \(\d+\)$/);
  });

  test('2.1: Edit options sit in their own section above Delete, Edit Monomer first', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 2.1)
     * Description: "Edit Monomer" is listed before "Edit All", and the pair sits in a
     * separate section above "Delete" (a separator line between them).
     * Scenario:
     * 1. Drag one alanine onto the flex canvas
     * 2. Right-click it and compare the vertical order of the menu items
     *
     * Version 3.21.0
     */
    const library = Library(page);
    await library.dragMonomerOnCanvas(Peptide.A, { x: 200, y: 250 });
    const monomerA = getMonomerLocator(page, Peptide.A).first();
    const menu = ContextMenu(page, monomerA);
    await menu.open();

    const editBox = (await menu
      .getOptionLocator(MacroMonomerOption.EditMonomer)
      .boundingBox())!;
    const editAllBox = (await menu
      .getOptionLocator(MacroMonomerOption.EditAllMonomers)
      .boundingBox())!;
    const deleteBox = (await menu
      .getOptionLocator(MonomerOption.Delete)
      .boundingBox())!;

    expect(editBox.y).toBeLessThan(editAllBox.y);
    expect(editAllBox.y).toBeLessThan(deleteBox.y);
    // A separator line is rendered between the edit section and Delete.
    const separators = menu.getSeparatorLocator();
    const separatorCount = await separators.count();
    let hasSeparatorBetween = false;
    for (let i = 0; i < separatorCount; i++) {
      const box = (await separators.nth(i).boundingBox())!;
      if (box.y > editAllBox.y && box.y < deleteBox.y) {
        hasSeparatorBetween = true;
      }
    }
    expect(hasSeparatorBetween).toBe(true);
  });

  test('2.3a: "Edit Monomer" opens the wizard with the monomer properties', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 2.3)
     * Description: Clicking "Edit Monomer" opens the monomer creation wizard pre-filled
     * with the selected monomer's properties; the code field carries a "_Copy" suffix.
     * Scenario:
     * 1. Drag two alanines, right-click the selected one, click "Edit Monomer"
     * 2. Check the wizard's code and type fields
     *
     * Version 3.21.0
     */
    await dragTwoAs(page);
    const monomerA = getMonomerLocator(page, Peptide.A).last();
    await ContextMenu(page, monomerA).click(MacroMonomerOption.EditMonomer);

    const dialog = CreateMonomerDialog(page);
    await expect(dialog.window).toBeVisible();
    expect(await dialog.codeEditbox.inputValue()).toBe('A_Copy');
    await expect(dialog.typeCombobox).toHaveText(/Amino acid/);
    await dialog.discard();
  });

  test('2.3b: Saving "Edit Monomer" updates only that canvas instance', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 2.3)
     * Description: Saving the wizard with a new code replaces exactly the edited monomer
     * on the canvas (in place); the other alanine is untouched. The save is not an undo
     * entry (probed).
     * Scenario:
     * 1. Drag two alanines, open "Edit Monomer" on the selected one
     * 2. Set a new code and submit
     * 3. Check that exactly one monomer has the new code at the edited monomer's spot
     *    and one alanine remains in place
     * 4. Check that Ctrl+Z does not revert the replacement
     *
     * Version 3.21.0
     */
    const newMonomerCode = 'ZZ';

    await dragTwoAs(page);
    const monomerA = getMonomerLocator(page, Peptide.A).last();
    const editedPosition = (await monomerA.boundingBox())!;
    await ContextMenu(page, monomerA).click(MacroMonomerOption.EditMonomer);

    const dialog = CreateMonomerDialog(page);
    await expect(dialog.window).toBeVisible();
    await dialog.setCode(newMonomerCode);
    await dialog.submit({ ignoreWarning: true });

    await expect(dialog.window).toBeHidden();
    expect(await MacromoleculesTopToolbar(page).getActiveLayoutMode()).toBe(
      LayoutMode.Flex,
    );
    const newMonomer = getMonomerLocator(page, {
      monomerAlias: newMonomerCode,
    });
    expect(await newMonomer.count()).toBe(1);
    // The edited instance was replaced in place...
    const newPosition = (await newMonomer.boundingBox())!;
    expect(newPosition.x).toBeCloseTo(editedPosition.x, 0);
    expect(newPosition.y).toBeCloseTo(editedPosition.y, 0);
    // ...and the other alanine remains untouched.
    expect(await getMonomerLocator(page, Peptide.A).count()).toBe(1);
    // The save is not an undo entry (probed): Ctrl+Z leaves the canvas unchanged.
    await undoByKeyboard(page);
    expect(await newMonomer.count()).toBe(1);
    expect(await getMonomerLocator(page, Peptide.A).count()).toBe(1);
  });

  test('2.4a: Hovering "Edit All" highlights all matching monomers only', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 2.4)
     * Description: Hovering the "Edit All A (N)" menu item highlights every alanine on
     * the canvas and no other monomer.
     * Scenario:
     * 1. Drag alanine, cysteine, alanine onto the flex canvas (the last drop is selected)
     * 2. Right-click the selected alanine and hover "Edit All"
     * 3. Compare the canvas screenshot with the reference (both alanines highlighted,
     *    the cysteine not)
     *
     * Version 3.21.0
     */
    const library = Library(page);
    // Coordinates are canvas-relative; keep all three drops inside the 472x626 canvas.
    await library.dragMonomerOnCanvas(Peptide.A, { x: 100, y: 150 });
    await library.dragMonomerOnCanvas(Peptide.C, { x: 300, y: 150 });
    await library.dragMonomerOnCanvas(Peptide.A, { x: 200, y: 400 });
    const monomerA = getMonomerLocator(page, Peptide.A).last();

    await ContextMenu(page, monomerA).hover(MacroMonomerOption.EditAllMonomers);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('2.4b: Clicking "Edit All" opens a confirmation dialog before the wizard', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 2.4)
     * Description: Clicking "Edit All A (N)" asks for confirmation ("You are going to
     * edit N monomers. Are you sure?"); confirming opens the wizard.
     * Scenario:
     * 1. Drag two alanines, right-click the selected one, click "Edit All"
     * 2. Check the dialog text and confirm
     * 3. Check that the wizard opens
     *
     * Version 3.21.0
     */
    await dragTwoAs(page);
    const monomerA = getMonomerLocator(page, Peptide.A).last();
    await ContextMenu(page, monomerA).click(MacroMonomerOption.EditAllMonomers);

    const confirmDialog = ConfirmYourActionDialog(page);
    expect(await confirmDialog.isVisible()).toBe(true);
    expect(await confirmDialog.getMessageBodyText()).toBe(
      'You are going to edit 2 monomers. Are you sure?',
    );
    await confirmDialog.yes();

    const dialog = CreateMonomerDialog(page);
    await expect(dialog.window).toBeVisible();
    await dialog.discard();
  });

  test('2.4c: Cancelling the "Edit All" confirmation leaves the canvas unchanged', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 2.4)
     * Description: Cancelling the confirmation dialog does not open the wizard and does
     * not modify the canvas.
     * Scenario:
     * 1. Drag two alanines, capture their positions, click "Edit All"
     * 2. Cancel the dialog
     * 3. Check that the wizard is closed and both alanines are in place
     *
     * Version 3.21.0
     */
    await dragTwoAs(page);
    const monomerA = getMonomerLocator(page, Peptide.A).last();
    const positionsBefore: { x: number; y: number }[] = [];
    for (const index of [0, 1]) {
      positionsBefore.push(
        (await getMonomerLocator(page, Peptide.A).nth(index).boundingBox())!,
      );
    }

    await ContextMenu(page, monomerA).click(MacroMonomerOption.EditAllMonomers);
    const confirmDialog = ConfirmYourActionDialog(page);
    expect(await confirmDialog.isVisible()).toBe(true);
    await confirmDialog.cancel();

    const dialog = CreateMonomerDialog(page);
    expect(await dialog.window.isVisible()).toBe(false);
    expect(await getMonomerLocator(page, Peptide.A).count()).toBe(2);
    for (let i = 0; i < positionsBefore.length; i++) {
      const box = (await getMonomerLocator(page, Peptide.A)
        .nth(i)
        .boundingBox())!;
      expect(box.x).toBeCloseTo(positionsBefore[i].x, 0);
      expect(box.y).toBeCloseTo(positionsBefore[i].y, 0);
    }
  });

  test('2.4d: Saving "Edit All" updates all matching instances', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 2.4)
     * Description: Confirming and saving the wizard with a new code replaces every
     * matching monomer on the canvas.
     * Scenario:
     * 1. Drag two alanines, click "Edit All" and confirm
     * 2. Set a new code and submit
     * 3. Check that both instances carry the new code and no alanine remains
     *
     * Version 3.21.0
     */
    const newMonomerCode = 'ZZ';

    await dragTwoAs(page);
    const monomerA = getMonomerLocator(page, Peptide.A).last();
    await ContextMenu(page, monomerA).click(MacroMonomerOption.EditAllMonomers);
    await ConfirmYourActionDialog(page).yes();

    const dialog = CreateMonomerDialog(page);
    await expect(dialog.window).toBeVisible();
    await dialog.setCode(newMonomerCode);
    await dialog.submit({ ignoreWarning: true });

    await expect(dialog.window).toBeHidden();
    expect(await MacromoleculesTopToolbar(page).getActiveLayoutMode()).toBe(
      LayoutMode.Flex,
    );
    const newMonomers = getMonomerLocator(page, {
      monomerAlias: newMonomerCode,
    });
    expect(await newMonomers.count()).toBe(2);
    expect(await getMonomerLocator(page, Peptide.A).count()).toBe(0);
  });

  test('2.5: Discarding "Edit Monomer" in snake returns to snake with the layout intact', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 2.5)
     * Description: Discarding the edit wizard in snake mode returns to snake with the
     * monomers and their layout unchanged.
     * Scenario:
     * 1. Switch to snake, drag two alanines, open "Edit Monomer" on the selected one
     * 2. Discard the wizard
     * 3. Check that snake mode is back and both alanines are in place
     *
     * Version 3.21.0
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await dragTwoAs(page);
    const monomerA = getMonomerLocator(page, Peptide.A).last();
    const positionBefore = (await monomerA.boundingBox())!;

    await ContextMenu(page, monomerA).click(MacroMonomerOption.EditMonomer);
    const dialog = CreateMonomerDialog(page);
    await expect(dialog.window).toBeVisible();
    await dialog.discard();

    await expect(dialog.window).toBeHidden();
    expect(await MacromoleculesTopToolbar(page).getActiveLayoutMode()).toBe(
      LayoutMode.Snake,
    );
    expect(await getMonomerLocator(page, Peptide.A).count()).toBe(2);
    const positionAfter = (await monomerA.boundingBox())!;
    expect(positionAfter.x).toBeCloseTo(positionBefore.x, 0);
    expect(positionAfter.y).toBeCloseTo(positionBefore.y, 0);
  });
});

test.describe('#9370 Editing monomers from the sequence canvas', () => {
  test.beforeAll(async ({ initSequenceCanvas }) => {
    page = await initSequenceCanvas();
  });

  test.beforeEach(async ({ SequenceCanvas: _ }) => {});

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('2.0c: In sequence, right-clicking a composite symbol shows the edit options', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 2.0)
     * Description: Right-clicking a sequence symbol that represents several monomers
     * (the composite nucleotide "A") shows both edit options.
     * Scenario:
     * 1. Open the macro fixture with sequence symbols in sequence mode
     * 2. Right-click the composite "A" symbol and check the menu
     *
     * Version 3.21.0
     */
    await openFileAndAddToCanvasAsNewProjectMacro(page, SEQUENCE_FIXTURE);
    const symbolA = getSymbolLocator(page, { symbolAlias: 'A' }).first();
    await expect(symbolA).toBeVisible();
    const menu = ContextMenu(page, symbolA);

    expect(await menu.isOptionVisible(MacroMonomerOption.EditMonomer)).toBe(
      true,
    );
    expect(await menu.isOptionVisible(MacroMonomerOption.EditAllMonomers)).toBe(
      true,
    );
  });

  test('2.2a: Composite sequence symbols show the edit options disabled', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 2.2)
     * Description: A composite symbol (one symbol = several monomers) shows both edit
     * options but disabled; the "Edit All" title refers to the group code.
     * Scenario:
     * 1. Open the macro fixture with sequence symbols in sequence mode
     * 2. Right-click the composite "A" symbol and check the enabled states
     *
     * Version 3.21.0
     */
    await openFileAndAddToCanvasAsNewProjectMacro(page, SEQUENCE_FIXTURE);
    const symbolA = getSymbolLocator(page, { symbolAlias: 'A' }).first();
    const menu = ContextMenu(page, symbolA);

    expect(await menu.isOptionEnabled(MacroMonomerOption.EditMonomer)).toBe(
      false,
    );
    expect(await menu.isOptionEnabled(MacroMonomerOption.EditAllMonomers)).toBe(
      false,
    );
    // The enabled-state checks close the menu; reopen it to read the title.
    await menu.open();
    const title =
      (
        await menu
          .getOptionLocator(MacroMonomerOption.EditAllMonomers)
          .textContent()
      )?.trim() ?? '';
    expect(title).toMatch(/^Edit All R \(\d+\)$/);
  });
});
