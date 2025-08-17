/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { Page, test } from '@playwright/test';
import { takeEditorScreenshot, resetZoomLevelToDefault } from '@utils';
import { waitForPageInit } from '@utils/common';
import { processResetToDefaultState } from '@utils/testAnnotations/resetToDefaultState';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import { Presets } from '@constants/monomers/Presets';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';

let page: Page;

test.describe('Ketcher bugs in 3.4.0', () => {
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: false,
      goToPeptides: false,
    });
  });

  test.afterEach(async ({ context: _ }, testInfo) => {
    await CommonTopLeftToolbar(page).clearCanvas();
    await resetZoomLevelToDefault(page);
    await processResetToDefaultState(testInfo, page);
  });

  test.afterAll(async ({ browser }) => {
    await Promise.all(browser.contexts().map((context) => context.close()));
  });

  test(
    'Case 27: System not removes monomers from Molecules mode canvas when switched from Macro mode (bonds remain!) if ketcher in embedded mode (custom style iframe)',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/7243
       * Bug: https://github.com/epam/ketcher/issues/6974
       * Description: System not removes monomers from Molecules mode canvas when switched from
       * Macro mode (bonds remain!) if ketcher in embedded mode (custom style iframe)
       * Scenario:
       * 1. Open Ketcher in iFrame mode locally
       * 2. Go to Macro - Flex mode (empty canvas!)
       * 3. Add simple preset on the canvas
       * 4. Switch to Micro mode
       * 5. Take screenshot
       */
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Flex,
      );

      await Library(page).dragMonomerOnCanvas(Presets.A, {
        x: 0,
        y: 0,
        fromCenter: true,
      });
      await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
      await takeEditorScreenshot(page);
    },
  );
});
