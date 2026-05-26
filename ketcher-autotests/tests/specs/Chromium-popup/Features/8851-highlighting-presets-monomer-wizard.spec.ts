/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-magic-numbers */
import { expect, Page } from '@playwright/test';
import { test } from '@fixtures';
import { pasteFromClipboardAndOpenAsNewProject } from '@utils/files/readFile';
import { shiftCanvas, takeEditorScreenshot } from '@utils/index';
import { CreateMonomerDialog } from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { MonomerType as MonomerTypeInDropdown } from '@tests/pages/constants/createMonomerDialog/Constants';
import { NucleotidePresetSection } from '@tests/pages/molecules/canvas/createMonomer/NucleotidePresetSection';
import { NucleotidePresetTab } from '@tests/pages/molecules/canvas/createMonomer/constants/nucleiotidePresetSection/Constants';

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

test.describe('Highlighting - presets in the monomer creation wizard: ', () => {
  test('Case 1 - Verify the Highlight checkbox is present and ON by default', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10017
     * Description: Verify that the Highlight checkbox is present and enabled by default when creating nucleotide presets
     * Scenario:
     * 1. Open Molecules canvas
     * 2. Load molecule on canvas
     * 3. Press "Create Monomer" button
     * 4. Select "Nucleotide (preset)" type
     * 5. Verify Highlight checkbox is present and checked by default
     *
     * Version 3.12
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    // Verify the highlight checkbox is present and checked by default
    const highlightCheckbox = presetSection.highlightCheckbox;
    await expect(highlightCheckbox).toBeVisible();
    await expect(highlightCheckbox).toBeChecked();

    // Verify the label text is present
    const highlightLabel = highlightCheckbox
      .locator('..')
      .getByText('Highlight');
    await expect(highlightLabel).toBeVisible();

    await dialog.discard();
  });

  test("Case 2 - Verify fluorescent blue outline of the defined component when the active tab is NOT the component's tab", async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10017
     * Description: Verify that defined components show fluorescent blue outline when a different tab is active
     * Scenario:
     * 1. Open Molecules canvas and load molecule
     * 2. Open monomer creation wizard and select Nucleotide (preset)
     * 3. Define a base component by selecting atoms and marking as base
     * 4. Switch to Sugar tab
     * 5. Verify base component shows fluorescent blue outline (inactive highlight color)
     *
     * Version 3.12
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    // Ensure Highlight checkbox is ON
    const highlightCheckbox = presetSection.highlightCheckbox;
    await expect(highlightCheckbox).toBeChecked();

    // Define base component
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
    });

    // Switch to Sugar tab (different from Base tab)
    await presetSection.openTab(NucleotidePresetTab.Sugar);

    // Take screenshot to verify fluorescent blue outline on base component
    // Since base is not the active tab, it should show inactive highlight color (fluorescent blue)
    await takeEditorScreenshot(page);

    await dialog.discard();
  });

  test("Case 3 - Verify pale blue shading of the defined component when the active tab IS the component's tab", async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10017
     * Description: Verify that defined components show pale blue shading when their own tab is active
     * Scenario:
     * 1. Open Molecules canvas and load molecule
     * 2. Open monomer creation wizard and select Nucleotide (preset)
     * 3. Define a base component by selecting atoms and marking as base
     * 4. Ensure Base tab is active
     * 5. Verify base component shows pale blue shading (active highlight color)
     *
     * Version 3.12
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    // Ensure Highlight checkbox is ON
    const highlightCheckbox = presetSection.highlightCheckbox;
    await expect(highlightCheckbox).toBeChecked();

    // Define base component (this automatically switches to Base tab)
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
    });

    // Ensure we're on the Base tab
    await presetSection.openTab(NucleotidePresetTab.Base);

    // Take screenshot to verify pale blue shading on base component
    // Since base tab is active, it should show active highlight color (pale blue)
    await takeEditorScreenshot(page);

    await dialog.discard();
  });

  test('Case 4 - Verify that turning highlight OFF removes all outlines/shading, regardless of tab', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10017
     * Description: Verify that unchecking the Highlight checkbox removes all highlighting regardless of active tab
     * Scenario:
     * 1. Open Molecules canvas and load molecule
     * 2. Open monomer creation wizard and select Nucleotide (preset)
     * 3. Define base and sugar components
     * 4. Verify highlighting is visible when checkbox is ON
     * 5. Turn OFF highlight checkbox
     * 6. Verify all highlighting is removed for both components
     *
     * Version 3.12
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    // Define multiple components
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
    });

    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
    });

    // Ensure Highlight checkbox is ON and take screenshot with highlights
    const highlightCheckbox = presetSection.highlightCheckbox;
    await expect(highlightCheckbox).toBeChecked();

    // Switch to Sugar tab to verify inactive highlighting of base
    await presetSection.openTab(NucleotidePresetTab.Sugar);
    await takeEditorScreenshot(page);

    // Turn OFF highlight checkbox
    await highlightCheckbox.click();
    await expect(highlightCheckbox).not.toBeChecked();

    // Take screenshot to verify all highlights are removed
    await takeEditorScreenshot(page);

    // Switch to Base tab and verify highlights remain off
    await presetSection.openTab(NucleotidePresetTab.Base);
    await takeEditorScreenshot(page);

    await dialog.discard();
  });

  test('Case 5 - Verify no highlight is shown prior to defining a component, even if checkbox is ON', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10017
     * Description: Verify that no highlighting occurs when no components have been defined yet
     * Scenario:
     * 1. Open Molecules canvas and load molecule
     * 2. Open monomer creation wizard and select Nucleotide (preset)
     * 3. Ensure Highlight checkbox is ON
     * 4. Switch between different component tabs without defining any components
     * 5. Verify no highlighting is applied to the structure
     *
     * Version 3.12
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    // Ensure Highlight checkbox is ON
    const highlightCheckbox = presetSection.highlightCheckbox;
    await expect(highlightCheckbox).toBeChecked();

    // Switch to Base tab without defining any component
    await presetSection.openTab(NucleotidePresetTab.Base);
    await takeEditorScreenshot(page);

    // Switch to Sugar tab without defining any component
    await presetSection.openTab(NucleotidePresetTab.Sugar);
    await takeEditorScreenshot(page);

    // Switch to Phosphate tab without defining any component
    await presetSection.openTab(NucleotidePresetTab.Phosphate);
    await takeEditorScreenshot(page);

    // Return to Preset tab
    await presetSection.openTab(NucleotidePresetTab.Preset);
    await takeEditorScreenshot(page);

    await dialog.discard();
  });

  test('Case 6 - Verify highlighting behavior with multiple defined components across different tabs', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10017
     * Description: Verify highlighting behavior when multiple components are defined and switching between tabs
     * Scenario:
     * 1. Open Molecules canvas and load molecule
     * 2. Define all three components (base, sugar, phosphate)
     * 3. Switch between tabs and verify active vs inactive highlighting
     * 4. Toggle highlight checkbox and verify behavior
     *
     * Version 3.12
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    // Define all three components
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
    });

    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
    });

    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
    });

    // Test highlighting on different tabs
    await presetSection.openTab(NucleotidePresetTab.Base);
    await takeEditorScreenshot(page);

    await presetSection.openTab(NucleotidePresetTab.Sugar);
    await takeEditorScreenshot(page);

    await presetSection.openTab(NucleotidePresetTab.Phosphate);
    await takeEditorScreenshot(page);

    // Turn off highlighting
    await presetSection.setHighlight(false);
    await expect(presetSection.highlightCheckbox).not.toBeChecked();

    // Verify no highlights across different tabs
    await presetSection.openTab(NucleotidePresetTab.Base);
    await takeEditorScreenshot(page);

    await presetSection.openTab(NucleotidePresetTab.Sugar);
    await takeEditorScreenshot(page);

    // Turn highlighting back on
    await presetSection.setHighlight(true);
    await expect(presetSection.highlightCheckbox).toBeChecked();

    // Verify highlights return
    await takeEditorScreenshot(page);

    await dialog.discard();
  });
});
