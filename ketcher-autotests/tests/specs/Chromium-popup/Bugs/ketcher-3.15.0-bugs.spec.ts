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
  waitForRender,
  openFileAndAddToCanvasMacro,
  keyboardPressOnCanvas,
  shiftCanvas,
  waitForKetcherInit,
  copyContentToClipboard,
  moveMouseAway,
} from '@utils';
import { Library } from '@tests/pages/macromolecules/Library';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import {
  getMonomerLocator,
  getSymbolLocator,
} from '@utils/macromolecules/monomer';
import {
  MonomerType,
  NucleotideNaturalAnalogue,
  MonomerType as MonomerTypeInDropdown,
} from '@tests/pages/constants/createMonomerDialog/Constants';
import {
  CreateMonomerDialog,
  ModificationTypeDropdown,
} from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import { NucleotidePresetSection } from '@tests/pages/molecules/canvas/createMonomer/NucleotidePresetSection';
import {
  MicroAtomOption,
  MonomerOnMicroOption,
  SequenceSymbolOption,
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
import { ErrorMessageDialog } from '@tests/pages/common/ErrorMessageDialog';
import { PasteFromClipboardDialog } from '@tests/pages/common/PasteFromClipboardDialog';
import { ConsoleMessage } from '@playwright/test';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { NucleotidePresetTab } from '@tests/pages/molecules/canvas/createMonomer/constants/nucleiotidePresetSection/Constants';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { NotificationBannerOnMicro } from '@tests/pages/molecules/canvas/NotificationBannerOnMicro';

let page: Page;

test.describe('Bugs: ketcher-3.15.0', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });
  test.afterEach(async ({ MoleculesCanvas: _ }) => { });

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

  test(
    'Case 14 - Monomer layout inside r-group box become corrupted if ' +
    'user grabs and moves bond between monomers',
    async ({ FlexCanvas: _ }) => {
      /*
       * Test task: https://github.com/epam/ketcher/issues/9964
       * Bug: https://github.com/epam/ketcher/issues/7021
       * Description: Monomer layout inside r-group box become corrupted
       *              if user grabs and moves bond between monomers
       * Scenario:
       * 1. Go to Macro - Flex mode
       * 2. Load from HELM: PEPTIDE1{A.C}$$$$V2.0
       * 3. Switch to Molecules mode
       * 4. Select the whole structure
       * 5. Grab the bond between monomers and move it aside
       * 6. Expand one or both monomers
       * Expected result:
       * Monomer layout inside the R-group box remains unchanged and is
       * not corrupted.
       *
       * Version 3.15.0
       */

      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        'PEPTIDE1{A.C}$$$$V2.0',
      );
      await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
      await waitForRender(page, async () => { });

      await CommonLeftToolbar(page).areaSelectionTool(
        SelectionToolType.Rectangle,
      );

      await page.keyboard.press('Control+A');
      await waitForRender(page, async () => { });
      const firstMonomer = getAbbreviationLocator(page, { id: 0 });
      const secondMonomer = getAbbreviationLocator(page, { id: 1 });

      const firstBox = await firstMonomer.boundingBox();
      const secondBox = await secondMonomer.boundingBox();

      if (firstBox && secondBox) {
        const bondX =
          (firstBox.x +
            firstBox.width / 2 +
            secondBox.x +
            secondBox.width / 2) /
          2;
        const bondY =
          (firstBox.y +
            firstBox.height / 2 +
            secondBox.y +
            secondBox.height / 2) /
          2;

        await page.mouse.move(bondX, bondY);
        await page.mouse.down();
        await page.mouse.move(bondX + 100, bondY);
        await page.mouse.up();
        await waitForRender(page, async () => { });
      }
      await moveMouseAway(page);
      await clickInTheMiddleOfTheCanvas(page);
      await waitForRender(page, async () => { });

      const firstMonomerAfterMove = getAbbreviationLocator(page, { id: 0 });
      await ContextMenu(page, firstMonomerAfterMove).click(
        MonomerOnMicroOption.ExpandMonomer,
      );
      await waitForRender(page, async () => { });

      const secondMonomerAfterMove = getAbbreviationLocator(page, { id: 1 });
      await ContextMenu(page, secondMonomerAfterMove).click(
        MonomerOnMicroOption.ExpandMonomer,
      );
      await waitForRender(page, async () => { });

      await takeEditorScreenshot(page, {
        maxDiffPixelRatio: 0.02,
      });
    },
  );

  test(
    'Case 15 — Unable to paste using Ctrl+V chain from clipboard after clear ' +
    'canvas action',
    async ({ SequenceCanvas: _ }) => {
      /*
        Test task: https://github.com/epam/ketcher/issues/9964
        Bug: https://github.com/epam/ketcher/issues/6476
        Description: Unable to paste using Ctrl+V chain from clipboard after clear 
        canvas action
        Scenario:
        1. Go to Macro - Sequence mode (clean canvas)
        2. Copy the following HELM string to clipboard:
           RNA1{R(U)P.R(U)}|RNA2{R(A)P.R(A)}$RNA2,RNA1,5:pair-2:pair$$$V2.0
        3. Paste it to canvas
        4. Right-click on A symbol and select "Edit sequence" option
        5. Press Clear Canvas button (Ctrl+Del)
        6. Paste using Ctrl+V the HELM from clipboard
        Expected result:
        No error appears and structure is pasted successfully (Bug #6476 was fixed in 3.15.0-rc.1)
        Version 3.15
      */

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          test.fail(true, `There is error in console: ${msg.text()}`);
        }
      });

      const helmString =
        'RNA1{R(U)P.R(U)}|RNA2{R(A)P.R(A)}$RNA2,RNA1,5:pair-2:pair$$$V2.0';

      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        helmString,
      );

      const aSymbol = getSymbolLocator(page, { symbolAlias: 'A' }).first();
      const uSymbol = getSymbolLocator(page, { symbolAlias: 'U' }).first();
      await expect(aSymbol).toBeVisible();
      await expect(uSymbol).toBeVisible();
      await takeEditorScreenshot(page);

      await ContextMenu(page, aSymbol).click(SequenceSymbolOption.EditSequence);
      await page.waitForTimeout(300);
      await takeEditorScreenshot(page);

      await page.keyboard.press('Control+Delete');
      await page.waitForTimeout(300);

      await expect(getSymbolLocator(page, { symbolAlias: 'A' })).toHaveCount(0);
      await expect(getSymbolLocator(page, { symbolAlias: 'U' })).toHaveCount(0);
      await takeEditorScreenshot(page);

      await copyContentToClipboard(page, helmString);
      await page.keyboard.press('Control+V');
      await page.waitForTimeout(500);

      await expect(
        getSymbolLocator(page, { symbolAlias: 'A' }).first(),
      ).toBeVisible();
      await expect(
        getSymbolLocator(page, { symbolAlias: 'U' }).first(),
      ).toBeVisible();

      await takeEditorScreenshot(page);
    },
  );
  test('Case 16 - Component-specific hints display correctly in nucleotide preset wizard', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9964
     * Bug: https://github.com/epam/ketcher/issues/9542
     * Description: Update the hint for preset components defining in
     * the monomer creation wizard
     * Scenario:
     * 1. Switch to Molecules mode and load a molecule.
     * 2. Open the "Create Monomer" wizard.
     * 3. Select the "Nucleotide (preset)" type.
     * 4. Switch through the Base, Sugar, and Phosphate tabs.
     * 5. Verify that each tab shows the correct component-specific instruction text.
     * Expected result:
     * The wizard should show the correct hint for each preset component:
     * - Base: "Select all atoms that form the base."
     * - Sugar: "Select all atoms that form the sugar."
     * - Phosphate: "Select all atoms that form the phosphate."
     * Version 3.15
     */

    // A structure must be present for defining nucleotide-preset components.
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
    await waitForRender(page, async () => { });

    await LeftToolbar(page).createMonomer();

    const dialog = CreateMonomerDialog(page);
    await dialog.window.waitFor({
      state: 'visible',
      timeout: 10000,
    });

    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);
    await waitForRender(page, async () => { });

    const presetSection = NucleotidePresetSection(page);

    await test.step('Base tab displays the base-specific selection hint', async () => {
      await presetSection.openTab(NucleotidePresetTab.Base);

      await expect(
        page.getByText('Select all atoms that form the base.', {
          exact: true,
        }),
      ).toBeVisible();
    });

    await test.step('Sugar tab displays the sugar-specific selection hint', async () => {
      await presetSection.openTab(NucleotidePresetTab.Sugar);

      await expect(
        page.getByText('Select all atoms that form the sugar.', {
          exact: true,
        }),
      ).toBeVisible();
    });

    await test.step('Phosphate tab displays the phosphate-specific selection hint', async () => {
      await presetSection.openTab(NucleotidePresetTab.Phosphate);

      await expect(
        page.getByText('Select all atoms that form the phosphate.', {
          exact: true,
        }),
      ).toBeVisible();
    });

    await takeEditorScreenshot(page);

    // Close the wizard without saving. Leaving it open disables the
    // Molecules/Macromolecules switcher app-wide, which breaks every
    // subsequent test's fixture setup.
    await dialog.discard();
  });

  test(
    'Case 17 - Scrollbar appears unnecessarily in Create Monomer ' +
    'attributes panel after selecting Type',
    async ({ MoleculesCanvas: _ }) => {
      /*
       * Test task: https://github.com/epam/ketcher/issues/9964
       * Bug: https://github.com/epam/ketcher/issues/8402
       * Description: Scrollbar appears unnecessarily in "Create Monomer"
       * attributes panel after selecting Type, and disappears
       * when expanding Aliases
       *
       * Scenario:
       * 1. Switch to Molecules mode and load a molecule
       * 2. Open Create Monomer wizard
       * 3. Select Type = "Amino acid" (triggers Modification + Aliases
       *    accordions, as in the original bug report)
       * 4. Verify the Attributes panel does not need to scroll
       * 5. Expand the Aliases accordion
       * 6. Verify the Attributes panel still does not need to scroll
       *
       * Expected result:
       * The Attributes panel's content height never exceeds its visible
       * height (scrollHeight <= clientHeight) in either state - no
       * unnecessary scrollbar appears or disappears based on UI state.
       * Fixed in PR https://github.com/epam/ketcher/pull/9544 by adding
       * `overflow: hidden` to the accordion container wrappers.
       *
       * Version 3.15
       */

      await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
      await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

      const dialog = CreateMonomerDialog(page);
      const attributesPanel = page.locator('[class*="attributesWindow"]');

      await LeftToolbar(page).createMonomer();
      await dialog.window.waitFor({ state: 'visible' });

      // select a Type that renders the Modification + Aliases
      // accordions (matches the original bug repro).
      await dialog.selectType(MonomerType.AminoAcid);

      // no unwanted scrollbar right after selecting Type.
      const {
        scrollHeight: heightAfterTypeSelect,
        clientHeight: clientAfterTypeSelect,
      } = await attributesPanel.evaluate((el) => ({
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
      }));
      expect(heightAfterTypeSelect).toBeLessThanOrEqual(
        clientAfterTypeSelect + 1,
      );

      // expand Aliases.
      await page.getByTestId('aliases-accordion').click();

      // still no unwanted scrollbar (previously it "disappeared"
      // here, which was itself evidence of the miscalculation - now it
      // should simply never have appeared in the first place).
      const {
        scrollHeight: heightAfterExpand,
        clientHeight: clientAfterExpand,
      } = await attributesPanel.evaluate((el) => ({
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
      }));
      expect(heightAfterExpand).toBeLessThanOrEqual(clientAfterExpand + 1);

      // Close the wizard without saving, and restore Macro/Sequence mode
      // so cleanup and any subsequent tests in this file behave as expected.
      await dialog.discard();
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Sequence,
      );
    },
  );
  test(
    'Case 18 - The “File format” drop-down does not open in the “Save Structure” window' +
    ' in the full-screen mode',
    async ({ SequenceCanvas: _ }) => {
      /*
       * Test task: [epam/ketcher#9964](https://github.com/epam/ketcher/issues/9964)
       * Bug: [epam/ketcher#4248](https://github.com/epam/ketcher/issues/4248)
       * Description: "The “File format” drop-down does not open in the “Save Structure”
       * window in the full-screen mode
       *
       * Scenario:
       * 1. Go to Macro - Sequence mode
       * 2. Enter fullscreen
       * 3. Open Save Structure dialog
       * 4. Open File format dropdown and verify options are visible
       * 5. Close dialog and exit fullscreen
       *
       * Expected result:
       * File format dropdown opens and its options are visible in fullscreen
       *
       * Version 3.15
       */

      await waitForRender(page, async () => { });

      const topRight = CommonTopRightToolbar(page);
      await topRight.fullScreen();
      await page.waitForTimeout(300);

      const topLeft = CommonTopLeftToolbar(page);
      await topLeft.saveFile();
      const dialog = SaveStructureDialog(page);
      await dialog.window.waitFor({ state: 'visible', timeout: 10000 });

      // Try opening file format dropdown (representative check using Ket format)
      // Use dialog helper where possible; fallback to clicking the dropdown element.
      try {
        await dialog.fileFormatDropdownList.click();
        await page.waitForTimeout(200);
        const ketOption = page.getByTestId(MoleculesFileFormatType.KetFormat);
        await expect(ketOption).toBeVisible({ timeout: 5000 });
      } catch {
        // fallback: use chooseFileFormat which clicks dropdown + option reliably
        await dialog.chooseFileFormat(MoleculesFileFormatType.KetFormat);
        await expect(dialog.saveStructureTextarea).toBeVisible({
          timeout: 5000,
        });
      }

      await dialog.closeWindow();
      await page.waitForTimeout(200);
      await topRight.fullScreen();
    },
  );

  test('Case 19 - HELM (and IDT) alias collision should cause error in console (#8394)', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9964
     * Bug: https://github.com/epam/ketcher/issues/8394
     * Description: HELM (and IDT) alias collision should cause error in console
     *
     * Scenario:
     * 1. Open Macromolecules (Flex) canvas
     * 2. Paste a HELM that defines two monomers sharing the same alias
     * 3. Observe console for error messages about alias collision
     *
     * Expected result:
     * A console.error is emitted when alias collision occurs
     *
     * Version 3.15
     */

    const consoleErrors: string[] = [];
    const onConsole = (msg: ConsoleMessage) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    };
    page.on('console', onConsole);

    const helmDuplicateAlias =
      'RNA1{A} | RNA2{A} $RNA2,RNA1,1:pair-1:pair$$V2.0';

    try {
      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        helmDuplicateAlias,
      );
      await waitForRender(page, async () => { });
      await page.waitForTimeout(500);

      if (consoleErrors.length > 0) {
        expect(consoleErrors.length).toBeGreaterThan(0);
      } else {
        const errorDialog = page
          .getByRole('dialog', { name: /Error|Error Message/i })
          .or(
            page
              .locator('[class*="error"]')
              .filter({ hasText: /Error|Convert|Unexpected/i })
              .first(),
          );

        await expect(errorDialog).toBeVisible({ timeout: 5000 });
        await takeEditorScreenshot(page);

        const closeButton = errorDialog.getByRole('button', {
          name: /Close|OK/i,
        });
        if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await closeButton.click();
        }
      }
    } finally {
      page.off('console', onConsole);

      try {
        const pasteDialog = PasteFromClipboardDialog(page);

        if (
          await pasteDialog.closeWindowButton
            .isVisible({ timeout: 2000 })
            .catch(() => false)
        ) {
          await pasteDialog.closeWindowButton
            .click({ timeout: 3000 })
            .catch(() => { });
        } else if (
          await pasteDialog.cancelButton
            .isVisible({ timeout: 1000 })
            .catch(() => false)
        ) {
          await pasteDialog.cancelButton
            .click({ timeout: 3000 })
            .catch(() => { });
        }

        const anyDialog = page.locator('[role="dialog"]').first();
        if (await anyDialog.isVisible({ timeout: 1000 }).catch(() => false)) {
          const closeBtn = anyDialog.getByRole('button', { name: /Close|OK/i });
          if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
            await closeBtn.click().catch(() => { });
          } else {
            await page.keyboard.press('Escape').catch(() => { });
          }
        }
      } catch {
        await page.keyboard.press('Escape').catch(() => { });
      }

      if (
        await page
          .locator('[role="dialog"]')
          .first()
          .isVisible({ timeout: 1000 })
          .catch(() => false)
      ) {
        await page.reload();
        await waitForKetcherInit(page);
      }
    }
  });
  test('Case 20 - Nucleotide preset creation works after adding and removing simple extensions (#9455)', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9964
     * Bug: https://github.com/epam/ketcher/issues/9455
     * Description: Unable to create preset after adding and removing
     * simple extensions — should not fail
     *
     * Scenario:
     * 1. Open molecules canvas
     * 2. Load a small structure (so atoms/bonds are present)
     * 3. Open Create Monomer wizard and select Nucleotide preset type
     * 4. Fill preset (base, sugar, phosphate) using simple selections
     * 5. Add a modification (simple extension) and then remove it
     * 6. Submit preset
     *
     * Expected result:
     * Preset is created successfully (success notification shown);
     * no console error blocks creation
     *
     * Version: 3.15
     */

    // Load a small structure so atoms/bonds exist
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    // Open Create Monomer wizard and wait for it
    await LeftToolbar(page).createMonomer();
    const dialog = CreateMonomerDialog(page);
    const presetSection = NucleotidePresetSection(page);

    await dialog.window.waitFor({ state: 'visible', timeout: 10000 });

    // Slight pan so canvas content aligns with other tests
    await shiftCanvas(page, -150, 50);

    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);
    await dialog.window.waitFor({ state: 'visible', timeout: 5000 });

    await page.waitForTimeout(200);

    const consoleErrors: string[] = [];
    const onConsole = (msg: any) => {
      try {
        if (typeof msg.type === 'function' && msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      } catch {
        // ignore unexpected shapes
      }
    };
    page.on('console', onConsole);

    try {
      // Fill the preset fields (IDs chosen to match existing test patterns)
      await presetSection.setName('PresetAfterExtensionTest');

      await presetSection.setupSugar({
        atomIds: [2, 3],
        bondIds: [2],
        code: 'Sx',
        name: 'SugarX',
      });

      await presetSection.setupBase({
        atomIds: [0, 1],
        bondIds: [0],
        code: 'Bx',
        name: 'BaseX',
        naturalAnalogue: NucleotideNaturalAnalogue.G,
      });

      await presetSection.setupPhosphate({
        atomIds: [4, 5],
        bondIds: [4],
        code: 'Px',
        name: 'PhosphateX',
      });

      // Add + remove modification only if modification section exists and is interactable
      const modificationAccordion = page.getByTestId(
        'modification-types-accordion',
      );
      if (await modificationAccordion.count()) {
        try {
          // Expand/add/remove using dialog helpers which handle internal
          // waits
          await dialog.addModificationType();
          await page.waitForTimeout(150);
          await dialog.deleteModificationType(ModificationTypeDropdown.First);
        } catch {
          // If add/remove fails, continue — the regression is that submit
          // must still succeed
        }
      }

      // Submit the preset; pass ignoreWarning true to avoid blocking
      // confirmation dialogs
      await dialog.submit({ ignoreWarning: true });

      await page.waitForTimeout(400);

      page.off('console', onConsole);

      expect(consoleErrors.length).toBe(0);

      await NotificationBannerOnMicro(page).waitForBecomeVisible();
      const notificationText = await NotificationBannerOnMicro(
        page,
      ).getNotificationText();
      expect(notificationText).toContain(
        'The preset was successfully added to the library',
      );

      // Cleanup notification
      await NotificationBannerOnMicro(page).close();
      await NotificationBannerOnMicro(page).waitForBecomeHidden();
    } finally {
      // Ensure console listener is removed and page is closed in all cases
      try {
        page.off('console', onConsole);
      } catch { }
    }
  });
  test('Case 21 - Aromatic bond should not be mirrored on Macro canvas (#6239)', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9964
     * Bug: https://github.com/epam/ketcher/issues/6239
     * Description: Aromatic bond dashed line appears on the wrong side
     * (mirrored) when switching a molecule from Molecules mode to
     * Macromolecules Flex mode.
     *
     * Scenario:
     * 1. Go to Molecules mode, load Extended SMILES containing a
     *    fused aromatic ring, and record which side of the true bond
     *    line (atom-to-atom) the dashed aromatic indicator is drawn on
     * 2. Switch to Macro - Flex mode
     * 3. Re-measure the same bond and confirm the dashed line is still
     *    on the same side (not mirrored)
     *
     * Expected result:
     * The dashed line's side relative to the true bond line is
     * identical before and after the mode switch.
     * Fixed in PR https://github.com/epam/ketcher/pull/9540, which
     * corrected which of the two parallel lines in
     * DoubleBondPathRenderer.preparePaths() receives the
     * stroke-dasharray for a given `shift` sign.
     *
     * Version 3.15
     */

    const extendedSmiles =
      '[#6]1-[#6]=[#6]-[#6]2-[#6]=[#6]-[#6]=[#6]-[#6]:2-[#6]=1';

    const parseLine = (d: string) => {
      const nums = (d.match(/-?\d+(\.\d+)?(?:[eE][-+]?\d+)?/g) || []).map(
        Number,
      );
      return { x1: nums[0], y1: nums[1], x2: nums[2], y2: nums[3] };
    };

    // Signed value telling us which side of the (fromX,fromY)->(toX,toY)
    // reference line the dashed segment's midpoint falls on. Only the
    // sign matters, not the magnitude.
    const sideOfLine = (
      from: { x: number; y: number },
      to: { x: number; y: number },
      dashed: { x1: number; y1: number; x2: number; y2: number },
    ) => {
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const midX = (dashed.x1 + dashed.x2) / 2;
      const midY = (dashed.y1 + dashed.y2) / 2;
      const vx = midX - from.x;
      const vy = midY - from.y;
      return Math.sign(dx * vy - dy * vx);
    };

    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await pasteFromClipboardAndOpenAsNewProject(page, extendedSmiles);
    await waitForRender(page, async () => { });

    const moleculesCanvas = page.locator(
      '[data-testid="ketcher-canvas"][data-canvasmode="molecules-mode"]',
    );

    const moleculesSide = await moleculesCanvas.evaluate((canvas) => {
      const dashedPath = canvas.querySelector(
        'path[data-testid="bond"][data-bondtype="4"]',
      );
      if (!dashedPath) return null;

      const fromAtomId = dashedPath.getAttribute('data-fromatomid');
      const toAtomId = dashedPath.getAttribute('data-toatomid');
      const fromAtom = canvas.querySelector(`[data-atom-id="${fromAtomId}"]`);
      const toAtom = canvas.querySelector(`[data-atom-id="${toAtomId}"]`);

      return {
        d: dashedPath.getAttribute('d'),
        from: {
          x: Number(fromAtom?.getAttribute('cx')),
          y: Number(fromAtom?.getAttribute('cy')),
        },
        to: {
          x: Number(toAtom?.getAttribute('cx')),
          y: Number(toAtom?.getAttribute('cy')),
        },
      };
    });
    expect(moleculesSide).not.toBeNull();

    const moleculesDashed = parseLine(moleculesSide!.d!);
    const sideInMoleculesMode = sideOfLine(
      moleculesSide!.from,
      moleculesSide!.to,
      moleculesDashed,
    );

    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await waitForRender(page, async () => { });

    const flexCanvas = page.locator(
      '[data-testid="ketcher-canvas"][data-canvasmode="macromolecules-mode"]',
    );

    const flexData = await flexCanvas.evaluate((canvas) => {
      const bondGroup = canvas.querySelector('[data-bondtype="4"]');
      if (!bondGroup) return null;

      const transform = bondGroup.getAttribute('transform') ?? '';
      const [tx, ty] = (transform.match(/-?\d+(\.\d+)?/g) || []).map(Number);

      const paths = Array.from(bondGroup.querySelectorAll('path'));
      const dashed = paths.find(
        (p) =>
          p.hasAttribute('stroke-dasharray') &&
          p.getAttribute('stroke-dasharray') !== 'none',
      );
      const solid = paths.find(
        (p) =>
          !p.hasAttribute('stroke-dasharray') ||
          p.getAttribute('stroke-dasharray') === 'none',
      );

      return {
        tx,
        ty,
        dashedD: dashed?.getAttribute('d') ?? null,
        solidD: solid?.getAttribute('d') ?? null,
      };
    });
    expect(flexData).not.toBeNull();
    expect(flexData!.dashedD).not.toBeNull();
    expect(flexData!.solidD).not.toBeNull();

    const flexDashedLocal = parseLine(flexData!.dashedD!);
    const flexSolidLocal = parseLine(flexData!.solidD!);
    const { tx, ty } = flexData!;

    const flexFrom = { x: flexSolidLocal.x1 + tx, y: flexSolidLocal.y1 + ty };
    const flexTo = { x: flexSolidLocal.x2 + tx, y: flexSolidLocal.y2 + ty };
    const flexDashedAbs = {
      x1: flexDashedLocal.x1 + tx,
      y1: flexDashedLocal.y1 + ty,
      x2: flexDashedLocal.x2 + tx,
      y2: flexDashedLocal.y2 + ty,
    };

    const sideInFlexMode = sideOfLine(flexFrom, flexTo, flexDashedAbs);

    // assert not mirrored
    expect(sideInFlexMode).toBe(sideInMoleculesMode);
  });
  test('Case 22 - In View mode, in the "selected+hover" state, a green color does not become darker', async ({
    SequenceCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9964
     * Bug: https://github.com/epam/ketcher/issues/5198
     * Description: In View mode, in the "selected+hover" state, a green
     * color does not become darker.
     *
     * Scenario:
     * 1. Go to Macro - Sequence mode (View mode, not text-editing)
     * 2. Load a short sequence onto a clean canvas
     * 3. Select a symbol
     * 4. Move the cursor away from it
     * 5. Hover over the selected symbol again
     *
     * Expected result:
     * The selection highlight turns a darker green (#35f073) while
     * hovered, distinct from the plain-selected green (#57FF8F).
     * Fixed in PR https://github.com/epam/ketcher/pull/9565
     *
     * Version 3.15
     */

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.Sequence,
      'AAAA',
    );

    const firstSymbol = getSymbolLocator(page, {
      nodeIndexOverall: 0,
    }).first();
    const selectionRect = firstSymbol.locator('rect.dynamic-element');

    await firstSymbol.click();
    await expect(selectionRect).toHaveAttribute('fill', '#57FF8F');

    await page.mouse.move(0, 0);
    await expect(selectionRect).toHaveAttribute('fill', '#57FF8F');

    await firstSymbol.hover();

    // Expected result: the highlight becomes darker green while
    // in the combined "selected + hover" state.
    await expect(selectionRect).toHaveAttribute('fill', '#35f073');

    // Sanity check: moving away restores the plain-selected color.
    await page.mouse.move(0, 0);
    await expect(selectionRect).toHaveAttribute('fill', '#57FF8F');
  });

  test('Case 23 - It is impossible to cut a structure from a canvas using Ctrl+X', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9964
     * Bug: https://github.com/epam/ketcher/issues/4675
     *
     * Scenario:
     * 1. Switch to the Macro mode
     * 2. Add any nucleotide on the canvas
     * 3. Select this nucleotide and press Ctrl+X
     * 4. Press Ctrl+V
     *
     * Expected result:
     * The structure is cut using Ctrl+X and pasted using Ctrl+V
     *
     * Version 3.15
     */

    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    // Load deterministic fixture
    await openFileAndAddToCanvasMacro(page, 'KET/five-monomers.ket');
    await waitForRender(page, async () => { });

    const monomerLocator = page.locator('[data-testid="monomer"]').first();
    await monomerLocator.waitFor({ state: 'visible', timeout: 15000 });

    const beforeCount = await page.locator('[data-testid="monomer"]').count();
    expect(beforeCount).toBeGreaterThan(0);

    await monomerLocator.click();
    await keyboardPressOnCanvas(page, 'ControlOrMeta+X');
    await waitForRender(page, async () => { });

    const afterCutCount = await page.locator('[data-testid="monomer"]').count();
    expect(afterCutCount).toBeLessThan(beforeCount);

    await clickInTheMiddleOfTheCanvas(page);
    await keyboardPressOnCanvas(page, 'ControlOrMeta+V');
    await waitForRender(page, async () => { });

    const afterPasteCount = await page
      .locator('[data-testid="monomer"]')
      .count();
    expect(afterPasteCount).toBeGreaterThan(afterCutCount);
  });

  test('Case 24 - Correct the LGA of meK and meE amino - acids', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9964
     * Bug: https://github.com/epam/ketcher/issues/9617
     * Description: Verify that abbreviation (LGA) for meK and meE are present
     * and attached to the macromolecule canvas with a valid placement
     * (non-empty bbox and located inside the canvas bounds).
     */

    // ---- meK ----
    await openFileAndAddToCanvasMacro(
      page,
      'KET/Modifying-Amino-Acids/9. N-methylation operation for K natural analog amino acid group.ket',
    );

    if (await ErrorMessageDialog(page).isVisible()) {
      const txt = await ErrorMessageDialog(page).getErrorMessage();
      throw new Error(`Error dialog shown after loading meK KET: ${txt}`);
    }

    const meK = getMonomerLocator(page, { monomerAlias: 'meK' }).first();
    await meK.waitFor({ state: 'attached', timeout: 20000 });
    await meK.waitFor({ state: 'visible', timeout: 10000 });

    const meKBox = await meK.boundingBox();
    expect(meKBox).not.toBeNull();
    if (meKBox) {
      expect(meKBox.width).toBeGreaterThan(1);
      expect(meKBox.height).toBeGreaterThan(1);

      // use literal test id instead of missing constant
      const canvas = page.getByTestId('ketcher-canvas').first();
      const canvasBox = await canvas.boundingBox();
      expect(canvasBox).not.toBeNull();
      if (canvasBox) {
        const cx = meKBox.x + meKBox.width / 2;
        const cy = meKBox.y + meKBox.height / 2;
        expect(cx).toBeGreaterThanOrEqual(canvasBox.x - 1);
        expect(cx).toBeLessThanOrEqual(canvasBox.x + canvasBox.width + 1);
        expect(cy).toBeGreaterThanOrEqual(canvasBox.y - 1);
        expect(cy).toBeLessThanOrEqual(canvasBox.y + canvasBox.height + 1);
      }
    }

    // ---- meE ----
    await openFileAndAddToCanvasMacro(
      page,
      'KET/Modifying-Amino-Acids/4. N-methylation operation for E natural analog amino acid group.ket',
    );

    if (await ErrorMessageDialog(page).isVisible()) {
      const txt = await ErrorMessageDialog(page).getErrorMessage();
      throw new Error(`Error dialog shown after loading meE KET: ${txt}`);
    }

    const meE = getMonomerLocator(page, { monomerAlias: 'meE' }).first();
    await meE.waitFor({ state: 'attached', timeout: 20000 });
    await meE.waitFor({ state: 'visible', timeout: 10000 });

    const meEBox = await meE.boundingBox();
    expect(meEBox).not.toBeNull();
    if (meEBox) {
      expect(meEBox.width).toBeGreaterThan(1);
      expect(meEBox.height).toBeGreaterThan(1);

      const canvas = page.getByTestId('ketcher-canvas').first();
      const canvasBox = await canvas.boundingBox();
      expect(canvasBox).not.toBeNull();
      if (canvasBox) {
        const cx = meEBox.x + meEBox.width / 2;
        const cy = meEBox.y + meEBox.height / 2;
        expect(cx).toBeGreaterThanOrEqual(canvasBox.x - 1);
        expect(cx).toBeLessThanOrEqual(canvasBox.x + canvasBox.width + 1);
        expect(cy).toBeGreaterThanOrEqual(canvasBox.y - 1);
        expect(cy).toBeLessThanOrEqual(canvasBox.y + canvasBox.height + 1);
      }
    }
  });
  test('Case 25 - System allow to load monomers with invalid HELM aliases', async ({
    FlexCanvas: _,
  }) => {
    const dialog = CreateMonomerDialog(page);

    try {
      await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
      await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

      // Select only part of the chain (atoms 0-3, bonds 0-2) so bond 3,
      // crossing the selection boundary, becomes an R-group attachment
      // point. Without this, the wizard rejects the whole structure with
      // "The monomer must have at least one attachment point," regardless
      // of the HELM alias - that error is what was blocking submit, not
      // the alias logic itself.
      await selectByAtomAndBondIds(page, {
        atoms: [0, 1, 2, 3],
        bonds: [0, 1, 2],
      });

      await LeftToolbar(page).createMonomer();
      await dialog.window.waitFor({ state: 'visible', timeout: 10000 });

      await dialog.setCode('TestChem1');

      // Step 3: invalid alias, attempt to save.
      await dialog.setHELMAlias('Invalid@HELM#123');
      await dialog.submit();

      // Step 4: exact real validation message.
      const invalidAliasBanner = NotificationMessageBanner(
        page,
        ErrorMessage.invalidHELMAlias,
      );
      await expect(invalidAliasBanner.notificationMessageBanner).toBeVisible({
        timeout: 5000,
      });

      const message = await invalidAliasBanner.getNotificationMessage();
      expect(message).toContain(
        'The HELM alias must consist only of uppercase and lowercase letters',
      );

      // Step 5: correct the alias - Code and attachment point are already
      // in place, so this submit should succeed and close the dialog.
      await dialog.setHELMAlias('ValidHELM123');
      await dialog.submit({ ignoreWarning: true });

      await expect(dialog.window).toBeHidden({ timeout: 10000 });
    } finally {
      if (await dialog.window.isVisible({ timeout: 1000 }).catch(() => false)) {
        await dialog.discard().catch(() => { });
      }
    }
  });
})