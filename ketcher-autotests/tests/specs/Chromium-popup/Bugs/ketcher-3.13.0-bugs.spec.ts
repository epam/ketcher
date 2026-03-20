/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */

import { Page, test, expect } from '@fixtures';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import {
  clickInTheMiddleOfTheScreen,
  clickOnCanvas,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  MacroFileType,
  openFileAndAddToCanvasAsNewProject,
  openFileAndAddToCanvasMacro,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  pasteFromClipboardAndOpenAsNewProject,
  selectAllStructuresOnCanvas,
  takeEditorScreenshot,
  takeElementScreenshot,
  takeMonomerLibraryScreenshot,
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
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';
import { getAbbreviationLocator } from '@utils/canvas/s-group-signes/getAbbreviation';
import { EditAbbreviationDialog } from '@tests/pages/molecules/canvas/EditAbbreviation';
import { RNASection } from '@tests/pages/constants/library/Constants';
import { Library } from '@tests/pages/macromolecules/Library';
import { KETCHER_CANVAS } from '@tests/pages/constants/canvas/Constants';

let page: Page;

test.describe('Bugs: ketcher-3.13.0 — Small molecules positioning rule', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });

  test.afterEach(async ({ MoleculesCanvas: _ }) => {});

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

    await dialog.cancel();
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
    await dragMouseTo(page, centerX - 100, centerY - 100);

    // Step 6: Move cursor back to center and click to clear selection
    await CommonLeftToolbar(page).areaSelectionTool();
    await clickInTheMiddleOfTheScreen(page);

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
    await dragMouseTo(page, 450, 250);
    await page.mouse.move(600, 200);
    await dragMouseTo(page, 450, 250);

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

  test('Case 5 — Save Structure dialog causes memory leak when switching formats repeatedly', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9137
     * Bug: https://github.com/epam/ketcher/issues/8986
     * Version: 3.12.0-rc.1
     * Description:
     * Rapid switching between "SVG Document" and "PNG Image" formats in
     * Save Structure dialog leads to warning:
     * "MaxListenersExceededWarning: Possible EventEmitter memory leak detected"
     *
     * Scenario:
     * 1. Go to Molecules mode (clean canvas)
     * 2. Open "Save Structure" dialog
     * 3. Switch format: SVG → PNG → SVG → PNG → ... (repeat at least 11 times)
     *
     * Expected Result:
     * No memory leak warnings appear in the DevTools console.
     */

    // Intercept console warnings
    page.on('console', (msg) => {
      const text = msg.text();
      if (
        text.includes('MaxListenersExceededWarning') ||
        text.includes('Possible EventEmitter memory leak detected')
      ) {
        test.fail(true, `Memory leak warning detected: ${text}`);
      }
    });

    // Step 1: canvas already clean due to afterEach()

    // Step 2: Open Save Structure dialog
    await CommonTopLeftToolbar(page).saveFile();

    // const saveDialog = page.getByTestId('save-structure-dialog');
    const dialog = SaveStructureDialog(page);

    // Step 3: switch formats repeatedly
    for (let i = 0; i < 12; i++) {
      await dialog.chooseFileFormat(MoleculesFileFormatType.SVGDocument);
      await dialog.chooseFileFormat(MoleculesFileFormatType.PNGImage);
    }

    // Close dialog
    await dialog.cancel();
  });

  test('Case 6 — Subtype combo box width is less than other combo boxes on S-Group Properties dialog', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9137
     * Bug: https://github.com/epam/ketcher/issues/8978
     * Version: 3.12.0-rc.1
     * Description:
     * After selecting S-Group Type "Copolymer", the "Subtype" combo box
     * becomes visually narrower than the "Type" and "Repeat pattern" combo boxes.
     *
     * Scenario:
     * 1. Open Molecules mode (clean canvas)
     * 2. Load SMILES: CCCCC
     * 3. Select whole molecule
     * 4. Press S‑Group button (or Ctrl+G) to open S‑Group Properties dialog
     * 5. Change Type combo box value to "Copolymer"
     *
     * Expected Result:
     * Subtype combo box width is equal to Type and Repeat Pattern combo boxes.
     */

    // Step 1–2
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V2000/Chromium-popup/Bugs/Bug8978.mol',
    );

    // Step 3: Select the whole molecule
    await CommonLeftToolbar(page).areaSelectionTool();
    await selectAllStructuresOnCanvas(page);

    // Step 4: Open S‑Group Properties dialog
    await LeftToolbar(page).sGroup();
    const dialog = SGroupPropertiesDialog(page);

    // Step 5: Change S‑Group Type → Copolymer
    await dialog.selectType(TypeOption.Copolymer);

    // Take screenshot of S‑Group Properties dialog window
    await takeElementScreenshot(page, dialog.window, {
      padding: 0,
    });

    await dialog.cancel();
  });

  test('Case 7 — Expanded monomer disappears after switching back to Macromolecules mode', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9137
     * Bug: https://github.com/epam/ketcher/issues/7153
     * Version: 3.4.0-rc.3
     * Description:
     * After loading a monomer in Macromolecules → Flex mode,
     * switching to Molecules mode, expanding the monomer and erasing
     * its abbreviation, switching back to Macromolecules mode clears
     * the entire canvas instead of preserving the expanded structure.
     *
     * Scenario:
     * 1. Go to Macromolecules mode – Flex mode (clean canvas)
     * 2. Load from HELM: RNA1{[2-damdA]}$$$$V2.0
     * 3. Switch to Molecules mode
     * 4. Expand the monomer and remove abbreviation
     * 5. Switch to Macromolecules mode again
     *
     * Expected Result:
     * Expanded molecule remains on canvas and does NOT disappear.
     */

    // Step 1: Macro → Flex mode (popup-friendly)
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
    });

    // Step 2: Load HELM
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[2-damdA]}$$$$V2.0',
    );

    // Step 3: Switch to Molecules mode
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await page.waitForTimeout(300);

    // Step 4.1: Expand monomer via context menu
    const abbrev = getAbbreviationLocator(page, { id: 0 });
    await ContextMenu(page, abbrev).click(MonomerOnMicroOption.ExpandMonomer);

    // Step 4.2: Remove abbreviation
    await clickInTheMiddleOfTheScreen(page);
    await LeftToolbar(page).sGroup();
    await EditAbbreviationDialog(page).removeAbbreviation();

    // Step 5: Switch back to Macromolecules mode
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await page.waitForTimeout(300);

    // Expected: Expanded molecule still visible
    await takeElementScreenshot(page, getAtomLocator(page, { atomId: 2 }), {
      padding: 200,
    });
  });

  test('Case 8 — System shows natural analog category for phosphates', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9137
     * Bug: https://github.com/epam/ketcher/issues/9065
     * Version: 3.12.0-rc.2
     * Description:
     * In the RNA → Phosphates section, the Library incorrectly displays a natural
     * analog category label. Natural analog categories apply only to peptides,
     * bases, and nucleotides, and should NOT appear for phosphates.
     *
     * Scenario:
     * 1. Switch to Macromolecules mode (Flex)
     * 2. Open the Library → RNA tab
     * 3. Open the Phosphates section
     *
     * Expected Result:
     * Natural analog category is NOT shown for phosphates.
     */

    // Step 1: Switch to Macromolecules Flex mode
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
    });

    // Step 2–3: Open Library → RNA → Phosphates section
    await Library(page).openRNASection(RNASection.Phosphates);

    // Visual verification: screenshot of the Library panel
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 9 — System shows bad valence for atoms attached to bonds that connect monomers', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9137
     * Bug: https://github.com/epam/ketcher/issues/8980
     * Version: 3.12.0-rc.1
     * Description:
     * Bad valence warnings are shown on N atoms that are attached to bonds
     * connecting monomers after creating a nucleotide preset from a SMARTS structure.
     * Switching to Macromolecules mode and back to Molecules removes the warnings.
     *
     * Scenario:
     * 1. Open Molecules mode (clean canvas)
     * 2. Load SMARTS:
     *    [#7](-[#6])(/[#7](-[#6])/[#6]/[#7](-[#6])/[#7](-[#6])/[#6]/[#6])/[#6]/[#6]
     * 3. Select whole structure and open Create Monomer wizard
     * 4. Create a Nucleotide (preset) with following grouping (Base/Sugar/Phosphate)
     *    according to the bug description (IDs must match your structure)
     * 5. Submit wizard — observe that no bad valence warnings on N atoms
     *
     * Expected Result:
     * No bad valence indications (warnings) on atoms after preset creation.
     * If they appear initially, they must disappear after Macro→Micro switch.
     */

    // Step 1–2: Load SMARTS structure as a new project
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      '[#7](-[#6])(/[#7](-[#6])/[#6]/[#7](-[#6])/[#7](-[#6])/[#6]/[#6])/[#6]/[#6]',
    );

    // Step 3: Select the whole structure and open Create Monomer wizard
    await CommonLeftToolbar(page).areaSelectionTool();
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).createMonomer();

    const dialog = CreateMonomerDialog(page);
    const presetSection = NucleotidePresetSection(page);

    // Step 4: Create a Nucleotide (preset)
    await dialog.selectType(MonomerType.NucleotidePreset);
    await presetSection.setName('badValence');

    // --- Base ---
    await presetSection.setupBase({
      atomIds: [7, 8, 9, 10],
      bondIds: [7, 8, 9],
    });

    // Small stabilize drags
    await CommonLeftToolbar(page).handTool();
    await page.mouse.move(600, 200);
    await dragMouseTo(page, 450, 250);
    await page.mouse.move(600, 200);
    await dragMouseTo(page, 450, 250);

    // --- Sugar ---
    await presetSection.setupSugar({
      atomIds: [2, 3, 4, 5, 6],
      bondIds: [2, 3, 4, 5],
    });

    // --- Phosphate ---
    await presetSection.setupPhosphate({
      atomIds: [0, 1, 11, 12],
      bondIds: [0, 10, 11],
    });

    // Step 5: Submit wizard
    await dialog.submit();

    // Visual verification: take a screenshot where bad valence (if present) is visible.
    await takeElementScreenshot(page, page.getByTestId(KETCHER_CANVAS), {
      padding: -160,
    });
  });

  test('Case 10 — Monomer area selection works wrong if user scrolls down during selection', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9137
     * Bug: https://github.com/epam/ketcher/issues/7927
     * Version: 3.8.0-rc.3
     * Description:
     * In Snake canvas, area selection behaves incorrectly when the user starts
     * selection at the bottom of the screen and scrolls down using mouse wheel.
     *
     * Scenario:
     * 1. Go to Macromolecules mode – Snake canvas (clean canvas)
     * 2. Load the HELM structure
     * 3. Start area selection from the bottom of the screen
     * 4. Scroll down using the mouse wheel during selection
     *
     * Expected Result:
     * Area selection works correctly and selection area is consistent even after scrolling.
     */

    // Step 1: Switch to Macromolecules → Snake mode
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);

    // Step 2: Load the huge HELM structure
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)p.r(A)}$$$$V2.0',
    );

    // Step 3: Start area selection from the bottom of the screen
    await CommonLeftToolbar(page).areaSelectionTool();
    const canvas = page.getByTestId(KETCHER_CANVAS).first();
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas bounding box is undefined');
    const inset = 20;
    // eslint-disable-next-line prefer-const
    let startX = Math.floor(box.x + box.width - inset);
    let startY = Math.floor(box.y + box.height / 2 + 40);
    const bottomLimit = Math.floor(box.y + box.height - inset);
    if (startY > bottomLimit - 8) startY = bottomLimit - 8;
    const firstTargetX = Math.floor(box.x + inset);
    const firstTargetY = bottomLimit;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(firstTargetX, firstTargetY, { steps: 20 });
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(0, 320);
      await page.waitForTimeout(40);
    }
    const extraX = Math.max(firstTargetX - 30, box.x + 8);
    const extraY = firstTargetY + 30;
    await page.mouse.move(extraX, extraY, { steps: 8 });
    await page.mouse.up();

    // Visual result validation: screenshot of the entire canvas
    await takeEditorScreenshot(page);
  });

  test('Case 11 — Ketcher saves incorrect attachment points configuration for new nucleotides', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9137
     * Bug: https://github.com/epam/ketcher/issues/9084
     * Version: 3.13.0-rc.1
     * Description:
     * When creating a new Nucleotide in the monomer wizard and manually defining
     * attachment points (AP), Ketcher loses the user-defined AP configuration.
     * It should instead validate that Sugar.R2 and Phosphate.R1 are already defined
     * and show an error (prevent invalid save).
     *
     * Scenario:
     * 1. Go to Molecules mode (clean canvas)
     * 2. Load structure from file
     * 3. Select the whole structure and open Create Monomer wizard
     * 4. Choose "Nucleotide" type
     * 5. Configure Base/Sugar/Phosphate per picture from the issue and set APs:
     *    - Sugar: R2 is already defined (user tries to define it again)
     *    - Phosphate: R1 is already defined (user tries to define it again)
     * 6. Try to submit
     *
     * Expected result:
     * Wizard shows validation error and does NOT allow saving an invalid configuration
     * (AP duplicates). No loss of user-defined AP configuration.
     */

    // Step 1–2: Load structure from file as a new project (Molecules mode)
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Chromium-popup/Bugs/ketcher-3.13.0-bugs/ketcher-saves-incorrect-attachment-points-configuration-for-new-nucleotides.ket',
    );

    // Step 3: Select the whole structure and open Create Monomer wizard
    await CommonLeftToolbar(page).areaSelectionTool();
    await selectAllStructuresOnCanvas(page);

    // Step 4: Select type Nucleotide Preset
    await LeftToolbar(page).createMonomer();

    const dialog = CreateMonomerDialog(page);
    const presetSection = NucleotidePresetSection(page);

    await dialog.selectType(MonomerType.NucleotidePreset);
    await presetSection.setName('ap');

    // Step 5: Configure fragments (Base/Sugar/Phosphate)

    // Small stabilize drags
    await CommonLeftToolbar(page).handTool();
    await page.mouse.move(600, 200);
    await dragMouseTo(page, 450, 250);
    await page.mouse.move(600, 200);
    await dragMouseTo(page, 450, 250);

    // --- Base ---
    await presetSection.setupBase({
      atomIds: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
      bondIds: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20],
    });

    // --- Sugar ---
    await presetSection.setupSugar({
      atomIds: [0, 1, 2, 3, 4, 5, 6, 7, 23],
      bondIds: [0, 1, 2, 3, 4, 5, 6, 7, 25],
    });

    // --- Phosphate ---
    await presetSection.setupPhosphate({
      atomIds: [8, 19, 20, 21, 22],
      bondIds: [21, 22, 23, 24],
    });

    // Step 6: Try to submit with invalid AP configuration (duplicates)
    await dialog.submit();

    // Visual verification: screenshot to check if AP configuration is preserved and error is shown
    await takeEditorScreenshot(page);

    // Close dialog to avoid affecting other tests
    await dialog.discard();
  });
});
