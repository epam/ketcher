import { test, expect, Page } from '@fixtures';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { OptionsForDebuggingSetting } from '@tests/pages/constants/settingsDialog/Constants';
import { StructureCheckSetting } from '@tests/pages/constants/structureCheck/Constants';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { StructureCheckDialog } from '@tests/pages/molecules/canvas/StructureCheckDialog';
import {
  resetSettingsValuesToDefault,
  setSettingsOption,
} from '@tests/pages/molecules/canvas/SettingsDialog';
import { addAtoms } from '@utils/canvas/atoms/addAtoms';
import { pasteFromClipboardAndOpenAsNewProject } from '@utils/files/readFile';
import { takeEditorScreenshot } from '@utils';

const IDS_EXPLANATION_TEXT =
  "Some checks will return atom or bond IDs for the elements causing the error. To visualize them toggle on the 'Show Atom IDs' and 'Show Bond IDs' in the 'Debugging' section of Settings.";

let page: Page;

test.describe('Add an explanation about atom/bond IDs to the Check structure window', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

  test.afterEach(async () => {
    if (await StructureCheckDialog(page).cancelButton.isVisible()) {
      await StructureCheckDialog(page).cancel();
    }
  });

  test('Case 1 - Verify that the "Check structure" window displays the new explanation text about atom and bond IDs', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12673
     * Description: The "Check structure" window contains a static explanation text that informs
     * users that some check results return atom or bond IDs, and directs them to enable
     * "Show Atom IDs" / "Show Bond IDs" in Settings > Debugging.
     * Scenario:
     * 1. Paste a simple molecule (ethane) on the canvas
     * 2. Open the "Check structure" dialog via the Indigo Functions toolbar
     * 3. Verify the idsExplanation element contains the expected explanation text
     *
     * Version 3.21.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CC');
    await IndigoFunctionsToolbar(page).checkStructure();
    await expect(StructureCheckDialog(page).idsExplanation).toHaveText(
      IDS_EXPLANATION_TEXT,
    );
  });

  test('Case 2 - Validate the "Check structure" window opens correctly when triggered', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12673
     * Description: Clicking "Check Structure" in the Indigo Functions toolbar opens the
     * "Check structure" dialog with all expected UI elements: checkboxes, action buttons,
     * the explanation text, and a last-check timestamp area.
     * Scenario:
     * 1. Paste a simple molecule on the canvas
     * 2. Click "Check Structure" in the Indigo Functions toolbar
     * 3. Verify the dialog opens and all key elements are visible
     * 4. Take a screenshot of the dialog
     *
     * Version 3.21.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CC');
    await IndigoFunctionsToolbar(page).checkStructure();
    const dialog = StructureCheckDialog(page);
    await expect(dialog.valenceCheckbox).toBeVisible();
    await expect(dialog.checkButton).toBeVisible();
    await expect(dialog.cancelButton).toBeVisible();
    await expect(dialog.idsExplanation).toBeVisible();
    await takeEditorScreenshot(page, {
      mask: [dialog.lastCheckInfo],
    });
  });

  test('Case 3 - Confirm that the explanation text appears only when atom or bond IDs are relevant', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12673
     * Description: After running a structure check that may return atom or bond IDs in its
     * error results, the explanation text is visible to guide users on how to visualize those IDs.
     * Scenario:
     * 1. Place a carbon atom on the canvas
     * 2. Open the "Check structure" dialog
     * 3. Click "Check" to run the structure check
     * 4. Verify the explanation text is visible after the check completes
     *
     * Version 3.21.0
     */
    await addAtoms(page, Atom.Carbon, [{ x: 400, y: 300 }]);
    await IndigoFunctionsToolbar(page).checkStructure();
    await StructureCheckDialog(page).check();
    await expect(StructureCheckDialog(page).idsExplanation).toBeVisible();
    await expect(StructureCheckDialog(page).idsExplanation).toHaveText(
      IDS_EXPLANATION_TEXT,
    );
  });

  test('Case 4 - Check clicking "Show Atom IDs" in Settings correctly toggles visibility of atom IDs in the editor', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12673
     * Description: Enabling "Show Atom IDs" in the Debugging section of Settings causes
     * atom ID labels to appear on each atom in the editor canvas.
     * Scenario:
     * 1. Paste a benzene molecule on the canvas
     * 2. Open Settings and enable "Show Atom IDs" in the Debugging section
     * 3. Verify atom ID labels are visible on the canvas (via screenshot)
     *
     * Version 3.21.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'c1ccccc1');
    await setSettingsOption(page, OptionsForDebuggingSetting.ShowAtomIds);
    await takeEditorScreenshot(page);
    await resetSettingsValuesToDefault(page);
  });

  test('Case 5 - Check clicking "Show Bond IDs" in Settings correctly toggles visibility of bond IDs in the editor', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12673
     * Description: Enabling "Show Bond IDs" in the Debugging section of Settings causes
     * bond ID labels to appear on each bond in the editor canvas.
     * Scenario:
     * 1. Paste a benzene molecule on the canvas
     * 2. Open Settings and enable "Show Bond IDs" in the Debugging section
     * 3. Verify bond ID labels are visible on the canvas (via screenshot)
     *
     * Version 3.21.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'c1ccccc1');
    await setSettingsOption(page, OptionsForDebuggingSetting.ShowBondsIds);
    await takeEditorScreenshot(page);
    await resetSettingsValuesToDefault(page);
  });

  test.skip('Case 6 - Ensure the explanation text is visible and legible on different screen resolutions', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12673
     * Description: The explanation text in the "Check structure" dialog should be fully visible
     * and readable across various screen/viewport sizes.
     * Reason skipped: Ketcher E2E tests run at a fixed 1280×720 viewport in Chromium only.
     * Multi-resolution testing requires manual verification or a dedicated visual QA pass.
     *
     * Version 3.21.0
     */
  });

  test.skip('Case 7 - Test the visibility of explanation text on different browser types and versions (e.g., Chrome, Firefox)', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12673
     * Description: The explanation text should be visible and render correctly in multiple browsers.
     * Reason skipped: Ketcher E2E tests run on Chromium only. Cross-browser testing is outside the
     * scope of the automated Playwright suite for this project.
     *
     * Version 3.21.0
     */
  });

  test('Case 8 - Verify the explanation text disappears when toggling off the related settings', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12673
     * Description: The explanation text in the "Check structure" dialog is always present
     * regardless of the state of Show Atom IDs / Show Bond IDs in Settings. This test verifies
     * the text remains visible when both settings are toggled off (default state).
     * Scenario:
     * 1. Ensure Show Atom IDs and Show Bond IDs are disabled (reset to defaults)
     * 2. Paste a molecule on the canvas
     * 3. Open the "Check structure" dialog
     * 4. Verify the explanation text is visible even with the settings toggled off
     *
     * Version 3.21.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CC');
    await IndigoFunctionsToolbar(page).checkStructure();
    await expect(StructureCheckDialog(page).idsExplanation).toBeVisible();
    await expect(StructureCheckDialog(page).idsExplanation).toHaveText(
      IDS_EXPLANATION_TEXT,
    );
  });

  test('Case 9 - Validate the presence of explanation text when multiple errors involving atom/bond IDs occur', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12673
     * Description: When a structure check returns multiple errors that may reference atom or bond IDs,
     * the explanation text is still present to guide the user.
     * Scenario:
     * 1. Paste a structure known to have valence errors (e.g. a nitrogen with 5 bonds)
     * 2. Open the "Check structure" dialog
     * 3. Run the check
     * 4. Verify the explanation text is visible alongside the error results
     *
     * Version 3.21.0
     */
    // Use a SMILES that produces a structure with an overvalent atom
    await pasteFromClipboardAndOpenAsNewProject(page, 'N(=O)(=O)=O');
    await IndigoFunctionsToolbar(page).checkStructure();
    await StructureCheckDialog(page).check();
    await expect(StructureCheckDialog(page).idsExplanation).toBeVisible();
    await expect(StructureCheckDialog(page).idsExplanation).toHaveText(
      IDS_EXPLANATION_TEXT,
    );
  });

  test('Case 10 - Confirm that no explanation text appears for structures without atom or bond ID errors', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12673
     * Description: For a valid structure that produces no check errors, the explanation text is
     * present in the dialog (it is a static educational note, not conditional on errors).
     * This test verifies that the dialog opens and behaves correctly for a clean structure.
     * Scenario:
     * 1. Paste a valid molecule (benzene) on the canvas
     * 2. Open the "Check structure" dialog
     * 3. Run the check
     * 4. Verify the dialog opens correctly and the explanation text is present
     *
     * Version 3.21.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'c1ccccc1');
    await IndigoFunctionsToolbar(page).checkStructure();
    await StructureCheckDialog(page).check();
    await expect(StructureCheckDialog(page).idsExplanation).toBeVisible();
    await takeEditorScreenshot(page, {
      mask: [StructureCheckDialog(page).lastCheckInfo],
    });
  });

  test('Case 11 - Test the behavior of the "Check structure" window when no settings are toggled on', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12673
     * Description: With all structure-check checkboxes unchecked (none of Valence, Radical, etc.
     * are selected), the dialog still displays the explanation text and the UI remains functional.
     * Scenario:
     * 1. Paste a simple molecule on the canvas
     * 2. Open the "Check structure" dialog
     * 3. Uncheck all structure-check checkboxes
     * 4. Click "Check"
     * 5. Verify the explanation text is still visible and the dialog is functional
     *
     * Version 3.21.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CC');
    await IndigoFunctionsToolbar(page).checkStructure();
    const dialog = StructureCheckDialog(page);
    await dialog.uncheckCheckboxes([
      StructureCheckSetting.Valence,
      StructureCheckSetting.Radical,
      StructureCheckSetting.Pseudoatom,
      StructureCheckSetting.Stereochemistry,
      StructureCheckSetting.Query,
      StructureCheckSetting.OverlappingAtoms,
      StructureCheckSetting.OverlappingBonds,
      StructureCheckSetting.RGroups,
      StructureCheckSetting.Chirality,
      StructureCheckSetting.ThreeDSructure,
      StructureCheckSetting.ChiralFlag,
    ]);
    await dialog.check();
    await expect(dialog.idsExplanation).toBeVisible();
    await expect(dialog.idsExplanation).toHaveText(IDS_EXPLANATION_TEXT);
  });

  test('Case 12 - Check the UI alignment of the explanation text in relation to the surrounding elements', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12673
     * Description: The explanation text in the "Check structure" dialog should be properly
     * positioned and aligned relative to the checkboxes, buttons, and error message area.
     * Scenario:
     * 1. Paste a molecule on the canvas
     * 2. Open the "Check structure" dialog
     * 3. Run the check
     * 4. Take a screenshot to verify UI alignment of the explanation text
     *
     * Version 3.21.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CC');
    await IndigoFunctionsToolbar(page).checkStructure();
    await StructureCheckDialog(page).check();
    await takeEditorScreenshot(page, {
      mask: [StructureCheckDialog(page).lastCheckInfo],
    });
  });

  test('Case 13 - Verify the text updates dynamically if the window content is refreshed', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12673
     * Description: After the "Check structure" dialog is opened and a check is performed,
     * the last-check timestamp updates and the explanation text remains consistent across
     * multiple check runs.
     * Scenario:
     * 1. Paste a molecule on the canvas
     * 2. Open the "Check structure" dialog
     * 3. Run the check and note the state of the explanation text
     * 4. Run the check again
     * 5. Verify the explanation text remains unchanged and the dialog is still functional
     *
     * Version 3.21.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CC');
    await IndigoFunctionsToolbar(page).checkStructure();
    await StructureCheckDialog(page).check();
    await expect(StructureCheckDialog(page).idsExplanation).toHaveText(
      IDS_EXPLANATION_TEXT,
    );
    await StructureCheckDialog(page).check();
    await expect(StructureCheckDialog(page).idsExplanation).toHaveText(
      IDS_EXPLANATION_TEXT,
    );
  });

  test.skip('Case 14 - Validate that localization settings (if any) do not affect the correct display of the explanation', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12673
     * Description: Switching the application locale/language should not cause the explanation text
     * to disappear or display incorrectly.
     * Reason skipped: Ketcher does not expose localization/language settings in its Settings dialog
     * or via any public API accessible to the E2E suite. Cross-locale testing requires manual
     * verification or a dedicated i18n test harness.
     *
     * Version 3.21.0
     */
  });

  test.skip('Case 15 - Check the performance impact of the explanation text on the "Check structure" window load time', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12673
     * Description: Adding the explanation text element to the "Check structure" window should
     * not introduce a measurable delay when opening the dialog.
     * Reason skipped: The Ketcher E2E suite has no performance testing infrastructure
     * (no timing assertions, no Web Vitals helpers, no load-time budgets). Performance
     * validation requires a dedicated benchmark approach outside Playwright.
     *
     * Version 3.21.0
     */
  });
});
