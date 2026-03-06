/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */

import { Page, test, expect } from '@fixtures';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import {
  clickOnCanvas,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  openFileAndAddToCanvasMacro,
  pasteFromClipboardAndOpenAsNewProject,
  selectAllStructuresOnCanvas,
  takeEditorScreenshot,
  takeElementScreenshot,
} from '@utils';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { TypeOption } from '@tests/pages/constants/s-GroupPropertiesDialog/Constants';
import { SGroupPropertiesDialog } from '@tests/pages/molecules/canvas/S-GroupPropertiesDialog';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { getBondLocator } from '@utils/macromolecules/polymerBond';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { MonomerOnMicroOption } from '@tests/pages/constants/contextMenu/Constants';
import { MonomerType } from '@tests/pages/constants/createMonomerDialog/Constants';
import { NucleotidePresetSection } from '@tests/pages/molecules/canvas/createMonomer/NucleotidePresetSection';
import { CreateMonomerDialog } from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';

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
    await takeEditorScreenshot(page);
  });

  test('Case 2 — “Field value” textbox is active in “S-Group Properties” modal when “Context” field is empty', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7729
     * Bug: https://github.com/epam/ketcher/issues/7729
     * Version: 3.13.0
     * Description:
     * When S-Group type is switched to Data and Context field becomes empty,
     * “Field name” and “Field value” inputs must be disabled,
     * but currently they remain editable.
     *
     * Scenario:
     * 1. Open Ketcher (Molecules mode)
     * 2. Paste SMILES "CC" → click to place structure
     * 3. Press Ctrl+G to activate S-group tool
     * 4. Click on the bond between atoms → S-group Properties dialog appears
     * 5. Select any S-group Type except "Data"
     * 6. Select "Data" again → the "Context" field becomes empty
     * 7. Try entering values into “Field name” and “Field value”
     *
     * Expected Result:
     * When Context field is empty,
     * “Field name” and “Field value” inputs must be disabled,
     * and user should NOT be able to enter text.
     */

    await pasteFromClipboardAndOpenAsNewProject(page, 'CC');

    await LeftToolbar(page).sGroup();
    await getBondLocator(page, { bondId: 0 }).click({ force: true });

    const dialog = SGroupPropertiesDialog(page);

    await dialog.selectType(TypeOption.Superatom);
    await dialog.selectType(TypeOption.Data);

    await expect(dialog.contextDropdown).toHaveValue('');
    await expect(dialog.fieldNameEditbox).toBeDisabled();
    await expect(dialog.fieldValueEditbox).toBeDisabled();
  });

  test('Case 3 — CIP labels are rendered under the bond after selection and move', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9137
     * Bug: https://github.com/epam/ketcher/issues/7899
     * Version: 3.8.0-rc.3
     * Description:
     * CIP labels must remain ABOVE the bond after the user selects and moves the molecule.
     *
     * Scenario:
     * 1. Go to Molecules mode (clean canvas)
     * 2. Load from SMILES: C/C=C/C
     * 3. Press "Calculate CIP" button to show CIP label above the double bond
     * 4. Select the whole molecule (Ctrl+A or rectangle selection)
     * 5. Drag it to a new location
     * 6. Click on the canvas to remove selection
     *
     * Expected Result:
     * CIP label remains ABOVE the bond after moving and deselecting the molecule
     * (does not get rendered under the bond).
     */

    // Step 2: Open structure from SMILES as New project (reliable helper)
    await pasteFromClipboardAndOpenAsNewProject(page, 'C/C=C/C');

    // Step 3: Calculate CIP labels.
    await IndigoFunctionsToolbar(page).calculateCIP();

    // Step 4: Select the whole molecule.
    await selectAllStructuresOnCanvas(page);

    // Step 5: Drag the molecule slightly (grab → move → release)
    await CommonLeftToolbar(page).handTool();
    const { x: centerX, y: centerY } =
      await getCoordinatesOfTheMiddleOfTheScreen(page);
    await page.mouse.move(centerX + 20, centerY + 20);
    await page.mouse.down();
    await page.mouse.move(centerX - 100, centerY - 100, { steps: 10 });
    await page.mouse.up();
    await page.keyboard.press('Escape');

    // Step 6: Move cursor back to center and click to clear selection
    await page.mouse.move(centerX, centerY);
    await clickOnCanvas(page, centerX, centerY);

    // Visual verification: take a focused screenshot around the double bond.
    await takeElementScreenshot(page, getBondLocator(page, { bondId: 1 }), {
      padding: 80,
    });
  });

  test('Case 4 — Stereo bonds between monomers become single bonds if monomer is collapsed', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9137
     * Bug: https://github.com/epam/ketcher/issues/8981
     * Version: 3.12.0-rc.1
     * Description:
     * Stereo bonds between monomers disappear (converted to single bonds)
     * after collapsing the created monomer.
     *
     * Scenario:
     * 1. Go to Molecules mode (clean canvas)
     * 2. Load from SMARTS:
     *    [#7](-[#6])(/[#7](-[#6])/[#6]/[#7](-[#6])/[#7](-[#6])/[#6]/[#6])/[#6]/[#6]
     * 3. Select whole structure
     * 4. Create monomer preset:
     *      - Base: specific atom + bond selection (see bug description)
     *      - Sugar: specific atom + bond selection
     *      - Phosphate: specific atom + bond selection
     * 5. Submit monomer creation
     * 6. Collapse the created monomer (context menu)
     *
     * Expected Result:
     * Stereo bonds between monomer fragments MUST remain stereo
     * and should not degrade into single bonds after collapsing.
     */

    // Step 1: Load SMARTS structure
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      '[#7](-[#6])(/[#7](-[#6])/[#6]/[#7](-[#6])/[#7](-[#6])/[#6]/[#6])/[#6]/[#6]',
    );

    // Step 2: Select entire structure
    await CommonLeftToolbar(page).areaSelectionTool();
    await selectAllStructuresOnCanvas(page);

    // Step 3: Create monomer preset
    await LeftToolbar(page).createMonomer();
    const dialog = CreateMonomerDialog(page);
    const presetSection = NucleotidePresetSection(page);

    await dialog.selectType(MonomerType.NucleotidePreset);
    await presetSection.setName('sss');

    await presetSection.setupBase({
      atomIds: [7, 8, 9, 10],
      bondIds: [7, 8, 9],
    });

    await CommonLeftToolbar(page).handTool();
    await page.mouse.move(600, 200);
    await dragMouseTo(450, 250, page);
    await page.mouse.move(600, 200);
    await dragMouseTo(450, 250, page);

    await presetSection.setupSugar({
      atomIds: [2, 3, 4, 5, 6],
      bondIds: [2, 3, 4, 5],
    });

    await presetSection.setupPhosphate({
      atomIds: [0, 1, 11, 12],
      bondIds: [0, 10, 11],
    });

    // Step 5: Submit monomer creation
    await dialog.submit();

    // Step 6: Collapse new monomer via context menu
    const sugarAtom = getAtomLocator(page, { atomId: 4 });
    await ContextMenu(page, sugarAtom).click(
      MonomerOnMicroOption.CollapseMonomer,
    );

    // Step 7: Screenshot stereogenic center to verify stereo bonds persist
    const collapsedLabel = page.locator('text[data-sgroup-name="sssS"]');
    await takeElementScreenshot(page, collapsedLabel, { padding: 180 });
  });
});
