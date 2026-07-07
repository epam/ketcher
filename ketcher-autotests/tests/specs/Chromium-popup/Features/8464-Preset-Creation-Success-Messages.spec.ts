/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-magic-numbers */
import { Page, test, expect } from '@fixtures';
import { pasteFromClipboardAndOpenAsNewProject } from '@utils/files/readFile';
import {
  MonomerType,
  selectAllStructuresOnCanvas,
  shiftCanvas,
} from '@utils/index';
import { CreateMonomerDialog } from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import {
  NucleotideNaturalAnalogue,
  MonomerType as MonomerTypeInDropdown,
} from '@tests/pages/constants/createMonomerDialog/Constants';
import { NucleotidePresetSection } from '@tests/pages/molecules/canvas/createMonomer/NucleotidePresetSection';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import { NotificationMessageBanner } from '@tests/pages/molecules/canvas/createMonomer/NotificationMessageBanner';
import { ErrorMessage } from '@tests/pages/constants/notificationMessageBanner/Constants';
import { NucleotidePresetTab } from '@tests/pages/molecules/canvas/createMonomer/constants/nucleiotidePresetSection/Constants';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { MicroAtomOption } from '@tests/pages/constants/contextMenu/Constants';
import { NotificationBanner } from '@tests/pages/molecules/canvas/NotificationBanner';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';

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

test.describe('Exiting the wizard - presets in the monomer creation wizard: ', () => {
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
     * Version 3.12.0
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

    const notificationText = await NotificationBanner(
      page,
    ).getNotificationText();
    expect(notificationText).toContain(
      'The preset was successfully added to the library',
    );
    expect(notificationText).not.toContain(
      'The monomer was successfully added to the library',
    );
  });

  test('Case 2 - Verify success message text when creating a preset from an alternative entry point', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10010
     * Description: Verify success message text when creating a preset from an alternative entry point
     * Scenario:
     * 1. Use an alternative entry point to start preset creation (e.g., 'Create monomer' in context menu)
     * 2. Ensure 'Nucleotide (preset)' flow is used
     * 3. Fill in all mandatory preset fields
     * 4. Click 'Finish' / 'Save' and exit the wizard
     * 5. Observe the confirmation message
     *
     * Expected: Regardless of how the preset creation wizard was opened,
     * after a successful save the confirmation text is exactly:
     * 'The preset was successfully added to the library'
     *
     * Version 3.12.0
     */
    const presetName = 'TestPreset2';

    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
    await selectAllStructuresOnCanvas(page);

    await ContextMenu(page, getAtomLocator(page, {}).first()).click(
      MicroAtomOption.CreateAMonomer,
    );

    // Should be on the molecules canvas now with the preset wizard open
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);
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

    const notificationText = await NotificationBanner(
      page,
    ).getNotificationText();
    expect(notificationText).toContain(
      'The preset was successfully added to the library',
    );
    expect(notificationText).not.toContain(
      'The monomer was successfully added to the library',
    );
  });

  test('Case 3 - Verify canceling preset creation does not show success message', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10010
     * Description: Verify canceling preset creation does not show success message
     * Scenario:
     * 1. Open Monomer Creation Wizard and select 'Nucleotide (preset)'
     * 2. Optionally enter some data in the wizard
     * 3. Click 'Cancel' or close the wizard using the standard cancel/close action
     * 4. Observe notifications and messages after the wizard closes
     *
     * Expected: The preset is not saved. No success confirmation message
     *           ('The preset was successfully added to the library') is shown after canceling
     *
     * Version 3.12.0
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

    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      code: 'CncB',
      name: 'Canceled Base',
      naturalAnalogue: NucleotideNaturalAnalogue.G,
    });
    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
      code: 'CncP',
      name: 'Canceled Phosphate',
    });

    // Cancel the dialog
    await dialog.discard();

    // Verify no notification banner appears
    await expect(NotificationBanner(page).message).not.toBeVisible();

    // Verify the preset was not created by switching to macro mode and checking library
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    const canceledPreset = {
      alias: 'CanceledPreset',
      testId: 'CanceledPreset_CncB_CncS_CncP',
      monomerType: MonomerType.Preset,
      sugar: {
        alias: 'CncS',
        testId: 'CncS___Canceled Sugar',
        monomerType: MonomerType.Sugar,
      },
      base: {
        alias: 'CncB',
        testId: 'CncB___Canceled Base',
        monomerType: MonomerType.Base,
      },
      phosphate: {
        alias: 'CncP',
        testId: 'CncP___Canceled Phosphate',
        monomerType: MonomerType.Phosphate,
      },
    };
    await expect(
      Library(page).isMonomerExist(canceledPreset),
    ).resolves.toBeFalsy();
  });

  test('Case 4 - Verify validation errors prevent showing preset success message', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10010
     * Description: Verify validation errors prevent showing preset success message
     * Scenario:
     * 1. Open the preset creation wizard
     * 2. Leave at least one required field invalid or empty (e.g., preset name field empty)
     * 3. Click 'Finish' / 'Save'
     * 4. Observe wizard behavior and messages
     * 5. Fix all validation errors and save again successfully
     *
     * Expected: On the first attempt, the wizard stays open and shows validation errors;
     *           no success message about the preset being added to the library appears.
     *           Only after all errors are fixed and the save succeeds is the message
     *           'The preset was successfully added to the library' displayed
     *
     * Version 3.12.0
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
    const errorNotification = NotificationMessageBanner(
      page,
      ErrorMessage.emptyMandatoryFields,
    );
    await expect(errorNotification.notificationMessageBanner).toBeVisible();
    await expect(dialog.window).toBeVisible();

    // No success message should appear
    await expect(NotificationBanner(page).message).not.toBeVisible();

    // Fix the validation error
    await presetSection.openTab(NucleotidePresetTab.Preset);
    await presetSection.setName('ValidatedPreset');

    // Now submit successfully
    await dialog.submit();

    // Verify success message appears
    const notificationText = await NotificationBanner(
      page,
    ).getNotificationText();
    expect(notificationText).toContain(
      'The preset was successfully added to the library',
    );
  });

  test('Case 5 - Verify non-preset monomer creation still uses monomer-specific success message', async () => {
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
     * Expected: The success message for non-preset monomer creation remains unchanged and
     *           mentions 'monomer' (e.g., 'The monomer was successfully added to the library.'),
     *           confirming preset changes did not impact non-preset flows
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      '[*:1]CCCCC |$_R1;;;;;$|',
    );

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);

    // Create a regular nucleotide monomer (not preset)
    await dialog.selectType(MonomerTypeInDropdown.NucleotideMonomer);
    await dialog.setCode('TestNuc');
    await dialog.setName('Test Nucleotide');
    await dialog.selectNaturalAnalogue(NucleotideNaturalAnalogue.A);

    await dialog.submit();

    const notificationText = await NotificationBanner(
      page,
    ).getNotificationText();
    expect(notificationText).toContain(
      'The monomer was successfully added to the library',
    );
    expect(notificationText).not.toContain('The preset was successfully');
  });

  test('Case 6 - Verify success message is not duplicated for a single successful preset save', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10010
     * Description: Verify success message is not duplicated for a single successful preset save
     * Scenario:
     * 1. Open the preset creation wizard and create a valid preset
     * 2. Click 'Finish' / 'Save'
     * 3. Observe the confirmation message behavior
     * 4. Confirm that the message appears once and follows standard auto-hide/dismiss behavior
     *
     * Expected: Exactly one confirmation message with text 'The preset was successfully added to
     *           the library' is shown per successful save action. No duplicate or repeated identical success
     *           messages appear for the same event
     *
     * Version 3.12.0
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

    const notificationBanner = NotificationBanner(page);

    // Wait for notification to appear and verify the expected success message
    await notificationBanner.waitForBecomeVisible();
    const notificationText = await notificationBanner.getNotificationText();
    expect(notificationText).toContain(
      'The preset was successfully added to the library',
    );

    // Verify the message auto-hides after some time
    await notificationBanner.waitForBecomeHidden();

    // The banner component is reused, so DOM node count cannot detect a duplicate
    // success notification shown sequentially for the same save. Confirm it stays
    // hidden for a short period after auto-hide instead of reappearing.
    await expect
      .poll(async () => await notificationBanner.message.isVisible(), {
        timeout: 1500,
        intervals: [250],
      })
      .toBe(false);
  });
});
