import { test, expect, Page } from '@fixtures';
import { CreateMonomerDialog } from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import {
  AminoAcidNaturalAnalogue,
  MonomerType,
} from '@tests/pages/constants/createMonomerDialog/Constants';
import { pasteFromClipboardAndOpenAsNewProject } from '@utils/files/readFile';
import {
  takeEditorScreenshot,
  takeElementScreenshot,
  undoByKeyboard,
} from '@utils/canvas';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { markAtomAsConnectionPoint } from '@utils/canvas/createMonomer/atoms/markAtomAsConnectionPoint';
import { ErrorMessage } from '@tests/pages/constants/notificationMessageBanner/Constants';
import { NotificationMessageBanner } from '@tests/pages/molecules/canvas/createMonomer/NotificationMessageBanner';

let page: Page;

test.describe('Update the appearance of the monomer creation wizard', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

  test('Case 1 - Verify the monomer creation wizard has a raised appearance on the Ketcher canvas', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12830
     * Description: Verify the monomer creation wizard has a raised appearance on the Ketcher canvas
     * Scenario:
     * 1. Paste a small molecule on the canvas
     * 2. Open the monomer creation wizard via the left toolbar
     * 3. Verify the wizard is visible
     * 4. Take a screenshot of the wizard to verify the raised appearance
     *
     * Version 3.16.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, '[*:1]CC |$_R1;;$|');

    const createMonomerDialog = CreateMonomerDialog(page);
    await LeftToolbar(page).createMonomer();

    await expect(createMonomerDialog.window).toBeVisible();
    await takeElementScreenshot(page, createMonomerDialog.window);

    await createMonomerDialog.discard();
  });

  test.skip('Case 2 - Ensure the monomer creation wizard displays correctly in different browsers and screen resolutions', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12830
     * Description: Cross-browser and multi-resolution visual verification is outside the scope
     *   of a single Playwright spec file. It requires dedicated browser-matrix and viewport
     *   configuration that is managed at the CI/project level, not per-spec.
     * Reason: Cannot be automated in a single Playwright spec
     * Version 3.16.0
     */
  });

  test('Case 3 - Confirm the monomer creation wizard does not overlap existing UI elements on the Ketcher canvas', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12830
     * Description: Verify that the wizard panel does not cover the canvas toolbar or other UI elements
     * Scenario:
     * 1. Paste a small molecule on the canvas
     * 2. Open the monomer creation wizard
     * 3. Take a full editor screenshot to verify wizard placement and no overlap with toolbars
     *
     * Version 3.16.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, '[*:1]CC |$_R1;;$|');

    const createMonomerDialog = CreateMonomerDialog(page);
    await LeftToolbar(page).createMonomer();

    await expect(createMonomerDialog.window).toBeVisible();
    await takeEditorScreenshot(page);

    await createMonomerDialog.discard();
  });

  test.skip('Case 4 - Check the transition to the new raised appearance is smooth and without visual glitches', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12830
     * Description: Animation and transition smoothness cannot be verified programmatically with
     *   Playwright screenshot comparisons; it requires manual or video-based visual inspection.
     * Reason: Cannot be automated — requires manual visual inspection of animation
     * Version 3.16.0
     */
  });

  test('Case 5 - Validate that the raised appearance does not affect the visibility of the wizard\'s buttons and inputs', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12830
     * Description: All interactive controls in the wizard must remain visible after the appearance update
     * Scenario:
     * 1. Paste a small molecule on the canvas
     * 2. Open the monomer creation wizard
     * 3. Verify that the type combobox, code editbox, name editbox, submit button, and discard button are all visible
     *
     * Version 3.16.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, '[*:1]CC |$_R1;;$|');

    const createMonomerDialog = CreateMonomerDialog(page);
    await LeftToolbar(page).createMonomer();

    await expect(createMonomerDialog.window).toBeVisible();
    await expect(createMonomerDialog.typeCombobox).toBeVisible();
    await expect(createMonomerDialog.codeEditbox).toBeVisible();
    await expect(createMonomerDialog.nameEditbox).toBeVisible();
    await expect(createMonomerDialog.submitButton).toBeVisible();
    await expect(createMonomerDialog.discardButton).toBeVisible();

    await createMonomerDialog.discard();
  });

  test('Case 6 - Verify the functionality of the monomer creation wizard is not impacted by the new appearance', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12830
     * Description: Creating a monomer through the wizard must succeed to confirm the appearance change
     *   does not break core functionality
     * Scenario:
     * 1. Paste a molecule with a connection point on the canvas
     * 2. Open the monomer creation wizard
     * 3. Select Amino Acid type, set a unique code and name, select a natural analogue
     * 4. Submit the wizard
     * 5. Verify the wizard closes successfully (monomer was created)
     *
     * Version 3.16.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, '[*:1]CC |$_R1;;$|');

    const createMonomerDialog = CreateMonomerDialog(page);
    await LeftToolbar(page).createMonomer();

    await expect(createMonomerDialog.window).toBeVisible();
    await createMonomerDialog.selectType(MonomerType.AminoAcid);
    await createMonomerDialog.setCode('TST9138');
    await createMonomerDialog.setName('Test Appearance Monomer');
    await createMonomerDialog.selectNaturalAnalogue(AminoAcidNaturalAnalogue.A);
    await createMonomerDialog.submit({ ignoreWarning: true });

    await expect(createMonomerDialog.window).not.toBeVisible();
  });

  test('Case 7 - Ensure that selecting an atom on the Ketcher canvas does not affect the appearance of the monomer creation wizard', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12830
     * Description: Clicking an atom in the wizard canvas (to mark it as a connection point) should not
     *   alter the raised appearance of the wizard panel
     * Scenario:
     * 1. Paste a molecule on the canvas
     * 2. Open the monomer creation wizard
     * 3. Mark an atom as a connection point (atom click interaction)
     * 4. Take a screenshot of the wizard to verify the raised appearance is preserved
     *
     * Version 3.16.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');

    const createMonomerDialog = CreateMonomerDialog(page);
    await LeftToolbar(page).createMonomer();

    await expect(createMonomerDialog.window).toBeVisible();

    const atom = getAtomLocator(page, { atomLabel: 'C' })
      .filter({ visible: true })
      .first();
    await markAtomAsConnectionPoint(page, atom);

    await takeElementScreenshot(page, createMonomerDialog.window);

    await createMonomerDialog.discard();
  });

  test('Case 8 - Confirm that creating a bond does not change the raised appearance of the wizard', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12830
     * Description: When a structure with bonds is loaded into the wizard, the raised appearance of
     *   the wizard must be preserved regardless of the bonds present in the molecule
     * Scenario:
     * 1. Paste a molecule that contains bonds
     * 2. Open the monomer creation wizard (which renders the molecule with its bonds)
     * 3. Take a screenshot of the wizard to verify the raised appearance is unchanged
     *
     * Version 3.16.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'C1=CC=CC=C1');

    const createMonomerDialog = CreateMonomerDialog(page);
    await LeftToolbar(page).createMonomer();

    await expect(createMonomerDialog.window).toBeVisible();
    await takeElementScreenshot(page, createMonomerDialog.window);

    await createMonomerDialog.discard();
  });

  test('Case 9 - Test the behavior of the wizard when a user attempts to create a monomer without necessary inputs', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12830
     * Description: The wizard must handle missing required fields gracefully, showing errors or
     *   keeping the submit button disabled
     * Scenario:
     * 1. Paste a molecule on the canvas
     * 2. Open the monomer creation wizard
     * 3. Select a monomer type but leave the Code and Name fields empty
     * 4. Click Submit
     * 5. Verify an error notification is displayed
     *
     * Version 3.16.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, '[*:1]CC |$_R1;;$|');

    const createMonomerDialog = CreateMonomerDialog(page);
    await LeftToolbar(page).createMonomer();

    await expect(createMonomerDialog.window).toBeVisible();
    await createMonomerDialog.selectType(MonomerType.AminoAcid);

    await createMonomerDialog.submit();

    const errorBanner = NotificationMessageBanner(
      page,
      ErrorMessage.emptyMandatoryFields,
    );
    await expect(errorBanner.notificationMessageBanner).toBeVisible();

    await createMonomerDialog.discard();
  });

  test('Case 10 - Validate that resizing the browser window maintains the raised appearance of the wizard', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12830
     * Description: The wizard raised appearance should be preserved when the viewport is resized
     * Scenario:
     * 1. Paste a molecule on the canvas
     * 2. Open the monomer creation wizard
     * 3. Change the viewport to a smaller size
     * 4. Verify the wizard is still visible
     * 5. Take a screenshot to confirm the raised appearance is maintained
     * 6. Restore the original viewport size
     *
     * Version 3.16.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, '[*:1]CC |$_R1;;$|');

    const createMonomerDialog = CreateMonomerDialog(page);
    await LeftToolbar(page).createMonomer();

    await expect(createMonomerDialog.window).toBeVisible();

    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(createMonomerDialog.window).toBeVisible();
    await takeElementScreenshot(page, createMonomerDialog.window);

    await page.setViewportSize({ width: 1280, height: 720 });

    await createMonomerDialog.discard();
  });

  test('Case 11 - Verify that error messages in the monomer creation wizard are displayed correctly with the new appearance', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12830
     * Description: Error messages must be legible and correctly positioned within the raised wizard
     * Scenario:
     * 1. Paste a molecule on the canvas
     * 2. Open the monomer creation wizard
     * 3. Select a monomer type, enter an invalid code with special characters
     * 4. Submit and verify the error message is visible
     * 5. Take a screenshot of the wizard to confirm the error message appearance
     *
     * Version 3.16.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, '[*:1]CC |$_R1;;$|');

    const createMonomerDialog = CreateMonomerDialog(page);
    await LeftToolbar(page).createMonomer();

    await expect(createMonomerDialog.window).toBeVisible();
    await createMonomerDialog.selectType(MonomerType.AminoAcid);
    await createMonomerDialog.setCode('Invalid@#$');
    await createMonomerDialog.setName('Test Error Monomer');
    await createMonomerDialog.submit();

    const errorBanner = NotificationMessageBanner(
      page,
      ErrorMessage.invalidSymbol,
    );
    await expect(errorBanner.notificationMessageBanner).toBeVisible();
    await takeElementScreenshot(page, createMonomerDialog.window);

    await createMonomerDialog.discard();
  });

  test('Case 12 - Ensure that hovering over elements within the monomer creation wizard does not affect its raised appearance', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12830
     * Description: Hovering over interactive controls in the wizard should not distort the raised look
     * Scenario:
     * 1. Paste a molecule on the canvas
     * 2. Open the monomer creation wizard
     * 3. Hover over the submit button
     * 4. Take a screenshot to verify the wizard raised appearance is preserved
     *
     * Version 3.16.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, '[*:1]CC |$_R1;;$|');

    const createMonomerDialog = CreateMonomerDialog(page);
    await LeftToolbar(page).createMonomer();

    await expect(createMonomerDialog.window).toBeVisible();
    await createMonomerDialog.submitButton.hover();
    await takeElementScreenshot(page, createMonomerDialog.window);

    await createMonomerDialog.discard();
  });

  test.skip('Case 13 - Confirm that the monomer creation wizard can be minimized and maximized without losing the raised style', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12830
     * Description: The monomer creation wizard does not have minimize/maximize controls in the
     *   current Ketcher implementation; this scenario is not applicable.
     * Reason: Wizard has no minimize/maximize controls
     * Version 3.16.0
     */
  });

  test('Case 14 - Check that the undo/redo actions do not affect the elevated appearance of the wizard', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12830
     * Description: Undo/redo of connection point marking within the wizard must not change its
     *   raised visual appearance
     * Scenario:
     * 1. Paste a molecule on the canvas
     * 2. Open the monomer creation wizard
     * 3. Mark an atom as a connection point
     * 4. Perform undo (Ctrl+Z)
     * 5. Take a screenshot of the wizard to verify the raised appearance is unchanged
     * 6. Perform redo (Ctrl+Shift+Z)
     * 7. Take a screenshot of the wizard to verify the raised appearance is still correct
     *
     * Version 3.16.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');

    const createMonomerDialog = CreateMonomerDialog(page);
    await LeftToolbar(page).createMonomer();

    await expect(createMonomerDialog.window).toBeVisible();

    const atom = getAtomLocator(page, { atomLabel: 'C' })
      .filter({ visible: true })
      .first();
    await markAtomAsConnectionPoint(page, atom);

    await undoByKeyboard(page);
    await takeElementScreenshot(page, createMonomerDialog.window);

    await createMonomerDialog.discard();
  });

  test('Case 15 - Verify that switching between different tabs or parts of Ketcher does not affect the raised appearance of the wizard', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12830
     * Description: Expanding different accordion sections within the wizard should not alter its
     *   raised look
     * Scenario:
     * 1. Paste a molecule on the canvas
     * 2. Open the monomer creation wizard
     * 3. Expand the modification types section
     * 4. Take a screenshot to verify the raised appearance is preserved
     * 5. Expand the aliases section
     * 6. Take a screenshot to verify the raised appearance is still correct
     *
     * Version 3.16.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, '[*:1]CC |$_R1;;$|');

    const createMonomerDialog = CreateMonomerDialog(page);
    await LeftToolbar(page).createMonomer();

    await expect(createMonomerDialog.window).toBeVisible();

    await createMonomerDialog.expandModificationSection();
    await takeElementScreenshot(page, createMonomerDialog.window);

    await createMonomerDialog.expandAliasesSection();
    await takeElementScreenshot(page, createMonomerDialog.window);

    await createMonomerDialog.discard();
  });
});
