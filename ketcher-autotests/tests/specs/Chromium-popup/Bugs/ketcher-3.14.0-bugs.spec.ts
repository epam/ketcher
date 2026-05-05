/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */

import { Page, test, expect } from '@fixtures';
import {
  takeEditorScreenshot,
  pasteFromClipboardAndOpenAsNewProject,
  openFileAndAddToCanvasAsNewProject,
  arrangeAsARingByKeyboard,
  openFileAndAddToCanvasAsNewProjectMacro,
  updateMonomersLibrary,
  takeLeftToolbarMacromoleculeScreenshot,
} from '@utils';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { SGroupPropertiesDialog } from '@tests/pages/molecules/canvas/S-GroupPropertiesDialog';
import {
  selectAtomAndBonds,
  selectMonomersAndBonds,
} from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';

let page: Page;

test.describe('Bugs: ketcher-3.14.0', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });

  test.afterEach(async ({ MoleculesCanvas: _ }) => {});

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1: Unable to load KET file in Molecules mode: process is not defined', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9901
     * Bug: https://github.com/epam/ketcher/issues/8896
     * Version: 3.14.0
     * Description:
     * System throws exception "process is not defined" when trying to load
     * a KET file in Molecules mode. After fix, the file should load without errors.
     *
     * Scenario:
     * 1. Open Ketcher in Molecules mode (clean canvas)
     * 2. Load KET file via File → Open from file menu
     * 3. Add to canvas
     *
     * Expected Result:
     * - KET file loads successfully without throwing exception
     * - No "process is not defined" error appears in console
     * - Structure is displayed on canvas
     */

    let hasConsoleError = false;
    let consoleErrorMessage = '';

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        hasConsoleError = true;
        consoleErrorMessage = msg.text();
      }
    });

    // Load a KET file and add to canvas

    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Chromium-popup/Bugs/ketcher-3.14.0-bugs/Switching-from-Flex-to-Snake-and-back-shits-canvas-from-top-left-corner-to-the-center.ket',
    );

    // Verify no console errors occurred
    expect(hasConsoleError).toBe(false);
    if (hasConsoleError) {
      test.fail(true, `Console error occurred: ${consoleErrorMessage}`);
    }

    // Visual verification: take a screenshot of the loaded structure
    await takeEditorScreenshot(page);
  });

  test('Case 2: The Copolymer S-Group type should not be displayed unless there are at least two structural repeating units (SRUs) in selection', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9901
     * Bug: https://github.com/epam/ketcher/issues/9113
     * Version: 3.14.0
     * Description:
     * Copolymer S-Group type should only be displayed when there are at least two
     * structural repeating units (SRUs) in the selection. With only one SRU,
     * the Copolymer option should be inactive and not selectable.
     *
     * Scenario:
     * 1. Go to Molecules mode (clean canvas)
     * 2. Add a simple chain molecule (e.g., SMILES "CC")
     * 3. Select the structure
     * 4. Click on S-group button to open S-Group Properties dialog
     * 5. Click on the Type combo-box to expand dropdown list
     * 6. Check if Copolymer option is available
     *
     * Expected Result:
     * - Copolymer option is NOT active and cannot be selected
     * - Copolymer option is not displayed in the Type dropdown list
     */

    // Add a simple chain molecule (one SRU) and selecte the structure
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCCCC');
    await selectAtomAndBonds(page, {
      atomIds: [0, 1, 2, 3],
      bondIds: [0, 1, 2],
    });

    // Open S-Group Properties dialog
    await LeftToolbar(page).sGroup();

    // Verify that Copolymer option is not available in the Type dropdown
    const dialog = SGroupPropertiesDialog(page);
    await dialog.typeDropdown.click();

    const options = page.getByRole('option');
    const optionTexts = await options.allTextContents();
    // Verify Copolymer is not in the list
    expect(optionTexts).not.toContain('Copolymer');

    // Close dropdown and dialog
    await page.keyboard.press('Escape');
    await dialog.cancel();
  });

  test('Case 3: Incorrect valence for nitrogen', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9901
     * Bug: https://github.com/epam/ketcher/issues/9108
     * Version: 3.14.0
     * Description:
     * Nitrogen can have two valid valences - 3 and 5.
     * Nitrogen with 5 bonds should not display an underline
     * indicating incorrect valence (bad valence warning).
     *
     * Scenario:
     * 1. Go to Molecules mode (clean canvas)
     * 2. Add nitrogen with 5 bonds from SMILES: N(C)(C)(C)(C)C
     * 3. Click on canvas to place structure
     * 4. Verify that nitrogen atom does not have bad valence underline
     *
     * Expected Result:
     * - Nitrogen with 5 bonds is displayed without an underline
     * - No bad valence warning appears for nitrogen
     */

    // Add nitrogen with 5 bonds using SMILES notation
    await pasteFromClipboardAndOpenAsNewProject(page, 'N(C)(C)(C)(C)C');

    // Visual verification: take a screenshot to confirm no underline on nitrogen
    await takeEditorScreenshot(page);
  });

  test('Case 4: Some keyboard shortcuts do not work on Macromolecules canvas', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9901
     * Bug: https://github.com/epam/ketcher/issues/9126
     * Version: 3.14.0
     * Description:
     * Some keyboard shortcuts don't work on the Macromolecules canvas.
     * The Delete key should activate the Erase tool, and pressing 1 should
     * activate the Single Bond tool. Other shortcuts like Ctrl+Alt+H for Hand Tool
     * already work correctly.
     *
     * Scenario:
     * 1. Open Ketcher in Macromolecules mode (clean canvas)
     * 2. Press the Delete key to activate Erase button
     * 3. Verify the Erase button is now active via screenshot
     * 4. Press the 1 key to activate Single Bond button
     * 5. Verify the Single Bond button is now active via screenshot
     *
     * Expected Result:
     * - Delete key activates the Erase tool button in the left toolbar
     * - 1 key activates the Single Bond tool button in the left toolbar
     * - Keyboard shortcuts respond as expected
     */

    // Test Delete keyboard shortcut - should activate Erase button
    await page.keyboard.press('Delete');
    // Verify the Erase button is now active by taking a toolbar screenshot
    await takeLeftToolbarMacromoleculeScreenshot(page);

    // Test 1 keyboard shortcut - should activate Single Bond button
    await page.keyboard.press('1');
    // Verify the Single Bond button is now active by taking a toolbar screenshot
    await takeLeftToolbarMacromoleculeScreenshot(page);
  });

  test('Case 5: Wrong monomer re-layout when creating cyclic structure', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9901
     * Bug: https://github.com/epam/Indigo/issues/3303
     * Version: 3.14.0
     * Description:
     * When creating a cyclic structure in Macromolecules mode, the system
     * incorrectly repositions non-selected monomers, changing their layout.
     * Non-selected monomers should remain in their original position.
     *
     * Scenario:
     * 1. Open Ketcher in Macromolecules mode (clean canvas)
     * 2. Load KET file with monomers arranged in a structure
     * 3. Select a cycle structure (part of the monomers)
     * 4. Open context menu and click "Create cyclic structure" option
     * 5. Verify that non-selected monomers remain in their original position
     *
     * Expected Result:
     * - System keeps all non-selected monomers in place
     * - Only the selected monomers are arranged in cyclic layout
     * - Monomer positions are preserved correctly
     */

    // Load the KET file with monomer structure
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Chromium-popup/Bugs/ketcher-3.14.0-bugs/Wrong-monomer-reposition.ket',
    );

    // Select the cycle structure (part of the monomers)
    await CommonLeftToolbar(page).areaSelectionTool();
    await selectMonomersAndBonds(page, {
      monomerIds: [22, 23, 24, 25, 26, 27],
      bondIds: [32, 33, 34, 35, 36, 37, 38],
    });

    // Create cyclic structure using keyboard shortcut
    await arrangeAsARingByKeyboard(page);
    // Visual verification: take a screenshot to confirm non-selected monomers remain in place
    await takeEditorScreenshot(page);
  });

  test('Case 6: It is possible to create preset with empty name', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9901
     * Bug: https://github.com/epam/ketcher/issues/8187
     * Version: 3.14.0
     * Description:
     * System allows creation of presets with empty names when using updateMonomersLibrary API.
     * After fix, the system should reject presets with empty names and throw a console error.
     * Presets must have valid names (max 200 chars, no spaces/slashes/minus/@/#).
     *
     * Scenario:
     * 1. Open Ketcher in Macromolecules Flex mode (clean canvas)
     * 2. Use updateMonomersLibrary API to create preset with empty name
     * 3. Verify the invalid preset was not added to the library
     *
     * Expected Result:
     * - System rejects preset with empty name
     * - Invalid preset does not appear in the library
     */
    // Get current count of presets in the library
    const presetItems = page.locator('[data-rna-preset-item-name]');
    const presetItemsCountBefore = await presetItems.count();
    // Attempt to create preset with empty name
    await updateMonomersLibrary(
      page,
      '\n  -INDIGO-10092514292D\n\n  0  0  0  0  0  0  0  0  0  0  0 V3000\nM  V30 BEGIN CTAB\nM  V30 COUNTS 3 2 0 0 0\nM  V30 BEGIN ATOM\nM  V30 1 Base1 7.7 -8.025 0.0 0 CLASS=BASE SEQID=1 ATTCHORD=(2 3 Al)\nM  V30 2 Phosphate1 9.2 -6.525 0.0 0 CLASS=PHOSPHATE SEQID=1 ATTCHORD=(2 3 Al-\nM  V30 )\nM  V30 3 Sugar1 7.7 -6.525 0.0 0 CLASS=SUGAR SEQID=1 ATTCHORD=(4 1 Cx 2 Br)\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 1 3 1\nM  V30 2 1 3 2\nM  V30 END BOND\nM  V30 END CTAB\nM  V30 BEGIN TEMPLATE\nM  V30 TEMPLATE 1 BASE/Base1/Base1 NATREPLACE=BASE/U\nM  V30 BEGIN CTAB\nM  V30 COUNTS 13 12 5 0 0\nM  V30 BEGIN ATOM\nM  V30 1 H -4.33 0.75 0.0 0\nM  V30 2 C -3.464 0.25 0.0 0\nM  V30 3 C -2.598 0.75 0.0 0\nM  V30 4 C -1.732 0.25 0.0 0\nM  V30 5 C -0.866 0.75 0.0 0\nM  V30 6 C 0.0 0.25 0.0 0\nM  V30 7 C 0.866 0.75 0.0 0\nM  V30 8 C 1.732 0.25 0.0 0\nM  V30 9 C 2.598 0.75 0.0 0\nM  V30 10 C 3.464 0.25 0.0 0\nM  V30 11 H 4.33 0.75 0.0 0\nM  V30 12 H -3.464 -0.75 0.0 0\nM  V30 13 H -1.732 -0.75 0.0 0\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 1 1 2\nM  V30 2 1 2 3\nM  V30 3 1 3 4\nM  V30 4 1 4 5\nM  V30 5 1 5 6\nM  V30 6 1 6 7\nM  V30 7 1 7 8\nM  V30 8 1 8 9\nM  V30 9 1 9 10\nM  V30 10 1 10 11\nM  V30 11 1 2 12\nM  V30 12 1 4 13\nM  V30 END BOND\nM  V30 BEGIN SGROUP\nM  V30 1 SUP 1 ATOMS=(1 1) XBONDS=(1 1) BRKXYZ=(9 0.433000 -0.250000 0.000000-\nM  V30  0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=-\nM  V30 LGRP\nM  V30 2 SUP 2 ATOMS=(1 11) XBONDS=(1 10) BRKXYZ=(9 -0.433000 -0.250000 0.000-\nM  V30 000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLA-\nM  V30 SS=LGRP\nM  V30 3 SUP 3 ATOMS=(1 12) XBONDS=(1 11) BRKXYZ=(9 0.000000 0.500000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\nM  V30 =LGRP\nM  V30 4 SUP 4 ATOMS=(1 13) XBONDS=(1 12) BRKXYZ=(9 0.000000 0.500000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\nM  V30 =LGRP\nM  V30 5 SUP 5 ATOMS=(9 2 3 4 5 6 7 8 9 10) XBONDS=(4 1 11 12 10) BRKXYZ=(9 --\nM  V30 0.433000 0.250000 0.000000 0.000000 -0.500000 0.000000 0.000000 0.0000-\nM  V30 00 0.000000) BRKXYZ=(9 0.000000 -0.500000 0.000000 0.433000 0.250000 0-\nM  V30 .000000 0.000000 0.000000 0.000000) LABEL=Base1 CLASS=BASE SAP=(3 2 1 -\nM  V30 Al) SAP=(3 10 11 Br) SAP=(3 2 12 Cx) SAP=(3 4 13 Dx) NATREPLACE=BASE/U\nM  V30 END SGROUP\nM  V30 END CTAB\nM  V30 TEMPLATE 2 PHOSPHATE/Phosphate1/Phosphate1 NATREPLACE=PHOSPHATE/P\nM  V30 BEGIN CTAB\nM  V30 COUNTS 16 15 6 0 0\nM  V30 BEGIN ATOM\nM  V30 1 H -5.196 0.75 0.0 0\nM  V30 2 C -4.33 0.25 0.0 0\nM  V30 3 C -3.464 0.75 0.0 0\nM  V30 4 C -2.598 0.25 0.0 0\nM  V30 5 C -1.732 0.75 0.0 0\nM  V30 6 C -0.866 0.25 0.0 0\nM  V30 7 C 0.0 0.75 0.0 0\nM  V30 8 C 0.866 0.25 0.0 0\nM  V30 9 C 1.732 0.75 0.0 0\nM  V30 10 C 2.598 0.25 0.0 0\nM  V30 11 C 3.464 0.75 0.0 0\nM  V30 12 C 4.33 0.25 0.0 0\nM  V30 13 H 5.196 0.75 0.0 0\nM  V30 14 H -4.33 -0.75 0.0 0\nM  V30 15 H -2.598 -0.75 0.0 0\nM  V30 16 H -0.866 -0.75 0.0 0\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 1 1 2\nM  V30 2 1 2 3\nM  V30 3 1 3 4\nM  V30 4 1 4 5\nM  V30 5 1 5 6\nM  V30 6 1 6 7\nM  V30 7 1 7 8\nM  V30 8 1 8 9\nM  V30 9 1 9 10\nM  V30 10 1 10 11\nM  V30 11 1 11 12\nM  V30 12 1 12 13\nM  V30 13 1 2 14\nM  V30 14 1 4 15\nM  V30 15 1 6 16\nM  V30 END BOND\nM  V30 BEGIN SGROUP\nM  V30 1 SUP 1 ATOMS=(1 1) XBONDS=(1 1) BRKXYZ=(9 0.433000 -0.250000 0.000000-\nM  V30  0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=-\nM  V30 LGRP\nM  V30 2 SUP 2 ATOMS=(1 13) XBONDS=(1 12) BRKXYZ=(9 -0.433000 -0.250000 0.000-\nM  V30 000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLA-\nM  V30 SS=LGRP\nM  V30 3 SUP 3 ATOMS=(1 14) XBONDS=(1 13) BRKXYZ=(9 0.000000 0.500000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\nM  V30 =LGRP\nM  V30 4 SUP 4 ATOMS=(1 15) XBONDS=(1 14) BRKXYZ=(9 0.000000 0.500000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\nM  V30 =LGRP\nM  V30 5 SUP 5 ATOMS=(1 16) XBONDS=(1 15) BRKXYZ=(9 0.000000 0.500000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\nM  V30 =LGRP\nM  V30 6 SUP 6 ATOMS=(11 2 3 4 5 6 7 8 9 10 11 12) XBONDS=(5 1 13 14 15 12) B-\nM  V30 RKXYZ=(9 -0.433000 0.250000 0.000000 0.000000 -0.500000 0.000000 0.000-\nM  V30 000 0.000000 0.000000) BRKXYZ=(9 0.000000 -0.500000 0.000000 0.000000 -\nM  V30 -0.500000 0.000000 0.000000 0.000000 0.000000) BRKXYZ=(9 0.433000 0.25-\nM  V30 0000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) L-\nM  V30 ABEL=Phosphate1 CLASS=PHOSPHATE SAP=(3 2 1 Al) SAP=(3 12 13 Br) SAP=(3-\nM  V30  2 14 Cx) SAP=(3 4 15 Dx) SAP=(3 6 16 Ex) NATREPLACE=PHOSPHATE/P\nM  V30 END SGROUP\nM  V30 END CTAB\nM  V30 TEMPLATE 3 SUGAR/Sugar1/Sugar1 NATREPLACE=SUGAR/R\nM  V30 BEGIN CTAB\nM  V30 COUNTS 14 13 4 0 0\nM  V30 BEGIN ATOM\nM  V30 1 H -5.196 0.75 0.0 0\nM  V30 2 C -4.33 0.25 0.0 0\nM  V30 3 C -3.464 0.75 0.0 0\nM  V30 4 C -2.598 0.25 0.0 0\nM  V30 5 C -1.732 0.75 0.0 0\nM  V30 6 C -0.866 0.25 0.0 0\nM  V30 7 C 0.0 0.75 0.0 0\nM  V30 8 C 0.866 0.25 0.0 0\nM  V30 9 C 1.732 0.75 0.0 0\nM  V30 10 C 2.598 0.25 0.0 0\nM  V30 11 C 3.464 0.75 0.0 0\nM  V30 12 C 4.33 0.25 0.0 0\nM  V30 13 H 5.196 0.75 0.0 0\nM  V30 14 H -4.33 -0.75 0.0 0\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 1 1 2\nM  V30 2 1 2 3\nM  V30 3 1 3 4\nM  V30 4 1 4 5\nM  V30 5 1 5 6\nM  V30 6 1 6 7\nM  V30 7 1 7 8\nM  V30 8 1 8 9\nM  V30 9 1 9 10\nM  V30 10 1 10 11\nM  V30 11 1 11 12\nM  V30 12 1 12 13\nM  V30 13 1 2 14\nM  V30 END BOND\nM  V30 BEGIN SGROUP\nM  V30 1 SUP 1 ATOMS=(1 1) XBONDS=(1 1) BRKXYZ=(9 0.433000 -0.250000 0.000000-\nM  V30  0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=-\nM  V30 LGRP\nM  V30 2 SUP 2 ATOMS=(1 13) XBONDS=(1 12) BRKXYZ=(9 -0.433000 -0.250000 0.000-\nM  V30 000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLA-\nM  V30 SS=LGRP\nM  V30 3 SUP 3 ATOMS=(1 14) XBONDS=(1 13) BRKXYZ=(9 0.000000 0.500000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\nM  V30 =LGRP\nM  V30 4 SUP 4 ATOMS=(11 2 3 4 5 6 7 8 9 10 11 12) XBONDS=(3 1 13 12) BRKXYZ=-\nM  V30 (9 -0.433000 0.250000 0.000000 0.000000 -0.500000 0.000000 0.000000 0.-\nM  V30 000000 0.000000) BRKXYZ=(9 0.433000 0.250000 0.000000 0.000000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000) LABEL=Sugar1 CLASS=SUGAR SAP=(3-\nM  V30  2 1 Al) SAP=(3 12 13 Br) SAP=(3 2 14 Cx) NATREPLACE=SUGAR/R\nM  V30 END SGROUP\nM  V30 END CTAB\nM  V30 END TEMPLATE\nM  END\n>  <type>\nmonomerGroupTemplate\n\n>  <groupClass>\nRNA\n\n>  <groupName>\n\n>  <idtAliases>\nbase=r_A1\n\n$$$$',
      { format: 'sdf' },
    );
    // Verify that the invalid preset was not added to the library by checking the count of presets
    const presetItemsCountAfter = await presetItems.count();
    expect(presetItemsCountAfter).toBe(presetItemsCountBefore);
  });
});
