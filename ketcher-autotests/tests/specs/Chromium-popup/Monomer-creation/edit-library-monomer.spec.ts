/**
 * #9370 — Editing library monomers from the macromolecules library (requirements 3.0–3.3).
 *
 * Every non-ambiguous library card's three-dot menu offers "Edit" and "Duplicate and Edit";
 * "Duplicate and Edit" saves as a new library monomer, "Edit" re-saves the original —
 * keeping type and code overwrites the entry in place; changing only the code is a
 * silent no-op (see 3.2.4 gap).
 *
 * Verified app behavior (probed while writing this spec):
 * - The card menu contains `edit` then `duplicateandedit`; `delete` is hidden for default
 *   (non-user-made) monomers and there is no separator line between the items.
 * - "Edit" opens the wizard pre-filled with the original code/name/type; "Duplicate and
 *   Edit" pre-fills them with a "_Copy" suffix.
 * - The menu eases into its final position after opening, so regular clicks on its items
 *   fail Playwright's stability check — the tests dispatch the click event directly.
 * - Preset-participation entry warning (3.2.2) and submit-time preset validation (3.2.3)
 *   are NOT implemented: editing a preset sugar saves freely (documented in 3.2.2/3.2.3).
 */
import { Page, expect } from '@playwright/test';
import { test } from '@fixtures';
import { Library } from '@tests/pages/macromolecules/Library';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LibraryPresetOption } from '@tests/pages/constants/contextMenu/Constants';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { Sugar } from '@tests/pages/constants/monomers/Sugars';
import {
  AminoAcidNaturalAnalogue,
  MonomerType as WizardMonomerType,
} from '@tests/pages/constants/createMonomerDialog/Constants';
import { CreateMonomerDialog } from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import { ConfirmYourActionDialog } from '@tests/pages/macromolecules/canvas/ConfirmYourActionDialog';
import { getMonomerLocator } from '@utils/macromolecules/monomer';

const NEW_DUPLICATE_CODE = 'ZB';
const NEW_EDIT_CODE = 'ZE';
// Code used to show that a preset sugar can be re-saved as an amino acid (gap 3.2.3).
const PRESET_GAP_CODE = 'ZZ';
const EDITED_CYS_NAME = 'Edited Cysteine';

let page: Page;

test.describe('#9370 Editing library monomers', () => {
  test.beforeAll(async ({ initFlexCanvas }) => {
    page = await initFlexCanvas();
  });

  test.beforeEach(async ({ FlexCanvas: _ }) => {});

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('3.0a: The card menu shows Edit then Duplicate and Edit, Delete hidden for default monomers', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 3.0)
     * Description: A non-ambiguous library card's three-dot menu lists "Edit" before
     * "Duplicate and Edit"; "Delete" is hidden for default (non-user-made) monomers.
     * Actual behavior: there is no separator line between the items.
     * Scenario:
     * 1. Open the alanine card's three-dot menu in the Peptides tab
     * 2. Check the items, their order and the absence of Delete
     *
     * Version 3.21.0
     */
    const library = Library(page);
    await library.switchToPeptidesTab();
    await library.openMonomerCardMenu(Peptide.A);

    const editItem = library.getCardMenuItemLocator(LibraryPresetOption.Edit);
    const duplicateItem = library.getCardMenuItemLocator(
      LibraryPresetOption.DuplicateAndEdit,
    );
    await expect(editItem).toBeVisible();
    await expect(duplicateItem).toBeVisible();
    const editBox = (await editItem.boundingBox())!;
    const duplicateBox = (await duplicateItem.boundingBox())!;
    expect(editBox.y).toBeLessThan(duplicateBox.y);
    // Delete is hidden for default monomers.
    expect(
      await library.getCardMenuItemLocator(LibraryPresetOption.Delete).count(),
    ).toBe(0);
  });

  test('3.0b: An ambiguous library card has no three-dot menu', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 3.0)
     * Description: Ambiguous monomers (e.g. "X" = any amino acid) have no three-dot
     * button on their card, so no edit menu is available.
     * Scenario:
     * 1. Open the "X" card in the Peptides tab
     * 2. Check that it has no dots button
     *
     * Version 3.21.0
     */
    const library = Library(page);
    await library.switchToPeptidesTab();
    await expect(library.getMonomerLibraryCardLocator(Peptide.X)).toBeVisible();
    expect(await library.getMonomerCardDotsButton(Peptide.X).count()).toBe(0);
  });

  test('3.1a: "Duplicate and Edit" loads the monomer properties with a _Copy suffix', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 3.1)
     * Description: "Duplicate and Edit" opens the wizard pre-filled with the card's
     * properties; code and name carry a "_Copy" suffix so the save creates a new entry.
     * Scenario:
     * 1. Open the alanine card menu and click "Duplicate and Edit"
     * 2. Check the wizard's code, name and type fields
     *
     * Version 3.21.0
     */
    const library = Library(page);
    await library.switchToPeptidesTab();
    await library.openMonomerCardMenu(Peptide.A);
    await library.clickCardMenuItem(LibraryPresetOption.DuplicateAndEdit);

    const dialog = CreateMonomerDialog(page);
    await expect(dialog.window).toBeVisible();
    expect(await dialog.codeEditbox.inputValue()).toBe('A_Copy');
    expect(await dialog.nameEditbox.inputValue()).toBe('Alanine_Copy');
    await expect(dialog.typeCombobox).toHaveText(/Amino acid/);
    await dialog.discard();
  });

  test('3.2a: "Edit" loads the original monomer properties unchanged', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 3.2)
     * Description: "Edit" opens the wizard pre-filled with the card's original code,
     * name and type.
     * Scenario:
     * 1. Open the alanine card menu and click "Edit"
     * 2. Check the wizard's code, name and type fields
     *
     * Version 3.21.0
     */
    const library = Library(page);
    await library.switchToPeptidesTab();
    await library.openMonomerCardMenu(Peptide.A);
    await library.clickCardMenuItem(LibraryPresetOption.Edit);

    const dialog = CreateMonomerDialog(page);
    await expect(dialog.window).toBeVisible();
    expect(await dialog.codeEditbox.inputValue()).toBe('A');
    expect(await dialog.nameEditbox.inputValue()).toBe('Alanine');
    await expect(dialog.typeCombobox).toHaveText(/Amino acid/);
    await dialog.discard();
  });

  test('3.1b: Saving "Duplicate and Edit" adds a new library entry, canvas untouched', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 3.1)
     * Description: Saving the duplicate with a new code adds a second library card; the
     * original card and the canvas instances are unchanged.
     * Scenario:
     * 1. Drag alanine onto the flex canvas
     * 2. Duplicate it from the card menu, set a new code and submit
     * 3. Check that both cards exist and the canvas monomer keeps its code
     *
     * Version 3.21.0
     */
    const library = Library(page);
    await library.switchToPeptidesTab();
    await library.dragMonomerOnCanvas(Peptide.A, { x: 250, y: 300 });
    await expect(getMonomerLocator(page, Peptide.A)).toBeVisible();

    await library.openMonomerCardMenu(Peptide.A);
    await library.clickCardMenuItem(LibraryPresetOption.DuplicateAndEdit);
    const dialog = CreateMonomerDialog(page);
    await expect(dialog.window).toBeVisible();
    await dialog.setCode(NEW_DUPLICATE_CODE);
    await dialog.submit({ ignoreWarning: true });
    await expect(dialog.window).toBeHidden();

    // The original card is retained and a new card appears next to it.
    await expect(library.getMonomerLibraryCardLocator(Peptide.A)).toBeVisible();
    await expect(
      library.getMonomerCardByCodeAndNameLocator(
        NEW_DUPLICATE_CODE,
        'Alanine_Copy',
      ),
    ).toBeVisible();
    // Canvas instances are untouched by the duplicate.
    expect(await getMonomerLocator(page, Peptide.A).count()).toBe(1);
  });

  test('3.2.4 (gap): "Edit" save with a new code changes nothing', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 3.2.4 — GAP)
     * Description: The ticket expects a changed type/code to create a new library entry
     * and replace all canvas instances with it. Actual behavior (probed): the wizard
     * closes as if the save succeeded, but nothing changes — no new library entry is
     * created, the original entry is untouched and the canvas monomer keeps its code.
     * Scenario:
     * 1. Drag alanine onto the flex canvas
     * 2. Edit it from the card menu, set a new code and submit
     * 3. Check that no new entry appeared and the original card and canvas are intact
     *
     * Version 3.21.0
     */
    const library = Library(page);
    await library.switchToPeptidesTab();
    await library.dragMonomerOnCanvas(Peptide.A, { x: 250, y: 300 });
    await expect(getMonomerLocator(page, Peptide.A)).toBeVisible();

    await library.openMonomerCardMenu(Peptide.A);
    await library.clickCardMenuItem(LibraryPresetOption.Edit);
    const dialog = CreateMonomerDialog(page);
    await expect(dialog.window).toBeVisible();
    await dialog.setCode(NEW_EDIT_CODE);
    await dialog.submit({ ignoreWarning: true });
    await expect(dialog.window).toBeHidden();

    expect(await MacromoleculesTopToolbar(page).getActiveLayoutMode()).toBe(
      LayoutMode.Flex,
    );
    // Gap vs ticket: no new library entry is created for the new code...
    expect(
      await library
        .getMonomerCardByCodeAndNameLocator(NEW_EDIT_CODE, 'Alanine')
        .count(),
    ).toBe(0);
    // ...the original entry is untouched...
    await expect(library.getMonomerLibraryCardLocator(Peptide.A)).toBeVisible();
    // ...and the canvas instances are not replaced either.
    expect(await getMonomerLocator(page, Peptide.A).count()).toBe(1);
    expect(
      await getMonomerLocator(page, { monomerAlias: NEW_EDIT_CODE }).count(),
    ).toBe(0);
  });

  test('3.2.5: "Edit" save with unchanged type and code overwrites the library entry', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 3.2.5)
     * Description: Saving "Edit" with the same type and code overwrites the library
     * entry in place — no duplicate card appears; canvas instances are replaced.
     * Scenario:
     * 1. Drag cysteine onto the flex canvas
     * 2. Edit it from the card menu, change only the name and submit
     * 3. Check that the card shows the new name without a duplicate and the canvas is intact
     *
     * Version 3.21.0
     */
    const library = Library(page);
    await library.switchToPeptidesTab();
    await library.dragMonomerOnCanvas(Peptide.C, { x: 250, y: 300 });
    await expect(getMonomerLocator(page, Peptide.C)).toBeVisible();

    await library.openMonomerCardMenu(Peptide.C);
    await library.clickCardMenuItem(LibraryPresetOption.Edit);
    const dialog = CreateMonomerDialog(page);
    await expect(dialog.window).toBeVisible();
    await dialog.setName(EDITED_CYS_NAME);
    await dialog.submit({ ignoreWarning: true });
    await expect(dialog.window).toBeHidden();

    // The entry is overwritten in place: the old card name is gone, no duplicate.
    expect(
      await library.getMonomerCardByCodeAndNameLocator('C', 'Cysteine').count(),
    ).toBe(0);
    await expect(
      library.getMonomerCardByCodeAndNameLocator('C', EDITED_CYS_NAME),
    ).toBeVisible();
    // Canvas instances are replaced but keep their code.
    expect(await getMonomerLocator(page, Peptide.C).count()).toBe(1);
  });

  test('3.2.2 (gap): editing a preset-participating monomer shows no entry warning', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 3.2.2 — GAP)
     * Description: The ticket expects an entry warning for preset-participating
     * monomers (keeping type + required attachment points). Actual behavior: no warning
     * is shown — the wizard opens directly with the sugar properties pre-filled.
     * Scenario:
     * 1. Open the ribose card menu in the RNA tab and click "Edit"
     * 2. Check that no confirmation dialog appears and the wizard loads the sugar
     *
     * Version 3.21.0
     */
    const library = Library(page);
    await library.goToMonomerLibraryLocation(Sugar.R);
    await library.openMonomerCardMenu(Sugar.R);
    await library.clickCardMenuItem(LibraryPresetOption.Edit);

    const confirmDialog = ConfirmYourActionDialog(page);
    expect(await confirmDialog.isVisible()).toBe(false);
    const dialog = CreateMonomerDialog(page);
    await expect(dialog.window).toBeVisible();
    expect(await dialog.codeEditbox.inputValue()).toBe('R');
    await expect(dialog.typeCombobox).toHaveText(/Sugar/);
    await dialog.discard();
  });

  test('3.2.3 (gap): changing a preset sugar type is not blocked on submit', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 3.2.3 — GAP)
     * Description: The ticket expects a submit-time validation error when a
     * preset-participating monomer loses its preset eligibility. Actual behavior: the
     * save succeeds — the sugar is re-saved as an amino acid under a new code, and the
     * original entry is retained.
     * Scenario:
     * 1. Open "Edit" on ribose in the RNA tab
     * 2. Change the type to Amino acid with a new code, dismiss any warning and submit
     * 3. Check that the save succeeded and both entries exist
     *
     * Version 3.21.0
     */
    const library = Library(page);
    await library.goToMonomerLibraryLocation(Sugar.R);
    await library.openMonomerCardMenu(Sugar.R);
    await library.clickCardMenuItem(LibraryPresetOption.Edit);

    const dialog = CreateMonomerDialog(page);
    await expect(dialog.window).toBeVisible();
    await dialog.selectType(WizardMonomerType.AminoAcid);
    await dialog.selectNaturalAnalogue(AminoAcidNaturalAnalogue.A);
    await dialog.setCode(PRESET_GAP_CODE);
    await dialog.submit({ ignoreWarning: true });

    // The save is not blocked by any preset-participation validation.
    await expect(dialog.window).toBeHidden();
    await library.switchToPeptidesTab();
    await expect(
      library.getMonomerCardByCodeAndNameLocator(PRESET_GAP_CODE, 'Ribose'),
    ).toBeVisible();
    await library.goToMonomerLibraryLocation(Sugar.R);
    await expect(library.getMonomerLibraryCardLocator(Sugar.R)).toBeVisible();
  });

  test('3.3: Exiting the wizard returns to the previous macro sub-mode', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 3.3)
     * Description: Discarding the library edit wizard with canvas content present
     * returns to the previous macro sub-mode with the canvas unchanged.
     * Scenario:
     * 1. Drag alanine onto the flex canvas and open "Edit" from its card menu
     * 2. Discard the wizard
     * 3. Check that flex mode is back and the canvas monomer is intact
     *
     * Version 3.21.0
     */
    const library = Library(page);
    await library.switchToPeptidesTab();
    await library.dragMonomerOnCanvas(Peptide.A, { x: 250, y: 300 });
    await expect(getMonomerLocator(page, Peptide.A)).toBeVisible();

    await library.openMonomerCardMenu(Peptide.A);
    await library.clickCardMenuItem(LibraryPresetOption.Edit);
    const dialog = CreateMonomerDialog(page);
    await expect(dialog.window).toBeVisible();
    await dialog.discard();

    await expect(dialog.window).toBeHidden();
    expect(await MacromoleculesTopToolbar(page).getActiveLayoutMode()).toBe(
      LayoutMode.Flex,
    );
    expect(await getMonomerLocator(page, Peptide.A).count()).toBe(1);
  });
});
