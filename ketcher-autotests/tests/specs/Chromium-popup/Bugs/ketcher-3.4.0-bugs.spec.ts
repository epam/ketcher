/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { Page, test } from '@fixtures';
import { takeEditorScreenshot } from '@utils';

import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import { Preset } from '@tests/pages/constants/monomers/Presets';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';

let page: Page;

test.describe('Ketcher bugs in 3.4.0', () => {
  test.beforeAll(async ({ initFlexCanvas }) => {
    page = await initFlexCanvas();
  });

  test.beforeEach(async ({ FlexCanvas: _ }) => {});

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 27: System not removes monomers from Molecules mode canvas when switched from Macro mode (bonds remain!) if ketcher in embedded mode (custom style iframe)', async () => {
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
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);

    await Library(page).dragMonomerOnCanvas(Preset.A, {
      x: 0,
      y: 0,
      fromCenter: true,
    });
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await takeEditorScreenshot(page);
  });
});
