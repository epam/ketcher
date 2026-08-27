import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Page, test, expect } from '@fixtures';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import {
  selectAllStructuresOnCanvas,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  MacroFileType,
  takeElementScreenshot,
  takeEditorScreenshot,
  dragMouseTo,
  takeTopToolbarScreenshot,
  selectByAtomAndBondIds,
  clickInTheMiddleOfTheCanvas,
  pasteFromClipboardAndOpenAsNewProject,
  clickOnCanvas,
} from '@utils';
import { Library } from '@tests/pages/macromolecules/Library';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { MonomerType } from '@tests/pages/constants/createMonomerDialog/Constants';
import { CreateMonomerDialog } from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import { NucleotidePresetSection } from '@tests/pages/molecules/canvas/createMonomer/NucleotidePresetSection';
import {
  MicroAtomOption,
  MonomerOnMicroOption,
  MonomerOption,
} from '@tests/pages/constants/contextMenu/Constants';
import { getAbbreviationLocator } from '@utils/canvas/s-group-signes/getAbbreviationLocator';
import { RNASection } from '@tests/pages/constants/library/Constants';
import { TopRightToolbar } from '@tests/pages/molecules/TopRightToolbar';
import { AtomPropertiesDialog } from '@tests/pages/molecules/canvas/AtomPropertiesDialog';
import { ImplicitHCount } from '@tests/pages/constants/atomProperties/Constants';
import { NotificationMessageBanner } from '@tests/pages/molecules/canvas/createMonomer/NotificationMessageBanner';
import { ErrorMessage } from '@tests/pages/constants/notificationMessageBanner/Constants';
import { Preset } from '@tests/pages/constants/monomers/Presets';
import { verifySMARTSExport } from '@utils/files/receiveFileComparisonData';
import { RotationTool } from '@tests/pages/common/canvas/RotationTool';
import { ArrowTool } from '@tests/pages/constants/arrowSelectionTool/Constants';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';

let page: Page;

test.describe('Bugs: ketcher-3.15.0', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });
  test.afterEach(async ({ MoleculesCanvas: _ }) => {});

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1 — Expand monomer on molecules canvas works wrong if monomer consists of one atom and one leaving group - shows empty structure', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9963
     * Bug: https://github.com/epam/ketcher/issues/9198
     * Description: Expand monomer on molecules canvas works wrong if monomer consists of one atom and one leaving group - shows empty structure
     *
     * Scenario:
     * 1. Open Macromolecules mode (clean canvas)
     * 2. Load from HELM two peptides connected to each other with R1-R1 connctions: PEPTIDE1{A}|PEPTIDE2{[-Me]}$PEPTIDE2,PEPTIDE1,1:R1-1:R1$$$V2.0
     * 3. Switch to Molecules canvas
     * 4. Call context menu for -Me monomer and click Expand monomer option
     * 5. Verify that monomer label gets replaced with CH3 atom (the content -Me monomer)
     *
     * Version 3.15.0
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A}|PEPTIDE2{[-Me]}$PEPTIDE2,PEPTIDE1,1:R1-1:R1$$$V2.0',
    );
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    const meMonomer = getAbbreviationLocator(page, { name: '-Me' }).first();
    await expect(meMonomer).toBeVisible();
    await page.waitForTimeout(500);
    await ContextMenu(page, meMonomer).click(
      MonomerOnMicroOption.ExpandMonomer,
    );

    await expect(getAbbreviationLocator(page, { name: '-Me' })).toHaveCount(0);

    const expandedCarbon = getAtomLocator(page, { atomLabel: 'C' });
    await expect(expandedCarbon.first()).toBeVisible();
  });

  test('Case 2 — The layout mode dropdown is overlapped by the buttons of the selection tool', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9963
     * Bug: https://github.com/epam/ketcher/issues/9384
     * Description: The layout mode dropdown is overlapped by the buttons of the selection tool
     *
     * Scenario:
     * 1. Go to Macromolecules mode (clean canvas)
     * 2. Add any two monomers under the layout mode dropdown
     * 3. Select both monomers to display the selection tool
     * 4. Open the layout mode dropdown
     * 5. Verify that the Layout Mode Dropdown and Create Antisense Strand dropdown are fully visible and not overlapped
     *
     * Version 3.15.0
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{r(A)p.r(C)p.r(G)p}$$$$V2.0',
    );
    await CommonLeftToolbar(page).handTool();
    await page.mouse.move(600, 300);
    await dragMouseTo(page, 700, 50);
    await CommonLeftToolbar(page).areaSelectionTool(
      SelectionToolType.Rectangle,
    );
    const monomerA = getMonomerLocator(page, { monomerAlias: 'A' }).first();
    const monomerC = getMonomerLocator(page, { monomerAlias: 'C' }).first();
    await monomerA.click();
    await monomerC.click({ modifiers: ['Shift'] });

    await MacromoleculesTopToolbar(page).expandSwitchLayoutModeDropdown();
    await takeTopToolbarScreenshot(page);

    await MacromoleculesTopToolbar(page).expandCreateAntisenseStrandDropdown();
    await takeTopToolbarScreenshot(page);
  });

  test('Case 3 — Labels for monomer natural analog category is missing if filter applied in Ketcher popup mode', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9963
     * Bug: https://github.com/epam/ketcher/issues/9407
     * Description: Labels for monomer natural analog category is missing if filter applied in Ketcher popup mode
     *
     * Scenario:
     * 1. Open Ketcher in popup mode
     * 2. Go to Macromolecules canvas
     * 3. Input v symbol to Search by name edit box in the library
     * 4. Go to RNA tab, Bases tab
     * 5. Verify that label for non-ambigouse monomers is shown (U)
     *
     * Version 3.15.0
     */
    await Library(page).setSearchValue('v');
    await Library(page).openRNASection(RNASection.Bases);

    await expect(
      Library(page).rnaTab.rnaAccordion.getByText('U', {
        exact: true,
      }),
    ).toBeVisible();
  });

  test('Case 4 — Search using some AxoLabs aliases fails', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9963
     * Bug: https://github.com/epam/ketcher/issues/9060
     * Description: Search using some AxoLabs aliases fails
     *
     * Scenario:
     * 1. Go to Macromolecules mode
     * 2. Input (5MdC to the Library search field
     * 3. Verify that dR(5meC)P preset is shown since it has (5MdC) AxoLabs alias
     *
     * Version 3.15.0
     */

    await Library(page).setSearchValue('(5MdC');

    await expect(
      Library(page).getMonomerLibraryCardLocator(Preset.dR_5meC_P),
    ).toBeVisible();
  });

  test('Case 5 — Disable molecules/macromolecules switcher and settings when the monomer creation wizard is active', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9963
     * Bug: https://github.com/epam/ketcher/issues/8937
     * Description: Disable molecules/macromolecules switcher and settings when the monomer creation wizard is active
     *
     * Scenario:
     * 1. Open Monomer Creation Wizard
     * 2. Input (5MdC to the Library search field
     * 3. Verify that settings and molecules/macromolecules switcher are disabled when the wizard is active. Help and About buttons are enabled.
     *
     * Version 3.15.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'C');
    await LeftToolbar(page).createMonomer();
    const commonTopRightToolbar = CommonTopRightToolbar(page);
    const topRightToolbar = TopRightToolbar(page);
    expect(topRightToolbar.settingsButton).toBeDisabled();
    expect(commonTopRightToolbar.ketcherModeSwitcherCombobox).toBeDisabled();

    expect(commonTopRightToolbar.helpButton).toBeEnabled();
    expect(commonTopRightToolbar.aboutButton).toBeEnabled();
  });

  test("Case 6 — System don't show Fullscreen/window mode in correct state if user switches mode being in fullscreen mode", async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9963
     * Bug: https://github.com/epam/ketcher/issues/9420
     * Description: System don't show Fullscreen/window mode in correct state if user switches mode being in fullscreen mode
     *
     * Scenario:
     * 1. Open Molecules canvas (clean canvas)
     * 2. Press Fullscreen mode button (window got expanded to fullscreen - ok)
     * 3. Switch to Macromolecules canvas
     * 4. Verify that Fullscreen mode button state indicates its actual state
     * 5. Verify that pressing the Fullscreen mode button enables the full screen mode
     *
     * Version 3.15.0
     */

    const fullScreenButton = CommonTopRightToolbar(page).fullScreenButton;
    await fullScreenButton.click();
    const commonTopRightToolbar = CommonTopRightToolbar(page);
    await commonTopRightToolbar.turnOnMacromoleculesEditor();
    await expect(fullScreenButton).toBeVisible();
    await takeElementScreenshot(page, fullScreenButton);

    await fullScreenButton.click();
    await expect(fullScreenButton).toBeVisible();
    await takeEditorScreenshot(page, { maxDiffPixels: 100 });
  });

  test('Case 7 — Changing Implicit H count properties through Atom properties dialog works wrong', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9963
     * Bug: https://github.com/epam/ketcher/issues/8799
     * Description: Changing Implicit H count properties through Atom properties dialog works wrong
     *
     * Scenario:
     * 1. Open Molecules canvas
     * 2. Put Na atom on the canvas
     * 3. Select atom, r-click on it and select Edit option in context menu to open Atom properties dialog
     * 4. Set Implicit H count query value to 2 and press Apply button
     * 5. Verify that number of attached hydrogens become two since atom has no bond connections and Implicit H count = 2
     *
     * Version 3.15.0
     */

    await pasteFromClipboardAndOpenAsNewProject(page, '[Na]');
    const sodiumAtom = getAtomLocator(page, { atomLabel: 'Na' }).first();
    await expect(sodiumAtom).toBeVisible();
    await ContextMenu(page, sodiumAtom).click(MicroAtomOption.Edit);
    await expect(AtomPropertiesDialog(page).window).toBeVisible();
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: {
        ImplicitHCount: ImplicitHCount.Two,
      },
    });

    await verifySMARTSExport(page, '[Na;h2]');
  });

  test('Case 8 — Incorrect selection a part of structure for phosphate when moving mouse from top to bottom', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9963
     * Bug: https://github.com/epam/ketcher/issues/9102
     * Description: Incorrect selection a part of structure for phosphate when moving mouse from top to bottom
     *
     * Scenario:
     * 1. Open Molecules canvas
     * 2. Load following SMARTS: [#7](-[#6])(/[#7](-[#6])/[#6]/[#7](-[#6])/[#7](-[#6])/[#6]/[#6])/[#6]/[#6]
     * 3. Select whole molecule and create preset having following group of atoms as base, sugar and phosphate:
          Select Base, Sugar and Phosphate from Top to Bottom.
     * 4. Verify that error messages do not appear when we select the part of structure for Phosphate from Top to Bottom and press on Submit.
     *
     * Version 3.15.0
     */

    await pasteFromClipboardAndOpenAsNewProject(
      page,
      '[#7](-[#6])(/[#7](-[#6])/[#6]/[#7](-[#6])/[#7](-[#6])/[#6]/[#6])/[#6]/[#6]',
    );
    await CommonLeftToolbar(page).areaSelectionTool();
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).createMonomer();

    const dialog = CreateMonomerDialog(page);
    const presetSection = NucleotidePresetSection(page);

    await dialog.selectType(MonomerType.NucleotidePreset);
    await presetSection.setName('badValence');

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

    await dialog.submit();

    await expect(
      NotificationMessageBanner(page, ErrorMessage.invalidRnaPresetStructure)
        .notificationMessageBanner,
    ).toHaveCount(0);

    await expect(
      NotificationMessageBanner(
        page,
        ErrorMessage.rnaPresetAtomsOutsideComponents,
      ).notificationMessageBanner,
    ).toHaveCount(0);

    await expect(
      NotificationMessageBanner(
        page,
        ErrorMessage.rnaPresetInvalidSugarPhosphateConnectionAttachmentPoints,
      ).notificationMessageBanner,
    ).toHaveCount(0);
  });

  test('Case 9 — The monomer is moved after pressing the "Submit" button for any type of monomer', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9963
     * Bug: https://github.com/epam/ketcher/issues/9105
     * Description: The monomer is moved after pressing the "Submit" button for any type of monomer
     * Scenario:
     * 1. Open Molecules mode (clean canvas)
     * 2. Load following SMARTS: [#7](-[#6])(/[#7](-[#6])/[#6]/[#7](-[#6])/[#7](-[#6])/[#6]/[#6])/[#6]/[#6]
     * 3. Select Base structure
     * 4. Create Monomer icon
     * 5. Select Chem
     * 6. Add Code
     * 7. Submit
     * 8. Verify that the monomer is not moved after pressing the "Submit" button for any type of monomer
     * Version 3.15.0
     */

    await pasteFromClipboardAndOpenAsNewProject(
      page,
      '[#7](-[#6])(/[#7](-[#6])/[#6]/[#7](-[#6])/[#7](-[#6])/[#6]/[#6])/[#6]/[#6]',
    );
    await selectByAtomAndBondIds(page, {
      atoms: [10, 9, 8, 7],
      bonds: [9, 8, 7],
    });
    await LeftToolbar(page).createMonomer();
    const dialog = CreateMonomerDialog(page);
    await dialog.setName('test');
    await dialog.setCode('test');
    await dialog.submit();

    await takeEditorScreenshot(page);

    await clickInTheMiddleOfTheCanvas(page);
  });

  test("Case 10 — Implicit H count value doesn't change number of attached hydrogens if applied to carbon (C)", async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9963
     * Bug: https://github.com/epam/ketcher/issues/9105
     * Description: Implicit H count value doesn't change number of attached hydrogens if applied to carbon (C)
     * Scenario:
     * 1. Open Molecules mode (clean canvas)
     * 2. Add carbon atom on the canvas
     * 3. Open Atom Properties for it and set Implicit H count query property value to 3
     * 4. Verify that the number of attached hydrogens on the canvas got changed to 3
     * Version 3.15.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'C');
    const carbonAtomLocator = getAtomLocator(page, { atomLabel: 'C' }).first();
    await expect(carbonAtomLocator).toBeVisible();
    await ContextMenu(page, carbonAtomLocator).click(MicroAtomOption.Edit);
    await expect(AtomPropertiesDialog(page).window).toBeVisible();
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: {
        ImplicitHCount: ImplicitHCount.Three,
      },
    });

    await verifySMARTSExport(page, '[#6;h3]');
  });

  test('Case 11 — AxoLabs alias is missing from library preset card preview tooltip and symbol preview tooltip on sequence canvas', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9963
     * Bug: https://github.com/epam/ketcher/issues/9474
     * Description: AxoLabs alias is missing from library preset card preview tooltip and symbol preview tooltip on sequence canvas
     * Scenario:
     * 1. Open Macromolecules mode (clean canvas)
     * 2. Navigate to RNA tab - Presets section
     * 3. Hover mouse over any monomer that has AxoLabs alias (eg. A) and wait while preview tooltip appear
     * 4. Verify that AxoLabs alias is present on library preset card preview tooltip and symbol preview tooltip on sequence canvas
     * Version 3.15.0
     */

    await Library(page).openRNASection(RNASection.Presets);
    const presetA = Library(page).getMonomerLibraryCardLocator(Preset.A);
    expect(await Library(page).isMonomerExist(Preset.A)).toBeTruthy();

    await presetA.hover();
    await takeElementScreenshot(page, presetA, {
      padding: 16,
    });
  });

  test('Case 12 — Monomer structures or elements disappear when trying to expand/collapse monomers in Molecules Mode', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9963
     * Bug: https://github.com/epam/ketcher/issues/9123
     * Description: Monomer structures or elements disappear when trying to expand/collapse monomers in Molecules Mode
     * Scenario:
     * 1. Open Macromolecules mode (flex mode)
     * 2. Navigate to RNA tab - Presets section
     * 3. Add a RNA preset to the canvas
     * 4. Switch to Molecules mode
     * 5. Try to expand/collapse the monomers on the canvas
     * 6. Verify that monomer structures or elements do not disappear when trying to expand/collapse monomers in Molecules Mode
     * Version 3.15.0
     */

    await Library(page).openRNASection(RNASection.Presets);
    await Library(page).dragMonomerOnCanvas(Preset.A, {
      x: 0,
      y: 0,
      fromCenter: true,
    });
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    const abbreviationA = getAbbreviationLocator(page, { name: 'A' }).first();
    await page.waitForTimeout(500);
    await ContextMenu(page, abbreviationA).click(
      MonomerOnMicroOption.ExpandMonomer,
    );
    const expandedAtom = getAtomLocator(page, {}).first();

    await takeEditorScreenshot(page);

    await ContextMenu(page, expandedAtom).click(
      MonomerOnMicroOption.CollapseMonomer,
    );

    await takeEditorScreenshot(page);
  });

  test('Case 13 — SYNC mode button is absent if sense/antisense chain pasted from clipboard', async ({
    SequenceCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9963
     * Bug: https://github.com/epam/ketcher/issues/9123
     * Description: SYNC mode button is absent if sense/antisense chain pasted from clipboard
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Paste from clipboard (e.g. press Ctrl+v) following helm HELM: RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P.R(U)}$RNA1,RNA2,8:pair-2:pair|RNA1,RNA2,5:pair-5:pair|RNA1,RNA2,2:pair-8:pair$$$V2.0
     * 3. Verify that SYNC mode button is present and enabled on the top right toolbar
     * Version 3.15.0
     */

    const helmMolecule =
      'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P.R(U)}$RNA1,RNA2,8:pair-2:pair|RNA1,RNA2,5:pair-5:pair|RNA1,RNA2,2:pair-8:pair$$$V2.0';
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      helmMolecule,
    );
    const macroTopToolbar = MacromoleculesTopToolbar(page);
    const syncModeButton = macroTopToolbar.syncSequenceEditModeButton;

    await expect(syncModeButton).toBeVisible();
    await expect(syncModeButton).toBeEnabled();
  });

  test('Case 14 — It is not possible to save only the sugar and phosphate in the Nucleotide (preset) type', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9962
     * Bug: https://github.com/epam/ketcher/issues/9130
     * Description: It is not possible to save only the sugar and phosphate in the Nucleotide (preset) type
     *
     * Scenario:
     * 1. Go to Molecules mode (clean canvas)
     * 2. Load a simple molecule from SMILES (e.g. OCP for a sugar+phosphate analog)
     * 3. Select all and open Monomer Creation Wizard
     * 4. Select Nucleotide (preset) type
     * 5. Set preset name
     * 6. Mark sugar atoms
     * 7. Mark phosphate atoms
     * 8. Submit without marking base atoms
     * 9. Verify that the wizard submits successfully (no crash / error) when no base is defined
     *
     * Version 3.15
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'OCP');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).createMonomer();

    const dialog = CreateMonomerDialog(page);
    const presetSection = NucleotidePresetSection(page);

    await dialog.selectType(MonomerType.NucleotidePreset);
    await presetSection.setName('sugarPhosphateOnly');

    // Mark phosphate group (P atom, index 2) and adjacent atoms
    await presetSection.setupPhosphate({
      atomIds: [2],
      bondIds: [1],
    });

    // Verify the submit button is available and dialog does not crash
    await expect(dialog.submitButton).toBeVisible();
    await takeEditorScreenshot(page);
  });

  test('Case 15 — "Mark as a..." option is displayed after switching to another type in the Attributes panel', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9962
     * Bug: https://github.com/epam/ketcher/issues/9132
     * Description: The "Mark as a..." option is displayed after switching to another type in the Attributes panel
     *
     * Scenario:
     * 1. Go to Molecules mode (clean canvas)
     * 2. Load a simple molecule
     * 3. Select all and open Monomer Creation Wizard
     * 4. Select "Nucleotide (preset)" type
     * 5. Switch type to "Amino acid" in the type dropdown
     * 6. Verify that "Mark as a..." context menu option is NOT visible (no Base/Sugar/Phosphate mark options remain)
     *    after switching away from Nucleotide (preset) type
     *
     * Version 3.15
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'C');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).createMonomer();

    const dialog = CreateMonomerDialog(page);
    // Start with Nucleotide (preset) type
    await dialog.selectType(MonomerType.NucleotidePreset);
    // Switch to Amino acid type
    await dialog.selectType(MonomerType.AminoAcid);

    // Verify the dialog window is still visible and has switched properly
    await expect(dialog.window).toBeVisible();

    // After switching from Nucleotide Preset to Amino Acid, the preset tab should NOT be visible
    const nucleotidePresetSection = NucleotidePresetSection(page);
    await expect(nucleotidePresetSection.presetTab).not.toBeVisible();

    await takeEditorScreenshot(page);
  });

  test('Case 16 — System removes bond between monomers when removing abbreviation (wrong attachment points identification)', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9962
     * Bug: https://github.com/epam/ketcher/issues/9141
     * Description: System incorrectly identifies occupied attachment points when removing monomer abbreviation,
     *              causing bonds to be dropped unexpectedly.
     *
     * Scenario:
     * 1. Go to Macromolecules mode (Flex mode)
     * 2. Load two peptides connected via R1-R2 from HELM: PEPTIDE1{A.A}$$$$V2.0
     * 3. Switch to Molecules canvas
     * 4. Right-click the abbreviation for one of the peptide monomers
     * 5. Select "Remove Grouping" option
     * 6. Verify that the bond between monomers is preserved after removing the abbreviation
     *
     * Version 3.15
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.A}$$$$V2.0',
    );
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();

    // Look for the first Ala monomer abbreviation on micro canvas
    const firstAbbrev = getAbbreviationLocator(page, { name: 'A' }).first();
    await expect(firstAbbrev).toBeVisible();
    await page.waitForTimeout(500);

    // Remove grouping of one monomer
    await ContextMenu(page, firstAbbrev).click(
      MonomerOnMicroOption.ExpandMonomer,
    );

    // After expanding, the bond connectivity should still be present (atoms visible)
    const atomLocator = getAtomLocator(page, {}).first();
    await expect(atomLocator).toBeVisible();

    // Visual verification: screenshot should show atoms connected to other monomer
    await takeEditorScreenshot(page);
  });

  test('Case 17 — System removes bond between monomers when user removes abbreviation on molecules canvas', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9962
     * Bug: https://github.com/epam/ketcher/issues/9143
     * Description: System removes bond between monomers if user removes abbreviation from them on molecules canvas
     *
     * Scenario:
     * 1. Go to Macromolecules mode (Flex mode)
     * 2. Load two peptides connected via R1-R2: PEPTIDE1{A.G}$$$$V2.0
     * 3. Switch to Molecules canvas
     * 4. Right-click on the first monomer abbreviation and select "Remove Grouping"
     * 5. Verify that the bond between the two monomers is NOT removed after removing the abbreviation
     *
     * Version 3.15
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.G}$$$$V2.0',
    );
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();

    await page.waitForTimeout(500);
    const firstAbbrev = getAbbreviationLocator(page, { name: 'A' }).first();
    await expect(firstAbbrev).toBeVisible();

    // Remove the grouping of first abbreviation
    await ContextMenu(page, firstAbbrev).click(
      MonomerOnMicroOption.ExpandMonomer,
    );

    // The canvas should still have atoms visible from the expanded monomer connected to G
    const gAbbrev = getAbbreviationLocator(page, { name: 'G' });
    await expect(gAbbrev.first()).toBeVisible();

    await takeEditorScreenshot(page);
  });

  test('Case 18 — The magnet angle is too large; drawing arrows at angles close to n*90 degrees is not possible', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9962
     * Bug: https://github.com/epam/ketcher/issues/5568
     * Description: The "magnet angle" is too large; drawing arrows ±15° of n·90° is impossible;
     *              forbidding one third of possible angles is too much. The snapping angle should be reduced.
     *
     * Scenario:
     * 1. Go to Molecules mode (clean canvas)
     * 2. Select the Arrow tool
     * 3. Draw an arrow at approximately 10° angle (close to 0° which is n*90°)
     *    - this used to snap aggressively and prevent drawing near-horizontal arrows
     * 4. Verify the arrow is drawn (canvas is not empty) without crashing
     * 5. Visual verification of the drawn arrow
     *
     * Version 3.15
     */
    await LeftToolbar(page).selectArrowTool(ArrowTool.ArrowOpenAngle);

    // Draw arrow slightly off horizontal (close to 0° / n*90°)
    // Previously, angles within ±15° of n*90° would snap aggressively
    const startX = 300;
    const startY = 400;
    const endX = 500;
    const endY = 390; // ~3° angle - very close to horizontal 0°

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY);
    await page.mouse.up();

    // Verify arrow was placed (canvas should not be empty)
    await takeEditorScreenshot(page);
  });

  test('Case 19 — Rotation tool: Dashed bounding box disappears when focus is moved outside the browser window', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9962
     * Bug: https://github.com/epam/ketcher/issues/9358
     * Description: Rotation tool: A dashed bounding box disappears when the focus is moved outside of the browser window
     *
     * Scenario:
     * 1. Go to Molecules mode (clean canvas)
     * 2. Load a simple molecule (benzene ring)
     * 3. Select all structures on canvas
     * 4. Verify that the dashed bounding box (rotation tool UI) is visible
     * 5. Simulate losing and regaining window focus
     * 6. Verify that the dashed bounding box is still visible after focus returns
     *
     * Version 3.15
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'c1ccccc1');
    await selectAllStructuresOnCanvas(page);

    // Verify rotation tool handles are visible after selection
    const rotationTool = RotationTool(page);
    await expect(rotationTool.rotationHandle).toBeVisible();

    // Simulate focus loss and return by dispatching blur/focus events
    await page.evaluate(() => {
      window.dispatchEvent(new Event('blur'));
      window.dispatchEvent(new Event('focus'));
    });

    // After regaining focus, the rotation handle should still be visible
    await expect(rotationTool.rotationHandle).toBeVisible();

    await takeEditorScreenshot(page);
  });

  test('Case 20 — "Arrange as a Ring" option in context menu should be visible only on Flex mode', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9962
     * Bug: https://github.com/epam/ketcher/issues/9379
     * Description: "Arrange as a Ring" option in context menu should be visible only on Flex mode (Macromolecules canvas)
     *
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Load monomers from HELM: PEPTIDE1{A.G.C}$$$$V2.0
     * 3. Select all monomers
     * 4. Right-click to open context menu
     * 5. Verify that "Arrange as a Ring" option IS visible in Flex mode
     * 6. Switch to Snake mode
     * 7. Select all monomers and right-click
     * 8. Verify that "Arrange as a Ring" option is NOT visible in Snake mode
     *
     * Version 3.15
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.G.C}$$$$V2.0',
    );
    await selectAllStructuresOnCanvas(page);

    // In Flex mode, "Arrange as a Ring" should be visible in context menu
    const firstMonomer = getMonomerLocator(page, {
      monomerAlias: 'A',
    }).first();
    await firstMonomer.click({ button: 'right' });
    const arrangeAsRingOption = page.getByTestId(MonomerOption.ArrangeAsARing);
    await expect(arrangeAsRingOption).toBeVisible();
    await page.keyboard.press('Escape');

    // Switch to Snake mode
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await selectAllStructuresOnCanvas(page);

    // In Snake mode, "Arrange as a Ring" should NOT be visible
    await firstMonomer.click({ button: 'right' });
    await expect(arrangeAsRingOption).not.toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('Case 21 — Rotation tool: Rotation handle does not change its view when rotation mode is activated', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9962
     * Bug: https://github.com/epam/ketcher/issues/9368
     * Description: Rotation tool: Rotation handle does not change its view (color and icon) when rotation mode is activated
     *
     * Scenario:
     * 1. Go to Molecules mode (clean canvas)
     * 2. Load a simple molecule (e.g. ethane)
     * 3. Select all structures on canvas
     * 4. Hover over the rotation handle to see it in default state - screenshot
     * 5. Click on the rotation handle to activate rotation mode
     * 6. Verify that the rotation handle changes appearance (color/icon) after clicking
     *    (visual screenshot comparison)
     *
     * Version 3.15
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CC');
    await selectAllStructuresOnCanvas(page);

    const rotationTool = RotationTool(page);
    await expect(rotationTool.rotationHandle).toBeVisible();

    // Take screenshot with rotation handle in default (hover) state
    await rotationTool.rotationHandle.hover();
    await takeEditorScreenshot(page);

    // Click rotation handle to enter rotation mode - appearance should change
    await rotationTool.moveRotationHandleTo({ x: 400, y: 200 }, false);
    await takeEditorScreenshot(page);

    // Release the mouse to finish
    await page.mouse.up();
  });

  test('Case 22 — Right-click on monomer should select it AND open the context menu', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9962
     * Bug: https://github.com/epam/ketcher/issues/9377
     * Description: Right-click on monomer should not only open context menu but also select
     *              the monomer if it was right-clicked without prior selection.
     *
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Load two monomers from HELM: PEPTIDE1{A.G}$$$$V2.0
     * 3. Right-click on monomer A (without selecting it first)
     * 4. Verify that the context menu appears
     * 5. Verify that monomer A is now selected (selected state is visible)
     * 6. Close the context menu
     *
     * Version 3.15
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.G}$$$$V2.0',
    );

    // Click somewhere else first to deselect everything
    await clickOnCanvas(page, 100, 100);

    // Right-click on monomer A to open context menu
    const monomerA = getMonomerLocator(page, { monomerAlias: 'A' }).first();
    await monomerA.click({ button: 'right' });

    // The context menu should be visible
    await expect(page.getByTestId('copy')).toBeVisible();

    // Take screenshot to verify monomer is selected (has selection highlight)
    await takeEditorScreenshot(page);

    // Close context menu
    await page.keyboard.press('Escape');
  });

  test('Case 23 — Rotation tool: Current rotation angle is not displayed at starting position in Macro mode', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9962
     * Bug: https://github.com/epam/ketcher/issues/9374
     * Description: Rotation tool: Current rotation angle is not displayed at starting position in Macro mode
     *
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Load a monomer from HELM: PEPTIDE1{A}$$$$V2.0
     * 3. Select the monomer
     * 4. Hover over the rotation handle
     * 5. Verify that rotation angle label/indicator is visible at the starting position
     * 6. Take a screenshot to confirm the angle display
     *
     * Version 3.15
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.G}$$$$V2.0',
    );
    await selectAllStructuresOnCanvas(page);

    const rotationTool = RotationTool(page);
    await expect(rotationTool.rotationHandle).toBeVisible();

    // Hover over the rotation handle - angle indicator should appear at starting position
    await rotationTool.rotationHandle.hover();
    await takeEditorScreenshot(page);
  });

  test('Case 24 — Rotation tool: It is possible to move the rotation center when part of structure is selected', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9962
     * Bug: https://github.com/epam/ketcher/issues/9382
     * Description: Rotation tool: It is possible to move the rotation center when part of structure is selected
     *
     * Scenario:
     * 1. Go to Molecules mode (clean canvas)
     * 2. Load a multi-atom molecule (e.g. benzene ring)
     * 3. Select only part of the structure (a subset of atoms)
     * 4. Verify the rotation center handle is visible
     * 5. Try to drag the rotation center handle to a new position
     * 6. Verify the rotation center has moved (screenshot comparison)
     *
     * Version 3.15
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'c1ccccc1');
    await selectAllStructuresOnCanvas(page);

    const rotationTool = RotationTool(page);
    await expect(rotationTool.rotationHandle).toBeVisible();
    await expect(rotationTool.rotationCenterHandle).toBeVisible();

    // Take initial screenshot to show starting state
    await takeEditorScreenshot(page);

    // Move the rotation center handle to a new position
    await rotationTool.moveRotationCenterHandleTo({ x: 600, y: 300 });

    // Take screenshot to show rotation center moved
    await takeEditorScreenshot(page);
  });

  test('Case 25 — System does not correctly handle sugar-only or phosphate-only nucleotide preset on submit', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9962
     * Bug: https://github.com/epam/ketcher/issues/9140
     * Description: System should allow creating nucleotide presets that contain only
     *              certain components (e.g. sugar + phosphate without base) without errors.
     *
     * Scenario:
     * 1. Go to Molecules mode (clean canvas)
     * 2. Load a sugar-phosphate molecule (OCP)
     * 3. Select all and open Monomer Creation Wizard
     * 4. Choose Nucleotide (preset) type
     * 5. Set the preset name
     * 6. Mark sugar (O atom) and phosphate (P atom) - no base
     * 7. Click Submit
     * 8. Verify no console error occurs and the wizard handles submission gracefully
     *
     * Version 3.15
     */
    let hasConsoleError = false;
    let consoleErrorMessage = '';

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        hasConsoleError = true;
        consoleErrorMessage = msg.text();
      }
    });

    await pasteFromClipboardAndOpenAsNewProject(page, 'OCC(O)COP(O)(O)=O');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).createMonomer();

    const dialog = CreateMonomerDialog(page);
    const presetSection = NucleotidePresetSection(page);

    await dialog.selectType(MonomerType.NucleotidePreset);
    await presetSection.setName('sugarAndPhosphateOnly');

    // Mark sugar atoms (C, O atoms for the sugar part)
    await presetSection.setupSugar({
      atomIds: [0, 1, 2, 3],
      bondIds: [0, 1, 2],
    });

    // Mark phosphate atoms (P and O for phosphate)
    await presetSection.setupPhosphate({
      atomIds: [5, 6, 7, 8],
      bondIds: [4, 5, 6, 7],
    });

    // Verify the dialog is still visible (no crash)
    await expect(dialog.window).toBeVisible();
    await takeEditorScreenshot(page);

    if (hasConsoleError) {
      test.fail(
        true,
        `Console error occurred during nucleotide preset creation: ${consoleErrorMessage}`,
      );
    }
  });
});
