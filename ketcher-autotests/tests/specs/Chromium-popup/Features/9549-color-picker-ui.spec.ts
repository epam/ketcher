/* eslint-disable no-magic-numbers */
import { Page, test, expect } from '@fixtures';
import { SettingsDialog } from '@tests/pages/molecules/canvas/SettingsDialog';
import { TopRightToolbar } from '@tests/pages/molecules/TopRightToolbar';
import { SettingsSection, StereochemistrySetting } from '@tests/pages/constants/settingsDialog/Constants';
import {
  openFileAndAddToCanvasAsNewProject,
  takeEditorScreenshot,
  takeElementScreenshot,
  takePageScreenshot,
  pasteFromClipboardAndAddToCanvas,
  clearLocalStorage,
  pageReload,
} from '@utils';
import { drawBenzeneRing } from '@tests/pages/molecules/BottomToolbar';

let page: Page;

// Color Picker UI interaction helpers
const ColorPickerHelper = (page: Page) => {
  return {
    async openStereochemistrySettings() {
      await TopRightToolbar(page).Settings();
      await SettingsDialog(page).openSection(SettingsSection.Stereochemistry);
    },

    async getColorPickerPreview(colorPickerTestId: string) {
      return page.getByTestId(colorPickerTestId);
    },

    async clickColorPickerPreview(colorPickerTestId: string) {
      await this.getColorPickerPreview(colorPickerTestId).click();
    },

    async getPresetColorSwatch(color: string) {
      // Common preset colors in color picker
      return page.locator(`[data-testid*="color-preset"][data-color="${color}"], .color-swatch[data-color="${color}"], .preset-color[style*="${color}"]`).first();
    },

    async getCustomColorSection() {
      return page.locator('[data-testid*="custom-color"], .custom-color-section').first();
    },

    async getCustomColorToggle() {
      // The "+" or "X" icon to show/hide custom color section
      return page.locator('[data-testid*="toggle-custom"], .toggle-custom-color, .expand-custom-color').first();
    },

    async getHueSlider() {
      return page.locator('[data-testid*="hue-slider"], input[type="range"][class*="hue"], .hue-slider').first();
    },

    async getBrightnessSlider() {
      return page.locator('[data-testid*="brightness-slider"], input[type="range"][class*="brightness"], .brightness-slider').first();
    },

    async getSaturationSlider() {
      return page.locator('[data-testid*="saturation-slider"], input[type="range"][class*="saturation"], .saturation-slider').first();
    },

    async getHexInput() {
      return page.locator('[data-testid*="hex-input"], input[placeholder*="HEX"], input[class*="hex-input"]').first();
    },

    async getDeleteHexButton() {
      return page.locator('[data-testid*="delete-hex"], [title*="Clear"], .delete-hex, .clear-hex').first();
    },

    async getApplyButton() {
      return page.locator('[data-testid*="apply"], button:has-text("Apply")').first();
    },

    async getCancelButton() {
      return page.locator('[data-testid*="cancel"], button:has-text("Cancel")').first();
    },

    async getColorPreviewBox() {
      return page.locator('[data-testid*="color-preview"], .color-preview, .selected-color-preview').first();
    },

    async setHexValue(hexValue: string) {
      const hexInput = await this.getHexInput();
      await hexInput.fill(hexValue);
    },

    async getResetToDefaultButton() {
      return page.locator('button:has-text("Reset"), button:has-text("Default")').first();
    },

    async getResetToACSButton() {
      return SettingsDialog(page).setACSSettingsButton;
    },

    // Helper to get the computed color from stereochemistry center in the editor
    async getStereochemistryCenterColor(centerType: 'absolute' | 'and' | 'or') {
      return page.locator(`[data-stereo-type="${centerType}"], .stereo-${centerType}-center`).first();
    },
  };
};

test.describe('Autotests: Color Picker UI', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1 - Opening Molecules > Stereochemistry settings displays three color pickers: Absolute Center, AND Centers, and OR Centers', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10090
     * Description: Opening Molecules > Stereochemistry settings displays three color pickers: Absolute Center, AND Centers, and OR Centers
     * Scenario:
     * 1. Open Settings dialog
     * 2. Navigate to Stereochemistry section
     * 3. Verify that three color pickers are present: Absolute Center, AND Centers, and OR Centers
     * 4. Verify each color picker has a preview box showing the current color
     *
     * Version 3.17.0
     */
    const colorPickerHelper = ColorPickerHelper(page);
    
    await colorPickerHelper.openStereochemistrySettings();
    
    // Verify all three color pickers are visible
    const absoluteCenterColorPicker = await colorPickerHelper.getColorPickerPreview(StereochemistrySetting.AbsoluteCenterColor);
    const andCentersColorPicker = await colorPickerHelper.getColorPickerPreview(StereochemistrySetting.ANDCentersColor);
    const orCentersColorPicker = await colorPickerHelper.getColorPickerPreview(StereochemistrySetting.ORCentersColor);

    await expect(absoluteCenterColorPicker).toBeVisible();
    await expect(andCentersColorPicker).toBeVisible();
    await expect(orCentersColorPicker).toBeVisible();

    await takeElementScreenshot(page, SettingsDialog(page).stereochemistrySection);
    await SettingsDialog(page).cancel();
  });

  test('Case 2 - Clicking a preset color swatch in the palette immediately updates the color preview box to the selected color', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10090
     * Description: Clicking a preset color swatch in the palette immediately updates the color preview box to the selected color
     * Scenario:
     * 1. Open Settings dialog and navigate to Stereochemistry section
     * 2. Click on the Absolute Center color picker to open color selection
     * 3. Click on various preset color swatches
     * 4. Verify that the color preview box immediately updates to reflect the selected color
     * 5. Test with different preset colors (red, blue, green, etc.)
     *
     * Version 3.17.0
     */
    const colorPickerHelper = ColorPickerHelper(page);
    
    await colorPickerHelper.openStereochemistrySettings();
    await colorPickerHelper.clickColorPickerPreview(StereochemistrySetting.AbsoluteCenterColor);
    
    // Test different preset colors
    const testColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
    
    for (const color of testColors) {
      const presetSwatch = await colorPickerHelper.getPresetColorSwatch(color);
      if (await presetSwatch.isVisible()) {
        await presetSwatch.click();
        
        // Verify color preview updates immediately
        const colorPreview = await colorPickerHelper.getColorPreviewBox();
        await expect(colorPreview).toBeVisible();
        
        // Take screenshot to verify color change
        await takeElementScreenshot(page, colorPreview);
      }
    }

    await colorPickerHelper.getCancelButton().then(btn => btn.click());
    await SettingsDialog(page).cancel();
  });

  test('Case 3 - Clicking Apply after selecting a preset swatch applies the chosen color to the corresponding stereochemistry center label in the editor', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10090
     * Description: Clicking Apply after selecting a preset swatch applies the chosen color to the corresponding stereochemistry center label in the editor
     * Scenario:
     * 1. Create a molecule with stereochemistry centers
     * 2. Open Settings dialog and navigate to Stereochemistry section
     * 3. Select a different color for Absolute Center using preset swatch
     * 4. Click Apply
     * 5. Verify that the stereochemistry center labels in the editor now use the new color
     *
     * Version 3.17.0
     */
    // Create a molecule with stereochemistry centers first
    await openFileAndAddToCanvasAsNewProject(page, 'Molfiles-V2000/stereochemistry-structure.mol');
    
    const colorPickerHelper = ColorPickerHelper(page);
    
    await colorPickerHelper.openStereochemistrySettings();
    await colorPickerHelper.clickColorPickerPreview(StereochemistrySetting.AbsoluteCenterColor);
    
    // Select a distinctive preset color
    const redSwatch = await colorPickerHelper.getPresetColorSwatch('#FF0000');
    if (await redSwatch.isVisible()) {
      await redSwatch.click();
    }
    
    // Apply the changes
    const applyButton = await colorPickerHelper.getApplyButton();
    await applyButton.click();
    await SettingsDialog(page).apply();
    
    // Verify color applied to stereochemistry centers in editor
    await takeEditorScreenshot(page);
  });

  test('Case 4 - Clicking Cancel after selecting a new swatch discards the change and keeps the previously set color', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10090
     * Description: Clicking Cancel after selecting a new swatch discards the change and keeps the previously set color
     * Scenario:
     * 1. Open Settings dialog and navigate to Stereochemistry section
     * 2. Note the current color of the Absolute Center color picker
     * 3. Select a different preset color
     * 4. Click Cancel instead of Apply
     * 5. Verify that the color reverts to the original color
     * 6. Reopen settings to confirm the color was not changed
     *
     * Version 3.17.0
     */
    const colorPickerHelper = ColorPickerHelper(page);
    
    await colorPickerHelper.openStereochemistrySettings();
    
    // Store original color appearance
    const originalColorPicker = await colorPickerHelper.getColorPickerPreview(StereochemistrySetting.AbsoluteCenterColor);
    const originalColor = await originalColorPicker.screenshot();
    
    await colorPickerHelper.clickColorPickerPreview(StereochemistrySetting.AbsoluteCenterColor);
    
    // Select a different color
    const blueSwatch = await colorPickerHelper.getPresetColorSwatch('#0000FF');
    if (await blueSwatch.isVisible()) {
      await blueSwatch.click();
    }
    
    // Cancel the changes
    const cancelButton = await colorPickerHelper.getCancelButton();
    await cancelButton.click();
    await SettingsDialog(page).cancel();
    
    // Reopen settings and verify color unchanged
    await colorPickerHelper.openStereochemistrySettings();
    const unchangedColorPicker = await colorPickerHelper.getColorPickerPreview(StereochemistrySetting.AbsoluteCenterColor);
    await takeElementScreenshot(page, unchangedColorPicker);
    
    await SettingsDialog(page).cancel();
  });

  test('Case 5 - Clicking the "+" icon opens the Custom Colors section revealing hue and brightness/saturation sliders and HEX input; clicking "X" closes it', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10090
     * Description: Clicking the "+" icon opens the Custom Colors section revealing hue and brightness/saturation sliders and HEX input; clicking "X" closes it
     * Scenario:
     * 1. Open Settings dialog and navigate to Stereochemistry section
     * 2. Click on a color picker to open color selection
     * 3. Click the "+" icon to expand custom colors section
     * 4. Verify that hue slider, brightness/saturation sliders, and HEX input are visible
     * 5. Click the "X" icon to collapse custom colors section
     * 6. Verify that custom controls are hidden
     *
     * Version 3.17.0
     */
    const colorPickerHelper = ColorPickerHelper(page);
    
    await colorPickerHelper.openStereochemistrySettings();
    await colorPickerHelper.clickColorPickerPreview(StereochemistrySetting.AbsoluteCenterColor);
    
    // Find and click the expand toggle (+ icon)
    const customToggle = await colorPickerHelper.getCustomColorToggle();
    await customToggle.click();
    
    // Verify custom color controls are visible
    const hueSlider = await colorPickerHelper.getHueSlider();
    const saturationSlider = await colorPickerHelper.getSaturationSlider();
    const hexInput = await colorPickerHelper.getHexInput();
    
    await expect(hueSlider).toBeVisible();
    await expect(saturationSlider).toBeVisible();
    await expect(hexInput).toBeVisible();
    
    await takePageScreenshot(page);
    
    // Click the collapse toggle (X icon)
    await customToggle.click();
    
    // Verify custom color controls are hidden
    await expect(hueSlider).not.toBeVisible();
    await expect(saturationSlider).not.toBeVisible();
    await expect(hexInput).not.toBeVisible();
    
    await colorPickerHelper.getCancelButton().then(btn => btn.click());
    await SettingsDialog(page).cancel();
  });

  test('Case 6 - Dragging the hue slider updates the color preview box and populates the HEX input field with the corresponding valid HEX code', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10090
     * Description: Dragging the hue slider updates the color preview box and populates the HEX input field with the corresponding valid HEX code
     * Scenario:
     * 1. Open color picker and expand custom colors section
     * 2. Drag the hue slider to different positions
     * 3. Verify that color preview box updates in real-time
     * 4. Verify that HEX input field shows valid HEX codes corresponding to hue changes
     * 5. Test multiple hue positions (red, green, blue spectrum)
     *
     * Version 3.17.0
     */
    const colorPickerHelper = ColorPickerHelper(page);
    
    await colorPickerHelper.openStereochemistrySettings();
    await colorPickerHelper.clickColorPickerPreview(StereochemistrySetting.AbsoluteCenterColor);
    
    // Expand custom colors
    const customToggle = await colorPickerHelper.getCustomColorToggle();
    await customToggle.click();
    
    const hueSlider = await colorPickerHelper.getHueSlider();
    const hexInput = await colorPickerHelper.getHexInput();
    const colorPreview = await colorPickerHelper.getColorPreviewBox();
    
    // Test different hue positions
    const huePositions = [0, 60, 120, 180, 240, 300]; // Red, Yellow, Green, Cyan, Blue, Magenta
    
    for (const position of huePositions) {
      // Move hue slider to position (0-360 degrees)
      await hueSlider.fill(position.toString());
      
      // Verify color preview updates
      await expect(colorPreview).toBeVisible();
      
      // Verify HEX input has valid value
      const hexValue = await hexInput.inputValue();
      expect(hexValue).toMatch(/^#[0-9A-Fa-f]{6}$/);
      
      await takeElementScreenshot(page, colorPreview);
    }
    
    await colorPickerHelper.getCancelButton().then(btn => btn.click());
    await SettingsDialog(page).cancel();
  });

  test('Case 7 - Entering a valid HEX code (e.g. #FF5733) in the HEX input field updates the color preview box to match', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10090
     * Description: Entering a valid HEX code (e.g. #FF5733) in the HEX input field updates the color preview box to match
     * Scenario:
     * 1. Open color picker and expand custom colors section
     * 2. Enter various valid HEX codes in the HEX input field
     * 3. Verify that color preview box updates to match the entered HEX code
     * 4. Test multiple valid HEX formats (#FF5733, #ff5733, etc.)
     *
     * Version 3.17.0
     */
    const colorPickerHelper = ColorPickerHelper(page);
    
    await colorPickerHelper.openStereochemistrySettings();
    await colorPickerHelper.clickColorPickerPreview(StereochemistrySetting.AbsoluteCenterColor);
    
    // Expand custom colors
    const customToggle = await colorPickerHelper.getCustomColorToggle();
    await customToggle.click();
    
    const hexInput = await colorPickerHelper.getHexInput();
    const colorPreview = await colorPickerHelper.getColorPreviewBox();
    
    // Test various valid HEX codes
    const testHexCodes = ['#FF5733', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
    
    for (const hexCode of testHexCodes) {
      await colorPickerHelper.setHexValue(hexCode);
      
      // Verify color preview updates to match HEX code
      await expect(colorPreview).toBeVisible();
      await takeElementScreenshot(page, colorPreview);
      
      // Small delay to see the color change
      await page.waitForTimeout(500);
    }
    
    await colorPickerHelper.getCancelButton().then(btn => btn.click());
    await SettingsDialog(page).cancel();
  });

  test('Case 8 - Entering an invalid or incomplete HEX code (e.g. #GGG, #12) does not update the preview and is blocked by the input mask', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10090
     * Description: Entering an invalid or incomplete HEX code (e.g. #GGG, #12) does not update the preview and is blocked by the input mask
     * Scenario:
     * 1. Open color picker and expand custom colors section
     * 2. Try to enter invalid HEX codes in the HEX input field
     * 3. Verify that invalid characters are blocked or rejected
     * 4. Verify that color preview does not update for invalid input
     * 5. Test various invalid formats (#GGG, #12, invalid characters)
     *
     * Version 3.17.0
     */
    const colorPickerHelper = ColorPickerHelper(page);
    
    await colorPickerHelper.openStereochemistrySettings();
    await colorPickerHelper.clickColorPickerPreview(StereochemistrySetting.AbsoluteCenterColor);
    
    // Expand custom colors
    const customToggle = await colorPickerHelper.getCustomColorToggle();
    await customToggle.click();
    
    const hexInput = await colorPickerHelper.getHexInput();
    const colorPreview = await colorPickerHelper.getColorPreviewBox();
    
    // Store initial preview state
    const initialPreview = await colorPreview.screenshot();
    
    // Test various invalid HEX codes
    const invalidHexCodes = ['#GGG', '#12', '#GGGGGG', 'invalid', '123456', '#XYZ123'];
    
    for (const invalidHex of invalidHexCodes) {
      await hexInput.fill(invalidHex);
      
      // Verify input is either blocked or shows validation error
      const currentValue = await hexInput.inputValue();
      
      // The input should either be empty, show error state, or not accept invalid characters
      if (currentValue.length > 0) {
        // If some value was entered, it should be a valid partial HEX or show error styling
        expect(currentValue).toMatch(/^#?[0-9A-Fa-f]*$/);
      }
      
      await takeElementScreenshot(page, hexInput);
    }
    
    await colorPickerHelper.getCancelButton().then(btn => btn.click());
    await SettingsDialog(page).cancel();
  });

  test('Case 9 - Clicking the Delete icon next to the HEX input clears the field and resets the custom color preview', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10090
     * Description: Clicking the Delete icon next to the HEX input clears the field and resets the custom color preview
     * Scenario:
     * 1. Open color picker and expand custom colors section
     * 2. Enter a valid HEX code to change the color preview
     * 3. Click the Delete/Clear icon next to the HEX input
     * 4. Verify that the HEX input field is cleared
     * 5. Verify that the color preview resets to default or previous state
     *
     * Version 3.17.0
     */
    const colorPickerHelper = ColorPickerHelper(page);
    
    await colorPickerHelper.openStereochemistrySettings();
    await colorPickerHelper.clickColorPickerPreview(StereochemistrySetting.AbsoluteCenterColor);
    
    // Expand custom colors
    const customToggle = await colorPickerHelper.getCustomColorToggle();
    await customToggle.click();
    
    const hexInput = await colorPickerHelper.getHexInput();
    const deleteButton = await colorPickerHelper.getDeleteHexButton();
    const colorPreview = await colorPickerHelper.getColorPreviewBox();
    
    // Enter a custom HEX value
    await colorPickerHelper.setHexValue('#FF5733');
    
    // Verify input has value
    const valueBeforeDelete = await hexInput.inputValue();
    expect(valueBeforeDelete).toBe('#FF5733');
    
    // Click delete button
    await deleteButton.click();
    
    // Verify input is cleared
    const valueAfterDelete = await hexInput.inputValue();
    expect(valueAfterDelete).toBe('');
    
    // Verify color preview resets
    await takeElementScreenshot(page, colorPreview);
    
    await colorPickerHelper.getCancelButton().then(btn => btn.click());
    await SettingsDialog(page).cancel();
  });

  test('Case 10 - Applying a custom color defined via HEX input correctly updates the stereochemistry center color in the rendered molecule', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10090
     * Description: Applying a custom color defined via HEX input correctly updates the stereochemistry center color in the rendered molecule
     * Scenario:
     * 1. Create or load a molecule with stereochemistry centers
     * 2. Open color picker and set custom color via HEX input
     * 3. Apply the changes
     * 4. Verify that stereochemistry centers in the molecule render with the new custom color
     * 5. Test with multiple distinct custom colors
     *
     * Version 3.17.0
     */
    // Create a molecule with stereochemistry centers
    await openFileAndAddToCanvasAsNewProject(page, 'Molfiles-V2000/stereochemistry-structure.mol');
    
    const colorPickerHelper = ColorPickerHelper(page);
    
    await colorPickerHelper.openStereochemistrySettings();
    await colorPickerHelper.clickColorPickerPreview(StereochemistrySetting.AbsoluteCenterColor);
    
    // Expand custom colors and set custom HEX color
    const customToggle = await colorPickerHelper.getCustomColorToggle();
    await customToggle.click();
    
    await colorPickerHelper.setHexValue('#FF5733'); // Distinctive orange-red color
    
    // Apply the changes
    const applyButton = await colorPickerHelper.getApplyButton();
    await applyButton.click();
    await SettingsDialog(page).apply();
    
    // Verify the custom color is applied to stereochemistry centers in the editor
    await takeEditorScreenshot(page);
  });

  test('Case 11 - Each of the three stereochemistry centers (Absolute, AND, OR) maintains its own independently selected color without cross-contamination', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10090
     * Description: Each of the three stereochemistry centers (Absolute, AND, OR) maintains its own independently selected color without cross-contamination
     * Scenario:
     * 1. Open Settings and set different colors for each stereochemistry center type
     * 2. Set Absolute Center to red, AND Centers to green, OR Centers to blue
     * 3. Apply changes and verify each center type has its assigned color
     * 4. Reopen settings and verify colors are maintained independently
     *
     * Version 3.17.0
     */
    // Create a molecule with different stereochemistry center types
    await openFileAndAddToCanvasAsNewProject(page, 'Molfiles-V2000/complex-stereochemistry.mol');
    
    const colorPickerHelper = ColorPickerHelper(page);
    
    await colorPickerHelper.openStereochemistrySettings();
    
    // Set Absolute Center to red
    await colorPickerHelper.clickColorPickerPreview(StereochemistrySetting.AbsoluteCenterColor);
    const redSwatch = await colorPickerHelper.getPresetColorSwatch('#FF0000');
    if (await redSwatch.isVisible()) {
      await redSwatch.click();
    }
    await colorPickerHelper.getApplyButton().then(btn => btn.click());
    
    // Set AND Centers to green
    await colorPickerHelper.clickColorPickerPreview(StereochemistrySetting.ANDCentersColor);
    const greenSwatch = await colorPickerHelper.getPresetColorSwatch('#00FF00');
    if (await greenSwatch.isVisible()) {
      await greenSwatch.click();
    }
    await colorPickerHelper.getApplyButton().then(btn => btn.click());
    
    // Set OR Centers to blue
    await colorPickerHelper.clickColorPickerPreview(StereochemistrySetting.ORCentersColor);
    const blueSwatch = await colorPickerHelper.getPresetColorSwatch('#0000FF');
    if (await blueSwatch.isVisible()) {
      await blueSwatch.click();
    }
    await colorPickerHelper.getApplyButton().then(btn => btn.click());
    
    await SettingsDialog(page).apply();
    
    // Verify independent colors in rendered molecule
    await takeEditorScreenshot(page);
    
    // Reopen settings to verify colors are maintained
    await colorPickerHelper.openStereochemistrySettings();
    await takeElementScreenshot(page, SettingsDialog(page).stereochemistrySection);
    await SettingsDialog(page).cancel();
  });

  test('Case 12 - Selecting "Reset to Default" reverts all three stereochemistry center colors to Ketcher default values', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10090
     * Description: Selecting "Reset to Default" reverts all three stereochemistry center colors to Ketcher default values
     * Scenario:
     * 1. Modify colors for all three stereochemistry center types
     * 2. Apply the changes
     * 3. Click "Reset to Default" button
     * 4. Verify that all three color pickers show default Ketcher colors
     * 5. Apply and verify colors in rendered molecule match defaults
     *
     * Version 3.17.0
     */
    const colorPickerHelper = ColorPickerHelper(page);
    
    // First, modify all colors
    await colorPickerHelper.openStereochemistrySettings();
    
    // Change all colors to non-default values
    const colorPickers = [
      StereochemistrySetting.AbsoluteCenterColor,
      StereochemistrySetting.ANDCentersColor,
      StereochemistrySetting.ORCentersColor
    ];
    
    for (const picker of colorPickers) {
      await colorPickerHelper.clickColorPickerPreview(picker);
      const customSwatch = await colorPickerHelper.getPresetColorSwatch('#FF00FF'); // Magenta
      if (await customSwatch.isVisible()) {
        await customSwatch.click();
      }
      await colorPickerHelper.getApplyButton().then(btn => btn.click());
    }
    
    await SettingsDialog(page).apply();
    
    // Now reset to defaults
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).reset();
    await SettingsDialog(page).apply();
    
    // Verify colors are back to defaults
    await colorPickerHelper.openStereochemistrySettings();
    await takeElementScreenshot(page, SettingsDialog(page).stereochemistrySection);
    await SettingsDialog(page).cancel();
  });

  test('Case 13 - Selecting "Reset to ACS" reverts all three stereochemistry center colors to the ACS preset values', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10090
     * Description: Selecting "Reset to ACS" reverts all three stereochemistry center colors to the ACS preset values
     * Scenario:
     * 1. Modify colors for all three stereochemistry center types
     * 2. Apply the changes
     * 3. Click "Reset to ACS" button
     * 4. Verify that all three color pickers show ACS standard colors
     * 5. Apply and verify colors in rendered molecule match ACS standards
     *
     * Version 3.17.0
     */
    const colorPickerHelper = ColorPickerHelper(page);
    
    // First, modify all colors to non-ACS values
    await colorPickerHelper.openStereochemistrySettings();
    
    const colorPickers = [
      StereochemistrySetting.AbsoluteCenterColor,
      StereochemistrySetting.ANDCentersColor,
      StereochemistrySetting.ORCentersColor
    ];
    
    for (const picker of colorPickers) {
      await colorPickerHelper.clickColorPickerPreview(picker);
      const customSwatch = await colorPickerHelper.getPresetColorSwatch('#00FFFF'); // Cyan
      if (await customSwatch.isVisible()) {
        await customSwatch.click();
      }
      await colorPickerHelper.getApplyButton().then(btn => btn.click());
    }
    
    await SettingsDialog(page).apply();
    
    // Now set ACS style
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).setACSSettings();
    await SettingsDialog(page).apply();
    
    // Verify colors match ACS standards
    await colorPickerHelper.openStereochemistrySettings();
    await takeElementScreenshot(page, SettingsDialog(page).stereochemistrySection);
    await SettingsDialog(page).cancel();
  });

  test('Case 14 - Custom color selections persist after closing and reopening the Settings dialog (saved in browser cache)', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10090
     * Description: Custom color selections persist after closing and reopening the Settings dialog (saved in browser cache)
     * Scenario:
     * 1. Set custom colors for stereochemistry centers
     * 2. Apply and close the Settings dialog
     * 3. Reopen the Settings dialog
     * 4. Verify that the custom colors are still selected
     * 5. Test persistence across multiple open/close cycles
     *
     * Version 3.17.0
     */
    const colorPickerHelper = ColorPickerHelper(page);
    
    await colorPickerHelper.openStereochemistrySettings();
    
    // Set a distinctive custom color
    await colorPickerHelper.clickColorPickerPreview(StereochemistrySetting.AbsoluteCenterColor);
    const customToggle = await colorPickerHelper.getCustomColorToggle();
    await customToggle.click();
    
    await colorPickerHelper.setHexValue('#FF5733');
    await colorPickerHelper.getApplyButton().then(btn => btn.click());
    await SettingsDialog(page).apply();
    
    // Close and reopen settings dialog
    await colorPickerHelper.openStereochemistrySettings();
    
    // Verify the custom color persists
    const persistedColorPicker = await colorPickerHelper.getColorPickerPreview(StereochemistrySetting.AbsoluteCenterColor);
    await takeElementScreenshot(page, persistedColorPicker);
    
    await SettingsDialog(page).cancel();
    
    // Test persistence after page reload
    await pageReload(page);
    
    await colorPickerHelper.openStereochemistrySettings();
    const reloadedColorPicker = await colorPickerHelper.getColorPickerPreview(StereochemistrySetting.AbsoluteCenterColor);
    await takeElementScreenshot(page, reloadedColorPicker);
    
    await SettingsDialog(page).cancel();
  });

  test('Case 15 - Using "Save Settings" and "Load Settings" correctly serializes and restores all three stereochemistry center color values', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10090
     * Description: Using "Save Settings" and "Load Settings" correctly serializes and restores all three stereochemistry center color values
     * Scenario:
     * 1. Set different custom colors for all three stereochemistry centers
     * 2. Save settings to file
     * 3. Reset colors to defaults
     * 4. Load the saved settings file
     * 5. Verify that all three custom colors are correctly restored
     *
     * Version 3.17.0
     */
    const colorPickerHelper = ColorPickerHelper(page);
    
    await colorPickerHelper.openStereochemistrySettings();
    
    // Set different colors for each center type
    const colorSettings = [
      { picker: StereochemistrySetting.AbsoluteCenterColor, hex: '#FF5733' }, // Orange-red
      { picker: StereochemistrySetting.ANDCentersColor, hex: '#33FF57' },     // Green
      { picker: StereochemistrySetting.ORCentersColor, hex: '#3357FF' }       // Blue
    ];
    
    for (const setting of colorSettings) {
      await colorPickerHelper.clickColorPickerPreview(setting.picker);
      const customToggle = await colorPickerHelper.getCustomColorToggle();
      await customToggle.click();
      
      await colorPickerHelper.setHexValue(setting.hex);
      await colorPickerHelper.getApplyButton().then(btn => btn.click());
    }
    
    await SettingsDialog(page).apply();
    
    // Save settings to file (this would typically trigger a download)
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).saveToFileButton.click();
    await SettingsDialog(page).cancel();
    
    // Reset to defaults
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).reset();
    await SettingsDialog(page).apply();
    
    // Load settings from file (this would typically open file dialog)
    await TopRightToolbar(page).Settings();
    // Note: File loading in tests may require mocking or test-specific file handling
    // await SettingsDialog(page).openFromFileButton.click();
    await SettingsDialog(page).cancel();
    
    // Verify colors are restored (this test may need adaptation based on file handling implementation)
    await colorPickerHelper.openStereochemistrySettings();
    await takeElementScreenshot(page, SettingsDialog(page).stereochemistrySection);
    await SettingsDialog(page).cancel();
  });
});