/* eslint-disable no-magic-numbers */
import { Page, test, expect } from '@fixtures';
import { CreateMonomerDialog } from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import {
  AminoAcidNaturalAnalogue,
  MonomerType,
} from '@tests/pages/constants/createMonomerDialog/Constants';
import {
  pasteFromClipboardAndOpenAsNewProject,
  takeElementScreenshot,
} from '@utils';
import { ErrorMessage } from '@tests/pages/constants/notificationMessageBanner/Constants';
import { NotificationMessageBanner } from '@tests/pages/molecules/canvas/createMonomer/NotificationMessageBanner';

let page: Page;

test.describe('Rename monomer symbol to monomer code:', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1 - Verify that the "Symbol" field name in the attributes panel of the monomer creation wizard is replaced with "Code"', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10016
     * Description: Verify that the "Symbol" field name is replaced with "Code" in the monomer creation wizard
     * Scenario:
     * 1. Open monomer creation wizard
     * 2. Verify the field is now labeled as "Code" instead of "Symbol"
     * 3. Take screenshot to verify the field label
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');

    const createMonomerDialog = CreateMonomerDialog(page);

    // Open the monomer creation wizard
    await LeftToolbar(page).createMonomer();

    // Wait for dialog to be visible
    await expect(createMonomerDialog.window).toBeVisible();

    // Check that the field is accessible (which means it exists with the expected test id)
    await expect(createMonomerDialog.codeEditbox).toBeVisible();

    // Take a screenshot to verify the field label shows "Code"
    await takeElementScreenshot(page, createMonomerDialog.window);

    await createMonomerDialog.discard();
  });

  test('Case 2 - Verify that the updated error message is displayed when the user enters invalid characters in the "Code" field', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10016
     * Description: Verify updated error message for invalid characters in Code field
     * Scenario:
     * 1. Open monomer creation wizard
     * 2. Select a monomer type
     * 3. Enter invalid characters in the Code field (special characters not allowed)
     * 4. Verify error message: "The monomer code must consist only of uppercase and lowercase letters, numbers, hyphens (-), underscores (_), and asterisks (*)."
     * 5. Take screenshot of error message
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');

    const createMonomerDialog = CreateMonomerDialog(page);

    // Open the monomer creation wizard
    await LeftToolbar(page).createMonomer();
    await expect(createMonomerDialog.window).toBeVisible();

    // Select a monomer type
    await createMonomerDialog.selectType(MonomerType.AminoAcid);

    // Enter invalid characters in the Code field
    await createMonomerDialog.setCode('Test@#$%');
    await createMonomerDialog.setName('Test Monomer');

    // Try to submit to trigger validation
    await createMonomerDialog.submit();

    // Verify the specific error message is displayed
    expect(
      await NotificationMessageBanner(
        page,
        ErrorMessage.invalidSymbol,
      ).getNotificationMessage(),
    ).toEqual(
      'The monomer code must consist only of uppercase and lowercase letters, numbers, hyphens (-), underscores (_), and asterisks (*).',
    );

    // Take screenshot of the error message
    await takeElementScreenshot(page, createMonomerDialog.window);

    await createMonomerDialog.discard();
  });

  test('Case 3 - Verify that the updated error message is displayed when the user enters a duplicate Code that already exists in the monomer lists', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10016
     * Description: Verify error message for duplicate Code in monomer lists
     * Scenario:
     * 1. Open monomer creation wizard
     * 2. Select a monomer type
     * 3. Enter a Code that already exists (like 'A' for amino acids)
     * 4. Fill other required fields
     * 5. Try to submit and verify duplicate error message is displayed
     * 6. Take screenshot of error message
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');

    const createMonomerDialog = CreateMonomerDialog(page);

    // Open the monomer creation wizard
    await LeftToolbar(page).createMonomer();
    await expect(createMonomerDialog.window).toBeVisible();

    // Select a monomer type
    await createMonomerDialog.selectType(MonomerType.AminoAcid);

    // Enter a duplicate code that already exists (A is a common amino acid code)
    await createMonomerDialog.setCode('A');
    await createMonomerDialog.setName('Test Duplicate Monomer');
    await createMonomerDialog.selectNaturalAnalogue(AminoAcidNaturalAnalogue.A);

    // Try to submit to trigger validation
    await createMonomerDialog.submit();

    // Verify that an error message appears (should indicate duplicate)
    expect(
      await NotificationMessageBanner(
        page,
        ErrorMessage.symbolExists,
      ).getNotificationMessage(),
    ).toEqual(
      'The code must be unique amongst peptide, RNA, or CHEM monomers.',
    );

    // Take screenshot of the error message
    await takeElementScreenshot(page, createMonomerDialog.window);

    await createMonomerDialog.discard();
  });

  test('Case 4 - Verify that valid Code characters are accepted without error', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10016
     * Description: Verify valid Code characters are accepted
     * Scenario:
     * 1. Open monomer creation wizard
     * 2. Select a monomer type
     * 3. Enter valid Code with allowed characters (letters, numbers, hyphens, underscores, asterisks)
     * 4. Fill other required fields
     * 5. Verify no error messages appear
     * 6. Successfully submit the monomer creation
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, '[*:1]CC |$_R1;;$|');

    const createMonomerDialog = CreateMonomerDialog(page);

    // Open the monomer creation wizard
    await LeftToolbar(page).createMonomer();
    await expect(createMonomerDialog.window).toBeVisible();

    // Select a monomer type
    await createMonomerDialog.selectType(MonomerType.AminoAcid);

    // Enter valid Code with all allowed character types
    await createMonomerDialog.setCode('Test_Code-123*');
    await createMonomerDialog.setName('Test Valid Code Monomer');
    await createMonomerDialog.selectNaturalAnalogue(AminoAcidNaturalAnalogue.A);

    // Submit should succeed without validation errors
    await createMonomerDialog.submit({ ignoreWarning: true });

    // Verify the dialog is closed (successful submission)
    await expect(createMonomerDialog.window).not.toBeVisible();
  });
});
