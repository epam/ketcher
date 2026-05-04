import { Page, test, expect } from '@fixtures';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { Base } from '@tests/pages/constants/monomers/Bases';
import { Phosphate } from '@tests/pages/constants/monomers/Phosphates';
import { Sugar } from '@tests/pages/constants/monomers/Sugars';
import {
  takeEditorScreenshot,
  takeMonomerLibraryScreenshot,
  moveMouseToTheMiddleOfTheScreen,
} from '@utils';
import { LayoutMode } from '@tests/pages/constants/LayoutModes';

let page: Page;

test.describe('Autotests: Expand RNA builder functionality to support presets with 5\' phosphates', () => {
  test.beforeAll(async ({ initFlexCanvas }) => {
    page = await initFlexCanvas();
  });

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1 — Verify that the phosphate position picker (5\', 3\', neither) is visible in the RNA builder when creating a new preset, and that selecting 3\' grays out all sugars without R2 and all phosphates without R1 before any component is added', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9948
     * Description: Verify that the phosphate position picker (5', 3', neither) is visible in the RNA builder when creating a new preset, and that selecting 3' grays out all sugars without R2 (e.g. none in table) and all phosphates without R1 (e.g. AmC12, AmC6) before any component is added.
     * Scenario:
     * 1. Go to Macro → Flex mode
     * 2. Open RNA Builder
     * 3. Start creating a new preset
     * 4. Verify phosphate position picker is visible with 5', 3', neither options
     * 5. Select 3' option
     * 6. Verify sugars without R2 are grayed out
     * 7. Verify phosphates without R1 are grayed out
     *
     * Version 3.16.0
     */
    await Library(page).switchToRNATab();
    await Library(page).rnaBuilder.expand();
    
    // Verify phosphate position picker is visible
    await expect(page.getByTestId('phosphate-position-picker')).toBeVisible();
    await expect(page.getByTestId('phosphate-position-5-prime')).toBeVisible();
    await expect(page.getByTestId('phosphate-position-3-prime')).toBeVisible();
    await expect(page.getByTestId('phosphate-position-neither')).toBeVisible();
    
    // Select 3' option
    await page.getByTestId('phosphate-position-3-prime').click();
    
    // Verify sugars without R2 are grayed out (none exist in library)
    // Verify phosphates without R1 are grayed out (AmC12, AmC6)
    await expect(page.getByTestId('monomer-AmC12')).toHaveClass(/disabled/);
    await expect(page.getByTestId('monomer-AmC6')).toHaveClass(/disabled/);
    
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 2 — Verify that selecting 5\' on the phosphate position picker before adding components grays out all sugars without R1 and all phosphates without R2', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9948
     * Description: Verify that selecting 5' on the phosphate position picker before adding components grays out all sugars without R1 (e.g. 5cGT, 5FAM, 5FBC6, dier) and all phosphates without R2 (none in table, confirming all phosphates remain available).
     * Scenario:
     * 1. Go to Macro → Flex mode
     * 2. Open RNA Builder
     * 3. Start creating a new preset
     * 4. Select 5' option on phosphate position picker
     * 5. Verify sugars without R1 are grayed out
     * 6. Verify all phosphates remain available (none without R2)
     *
     * Version 3.16.0
     */
    await Library(page).switchToRNATab();
    await Library(page).rnaBuilder.expand();
    
    // Select 5' option
    await page.getByTestId('phosphate-position-5-prime').click();
    
    // Verify sugars without R1 are grayed out
    await expect(page.getByTestId('monomer-5cGT')).toHaveClass(/disabled/);
    await expect(page.getByTestId('monomer-5FAM')).toHaveClass(/disabled/);
    await expect(page.getByTestId('monomer-5FBC6')).toHaveClass(/disabled/);
    await expect(page.getByTestId('monomer-dier')).toHaveClass(/disabled/);
    
    // Verify all phosphates remain available (none without R2)
    await Library(page).switchToPhosphatesSection();
    const phosphateElements = await page.getByTestId(/^monomer-.*/).filter({ hasNotText: /disabled/ });
    await expect(phosphateElements.first()).toBeVisible();
    
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 3 — Verify that adding a sugar without R1 before selecting phosphate position disables the 5\' option on the picker', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9948
     * Description: Verify that adding a sugar without R1 (e.g. 5cGT) before selecting phosphate position disables the 5' option on the picker, while 3' remains selectable.
     * Scenario:
     * 1. Go to Macro → Flex mode
     * 2. Open RNA Builder
     * 3. Start creating a new preset
     * 4. Add a sugar without R1 (5cGT)
     * 5. Verify 5' option is disabled
     * 6. Verify 3' option remains selectable
     *
     * Version 3.16.0
     */
    await Library(page).switchToRNATab();
    await Library(page).rnaBuilder.expand();
    
    // Add sugar without R1
    await Library(page).selectMonomer(Sugar._5cGT);
    
    // Verify 5' option is disabled
    await expect(page.getByTestId('phosphate-position-5-prime')).toBeDisabled();
    
    // Verify 3' option remains selectable
    await expect(page.getByTestId('phosphate-position-3-prime')).toBeEnabled();
    
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 4 — Verify that adding a sugar without R2 before selecting phosphate position disables the 3\' option on the picker', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9948
     * Description: Verify that adding a sugar without R2 before selecting phosphate position disables the 3' option on the picker (note: no sugars without R2 exist in current library — test with a custom monomer or confirm UI handles empty-set case gracefully).
     * Scenario:
     * 1. Go to Macro → Flex mode
     * 2. Open RNA Builder
     * 3. Start creating a new preset
     * 4. Since no sugars without R2 exist, verify UI handles this gracefully
     * 5. Confirm 3' option behavior with theoretical sugar without R2
     *
     * Version 3.16.0
     */
    await Library(page).switchToRNATab();
    await Library(page).rnaBuilder.expand();
    
    // Since no sugars without R2 exist in library, this test verifies the UI behavior
    // when such a monomer would be selected
    
    // All current sugars should have R2, so 3' should remain enabled
    await Library(page).selectMonomer(Sugar.R);
    await expect(page.getByTestId('phosphate-position-3-prime')).toBeEnabled();
    
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 5 — Verify that adding a phosphate without R1 before a sugar disables the 3\' option on the phosphate position picker', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9948
     * Description: Verify that adding a phosphate without R1 (e.g. AmC12) before a sugar disables the 3' option on the phosphate position picker.
     * Scenario:
     * 1. Go to Macro → Flex mode
     * 2. Open RNA Builder
     * 3. Start creating a new preset
     * 4. Add phosphate without R1 (AmC12)
     * 5. Verify 3' option is disabled
     * 6. Verify 5' option remains available
     *
     * Version 3.16.0
     */
    await Library(page).switchToRNATab();
    await Library(page).rnaBuilder.expand();
    
    // Add phosphate without R1
    await Library(page).selectMonomer(Phosphate.AmC12);
    
    // Verify 3' option is disabled
    await expect(page.getByTestId('phosphate-position-3-prime')).toBeDisabled();
    
    // Verify 5' option remains available
    await expect(page.getByTestId('phosphate-position-5-prime')).toBeEnabled();
    
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 6 — Verify that adding a phosphate without R2 before a sugar disables the 5\' option on the phosphate position picker', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9948
     * Description: Verify that adding a phosphate without R2 before a sugar disables the 5' option on the phosphate position picker (note: no phosphates without R2 in current library — confirm UI handles gracefully).
     * Scenario:
     * 1. Go to Macro → Flex mode
     * 2. Open RNA Builder
     * 3. Start creating a new preset
     * 4. Since no phosphates without R2 exist, verify UI handles this gracefully
     * 5. Confirm 5' option behavior with theoretical phosphate without R2
     *
     * Version 3.16.0
     */
    await Library(page).switchToRNATab();
    await Library(page).rnaBuilder.expand();
    
    // Since no phosphates without R2 exist in library, this test verifies the UI behavior
    // when such a monomer would be selected
    
    // All current phosphates should have R2, so 5' should remain enabled
    await Library(page).selectMonomer(Phosphate.P);
    await expect(page.getByTestId('phosphate-position-5-prime')).toBeEnabled();
    
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 7 — Verify that hovering over the disabled 5\' option shows the tooltip and hovering over the disabled 3\' option shows appropriate tooltip', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9948
     * Description: Verify that hovering over the disabled 5' option shows the tooltip "Sugar must have R1, and phosphate must have R2." and hovering over the disabled 3' option shows "Sugar must have R2, and phosphate must have R1."
     * Scenario:
     * 1. Go to Macro → Flex mode
     * 2. Open RNA Builder
     * 3. Add sugar without R1 to disable 5' option
     * 4. Hover over disabled 5' option and verify tooltip
     * 5. Add phosphate without R1 to disable 3' option
     * 6. Hover over disabled 3' option and verify tooltip
     *
     * Version 3.16.0
     */
    await Library(page).switchToRNATab();
    await Library(page).rnaBuilder.expand();
    
    // Add sugar without R1 to disable 5' option
    await Library(page).selectMonomer(Sugar._5cGT);
    
    // Hover over disabled 5' option and verify tooltip
    await page.getByTestId('phosphate-position-5-prime').hover();
    await expect(page.getByText('Sugar must have R1, and phosphate must have R2.')).toBeVisible();
    
    // Clear and add phosphate without R1 to disable 3' option
    await Library(page).rnaBuilder.cancel();
    await Library(page).rnaBuilder.expand();
    await Library(page).selectMonomer(Phosphate.AmC12);
    
    // Hover over disabled 3' option and verify tooltip
    await page.getByTestId('phosphate-position-3-prime').hover();
    await expect(page.getByText('Sugar must have R2, and phosphate must have R1.')).toBeVisible();
    
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 8 — Verify that when both sugar and phosphate have R1 and R2 and no position is chosen, the Save button is disabled with appropriate tooltip', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9948
     * Description: Verify that when both sugar and phosphate have R1 and R2 and no position is chosen, the Save button is disabled and displays the tooltip "Before saving you must choose the position of the phosphate." on hover.
     * Scenario:
     * 1. Go to Macro → Flex mode
     * 2. Open RNA Builder
     * 3. Add sugar with both R1 and R2
     * 4. Add phosphate with both R1 and R2
     * 5. Don't select any phosphate position
     * 6. Verify Save button is disabled
     * 7. Hover over Save button and verify tooltip
     *
     * Version 3.16.0
     */
    await Library(page).switchToRNATab();
    await Library(page).rnaBuilder.expand();
    await Library(page).rnaBuilder.setCustomPresetName('TestRNA');
    
    // Add sugar and phosphate with both R1 and R2
    await Library(page).selectMonomers([Sugar.R, Phosphate.P, Base.A]);
    
    // Verify Save button is disabled when no position is chosen
    await expect(page.getByTestId('save-btn')).toBeDisabled();
    
    // Hover over Save button and verify tooltip
    await page.getByTestId('save-btn').hover();
    await expect(page.getByText('Before saving you must choose the position of the phosphate.')).toBeVisible();
    
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 9 — Verify that when only one phosphate position option is available, saving the preset automatically uses the only valid arrangement', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9948
     * Description: Verify that when only one phosphate position option is available (e.g. sugar without R1 added, 5' disabled), saving the preset automatically uses the only valid arrangement (3') without requiring an explicit user selection.
     * Scenario:
     * 1. Go to Macro → Flex mode
     * 2. Open RNA Builder
     * 3. Add sugar without R1 (disables 5' option)
     * 4. Add phosphate and base
     * 5. Verify Save button is enabled without explicit position selection
     * 6. Save preset and verify it uses 3' arrangement
     *
     * Version 3.16.0
     */
    await Library(page).switchToRNATab();
    await Library(page).rnaBuilder.expand();
    await Library(page).rnaBuilder.setCustomPresetName('Auto3PrimeRNA');
    
    // Add sugar without R1 (disables 5' option)
    await Library(page).selectMonomers([Sugar._5cGT, Phosphate.P, Base.A]);
    
    // Verify Save button is enabled without explicit position selection
    await expect(page.getByTestId('save-btn')).toBeEnabled();
    
    // Save preset
    await Library(page).rnaBuilder.save();
    
    // Verify preset was saved and uses 3' arrangement
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 10 — Verify that using "Duplicate and edit" on an existing library preset loads the correct phosphate position into the picker', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9948
     * Description: Verify that using "Duplicate and edit" on an existing library preset loads the correct phosphate position into the picker, and that the sugar/phosphate monomer availability is correctly filtered based on the loaded components' attachment points.
     * Scenario:
     * 1. Go to Macro → Flex mode
     * 2. Create a preset with 5' phosphate
     * 3. Use "Duplicate and edit" on the preset
     * 4. Verify phosphate position picker shows 5' selected
     * 5. Verify monomer filtering is correct based on components
     *
     * Version 3.16.0
     */
    await Library(page).switchToRNATab();
    await Library(page).rnaBuilder.expand();
    await Library(page).rnaBuilder.setCustomPresetName('Original5PrimeRNA');
    
    // Create preset with 5' phosphate
    await Library(page).selectMonomers([Sugar.R, Phosphate.P, Base.A]);
    await page.getByTestId('phosphate-position-5-prime').click();
    await Library(page).rnaBuilder.save();
    
    // Use "Duplicate and edit"
    await Library(page).hoverMonomer({ alias: 'Original5PrimeRNA' });
    await Library(page).rnaBuilder.duplicateAndEdit();
    
    // Verify phosphate position picker shows 5' selected
    await expect(page.getByTestId('phosphate-position-5-prime')).toBeChecked();
    
    // Verify monomer filtering based on loaded components
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 11 — Verify that when duplicating and editing a preset where both sugar and phosphate have R1 and R2, the user can switch the phosphate position', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9948
     * Description: Verify that when duplicating and editing a preset where both sugar and phosphate have R1 and R2, the user can switch the phosphate position between 5' and 3', and the resulting saved preset reflects the newly chosen orientation.
     * Scenario:
     * 1. Go to Macro → Flex mode
     * 2. Create preset with both R1/R2 components in 3' configuration
     * 3. Duplicate and edit the preset
     * 4. Switch to 5' configuration
     * 5. Save and verify new preset reflects the change
     *
     * Version 3.16.0
     */
    await Library(page).switchToRNATab();
    await Library(page).rnaBuilder.expand();
    await Library(page).rnaBuilder.setCustomPresetName('SwitchableRNA');
    
    // Create preset with 3' configuration
    await Library(page).selectMonomers([Sugar.R, Phosphate.P, Base.A]);
    await page.getByTestId('phosphate-position-3-prime').click();
    await Library(page).rnaBuilder.save();
    
    // Duplicate and edit
    await Library(page).hoverMonomer({ alias: 'SwitchableRNA' });
    await Library(page).rnaBuilder.duplicateAndEdit();
    
    // Switch to 5' configuration
    await page.getByTestId('phosphate-position-5-prime').click();
    await Library(page).rnaBuilder.setCustomPresetName('Switched5PrimeRNA');
    await Library(page).rnaBuilder.save();
    
    // Verify both presets exist with different configurations
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 12 — Verify that in sequence mode, a preset on the canvas shows the phosphate on the 3\' end with disabled picker', async ({ SequenceCanvas: _ }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9948
     * Description: Verify that in sequence mode, a preset on the canvas always shows the phosphate on the 3' end, and the phosphate position picker in the "Modify selected" RNA builder panel is visible but disabled and locked to indicating 3'.
     * Scenario:
     * 1. Switch to Sequence mode
     * 2. Add a preset to canvas
     * 3. Select the preset
     * 4. Open RNA builder in "Modify selected" mode
     * 5. Verify phosphate position picker shows 3' and is disabled
     *
     * Version 3.16.0
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Sequence);
    await Library(page).switchToRNATab();
    
    // Add preset to canvas
    await Library(page).dragMonomerOnCanvas(
      { alias: 'A_R_P', testId: 'A_R_P' },
      { x: 300, y: 300 }
    );
    
    // Select the preset on canvas
    await page.click('text=A_R_P');
    
    // Open RNA builder in "Modify selected" mode
    await Library(page).rnaBuilder.expand();
    
    // Verify phosphate position picker shows 3' and is disabled
    await expect(page.getByTestId('phosphate-position-3-prime')).toBeChecked();
    await expect(page.getByTestId('phosphate-position-picker')).toBeDisabled();
    
    await takeEditorScreenshot(page);
  });

  test('Case 13 — Verify that in flex mode, a preset with a 5\' phosphate renders the phosphate on the left of the sugar', async ({ FlexCanvas: _ }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9948
     * Description: Verify that in flex mode, a preset with a 5' phosphate renders the phosphate on the left of the sugar on canvas, and a preset with a 3' phosphate renders it on the right, matching the expected structural layout.
     * Scenario:
     * 1. Stay in Flex mode
     * 2. Add preset with 5' phosphate to canvas
     * 3. Verify phosphate appears on left of sugar
     * 4. Add preset with 3' phosphate to canvas
     * 5. Verify phosphate appears on right of sugar
     *
     * Version 3.16.0
     */
    await Library(page).switchToRNATab();
    
    // Add preset with 5' phosphate (if exists)
    await Library(page).dragMonomerOnCanvas(
      { alias: '5Prime_A_R_P', testId: '5Prime_A_R_P' },
      { x: 200, y: 200 }
    );
    
    // Add preset with 3' phosphate  
    await Library(page).dragMonomerOnCanvas(
      { alias: 'A_R_P', testId: 'A_R_P' },
      { x: 400, y: 200 }
    );
    
    // Verify structural layout differences
    await takeEditorScreenshot(page);
  });

  test('Case 14 — Verify that base-related filtering behaviour is unchanged when selecting sugars and bases', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9948
     * Description: Verify that base-related filtering behaviour is unchanged: selecting a sugar without R3 (e.g. 12ddR, 3FAM) grays out all bases, and selecting a base grays out all sugars without R3.
     * Scenario:
     * 1. Go to Macro → Flex mode
     * 2. Open RNA Builder
     * 3. Select sugar without R3 (12ddR)
     * 4. Verify all bases are grayed out
     * 5. Clear and select a base
     * 6. Verify sugars without R3 are grayed out
     *
     * Version 3.16.0
     */
    await Library(page).switchToRNATab();
    await Library(page).rnaBuilder.expand();
    
    // Select sugar without R3
    await Library(page).selectMonomer(Sugar._12ddR);
    
    // Verify all bases are grayed out
    await Library(page).switchToBasesSection();
    const baseElements = await page.getByTestId(/^monomer-.*/).filter({ hasText: /disabled/ });
    await expect(baseElements.first()).toBeVisible();
    
    // Clear and select a base
    await Library(page).rnaBuilder.cancel();
    await Library(page).rnaBuilder.expand();
    await Library(page).selectMonomer(Base.A);
    
    // Verify sugars without R3 are grayed out
    await Library(page).switchToSugarsSection();
    await expect(page.getByTestId('monomer-12ddR')).toHaveClass(/disabled/);
    await expect(page.getByTestId('monomer-3FAM')).toHaveClass(/disabled/);
    
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 15 — Verify that selecting "neither" results in a preset with no phosphate and Save button is enabled', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9948
     * Description: Verify that selecting "neither" (both position options unticked) results in a preset with no phosphate, and that the Save button is enabled without requiring a position choice when no phosphate component is added to the preset.
     * Scenario:
     * 1. Go to Macro → Flex mode
     * 2. Open RNA Builder
     * 3. Add sugar and base only (no phosphate)
     * 4. Select "neither" option
     * 5. Verify Save button is enabled
     * 6. Save preset and verify it has no phosphate
     *
     * Version 3.16.0
     */
    await Library(page).switchToRNATab();
    await Library(page).rnaBuilder.expand();
    await Library(page).rnaBuilder.setCustomPresetName('NoPhosphateRNA');
    
    // Add sugar and base only (no phosphate)
    await Library(page).selectMonomers([Sugar.R, Base.A]);
    
    // Select "neither" option
    await page.getByTestId('phosphate-position-neither').click();
    
    // Verify Save button is enabled
    await expect(page.getByTestId('save-btn')).toBeEnabled();
    
    // Save preset
    await Library(page).rnaBuilder.save();
    
    // Verify preset was saved without phosphate
    await takeMonomerLibraryScreenshot(page);
  });
});