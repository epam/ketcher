/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */

import { Page, test } from '@fixtures';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { openFileAndAddToCanvasMacro, takeElementScreenshot } from '@utils';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';

let page: Page;

test.describe('Bugs: ketcher-3.13.0 — Small molecules positioning rule', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });

  test.afterEach(async () => {
    await CommonTopLeftToolbar(page).clearCanvas();
  });

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1 — Small molecule positioning rule is not respected when connected to multiple monomers in different chains', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/8245
     * Bug: https://github.com/epam/ketcher/issues/7560
     * Version: 3.13.0
     * Description:
     * Small molecule (SM) connected to several monomers from different chains
     * should follow rule: its position in Snake mode must be aligned
     * below the first monomer in the chain.
     *
     * Scenario:
     * 1. Go to Macro → Flex mode
     * 2. Load file: SM-that-has-two-or-more-connections-to-different-monomers.zip
     * 3. Switch to Snake mode
     * 4. Check SM positioning relative to first connected monomer
     *
     * Expected Result:
     * According to requirement 4.2:
     * - When SM has several connections to monomers in different chains,
     *   the connection to the monomer that appears earlier in the Snake chain
     *   must be prioritized.
     * - SM must be placed directly below that monomer.
     */

    await openFileAndAddToCanvasMacro(
      page,
      'KET/SM-that-has-two-or-more-connections-to-different-monomers.ket',
    );

    // switch to Snake mode
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);

    // zoom out to show whole structure
    await CommonTopRightToolbar(page).setZoomInputValue('45');

    // SM expected to appear below the earlier chain monomer — we verify visually
    // target ID may vary depending on import, but SM is usually last monomer
    await takeElementScreenshot(
      page,
      getMonomerLocator(page, { monomerId: 0 }),
      { padding: 180 },
    );
  });
});
