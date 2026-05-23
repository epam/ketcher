/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Page, test, expect } from '@fixtures';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import {
  CreateMonomerDialog,
  selectAtomAndBonds,
} from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import {
  MonomerType as MonomerTypeInDropdown,
  NucleotideNaturalAnalogue,
} from '@tests/pages/constants/createMonomerDialog/Constants';
import { NucleotidePresetSection } from '@tests/pages/molecules/canvas/createMonomer/NucleotidePresetSection';
import { NucleotidePresetTab } from '@tests/pages/molecules/canvas/createMonomer/constants/nucleiotidePresetSection/Constants';
import { NotificationMessageBanner } from '@tests/pages/molecules/canvas/createMonomer/NotificationMessageBanner';
import { ErrorMessage } from '@tests/pages/constants/notificationMessageBanner/Constants';
import { pasteFromClipboardAndOpenAsNewProject } from '@utils/files/readFile';
import { shiftCanvas, takeElementScreenshot } from '@utils/index';

let page: Page;
let dialog: ReturnType<typeof CreateMonomerDialog>;
let presetSection: ReturnType<typeof NucleotidePresetSection>;

test.describe('Autotests: Highlighting - presets in the monomer creation wizard', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
    dialog = CreateMonomerDialog(page);
    presetSection = NucleotidePresetSection(page);
  });

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test.afterEach(async ({ MoleculesCanvas: _ }) => {});

  test('Case 1 - Verify that Base/Sugar/Phosphate component sections appear only when Nucleotide (preset) type is selected', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10007
     * Description: Verify that Base/Sugar/Phosphate component sections appear only when Nucleotide (preset) type is selected
     * Scenario:
     * 1. Open Monomer Creation Wizard
     * 2. Select a non-preset type (e.g., Small molecule)
     * 3. Observe component panel
     * 4. Switch type to 'Nucleotide (preset)'
     * 5. Observe component panel again
     * Expected: Component sections (Base, Sugar, Phosphate) are hidden for non‑preset types and appear only when 'Nucleotide (preset)' is selected
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);

    // Select non-preset type
    await dialog.selectType(MonomerTypeInDropdown.CHEM);

    // Verify component sections are not visible for non-preset type
    await expect(page.getByTestId(NucleotidePresetTab.Base)).not.toBeVisible();
    await expect(page.getByTestId(NucleotidePresetTab.Sugar)).not.toBeVisible();
    await expect(page.getByTestId(NucleotidePresetTab.Phosphate)).not.toBeVisible();

    // Switch to Nucleotide (preset) type
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    // Verify component sections appear for preset type
    await expect(page.getByTestId(NucleotidePresetTab.Base)).toBeVisible();
    await expect(page.getByTestId(NucleotidePresetTab.Sugar)).toBeVisible();
    await expect(page.getByTestId(NucleotidePresetTab.Phosphate)).toBeVisible();

    await dialog.discard();
  });

  test('Case 2 - Verify placeholder text and empty state for an unassigned component', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10007
     * Description: Verify placeholder text and empty state for an unassigned component
     * Scenario:
     * 1. Select 'Nucleotide (preset)'
     * 2. Open any component section (Base/Sugar/Phosphate)
     * 3. Do not assign a structure
     * 4. Observe UI inside the section
     * Expected: Component section shows placeholder/empty-state message prompting the user to select a structure fragment
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    // Check Base tab empty state
    await presetSection.openTab(NucleotidePresetTab.Base);
    const baseMarkButton = presetSection.baseTab.maskAsBaseButton;
    await expect(baseMarkButton).toBeVisible();
    await expect(baseMarkButton).toContainText('Mark as base');

    // Check Sugar tab empty state
    await presetSection.openTab(NucleotidePresetTab.Sugar);
    const sugarMarkButton = presetSection.sugarTab.maskAsSugarButton;
    await expect(sugarMarkButton).toBeVisible();
    await expect(sugarMarkButton).toContainText('Mark as sugar');

    // Check Phosphate tab empty state
    await presetSection.openTab(NucleotidePresetTab.Phosphate);
    const phosphateMarkButton = presetSection.phosphateTab.maskAsPhosphateButton;
    await expect(phosphateMarkButton).toBeVisible();
    await expect(phosphateMarkButton).toContainText('Mark as phosphate');

    await dialog.discard();
  });

  test('Case 3 - Verify component section turns populated after marking fragment as Base', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10007
     * Description: Verify component section turns populated after marking fragment as Base
     * Scenario:
     * 1. Select 'Nucleotide (preset)'
     * 2. Select continuous fragment for Base
     * 3. Use 'Mark as a... > Base'
     * 4. Open Base section
     * Expected: Base section displays assigned structure preview and relevant attributes
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    // Setup Base component
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      code: 'TestBase',
      name: 'Test Base',
      naturalAnalogue: NucleotideNaturalAnalogue.A,
    });

    // Verify Base section is populated
    await presetSection.openTab(NucleotidePresetTab.Base);
    await expect(presetSection.baseTab.codeEditbox).toHaveValue('TestBase');
    await expect(presetSection.baseTab.nameEditbox).toHaveValue('Test Base');

    await dialog.discard();
  });

  test('Case 4 - Verify Sugar section becomes populated after marking fragment as Sugar', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10007
     * Description: Verify Sugar section becomes populated after marking fragment as Sugar
     * Scenario:
     * 1. Select 'Nucleotide (preset)'
     * 2. Select continuous fragment for Sugar
     * 3. Use 'Mark as a... > Sugar'
     * 4. Open Sugar section
     * Expected: Sugar section contains the assigned Sugar structure
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    // Setup Sugar component
    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      code: 'TestSugar',
      name: 'Test Sugar',
    });

    // Verify Sugar section is populated
    await presetSection.openTab(NucleotidePresetTab.Sugar);
    await expect(presetSection.sugarTab.codeEditbox).toHaveValue('TestSugar');
    await expect(presetSection.sugarTab.nameEditbox).toHaveValue('Test Sugar');

    await dialog.discard();
  });

  test('Case 5 - Verify Phosphate section becomes populated after marking fragment as Phosphate', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10007
     * Description: Verify Phosphate section becomes populated after marking fragment as Phosphate
     * Scenario:
     * 1. Select 'Nucleotide (preset)'
     * 2. Select continuous fragment for Phosphate
     * 3. Use 'Mark as a... > Phosphate'
     * 4. Open Phosphate section
     * Expected: Phosphate section contains the assigned Phosphate structure
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    // Setup Phosphate component
    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
      code: 'TestPhosphate',
      name: 'Test Phosphate',
    });

    // Verify Phosphate section is populated
    await presetSection.openTab(NucleotidePresetTab.Phosphate);
    await expect(presetSection.phosphateTab.codeEditbox).toHaveValue('TestPhosphate');
    await expect(presetSection.phosphateTab.nameEditbox).toHaveValue('Test Phosphate');

    await dialog.discard();
  });

  test('Case 6 - Verify ability to reassign component: marking new fragment replaces previous Base', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10007
     * Description: Verify ability to reassign component: marking new fragment replaces previous Base
     * Scenario:
     * 1. Assign Base structure using 'Mark as a... > Base'
     * 2. Select another fragment
     * 3. Mark as 'Base' again
     * 4. Inspect Base panel
     * Expected: Previous Base structure is removed and replaced with the newly assigned one
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCCCC');
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    // Setup first Base component
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      code: 'FirstBase',
      name: 'First Base',
    });

    // Verify first assignment
    await presetSection.openTab(NucleotidePresetTab.Base);
    await expect(presetSection.baseTab.codeEditbox).toHaveValue('FirstBase');

    // Setup second Base component (different atoms)
    await presetSection.setupBase({
      atomIds: [2, 3],
      bondIds: [2],
      code: 'SecondBase',
      name: 'Second Base',
    });

    // Verify replacement
    await presetSection.openTab(NucleotidePresetTab.Base);
    await expect(presetSection.baseTab.codeEditbox).toHaveValue('SecondBase');
    await expect(presetSection.baseTab.nameEditbox).toHaveValue('Second Base');

    await dialog.discard();
  });

  test('Case 7 - Verify components do not overwrite each other (Sugar does not replace Base, etc.)', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10007
     * Description: Verify components do not overwrite each other (Sugar does not replace Base, etc.)
     * Scenario:
     * 1. Assign Base
     * 2. Assign Sugar
     * 3. Assign Phosphate
     * 4. Open each component section
     * Expected: Each component section retains its own assigned structure without overwriting others
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCCCCCC');
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    // Assign all three components
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      code: 'UniqueBase',
      name: 'Unique Base',
    });

    await presetSection.setupSugar({
      atomIds: [2, 3, 4],
      bondIds: [2, 3],
      code: 'UniqueSugar',
      name: 'Unique Sugar',
    });

    await presetSection.setupPhosphate({
      atomIds: [5, 6],
      bondIds: [5],
      code: 'UniquePhosphate',
      name: 'Unique Phosphate',
    });

    // Verify each component section retains its values
    await presetSection.openTab(NucleotidePresetTab.Base);
    await expect(presetSection.baseTab.codeEditbox).toHaveValue('UniqueBase');
    await expect(presetSection.baseTab.nameEditbox).toHaveValue('Unique Base');

    await presetSection.openTab(NucleotidePresetTab.Sugar);
    await expect(presetSection.sugarTab.codeEditbox).toHaveValue('UniqueSugar');
    await expect(presetSection.sugarTab.nameEditbox).toHaveValue('Unique Sugar');

    await presetSection.openTab(NucleotidePresetTab.Phosphate);
    await expect(presetSection.phosphateTab.codeEditbox).toHaveValue('UniquePhosphate');
    await expect(presetSection.phosphateTab.nameEditbox).toHaveValue('Unique Phosphate');

    await dialog.discard();
  });

  test('Case 8 - Verify error message when user attempts to continue without assigning required components', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10007
     * Description: Verify error message when user attempts to continue without assigning required components
     * Scenario:
     * 1. Select 'Nucleotide (preset)'
     * 2. Do not assign any components
     * 3. Click 'Next' or 'Finish'
     * 4. Observe validation behavior
     * Expected: Wizard displays validation error indicating that components must be assigned before continuing
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    // Set only preset name without assigning components
    await presetSection.setName('IncompletePreset');

    // Try to submit without components
    await dialog.submit();

    // Verify validation error appears
    const errorBanner = NotificationMessageBanner(page, ErrorMessage.componentNotProvided);
    expect(await errorBanner.isVisible()).toBeTruthy();

    await dialog.discard();
  });

  test('Case 9 - Verify success path: all three components assigned allows proceeding', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10007
     * Description: Verify success path: all three components assigned allows proceeding
     * Scenario:
     * 1. Assign Base, Sugar, and Phosphate structures
     * 2. Click 'Next' or 'Finish'
     * Expected: Wizard proceeds to the next step successfully without validation errors
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCCCC');
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    // Set preset name
    await presetSection.setName('CompletePreset');

    // Assign all required components
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      code: 'CompleteBase',
      name: 'Complete Base',
      naturalAnalogue: NucleotideNaturalAnalogue.A,
    });

    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      code: 'CompleteSugar',
      name: 'Complete Sugar',
    });

    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
      code: 'CompletePhosphate',
      name: 'Complete Phosphate',
    });

    // Submit should succeed without validation errors
    await dialog.submit();

    // Verify wizard closes (dialog is no longer visible)
    await expect(dialog.window).not.toBeVisible();
  });

  test('Case 10 - Verify removing assigned component restores empty-state display', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10007
     * Description: Verify removing assigned component restores empty-state display
     * Scenario:
     * 1. Assign Base component
     * 2. Click remove/delete icon in Base section
     * 3. Observe Base panel
     * Expected: Assigned structure is cleared; Base section shows placeholder/empty-state text again
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    // Assign Base component
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      code: 'RemovableBase',
      name: 'Removable Base',
    });

    // Verify assignment
    await presetSection.openTab(NucleotidePresetTab.Base);
    await expect(presetSection.baseTab.codeEditbox).toHaveValue('RemovableBase');

    // Clear the component by selecting different atoms and marking as Base again with empty values
    await selectAtomAndBonds(page, { atomIds: [], bondIds: [] });
    await presetSection.openTab(NucleotidePresetTab.Base);
    await presetSection.baseTab.codeEditbox.fill('');
    await presetSection.baseTab.nameEditbox.fill('');

    // Verify empty state is restored
    await expect(presetSection.baseTab.maskAsBaseButton).toBeVisible();

    await dialog.discard();
  });

  test('Case 11 - Verify switching monomer type after components are assigned resets component panel', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10007
     * Description: Verify switching monomer type after components are assigned resets component panel
     * Scenario:
     * 1. Select 'Nucleotide (preset)'
     * 2. Assign Base/Sugar/Phosphate
     * 3. Change monomer type to a non‑preset type
     * 4. Observe UI
     * 5. Change back to 'Nucleotide (preset)'
     * Expected: All component sections disappear after type change; switching back shows empty state with no component assignments preserved
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCCCC');
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    // Assign all components
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      code: 'ResetBase',
      name: 'Reset Base',
    });

    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      code: 'ResetSugar',
      name: 'Reset Sugar',
    });

    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
      code: 'ResetPhosphate',
      name: 'Reset Phosphate',
    });

    // Switch to non-preset type
    await dialog.selectType(MonomerTypeInDropdown.CHEM);

    // Verify component sections are hidden
    await expect(page.getByTestId(NucleotidePresetTab.Base)).not.toBeVisible();
    await expect(page.getByTestId(NucleotidePresetTab.Sugar)).not.toBeVisible();
    await expect(page.getByTestId(NucleotidePresetTab.Phosphate)).not.toBeVisible();

    // Switch back to preset type
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    // Verify component sections are visible but empty
    await expect(page.getByTestId(NucleotidePresetTab.Base)).toBeVisible();
    await expect(page.getByTestId(NucleotidePresetTab.Sugar)).toBeVisible();
    await expect(page.getByTestId(NucleotidePresetTab.Phosphate)).toBeVisible();

    // Verify empty states are restored
    await presetSection.openTab(NucleotidePresetTab.Base);
    await expect(presetSection.baseTab.maskAsBaseButton).toBeVisible();

    await presetSection.openTab(NucleotidePresetTab.Sugar);
    await expect(presetSection.sugarTab.maskAsSugarButton).toBeVisible();

    await presetSection.openTab(NucleotidePresetTab.Phosphate);
    await expect(presetSection.phosphateTab.maskAsPhosphateButton).toBeVisible();

    await dialog.discard();
  });

  test('Case 12 - Verify the component panel scroll/resize behavior when large structures are assigned', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10007
     * Description: Verify the component panel scroll/resize behavior when large structures are assigned
     * Scenario:
     * 1. Select 'Nucleotide (preset)'
     * 2. Assign a visually large structure to any component
     * 3. Observe component panel layout and scrolling
     * Expected: Panel maintains correct layout: assigned component preview remains visible and UI does not break
     *
     * Version 3.12.0
     */
    // Create a larger structure for testing
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCCCCCCCCCCCCCCCC');
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    // Assign a large structure to Base component
    await presetSection.setupBase({
      atomIds: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      bondIds: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      code: 'LargeBase',
      name: 'Large Base Structure for Layout Testing',
    });

    // Verify the component is assigned and UI remains functional
    await presetSection.openTab(NucleotidePresetTab.Base);
    await expect(presetSection.baseTab.codeEditbox).toHaveValue('LargeBase');
    await expect(presetSection.baseTab.nameEditbox).toHaveValue('Large Base Structure for Layout Testing');

    // Take a screenshot to verify layout integrity
    await takeElementScreenshot(page, dialog.window);

    // Verify other tabs are still accessible
    await presetSection.openTab(NucleotidePresetTab.Sugar);
    await expect(presetSection.sugarTab.maskAsSugarButton).toBeVisible();

    await presetSection.openTab(NucleotidePresetTab.Phosphate);
    await expect(presetSection.phosphateTab.maskAsPhosphateButton).toBeVisible();

    await dialog.discard();
  });
});