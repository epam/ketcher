/* eslint-disable no-inline-comments */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  resetZoomLevelToDefault,
  keyboardTypeOnCanvas,
  selectSnakeLayoutModeTool,
  keyboardPressOnCanvas,
} from '@utils';
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
     * Version: 3.5
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
    await selectSnakeLayoutModeTool(page);
    await Ruler(page).hover();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 2: Verify that a rectangular input field positioned to the right of the slider, allowing users to manually enter a specific numeric value', async () => {
    /*
     * Version: 3.5
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
    await selectSnakeLayoutModeTool(page);
    await Ruler(page).hoverOnInputField();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 3: Check that while hovering the mouse cursor below the main toolbar, the ruler become visible and the current layout area visually differentiated from the rest of the canvas', async () => {
    /*
     * Version: 3.5
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
    await selectSnakeLayoutModeTool(page);
    await Ruler(page).clickAndHold();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 4: Check that the default position of the slider in the Sequence mode is 30, while in Snake mode it depends of the viewport size (refer to the current behavior)', async () => {
    /*
     * Version: 3.5
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
    await selectSnakeLayoutModeTool(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 5: Check that in Sequence mode the allowed values on the ruler will be multiples of 10', async () => {
    /*
     * Version: 3.5
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
});
