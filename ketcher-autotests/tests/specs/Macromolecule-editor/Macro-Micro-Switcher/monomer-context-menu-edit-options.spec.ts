/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Page, test, expect } from '@fixtures';
import {
  openFileAndAddToCanvasAsNewProject,
  takeEditorScreenshot,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { MonomerOnMicroOption } from '@tests/pages/constants/contextMenu/Constants';
import { getAbbreviationLocator } from '@utils/canvas/s-group-signes/getAbbreviationLocator';

const PEPTIDE_D_KET =
  'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/1. Petide D (from library).ket';

let page: Page;

test.beforeAll(async ({ initFlexCanvas }) => {
  page = await initFlexCanvas();
});

test.beforeEach(async ({ FlexCanvas: _ }) => {
  await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
});

test.afterAll(async ({ closePage }) => {
  await closePage();
});

test.describe('Monomer context menu — Edit options', () => {
  test('9.1 Right-clicking a single non-selected monomer shows all expected menu items', async () => {
    /*
     * Spec: monomer-context-menu
     * WHEN the user right-clicks a non-selected monomer
     * THEN the context menu displays Remove Grouping, Edit Monomer, Edit All, and Delete
     */
    await openFileAndAddToCanvasAsNewProject(page, PEPTIDE_D_KET);
    const monomerLocator = getAbbreviationLocator(page, { name: 'D' });
    await ContextMenu(page, monomerLocator).open();
    await takeEditorScreenshot(page);
    await page.keyboard.press('Escape');
  });

  test('9.1 Full menu structure is visible on right-click of a single non-selected monomer', async () => {
    /*
     * Spec: monomer-context-menu § Context menu shows all items when right-clicking a single non-selected monomer
     */
    await openFileAndAddToCanvasAsNewProject(page, PEPTIDE_D_KET);
    const monomerLocator = getAbbreviationLocator(page, { name: 'D' });

    expect(
      await ContextMenu(page, monomerLocator).isOptionVisible(
        MonomerOnMicroOption.EditMonomer,
      ),
    ).toBe(true);

    expect(
      await ContextMenu(page, monomerLocator).isOptionVisible(
        MonomerOnMicroOption.EditAll,
      ),
    ).toBe(true);

    expect(
      await ContextMenu(page, monomerLocator).isOptionVisible(
        MonomerOnMicroOption.RemoveGrouping,
      ),
    ).toBe(true);

    expect(
      await ContextMenu(page, monomerLocator).isOptionVisible(
        MonomerOnMicroOption.DeleteMonomer,
      ),
    ).toBe(true);
  });

  test('9.2 Edit Monomer is enabled when exactly one monomer is right-clicked without a selection', async () => {
    /*
     * Spec: monomer-context-menu § "Edit Monomer" is enabled for a single non-selected monomer
     */
    await openFileAndAddToCanvasAsNewProject(page, PEPTIDE_D_KET);
    const monomerLocator = getAbbreviationLocator(page, { name: 'D' });

    expect(
      await ContextMenu(page, monomerLocator).isOptionEnabled(
        MonomerOnMicroOption.EditMonomer,
      ),
    ).toBe(true);
  });

  test('9.2 Edit Monomer is disabled when multiple monomers are selected', async () => {
    /*
     * Spec: monomer-context-menu § "Edit Monomer" is disabled when the selection contains more than one monomer
     */
    await openFileAndAddToCanvasAsNewProject(page, PEPTIDE_D_KET);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    // Paste a second copy of the same monomer on the macro canvas so we get 2 D monomers
    await openFileAndAddToCanvasAsNewProject(page, PEPTIDE_D_KET);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await selectAllStructuresOnCanvas(page);
    // Right-click the first monomer while both are selected
    const monomerLocator = getAbbreviationLocator(page, { name: 'D' }).first();

    expect(
      await ContextMenu(page, monomerLocator).isOptionEnabled(
        MonomerOnMicroOption.EditMonomer,
      ),
    ).toBe(false);
  });

  test('9.3 Edit All label contains monomer code and total canvas count', async () => {
    /*
     * Spec: monomer-context-menu § "Edit All" item is labelled with monomer code and total count
     */
    await openFileAndAddToCanvasAsNewProject(page, PEPTIDE_D_KET);
    const monomerLocator = getAbbreviationLocator(page, { name: 'D' });
    await ContextMenu(page, monomerLocator).open();
    // Verify "Edit All" item is visible (label content verified via screenshot)
    const editAllLocator = page
      .getByTestId(MonomerOnMicroOption.EditAll)
      .first();
    await editAllLocator.waitFor({ state: 'visible' });
    await takeEditorScreenshot(page);
    await page.keyboard.press('Escape');
  });

  test('9.3 Edit All confirmation modal flow — Cancel prevents wizard opening', async () => {
    /*
     * Spec: monomer-edit-wizard-entry § "Cancel" dismisses the modal without opening the wizard
     */
    await openFileAndAddToCanvasAsNewProject(page, PEPTIDE_D_KET);
    const monomerLocator = getAbbreviationLocator(page, { name: 'D' });
    await ContextMenu(page, monomerLocator).click(MonomerOnMicroOption.EditAll);
    // Confirmation dialog should appear
    await takeEditorScreenshot(page);
    // Press Cancel
    await page.getByTestId('cancel-button').click();
    // Wizard should not be open
    await takeEditorScreenshot(page);
  });

  test('9.3 Edit All confirmation modal flow — OK opens the wizard', async () => {
    /*
     * Spec: monomer-edit-wizard-entry § Confirming with "OK" opens the wizard
     */
    await openFileAndAddToCanvasAsNewProject(page, PEPTIDE_D_KET);
    const monomerLocator = getAbbreviationLocator(page, { name: 'D' });
    await ContextMenu(page, monomerLocator).click(MonomerOnMicroOption.EditAll);
    // Confirmation dialog should appear
    await takeEditorScreenshot(page);
    // Press OK
    await page.getByTestId('ok-button').click();
    // Monomer creation wizard should open
    await takeEditorScreenshot(page);
  });

  test('9.4 Remove Grouping removes the monomer grouping and expands the monomer', async () => {
    /*
     * Spec: monomer-context-menu § "Remove Grouping" expands a collapsed monomer
     */
    await openFileAndAddToCanvasAsNewProject(page, PEPTIDE_D_KET);
    const monomerLocator = getAbbreviationLocator(page, { name: 'D' });
    await takeEditorScreenshot(page);
    await ContextMenu(page, monomerLocator).click(
      MonomerOnMicroOption.RemoveGrouping,
    );
    await takeEditorScreenshot(page);
  });

  test('9.5 Create Monomer is hidden when right-clicking a single non-selected monomer with no other selection', async () => {
    /*
     * Spec: monomer-context-menu § "Create Monomer" hidden on right-click of a single non-selected monomer with no other selection
     */
    await openFileAndAddToCanvasAsNewProject(page, PEPTIDE_D_KET);
    const monomerLocator = getAbbreviationLocator(page, { name: 'D' });

    expect(
      await ContextMenu(page, monomerLocator).isOptionVisible(
        MonomerOnMicroOption.CreateMonomer,
      ),
    ).toBe(false);
  });

  test('9.5 Create Monomer is visible when selection contains multiple monomers', async () => {
    /*
     * Spec: monomer-context-menu § "Create Monomer" visible when selection contains multiple monomers
     */
    // Load a file with two monomers and select both
    await openFileAndAddToCanvasAsNewProject(page, PEPTIDE_D_KET);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(page, PEPTIDE_D_KET);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await selectAllStructuresOnCanvas(page);
    const monomerLocator = getAbbreviationLocator(page, { name: 'D' }).first();

    expect(
      await ContextMenu(page, monomerLocator).isOptionVisible(
        MonomerOnMicroOption.CreateMonomer,
      ),
    ).toBe(true);
  });

  test('9.6 Delete removes the right-clicked monomer when nothing is selected', async () => {
    /*
     * Spec: monomer-context-menu § "Delete" removes the right-clicked monomer when nothing is selected
     */
    await openFileAndAddToCanvasAsNewProject(page, PEPTIDE_D_KET);
    await takeEditorScreenshot(page);
    const monomerLocator = getAbbreviationLocator(page, { name: 'D' });
    await ContextMenu(page, monomerLocator).click(
      MonomerOnMicroOption.DeleteMonomer,
    );
    await takeEditorScreenshot(page);
  });
});
