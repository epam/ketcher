/* eslint-disable no-magic-numbers */
import { Page, test, expect } from '@fixtures';
import { pasteFromClipboardAndOpenAsNewProject } from '@utils/files/readFile';
import {
  MonomerType,
  shiftCanvas,
  takeEditorScreenshot,
} from '@utils/index';
import {
  CreateMonomerDialog,
  selectAtomAndBonds,
} from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import {
  NucleotideNaturalAnalogue,
  MonomerType as MonomerTypeInDropdown,
} from '@tests/pages/constants/createMonomerDialog/Constants';
import { NucleotidePresetSection } from '@tests/pages/molecules/canvas/createMonomer/NucleotidePresetSection';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import { Sugar } from '@tests/pages/constants/monomers/Sugars';
import { Base } from '@tests/pages/constants/monomers/Bases';
import { Phosphate } from '@tests/pages/constants/monomers/Phosphates';
import { Preset } from '@tests/pages/constants/monomers/Presets';
import { NotificationMessageBanner } from '@tests/pages/molecules/canvas/createMonomer/NotificationMessageBanner';
import { ErrorMessage, InfoMessage } from '@tests/pages/constants/notificationMessageBanner/Constants';
import { NucleotidePresetTab } from '@tests/pages/molecules/canvas/createMonomer/constants/nucleiotidePresetSection/Constants';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { MonomerWizardOption } from '@tests/pages/constants/contextMenu/Constants';
import { NotificationBanner } from '@tests/pages/molecules/canvas/NotificationBanner';
import { waitForRender } from '@utils/common/loaders/waitForRender';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';

let page: Page;
let dialog: ReturnType<typeof CreateMonomerDialog>;
let presetSection: ReturnType<typeof NucleotidePresetSection>;

test.beforeAll(async ({ initMoleculesCanvas }) => {
  page = await initMoleculesCanvas();
  dialog = CreateMonomerDialog(page);
  presetSection = NucleotidePresetSection(page);
});

test.afterAll(async ({ closePage }) => {
  await closePage();
});

test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

test.describe('Autotests: Exiting the wizard - presets in the monomer creation wizard', () => {
  test('Case 1 - Verify success message text when creating a new preset via monomer creation wizard', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10010
     * Description: Verify success message text when creating a new preset via monomer creation wizard
     * Scenario:
     * 1. Open Monomer Creation Wizard
     * 2. Select 'Nucleotide (preset)' type
     * 3. Fill in all required fields for the preset (components, properties, preset code, etc.)
     * 4. Click 'Finish' / 'Save' to successfully exit the wizard
     * 5. Observe the confirmation message shown after the wizard closes
     *
     * Expected: A confirmation toast/dialog appears with exact text: 'The preset was successfully added to the library'
     * Expected: The old message 'The monomer was successfully added to the library.' is not shown in this flow
     *
     * Version 3.15.0
     */
    const presetName = 'TestPreset1';
    
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
    
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);
    await presetSection.setName(presetName);
    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      code: 'TstS1',
      name: 'Test Sugar 1',
    });
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      code: 'TstB1',
      name: 'Test Base 1',
      naturalAnalogue: NucleotideNaturalAnalogue.A,
    });
    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
      code: 'TstP1',
      name: 'Test Phosphate 1',
    });
    
    await dialog.submit();
    
    const notificationText = await NotificationBanner(page).getNotificationText();
    expect(notificationText).toContain('The preset was successfully added to the library');
    expect(notificationText).not.toContain('The monomer was successfully added to the library');
  });

  test('Case 2 - Verify success message text when creating a preset from an alternative entry point', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10010
     * Description: Verify success message text when creating a preset from an alternative entry point
     * Scenario:
     * 1. Open the Monomer Library panel
     * 2. Use an alternative entry point to start preset creation (e.g., 'Add preset' button)
     * 3. Ensure 'Nucleotide (preset)' flow is used
     * 4. Fill in all mandatory preset fields
     * 5. Click 'Finish' / 'Save' and exit the wizard
     * 6. Observe the confirmation message
     *
     * Expected: Regardless of how the preset creation wizard was opened, after a successful save the confirmation text is exactly: 'The preset was successfully added to the library'
     *
     * Version 3.15.0
     */
    const presetName = 'TestPreset2';
    
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await Library(page).newPreset();
    
    // Should be on the molecules canvas now with the preset wizard open
    await shiftCanvas(page, -150, 50);
    await presetSection.setName(presetName);
    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      code: 'TstS2',
      name: 'Test Sugar 2',
    });
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      code: 'TstB2',
      name: 'Test Base 2',
      naturalAnalogue: NucleotideNaturalAnalogue.G,
    });
    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
      code: 'TstP2',
      name: 'Test Phosphate 2',
    });
    
    await dialog.submit();
    
    const notificationText = await NotificationBanner(page).getNotificationText();
    expect(notificationText).toContain('The preset was successfully added to the library');
    expect(notificationText).not.toContain('The monomer was successfully added to the library');
  });

  test('Case 3 - Verify success message text when editing and saving an existing preset via the wizard', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10010
     * Description: Verify success message text when editing and saving an existing preset via the wizard
     * Scenario:
     * 1. Open Ketcher in macromolecules mode
     * 2. Open Monomer Library and select an existing preset entry
     * 3. Open the preset in the monomer creation wizard for editing
     * 4. Modify one or more preset properties
     * 5. Click 'Finish' / 'Save' in the wizard
     * 6. Observe the confirmation message
     *
     * Expected: After successfully saving changes, the confirmation message contains the word 'preset' instead of 'monomer'
     *
     * Version 3.15.0
     */
    // First create a preset to edit
    const originalPresetName = 'EditablePreset';
    const modifiedPresetName = 'ModifiedPreset';
    
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
    
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);
    await presetSection.setName(originalPresetName);
    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      code: 'EditS',
      name: 'Editable Sugar',
    });
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      code: 'EditB',
      name: 'Editable Base',
      naturalAnalogue: NucleotideNaturalAnalogue.C,
    });
    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
      code: 'EditP',
      name: 'Editable Phosphate',
    });
    
    await dialog.submit();
    
    // Wait for the success notification to disappear before proceeding
    await NotificationBanner(page).waitForBecomeHidden();
    
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    
    // Now edit the created preset by right-clicking and selecting edit option
    const editablePreset = {
      alias: originalPresetName,
      testId: `${originalPresetName}___`,
    };
    
    await Library(page).rightClickOnPreset(editablePreset);
    await ContextMenu(page, Library(page).getMonomerLibraryCardLocator(editablePreset)).click([
      MonomerWizardOption.Edit,
    ]);
    
    // Modify the preset name
    await presetSection.openTab(NucleotidePresetTab.Preset);
    await presetSection.setName(modifiedPresetName);
    
    await dialog.submit();
    
    const notificationText = await NotificationBanner(page).getNotificationText();
    expect(notificationText).toContain('preset');
    expect(notificationText).not.toContain('The monomer was successfully');
  });

  test('Case 4 - Verify canceling preset creation does not show success message', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10010
     * Description: Verify canceling preset creation does not show success message
     * Scenario:
     * 1. Open Monomer Creation Wizard and select 'Nucleotide (preset)'
     * 2. Optionally enter some data in the wizard
     * 3. Click 'Cancel' or close the wizard using the standard cancel/close action
     * 4. Observe notifications and messages after the wizard closes
     *
     * Expected: The preset is not saved. No success confirmation message ('The preset was successfully added to the library') is shown after canceling
     *
     * Version 3.15.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
    
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);
    await presetSection.setName('CanceledPreset');
    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      code: 'CncS',
      name: 'Canceled Sugar',
    });
    
    // Cancel the dialog
    await dialog.discard();
    
    // Verify no notification banner appears
    await expect(NotificationBanner(page).message).not.toBeVisible();
    
    // Verify the preset was not created by switching to macro mode and checking library
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    const canceledPreset = {
      alias: 'CanceledPreset',
      testId: 'CanceledPreset___',
    };
    await expect(Library(page).isMonomerExist(canceledPreset)).resolves.toBeFalsy();
  });

  test('Case 5 - Verify validation errors prevent showing preset success message', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10010
     * Description: Verify validation errors prevent showing preset success message
     * Scenario:
     * 1. Open the preset creation wizard
     * 2. Leave at least one required field invalid or empty (e.g., Code field empty)
     * 3. Click 'Finish' / 'Save'
     * 4. Observe wizard behavior and messages
     * 5. Fix all validation errors and save again successfully
     *
     * Expected: On the first attempt, the wizard stays open and shows validation errors; no success message about the preset being added to the library appears. Only after all errors are fixed and the save succeeds is the message 'The preset was successfully added to the library' displayed
     *
     * Version 3.15.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
    
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);
    
    // Leave preset name empty (validation error)
    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      code: 'ValS',
      name: 'Validation Sugar',
    });
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      code: 'ValB',
      name: 'Validation Base',
      naturalAnalogue: NucleotideNaturalAnalogue.T,
    });
    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
      code: 'ValP',
      name: 'Validation Phosphate',
    });
    
    // Try to submit with empty preset name
    await dialog.submit();
    
    // Verify error notification appears and dialog stays open
    const errorNotification = NotificationMessageBanner(page, ErrorMessage.emptyMandatoryFields);
    await expect(errorNotification.notificationMessageBanner).toBeVisible();
    await expect(dialog.window).toBeVisible();
    
    // No success message should appear
    await expect(NotificationBanner(page).message).not.toBeVisible();
    
    await errorNotification.ok();
    
    // Fix the validation error
    await presetSection.openTab(NucleotidePresetTab.Preset);
    await presetSection.setName('ValidatedPreset');
    
    // Now submit successfully
    await dialog.submit();
    
    // Verify success message appears
    const notificationText = await NotificationBanner(page).getNotificationText();
    expect(notificationText).toContain('The preset was successfully added to the library');
  });

  test('Case 6 - Verify non-preset monomer creation still uses monomer-specific success message', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10010
     * Description: Verify non-preset monomer creation still uses monomer-specific success message
     * Scenario:
     * 1. Open Monomer Creation Wizard
     * 2. Select a non-preset monomer type (e.g., 'Nucleotide (monomer)' or 'Small molecule')
     * 3. Fill in all required fields
     * 4. Click 'Finish' / 'Save'
     * 5. Observe the confirmation message
     *
     * Expected: The success message for non-preset monomer creation remains unchanged and mentions 'monomer' (e.g., 'The monomer was successfully added to the library.'), confirming preset changes did not impact non-preset flows
     *
     * Version 3.15.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
    
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    
    // Create a regular nucleotide monomer (not preset)
    await dialog.selectType(MonomerTypeInDropdown.NucleotideMonomer);
    await dialog.setCode('TestNuc');
    await dialog.setName('Test Nucleotide');
    await dialog.selectNaturalAnalogue(NucleotideNaturalAnalogue.A);
    
    // Select atoms and bonds for attachment points
    await selectAtomAndBonds(page, { atomIds: [0, 1], bondIds: [0] });
    
    await dialog.submit();
    
    const notificationText = await NotificationBanner(page).getNotificationText();
    expect(notificationText).toContain('The monomer was successfully added to the library');
    expect(notificationText).not.toContain('The preset was successfully');
  });

  test('Case 7 - Verify success message is not duplicated for a single successful preset save', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10010
     * Description: Verify success message is not duplicated for a single successful preset save
     * Scenario:
     * 1. Open the preset creation wizard and create a valid preset
     * 2. Click 'Finish' / 'Save'
     * 3. Observe the confirmation message behavior
     * 4. Confirm that the message appears once and follows standard auto-hide/dismiss behavior
     *
     * Expected: Exactly one confirmation message with text 'The preset was successfully added to the library' is shown per successful save action. No duplicate or repeated identical success messages appear for the same event
     *
     * Version 3.15.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
    
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);
    await presetSection.setName('SingleMessagePreset');
    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      code: 'SngS',
      name: 'Single Sugar',
    });
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      code: 'SngB',
      name: 'Single Base',
      naturalAnalogue: NucleotideNaturalAnalogue.A,
    });
    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
      code: 'SngP',
      name: 'Single Phosphate',
    });
    
    await dialog.submit();
    
    // Wait for notification to appear
    await NotificationBanner(page).waitForBecomeVisible();
    
    // Count notification banners - should be exactly 1
    const notificationBanners = page.getByTestId('notification-banner');
    const bannerCount = await notificationBanners.count();
    expect(bannerCount).toBe(1);
    
    const notificationText = await NotificationBanner(page).getNotificationText();
    expect(notificationText).toContain('The preset was successfully added to the library');
    
    // Verify the message auto-hides after some time (implementation-dependent)
    await NotificationBanner(page).waitForBecomeHidden();
  });

  test('Case 8 - Verify success message appears after preset creation in standalone environment', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10010
     * Description: Verify success message appears after preset creation in environments with different UI shells (e.g., standalone vs embedded)
     * Scenario:
     * 1. Run Ketcher in standalone mode (or primary deployment environment)
     * 2. Create a new preset via the wizard and save it; observe the success message
     * 3. Expected: In the supported deployment environment, after successfully saving a preset the same confirmation text 'The preset was successfully added to the library' is displayed. Message delivery mechanism is consistent across environments
     *
     * Version 3.15.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
    
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);
    await presetSection.setName('StandalonePreset');
    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      code: 'StdS',
      name: 'Standalone Sugar',
    });
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      code: 'StdB',
      name: 'Standalone Base',
      naturalAnalogue: NucleotideNaturalAnalogue.G,
    });
    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
      code: 'StdP',
      name: 'Standalone Phosphate',
    });
    
    await dialog.submit();
    
    // Verify notification appears in standalone environment
    await NotificationBanner(page).waitForBecomeVisible();
    const notificationText = await NotificationBanner(page).getNotificationText();
    expect(notificationText).toContain('The preset was successfully added to the library');
    
    // Verify the notification mechanism works (can be closed/dismissed)
    expect(await NotificationBanner(page).isVisible()).toBeTruthy();
    await NotificationBanner(page).close();
    await NotificationBanner(page).waitForBecomeHidden();
  });
});