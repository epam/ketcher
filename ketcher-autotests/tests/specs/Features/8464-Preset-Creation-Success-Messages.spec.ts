/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-magic-numbers */
import { Page, test, expect } from '@fixtures';
import { pasteFromClipboardAndOpenAsNewProject } from '@utils/files/readFile';
import { shiftCanvas } from '@utils/index';
import { CreateMonomerDialog } from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import {
  NucleotideNaturalAnalogue,
  MonomerType as MonomerTypeInDropdown,
} from '@tests/pages/constants/createMonomerDialog/Constants';
import { NucleotidePresetSection } from '@tests/pages/molecules/canvas/createMonomer/NucleotidePresetSection';
import { NotificationBanner } from '@tests/pages/molecules/canvas/NotificationBanner';

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
  test('Case 7 - Verify success message appears after preset creation in standalone environment', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10010
     * Description: Verify success message appears after preset creation in environments with different UI shells (e.g., standalone vs embedded)
     * Scenario:
     * 1. Run Ketcher in standalone mode (or primary deployment environment)
     * 2. Create a new preset via the wizard and save it; observe the success message
     * 3. Expected: In the supported deployment environment, after successfully saving a preset
     *    the same confirmation text 'The preset was successfully added to the library' is displayed. Message delivery mechanism is consistent across environments
     *
     * Version 3.12.0
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
    const notificationText = await NotificationBanner(
      page,
    ).getNotificationText();
    expect(notificationText).toContain(
      'The preset was successfully added to the library',
    );

    // Verify the notification mechanism works (can be closed/dismissed)
    expect(await NotificationBanner(page).isVisible()).toBeTruthy();
    await NotificationBanner(page).close();
    await NotificationBanner(page).waitForBecomeHidden();
  });
});
