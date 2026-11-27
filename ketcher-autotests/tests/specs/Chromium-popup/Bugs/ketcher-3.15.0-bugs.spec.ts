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
  openFileAndAddToCanvasAsNewProject,
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
import { Sugar } from '@tests/pages/constants/monomers/Sugars';
import { Phosphate } from '@tests/pages/constants/monomers/Phosphates';
import { ConfirmationMessageDialog } from '@tests/pages/molecules/canvas/ConfirmationMessageDialog';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { EditAbbreviationDialog } from '@tests/pages/molecules/canvas/EditAbbreviation';
import { getArrowLocator } from '@utils/canvas/arrow-signes/getArrowLocator';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';
import { NucleotidePresetTab } from '@tests/pages/molecules/canvas/createMonomer/constants/nucleiotidePresetSection/Constants';
import { SequenceSymbolOption } from '@tests/pages/constants/contextMenu/Constants';
import { updateMonomersLibraryAndGetLoggedErrors } from '@utils/library/updateLibrary';
import { getSymbolLocator } from '@utils/macromolecules/monomer';
import {
  cutToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
} from '@utils/canvas/helpers';

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
     * 2. Load a simple molecule from SMILES (e.g. CCCCCC)
     * 3. Click on Create monomer button on the Left panel
     * 4. Choose Nucleotide (preset) type on the Attributes panel
     * 5. Set preset name
     * 6. Select half of the structure and mark is as Sugar (press Mark as sugar button at Sugar tab at Attributes panel)
     * 7. Mark phosphate atoms
     * 8. Select another half of the structure and Mark as Phosphate (press Mark as phosphate button at Phosphate tab at Attributes panel)
     * 9. Verify that the wizard submits successfully (no crash / error) when no base is defined
     *
     * Version 3.15.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
    await LeftToolbar(page).createMonomer();

    const dialog = CreateMonomerDialog(page);
    const presetSection = NucleotidePresetSection(page);

    await dialog.selectType(MonomerType.NucleotidePreset);
    await presetSection.setName('sugarPhosphateOnly');

    await presetSection.setupSugar({
      atomIds: [0, 1, 2],
      bondIds: [0, 1],
      code: Sugar.Sugar.alias,
      name: 'S1',
      HELMAlias: 'SugAlias',
    });

    await presetSection.setupPhosphate({
      atomIds: [3, 4, 5],
      bondIds: [3, 4],
      code: Phosphate.Phosphate.alias,
      name: 'P1',
      HELMAlias: 'PhosAlias',
    });

    await dialog.submit();
    await takeElementScreenshot(page, getAtomLocator(page, { atomId: 3 }), {
      padding: 100,
    });
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
     * 2. Add to the Canvas C(C)CC(C)CCCC(C)CCC
     * 3. Select all and open Monomer Creation Wizard
     * 4. Select "Nucleotide (preset)" type
     * 5. Switch type to "Amino acid" in the type dropdown
     * 6. Verify that "Mark as a..." context menu option is NOT visible (no Base/Sugar/Phosphate mark options remain)
     *    after switching away from Nucleotide (preset) type
     *
     * Version 3.15.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'C(C)CC(C)CCCC(C)CCC');
    await LeftToolbar(page).createMonomer();
    const confirmDialog = ConfirmationMessageDialog(page);
    const dialog = CreateMonomerDialog(page);
    await dialog.selectType(MonomerType.NucleotidePreset);
    await dialog.selectType(MonomerType.AminoAcid);
    await confirmDialog.ok();
    await selectAllStructuresOnCanvas(page);
    await ContextMenu(page, getAtomLocator(page, { atomId: 0 })).open();
    await takeEditorScreenshot(page);
  });

  test('Case 16 — System removes atoms that holds unoccopied leaving groups if user removes abbreviation from monomer on molecules canvas', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9962
     * Bug: https://github.com/epam/ketcher/issues/9141
     * Description: System removes atoms that holds unoccopied leaving groups
     *              if user removes abbreviation from monomer on molecules canvas.
     *
     * Scenario:
     * 1. Go to Macromolecules mode (Flex mode)
     * 2. Load from HELM two phosphate connected to each other: RNA1{p}|RNA2{p}$RNA1,RNA2,1:R2-1:R1$$$V2.0
     * 3. Switch to Molecules canvas
     * 4. Select all monomers (p) and expand them using context menu (Expand monomers option)
     * 5. Press Erase button and remove abbreviation from each monomer
     * 6. Verify that abbreviation got removed, all atoms remain in place
     *
     * Version 3.15.0
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{p}|RNA2{p}$RNA1,RNA2,1:R2-1:R1$$$V2.0',
    );
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    const firstAbbrev = getAbbreviationLocator(page, { name: 'P' }).first();
    await selectAllStructuresOnCanvas(page);
    await ContextMenu(page, firstAbbrev).click(
      MonomerOnMicroOption.ExpandMonomers,
    );
    await takeElementScreenshot(page, getAtomLocator(page, { atomId: 0 }), {
      padding: 250,
    });
  });

  test('Case 17 — System removes bond between monomers when user removes abbreviation on molecules canvas', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9962
     * Bug: https://github.com/epam/ketcher/issues/9143
     * Description: System removes bond between monomers if user removes abbreviation from them on molecules canvas
     *
     * Scenario:
     * 1. Go to Macromolecules mode (Flex mode)
     * 2. Load from HELM two phosphate connected to each other: RNA1{p}|RNA2{p}$RNA1,RNA2,1:R2-1:R1$$$V2.0
     * 3. Switch to Molecules canvas
     * 4. Right-click on the first monomer abbreviation and select "Remove Grouping"
     * 5. Verify that the bond between the two monomers is NOT removed after removing the abbreviation
     *
     * Version 3.15.0
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{p}|RNA2{p}$RNA1,RNA2,1:R2-1:R1$$$V2.0',
    );
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();

    const firstAbbrev = getAbbreviationLocator(page, { name: 'P' }).first();
    await selectAllStructuresOnCanvas(page);
    await ContextMenu(page, firstAbbrev).click(
      MonomerOnMicroOption.ExpandMonomers,
    );
    await clickInTheMiddleOfTheCanvas(page);
    await CommonLeftToolbar(page).erase();
    await getAtomLocator(page, { atomId: 0 }).click({
      position: { x: 0, y: 10 },
      force: true,
    });
    await EditAbbreviationDialog(page).removeAbbreviation();

    await getAtomLocator(page, { atomId: 5 }).click({
      position: { x: -10, y: 0 },
      force: true,
    });
    await EditAbbreviationDialog(page).removeAbbreviation();

    await IndigoFunctionsToolbar(page).layout();
    await takeElementScreenshot(page, getAtomLocator(page, { atomId: 0 }), {
      padding: 100,
    });
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
     * Version 3.15.0
     */
    await LeftToolbar(page).selectArrowTool(ArrowTool.ArrowOpenAngle);

    // Draw arrow slightly off horizontal (close to 0° / n*90°)
    // Previously, angles within ±15° of n*90° would snap aggressively
    const startX = 300;
    const startY = 400;
    const endX = 500;
    const endY = 380;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY);
    await page.mouse.up();

    // Verify arrow was placed (canvas should not be empty)
    await takeElementScreenshot(page, getArrowLocator(page, { arrowId: 1 }), {
      padding: 100,
    });
  });

  test('Case 19 — Rotation tool: Dashed bounding box disappears when focus is moved outside the browser window', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9962
     * Bug: https://github.com/epam/ketcher/issues/9358
     * Description: Rotation tool: A dashed bounding box disappears when the focus is moved outside of the browser window
     *
     * Scenario:
     * 1. Go to Molecules mode (clean canvas)
     * 2. Add any two monomers
     * 3. Select both monomers to display the rotation tool (a dashed bounding box with rotation, flip, and delete options)
     * 4. Move focus outside of the browser (or switch to another browser tab)
     * 6. Verify that the dashed bounding box is still visible after focus returns
     *
     * Version 3.15.0
     */
    await clickInTheMiddleOfTheCanvas(page);
    await Library(page).switchToPeptidesTab();
    await Library(page).clickMonomerAutochain(Peptide.A);
    await Library(page).clickMonomerAutochain(Peptide.C);
    await selectAllStructuresOnCanvas(page);

    // Verify rotation tool handles are visible after selection
    const rotationTool = RotationTool(page);
    await expect(rotationTool.rotationHandle).toBeVisible();

    // Simulate focus loss and return by dispatching blur/focus events
    await page.evaluate(() => {
      globalThis.dispatchEvent(new Event('blur'));
      globalThis.dispatchEvent(new Event('focus'));
    });

    // After regaining focus, the rotation handle should still be visible
    await expect(rotationTool.rotationHandle).toBeVisible();
    await takeElementScreenshot(
      page,
      getMonomerLocator(page, { monomerAlias: 'C' }),
      { paddingWidth: 100, paddingHeight: 40 },
    );
  });

  test('Case 20 — "Arrange as a Ring" option in context menu should be visible only on Flex mode', async ({
    SnakeCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9962
     * Bug: https://github.com/epam/ketcher/issues/9379
     * Description: "Arrange as a Ring" option in context menu should be visible only on Flex mode (Macromolecules canvas)
     *
     * Scenario:
     * 1. Open Macromolecules canvas - Snake mode (clean canvas)
     * 2. Load monomers from HELM: PEPTIDE1{A.A.A.A}$PEPTIDE1,PEPTIDE1,4:R2-1:R1$$$V2.0
     * 3. Select all monomers
     * 4. Right-click to open context menu
     * 5. Verify that "Arrange as a Ring" option is NOT visible in Snake mode
     *
     * Version 3.15.0
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.A.A.A}$PEPTIDE1,PEPTIDE1,4:R2-1:R1$$$V2.0',
    );
    await selectAllStructuresOnCanvas(page);
    const firstMonomer = getMonomerLocator(page, {
      monomerAlias: 'A',
    }).first();

    const arrangeAsARingPresent = await ContextMenu(
      page,
      firstMonomer,
    ).isOptionVisible(MonomerOption.ArrangeAsARing);
    await expect(arrangeAsARingPresent).toBe(false);
  });

  test('Case 21 — Rotation tool: Rotation handle does not change its view when rotation mode is activated', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9962
     * Bug: https://github.com/epam/ketcher/issues/9368
     * Description: Rotation tool: Rotation handle does not change its view (color and icon) when rotation mode is activated
     *
     * Scenario:
     * 1. Go to Macromolecules mode (clean canvas)
     * 2. Add any two monomers
     * 3. Select both monomers to display the rotation tool
     * 4. Click on the rotation handle to activate rotation mode
     * 5. Verify that the rotation handle changes appearance (color/icon) after clicking
     *    (visual screenshot comparison)
     *
     * Version 3.15.0
     */
    await Library(page).switchToPeptidesTab();
    await Library(page).clickMonomerAutochain(Peptide.A);
    await Library(page).clickMonomerAutochain(Peptide.C);
    await CommonLeftToolbar(page).handTool();
    await page.mouse.move(300, 300);
    await dragMouseTo(page, 500, 500);
    await CommonLeftToolbar(page).areaSelectionTool();
    await selectAllStructuresOnCanvas(page);

    const rotationTool = RotationTool(page);

    // Take screenshot with rotation handle in default (hover) state
    await rotationTool.rotationHandle.hover();
    await takeElementScreenshot(
      page,
      getMonomerLocator(page, { monomerAlias: 'A' }),
      { padding: 100 },
    );

    // Click rotation handle to enter rotation mode - appearance should change
    await rotationTool.moveRotationHandleTo({ x: 400, y: 200 }, false);

    await takeElementScreenshot(
      page,
      getMonomerLocator(page, { monomerAlias: 'A' }),
      { padding: 100 },
    );
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
     * 2. Load monomer from HELM: PEPTIDE1{A}$$$$V2.0
     * 3. Right-click on monomer A (without selecting it first)
     * 4. Verify that the context menu appears
     * 5. Verify that monomer A is now selected (selected state is visible)
     *
     * Version 3.15.0
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A}$$$$V2.0',
    );
    await clickOnCanvas(page, 100, 100);
    const monomerA = getMonomerLocator(page, { monomerAlias: 'A' });
    await ContextMenu(page, monomerA).open();
    await ContextMenu(page, monomerA).hover(MonomerOption.Copy);

    await takeElementScreenshot(page, monomerA, { padding: 100 });
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
     * 2. Add any two monomers
     * 3. Select the monomer
     * 4. Hover over the rotation handle
     * 5. Verify that rotation angle label/indicator is visible at the starting position
     * 6. Take a screenshot to confirm the angle display
     *
     * Version 3.15.0
     */
    await Library(page).switchToPeptidesTab();
    await Library(page).clickMonomerAutochain(Peptide.A);
    await Library(page).clickMonomerAutochain(Peptide.C);
    await CommonLeftToolbar(page).handTool();
    await page.mouse.move(300, 300);
    await dragMouseTo(page, 500, 500);
    await CommonLeftToolbar(page).areaSelectionTool();
    await selectAllStructuresOnCanvas(page);

    const rotationTool = RotationTool(page);
    await rotationTool.rotationHandle.hover();
    await rotationTool.moveRotationHandleTo({ x: 400, y: 200 }, false);

    const monomerC = getMonomerLocator(page, { monomerAlias: 'C' });
    await takeElementScreenshot(page, monomerC, { padding: 200 });
  });

  test('Case 24 — Rotation tool: It is possible to move the rotation center when part of structure is selected', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9962
     * Bug: https://github.com/epam/ketcher/issues/9382
     * Description: Rotation tool: It is possible to move the rotation center when part of structure is selected
     *
     * Scenario:
     * 1. Go to Macromolecules mode (clean canvas)
     * 2. Open from file: moving rotation center
     * 3. Select part of the structure to display the rotation tool
     * 4. Try to move rotation center to another location
     *
     * Version 3.15.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Bugs/moving.rotation.center.ket',
    );
    const monomerR = getMonomerLocator(page, { monomerAlias: 'R' });
    const monomer5meC = getMonomerLocator(page, { monomerAlias: '5meC' });
    await monomerR.dragTo(monomer5meC, {
      sourcePosition: { x: -10, y: 10 },
      targetPosition: { x: 20, y: -20 },
      force: true,
    });

    const rotationTool = RotationTool(page);
    await expect(rotationTool.rotationHandle).toBeVisible();
    await expect(rotationTool.rotationCenterHandle).toBeVisible();
    await rotationTool.moveRotationCenterHandleTo({ x: 600, y: 300 });

    await takeElementScreenshot(page, monomer5meC, { padding: 200 });
  });

  test('Case 25 — Structure selection after moving the entire Structure is incorrect', async ({
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
     * Version 3.15.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Bugs/movingStructureSelection.ket',
    );

    const monomerUpperRight = getAtomLocator(page, { atomId: 10 });
    const monomerLowerLeft = getAtomLocator(page, { atomId: 13 });
    await monomerUpperRight.dragTo(monomerLowerLeft, {
      sourcePosition: { x: 30, y: -30 },
      targetPosition: { x: -30, y: 30 },
      force: true,
    });
    await selectAllStructuresOnCanvas(page);
    await monomerUpperRight.hover();
    await dragMouseTo(page, 600, 200);
    await monomerUpperRight.dragTo(monomerLowerLeft, {
      sourcePosition: { x: 30, y: -30 },
      targetPosition: { x: -30, y: 30 },
      force: true,
    });

    await takeElementScreenshot(page, getAtomLocator(page, { atomId: 21 }), {
      padding: 200,
    });
  });

  test('Case 26 — Monomer layout inside r-group box become corrupted if user grabs and moves bond between monomers', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9964
     * Bug: https://github.com/epam/ketcher/issues/7021
     * Description: Monomer layout inside r-group box become corrupted if user grabs and moves bond between monomers
     *
     * Scenario:
     * 1. Go to Macro - Flex mode (clean canvas)
     * 2. Load from HELM: PEPTIDE1{A.C}$$$$V2.0
     * 3. Go to Molecules mode
     * 4. Select all structure, grab its bond and move it aside
     * 5. Expand all monomers
     * 6. Verify that monomer layout inside r-group box remains correct
     *
     * Version 3.15.0
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.C}$$$$V2.0',
    );
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await CommonLeftToolbar(page).areaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await selectAllStructuresOnCanvas(page);
    const abbreviationA = getAbbreviationLocator(page, { name: 'A' }).first();
    await expect(abbreviationA).toBeVisible();
    const box = await abbreviationA.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width + 20, box.y + box.height / 2);
      await dragMouseTo(page, box.x + box.width + 20, box.y + 150);
    }
    await ContextMenu(
      page,
      getAbbreviationLocator(page, { name: 'A' }).first(),
    ).click(MonomerOnMicroOption.ExpandMonomers);
    await takeEditorScreenshot(page);
  });

  test('Case 27 — Unable to paste using Ctrl+V chain from clipboard after clear canvas action', async ({
    SequenceCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9964
     * Bug: https://github.com/epam/ketcher/issues/6476
     * Description: Unable to paste using Ctrl+V chain from clipboard after clear canvas action
     *
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from HELM: RNA1{R(U)P.R(U)}|RNA2{R(A)P.R(A)}$RNA2,RNA1,5:pair-2:pair$$$V2.0
     * 3. Right-click on A symbol and select "Edit sequence"
     * 4. Press Clear Canvas button
     * 5. Paste the same HELM using Ctrl+V
     * 6. Verify that no errors appear and structure is pasted
     *
     * Version 3.15.0
     */
    const helm =
      'RNA1{R(U)P.R(U)}|RNA2{R(A)P.R(A)}$RNA2,RNA1,5:pair-2:pair$$$V2.0';
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      helm,
    );
    const symbolA = getSymbolLocator(page, { symbolAlias: 'A' }).first();
    await ContextMenu(page, symbolA).click(SequenceSymbolOption.EditSequence);
    await CommonTopLeftToolbar(page).clearCanvas();
    await page.evaluate(async (text) => {
      await navigator.clipboard.writeText(text);
    }, helm);
    await pasteFromClipboardByKeyboard(page);

    await expect(
      getSymbolLocator(page, { symbolAlias: 'A' }).first(),
    ).toBeVisible();
  });

  test('Case 28 — Update the hint for preset components defining in the monomer creation wizard', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9964
     * Bug: https://github.com/epam/ketcher/issues/9542
     * Description: Update the hint for preset components defining in the monomer creation wizard
     *
     * Scenario:
     * 1. Go to Molecules mode, load CCCCCC
     * 2. Open Monomer Creation Wizard and select Nucleotide (preset) type
     * 3. Open Base, Sugar and Phosphate tabs one by one
     * 4. Verify hints: "Select all atoms that form the base.", "...the sugar.", "...the phosphate."
     *
     * Version 3.15.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
    await LeftToolbar(page).createMonomer();
    await CreateMonomerDialog(page).selectType(MonomerType.NucleotidePreset);
    const presetSection = NucleotidePresetSection(page);

    await presetSection.openTab(NucleotidePresetTab.Base);
    await expect(
      page.getByText('Select all atoms that form the base.'),
    ).toBeVisible();
    await presetSection.openTab(NucleotidePresetTab.Sugar);
    await expect(
      page.getByText('Select all atoms that form the sugar.'),
    ).toBeVisible();
    await presetSection.openTab(NucleotidePresetTab.Phosphate);
    await expect(
      page.getByText('Select all atoms that form the phosphate.'),
    ).toBeVisible();
  });

  test('Case 29 — Scrollbar appears unnecessarily in Create Monomer attributes panel after selecting Type', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9964
     * Bug: https://github.com/epam/ketcher/issues/8402
     * Description: Scrollbar appears unnecessarily in "Create Monomer" attributes panel after selecting Type, and disappears when expanding Aliases
     *
     * Scenario:
     * 1. Load a structure and open Create Monomer wizard
     * 2. Select Amino acid type
     * 3. Verify that no vertical scrollbar appears in the Attributes panel
     *
     * Version 3.15.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).createMonomer();
    const dialog = CreateMonomerDialog(page);
    await dialog.selectType(MonomerType.AminoAcid);

    await takeElementScreenshot(page, dialog.window, { padding: 10 });
  });

  test('Case 30 — The "File format" drop-down does not open in the "Save Structure" window in the full-screen mode', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9964
     * Bug: https://github.com/epam/ketcher/issues/4248
     * Description: The "File format" drop-down does not open in the "Save Structure" window in the full-screen mode
     *
     * Scenario:
     * 1. Launch Ketcher and draw any structure
     * 2. Click on the "Fullscreen mode" button
     * 3. Click on the "Save as" button
     * 4. Select any file format in the "File format" drop-down
     * 5. Verify that the format is selected and the preview is shown
     *
     * Version 3.15.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await CommonTopRightToolbar(page).fullScreen();
    await CommonTopLeftToolbar(page).saveFile();
    const saveDialog = SaveStructureDialog(page);
    await saveDialog.chooseFileFormat(MoleculesFileFormatType.MDLMolfileV3000);

    await expect(saveDialog.saveStructureTextarea).toContainText('V3000');
    await saveDialog.cancel();
    await CommonTopRightToolbar(page).fullScreen();
  });

  test('Case 31 — HELM (and IDT) alias collision should cause error in console', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9964
     * Bug: https://github.com/epam/ketcher/issues/8394
     * Description: HELM (and IDT) alias collision should cause error in console
     *
     * Scenario:
     * 1. Open Macromolecules - Flex mode (clean canvas)
     * 2. Load sugar Sugar2 with HELM alias Sugar1_HELM through ketcher.updateMonomersLibrary
     * 3. Load sugar Sugar3 with the same HELM alias
     * 4. Verify that error with the monomer name is thrown/logged for the second sugar
     *
     * Version 3.15.0
     */
    const buildSugar = (name: string) =>
      `\n  -INDIGO-10092512212D\n\n  0  0  0  0  0  0  0  0  0  0  0 V3000\nM  V30 BEGIN CTAB\nM  V30 COUNTS 1 0 0 0 0\nM  V30 BEGIN ATOM\nM  V30 1 ${name} 10.4962 -10.55 0.0 0 CLASS=SUGAR SEQID=1\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 END BOND\nM  V30 END CTAB\nM  V30 BEGIN TEMPLATE\nM  V30 TEMPLATE 1 SUGAR/${name}/${name} NATREPLACE=SUGAR/R\nM  V30 BEGIN CTAB\nM  V30 COUNTS 14 13 4 0 0\nM  V30 BEGIN ATOM\nM  V30 1 H -5.196 0.75 0.0 0\nM  V30 2 C -4.33 0.25 0.0 0\nM  V30 3 C -3.464 0.75 0.0 0\nM  V30 4 C -2.598 0.25 0.0 0\nM  V30 5 C -1.732 0.75 0.0 0\nM  V30 6 C -0.866 0.25 0.0 0\nM  V30 7 C 0.0 0.75 0.0 0\nM  V30 8 C 0.866 0.25 0.0 0\nM  V30 9 C 1.732 0.75 0.0 0\nM  V30 10 C 2.598 0.25 0.0 0\nM  V30 11 C 3.464 0.75 0.0 0\nM  V30 12 C 4.33 0.25 0.0 0\nM  V30 13 H 5.196 0.75 0.0 0\nM  V30 14 H -4.33 -0.75 0.0 0\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 1 1 2\nM  V30 2 1 2 3\nM  V30 3 1 3 4\nM  V30 4 1 4 5\nM  V30 5 1 5 6\nM  V30 6 1 6 7\nM  V30 7 1 7 8\nM  V30 8 1 8 9\nM  V30 9 1 9 10\nM  V30 10 1 10 11\nM  V30 11 1 11 12\nM  V30 12 1 12 13\nM  V30 13 1 2 14\nM  V30 END BOND\nM  V30 BEGIN SGROUP\nM  V30 1 SUP 1 ATOMS=(1 1) XBONDS=(1 1) BRKXYZ=(9 0.433000 -0.250000 0.000000-\nM  V30  0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=-\nM  V30 LGRP\nM  V30 2 SUP 2 ATOMS=(1 13) XBONDS=(1 12) BRKXYZ=(9 -0.433000 -0.250000 0.000-\nM  V30 000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLA-\nM  V30 SS=LGRP\nM  V30 3 SUP 3 ATOMS=(1 14) XBONDS=(1 13) BRKXYZ=(9 0.000000 0.500000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\nM  V30 =LGRP\nM  V30 4 SUP 4 ATOMS=(11 2 3 4 5 6 7 8 9 10 11 12) XBONDS=(3 1 13 12) BRKXYZ=-\nM  V30 (9 -0.433000 0.250000 0.000000 0.000000 -0.500000 0.000000 0.000000 0.-\nM  V30 000000 0.000000) BRKXYZ=(9 0.433000 0.250000 0.000000 0.000000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000) LABEL=${name} CLASS=SUGAR SAP=(3-\nM  V30  2 1 Al) SAP=(3 12 13 Br) SAP=(3 2 14 Cx) NATREPLACE=SUGAR/R\nM  V30 END SGROUP\nM  V30 END CTAB\nM  V30 END TEMPLATE\nM  END\n>  <type>\nmonomerTemplate\n\n>  <aliasHELM>\nSugar1_HELM\n\n$$$$\n`;

    await updateMonomersLibraryAndGetLoggedErrors(page, buildSugar('Sugar2'));
    const { error, loggedErrors } =
      await updateMonomersLibraryAndGetLoggedErrors(page, buildSugar('Sugar3'));

    expect(`${error ?? ''}\n${loggedErrors}`).toContain('Sugar3');
  });

  test.skip('Case 32 — Nucleotide presets: Unable to create preset after adding and removing simple extensions – console error', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9964
     * Bug: https://github.com/epam/ketcher/issues/9455
     * Description: Nucleotide presets: Unable to create preset after adding and removing simple extensions – console error
     *
     * Scenario:
     * 1. Open Nucleotide preset file in the Molecules mode
     * 2. Open Monomer Creation Wizard and select Nucleotide (preset)
     * 3. Define base, sugar, phosphate components
     * 4. Extend Base with a short side chain, then delete the added atoms
     * 5. Submit the preset and verify there is no console error
     *
     * Skipped: the structure file of the bug is attached to the issue only (not
     * available in the repo), so the scenario cannot be reproduced exactly.
     * See https://github.com/epam/ketcher/issues/9455
     *
     * Version 3.15.0
     */
  });

  test('Case 33 — Aromatic bond is mirrored if used as inside one on Macro canvas', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9964
     * Bug: https://github.com/epam/ketcher/issues/6239
     * Description: Aromatic bond is mirrored if used as inside one on Macro canvas
     *
     * Scenario:
     * 1. Go to Molecules mode
     * 2. Load from Extended SMILES: [#6]1-[#6]=[#6]-[#6]2-[#6]=[#6]-[#6]=[#6]-[#6]:2-[#6]=1
     * 3. Go to Macro mode - Flex
     * 4. Verify that the aromatic bond looks the same as on Molecules mode
     *
     * Version 3.15.0
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      '[#6]1-[#6]=[#6]-[#6]2-[#6]=[#6]-[#6]=[#6]-[#6]:2-[#6]=1',
    );
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
  });

  test('Case 34 — In View mode, in the "selected+hover" state, a green color does not become darker', async ({
    SequenceCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9964
     * Bug: https://github.com/epam/ketcher/issues/5198
     * Description: In View mode, in the "selected+hover" state, a green color does not become darker
     *
     * Scenario:
     * 1. Switch to the Macro mode - Sequence
     * 2. Enter any letters (load RNA via HELM)
     * 3. Click on an empty place on the canvas
     * 4. Select any letter, move the cursor away and hover over the selected letter again
     * 5. Verify that the green color becomes darker
     *
     * Version 3.15.0
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.R(C)P.R(G)P}$$$$V2.0',
    );
    await clickOnCanvas(page, 100, 100);
    const symbolC = getSymbolLocator(page, { symbolAlias: 'C' }).first();
    await symbolC.click();
    await page.mouse.move(100, 100);
    await symbolC.hover();
    await takeElementScreenshot(page, symbolC, { padding: 50 });
  });

  test('Case 35 — It is impossible to cut a structure from a canvas using Ctrl+X', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9964
     * Bug: https://github.com/epam/ketcher/issues/4675
     * Description: It is impossible to cut a structure from a canvas using Ctrl+X
     *
     * Scenario:
     * 1. Switch to the Macro mode
     * 2. Add any nucleotide on the canvas
     * 3. Select this nucleotide and press Ctrl+X
     * 4. Verify that the nucleotide is removed from the canvas
     * 5. Press Ctrl+V and verify that the nucleotide is pasted back
     *
     * Version 3.15.0
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P}$$$$V2.0',
    );
    await selectAllStructuresOnCanvas(page);
    await cutToClipboardByKeyboard(page);
    await expect(getMonomerLocator(page, { monomerAlias: 'A' })).toHaveCount(
      0,
    );

    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, 400, 300);
    await expect(
      getMonomerLocator(page, { monomerAlias: 'A' }).first(),
    ).toBeVisible();
  });

  test.skip('Case 36 — Correct the LGA of meK and meE amino-acids', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9964
     * Bug: https://github.com/epam/ketcher/issues/9617
     * Description: Correct the LGA of meK and meE amino-acids
     *
     * Scenario:
     * 1. Open Macromolecules - Flex mode
     * 2. Add meK and meE from the library to the canvas
     * 3. Switch to Molecules mode and expand the monomers
     * 4. Verify that the R1 leaving group is hydrogen, not a methyl carbon
     *
     * Skipped: the issue gives no automatable steps, only an attached monomer
     * library file that is not in the repo.
     * See https://github.com/epam/ketcher/issues/9617
     *
     * Version 3.15.0
     */
  });

  test('Case 37 — System allow to load monomers with invalid HELM aliases', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9964
     * Bug: https://github.com/epam/ketcher/issues/8142
     * Description: System allow to load monomers with invalid HELM aliases
     *
     * Scenario:
     * 1. Open Macromolecules - Flex mode (clean canvas)
     * 2. Load _Peptide1 with an invalid HELM alias through ketcher.updateMonomersLibrary
     * 3. Verify that an error about the invalid HELM alias is reported
     * 4. Verify that the monomer does not appear in the library
     *
     * Version 3.15.0
     */
    const sdf =
      '\n  -INDIGO-10092516592D\n\n  0  0  0  0  0  0  0  0  0  0  0 V3000\nM  V30 BEGIN CTAB\nM  V30 COUNTS 1 0 0 0 0\nM  V30 BEGIN ATOM\nM  V30 1 _Peptide1 10.0194 -9.20822 0.0 0 CLASS=AA SEQID=1\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 END BOND\nM  V30 END CTAB\nM  V30 BEGIN TEMPLATE\nM  V30 TEMPLATE 1 AA/_Peptide1/_Peptide1/ NATREPLACE=AA/A\nM  V30 BEGIN CTAB\nM  V30 COUNTS 9 8 3 0 0\nM  V30 BEGIN ATOM\nM  V30 1 H -2.394 0.508 0.0 0\nM  V30 2 C -1.528 0.008 0.0 0\nM  V30 3 C -0.662 0.508 0.0 0\nM  V30 4 C 0.204 0.008 0.0 0\nM  V30 5 C -1.528 -0.992 0.0 0\nM  V30 6 C -0.662 -1.492 0.0 0\nM  V30 7 C 1.17 0.267 0.0 0\nM  V30 8 C 1.428 1.233 0.0 0\nM  V30 9 H 2.394 1.492 0.0 0\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 1 1 2\nM  V30 2 1 2 3\nM  V30 3 1 3 4\nM  V30 4 1 2 5\nM  V30 5 1 5 6\nM  V30 6 1 4 7\nM  V30 7 1 7 8\nM  V30 8 1 8 9\nM  V30 END BOND\nM  V30 BEGIN SGROUP\nM  V30 1 SUP 1 ATOMS=(1 1) XBONDS=(1 1) BRKXYZ=(9 0.433000 -0.250000 0.000000-\nM  V30  0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=-\nM  V30 LGRP\nM  V30 2 SUP 2 ATOMS=(1 9) XBONDS=(1 8) BRKXYZ=(9 -0.483000 -0.129500 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\nM  V30 =LGRP\nM  V30 3 SUP 3 ATOMS=(7 2 3 4 5 6 7 8) XBONDS=(2 1 8) BRKXYZ=(9 -0.433000 0.2-\nM  V30 50000 0.000000 0.483000 0.129500 0.000000 0.000000 0.000000 0.000000) -\nM  V30 LABEL=_Peptide1 CLASS=AA SAP=(3 2 1 Al) SAP=(3 8 9 Br) NATREPLACE=AA/A\nM  V30 END SGROUP\nM  V30 END CTAB\nM  V30 END TEMPLATE\nM  END\n>  <type>\nmonomerTemplate\n\n>  <modificationType>\nNatural amino acid2222222;ssssss;\n\n>  <aliasHELM>\n_Peptide1_HELM(%\\x3C!--&?@ЭТОПРОВАЛ\n\n>  <idtAliases>\nbase=_Peptide1\n\n$$$$\n';

    const { error, loggedErrors } =
      await updateMonomersLibraryAndGetLoggedErrors(page, sdf);
    expect(`${error ?? ''}\n${loggedErrors}`).toContain('HELM alias');

    await Library(page).switchToPeptidesTab();
    await Library(page).setSearchValue('_Peptide1');
    await expect(
      page.getByTestId('_Peptide1___Natural amino acid2222222;ssssss;'),
    ).toHaveCount(0);
  });
});
