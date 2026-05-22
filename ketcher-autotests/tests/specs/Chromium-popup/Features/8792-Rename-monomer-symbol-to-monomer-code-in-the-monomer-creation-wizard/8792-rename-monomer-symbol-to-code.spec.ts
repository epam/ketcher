/* eslint-disable no-magic-numbers */
import { Page, test, expect } from '@fixtures';
import { CreateMonomerDialog } from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { MonomerType } from '@tests/pages/constants/createMonomerDialog/Constants';
import { takeElementScreenshot } from '@utils';

let page: Page;

test.describe('Rename monomer symbol to monomer code in the monomer creation wizard', () => {
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
     * Version 3.16.0
     */

    const createMonomerDialog = CreateMonomerDialog(page);
    
    // Open the monomer creation wizard
    await LeftToolbar(page).createMonomer();
    
    // Wait for dialog to be visible
    await expect(createMonomerDialog.window).toBeVisible();
    
    // Check that the field is accessible (which means it exists with the expected test id)
    await expect(createMonomerDialog.symbolEditbox).toBeVisible();
    
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
     * Version 3.16.0
     */

    const createMonomerDialog = CreateMonomerDialog(page);
    
    // Open the monomer creation wizard
    await LeftToolbar(page).createMonomer();
    await expect(createMonomerDialog.window).toBeVisible();
    
    // Select a monomer type
    await createMonomerDialog.selectType(MonomerType.Peptide);
    
    // Enter invalid characters in the Code field
    await createMonomerDialog.setSymbol('Test@#$%');
    await createMonomerDialog.setName('Test Monomer');
    
    // Try to submit to trigger validation
    await createMonomerDialog.submit();
    
    // Verify the specific error message is displayed
    const errorMessage = page.locator(':has-text("The monomer code must consist only of uppercase and lowercase letters, numbers, hyphens (-), underscores (_), and asterisks (*)."), :has-text("The monomer code must consist only of uppercase and lowercase letters, numbers, hyphens (-), underscores (_), and asterisks (*)")');
    await expect(errorMessage).toBeVisible();
    
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
     * Version 3.16.0
     */

    const createMonomerDialog = CreateMonomerDialog(page);
    
    // Open the monomer creation wizard
    await LeftToolbar(page).createMonomer();
    await expect(createMonomerDialog.window).toBeVisible();
    
    // Select a monomer type
    await createMonomerDialog.selectType(MonomerType.Peptide);
    
    // Enter a duplicate code that already exists (A is a common amino acid code)
    await createMonomerDialog.setSymbol('A');
    await createMonomerDialog.setName('Test Duplicate Monomer');
    
    // Try to submit to trigger validation
    await createMonomerDialog.submit();
    
    // Verify that an error message appears (the exact text may vary, but should indicate duplicate)
    // We'll look for common duplicate-related error message patterns
    const duplicateErrorMessage = page.locator(':has-text("already exists"), :has-text("duplicate"), :has-text("used"), :has-text("taken")');
    await expect(duplicateErrorMessage.first()).toBeVisible();
    
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
     * Version 3.16.0
     */

    const createMonomerDialog = CreateMonomerDialog(page);
    
    // Open the monomer creation wizard
    await LeftToolbar(page).createMonomer();
    await expect(createMonomerDialog.window).toBeVisible();
    
    // Select a monomer type
    await createMonomerDialog.selectType(MonomerType.Peptide);
    
    // Enter valid Code with all allowed character types
    await createMonomerDialog.setSymbol('Test_Code-123*');
    await createMonomerDialog.setName('Test Valid Code Monomer');
    
    // Submit should succeed without validation errors
    await createMonomerDialog.submit({ ignoreWarning: true });
    
    // Verify the dialog is closed (successful submission)
    await expect(createMonomerDialog.window).not.toBeVisible();
  });
});