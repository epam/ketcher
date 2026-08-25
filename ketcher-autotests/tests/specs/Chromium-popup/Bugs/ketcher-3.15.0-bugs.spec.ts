/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */

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
  openFileAndAddToCanvasAsNewProject,
  shiftCanvas,
  getVisibleCanvas,
  selectCanvasArea,
} from '@utils';
import { Library } from '@tests/pages/macromolecules/Library';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import {
  AminoAcidNaturalAnalogue,
  MonomerType,
  NucleotideNaturalAnalogue,
} from '@tests/pages/constants/createMonomerDialog/Constants';
import {
  CreateMonomerDialog,
  ModificationTypeDropdown,
} from '@tests/pages/molecules/canvas/CreateMonomerDialog';
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
import {
  verifyPNGExport,
  verifySMARTSExport,
  verifySVGExport,
} from '@utils/files/receiveFileComparisonData';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CalculateVariablesPanel } from '@tests/pages/macromolecules/CalculateVariablesPanel';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { OpenStructureDialog } from '@tests/pages/common/OpenStructureDialog';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { selectElementFromPeriodicTable } from '@tests/pages/molecules/canvas/PeriodicTableDialog';
import { PeriodicTableElement } from '@tests/pages/constants/periodicTableDialog/Constants';
import { selectAreaAndArrangeAsRing } from '@utils/macromolecules/cyclicStructure';

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
    const presetA = page.getByTestId('A_A_R_P');
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

  test('Case 26 — Add Hotkeys in Macro Mode Similar to Micro Mode', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9965
     * Bug: https://github.com/epam/ketcher/issues/4694
     * Description: Add Hotkeys in Macro Mode Similar to Micro Mode
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Paste from clipboard (e.g. press Ctrl+v) following helm HELM: RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P.R(U)}$RNA1,RNA2,8:pair-2:pair|RNA1,RNA2,5:pair-5:pair|RNA1,RNA2,2:pair-8:pair$$$V2.0
     * 3. Verify that 1 hotkey selects single bond tool
     * 4. Verify that Del hotkey erases operation when hovering on monomer
     * 5. Verify that Backspace hotkey erases operation when hovering on monomer
     * Version 3.15.0
     */
    const helmMolecule =
      'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P.R(U)}$RNA1,RNA2,8:pair-2:pair|RNA1,RNA2,5:pair-5:pair|RNA1,RNA2,2:pair-8:pair$$$V2.0';

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      helmMolecule,
    );
    // Test hotkey "1" to select single bond tool
    await page.keyboard.press('1');

    await takeEditorScreenshot(page);
    // Test Del hotkey erases when hovering on monomer
    const monomerA = getMonomerLocator(page, { monomerAlias: 'A' }).first();
    await monomerA.hover();
    await page.keyboard.press('Delete');

    await takeEditorScreenshot(page);
    // Paste again for Backspace test
    await CommonTopLeftToolbar(page).clearCanvas();
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      helmMolecule,
    );
    // Test Backspace hotkey erases when hovering on monomer
    const monomerU = getMonomerLocator(page, { monomerAlias: 'U' }).first();
    await monomerU.hover();
    await page.keyboard.press('Backspace');

    await takeEditorScreenshot(page);
  });

  test('Case 27 — System shows molecular mass and molecular formula even if few chains on the canvas', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9965
     * Bug: https://github.com/epam/ketcher/issues/7141
     * Description: System shows molecular mass and molecular formula even if few chains on the canvas
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from KET incorrect-mass-and-formula.ket file
     * 3. Open Calculate properties
     * 4. Verify that System doesn't show molecular mass and molecular formula
     * Version 3.15.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Chromium-popup/Bugs/incorrect-mass-and-formula.ket',
    );

    await MacromoleculesTopToolbar(page).calculateProperties();

    const calculateVariablesPanel = CalculateVariablesPanel(page);
    await expect(calculateVariablesPanel.panel).toBeVisible();
    await expect(calculateVariablesPanel.molecularFormula).not.toBeVisible();
    await expect(calculateVariablesPanel.molecularMassValue).not.toBeVisible();

    await takeEditorScreenshot(page);
    await calculateVariablesPanel.closeWindow();
  });

  test('Case 28 — Add/Remove explicit hydrogens operation inside create monomer wizard causes exception: process is not defined', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9965
     * Bug: https://github.com/epam/ketcher/issues/8818
     * Description: Add/Remove explicit hydrogens operation inside create monomer wizard causes exception: process is not defined
     * Scenario:
     * 1. Open Molecules canvas
     * 2. Paste followng molecule on the canvas: CCCP%91(N)(O)C.[*:1]%91 |$;;;;;;;_R1$|
     * 3. Select whole molecule and press Create a monomer button
     * 4. Press Add/Remove explicit hydrogens button three times
     * 5. Verify that no exception is being thrown, R1 leaving group removed but H atom remains
     * Version 3.15.0
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      'CCCP%91(N)(O)C.[*:1]%91 |$;;;;;;;_R1$|',
    );

    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).createMonomer();

    const indigoFunctionsToolbar = IndigoFunctionsToolbar(page);
    await indigoFunctionsToolbar.addRemoveExplicitHydrogens();
    await indigoFunctionsToolbar.addRemoveExplicitHydrogens();
    await indigoFunctionsToolbar.addRemoveExplicitHydrogens();
    await CommonLeftToolbar(page).handTool();
    await page.mouse.move(600, 200);
    await dragMouseTo(page, 450, 250);

    await takeEditorScreenshot(page, { maxDiffPixels: 200 });
    await CreateMonomerDialog(page).discard();
  });

  test('Case 29 — Bond to C10H20 superatom rendered wrong if loaded from CDXML', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9965
     * Bug: https://github.com/epam/ketcher/issues/6851
     * Description: Bond to C10H20 superatom rendered wrong if loaded from CDXML
     * Scenario:
     * 1. Go to Molecules mode (clean canvas)
     * 2. Load from CDXML: multiple_external_connections.cdr
     * 3. Verify that the bond to C10H20 superatom is rendered correctly
     * Version 3.15.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/Chromium-popup/Bugs/multiple_external_connections.cdr.cdxml',
    );

    await takeEditorScreenshot(page, { maxDiffPixels: 100 });
  });

  test('Case 30 — When pressing the “Enter” key, the “Save Structure” and “Open Structure” windows open in all modes', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9965
     * Bug: https://github.com/epam/ketcher/issues/4674
     * Description: When pressing the “Enter” key, the “Save Structure” and “Open Structure” windows open in all modes
     * Scenario:
     * 1. Switch to the Macro mode
     * 2. Click on the “Save as” button and close the “Save Structure” window
     * 3. Press the “Enter” key
     * 4. Verify that when pressing the “Enter” key, the “Save Structure” window does not open
     * 5. Switch to the Snake mode
     * 6. Click on the “Open” button and close the “Open Structure” window
     * 7. Press the “Enter” key
     * 8. Verify that when pressing the “Enter” key, the “Open Structure” window does not open
     * Version 3.15.0
     */
    const saveStructureDialog = SaveStructureDialog(page);
    const openStructureDialog = OpenStructureDialog(page);
    const topLeftToolbar = CommonTopLeftToolbar(page);

    await topLeftToolbar.saveFile();
    await saveStructureDialog.closeWindowButton.click();
    await page.keyboard.press('Enter');

    await expect(saveStructureDialog.window).toBeHidden();

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await topLeftToolbar.openFile();
    await openStructureDialog.closeWindow();
    await page.keyboard.press('Enter');

    await expect(openStructureDialog.window).toBeHidden();
  });

  test('Case 31 — Update SDF and KET format to include information about preset phosphate position', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9965
     * Bug: https://github.com/epam/Indigo/issues/3526
     * Description: Update SDF and KET format to include information about preset phosphate position
     *
     * Scenario:
     * 1. Go to Molecules canvas (clean canvas)
     * 2. Paste a simple molecule on the canvas
     * 3. Open Create Monomer wizard and select Nucleotide Preset type
     * 4. Set name and configure Base, Sugar, and Phosphate components
     * 5. Set Phosphate position to 5' (5-prime end)
     * 6. Submit the preset
     * 7. Switch to Macromolecules mode
     * 8. Verify the nucleotide preset with 5' phosphate position appears in the library
     * 9. Add the preset to canvas and verify it renders with phosphate on the correct (5') end
     *
     * Version 3.15.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 0);
    const dialog = CreateMonomerDialog(page);
    const presetSection = NucleotidePresetSection(page);
    await dialog.selectType(MonomerType.NucleotidePreset);
    await presetSection.setName('preset19');

    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      code: 'B19',
      naturalAnalogue: NucleotideNaturalAnalogue.A,
    });

    await CommonLeftToolbar(page).handTool();
    await page.mouse.move(600, 200);
    await dragMouseTo(page, 450, 250);

    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      code: 'S19',
    });

    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
      code: 'Ph19',
    });
    await presetSection.setPhosphatePosition('5');
    await dialog.submit();

    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await Library(page).openRNASection(RNASection.Presets);
    await Library(page).setSearchValue('preset19');

    const presetCard = page.getByText('preset19').first();
    await expect(presetCard).toBeVisible();

    await Library(page).dragMonomerOnCanvas(
      {
        alias: 'preset19',
        testId: 'preset19_B19_S19_Ph19',
      } as any,
      { x: 0, y: 0, fromCenter: true },
    );

    await takeEditorScreenshot(page);
  });

  test('Case 32 — Bond length become wrong after Arrange as a Ring option applied', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9965
     * Bug: https://github.com/epam/Indigo/issues/3449
     * Description: Bond length become wrong after Arrange as a Ring option applied
     * Scenario:
     * 1. Open Macromolecules mode - Flex canvas (clean canvas)
     * 2. Load following HELM: PEPTIDE1{C.C.C.C.C.C.C.C.C.C.C.C.C}$PEPTIDE1,PEPTIDE1,5:R3-8:R3$$$V2.0
     * 3. Select ring and right tail of the chain
     * 4. Call context menu and click Arrange as a Ring option
     * 5. Verify that system layout monomer in the ring is as expected, distance (e.g. bond length) between monomer has the same standard length
     * Version 3.15.0
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{C.C.C.C.C.C.C.C.C.C.C.C.C}$PEPTIDE1,PEPTIDE1,5:R3-8:R3$$$V2.0',
    );

    await CommonLeftToolbar(page).areaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await CommonTopRightToolbar(page).selectZoomOutTool(3);
    await page.mouse.move(370, 150);
    await dragMouseTo(page, 800, 500);
    await MacromoleculesTopToolbar(page).arrangeAsARing();

    await takeEditorScreenshot(page);
  });

  test('Case 33 — System ignores Implicit H count value in export to SVG/PNG', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9965
     * Bug: https://github.com/epam/Indigo/issues/3353
     * Description: System ignores Implicit H count value in export to SVG/PNG
     * Scenario:
     * 1. Go to Periodic Table, choose Na (sodium), add it to the main screen
     * 2. Note it is displayed as NaH
     * 3. Right-click it, choose "Edit", in "Atom Properties", under "Query specific" label, set "Implicit H count" to 0.
     * 4. After Apply button is pressed, molecule become shown as Na (no hydrogen, as expected)
     * 5. Save as SVG
     * 6. Verify that the image is saved as shown in the editor
     * Version 3.15.0
     */
    await selectElementFromPeriodicTable(page, PeriodicTableElement.Na);
    await clickInTheMiddleOfTheCanvas(page);

    const sodiumAtom = getAtomLocator(page, { atomLabel: 'Na' }).first();
    await expect(sodiumAtom).toBeVisible();
    await ContextMenu(page, sodiumAtom).click(MicroAtomOption.Edit);
    await expect(AtomPropertiesDialog(page).window).toBeVisible();
    await AtomPropertiesDialog(page).setOptions({
      QuerySpecificProperties: {
        ImplicitHCount: ImplicitHCount.One,
      },
    });

    await verifySMARTSExport(page, '[Na;h1]');
    await takeEditorScreenshot(page, { maxDiffPixels: 100 });
    await verifyPNGExport(page);
    await verifySVGExport(page);
  });

  test('Case 34 — If the selected group is forming an n-agon with 12 or more than 12 points, the bases should be located inside of the circular structure', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9965
     * Bug: https://github.com/epam/Indigo/issues/3308
     * Description: If the selected group is forming an n-agon with 12 or more than 12 points, the bases should be located inside of the circular structure
     * Scenario:
     * 1. Open Macromolecules - Flex mode (clean canvas)
     * 2. Load from HELM: RNA1{r(A).r(A).r(A).r(A).r(A).r(A).r(A).r(A).r(A).r(A).r(A).r(A)}$RNA1,RNA1,1:R1-23:R2$$$V2.0
     * 3. Open context menu and click Create cyclic structure option
     * 4. Verify that system locates bases inside of the circular structure and the bond length between the base and the sugar should be 75% of the standard bond length
     * Version 3.15.0
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{r(A).r(A).r(A).r(A).r(A).r(A).r(A).r(A).r(A).r(A).r(A).r(A)}$RNA1,RNA1,1:R1-23:R2$$$V2.0',
    );

    await CommonTopRightToolbar(page).selectZoomOutTool(3);
    await shiftCanvas(page, 100, 0);
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);

    const sugar = getMonomerLocator(page, {
      monomerAlias: 'R',
    }).nth(5);
    await sugar.click();
    await ContextMenu(page, sugar).click(MonomerOption.ArrangeAsARing);

    await takeEditorScreenshot(page, { maxDiffPixels: 200 });
  });

  test('Case 35 — If the selected group is forming an n-agon with 6 or more than 6 points, then the bases should be located inside of the circular structure', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9965
     * Bug: https://github.com/epam/Indigo/issues/3307
     * Description: If the selected group is forming an n-agon with 6 or more than 6 points, then the bases should be located inside of the circular structure
     * Scenario:
     * 1. Open Macromolecules - Flex mode (clean canvas)
     * 2. Load from HELM: RNA1{r(A).r(A).r(A).r(A).r(A).r(A).r(A)}$RNA1,RNA1,1:R1-13:R2$$$V2.0
     * 3. Open context menu and click Create cyclic structure option
     * 4. Verify that system locates bases outside of the circular structure
     * Version 3.15.0
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{r(A).r(A).r(A).r(A).r(A).r(A).r(A)}$RNA1,RNA1,1:R1-13:R2$$$V2.0',
    );

    await CommonTopRightToolbar(page).selectZoomOutTool(3);
    await shiftCanvas(page, 100, 0);
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);

    const sugar = getMonomerLocator(page, {
      monomerAlias: 'R',
    }).nth(5);
    await sugar.click();

    await ContextMenu(page, sugar).click(MonomerOption.ArrangeAsARing);

    await takeEditorScreenshot(page, { maxDiffPixels: 200 });
  });

  test('Case 36 — The "center" of the n-agon should be positioned to the right of the fixed monomer', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9965
     * Bug: https://github.com/epam/ketcher/issues/3305
     * Description: System shows molecular mass and molecular formula even if few chains on the canvas
     * Scenario:
     * 1. Open Macromolecules - Flex mode (clean canvas)
     * 2. Load from KET as New project: Center of cycle should be from the right of first monomer in KET.ket
     * 3. Select structure
     * 4. Use Create cyclic structure option
     * 5. Verify that the "center" of the quadrangle positioned to the right of the fixed C amino acid monomer
     * Version 3.15.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Chromium-popup/Bugs/Center.of.cycle.should.be.from.the.right.of.first.monomer.in.KET.ket',
    );
    await CommonLeftToolbar(page).areaSelectionTool(
      SelectionToolType.Rectangle,
    );

    const canvas = await getVisibleCanvas(page);
    const canvasBox = await canvas.boundingBox();
    if (!canvasBox) {
      throw new Error('Unable to determine canvas bounds');
    }

    const padding = 10;
    await page.mouse.move(canvasBox.x + padding, canvasBox.y + padding);
    await dragMouseTo(
      page,
      canvasBox.x + canvasBox.width - padding,
      canvasBox.y + canvasBox.height - padding,
    );
    await MacromoleculesTopToolbar(page).arrangeAsARing();

    await takeEditorScreenshot(page);
  });

  test('Case 37 — Fixed monomer of cycle on layout should be top left monomer', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9965
     * Bug: https://github.com/epam/ketcher/issues/3304
     * Description: Fixed monomer of cycle on layout should be top left monomer
     * Scenario:
     * 1. Open Macromolecules - Flex mode (clean canvas)
     * 2. Load from KET as New project: Center of cycle should be from the right of first monomer in KET.ket
     * 3. Select structure
     * 4. Use Create cyclic structure option
     * 5. Verify that System uses A amino acid as fixed monomer
     * Version 3.15.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Chromium-popup/Bugs/Center.of.cycle.should.be.from.the.right.of.first.monomer.in.KET.ket',
    );

    await CommonLeftToolbar(page).areaSelectionTool(
      SelectionToolType.Rectangle,
    );

    const canvas = await getVisibleCanvas(page);
    const canvasBox = await canvas.boundingBox();
    if (!canvasBox) {
      throw new Error('Unable to determine canvas bounds');
    }

    const padding = 10;
    await page.mouse.move(canvasBox.x + padding, canvasBox.y + padding);
    await dragMouseTo(
      page,
      canvasBox.x + canvasBox.width - padding,
      canvasBox.y + canvasBox.height - padding,
    );
    await MacromoleculesTopToolbar(page).arrangeAsARing();

    await takeEditorScreenshot(page);
  });

  test('Case 38 — Sequential application of “Create cyclic structure” to different segments of one chain leads to overlapping and distorted topology', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9965
     * Bug: https://github.com/epam/ketcher/issues/3329
     * Description: Sequential application of “Create cyclic structure” to different segments of one chain leads to overlapping and distorted topology
     * Scenario:
     * 1. Open Macromolecules - Flex mode (clean canvas)
     * 2. Open chain. ketcher (46).zip
     * 3. Select a small fragment of this chain.
     * 4. Create cyclic structure
     * 5. Select another segment of the same chain (not previously closed).
     * 6. Again choose Create cyclic structure.
     * 7. Observe that the new layout overlaps previous parts, bonds cross between cycles, and geometry is broken.
     * 8. The “Create cyclic structure” operation should only affect one continuous, non-overlapping fragment at a time.
     *    The rest of the structure must remain unchanged.
     *    No new cross-bonds or overlaps should appear between previously cycled and non-cycled segments.
     * Version 3.15.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Chromium-popup/Bugs/ketcher (46).ket',
    );

    await CommonTopRightToolbar(page).selectZoomOutTool(5);
    await shiftCanvas(page, 150, 50);
    await selectAreaAndArrangeAsRing(page, {
      startX: 0.05,
      endX: 0.25,
      startY: 0.2,
      endY: 0.8,
    });
    await selectAreaAndArrangeAsRing(page, {
      startX: 0.32,
      endX: 0.5,
      startY: 0.2,
      endY: 0.8,
    });
    await shiftCanvas(page, -150, 0);
    await selectAreaAndArrangeAsRing(page, {
      startX: 0.25,
      endX: 0.45,
      startY: 0.2,
      endY: 0.8,
    });
    await selectAreaAndArrangeAsRing(page, {
      startX: 0.53,
      endX: 0.7,
      startY: 0.2,
      endY: 0.8,
    });

    await takeEditorScreenshot(page);
  });

  test('Case 39 — System provides invalid SDF content (missing semicolon) on monomer creation', async ({
    MoleculesCanvas: _,
  }) => {
    /*
      * Test task: https://github.com/epam/ketcher/issues/9965
      * Bug: https://github.com/epam/ketcher/issues/3301
      * Description: System provides invalid SDF content (missing semicolon)
      * on monomer creation
      *
      * Scenario:
      // * 1. Open Molecules mode with a clean canvas
      * 2. Load a structure with R1 and R2 attachment points
      * 3. Subscribe to the libraryUpdate event
      * 4. Create an amino-acid monomer with three modification types
      * 5. Verify that the emitted SDF contains the trailing semicolon
      * 6. Verify the complete emitted SDF
      *
      * Version 3.15.0
      */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      '[*:1]CC%91.[*:2]%91 |$_R1;;;_R2$|',
    );
    await selectAllStructuresOnCanvas(page);

    const libraryUpdatePromise = page.evaluate(
      () =>
        new Promise<string>((resolve) => {
          window.ketcher.editor.subscribe('libraryUpdate', resolve);
        }),
    );
    await LeftToolbar(page).createMonomer();

    const dialog = CreateMonomerDialog(page);
    await dialog.selectType(MonomerType.AminoAcid);
    await dialog.setCode('_a5');
    await dialog.setName('_a5');
    await dialog.selectNaturalAnalogue(AminoAcidNaturalAnalogue.A);

    await dialog.setModificationType({
      dropdown: ModificationTypeDropdown.First,
      customModification: 'a11',
    });
    await dialog.setModificationType({
      dropdown: ModificationTypeDropdown.Second,
      customModification: 'a22',
    });
    await dialog.setModificationType({
      dropdown: ModificationTypeDropdown.Third,
      customModification: 'a33',
    });
    await dialog.setHELMAlias('HELM_ALIAS_HERE5');
    await dialog.submit({ ignoreWarning: true });

    const sdf = await libraryUpdatePromise;

    expect(sdf).toContain('>  <modificationTypes>\na11;a22;a33;\n');
  });
});
