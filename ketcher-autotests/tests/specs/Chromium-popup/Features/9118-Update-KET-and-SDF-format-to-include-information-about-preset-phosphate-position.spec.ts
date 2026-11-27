import { test, Page } from '@fixtures';
import {
  openFileAndAddToCanvasAsNewProjectMacro,
  takeEditorScreenshot,
  takeMonomerLibraryScreenshot,
  readFileContent,
  updateMonomersLibrary,
  SdfFileFormat,
} from '@utils';
import { FileType, verifyFileExport } from '@utils/files/receiveFileComparisonData';
import { Library } from '@tests/pages/macromolecules/Library';
import { Preset } from '@tests/pages/constants/monomers/Presets';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';

const FEATURE_DATA_FOLDER =
  'KET/Chromium-popup/9118-Update-KET-and-SDF-format-to-include-information-about-preset-phosphate-position';
const SDF_DATA_FOLDER =
  'SDF/Chromium-popup/9118-Update-KET-and-SDF-format-to-include-information-about-preset-phosphate-position';

let page: Page;

test.describe('Update KET and SDF format to include preset phosphate position', () => {
  test.beforeAll(async ({ initFlexCanvas }) => {
    page = await initFlexCanvas();
  });

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test.beforeEach(async ({ FlexCanvas: _ }) => {});

  test('Case 1 - Verify that KET files include a new property specifying phosphate position for each preset', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12827
     * Description: Verify that KET files include a new property specifying phosphate position for each preset
     * Scenario:
     * 1. Switch to Macromolecules editor in Flex mode
     * 2. Drag the standard Preset A (Adenine) onto the canvas
     * 3. Export the structure as KET
     * 4. Verify the exported KET file includes a property specifying the phosphate position
     *
     * Version 3.15.0
     */
    await Library(page).dragMonomerOnCanvas(Preset.A, { x: 400, y: 300 });
    await verifyFileExport(
      page,
      `${FEATURE_DATA_FOLDER}/preset-A-with-phosphate-position-expected.ket`,
      FileType.KET,
    );
    await CommonTopLeftToolbar(page).clearCanvas();
  });

  test('Case 2 - Ensure that presets in the monomer library file are marked as Phosphate on the right/at the 3-prime terminal by default', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12827
     * Description: Ensure that presets in the monomer library are marked as Phosphate on the right/at the 3' terminal by default
     * Scenario:
     * 1. Switch to Macromolecules editor in Flex mode
     * 2. Drag the default library preset A (Adenine/Ribose/Phosphate) onto the canvas
     * 3. Export the structure as KET
     * 4. Verify the exported KET file contains information indicating the phosphate is on the right (3' terminal)
     *
     * Version 3.15.0
     */
    await Library(page).dragMonomerOnCanvas(Preset.A, { x: 400, y: 300 });
    await verifyFileExport(
      page,
      `${FEATURE_DATA_FOLDER}/preset-A-default-right-phosphate-expected.ket`,
      FileType.KET,
    );
    await CommonTopLeftToolbar(page).clearCanvas();
  });

  test('Case 3 - Validate that the R(G) preset is marked as Phosphate absent', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12827
     * Description: Validate that the R(G) nucleoside preset (no phosphate) is marked as Phosphate absent
     * Scenario:
     * 1. Switch to Macromolecules editor in Flex mode
     * 2. Drag the R(G) preset (nucleoside: Guanine + Ribose, no Phosphate) onto the canvas
     * 3. Export the structure as KET
     * 4. Verify the exported KET file contains no phosphate position property (phosphate absent)
     *
     * Version 3.15.0
     */
    await Library(page).dragMonomerOnCanvas(Preset.R_G, { x: 400, y: 300 });
    await verifyFileExport(
      page,
      `${FEATURE_DATA_FOLDER}/preset-R-G-absent-phosphate-expected.ket`,
      FileType.KET,
    );
    await CommonTopLeftToolbar(page).clearCanvas();
  });

  test('Case 4 - Confirm that SDF format data passed through the API contains the phosphate position information', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12827
     * Description: Confirm that SDF format data passed through the API contains the phosphate position information
     * Scenario:
     * 1. Switch to Macromolecules editor in Flex mode
     * 2. Drag the standard Preset A (Adenine) onto the canvas
     * 3. Export the structure as SDF (V3000)
     * 4. Verify the exported SDF file contains phosphate position information
     *
     * Version 3.15.0
     */
    await Library(page).dragMonomerOnCanvas(Preset.A, { x: 400, y: 300 });
    await verifyFileExport(
      page,
      `${SDF_DATA_FOLDER}/preset-A-with-phosphate-position-expected.sdf`,
      FileType.SDF,
      SdfFileFormat.v3000,
    );
    await CommonTopLeftToolbar(page).clearCanvas();
  });

  test('Case 5 - Test KET file handling with a preset having Phosphate on the left/at the 5-prime terminal', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12827
     * Description: Test KET file handling with a preset having Phosphate on the left/at the 5' terminal
     * Scenario:
     * 1. Switch to Macromolecules editor in Flex mode
     * 2. Open a KET file containing a nucleotide where the phosphate is connected at the 5' (left) terminal
     *    (sugar's R1 attachment point connects to phosphate's R2)
     * 3. Verify the structure is correctly rendered on the canvas
     * 4. Take a screenshot to confirm the layout (phosphate on the left of the sugar)
     *
     * Version 3.15.0
     */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      `${FEATURE_DATA_FOLDER}/preset-with-left-phosphate.ket`,
    );
    await takeEditorScreenshot(page, { hideMacromoleculeEditorScrollBars: true });
  });

  test('Case 6 - Test KET file handling with a preset having Phosphate on the right/at the 3-prime terminal', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12827
     * Description: Test KET file handling with a preset having Phosphate on the right/at the 3' terminal
     * Scenario:
     * 1. Switch to Macromolecules editor in Flex mode
     * 2. Open a KET file containing nucleotides where the phosphate is connected at the 3' (right) terminal
     *    (sugar's R2 attachment point connects to phosphate's R1)
     * 3. Verify the structure is correctly rendered on the canvas
     * 4. Take a screenshot to confirm the standard layout (phosphate on the right of the sugar)
     *
     * Version 3.15.0
     */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      `${FEATURE_DATA_FOLDER}/preset-with-right-phosphate.ket`,
    );
    await takeEditorScreenshot(page, { hideMacromoleculeEditorScrollBars: true });
  });

  test('Case 7 - Test KET file handling when the phosphate property is absent (interpreted as Phosphate absent)', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12827
     * Description: Test KET file handling when the phosphate monomer is absent (nucleoside only - sugar + base)
     * Scenario:
     * 1. Switch to Macromolecules editor in Flex mode
     * 2. Open a KET file containing a nucleoside (Guanine + Ribose, no Phosphate monomer)
     * 3. Verify the structure is correctly rendered on the canvas without a phosphate component
     * 4. Take a screenshot to confirm the nucleoside-only layout
     *
     * Version 3.15.0
     */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      `${FEATURE_DATA_FOLDER}/preset-with-absent-phosphate.ket`,
    );
    await takeEditorScreenshot(page, { hideMacromoleculeEditorScrollBars: true });
  });

  test.skip('Case 8 - Verify that updating a monomer with a left phosphate correctly updates the KET format', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12827
     * Description: Verify that updating a monomer with a left phosphate correctly updates the KET format
     * Scenario:
     * 1. Open a preset with a left phosphate position in the monomer editor/wizard
     * 2. Edit the preset's phosphate position through the UI
     * 3. Save the modified preset
     * 4. Export the structure as KET
     * 5. Verify the KET export reflects the updated phosphate position
     *
     * Cannot be automated at this time: Requires a UI workflow for editing the phosphate position
     * of an existing preset in the editor. No page object or helper currently exposes this
     * specific editing capability. See: https://github.com/epam/ketcher/issues/12827
     *
     * Version 3.15.0
     */
  });

  test.skip('Case 9 - Ensure the monomer library file still functions properly when all presets are marked as Phosphate on the right', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12827
     * Description: Ensure the monomer library file still functions properly when all presets are marked as Phosphate on the right
     * Scenario:
     * 1. Load a custom monomer library where all presets have phosphatePosition set to right
     * 2. Verify the library loads without errors
     * 3. Verify all presets are accessible and function as expected
     *
     * Cannot be automated at this time: Requires knowledge of the internal monomer library file
     * format after the phosphate position feature is fully implemented, including the exact
     * property name and schema for marking all presets as Phosphate on the right.
     * See: https://github.com/epam/ketcher/issues/12827
     *
     * Version 3.15.0
     */
  });

  test('Case 10 - Check that the API correctly interprets and processes presets with different phosphate positions in the SDF format', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12827
     * Description: Check that the API correctly interprets and processes presets with different phosphate positions in the SDF format
     * Scenario:
     * 1. Switch to Macromolecules editor in Flex mode
     * 2. Read an SDF file that contains preset data with phosphate position information
     * 3. Call ketcher.updateMonomersLibrary() with the SDF data via the API
     * 4. Verify the library is updated and the preset(s) with phosphate positions appear correctly
     * 5. Take a library screenshot to verify the loaded preset is visible
     *
     * Version 3.15.0
     */
    const sdfContent = await readFileContent(
      `${SDF_DATA_FOLDER}/presets-with-different-phosphate-positions.sdf`,
    );
    await updateMonomersLibrary(page, sdfContent, { format: 'sdf' });
    await takeMonomerLibraryScreenshot(page);
  });

  test.skip('Case 11 - Confirm system stability when an unexpected phosphate position value is encountered in a KET file', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12827
     * Description: Confirm system stability when an unexpected phosphate position value is encountered in a KET file
     * Scenario:
     * 1. Load a KET file that contains a monomer group template with an invalid/unexpected
     *    phosphatePosition value (e.g., "center" instead of "left" or "right")
     * 2. Verify the system does not crash
     * 3. Verify the editor remains functional after loading the invalid file
     *
     * Cannot be automated at this time: Requires knowledge of the exact property name and
     * schema for the phosphate position field in the KET monomer group template format,
     * which is part of the feature being implemented in issue #9118. The IKetMonomerGroupTemplate
     * interface does not yet include the phosphatePosition field, making it impossible to
     * construct a valid test file with an invalid value.
     * See: https://github.com/epam/ketcher/issues/12827
     *
     * Version 3.15.0
     */
  });

  test('Case 12 - Verify there are no changes in the display or behavior in Ketcher when phosphate-specific properties are absent as expected', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12827
     * Description: Verify there are no changes in the display or behavior when phosphate position properties are absent
     * Scenario:
     * 1. Switch to Macromolecules editor in Flex mode
     * 2. Open a KET file that does NOT contain the new phosphate position property
     *    (backward compatibility test using an existing KET file format)
     * 3. Verify the structure is rendered correctly, identical to expected behavior
     * 4. Take a screenshot to confirm the display has not changed from expected behavior
     *
     * Version 3.15.0
     */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      `${FEATURE_DATA_FOLDER}/preset-without-phosphate-position-property.ket`,
    );
    await takeEditorScreenshot(page, { hideMacromoleculeEditorScrollBars: true });
  });

  test.skip('Case 13 - Test correct rendering of a molecule when switching phosphate positions between 5-prime and 3-prime terminal in the KET editor', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12827
     * Description: Test correct rendering of a molecule when switching phosphate positions between 5' and 3' terminal in the KET editor
     * Scenario:
     * 1. Open a preset with right phosphate position in the editor
     * 2. Switch the phosphate position to left (5' terminal) through the UI
     * 3. Verify the canvas rendering updates correctly to show the phosphate on the left
     * 4. Switch back to right (3' terminal) and verify again
     *
     * Cannot be automated at this time: Requires a UI workflow for switching/editing the
     * phosphate position of a preset within the KET editor. No page object or helper currently
     * exposes this specific editing capability for toggling phosphate position.
     * See: https://github.com/epam/ketcher/issues/12827
     *
     * Version 3.15.0
     */
  });

  test.skip('Case 14 - Validate that the KET export function accurately reflects updated phosphate property values', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12827
     * Description: Validate that the KET export function accurately reflects updated phosphate property values
     * Scenario:
     * 1. Open a preset with a default phosphate position
     * 2. Edit the phosphate position through the monomer editor or preset wizard
     * 3. Export the modified preset as KET
     * 4. Verify the exported KET file accurately reflects the updated phosphate position value
     *
     * Cannot be automated at this time: Requires a UI workflow to edit a preset's phosphate
     * position through the monomer editor or RNA builder. No page object or helper currently
     * exposes editing the phosphate position of an existing preset.
     * See: https://github.com/epam/ketcher/issues/12827
     *
     * Version 3.15.0
     */
  });

  test.skip('Case 15 - Ensure compatibility and accurate interpretation of KET files with phosphate properties across different versions of the software', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12827
     * Description: Ensure compatibility and accurate interpretation of KET files with phosphate properties across different versions
     * Scenario:
     * 1. Load KET files generated by different versions of Ketcher (with and without phosphate position property)
     * 2. Verify each file is correctly interpreted and rendered
     * 3. Verify backward compatibility: files without the new property render identically to the pre-feature behavior
     * 4. Verify forward compatibility is maintained (no data loss)
     *
     * Cannot be automated at this time: Requires access to KET files generated by multiple
     * specific Ketcher versions, including pre-feature versions without the phosphate position
     * property and post-feature versions with it. Version-specific test artifacts are not
     * available as automated test data. This scenario is better covered by manual regression
     * testing across version upgrades.
     * See: https://github.com/epam/ketcher/issues/12827
     *
     * Version 3.15.0
     */
  });
});
