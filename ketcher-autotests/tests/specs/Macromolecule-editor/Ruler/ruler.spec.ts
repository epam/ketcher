/* eslint-disable no-inline-comments */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  resetZoomLevelToDefault,
  keyboardTypeOnCanvas,
  keyboardPressOnCanvas,
  openFileAndAddToCanvasAsNewProjectMacro,
} from '@utils';
import {
  selectSnakeLayoutModeTool,
  selectSequenceLayoutModeTool,
} from '@utils/canvas/tools/helpers';
import { waitForPageInit } from '@utils/common';
import { processResetToDefaultState } from '@utils/testAnnotations/resetToDefaultState';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { closeErrorAndInfoModals } from '@utils/common/helpers';
import { Ruler } from '@tests/pages/macromolecules/tools/Ruler';

let page: Page;

test.describe('Tests for Ruler', () => {
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      disableChainLengthRuler: false,
    });
  });

  test.afterEach(async ({ context: _ }, testInfo) => {
    await closeErrorAndInfoModals(page);
    await resetZoomLevelToDefault(page);
    await CommonTopLeftToolbar(page).clearCanvas();
    await processResetToDefaultState(testInfo, page);
  });

  test.afterAll(async ({ browser }) => {
    await Promise.all(browser.contexts().map((context) => context.close()));
  });

  test('Case 1: Verify that ruler available only in Sequence and Snake mode, and placed below the main toolbar', async () => {
    /*
     * Version 3.5
     * Test case: https://github.com/epam/ketcher/issues/7276
     * Description: Ruler available only in Sequence and Snake mode, and placed below the main toolbar.
     * Scenario:
     * 1. Go to Macro - Sequence mode
     * 2. Verify that ruler is available and placed below the main toolbar
     * 3. Switch to Snake mode
     * 4. Verify that ruler is available and placed below the main toolbar
     * 5. Take screenshot
     */
    await keyboardTypeOnCanvas(page, 'ACGTUACGTUACGTUACGTU');
    await Ruler(page).hover();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await TopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await Ruler(page).hover();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 2: Verify that a rectangular input field positioned to the right of the slider, allowing users to manually enter a specific numeric value', async () => {
    /*
     * Version 3.5
     * Test case: https://github.com/epam/ketcher/issues/7276
     * Description: Rectangular input field positioned to the right of the slider, allowing users to manually enter a specific numeric value.
     * If the input field is standalone (not positioned next to the slider), hovering the mouse over it display a tooltip with the text: "Number of monomers in a line".
     * Scenario:
     * 1. Go to Macro - Sequence mode
     * 2. Verify that a rectangular input field positioned to the right of the slider, allowing users to manually enter a specific numeric value
     * 3. Hover the mouse over the input field and verify that a tooltip with the text: "Number of monomers in a line" is displayed
     * 4. Switch to Snake mode
     * 5. Verify that a rectangular input field positioned to the right of the slider, allowing users to manually enter a specific numeric value
     * 6. Hover the mouse over the input field and verify that a tooltip with the text: "Number of monomers in a line" is displayed
     * 7. Take screenshot
     * We have a bug: https://github.com/epam/ketcher/issues/7245
     * After fixing need to update screenshots
     */
    await keyboardTypeOnCanvas(page, 'ACGTUACGTUACGTUACGTU');
    await Ruler(page).hoverOnInputField();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await TopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await Ruler(page).hoverOnInputField();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 3: Check that while hovering the mouse cursor below the main toolbar, the ruler become visible and the current layout area visually differentiated from the rest of the canvas', async () => {
    /*
     * Version 3.5
     * Test case: https://github.com/epam/ketcher/issues/7276
     * Description: Check that while hovering the mouse cursor below the main toolbar, the ruler become visible and the current layout area visually
     * differentiated from the rest of the canvas. If the slider is set on a value N, the shaded area starts after N. The shaded area will also be present
     * on the left side of the canvas, starting from zero and extending further to the left.
     * Scenario:
     * 1. Go to Macro - Sequence mode
     * 2. Click on ruler handle and hold it
     * 3. Switch to Snake mode
     * 4. Click on ruler handle and hold it
     * 5. Take screenshot
     */
    await keyboardTypeOnCanvas(page, 'ACGTUACGTUACGTUACGTU');
    await Ruler(page).clickAndHold();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await page.mouse.up();
    await TopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await Ruler(page).clickAndHold();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 4: Check that the default position of the slider in the Sequence mode is 30, while in Snake mode it depends of the viewport size (refer to the current behavior)', async () => {
    /*
     * Version 3.5
     * Test case: https://github.com/epam/ketcher/issues/7276
     * Description: The default position of the slider in the Sequence mode is 30, while in Snake mode it depends of the viewport size (refer to the current behavior).
     * Scenario:
     * 1. Go to Macro - Sequence mode
     * 2. Verify that the default position of the slider is 30
     * 3. Switch to Snake mode
     * 4. Verify that the default position of the slider depends of the viewport size (refer to the current behavior)
     * 5. Take screenshot
     */
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await TopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 5: Check that in Sequence mode the allowed values on the ruler will be multiples of 10', async () => {
    /*
     * Version 3.5
     * Test case: https://github.com/epam/ketcher/issues/7276
     * Description: In Sequence mode the allowed values on the ruler will be multiples of 10.
     * Scenario:
     * 1. Go to Macro - Sequence mode
     * 2. Set the ruler value to 23
     * 3. Verify that the ruler value is set to 20
     * 4. Set the ruler value to 27
     * 5. Verify that the ruler value is set to 30
     */
    await keyboardTypeOnCanvas(page, 'ACGTUACGTUACGTUACGTU');
    await Ruler(page).setLength('23');
    await keyboardPressOnCanvas(page, 'Enter');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await Ruler(page).setLength('27');
    await keyboardPressOnCanvas(page, 'Enter');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 6: Check that in Snake mode the allowed values on the ruler can be any whole number', async () => {
    /*
     * Version 3.5
     * Test case: https://github.com/epam/ketcher/issues/7276
     * Description: In Snake mode the allowed values on the ruler can be any whole number.
     * Scenario:
     * 1. Go to Macro - Snake mode
     * 2. Set the ruler value to 8
     * 3. Verify that the ruler value is set to 8
     * 4. Set the ruler value to 13
     * 5. Verify that the ruler value is set to 13
     */
    await keyboardTypeOnCanvas(page, 'ACGTUACGTUACGTUACGTU');
    await TopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await Ruler(page).setLength('8');
    await keyboardPressOnCanvas(page, 'Enter');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await Ruler(page).setLength('13');
    await keyboardPressOnCanvas(page, 'Enter');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 7: Change layout by dragging ruler slider in Sequence and Snake mode', async () => {
    /*
     * Version 3.5
     * Test case: https://github.com/epam/ketcher/issues/7276
     * Description: Layout changed by dragging ruler slider in Sequence and Snake mode.
     * Scenario:
     * 1. Go to Macro - Sequence mode
     * 2. Drag ruler slider to the right and verify that the layout is changed
     * 3. Drag ruler slider to the left and verify that the layout is changed
     * 4. Switch to Snake mode
     * 5. Drag ruler slider to the right and verify that the layout is changed
     * 6. Drag ruler slider to the left and verify that the layout is changed
     * 7. Take screenshot
     */
    await TopToolbar(page).selectLayoutModeTool(LayoutMode.Sequence);
    await keyboardTypeOnCanvas(
      page,
      'ACGTUACGTUACGTUACGTUACGTUACGTUACGTUACGTUACGTUACGTUACGTUACGTU',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await Ruler(page).dragRulerHandle(400, 300);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await Ruler(page).dragRulerHandle(600, 300);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await TopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await Ruler(page).dragRulerHandle(400, 300);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await Ruler(page).dragRulerHandle(600, 300);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 8: When the zoom level is at 50% or below, the ruler must display markings at intervals of 5 units', async () => {
    /*
     * Version 3.5
     * Test case: https://github.com/epam/ketcher/issues/7276
     * Description: In Snake mode, the slider maintain a consistent appearance regardless of the zoom level, whereas the ruler is adapt:
     * When the zoom level is at 50% or below, the ruler must display markings at intervals of 5 units (e.g., 5, 10, 15, etc.).
     * Numbers between these intervals represented as vertical lines instead of numerical labels.
     * Scenario:
     * 1. Go to Macro - Snake mode
     * 2. Set the zoom level to 50% or below
     * 3. Verify that the ruler displays markings at intervals of 5 units
     */
    await TopToolbar(page).selectLayoutModeTool(LayoutMode.Sequence);
    await keyboardTypeOnCanvas(page, 'ACGTUACGTUACGTUACGTU');
    await TopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await CommonTopRightToolbar(page).setZoomInputValue('50');
    await page.keyboard.press('Escape');
    await Ruler(page).hover();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 9: Check that in Sequence mode, the ruler and slider control remain the same regardless of the zoom level. The ruler is represented by vertical lines instead of numbers', async () => {
    /*
     * Version 3.5
     * Test case: https://github.com/epam/ketcher/issues/7276
     * Description: In Sequence mode, the ruler and slider control remain the same regardless of the zoom level.
     * The ruler is represented by vertical lines instead of numbers.
     * Scenario:
     * 1. Go to Macro - Sequence mode
     * 2. Set the zoom level to 50% or below
     * 3. Verify that the ruler and slider control remain the same regardless of the zoom level
     * 4. The ruler is represented by vertical lines instead of numbers
     * 5. Take screenshot
     */
    await TopToolbar(page).selectLayoutModeTool(LayoutMode.Sequence);
    await keyboardTypeOnCanvas(page, 'ACGTUACGTUACGTUACGTU');
    await CommonTopRightToolbar(page).setZoomInputValue('50');
    await page.keyboard.press('Escape');
    await Ruler(page).hover();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 10: Verify that the visual element for adding new sequences include a tail that adjusts its length as monomers are added', async () => {
    /*
     * Version 3.5
     * Test case: https://github.com/epam/ketcher/issues/7276
     * Description: Verify that the visual element for adding new sequences include a tail that adjusts its length as monomers are added.
     * The tail must stay aligned on the same level as the monomer chain. Its length scale proportionally to the number of monomers,
     * matching the exact length of the monomer chain.
     * Scenario:
     * 1. Go to Macro - Sequence mode
     * 2. Add a sequence with a length of 20 monomers
     * 3. Verify that the visual element for adding new sequences include a tail that adjusts its length as monomers are added
     * 4. The tail must stay aligned on the same level as the monomer chain
     * 5. Its length scale proportionally to the number of monomers, matching the exact length of the monomer chain
     * 6. Take screenshot
     */
    await keyboardTypeOnCanvas(page, 'ACGTUACGTU');
    await page.getByTestId('NewSequencePlusButtonIcon').hover();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await keyboardTypeOnCanvas(page, 'ACGTUACGTU');
    await page.getByTestId('NewSequencePlusButtonIcon').hover();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 11: Check if the slider moves out of the viewport, the input field is repositioned to the corresponding corner of the canvas', async () => {
    /*
     * Version 3.5
     * Test case: https://github.com/epam/ketcher/issues/7276
     * Description: When the slider is outside the viewport, the input field dynamically adjust its position based on the slider’s location.
     * If the slider moves out of the viewport, the input field is repositioned to the corresponding corner of the canvas: the right corner if the slider
     * exits on the right, and the left corner if it exits on the left..
     * Scenario:
     * 1. Go to Macro - Sequence mode
     * 2. Add a sequence
     * 3. Input in the input field to make the slider move out of the viewport
     * 4. Take screenshot
     */
    await keyboardTypeOnCanvas(page, 'ACGTUACGTUACGTUACGTU');
    await Ruler(page).setLength('50');
    await keyboardPressOnCanvas(page, 'Enter');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 12: Change layout by dragging ruler slider in Sequence and Snake mode for 1001 Peptides', async () => {
    /*
     * Version 3.5
     * Test case: https://github.com/epam/ketcher/issues/7276
     * Description: Layout changed by dragging ruler slider in Sequence and Snake mode.
     * Scenario:
     * 1. Go to Macro - Sequence mode
     * 2. Drag ruler slider to the right and verify that the layout is changed
     * 3. Drag ruler slider to the left and verify that the layout is changed
     * 4. Switch to Snake mode
     * 5. Drag ruler slider to the right and verify that the layout is changed
     * 6. Drag ruler slider to the left and verify that the layout is changed
     * 7. Take screenshot
     */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/1001-peptides.ket',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await Ruler(page).dragRulerHandle(400, 300);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await Ruler(page).dragRulerHandle(600, 300);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await TopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await Ruler(page).dragRulerHandle(400, 300);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await Ruler(page).dragRulerHandle(600, 300);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 13: Change layout by set lenght in ruler slider in Sequence and Snake mode for 1001 Peptides', async () => {
    /*
     * Version 3.5
     * Test case: https://github.com/epam/ketcher/issues/7276
     * Description: Layout changed by dragging ruler slider in Sequence and Snake mode.
     * Scenario:
     * 1. Go to Macro - Sequence mode
     * 2. Set the ruler value to 10
     * 3. Set the ruler value to 40
     * 4. Switch to Snake mode
     * 5. Set the ruler value to 7
     * 6. Set the ruler value to 12
     * 7. Take screenshot
     */
    await TopToolbar(page).selectLayoutModeTool(LayoutMode.Sequence);
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/1001-peptides.ket',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await Ruler(page).setLength('10');
    await keyboardPressOnCanvas(page, 'Enter');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await Ruler(page).setLength('40');
    await keyboardPressOnCanvas(page, 'Enter');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await TopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await Ruler(page).setLength('7');
    await keyboardPressOnCanvas(page, 'Enter');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await Ruler(page).setLength('12');
    await keyboardPressOnCanvas(page, 'Enter');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 14: Change layout by dragging ruler slider in Sequence and Snake mode for 1001 DNA', async () => {
    /*
     * Version 3.5
     * Test case: https://github.com/epam/ketcher/issues/7276
     * Description: Layout changed by dragging ruler slider in Sequence and Snake mode.
     * Scenario:
     * 1. Go to Macro - Sequence mode
     * 2. Drag ruler slider to the right and verify that the layout is changed
     * 3. Drag ruler slider to the left and verify that the layout is changed
     * 4. Switch to Snake mode
     * 5. Drag ruler slider to the right and verify that the layout is changed
     * 6. Drag ruler slider to the left and verify that the layout is changed
     * 7. Take screenshot
     */
    await TopToolbar(page).selectLayoutModeTool(LayoutMode.Sequence);
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/1001-dna-monomers.ket',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await Ruler(page).dragRulerHandle(400, 300);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await Ruler(page).dragRulerHandle(600, 300);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await TopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await Ruler(page).dragRulerHandle(400, 300);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await Ruler(page).dragRulerHandle(600, 300);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 15: Change layout by set lenght in ruler slider in Sequence and Snake mode for 1001 DNA', async () => {
    /*
     * Version 3.5
     * Test case: https://github.com/epam/ketcher/issues/7276
     * Description: Layout changed by dragging ruler slider in Sequence and Snake mode.
     * Scenario:
     * 1. Go to Macro - Sequence mode
     * 2. Set the ruler value to 10
     * 3. Set the ruler value to 40
     * 4. Switch to Snake mode
     * 5. Set the ruler value to 7
     * 6. Set the ruler value to 12
     * 7. Take screenshot
     */
    await TopToolbar(page).selectLayoutModeTool(LayoutMode.Sequence);
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/1001-dna-monomers.ket',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await Ruler(page).setLength('10');
    await keyboardPressOnCanvas(page, 'Enter');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await Ruler(page).setLength('40');
    await keyboardPressOnCanvas(page, 'Enter');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await TopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await Ruler(page).setLength('7');
    await keyboardPressOnCanvas(page, 'Enter');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await Ruler(page).setLength('12');
    await keyboardPressOnCanvas(page, 'Enter');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 16: Change layout by dragging ruler slider in Sequence and Snake mode when opened Calculate properties window', async () => {
    /*
     * Version 3.5
     * Test case: https://github.com/epam/ketcher/issues/7276
     * Description: Layout changed by dragging ruler slider in Sequence and Snake mode when opened Calculate properties window.
     * Scenario:
     * 1. Go to Macro - Sequence mode
     * 2. Open Calculate properties window
     * 3. Drag ruler slider to the right and verify that the layout is changed
     * 4. Drag ruler slider to the left and verify that the layout is changed
     * 5. Switch to Snake mode
     * 6. Drag ruler slider to the right and verify that the layout is changed
     * 7. Drag ruler slider to the left and verify that the layout is changed
     * 8. Take screenshot
     */
    await TopToolbar(page).selectLayoutModeTool(LayoutMode.Sequence);
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/1001-dna-monomers.ket',
    );
    await CommonTopLeftToolbar(page).calculateProperties();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await Ruler(page).dragRulerHandle(400, 300);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await Ruler(page).dragRulerHandle(600, 300);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await TopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await Ruler(page).dragRulerHandle(400, 300);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await Ruler(page).dragRulerHandle(600, 300);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });
});
