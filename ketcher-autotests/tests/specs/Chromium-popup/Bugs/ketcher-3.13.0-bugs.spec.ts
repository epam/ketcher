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
// import { SGroupPropertiesDialog } from '@tests/pages/molecules/canvas/S-GroupPropertiesDialog';
// import { TypeOption } from '@tests/pages/constants/s-GroupPropertiesDialog/Constants';

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

  test('Case 1 — Small molecule positioning rule is not respected when connected to multiple monomers in different chains', async ({
    FlexCanvas: _,
  }) => {
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
      'KET/Chromium-popup/Bugs/ketcher-3.13.0-bugs/SM-that-has-two-or-more-connections-to-different-monomers.ket',
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

  // test('Case 2 — “Field value” textbox is active in “S-Group Properties” modal when “Context” field is empty', async () => {
  //   /*
  //    * Test task: https://github.com/epam/ketcher/issues/7729
  //    * Bug: https://github.com/epam/ketcher/issues/7729
  //    * Version: 3.13.0
  //    * Description:
  //    * When S-Group type is switched to Data and Context field becomes empty,
  //    * “Field name” and “Field value” inputs must be disabled,
  //    * but currently they remain editable.
  //    *
  //    * Scenario:
  //    * 1. Open Ketcher (Molecules mode)
  //    * 2. Paste SMILES "CC" → click to place structure
  //    * 3. Press Ctrl+G to activate S-group tool
  //    * 4. Click on the bond between atoms → S-group Properties dialog appears
  //    * 5. Select any S-group Type except "Data"
  //    * 6. Select "Data" again → the "Context" field becomes empty
  //    * 7. Try entering values into “Field name” and “Field value”
  //    *
  //    * Expected Result:
  //    * When Context field is empty,
  //    * “Field name” and “Field value” inputs must be disabled,
  //    * and user should NOT be able to enter text.
  //    */

  //   // Paste "CC" on canvas
  //   await page.keyboard.insertText('CC');
  //   await page.keyboard.press('Control+V');
  //   await page.mouse.click(300, 300);

  //   // Open S-group Properties by selecting S-group tool and clicking bond
  //   await page.keyboard.press('Control+G');
  //   await page.mouse.click(300, 260);

  //   const dialog = SGroupPropertiesDialog(page);

  //   // Step 5: select any non-Data type (e.g., "Superatom")
  //   await dialog.selectType(TypeOption.Superatom);

  //   // Step 6: select Data again → Context field becomes empty
  //   await dialog.selectType(TypeOption.Data);

  //   // Step 7: verify inputs are disabled by checking the dialog state
  //   // The field name and field value inputs should be disabled when Context is empty
  //   const dialogElement = dialog.rootElement();
  //   await expect(dialogElement).toBeVisible();

  //   // Screenshot for visual confirmation
  //   await takeElementScreenshot(page, dialog.rootElement(), {
  //     padding: 100,
  //   });
  // });
});
