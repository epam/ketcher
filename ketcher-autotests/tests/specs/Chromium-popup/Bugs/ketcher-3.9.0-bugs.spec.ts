/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */
import { test, expect } from '@fixtures';
import { Page } from '@playwright/test';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { ErrorMessageDialog } from '@tests/pages/common/ErrorMessageDialog';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { Valence } from '@tests/pages/constants/atomProperties/Constants';
import {
  MacroBondType,
  MicroBondDataIds,
} from '@tests/pages/constants/bondSelectionTool/Constants';
import {
  ConnectionPointOption,
  MicroAtomOption,
  MicroBondOption,
  MonomerOption,
  QueryAtomOption,
  RingBondCountOption,
  SequenceSymbolOption,
} from '@tests/pages/constants/contextMenu/Constants';
import { MonomerType } from '@tests/pages/constants/createMonomerDialog/Constants';
import { MacromoleculesFileFormatType } from '@tests/pages/constants/fileFormats/macroFileFormats';
import { RNASection } from '@tests/pages/constants/library/Constants';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { Base } from '@tests/pages/constants/monomers/Bases';
import { Chem } from '@tests/pages/constants/monomers/Chem';
import { SequenceMonomerType } from '@tests/pages/constants/monomers/Constants';
import { Nucleotide } from '@tests/pages/constants/monomers/Nucleotides';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { Phosphate } from '@tests/pages/constants/monomers/Phosphates';
import { Sugar } from '@tests/pages/constants/monomers/Sugars';
import { ErrorMessage } from '@tests/pages/constants/notificationMessageBanner/Constants';
import { AtomsSetting } from '@tests/pages/constants/settingsDialog/Constants';
import { TabSection } from '@tests/pages/constants/structureLibraryDialog/Constants';
import { MonomerPreviewTooltip } from '@tests/pages/macromolecules/canvas/MonomerPreviewTooltip';
import { Library } from '@tests/pages/macromolecules/Library';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { BottomToolbar } from '@tests/pages/molecules/BottomToolbar';
import { AtomPropertiesDialog } from '@tests/pages/molecules/canvas/AtomPropertiesDialog';
import { AttachmentPointOption } from '@tests/pages/molecules/canvas/createMonomer/constants/editConnectionPointPopup/Constants';
import { EditConnectionPointPopup } from '@tests/pages/molecules/canvas/createMonomer/EditConnectionPointPopup';
import { NotificationMessageBanner } from '@tests/pages/molecules/canvas/createMonomer/NotificationMessageBanner';
import {
  CreateMonomerDialog,
  prepareMoleculeForMonomerCreation,
} from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import { EnhancedStereochemistry } from '@tests/pages/molecules/canvas/EnhancedStereochemistry';
import { setSettingsOption } from '@tests/pages/molecules/canvas/SettingsDialog';
import { StructureLibraryDialog } from '@tests/pages/molecules/canvas/StructureLibraryDialog';
import { TextEditorDialog } from '@tests/pages/molecules/canvas/TextEditorDialog';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import {
  clickOnCanvas,
  clickOnMiddleOfCanvas,
  copyToClipboardByKeyboard,
  delay,
  dragMouseTo,
  keyboardTypeOnCanvas,
  MacroFileType,
  MolFileFormat,
  openFileAndAddToCanvasAsNewProject,
  openFileAndAddToCanvasAsNewProjectMacro,
  openPPTXFileAndAddToCanvasAsNewProject,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  pasteFromClipboardAndOpenAsNewProject,
  selectAllStructuresOnCanvas,
  selectCanvasArea,
  takeEditorScreenshot,
  takeElementScreenshot,
  takeMonomerLibraryScreenshot,
  updateMonomersLibrary,
  ZoomOutByKeyboard,
} from '@utils';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { getAbbreviationLocator } from '@utils/canvas/s-group-signes/getAbbreviation';
import { getTextLabelLocator } from '@utils/canvas/text/getTextLabelLocator';
import { pageReload } from '@utils/common/helpers';
import {
  FileType,
  verifyFileExport,
  verifyHELMExport,
  verifyPNGExport,
  verifySVGExport,
} from '@utils/files/receiveFileComparisonData';
import {
  AttachmentPoint,
  getMonomerLocator,
  getSymbolLocator,
} from '@utils/macromolecules/monomer';
import { getBondLocator } from '@utils/macromolecules/polymerBond';

let page: Page;

test.describe('Ketcher bugs in 3.9.0: ', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });
  test.beforeEach(async ({ MoleculesCanvas: _ }) => {});
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1: Tooltip shown and addition not allowed when multiple monomers with free R2 are selected', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/7700
     * Description:  System allow to delete monomers leaving connected bonds on the canvas
     * Scenario:
     * 1. Go to Macromolecules mode - Flex canvas (empty)
     * 2. Load from HELM: RNA1{d([Hyp])p.r(A)p.d([Hyp])p.r(A)p.d([Hyp])}$$$$V2.0
     * 3. Press Erase button
     * 4. Press Ctrl+a key to select structure on the canvas
     * 5. Click on all dR monomers
     * 6. Verify that bonds connected to deleted monomers are also deleted
     *
     * Version 3.9
     */
    await ZoomOutByKeyboard(page, { repeat: 2 });
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{d([Hyp])p.r(A)p.d([Hyp])p.r(A)p.d([Hyp])}$$$$V2.0',
    );
    await CommonLeftToolbar(page).erase();
    await selectAllStructuresOnCanvas(page);
    const dRMonomers = getMonomerLocator(page, Sugar.dR);
    const dRMonomerCount = await dRMonomers.count();
    for (let index = 0; index < dRMonomerCount; index += 1) {
      await dRMonomers.first().click();
    }
    for (const bondId of [41, 42, 46, 47, 48, 52, 53]) {
      const bondLocator = getBondLocator(page, { bondId });
      expect(await bondLocator.count()).toBe(0);
    }
  });

  test('Case 2: Microstructure disappears from canvas in Sequence mode when adding new sequence row', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/7783
     * Description:  Microstructure disappears from canvas in Sequence mode when adding new sequence row
     *
     * Scenario:
     *  1. Open Ketcher in Micro mode and place Benzene ring to canvas.
     *  2. Switch to Macro mode -> Sequence
     *  3. Click the plus button to create a new sequence row.
     *  4. Observe the canvas.
     *  5. Click anywhere on the canvas to exit edit mode.
     *
     * Version 3.9
     */
    await BottomToolbar(page).benzene();
    await clickOnMiddleOfCanvas(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    const newSequenceButton = page.getByTestId('NewSequencePlusButton');
    await keyboardTypeOnCanvas(page, 'Ap');
    await newSequenceButton.click();

    const singleBonds = getBondLocator(page, {
      bondType: MicroBondDataIds.Single,
    });
    const doubleBonds = getBondLocator(page, {
      bondType: MicroBondDataIds.Double,
    });

    expect(await singleBonds.count()).toBe(3);
    expect(await doubleBonds.count()).toBe(3);
  });

  test('Case 3: Undo/redo works wrong for monomer reposition corrected by snapping', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/7649
     * Description:  Undo/redo works wrong for monomer reposition corrected by snapping
     *
     * Scenario:
     * 1. Go to Macromolecules mode - Flex (clean canvas)
     * 2. Load from HELM: PEPTIDE1{A.A.A}$$$$V2.0
     * 3. Grab top half of monomer and drag it to bottom part having snapping preventing monomer to move
     * 4. Release
     * 5. Press `Undo` button
     *
     * Version 3.9
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.C.C}$$$$V2.0',
    );
    const aMonomer = getMonomerLocator(page, Peptide.A).first();
    await aMonomer.hover();
    await page.mouse.down();
    const boundingBox = await aMonomer.boundingBox();
    if (boundingBox) {
      await page.mouse.move(
        boundingBox.x + boundingBox.width / 2 - 15,
        boundingBox.y + boundingBox.height / 2 - 15,
      );
      await page.mouse.move(
        boundingBox.x + boundingBox.width / 2 - 5,
        boundingBox.y + boundingBox.height / 2 - 5,
      );
    }
    await page.mouse.up();
    await CommonTopLeftToolbar(page).undo();
    await expect(aMonomer).not.toBeVisible();
  });

  test('Case 4: Gap between icon and Delete label is twice bigger than it should be in Molecules mode', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/7364
     * Description:  Gap between icon and Delete label is twice bigger than it should be in Molecules mode
     *
     * Scenario:
     * 1. Go to Molecules mode
     * 2. Load from SMART: `C1C=CC=CC=1`
     * 3. Select any atom
     * 4. Right click on selected atom to call context menu
     *
     * Version 3.9
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'C1C=CC=CC=1');
    await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
    await ContextMenu(
      page,
      getAtomLocator(page, { atomLabel: 'C', atomId: 0 }),
    ).open();
    await takeElementScreenshot(page, page.getByTestId(MicroBondOption.Delete));
  });

  test('Case 5: Line between Paste option and Create RNA antisense strand option is missing in the context menu', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/7364
     * Description:  Line between Paste option and Create RNA antisense strand option is missing in the context menu
     *
     * Scenario:
     * 1. Go to Macromolecules mode - Flex (clean canvas)
     * 2. Load from HELM: RNA1{r(A)p}$$$$V2.0
     * 3. Open context on A base
     * 4. Validate that there is a separator line between Paste option and Create RNA antisense strand option
     *
     * Version 3.9
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{r(A)p}$$$$V2.0',
    );
    await ContextMenu(page, getMonomerLocator(page, Base.A).first()).open();
    await delay(0.2);
    await takeElementScreenshot(page, page.getByTestId(MonomerOption.Paste), {
      padding: 10,
    });
  });

  test('Case 6: Missing separator line above "Delete" in context menu', async ({
    SequenceCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/7327
     * Description:  Missing separator line above "Delete" in context menu
     *
     * Scenario:
     * 1. Go to Macromolecules mode - Sequence (clean canvas)
     * 2. Load from HELM: PEPTIDE1{A}|RNA1{r(C)p}$PEPTIDE1,RNA1,1:R2-1:R1$$$V2.0
     * 3. Select whole sequence
     * 4. Open context for A amino acid
     * 5. Validate that there is a separator line above "Delete" in context menu
     *
     * Version 3.9
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{r(A)p}$$$$V2.0',
    );
    await ContextMenu(
      page,
      getSymbolLocator(page, { symbolAlias: 'A' }),
    ).open();
    await delay(0.2);
    await takeElementScreenshot(
      page,
      page.getByTestId(SequenceSymbolOption.Delete),
      {
        padding: 20,
      },
    );
  });

  test('Case 7: Ketcher losts aliasHELM property for unknown monomers that makes export to HELM incorrect', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/7256
     * Description:  Ketcher losts aliasHELM property for unknown monomers that makes export to HELM incorrect
     *
     * Scenario:
     * 1. Go to Macromolecules mode - Sequence (clean canvas)
     * 2. Load from HELM: RNA1{[Unknown sugar](A)P.R([Unknown base])P.[Unknown sugar]([Unknown base])P.[Unknown sugar](A)[Unknown phosphate].R([Unknown base])[Unknown phosphate].[Unknown sugar]([Unknown base])[Unknown phosphate].[Unknown sugar](A)}|RNA2{R([Unknown base])}|RNA3{[Unknown sugar]([Unknown base])}$RNA1,RNA2,19:R2-1:R1|RNA2,RNA3,1:R2-1:R1$$$V2.0
     * 3. Verify that all unknown monomers are displayed correctly
     *
     * Version 3.9
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[Unknown sugar](A)P.R([Unknown base])P.[Unknown sugar]([Unknown base])P.[Unknown sugar](A)[Unknown phosphate].R([Unknown base])[Unknown phosphate].[Unknown sugar]([Unknown base])[Unknown phosphate].[Unknown sugar](A)}|RNA2{R([Unknown base])}|RNA3{[Unknown sugar]([Unknown base])}$RNA1,RNA2,19:R2-1:R1|RNA2,RNA3,1:R2-1:R1$$$V2.0',
    );
    await verifyHELMExport(
      page,
      'RNA1{[Unknown sugar](A)p.r([Unknown base])p.[Unknown sugar]([Unknown base])p.[Unknown sugar](A)[Unknown phosphate].r([Unknown base])[Unknown phosphate].[Unknown sugar]([Unknown base])[Unknown phosphate].[Unknown sugar](A).r([Unknown base]).[Unknown sugar]([Unknown base])}$$$$V2.0',
    );
  });

  test('Case 8: Pressing Right Scroll Arrow button of top menu cause exception to console', async ({
    SequenceCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/7770
     * Description:  Pressing Right Scroll Arrow button of top menu cause exception to console
     *
     * Scenario:
     * 1. Open Ketcher in Popup mode
     * 2. Toggle to Macro - Sequence mode
     * 3. Press Right Scroll Arrow button for top menu
     *
     * Version 3.9
     */

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        test.fail(
          msg.type() === 'error',
          `There is error in console: ${msg.text}`,
        );
      }
    });
    await MacromoleculesTopToolbar(page).arrowScrollRight();
  });

  test("Case 9: System shouldn't allow to create monomers for selection with aromatic bonds to non-selected part", async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/7893
     * Description:  System shouldn't allow to create monomers for selection with aromatic bonds to non-selected part
     *
     * Scenario:
     * 1. Go to Molecules mode (clean canvas)
     * 2. Load from SMARTS: `[#6]-[#6](/[#6])-[#6]`
     * 3. Select all except aromatic bond and terminal carbon atom
     *
     * Version 3.9
     */

    await pasteFromClipboardAndOpenAsNewProject(page, '[#6]-[#6](/[#6])-[#6]');
    await prepareMoleculeForMonomerCreation(page, ['2'], ['1']);
    await expect(LeftToolbar(page).createMonomerButton).toBeDisabled();
  });

  test('Case 10: Updated visuals in Right-click context menu', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/5202
     * Description:  Updated visuals in Right-click context menu
     *
     * Scenario:
     * 1. Go to Molecules mode (clean canvas)
     * 2. Load from SMARTS: `CC(C)C`
     * 3. Click right mouse button on first carbon atom to open context menu
     *
     * Version 3.9
     */

    await pasteFromClipboardAndOpenAsNewProject(page, 'CC(C)C');
    await ContextMenu(
      page,
      getAtomLocator(page, { atomLabel: 'C', atomId: 0 }),
    ).hover([MicroAtomOption.QueryProperties, QueryAtomOption.RingBondCount]);
    await delay(0.2);
    await takeElementScreenshot(
      page,
      page.getByTestId(RingBondCountOption.Six),
      { padding: 80 },
    );
  });

  test('Case 11: Stereochemistry dialog crashes Ketcher if only one stereo bond on the canvas', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/7359
     * Description:  Stereochemistry dialog crashes Ketcher if only one stereo bond on the canvas
     *
     * Scenario:
     * 1. Go to Molecules mode
     * 2. Load from SMARTS: `[#6]/[#6]`
     * 3. Press `Stereochemistry` button (or press `Alt+E`)
     *
     * Version 3.9
     */

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        test.fail(
          msg.type() === 'error',
          `There is error in console: ${msg.text}`,
        );
      }
    });
    await pasteFromClipboardAndOpenAsNewProject(page, '[#6]/[#6]');
    await LeftToolbar(page).stereochemistry();
    await EnhancedStereochemistry(page).cancel();
  });

  test('Case 12: IDT aliases not shown at preview tooltip at Monomer Library', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/5417
     * Description:  IDT aliases not shown at preview tooltip at Monomer Library
     *
     * Scenario:
     * 1. Toggle to Macro
     * 2. Go to RNA tab - Phosphates
     * 3. Hover mouse over P phosphate
     *
     * Version 3.9
     */
    await Library(page).hoverMonomer(Phosphate.P);
    await MonomerPreviewTooltip(page).waitForBecomeVisible();
    const idtAliases = await MonomerPreviewTooltip(page).getIDTAliases();
    expect(idtAliases).toBe('(3, 5)Phos');
  });

  test('Case 13: "Create a monomer" option is missing in right-click menu when selection meets conditions', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/7359
     * Description:  "Create a monomer" option is missing in right-click menu when selection meets conditions
     *
     * Scenario:
     * 1. Go to Molecules mode
     * 2. Load from CDX Base64: `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`
     * 3. Select a structure that satisfies requirement 2 (e.g. nucleotide-like substructure)
     * 4. Right-click on the selection
     * 5. Verify that "Create a monomer" option is present in the context menu
     *
     * Version 3.9
     */

    await pasteFromClipboardAndOpenAsNewProject(
      page,
      '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',
    );
    const phosphateAtom = getAtomLocator(page, { atomLabel: 'P' });
    const atomBoundingBox = await phosphateAtom.boundingBox();
    if (atomBoundingBox) {
      await selectCanvasArea(
        page,
        { x: atomBoundingBox.x - 40, y: atomBoundingBox.y - 40 },
        { x: atomBoundingBox.x + 40, y: atomBoundingBox.y + 40 },
      );
    }
    await ContextMenu(page, phosphateAtom).open();
    expect(page.getByTestId(MicroAtomOption.CreateAMonomer)).toBeEnabled();
  });

  test('Case 14: IDT alias of CHEM 5TAMRA is displayed wrong', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/5417
     * Description:  IDT alias of CHEM 5TAMRA is displayed wrong
     *
     * Scenario:
     * 1. Toggle to Macro
     * 2. Go to CHEM tab
     * 3. Hover mouse over 5TAMRA phosphate
     *
     * Version 3.9
     */
    await Library(page).hoverMonomer(Chem._5TAMRA);
    await MonomerPreviewTooltip(page).waitForBecomeVisible();
    const idtAliases = await MonomerPreviewTooltip(page).getIDTAliases();
    expect(idtAliases).toBe('(5)6-TAMN');
  });

  test('Case 15: Microstructure not removed properly with Redo, duplicates on repeated Undo/Redo in Sequence mode', async ({
    SequenceCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/7914
     * Description:  Microstructure not removed properly with Redo, duplicates on repeated Undo/Redo in Sequence mode
     *
     * Scenario:
     * 1. Open Ketcher in Sequence mode.
     * 2. Add a microstructure (e.g., Benzene ring) and some monomers with abbreviations.
     * 3. Select the microstructure and monomer(s) together.
     * 4. Delete them using the right-click menu.
     * 5. Press Undo → everything returns.
     * 6. Press Redo → monomer abbreviation disappears, but microstructure remains.
     *
     * Version 3.9
     */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Chromium-popup/Bugs/ketcher-3.9.0-bugs/micro-and-macro-structures.ket',
    );
    await selectAllStructuresOnCanvas(page);
    await ContextMenu(page, getSymbolLocator(page, { symbolAlias: 'A' })).click(
      SequenceSymbolOption.Delete,
    );
    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).redo();
    await takeEditorScreenshot(page);
  });

  test('Case 16: Export to SVG Documets works wrong for unsplite nucleotides with dash symbole (-) in alias', async ({
    SnakeCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/7934
     * Description:  Export to SVG Documets works wrong for unsplite nucleotides with dash symbole (-) in alias
     *
     * Scenario:
     * 1. Go to Macromolecules mode - Snake canvas (clean canvas)
     * 2. Load from HELM: RNA1{[BHQ-1dT]}$$$$V2.0
     * 3. Export to SVG Document
     *
     * Version 3.9
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[BHQ-1dT]}$$$$V2.0',
    );
    await verifySVGExport(page);
  });

  test('Case 17: Save to SDF button is missed on Salts and Solvents tab in Structure Library dialog', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/7443
     * Description:  "Save to SDF button is missed on Salts and Solvents tab in Structure Library dialog
     *
     * Scenario:
     * 1. Click on SL (Structure Library) icon in the bottom panel
     * 2. Go to Salts and Solvents tab
     * 3. Verify "Save to SDF" button in the bottom left corner
     *
     * Version 3.9
     */

    await BottomToolbar(page).structureLibrary();
    await StructureLibraryDialog(page).openTab(TabSection.SaltsAndSolvents);
    await expect(StructureLibraryDialog(page).saveToSdfButton).toBeVisible();
    await StructureLibraryDialog(page).closeWindow();
  });

  test('Case 18: Undo after deleting RNA preset connected to benzene ring leaves undeletable artifacts in Flex, Snake, and Sequence modes', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/7923
     * Description:  Undo after deleting RNA preset connected to benzene ring leaves undeletable artifacts in Flex, Snake, and Sequence modes
     *
     * Scenario:
     * 1. Open Ketcher in Flex mode (repeat also in Snake and Sequence modes).
     * 2. Open file
     * 3. Select both the preset and benzene ring.
     * 4. Delete them. (Use Erase tool or press Delete button on keyboard)
     * 5. Press Undo.
     *
     * Version 3.9
     */

    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Chromium-popup/Bugs/ketcher-3.9.0-bugs/rna-connected-to-benzene-ring.ket',
    );
    await selectAllStructuresOnCanvas(page);
    await CommonLeftToolbar(page).erase();
    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).redo();
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
  });

  test('Case 19: Missing valence of 0 in mol file', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/7895, https://github.com/epam/Indigo/issues/3193 and https://github.com/epam/Indigo/issues/3016
     * Description:  Missing valence of 0 in mol file
     *
     * Scenario:
     * 1. Go to Molecules mode
     * 2. Load from SMILES: [NaH]
     * 3. Set valence of Na atom to 0
     * 4. Export to MOL file
     * 5. Verify that valence of Na atom is set to 0 in the mol v2000 file
     * 6. Verify that valence of Na atom is set to 0 in the mol v3000 file
     *
     * Version 3.9
     */
    await pasteFromClipboardAndOpenAsNewProject(page, '[NaH]');
    const sodiumAtom = getAtomLocator(page, { atomLabel: 'Na' });
    await ContextMenu(page, sodiumAtom).click(MicroAtomOption.Edit);
    await AtomPropertiesDialog(page).setOptions({
      GeneralProperties: { Valence: Valence.Zero },
    });
    await verifyFileExport(
      page,
      'KET/Chromium-popup/Bugs/ketcher-3.9.0-bugs/zero-valence-v2000-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
    );
    await verifyFileExport(
      page,
      'KET/Chromium-popup/Bugs/ketcher-3.9.0-bugs/zero-valence-v3000-expected.mol',
      FileType.MOL,
      MolFileFormat.v3000,
    );
  });

  test('Case 20: Existing Presets in the library disappear after adding new preset via API', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/8070
     * Description:  Existing Presets in the library disappear after adding new preset via API
     *
     * Scenario:
     * 1. Open Ketcher Standalone
     * 2. Open the browser console and execute: 'await ketcher.updateMonomersLibrary('\n  -INDIGO-08262516282D\n\n  0  0  0  0  0  0  0  0  0  0  0 V3000\nM  V30 BEGIN CTAB\nM  V30 COUNTS 3 2 0 0 0\nM  V30 BEGIN ATOM\nM  V30 1 G 15.9 -4.575 0.0 0 CLASS=BASE SEQID=1 ATTCHORD=(2 2 Al)\nM  V30 2 R 15.9 -3.075 0.0 0 CLASS=SUGAR SEQID=1 ATTCHORD=(4 1 Cx 3 Br)\nM  V30 3 P 17.4 -3.075 0.0 0 CLASS=PHOSPHATE SEQID=1 ATTCHORD=(2 2 Al)\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 1 1 2\nM  V30 2 1 2 3\nM  V30 END BOND\nM  V30 END CTAB\nM  V30 BEGIN TEMPLATE\nM  V30 TEMPLATE 1 BASE/Gua/Z NATREPLACE=BASE/Z\nM  V30 BEGIN CTAB\nM  V30 COUNTS 12 13 2 0 0\nM  V30 BEGIN ATOM\nM  V30 1 N -0.438 0.541 0.0 0\nM  V30 2 C -0.438 -0.459 0.0 0\nM  V30 3 C 0.428 -0.959 0.0 0\nM  V30 4 C 1.294 -0.459 0.0 0\nM  V30 5 N 1.294 0.541 0.0 0\nM  V30 6 C 0.428 1.041 0.0 0\nM  V30 7 N 0.22 -1.937 0.0 0\nM  V30 8 C -0.775 -2.041 0.0 0\nM  V30 9 N -1.182 -1.128 0.0 0\nM  V30 10 O 2.16 -0.959 0.0 0\nM  V30 11 H -2.16 -0.92 0.0 0\nM  V30 12 N 0.428 2.041 0.0 0\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 2 6 1\nM  V30 2 1 1 2\nM  V30 3 2 2 3\nM  V30 4 1 3 4\nM  V30 5 1 4 5\nM  V30 6 1 5 6\nM  V30 7 1 2 9\nM  V30 8 1 9 8\nM  V30 9 2 8 7\nM  V30 10 1 7 3\nM  V30 11 2 4 10\nM  V30 12 1 9 11\nM  V30 13 1 6 12\nM  V30 END BOND\nM  V30 BEGIN SGROUP\nM  V30 1 SUP 1 ATOMS=(1 11) XBONDS=(1 12) BRKXYZ=(9 0.489000 -0.104000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=LGRP\nM  V30 2 SUP 2 ATOMS=(11 1 2 3 4 5 6 7 8 9 10 12) XBONDS=(1 12) BRKXYZ=(9 -0.489000 0.104000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=Z CLASS=BASE SAP=(3 9 11 Al) NATREPLACE=BASE/G\nM  V30 END SGROUP\nM  V30 END CTAB\nM  V30 TEMPLATE 2 SUGAR/Rib/R NATREPLACE=SUGAR/R\nM  V30 BEGIN CTAB\nM  V30 COUNTS 12 12 4 0 0\nM  V30 BEGIN ATOM\nM  V30 1 C 1.499 1.176 0.0 0 CFG=1\nM  V30 2 C 1.656 0.188 0.0 0 CFG=2\nM  V30 3 C 0.765 -0.266 0.0 0 CFG=1\nM  V30 4 C 0.058 0.441 0.0 0 CFG=2\nM  V30 5 O 0.512 1.332 0.0 0\nM  V30 6 O 2.207 1.883 0.0 0\nM  V30 7 O 0.608 -1.254 0.0 0\nM  V30 8 O 2.547 -0.266 0.0 0\nM  V30 9 H 1.386 -1.883 0.0 0\nM  V30 10 C -0.93 0.285 0.0 0\nM  V30 11 O -1.559 1.062 0.0 0\nM  V30 12 H -2.547 0.905 0.0 0\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 1 1 5\nM  V30 2 1 5 4\nM  V30 3 1 4 3\nM  V30 4 1 3 2\nM  V30 5 1 2 1\nM  V30 6 1 1 6 CFG=1\nM  V30 7 1 3 7 CFG=3\nM  V30 8 1 2 8 CFG=1\nM  V30 9 1 7 9\nM  V30 10 1 4 10 CFG=1\nM  V30 11 1 10 11\nM  V30 12 1 11 12\nM  V30 END BOND\nM  V30 BEGIN COLLECTION\nM  V30 MDLV30/STEABS ATOMS=(4 1 2 3 4)\nM  V30 END COLLECTION\nM  V30 BEGIN SGROUP\nM  V30 1 SUP 1 ATOMS=(1 12) XBONDS=(1 12) BRKXYZ=(9 0.494000 0.078500 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=LGRP\nM  V30 2 SUP 2 ATOMS=(1 9) XBONDS=(1 9) BRKXYZ=(9 -0.389000 0.314500 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=LGRP\nM  V30 3 SUP 3 ATOMS=(1 6) XBONDS=(1 6) BRKXYZ=(9 -0.354000 -0.353500 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=OH CLASS=LGRP\nM  V30 4 SUP 4 ATOMS=(9 1 2 3 4 5 7 8 10 11) XBONDS=(3 6 9 12) BRKXYZ=(9 0.354000 0.353500 0.000000 0.389000 -0.314500 0.000000 0.000000 0.000000 0.000000) BRKXYZ=(9 -0.494000 -0.078500 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=R CLASS=SUGAR SAP=(3 11 12 Al) SAP=(3 7 9 Br) SAP=(3 1 6 Cx) NATREPLACE=SUGAR/R\nM  V30 END SGROUP\nM  V30 END CTAB\nM  V30 TEMPLATE 3 PHOSPHATE/P/P NATREPLACE=PHOSPHATE/P\nM  V30 BEGIN CTAB\nM  V30 COUNTS 5 4 3 0 0\nM  V30 BEGIN ATOM\nM  V30 1 P 0.0 0.0 0.0 0\nM  V30 2 O 0.5 -0.866 0.0 0\nM  V30 3 O 0.5 0.866 0.0 0\nM  V30 4 O -1.0 0.0 0.0 0\nM  V30 5 O 1.0 0.0 0.0 0\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 2 1 2\nM  V30 2 1 1 3\nM  V30 3 1 1 4\nM  V30 4 1 1 5\nM  V30 END BOND\nM  V30 BEGIN SGROUP\nM  V30 1 SUP 1 ATOMS=(1 4) XBONDS=(1 3) BRKXYZ=(9 0.500000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=OH CLASS=LGRP\nM  V30 2 SUP 2 ATOMS=(1 5) XBONDS=(1 4) BRKXYZ=(9 -0.500000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=OH CLASS=LGRP\nM  V30 3 SUP 3 ATOMS=(3 1 2 3) XBONDS=(2 3 4) BRKXYZ=(9 -0.500000 0.000000 0.000000 0.500000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=P CLASS=PHOSPHATE SAP=(3 1 4 Al) SAP=(3 1 5 Br) NATREPLACE=PHOSPHATE/P\nM  V30 END SGROUP\nM  V30 END CTAB\nM  V30 END TEMPLATE\nM  END\n>  <type>\nmonomerGroupTemplate\n\n>  <groupClass>\nRNA\n\n>  <groupName>\nZ\n\n>  <idtAliases>\nbase=rZ\n\n$$$$\n', { format: 'sdf' })'
     * 3. Observe the monomer library after the update completes.
     *
     * Version 3.9
     */
    await updateMonomersLibrary(
      page,
      `\n  -INDIGO-10092514292D\n\n  0  0  0  0  0  0  0  0  0  0  0 V3000\nM  V30 BEGIN CTAB\nM  V30 COUNTS 3 2 0 0 0\nM  V30 BEGIN ATOM\nM  V30 1 Base1 7.7 -8.025 0.0 0 CLASS=BASE SEQID=1 ATTCHORD=(2 3 Al)\nM  V30 2 Phosphate1 9.2 -6.525 0.0 0 CLASS=PHOSPHATE SEQID=1 ATTCHORD=(2 3 Al-\nM  V30 )\nM  V30 3 Sugar1 7.7 -6.525 0.0 0 CLASS=SUGAR SEQID=1 ATTCHORD=(4 1 Cx 2 Br)\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 1 3 1\nM  V30 2 1 3 2\nM  V30 END BOND\nM  V30 END CTAB\nM  V30 BEGIN TEMPLATE\nM  V30 TEMPLATE 1 BASE/Base1/Base1 NATREPLACE=BASE/U\nM  V30 BEGIN CTAB\nM  V30 COUNTS 13 12 5 0 0\nM  V30 BEGIN ATOM\nM  V30 1 H -4.33 0.75 0.0 0\nM  V30 2 C -3.464 0.25 0.0 0\nM  V30 3 C -2.598 0.75 0.0 0\nM  V30 4 C -1.732 0.25 0.0 0\nM  V30 5 C -0.866 0.75 0.0 0\nM  V30 6 C 0.0 0.25 0.0 0\nM  V30 7 C 0.866 0.75 0.0 0\nM  V30 8 C 1.732 0.25 0.0 0\nM  V30 9 C 2.598 0.75 0.0 0\nM  V30 10 C 3.464 0.25 0.0 0\nM  V30 11 H 4.33 0.75 0.0 0\nM  V30 12 H -3.464 -0.75 0.0 0\nM  V30 13 H -1.732 -0.75 0.0 0\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 1 1 2\nM  V30 2 1 2 3\nM  V30 3 1 3 4\nM  V30 4 1 4 5\nM  V30 5 1 5 6\nM  V30 6 1 6 7\nM  V30 7 1 7 8\nM  V30 8 1 8 9\nM  V30 9 1 9 10\nM  V30 10 1 10 11\nM  V30 11 1 2 12\nM  V30 12 1 4 13\nM  V30 END BOND\nM  V30 BEGIN SGROUP\nM  V30 1 SUP 1 ATOMS=(1 1) XBONDS=(1 1) BRKXYZ=(9 0.433000 -0.250000 0.000000-\nM  V30  0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=-\nM  V30 LGRP\nM  V30 2 SUP 2 ATOMS=(1 11) XBONDS=(1 10) BRKXYZ=(9 -0.433000 -0.250000 0.000-\nM  V30 000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLA-\nM  V30 SS=LGRP\nM  V30 3 SUP 3 ATOMS=(1 12) XBONDS=(1 11) BRKXYZ=(9 0.000000 0.500000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\nM  V30 =LGRP\nM  V30 4 SUP 4 ATOMS=(1 13) XBONDS=(1 12) BRKXYZ=(9 0.000000 0.500000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\nM  V30 =LGRP\nM  V30 5 SUP 5 ATOMS=(9 2 3 4 5 6 7 8 9 10) XBONDS=(4 1 11 12 10) BRKXYZ=(9 --\nM  V30 0.433000 0.250000 0.000000 0.000000 -0.500000 0.000000 0.000000 0.0000-\nM  V30 00 0.000000) BRKXYZ=(9 0.000000 -0.500000 0.000000 0.433000 0.250000 0-\nM  V30 .000000 0.000000 0.000000 0.000000) LABEL=Base1 CLASS=BASE SAP=(3 2 1 -\nM  V30 Al) SAP=(3 10 11 Br) SAP=(3 2 12 Cx) SAP=(3 4 13 Dx) NATREPLACE=BASE/U\nM  V30 END SGROUP\nM  V30 END CTAB\nM  V30 TEMPLATE 2 PHOSPHATE/Phosphate1/Phosphate1 NATREPLACE=PHOSPHATE/P\nM  V30 BEGIN CTAB\nM  V30 COUNTS 16 15 6 0 0\nM  V30 BEGIN ATOM\nM  V30 1 H -5.196 0.75 0.0 0\nM  V30 2 C -4.33 0.25 0.0 0\nM  V30 3 C -3.464 0.75 0.0 0\nM  V30 4 C -2.598 0.25 0.0 0\nM  V30 5 C -1.732 0.75 0.0 0\nM  V30 6 C -0.866 0.25 0.0 0\nM  V30 7 C 0.0 0.75 0.0 0\nM  V30 8 C 0.866 0.25 0.0 0\nM  V30 9 C 1.732 0.75 0.0 0\nM  V30 10 C 2.598 0.25 0.0 0\nM  V30 11 C 3.464 0.75 0.0 0\nM  V30 12 C 4.33 0.25 0.0 0\nM  V30 13 H 5.196 0.75 0.0 0\nM  V30 14 H -4.33 -0.75 0.0 0\nM  V30 15 H -2.598 -0.75 0.0 0\nM  V30 16 H -0.866 -0.75 0.0 0\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 1 1 2\nM  V30 2 1 2 3\nM  V30 3 1 3 4\nM  V30 4 1 4 5\nM  V30 5 1 5 6\nM  V30 6 1 6 7\nM  V30 7 1 7 8\nM  V30 8 1 8 9\nM  V30 9 1 9 10\nM  V30 10 1 10 11\nM  V30 11 1 11 12\nM  V30 12 1 12 13\nM  V30 13 1 2 14\nM  V30 14 1 4 15\nM  V30 15 1 6 16\nM  V30 END BOND\nM  V30 BEGIN SGROUP\nM  V30 1 SUP 1 ATOMS=(1 1) XBONDS=(1 1) BRKXYZ=(9 0.433000 -0.250000 0.000000-\nM  V30  0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=-\nM  V30 LGRP\nM  V30 2 SUP 2 ATOMS=(1 13) XBONDS=(1 12) BRKXYZ=(9 -0.433000 -0.250000 0.000-\nM  V30 000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLA-\nM  V30 SS=LGRP\nM  V30 3 SUP 3 ATOMS=(1 14) XBONDS=(1 13) BRKXYZ=(9 0.000000 0.500000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\nM  V30 =LGRP\nM  V30 4 SUP 4 ATOMS=(1 15) XBONDS=(1 14) BRKXYZ=(9 0.000000 0.500000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\nM  V30 =LGRP\nM  V30 5 SUP 5 ATOMS=(1 16) XBONDS=(1 15) BRKXYZ=(9 0.000000 0.500000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\nM  V30 =LGRP\nM  V30 6 SUP 6 ATOMS=(11 2 3 4 5 6 7 8 9 10 11 12) XBONDS=(5 1 13 14 15 12) B-\nM  V30 RKXYZ=(9 -0.433000 0.250000 0.000000 0.000000 -0.500000 0.000000 0.000-\nM  V30 000 0.000000 0.000000) BRKXYZ=(9 0.000000 -0.500000 0.000000 0.000000 -\nM  V30 -0.500000 0.000000 0.000000 0.000000 0.000000) BRKXYZ=(9 0.433000 0.25-\nM  V30 0000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) L-\nM  V30 ABEL=Phosphate1 CLASS=PHOSPHATE SAP=(3 2 1 Al) SAP=(3 12 13 Br) SAP=(3-\nM  V30  2 14 Cx) SAP=(3 4 15 Dx) SAP=(3 6 16 Ex) NATREPLACE=PHOSPHATE/P\nM  V30 END SGROUP\nM  V30 END CTAB\nM  V30 TEMPLATE 3 SUGAR/Sugar1/Sugar1 NATREPLACE=SUGAR/R\nM  V30 BEGIN CTAB\nM  V30 COUNTS 14 13 4 0 0\nM  V30 BEGIN ATOM\nM  V30 1 H -5.196 0.75 0.0 0\nM  V30 2 C -4.33 0.25 0.0 0\nM  V30 3 C -3.464 0.75 0.0 0\nM  V30 4 C -2.598 0.25 0.0 0\nM  V30 5 C -1.732 0.75 0.0 0\nM  V30 6 C -0.866 0.25 0.0 0\nM  V30 7 C 0.0 0.75 0.0 0\nM  V30 8 C 0.866 0.25 0.0 0\nM  V30 9 C 1.732 0.75 0.0 0\nM  V30 10 C 2.598 0.25 0.0 0\nM  V30 11 C 3.464 0.75 0.0 0\nM  V30 12 C 4.33 0.25 0.0 0\nM  V30 13 H 5.196 0.75 0.0 0\nM  V30 14 H -4.33 -0.75 0.0 0\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 1 1 2\nM  V30 2 1 2 3\nM  V30 3 1 3 4\nM  V30 4 1 4 5\nM  V30 5 1 5 6\nM  V30 6 1 6 7\nM  V30 7 1 7 8\nM  V30 8 1 8 9\nM  V30 9 1 9 10\nM  V30 10 1 10 11\nM  V30 11 1 11 12\nM  V30 12 1 12 13\nM  V30 13 1 2 14\nM  V30 END BOND\nM  V30 BEGIN SGROUP\nM  V30 1 SUP 1 ATOMS=(1 1) XBONDS=(1 1) BRKXYZ=(9 0.433000 -0.250000 0.000000-\nM  V30  0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=-\nM  V30 LGRP\nM  V30 2 SUP 2 ATOMS=(1 13) XBONDS=(1 12) BRKXYZ=(9 -0.433000 -0.250000 0.000-\nM  V30 000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLA-\nM  V30 SS=LGRP\nM  V30 3 SUP 3 ATOMS=(1 14) XBONDS=(1 13) BRKXYZ=(9 0.000000 0.500000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\nM  V30 =LGRP\nM  V30 4 SUP 4 ATOMS=(11 2 3 4 5 6 7 8 9 10 11 12) XBONDS=(3 1 13 12) BRKXYZ=-\nM  V30 (9 -0.433000 0.250000 0.000000 0.000000 -0.500000 0.000000 0.000000 0.-\nM  V30 000000 0.000000) BRKXYZ=(9 0.433000 0.250000 0.000000 0.000000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000) LABEL=Sugar1 CLASS=SUGAR SAP=(3-\nM  V30  2 1 Al) SAP=(3 12 13 Br) SAP=(3 2 14 Cx) NATREPLACE=SUGAR/R\nM  V30 END SGROUP\nM  V30 END CTAB\nM  V30 END TEMPLATE\nM  END\n>  <type>\nmonomerGroupTemplate\n\n>  <groupClass>\nRNA\n\n>  <groupName>\nZ\n\n>  <idtAliases>\nbase=rZ\n\n$$$$`,
      { format: 'sdf' },
    );
    await Library(page).switchToRNATab();
    await Library(page).openRNASection(RNASection.Presets);
    await takeMonomerLibraryScreenshot(page);
  });

  test.fail(
    'Case 21: HELM (and IDT) alias collision is possible after library update',
    async ({ FlexCanvas: _ }) => {
      // Fails due to issue: https://github.com/epam/ketcher/issues/8394
      /*
       * Test case: https://github.com/epam/ketcher/issues/8351
       * Bug: https://github.com/epam/ketcher/issues/8123
       * Description:  HELM (and IDT) alias collision is possible after library update
       *
       * Scenario:
       * 1. Open Ketcher Standalone
       * 2. Open the browser console and execute: await ketcher.updateMonomersLibrary('\n  -INDIGO-10092512212D\n\n  0  0  0  0  0  0  0  0  0  0  0 V3000\nM  V30 BEGIN CTAB\nM  V30 COUNTS 1 0 0 0 0\nM  V30 BEGIN ATOM\nM  V30 1 Sugar2 10.4962 -10.55 0.0 0 CLASS=SUGAR SEQID=1\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 END BOND\nM  V30 END CTAB\nM  V30 BEGIN TEMPLATE\nM  V30 TEMPLATE 1 SUGAR/Sugar2/Sugar2 NATREPLACE=SUGAR/R\nM  V30 BEGIN CTAB\nM  V30 COUNTS 14 13 4 0 0\nM  V30 BEGIN ATOM\nM  V30 1 H -5.196 0.75 0.0 0\nM  V30 2 C -4.33 0.25 0.0 0\nM  V30 3 C -3.464 0.75 0.0 0\nM  V30 4 C -2.598 0.25 0.0 0\nM  V30 5 C -1.732 0.75 0.0 0\nM  V30 6 C -0.866 0.25 0.0 0\nM  V30 7 C 0.0 0.75 0.0 0\nM  V30 8 C 0.866 0.25 0.0 0\nM  V30 9 C 1.732 0.75 0.0 0\nM  V30 10 C 2.598 0.25 0.0 0\nM  V30 11 C 3.464 0.75 0.0 0\nM  V30 12 C 4.33 0.25 0.0 0\nM  V30 13 H 5.196 0.75 0.0 0\nM  V30 14 H -4.33 -0.75 0.0 0\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 1 1 2\nM  V30 2 1 2 3\nM  V30 3 1 3 4\nM  V30 4 1 4 5\nM  V30 5 1 5 6\nM  V30 6 1 6 7\nM  V30 7 1 7 8\nM  V30 8 1 8 9\nM  V30 9 1 9 10\nM  V30 10 1 10 11\nM  V30 11 1 11 12\nM  V30 12 1 12 13\nM  V30 13 1 2 14\nM  V30 END BOND\nM  V30 BEGIN SGROUP\nM  V30 1 SUP 1 ATOMS=(1 1) XBONDS=(1 1) BRKXYZ=(9 0.433000 -0.250000 0.000000-\nM  V30  0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=-\nM  V30 LGRP\nM  V30 2 SUP 2 ATOMS=(1 13) XBONDS=(1 12) BRKXYZ=(9 -0.433000 -0.250000 0.000-\nM  V30 000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLA-\nM  V30 SS=LGRP\nM  V30 3 SUP 3 ATOMS=(1 14) XBONDS=(1 13) BRKXYZ=(9 0.000000 0.500000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\nM  V30 =LGRP\nM  V30 4 SUP 4 ATOMS=(11 2 3 4 5 6 7 8 9 10 11 12) XBONDS=(3 1 13 12) BRKXYZ=-\nM  V30 (9 -0.433000 0.250000 0.000000 0.000000 -0.500000 0.000000 0.000000 0.-\nM  V30 000000 0.000000) BRKXYZ=(9 0.433000 0.250000 0.000000 0.000000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000) LABEL=Sugar2 CLASS=SUGAR SAP=(3-\nM  V30  2 1 Al) SAP=(3 12 13 Br) SAP=(3 2 14 Cx) NATREPLACE=SUGAR/R\nM  V30 END SGROUP\nM  V30 END CTAB\nM  V30 END TEMPLATE\nM  END\n>  <type>\nmonomerTemplate\n\n>  <aliasHELM>\nSugar1_HELM\n\n$$$$\n', { format: 'sdf' })
       * 3. Open the browser console and execute: await ketcher.updateMonomersLibrary('\n  -INDIGO-10092512212D\n\n  0  0  0  0  0  0  0  0  0  0  0 V3000\nM  V30 BEGIN CTAB\nM  V30 COUNTS 1 0 0 0 0\nM  V30 BEGIN ATOM\nM  V30 1 Sugar3 10.4962 -10.55 0.0 0 CLASS=SUGAR SEQID=1\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 END BOND\nM  V30 END CTAB\nM  V30 BEGIN TEMPLATE\nM  V30 TEMPLATE 1 SUGAR/Sugar3/Sugar3 NATREPLACE=SUGAR/R\nM  V30 BEGIN CTAB\nM  V30 COUNTS 14 13 4 0 0\nM  V30 BEGIN ATOM\nM  V30 1 H -5.196 0.75 0.0 0\nM  V30 2 C -4.33 0.25 0.0 0\nM  V30 3 C -3.464 0.75 0.0 0\nM  V30 4 C -2.598 0.25 0.0 0\nM  V30 5 C -1.732 0.75 0.0 0\nM  V30 6 C -0.866 0.25 0.0 0\nM  V30 7 C 0.0 0.75 0.0 0\nM  V30 8 C 0.866 0.25 0.0 0\nM  V30 9 C 1.732 0.75 0.0 0\nM  V30 10 C 2.598 0.25 0.0 0\nM  V30 11 C 3.464 0.75 0.0 0\nM  V30 12 C 4.33 0.25 0.0 0\nM  V30 13 H 5.196 0.75 0.0 0\nM  V30 14 H -4.33 -0.75 0.0 0\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 1 1 2\nM  V30 2 1 2 3\nM  V30 3 1 3 4\nM  V30 4 1 4 5\nM  V30 5 1 5 6\nM  V30 6 1 6 7\nM  V30 7 1 7 8\nM  V30 8 1 8 9\nM  V30 9 1 9 10\nM  V30 10 1 10 11\nM  V30 11 1 11 12\nM  V30 12 1 12 13\nM  V30 13 1 2 14\nM  V30 END BOND\nM  V30 BEGIN SGROUP\nM  V30 1 SUP 1 ATOMS=(1 1) XBONDS=(1 1) BRKXYZ=(9 0.433000 -0.250000 0.000000-\nM  V30  0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=-\nM  V30 LGRP\nM  V30 2 SUP 2 ATOMS=(1 13) XBONDS=(1 12) BRKXYZ=(9 -0.433000 -0.250000 0.000-\nM  V30 000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLA-\nM  V30 SS=LGRP\nM  V30 3 SUP 3 ATOMS=(1 14) XBONDS=(1 13) BRKXYZ=(9 0.000000 0.500000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\nM  V30 =LGRP\nM  V30 4 SUP 4 ATOMS=(11 2 3 4 5 6 7 8 9 10 11 12) XBONDS=(3 1 13 12) BRKXYZ=-\nM  V30 (9 -0.433000 0.250000 0.000000 0.000000 -0.500000 0.000000 0.000000 0.-\nM  V30 000000 0.000000) BRKXYZ=(9 0.433000 0.250000 0.000000 0.000000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000) LABEL=Sugar3 CLASS=SUGAR SAP=(3-\nM  V30  2 1 Al) SAP=(3 12 13 Br) SAP=(3 2 14 Cx) NATREPLACE=SUGAR/R\nM  V30 END SGROUP\nM  V30 END CTAB\nM  V30 END TEMPLATE\nM  END\n>  <type>\nmonomerTemplate\n\n>  <aliasHELM>\nSugar1_HELM\n\n$$$$\n', { format: 'sdf' })
       * 3. Observe the monomer library after the update completes.
       *
       * Version 3.9
       */
      const errorinConsole = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errorinConsole.push(msg.text());
        }
      });
      await updateMonomersLibrary(
        page,
        `\n  -INDIGO-10092512212D\n\n  0  0  0  0  0  0  0  0  0  0  0 V3000\nM  V30 BEGIN CTAB\nM  V30 COUNTS 1 0 0 0 0\nM  V30 BEGIN ATOM\nM  V30 1 Sugar2 10.4962 -10.55 0.0 0 CLASS=SUGAR SEQID=1\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 END BOND\nM  V30 END CTAB\nM  V30 BEGIN TEMPLATE\nM  V30 TEMPLATE 1 SUGAR/Sugar2/Sugar2 NATREPLACE=SUGAR/R\nM  V30 BEGIN CTAB\nM  V30 COUNTS 14 13 4 0 0\nM  V30 BEGIN ATOM\nM  V30 1 H -5.196 0.75 0.0 0\nM  V30 2 C -4.33 0.25 0.0 0\nM  V30 3 C -3.464 0.75 0.0 0\nM  V30 4 C -2.598 0.25 0.0 0\nM  V30 5 C -1.732 0.75 0.0 0\nM  V30 6 C -0.866 0.25 0.0 0\nM  V30 7 C 0.0 0.75 0.0 0\nM  V30 8 C 0.866 0.25 0.0 0\nM  V30 9 C 1.732 0.75 0.0 0\nM  V30 10 C 2.598 0.25 0.0 0\nM  V30 11 C 3.464 0.75 0.0 0\nM  V30 12 C 4.33 0.25 0.0 0\nM  V30 13 H 5.196 0.75 0.0 0\nM  V30 14 H -4.33 -0.75 0.0 0\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 1 1 2\nM  V30 2 1 2 3\nM  V30 3 1 3 4\nM  V30 4 1 4 5\nM  V30 5 1 5 6\nM  V30 6 1 6 7\nM  V30 7 1 7 8\nM  V30 8 1 8 9\nM  V30 9 1 9 10\nM  V30 10 1 10 11\nM  V30 11 1 11 12\nM  V30 12 1 12 13\nM  V30 13 1 2 14\nM  V30 END BOND\nM  V30 BEGIN SGROUP\nM  V30 1 SUP 1 ATOMS=(1 1) XBONDS=(1 1) BRKXYZ=(9 0.433000 -0.250000 0.000000-\nM  V30  0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=-\nM  V30 LGRP\nM  V30 2 SUP 2 ATOMS=(1 13) XBONDS=(1 12) BRKXYZ=(9 -0.433000 -0.250000 0.000-\nM  V30 000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLA-\nM  V30 SS=LGRP\nM  V30 3 SUP 3 ATOMS=(1 14) XBONDS=(1 13) BRKXYZ=(9 0.000000 0.500000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\nM  V30 =LGRP\nM  V30 4 SUP 4 ATOMS=(11 2 3 4 5 6 7 8 9 10 11 12) XBONDS=(3 1 13 12) BRKXYZ=-\nM  V30 (9 -0.433000 0.250000 0.000000 0.000000 -0.500000 0.000000 0.000000 0.-\nM  V30 000000 0.000000) BRKXYZ=(9 0.433000 0.250000 0.000000 0.000000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000) LABEL=Sugar2 CLASS=SUGAR SAP=(3-\nM  V30  2 1 Al) SAP=(3 12 13 Br) SAP=(3 2 14 Cx) NATREPLACE=SUGAR/R\nM  V30 END SGROUP\nM  V30 END CTAB\nM  V30 END TEMPLATE\nM  END\n>  <type>\nmonomerTemplate\n\n>  <aliasHELM>\nSugar1_HELM\n\n$$$$\n`,
        { format: 'sdf' },
      );
      await updateMonomersLibrary(
        page,
        `\n  -INDIGO-10092512212D\n\n  0  0  0  0  0  0  0  0  0  0  0 V3000\nM  V30 BEGIN CTAB\nM  V30 COUNTS 1 0 0 0 0\nM  V30 BEGIN ATOM\nM  V30 1 Sugar3 10.4962 -10.55 0.0 0 CLASS=SUGAR SEQID=1\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 END BOND\nM  V30 END CTAB\nM  V30 BEGIN TEMPLATE\nM  V30 TEMPLATE 1 SUGAR/Sugar3/Sugar3 NATREPLACE=SUGAR/R\nM  V30 BEGIN CTAB\nM  V30 COUNTS 14 13 4 0 0\nM  V30 BEGIN ATOM\nM  V30 1 H -5.196 0.75 0.0 0\nM  V30 2 C -4.33 0.25 0.0 0\nM  V30 3 C -3.464 0.75 0.0 0\nM  V30 4 C -2.598 0.25 0.0 0\nM  V30 5 C -1.732 0.75 0.0 0\nM  V30 6 C -0.866 0.25 0.0 0\nM  V30 7 C 0.0 0.75 0.0 0\nM  V30 8 C 0.866 0.25 0.0 0\nM  V30 9 C 1.732 0.75 0.0 0\nM  V30 10 C 2.598 0.25 0.0 0\nM  V30 11 C 3.464 0.75 0.0 0\nM  V30 12 C 4.33 0.25 0.0 0\nM  V30 13 H 5.196 0.75 0.0 0\nM  V30 14 H -4.33 -0.75 0.0 0\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 1 1 2\nM  V30 2 1 2 3\nM  V30 3 1 3 4\nM  V30 4 1 4 5\nM  V30 5 1 5 6\nM  V30 6 1 6 7\nM  V30 7 1 7 8\nM  V30 8 1 8 9\nM  V30 9 1 9 10\nM  V30 10 1 10 11\nM  V30 11 1 11 12\nM  V30 12 1 12 13\nM  V30 13 1 2 14\nM  V30 END BOND\nM  V30 BEGIN SGROUP\nM  V30 1 SUP 1 ATOMS=(1 1) XBONDS=(1 1) BRKXYZ=(9 0.433000 -0.250000 0.000000-\nM  V30  0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=-\nM  V30 LGRP\nM  V30 2 SUP 2 ATOMS=(1 13) XBONDS=(1 12) BRKXYZ=(9 -0.433000 -0.250000 0.000-\nM  V30 000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLA-\nM  V30 SS=LGRP\nM  V30 3 SUP 3 ATOMS=(1 14) XBONDS=(1 13) BRKXYZ=(9 0.000000 0.500000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\nM  V30 =LGRP\nM  V30 4 SUP 4 ATOMS=(11 2 3 4 5 6 7 8 9 10 11 12) XBONDS=(3 1 13 12) BRKXYZ=-\nM  V30 (9 -0.433000 0.250000 0.000000 0.000000 -0.500000 0.000000 0.000000 0.-\nM  V30 000000 0.000000) BRKXYZ=(9 0.433000 0.250000 0.000000 0.000000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000) LABEL=Sugar3 CLASS=SUGAR SAP=(3-\nM  V30  2 1 Al) SAP=(3 12 13 Br) SAP=(3 2 14 Cx) NATREPLACE=SUGAR/R\nM  V30 END SGROUP\nM  V30 END CTAB\nM  V30 END TEMPLATE\nM  END\n>  <type>\nmonomerTemplate\n\n>  <aliasHELM>\nSugar1_HELM\n\n$$$$\n`,
        { format: 'sdf' },
      );

      expect(await Library(page).isMonomerExist(Sugar.Sugar2)).toBe(true);
      expect(await Library(page).isMonomerExist(Sugar.Sugar3)).toBe(false);
      expect(errorinConsole.length).toBeGreaterThan(0);
    },
  );

  test('Case 22: R2 attachment point is missing for vinU monomer', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/8040
     * Description:  R2 attachment point is missing for vinU monomer
     *
     * Scenario:
     * 1. Open Macromolecules - Flex mode (clean canvas)
     * 2. Load from AxoLabs: `5'-(vinu)-3'`
     * 3. Hover mouse over appeared monomer
     *
     * Version 3.9
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.AxoLabs,
      `5'-(vinu)-3'`,
    );

    await CommonLeftToolbar(page).bondTool(MacroBondType.Single);
    const vinU = getMonomerLocator(page, Nucleotide.vinU);
    await vinU.hover();
    await expect(vinU.getByTestId(AttachmentPoint.R2)).toBeVisible();
  });

  test('Case 23: Do not save added/updated monomer in local storage', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/8067
     * Description:  Do not save added/updated monomer in local storage
     *
     * Scenario:
     * 1. Open Ketcher Standalone
     * 2. Open the browser console and execute: await ketcher.updateMonomersLibrary("\n  -INDIGO-08262513072D\n\n  0  0  0  0  0  0  0  0  0  0  0 V3000\nM  V30 BEGIN CTAB\nM  V30 COUNTS 1 0 0 0 0\nM  V30 BEGIN ATOM\nM  V30 1 A 1.25 -1.25 0.0 0 CLASS=AA SEQID=1\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 END BOND\nM  V30 END CTAB\nM  V30 BEGIN TEMPLATE\nM  V30 TEMPLATE 1 AA/Ala/A2/ NATREPLACE=AA/A\nM  V30 BEGIN CTAB\nM  V30 COUNTS 7 6 3 0 0\nM  V30 BEGIN ATOM\nM  V30 1 N -0.866 -0.25 0.0 0\nM  V30 2 C 0.0 0.25 0.0 0 CFG=2\nM  V30 3 H -1.732 0.25 0.0 0\nM  V30 4 C 0.866 -0.25 0.0 0\nM  V30 5 O 1.732 0.25 0.0 0\nM  V30 6 O 0.866 -1.25 0.0 0\nM  V30 7 C 0.0 1.25 0.0 0\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 1 1 2\nM  V30 2 1 1 3\nM  V30 3 1 2 4\nM  V30 4 1 4 5\nM  V30 5 2 4 6\nM  V30 6 1 2 7 CFG=1\nM  V30 END BOND\nM  V30 BEGIN COLLECTION\nM  V30 MDLV30/STEABS ATOMS=(1 2)\nM  V30 END COLLECTION\nM  V30 BEGIN SGROUP\nM  V30 1 SUP 1 ATOMS=(1 3) XBONDS=(1 2) BRKXYZ=(9 0.433000 -0.250000 0.000000-\nM  V30  0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=-\nM  V30 LGRP\nM  V30 2 SUP 2 ATOMS=(1 5) XBONDS=(1 4) BRKXYZ=(9 -0.433000 -0.250000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=OH CLAS-\nM  V30 S=LGRP\nM  V30 3 SUP 3 ATOMS=(5 1 2 4 6 7) XBONDS=(2 2 4) BRKXYZ=(9 -0.433000 0.25000-\nM  V30 0 0.000000 0.433000 0.250000 0.000000 0.000000 0.000000 0.000000) LABE-\nM  V30 L=A2 CLASS=AA SAP=(3 1 3 Al) SAP=(3 4 5 Br) NATREPLACE=AA/A\nM  V30 END SGROUP\nM  V30 END CTAB\nM  V30 END TEMPLATE\nM  END\n>  <type>\nmonomerGroupTemplate\n\n>  <aliasHELM>\nA2\n\n>  <modificationType>\nNatural amino acid\n\n$$$$\n", { format: 'sdf' })
     * 3. Validate that the monomer is added to the library
     * 4. Reload the page
     * 5. Validate that the monomer is absent in the library
     *
     * Version 3.9
     */
    await updateMonomersLibrary(
      page,
      `\n  -INDIGO-08262513072D\n\n  0  0  0  0  0  0  0  0  0  0  0 V3000\nM  V30 BEGIN CTAB\nM  V30 COUNTS 1 0 0 0 0\nM  V30 BEGIN ATOM\nM  V30 1 A 1.25 -1.25 0.0 0 CLASS=AA SEQID=1\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 END BOND\nM  V30 END CTAB\nM  V30 BEGIN TEMPLATE\nM  V30 TEMPLATE 1 AA/Ala/A2/ NATREPLACE=AA/A\nM  V30 BEGIN CTAB\nM  V30 COUNTS 7 6 3 0 0\nM  V30 BEGIN ATOM\nM  V30 1 N -0.866 -0.25 0.0 0\nM  V30 2 C 0.0 0.25 0.0 0 CFG=2\nM  V30 3 H -1.732 0.25 0.0 0\nM  V30 4 C 0.866 -0.25 0.0 0\nM  V30 5 O 1.732 0.25 0.0 0\nM  V30 6 O 0.866 -1.25 0.0 0\nM  V30 7 C 0.0 1.25 0.0 0\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 1 1 2\nM  V30 2 1 1 3\nM  V30 3 1 2 4\nM  V30 4 1 4 5\nM  V30 5 2 4 6\nM  V30 6 1 2 7 CFG=1\nM  V30 END BOND\nM  V30 BEGIN COLLECTION\nM  V30 MDLV30/STEABS ATOMS=(1 2)\nM  V30 END COLLECTION\nM  V30 BEGIN SGROUP\nM  V30 1 SUP 1 ATOMS=(1 3) XBONDS=(1 2) BRKXYZ=(9 0.433000 -0.250000 0.000000-\nM  V30  0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=-\nM  V30 LGRP\nM  V30 2 SUP 2 ATOMS=(1 5) XBONDS=(1 4) BRKXYZ=(9 -0.433000 -0.250000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=OH CLAS-\nM  V30 S=LGRP\nM  V30 3 SUP 3 ATOMS=(5 1 2 4 6 7) XBONDS=(2 2 4) BRKXYZ=(9 -0.433000 0.25000-\nM  V30 0 0.000000 0.433000 0.250000 0.000000 0.000000 0.000000 0.000000) LABE-\nM  V30 L=A2 CLASS=AA SAP=(3 1 3 Al) SAP=(3 4 5 Br) NATREPLACE=AA/A\nM  V30 END SGROUP\nM  V30 END CTAB\nM  V30 END TEMPLATE\nM  END\n>  <type>\nmonomerGroupTemplate\n\n>  <aliasHELM>\nA2\n\n>  <modificationType>\nNatural amino acid\n\n$$$$\n`,
      { format: 'sdf' },
    );

    expect(await Library(page).isMonomerExist(Peptide.A2)).toBe(true);
    await pageReload(page);
    expect(await Library(page).isMonomerExist(Peptide.A2)).toBe(false);
  });

  test('Case 24: Ketcher losts attachment point name on loading s-group from mol v3000', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/7877
     * Description:  Ketcher losts attachment point name on loading s-group from mol v3000
     *
     * Scenario:
     * 1. Go to Molecules mode
     * 2. Load from MOLv3000 file: KET/Chromium-popup/Bugs/ketcher-3.9.0-bugs/ket_in.mol
     * 3. Verify export to mol v3000 file
     *
     * Version 3.9
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Chromium-popup/Bugs/ketcher-3.9.0-bugs/ket_in.mol',
    );
    await verifyFileExport(
      page,
      'KET/Chromium-popup/Bugs/ketcher-3.9.0-bugs/ket_in-expected.mol',
      FileType.MOL,
      MolFileFormat.v3000,
    );
  });

  test('Case 25: No validation message shown for minimal monomer structure in Monomer Wizard', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/8002
     * Description:  No validation message shown for minimal monomer structure in Monomer Wizard
     *
     * Scenario:
     * 1. Go to Molecules mode (clean canvas)
     * 2. Load from SMARTS: `C%91.[*:1]%91 |$;_R1$|`
     * 3. Fill all fields with valid data
     * 4. Submit the Create Monomer form
     * 5. Verify that validation message is shown: "Minimal monomer structure is two atoms connected via a single bond."
     *
     * Version 3.9
     */
    const createMonomerDialog = CreateMonomerDialog(page);
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        test.fail(
          msg.type() === 'error',
          `There is error in console: ${msg.text}`,
        );
      }
    });

    await pasteFromClipboardAndOpenAsNewProject(page, 'C%91.[*:1]%91 |$;_R1$|');
    await prepareMoleculeForMonomerCreation(page);
    await LeftToolbar(page).createMonomer();
    await createMonomerDialog.selectType(MonomerType.CHEM);
    await createMonomerDialog.setSymbol('TempSymbol');
    await createMonomerDialog.setName('TempName');
    await createMonomerDialog.submit();
    expect(
      await NotificationMessageBanner(
        page,
        ErrorMessage.notMinimalViableStructure,
      ).getNotificationMessage(),
    ).toEqual(
      'Minimal monomer structure is two atoms connected via a single bond.',
    );
    await CreateMonomerDialog(page).discard();
  });

  test('Case 26: "Edit S-Group" option have to be removed for molecules with connection points (optionaly attached to macro structure)', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/5375
     * Description:  "Edit S-Group" option have to be removed for molecules with connection points (optionaly attached to macro structure)
     *
     * Scenario:
     * 1. Go to Molecules mode (clean canvas)
     * 2. Load from Extended SMILES: `CC*`
     * 3. Right click on the any bond to open the context menu
     * 4. Verify that "Edit S-Group" option is not present in the context menu
     *
     * Version 3.9
     */

    await pasteFromClipboardAndOpenAsNewProject(page, 'CC*');
    const bond = getBondLocator(page, {}).first();
    await ContextMenu(page, bond).open();
    await expect(
      page.getByTestId(MicroBondOption.EditSGroup),
    ).not.toBeVisible();
  });

  test('Case 27: System loads invdC monomer as unresolved monomer from AxoLabs', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/8041
     * Description:  System loads invdC monomer as unresolved monomer from AxoLabs
     *
     * Scenario:
     * 1. Open Macromolecules - Flex mode (clean canvas)
     * 2. Load from AxoLabs: `5'-(invdC)(invdC)(invdC)p-3'`
     * 3. Validate that system loads invdC monomer as unsplit nucleotide
     *
     * Version 3.9
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.AxoLabs,
      `5'-(invdC)(invdC)(invdC)p-3'`,
    );

    const invdC = getMonomerLocator(page, Nucleotide.InvdC);
    expect(await invdC.count()).toBe(3);
  });

  test('Case 28: Font sizes in the Text Editor and on the canvas are different', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/4078
     * Description:  Font sizes in the Text Editor and on the canvas are different
     *
     * Scenario:
     * 1. Go to Molecules mode (clean canvas)
     * 2. Load from PPTX: "Problem with FONTS.pptx"
     * 3. Double click on the text label to open the Text Editor
     * 4. Verify that font size in the Text Editor matches font size on the canvas
     *
     * Version 3.9
     */

    await openPPTXFileAndAddToCanvasAsNewProject(
      page,
      'PPTX/Chromium-popup/Bugs/ketcher-3.9.0-bugs/Problem.with.FONTS.pptx',
    );
    const textLabel = getTextLabelLocator(page, {}).first();
    await textLabel.dblclick();
    await takeEditorScreenshot(page);
    await TextEditorDialog(page).cancel();
  });

  test('Case 29: Create monomer process changes atom of not related part of the molecule', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/7978
     * Description:  Create monomer process changes atom of not related part of the molecule
     *
     * Scenario:
     * 1. Go to Molecules mode (clean canvas)
     * 2. Load from SMARTS: `CCCOCCC`
     * 3. Fill all fields with valid data
     * 4. Submit the Create Monomer form
     * 5. Verify that no H atom appears on the canvas
     *
     * Version 3.9
     */
    const createMonomerDialog = CreateMonomerDialog(page);

    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCOCCC');
    await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
    await prepareMoleculeForMonomerCreation(
      page,
      ['0', '1', '2', '3'],
      ['0', '1', '2', '3'],
    );
    await LeftToolbar(page).createMonomer();
    await createMonomerDialog.selectType(MonomerType.Sugar);
    await createMonomerDialog.setSymbol('qeg');
    await createMonomerDialog.setName('gly');
    await createMonomerDialog.submit();

    const hAtom = getAtomLocator(page, { atomLabel: 'H' }).first();
    expect(await hAtom.count()).toBe(0);

    await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
  });

  test('Case 30: Monomer Wizard allows creation of monomer with Functional Group', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/8000
     * Description:  Monomer Wizard allows creation of monomer with Functional Group
     *
     * Scenario:
     * 1. Go to Molecules mode (clean canvas)
     * 2. Load from SMARTS: `C%91.[*:1]%91 |$;_R1$|`
     * 3. Open Create Monomer dialog
     * 4. Open Structure Library from Create Monomer dialog
     * 5. Verify that Functional Group tab is disabled
     *
     * Version 3.9
     */

    await pasteFromClipboardAndOpenAsNewProject(page, 'C%91.[*:1]%91 |$;_R1$|');
    await prepareMoleculeForMonomerCreation(page);
    await LeftToolbar(page).createMonomer();
    await BottomToolbar(page).structureLibrary();

    expect(StructureLibraryDialog(page).functionalGroupTab).toBeDisabled();
    await StructureLibraryDialog(page).closeWindow();
    await CreateMonomerDialog(page).discard();
  });

  test('Case 31: Changing name for attachment points works wrong', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/8005
     * Description:  Changing name for attachment points works wrong
     *
     * Scenario:
     * 1. Go to Molecules mode (clean canvas)
     * 2. Load from SMARTS: `CC%91.[*:1]%91 |$;;_R1$|`
     * 3. Select whole structure and open Create Monomer dialog
     * 4. Edit R1 attachment point
     * 5. Verify that list of attachment points contains R1, R2, R3
     *
     * Version 3.9
     */

    await pasteFromClipboardAndOpenAsNewProject(page, 'C%91.[*:1]%91 |$;_R1$|');
    await prepareMoleculeForMonomerCreation(page);
    await LeftToolbar(page).createMonomer();
    // to make molecule visible
    await CommonLeftToolbar(page).handTool();
    await page.mouse.move(600, 200);
    await dragMouseTo(600, 250, page);

    const attachmentPointR1 = page.getByTestId(AttachmentPoint.R1).first();
    await ContextMenu(page, attachmentPointR1).click(
      ConnectionPointOption.EditConnectionPoint,
    );

    await EditConnectionPointPopup(page).connectionPointNameCombobox.click();
    await expect(
      page.getByTestId(AttachmentPointOption.R1).first(),
    ).toBeVisible();
    await expect(
      page.getByTestId(AttachmentPointOption.R2).first(),
    ).toBeVisible();
    await expect(
      page.getByTestId(AttachmentPointOption.R3).first(),
    ).toBeVisible();

    await clickOnCanvas(page, 0, 0);
    await CreateMonomerDialog(page).discard();
  });

  test('Case 32: Export (or import) to (from) Mol v3000 works wrong for CHEM monomers', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/Indigo/issues/3206
     * Description:  Export (or import) to (from) Mol v3000 works wrong for CHEM monomers
     *
     * Scenario:
     * 1. Go to Molecules mode (clean canvas)
     * 2. Load using Paste from clipboard way: CHEM1{[5TAMRA]}$$$$V2.0
     * 3. Export canvas to Mol v3000
     * 4. Load export result back to canvas
     * 5. Save canvas to HELM
     *
     * Version 3.9
     */

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'CHEM1{[5TAMRA]}$$$$V2.0',
    );
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.MDLMolfileV3000,
    );
    const MolfileV3000ExportResult = await SaveStructureDialog(
      page,
    ).getTextAreaValue();
    await SaveStructureDialog(page).cancel();
    await CommonTopLeftToolbar(page).clearCanvas();
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.MOLv3000,
      MolfileV3000ExportResult,
    );
    await verifyHELMExport(page, 'CHEM1{[5TAMRA]}$$$$V2.0');
  });

  test('Case 33: Create Monomer tool can not be hidden by toolbar buttons config', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/8296
     * Description:  Create Monomer tool can not be hidden by toolbar buttons config
     *
     * Scenario:
     * 1. Load ketcher with `/?hiddenControls=create-monomer` in URL
     * 2. Verify that Create Monomer tool is not present in the left toolbar
     *
     * Version 3.9
     */
    await page.goto('/popup?hiddenControls=create-monomer');
    await expect(LeftToolbar(page).createMonomerButton).not.toBeVisible();
    await page.goto('/popup');
  });

  test('Case 34: System loads Sequence with numbers in middle', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/Indigo/issues/3210
     * Description:  System loads Sequence with numbers in middle
     *
     * Scenario:
     * 1. Go to Macro - Flex mode (clean canvas)
     * 2. Load Sequence-RNA using Paste from clipboard way: 12w12r23e32e33
     *
     * Version 3.9
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      [MacroFileType.Sequence, SequenceMonomerType.RNA],
      '12w12r23e32e33',
    );
    const errorMessage = await ErrorMessageDialog(page).getErrorMessage();
    expect(errorMessage).toContain(
      `Convert error! Given string could not be loaded as (query or plain) molecule or reaction, see the error messages: 'SEQUENCE loader: Invalid symbols in the sequence: 1,2,2,3,E,3,2,E,3,3'`,
    );
  });

  test("Case 35: System can't load sugar-phosphate preset from HELM if sugar provided with HELMAlias name", async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/Indigo/issues/3210
     * Description:  System can't load sugar-phosphate preset from HELM if sugar provided with HELMAlias name
     *
     * Scenario:
     * 1. Go to Macro - Flex mode (clean canvas)
     * 2. Load HELM: RNA1{[d12r].p}$$$$V2.0
     * 3. Validate presence of d12r and p monomers on the canvas
     *
     * Version 3.9
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[d12r].p}$$$$V2.0',
    );

    const d12r = getMonomerLocator(page, Sugar._12ddR);
    const p = getMonomerLocator(page, Phosphate.P);
    expect(await d12r.count()).toBe(1);
    expect(await p.count()).toBe(1);
  });

  test('Case 36: System allows to export not a purely amino acid to Sequence (3-letter code)', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/Indigo/issues/3200
     * Description:  System allows to export not a purely amino acid to Sequence (3-letter code)
     *
     * Scenario:
     * 1. Go to Macro - Flex mode (clean canvas)
     * 2. Load using Paste from clipboard way: PEPTIDE1{A}|RNA1{R}$PEPTIDE1,RNA1,1:R2-1:R1$$$V2.0
     * 3. Export to Sequence (3-letter code)
     * 4. Verify error message: "Convert error! Sequence saver: Only amino acids can be saved as three letter amino acid codes."
     *
     * Version 3.9
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A}|RNA1{R}$PEPTIDE1,RNA1,1:R2-1:R1$$$V2.0',
    );
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.Sequence3LetterCode,
    );
    const errorMessage = await ErrorMessageDialog(page).getErrorMessage();
    expect(errorMessage).toContain(
      `Convert error! Sequence saver: Only amino acids can be saved as three letter amino acid codes.`,
    );
    await ErrorMessageDialog(page).close();
    await SaveStructureDialog(page).cancel();
  });

  test('Case 37: Unable to copy user created monomer, exception: Convert error! molecule: casting to molecule is invalid', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/7914
     * Description:  Unable to copy user created monomer, exception: Convert error! molecule: casting to molecule is invalid
     *
     * Scenario:
     * 1. Switch to Molecules mode (clean canvas)
     * 2. Load from KET: Unable to copy.ket
     * 3. Select created monomer on the canvas
     * 4. Copy/Paste the selected monomer
     * 5. Verify that no error occurs
     *
     * Version 3.9
     */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Chromium-popup/Bugs/ketcher-3.9.0-bugs/Unable to copy.ket',
    );
    await getAbbreviationLocator(page, { id: '0' }).click();
    await copyToClipboardByKeyboard(page);
    expect(await ErrorMessageDialog(page).isVisible()).toBeFalsy();
  });

  test('Case 38: One time exception on export to RXN: molecule: casting to molecule is invalid', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/Indigo/issues/3141
     * Description:  One time exception on export to RXN: molecule: casting to molecule is invalid
     *
     * Scenario:
     * 1. Switch to Molecules mode (clean canvas)
     * 2. Load from KET: Memory problem.ket
     * 3. Press Save button
     * 4. Verify that no error occurs
     *
     * Version 3.9
     */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Chromium-popup/Bugs/ketcher-3.9.0-bugs/Memory problem.ket',
    );
    await CommonTopLeftToolbar(page).saveFile();
    expect(await ErrorMessageDialog(page).isVisible()).toBeFalsy();
    await SaveStructureDialog(page).cancel();
  });

  test('Case 39: Export to SVG/PNG doesn\'t work for molecules with "star" atom. System throws an error: molecule render internal: Query atom type 4 not supported', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/Indigo/issues/3079
     * Description:  Export to SVG/PNG doesn't work for molecules with "star" atom. System throws an error: molecule render internal: Query atom type 4 not supported
     *
     * Scenario:
     * 1. Go to Molecules mode
     * 2. Load from SMILES: *1C=*C=*C=1 |$star_e;;star_e;;star_e;$|
     * 3. Verify export to PNG
     *
     * Version 3.9
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      '*1C=*C=*C=1 |$star_e;;star_e;;star_e;$|',
    );
    await verifyPNGExport(page);
    await verifySVGExport(page);
  });

  test('Case 40: Saving to RXN v2000 encloses Polymer labels into double quotes', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/Indigo/issues/3070
     * Description:  Saving to RXN v2000 encloses Polymer labels into double quotes
     *
     * Scenario:
     * 1. Switch to Molecules mode (clean canvas)
     * 2. Load from KET: Double quotes.ket
     * 3. Take screnshot of the loaded molecule
     *
     * Version 3.9
     */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Chromium-popup/Bugs/ketcher-3.9.0-bugs/Double quotes.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Case 41: Unable to add user`s peptide, nucleotide and CHEM to the library', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/Indigo/issues/3234
     * Description:  Unable to add user`s peptide, nucleotide and CHEM to the library
     *
     * Scenario:
     * 1. Open Ketcher Standalone
     * 2. Open the browser console and execute: await ketcher.updateMonomersLibrary('\n  -INDIGO-10082514212D\n\n  0  0  0  0  0  0  0  0  0  0  0 V3000\nM  V30 BEGIN CTAB\nM  V30 COUNTS 3 2 3 0 0\nM  V30 BEGIN ATOM\nM  V30 1 H 9.57503 -9.3 0.0 0\nM  V30 2 C 10.441 -9.8 0.0 0\nM  V30 3 H 11.307 -9.3 0.0 0\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 1 1 2\nM  V30 2 1 2 3\nM  V30 END BOND\nM  V30 BEGIN SGROUP\nM  V30 1 SUP 1 ATOMS=(1 1) XBONDS=(1 1) BRKXYZ=(9 0.433000 -0.250000 0.000000-\nM  V30  0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=-\nM  V30 LGRP\nM  V30 2 SUP 2 ATOMS=(1 3) XBONDS=(1 2) BRKXYZ=(9 -0.433000 -0.250000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\nM  V30 =LGRP\nM  V30 3 SUP 3 ATOMS=(1 2) XBONDS=(2 1 2) BRKXYZ=(9 -0.433000 0.250000 0.0000-\nM  V30 00 0.433000 0.250000 0.000000 0.000000 0.000000 0.000000) LABEL=Nucleo-\nM  V30 tideX CLASS=RNA ESTATE=E SAP=(3 2 1 Al) SAP=(3 2 3 Br) NATREPLACE=RNA/-\nM  V30 X\nM  V30 END SGROUP\nM  V30 END CTAB\nM  END\n>  <type>\nmonomerTemplate\n\n>  <aliasHELM>\nNucleotideX\n\n$$$$\n', { format: 'sdf' })
     * 3. Open the browser console and execute: await ketcher.updateMonomersLibrary('\n  -INDIGO-10082516462D\n\n  0  0  0  0  0  0  0  0  0  0  0 V3000\nM  V30 BEGIN CTAB\nM  V30 COUNTS 5 4 5 0 0\nM  V30 BEGIN ATOM\nM  V30 1 C 10.625 -8.8 0.0 0\nM  V30 2 H 10.125 -9.666 0.0 0\nM  V30 3 H 11.491 -9.3 0.0 0\nM  V30 4 H 9.759 -8.3 0.0 0\nM  V30 5 H 11.125 -7.934 0.0 0\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 1 1 2\nM  V30 2 1 1 3\nM  V30 3 1 1 4\nM  V30 4 1 1 5\nM  V30 END BOND\nM  V30 BEGIN SGROUP\nM  V30 1 SUP 1 ATOMS=(1 4) XBONDS=(1 3) BRKXYZ=(9 0.433000 -0.250000 0.000000-\nM  V30  0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=-\nM  V30 LGRP\nM  V30 2 SUP 2 ATOMS=(1 5) XBONDS=(1 4) BRKXYZ=(9 -0.250000 -0.433000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\nM  V30 =LGRP\nM  V30 3 SUP 3 ATOMS=(1 3) XBONDS=(1 2) BRKXYZ=(9 -0.433000 0.250000 0.000000-\nM  V30  0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=-\nM  V30 LGRP\nM  V30 4 SUP 4 ATOMS=(1 2) XBONDS=(1 1) BRKXYZ=(9 0.250000 0.433000 0.000000 -\nM  V30 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=L-\nM  V30 GRP\nM  V30 5 SUP 5 ATOMS=(1 1) XBONDS=(4 1 2 3 4) BRKXYZ=(9 -0.250000 -0.433000 0-\nM  V30 .000000 0.433000 -0.250000 0.000000 0.000000 0.000000 0.000000) BRKXYZ-\nM  V30 =(9 -0.433000 0.250000 0.000000 0.250000 0.433000 0.000000 0.000000 0.-\nM  V30 000000 0.000000) LABEL=CHEM1 CLASS=LINKER ESTATE=E SAP=(3 1 4 Al) SAP=(-\nM  V30 3 1 5 Br) SAP=(3 1 3 Cx) SAP=(3 1 2 Dx)\nM  V30 END SGROUP\nM  V30 END CTAB\nM  END\n>  <type>\nmonomerTemplate\n\n>  <aliasHELM>\nCHEM1\n\n$$$$\n', { format: 'sdf' })
     * 4. Open the browser console and execute: await ketcher.updateMonomersLibrary('\n  -INDIGO-10082517132D\n\n  0  0  0  0  0  0  0  0  0  0  0 V3000\nM  V30 BEGIN CTAB\nM  V30 COUNTS 4 3 4 0 0\nM  V30 BEGIN ATOM\nM  V30 1 H 8.07503 -8.225 0.0 0\nM  V30 2 C 8.94103 -8.725 0.0 0\nM  V30 3 H 9.80703 -8.225 0.0 0\nM  V30 4 H 8.94103 -9.725 0.0 0\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 1 1 2\nM  V30 2 1 2 3\nM  V30 3 1 2 4\nM  V30 END BOND\nM  V30 BEGIN SGROUP\nM  V30 1 SUP 1 ATOMS=(1 1) XBONDS=(1 1) BRKXYZ=(9 0.433000 -0.250000 0.000000-\nM  V30  0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=-\nM  V30 LGRP\nM  V30 2 SUP 2 ATOMS=(1 3) XBONDS=(1 2) BRKXYZ=(9 -0.433000 -0.250000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\nM  V30 =LGRP\nM  V30 3 SUP 3 ATOMS=(1 4) XBONDS=(1 3) BRKXYZ=(9 0.000000 0.500000 0.000000 -\nM  V30 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=L-\nM  V30 GRP\nM  V30 4 SUP 4 ATOMS=(1 2) XBONDS=(3 1 2 3) BRKXYZ=(9 -0.433000 0.250000 0.00-\nM  V30 0000 0.433000 0.250000 0.000000 0.000000 0.000000 0.000000) BRKXYZ=(9 -\nM  V30 0.000000 -0.500000 0.000000 0.000000 0.000000 0.000000 0.000000 0.0000-\nM  V30 00 0.000000) LABEL=PeptideX CLASS=AA ESTATE=E SAP=(3 2 1 Al) SAP=(3 2 -\nM  V30 3 Br) SAP=(3 2 4 Cx) NATREPLACE=AA/X\nM  V30 END SGROUP\nM  V30 END CTAB\nM  END\n>  <type>\nmonomerTemplate\n\n>  <aliasHELM>\nPeptideX\n\n$$$$\n', { format: 'sdf' })
     * 3. Observe the monomer library after the update completes.
     *
     * Version 3.9
     */
    const errorinConsole = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errorinConsole.push(msg.text());
      }
    });
    await updateMonomersLibrary(
      page,
      `\n  -INDIGO-10082514212D\n\n  0  0  0  0  0  0  0  0  0  0  0 V3000\nM  V30 BEGIN CTAB\nM  V30 COUNTS 3 2 3 0 0\nM  V30 BEGIN ATOM\nM  V30 1 H 9.57503 -9.3 0.0 0\nM  V30 2 C 10.441 -9.8 0.0 0\nM  V30 3 H 11.307 -9.3 0.0 0\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 1 1 2\nM  V30 2 1 2 3\nM  V30 END BOND\nM  V30 BEGIN SGROUP\nM  V30 1 SUP 1 ATOMS=(1 1) XBONDS=(1 1) BRKXYZ=(9 0.433000 -0.250000 0.000000-\nM  V30  0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=-\nM  V30 LGRP\nM  V30 2 SUP 2 ATOMS=(1 3) XBONDS=(1 2) BRKXYZ=(9 -0.433000 -0.250000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\nM  V30 =LGRP\nM  V30 3 SUP 3 ATOMS=(1 2) XBONDS=(2 1 2) BRKXYZ=(9 -0.433000 0.250000 0.0000-\nM  V30 00 0.433000 0.250000 0.000000 0.000000 0.000000 0.000000) LABEL=Nucleo-\nM  V30 tideX CLASS=RNA ESTATE=E SAP=(3 2 1 Al) SAP=(3 2 3 Br) NATREPLACE=RNA/-\nM  V30 X\nM  V30 END SGROUP\nM  V30 END CTAB\nM  END\n>  <type>\nmonomerTemplate\n\n>  <aliasHELM>\nNucleotideX\n\n$$$$\n`,
      { format: 'sdf' },
    );
    await updateMonomersLibrary(
      page,
      `\n  -INDIGO-10082516462D\n\n  0  0  0  0  0  0  0  0  0  0  0 V3000\nM  V30 BEGIN CTAB\nM  V30 COUNTS 5 4 5 0 0\nM  V30 BEGIN ATOM\nM  V30 1 C 10.625 -8.8 0.0 0\nM  V30 2 H 10.125 -9.666 0.0 0\nM  V30 3 H 11.491 -9.3 0.0 0\nM  V30 4 H 9.759 -8.3 0.0 0\nM  V30 5 H 11.125 -7.934 0.0 0\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 1 1 2\nM  V30 2 1 1 3\nM  V30 3 1 1 4\nM  V30 4 1 1 5\nM  V30 END BOND\nM  V30 BEGIN SGROUP\nM  V30 1 SUP 1 ATOMS=(1 4) XBONDS=(1 3) BRKXYZ=(9 0.433000 -0.250000 0.000000-\nM  V30  0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=-\nM  V30 LGRP\nM  V30 2 SUP 2 ATOMS=(1 5) XBONDS=(1 4) BRKXYZ=(9 -0.250000 -0.433000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\nM  V30 =LGRP\nM  V30 3 SUP 3 ATOMS=(1 3) XBONDS=(1 2) BRKXYZ=(9 -0.433000 0.250000 0.000000-\nM  V30  0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=-\nM  V30 LGRP\nM  V30 4 SUP 4 ATOMS=(1 2) XBONDS=(1 1) BRKXYZ=(9 0.250000 0.433000 0.000000 -\nM  V30 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=L-\nM  V30 GRP\nM  V30 5 SUP 5 ATOMS=(1 1) XBONDS=(4 1 2 3 4) BRKXYZ=(9 -0.250000 -0.433000 0-\nM  V30 .000000 0.433000 -0.250000 0.000000 0.000000 0.000000 0.000000) BRKXYZ-\nM  V30 =(9 -0.433000 0.250000 0.000000 0.250000 0.433000 0.000000 0.000000 0.-\nM  V30 000000 0.000000) LABEL=CHEM1 CLASS=LINKER ESTATE=E SAP=(3 1 4 Al) SAP=(-\nM  V30 3 1 5 Br) SAP=(3 1 3 Cx) SAP=(3 1 2 Dx)\nM  V30 END SGROUP\nM  V30 END CTAB\nM  END\n>  <type>\nmonomerTemplate\n\n>  <aliasHELM>\nCHEM1\n\n$$$$\n`,
      { format: 'sdf' },
    );
    await updateMonomersLibrary(
      page,
      `\n  -INDIGO-10082517132D\n\n  0  0  0  0  0  0  0  0  0  0  0 V3000\nM  V30 BEGIN CTAB\nM  V30 COUNTS 4 3 4 0 0\nM  V30 BEGIN ATOM\nM  V30 1 H 8.07503 -8.225 0.0 0\nM  V30 2 C 8.94103 -8.725 0.0 0\nM  V30 3 H 9.80703 -8.225 0.0 0\nM  V30 4 H 8.94103 -9.725 0.0 0\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 1 1 2\nM  V30 2 1 2 3\nM  V30 3 1 2 4\nM  V30 END BOND\nM  V30 BEGIN SGROUP\nM  V30 1 SUP 1 ATOMS=(1 1) XBONDS=(1 1) BRKXYZ=(9 0.433000 -0.250000 0.000000-\nM  V30  0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=-\nM  V30 LGRP\nM  V30 2 SUP 2 ATOMS=(1 3) XBONDS=(1 2) BRKXYZ=(9 -0.433000 -0.250000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\nM  V30 =LGRP\nM  V30 3 SUP 3 ATOMS=(1 4) XBONDS=(1 3) BRKXYZ=(9 0.000000 0.500000 0.000000 -\nM  V30 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=L-\nM  V30 GRP\nM  V30 4 SUP 4 ATOMS=(1 2) XBONDS=(3 1 2 3) BRKXYZ=(9 -0.433000 0.250000 0.00-\nM  V30 0000 0.433000 0.250000 0.000000 0.000000 0.000000 0.000000) BRKXYZ=(9 -\nM  V30 0.000000 -0.500000 0.000000 0.000000 0.000000 0.000000 0.000000 0.0000-\nM  V30 00 0.000000) LABEL=PeptideX CLASS=AA ESTATE=E SAP=(3 2 1 Al) SAP=(3 2 -\nM  V30 3 Br) SAP=(3 2 4 Cx) NATREPLACE=AA/X\nM  V30 END SGROUP\nM  V30 END CTAB\nM  END\n>  <type>\nmonomerTemplate\n\n>  <aliasHELM>\nPeptideX\n\n$$$$\n`,
      { format: 'sdf' },
    );

    expect(await Library(page).isMonomerExist(Nucleotide.NucleotideX)).toBe(
      true,
    );
    expect(await Library(page).isMonomerExist(Chem.CHEM1)).toBe(true);
    expect(await Library(page).isMonomerExist(Peptide.PeptideX)).toBe(true);
    expect(errorinConsole.length).toBe(0);
  });

  test('Case 42: Monomer name is missed if updated from the API', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/Indigo/issues/3238
     * Description:  Monomer name is missed if updated from the API
     *
     * Scenario:
     * 1. Open Ketcher Standalone
     * 2. Open the browser console and execute: await ketcher.updateMonomersLibrary('\n  -INDIGO-10092512212D\n\n  0  0  0  0  0  0  0  0  0  0  0 V3000\nM  V30 BEGIN CTAB\nM  V30 COUNTS 1 0 0 0 0\nM  V30 BEGIN ATOM\nM  V30 1 Sugar1 10.4962 -10.55 0.0 0 CLASS=SUGAR SEQID=1\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 END BOND\nM  V30 END CTAB\nM  V30 BEGIN TEMPLATE\nM  V30 TEMPLATE 1 SUGAR/Sugar1/Sugar1 NATREPLACE=SUGAR/R\nM  V30 BEGIN CTAB\nM  V30 COUNTS 14 13 4 0 0\nM  V30 BEGIN ATOM\nM  V30 1 H -5.196 0.75 0.0 0\nM  V30 2 C -4.33 0.25 0.0 0\nM  V30 3 C -3.464 0.75 0.0 0\nM  V30 4 C -2.598 0.25 0.0 0\nM  V30 5 C -1.732 0.75 0.0 0\nM  V30 6 C -0.866 0.25 0.0 0\nM  V30 7 C 0.0 0.75 0.0 0\nM  V30 8 C 0.866 0.25 0.0 0\nM  V30 9 C 1.732 0.75 0.0 0\nM  V30 10 C 2.598 0.25 0.0 0\nM  V30 11 C 3.464 0.75 0.0 0\nM  V30 12 C 4.33 0.25 0.0 0\nM  V30 13 H 5.196 0.75 0.0 0\nM  V30 14 H -4.33 -0.75 0.0 0\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 1 1 2\nM  V30 2 1 2 3\nM  V30 3 1 3 4\nM  V30 4 1 4 5\nM  V30 5 1 5 6\nM  V30 6 1 6 7\nM  V30 7 1 7 8\nM  V30 8 1 8 9\nM  V30 9 1 9 10\nM  V30 10 1 10 11\nM  V30 11 1 11 12\nM  V30 12 1 12 13\nM  V30 13 1 2 14\nM  V30 END BOND\nM  V30 BEGIN SGROUP\nM  V30 1 SUP 1 ATOMS=(1 1) XBONDS=(1 1) BRKXYZ=(9 0.433000 -0.250000 0.000000-\nM  V30  0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=-\nM  V30 LGRP\nM  V30 2 SUP 2 ATOMS=(1 13) XBONDS=(1 12) BRKXYZ=(9 -0.433000 -0.250000 0.000-\nM  V30 000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLA-\nM  V30 SS=LGRP\nM  V30 3 SUP 3 ATOMS=(1 14) XBONDS=(1 13) BRKXYZ=(9 0.000000 0.500000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\nM  V30 =LGRP\nM  V30 4 SUP 4 ATOMS=(11 2 3 4 5 6 7 8 9 10 11 12) XBONDS=(3 1 13 12) BRKXYZ=-\nM  V30 (9 -0.433000 0.250000 0.000000 0.000000 -0.500000 0.000000 0.000000 0.-\nM  V30 000000 0.000000) BRKXYZ=(9 0.433000 0.250000 0.000000 0.000000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000) LABEL=Sugar1 CLASS=SUGAR SAP=(3-\nM  V30  2 1 Al) SAP=(3 12 13 Br) SAP=(3 2 14 Cx) NATREPLACE=SUGAR/R\nM  V30 END SGROUP\nM  V30 END CTAB\nM  V30 END TEMPLATE\nM  END\n>  <type>\nmonomerTemplate\n\n>  <aliasHELM>\nSugar1_HELM\n\n$$$$\n', { format: 'sdf' })
     * 3. Go to Library-RNA tab-Sugars section
     * 4. Hover mouse over appeared Sugar1 card to get preview tooltip
     * 4. Verify that the monomer Sugar1 is displayed in the tooltip
     *
     * Version 3.9
     */
    const errorinConsole = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errorinConsole.push(msg.text());
      }
    });
    await updateMonomersLibrary(
      page,
      `\n  -INDIGO-10092512212D\n\n  0  0  0  0  0  0  0  0  0  0  0 V3000\nM  V30 BEGIN CTAB\nM  V30 COUNTS 1 0 0 0 0\nM  V30 BEGIN ATOM\nM  V30 1 Sugar1 10.4962 -10.55 0.0 0 CLASS=SUGAR SEQID=1\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 END BOND\nM  V30 END CTAB\nM  V30 BEGIN TEMPLATE\nM  V30 TEMPLATE 1 SUGAR/Sugar1/Sugar1 NATREPLACE=SUGAR/R\nM  V30 BEGIN CTAB\nM  V30 COUNTS 14 13 4 0 0\nM  V30 BEGIN ATOM\nM  V30 1 H -5.196 0.75 0.0 0\nM  V30 2 C -4.33 0.25 0.0 0\nM  V30 3 C -3.464 0.75 0.0 0\nM  V30 4 C -2.598 0.25 0.0 0\nM  V30 5 C -1.732 0.75 0.0 0\nM  V30 6 C -0.866 0.25 0.0 0\nM  V30 7 C 0.0 0.75 0.0 0\nM  V30 8 C 0.866 0.25 0.0 0\nM  V30 9 C 1.732 0.75 0.0 0\nM  V30 10 C 2.598 0.25 0.0 0\nM  V30 11 C 3.464 0.75 0.0 0\nM  V30 12 C 4.33 0.25 0.0 0\nM  V30 13 H 5.196 0.75 0.0 0\nM  V30 14 H -4.33 -0.75 0.0 0\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 1 1 2\nM  V30 2 1 2 3\nM  V30 3 1 3 4\nM  V30 4 1 4 5\nM  V30 5 1 5 6\nM  V30 6 1 6 7\nM  V30 7 1 7 8\nM  V30 8 1 8 9\nM  V30 9 1 9 10\nM  V30 10 1 10 11\nM  V30 11 1 11 12\nM  V30 12 1 12 13\nM  V30 13 1 2 14\nM  V30 END BOND\nM  V30 BEGIN SGROUP\nM  V30 1 SUP 1 ATOMS=(1 1) XBONDS=(1 1) BRKXYZ=(9 0.433000 -0.250000 0.000000-\nM  V30  0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=-\nM  V30 LGRP\nM  V30 2 SUP 2 ATOMS=(1 13) XBONDS=(1 12) BRKXYZ=(9 -0.433000 -0.250000 0.000-\nM  V30 000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLA-\nM  V30 SS=LGRP\nM  V30 3 SUP 3 ATOMS=(1 14) XBONDS=(1 13) BRKXYZ=(9 0.000000 0.500000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\nM  V30 =LGRP\nM  V30 4 SUP 4 ATOMS=(11 2 3 4 5 6 7 8 9 10 11 12) XBONDS=(3 1 13 12) BRKXYZ=-\nM  V30 (9 -0.433000 0.250000 0.000000 0.000000 -0.500000 0.000000 0.000000 0.-\nM  V30 000000 0.000000) BRKXYZ=(9 0.433000 0.250000 0.000000 0.000000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000) LABEL=Sugar1 CLASS=SUGAR SAP=(3-\nM  V30  2 1 Al) SAP=(3 12 13 Br) SAP=(3 2 14 Cx) NATREPLACE=SUGAR/R\nM  V30 END SGROUP\nM  V30 END CTAB\nM  V30 END TEMPLATE\nM  END\n>  <type>\nmonomerTemplate\n\n>  <aliasHELM>\nSugar1_HELM\n\n$$$$\n`,
      { format: 'sdf' },
    );

    expect(await Library(page).isMonomerExist(Sugar.Sugar1)).toBe(true);
    await Library(page).hoverMonomer(Sugar.Sugar1);
    expect(await MonomerPreviewTooltip(page).getTitleText()).toBe('Sugar1');
    expect(errorinConsole.length).toBe(0);
  });

  test('Case 43: Export to HELM works wrong for custom monomers imported from HELM with inline SMILES (part 2)', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/Indigo/issues/3187
     * Description:  Export to HELM works wrong for custom monomers imported from HELM with inline SMILES (part 2)
     *
     * Scenario:
     * 1. Go to Macro - Flex mode (clean canvas)
     * 2. Load from HELM: RNA1{[O1[C@@H]%91[C@H](O)[C@H](O%92)[C@H]1CO%93.[*:3]%91.[*:1]%93.[*:2]%92 |$;;;;;;;;;_R3;_R1;_R2$|]p}$$$$V2.0
     * 3. Save canvas to HELM
     * 4. Verify export result is RNA1{[O1[C@H](CO[*:1])[C@@H](O[*:2])[C@@H](O)[C@@H]1[*:3] |$;;;;_R1;;;_R2;;;;_R3$|].p}$$$$V2.0
     *
     * Version 3.9
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[O1[C@@H]%91[C@H](O)[C@H](O%92)[C@H]1CO%93.[*:3]%91.[*:1]%93.[*:2]%92 |$;;;;;;;;;_R3;_R1;_R2$|]p}$$$$V2.0',
    );
    await verifyHELMExport(
      page,
      'RNA1{[O1[C@H](CO[*:1])[C@@H](O[*:2])[C@@H](O)[C@@H]1[*:3] |$;;;;_R1;;;_R2;;;;_R3$|].p}$$$$V2.0',
    );
  });

  test("Case 44: Loading of AxoLabs with last monomer in brackets doesn't work", async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/Indigo/issues/3228
     * Description:  Loading of AxoLabs with last monomer in brackets doesn't work
     *
     * Scenario:
     * 1. Go to Macro - Flex mode (clean canvas)
     * 2. Load from AxoLabs: 5'-(invdT)(invdT)(invdT)-3'
     * 3. Verify that structure is loaded correctly
     *
     * Version 3.9
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.AxoLabs,
      "5'-(invdT)(invdT)(invdT)-3'",
    );
    const invdT = getMonomerLocator(page, Nucleotide.InvdT);
    expect(await invdT.count()).toBe(3);
  });
});
