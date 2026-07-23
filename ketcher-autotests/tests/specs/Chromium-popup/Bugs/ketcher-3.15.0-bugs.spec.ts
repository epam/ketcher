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
    await takeElementScreenshot(
      page,
      MacromoleculesTopToolbar(page).switchLayoutModeDropdownButton,
      {
        paddingWidth: 1,
        paddingHeight: 50,
      },
    );

    await MacromoleculesTopToolbar(page).expandCreateAntisenseStrandDropdown();
    await takeElementScreenshot(
      page,
      MacromoleculesTopToolbar(page).createAntisenseStrandDropdownButton,
      {
        paddingWidth: 1,
        paddingHeight: 35,
      },
    );
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
});
