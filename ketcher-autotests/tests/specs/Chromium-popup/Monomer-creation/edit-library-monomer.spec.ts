/**
 * #9370 — Editing library monomers from the macromolecules library (requirements 3.0–3.3).
 *
 * Every non-ambiguous library card's three-dot menu offers "Edit" and "Duplicate and Edit";
 * "Duplicate and Edit" saves as a new library monomer, "Edit" re-saves the original —
 * keeping type and code overwrites the entry in place; changing the type and/or code
 * adds a new entry (original retained) and replaces all canvas instances.
 *
 * Verified app behavior (probed while writing this spec):
 * - The card menu contains `edit` then `duplicateandedit`; `delete` is hidden for default
 *   (non-user-made) monomers and there is no separator line between the items.
 * - "Edit" opens the wizard pre-filled with the original code/name/type; "Duplicate and
 *   Edit" pre-fills them with a "_Copy" suffix.
 * - The menu eases into its final position after opening, so regular clicks on its items
 *   fail Playwright's stability check — the tests dispatch the click event directly.
 * - Editing a preset-participating monomer (ribose) shows an entry warning (3.2.2) and
 *   blocks the save with a single error when the preset requirements are no longer met
 *   (3.2.3); both notifications are dismissed with their OK button.
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
import { NotificationMessageBanner } from '@tests/pages/molecules/canvas/createMonomer/NotificationMessageBanner';
import { NotificationMessageBanners } from '@tests/pages/molecules/canvas/createMonomer/NotificationMessageBanners';
import {
  ErrorMessage,
  WarningMessage,
} from '@tests/pages/constants/notificationMessageBanner/Constants';
import { MonomerPreviewTooltip } from '@tests/pages/macromolecules/canvas/MonomerPreviewTooltip';
import { getMonomerLocator } from '@utils/macromolecules/monomer';

const NEW_DUPLICATE_CODE = 'ZB';
const NEW_EDIT_CODE = 'ZE';
// New code used in 3.2.3 to change the type of a preset sugar on submit.
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
     * button on their card, so no edit menu is available. The dots button of a
     * non-ambiguous card only appears on hover, so the check happens in that state.
     * Scenario:
     * 1. Open the "X" card in the Peptides tab and scroll it into view
     * 2. Hover the card (the state where a dots button would appear)
     * 3. Check that no dots button is rendered
     *
     * Version 3.21.0
     */
    const library = Library(page);
    await library.switchToPeptidesTab();
    const ambiguousCard = library.getMonomerLibraryCardLocator(Peptide.X);
    await ambiguousCard.scrollIntoViewIfNeeded();
    await expect(ambiguousCard).toBeInViewport();

    // The dots button is rendered for non-ambiguous cards and revealed on hover;
    // hovering proves the absence is not just a matter of the card not being hovered.
    await library.hoverMonomer(Peptide.X);
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

    // The original card is retained and a new card appears.
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

  test('3.2.4: "Edit" save with a new code adds a library entry and replaces canvas instances', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 3.2.4)
     * Description: Saving "Edit" with the type and/or code changed creates a new
     * library entry while the original stays visible and usable, and every canvas
     * instance of the monomer is replaced with the new version.
     * Scenario:
     * 1. Drag alanine onto the flex canvas
     * 2. Edit it from the card menu, set a new code and submit
     * 3. Check that a new entry appeared, the original card is intact and the
     *    canvas monomer carries the new code
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
    // A new library entry is created for the new code...
    await expect(
      library.getMonomerCardByCodeAndNameLocator(NEW_EDIT_CODE, 'Alanine'),
    ).toBeVisible();
    // ...the original entry remains visible and usable...
    await expect(library.getMonomerLibraryCardLocator(Peptide.A)).toBeVisible();
    // ...and the canvas instances are replaced with the new version.
    expect(await getMonomerLocator(page, Peptide.A).count()).toBe(0);
    expect(
      await getMonomerLocator(page, { monomerAlias: NEW_EDIT_CODE }).count(),
    ).toBe(1);
  });

  test('3.2.5: "Edit" save with unchanged type and code overwrites the library entry', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 3.2.5)
     * Description: Saving "Edit" with the same type and code overwrites the library
     * entry in place — no duplicate card appears; canvas instances are replaced with
     * the new version of the monomer.
     * Scenario:
     * 1. Drag cysteine onto the flex canvas
     * 2. Edit it from the card menu, change only the name and submit
     * 3. Check that the card shows the new name without a duplicate
     * 4. Check that the canvas monomer is replaced with the edited version
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
    // The canvas instance is replaced with the edited version: it keeps its code...
    const monomer = getMonomerLocator(page, Peptide.C);
    expect(await monomer.count()).toBe(1);
    // ...but now carries the new name.
    await monomer.hover({ force: true });
    const preview = MonomerPreviewTooltip(page);
    await preview.waitForBecomeVisible();
    expect(await preview.getTitleText()).toBe(EDITED_CYS_NAME);
  });

  test('3.2.2: editing a preset-participating monomer shows an entry warning', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 3.2.2)
     * Description: Opening "Edit" on a monomer that participates in a preset
     * (ribose is part of the nucleotide presets) shows an entry warning that the
     * edited version must keep the same monomer type and the preset's required
     * attachment points; the warning is dismissed with OK.
     * Scenario:
     * 1. Open the ribose card menu in the RNA tab and click "Edit"
     * 2. Check the warning text and that the wizard loads the sugar properties
     * 3. Dismiss the warning with OK and check that it is gone
     *
     * Version 3.21.0
     */
    const library = Library(page);
    await library.goToMonomerLibraryLocation(Sugar.R);
    await library.openMonomerCardMenu(Sugar.R);
    await library.clickCardMenuItem(LibraryPresetOption.Edit);

    const dialog = CreateMonomerDialog(page);
    await expect(dialog.window).toBeVisible();
    const warning = NotificationMessageBanner(
      page,
      WarningMessage.editAllPresetWarning,
    );
    await expect(warning.notificationMessageBanner).toBeVisible();
    expect(await warning.getNotificationMessage()).toBe(
      'The edited version of the monomer must be the same monomer type and must have attachment point R1 and R3, because the monomer participates in a preset.',
    );
    expect(await dialog.codeEditbox.inputValue()).toBe('R');
    await expect(dialog.typeCombobox).toHaveText(/Sugar/);

    await warning.ok();
    await expect(warning.notificationMessageBanner).toBeHidden();
    await dialog.discard();
  });

  test('3.2.3: changing a preset sugar type is blocked on submit', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 3.2.3)
     * Description: Saving an edited preset-participating monomer that no longer
     * meets the preset requirements (type changed or required attachment points
     * removed) is prohibited: one and only one error message is shown and the
     * wizard stays open without saving.
     * Scenario:
     * 1. Open "Edit" on ribose in the RNA tab and dismiss the entry warning
     * 2. Change the type to Amino acid with a new code and submit
     * 3. Check that the single preset error is shown and the wizard stays open
     * 4. Discard and check that no new library entry was created
     *
     * Version 3.21.0
     */
    const library = Library(page);
    await library.goToMonomerLibraryLocation(Sugar.R);
    await library.openMonomerCardMenu(Sugar.R);
    await library.clickCardMenuItem(LibraryPresetOption.Edit);

    const dialog = CreateMonomerDialog(page);
    await expect(dialog.window).toBeVisible();
    // Dismiss the entry warning so only the submit-time error remains.
    const entryWarning = NotificationMessageBanner(
      page,
      WarningMessage.editAllPresetWarning,
    );
    await entryWarning.ok();

    await dialog.selectType(WizardMonomerType.AminoAcid);
    await dialog.selectNaturalAnalogue(AminoAcidNaturalAnalogue.A);
    await dialog.setCode(PRESET_GAP_CODE);
    await dialog.submit({ ignoreWarning: true });

    const error = NotificationMessageBanner(
      page,
      ErrorMessage.editAllPresetError,
    );
    await expect(error.notificationMessageBanner).toBeVisible();
    expect(await error.getNotificationMessage()).toBe(
      'The changes made to the monomer prevent it from participating in a preset. The monomer must be a Sugar and contain R1 and R3 attachment points.',
    );
    // One and only one notification is shown...
    expect(await NotificationMessageBanners(page).getVisibleCount()).toBe(1);
    // ...the save is prohibited: the wizard stays open.
    await expect(dialog.window).toBeVisible();

    await dialog.discard();
    // No new library entry was created; the original is retained.
    await library.switchToPeptidesTab();
    expect(
      await library
        .getMonomerCardByCodeAndNameLocator(PRESET_GAP_CODE, 'Ribose')
        .count(),
    ).toBe(0);
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
