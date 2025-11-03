/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */
import { test, expect } from '@fixtures';
import { Page } from '@playwright/test';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { MicroBondDataIds } from '@tests/pages/constants/bondSelectionTool/Constants';
import {
  MicroAtomOption,
  MicroBondOption,
  MonomerOption,
  QueryAtomOption,
  RingBondCountOption,
  SequenceSymbolOption,
} from '@tests/pages/constants/contextMenu/Constants';
import { LibraryTab } from '@tests/pages/constants/library/Constants';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { Base } from '@tests/pages/constants/monomers/Bases';
import { Chem } from '@tests/pages/constants/monomers/Chem';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { Phosphate } from '@tests/pages/constants/monomers/Phosphates';
import { Sugar } from '@tests/pages/constants/monomers/Sugars';
import { AtomsSetting } from '@tests/pages/constants/settingsDialog/Constants';
import { TabSection } from '@tests/pages/constants/structureLibraryDialog/Constants';
import { MonomerPreviewTooltip } from '@tests/pages/macromolecules/canvas/MonomerPreviewTooltip';
import { Library } from '@tests/pages/macromolecules/Library';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { BottomToolbar } from '@tests/pages/molecules/BottomToolbar';
import { prepareMoleculeForMonomerCreation } from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import { EnhancedStereochemistry } from '@tests/pages/molecules/canvas/EnhancedStereochemistry';
import { setSettingsOption } from '@tests/pages/molecules/canvas/SettingsDialog';
import { StructureLibraryDialog } from '@tests/pages/molecules/canvas/StructureLibraryDialog';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import {
  clickOnMiddleOfCanvas,
  delay,
  keyboardTypeOnCanvas,
  MacroFileType,
  openFileAndAddToCanvasAsNewProjectMacro,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  pasteFromClipboardAndOpenAsNewProject,
  selectAllStructuresOnCanvas,
  selectCanvasArea,
  takeEditorScreenshot,
  takeElementScreenshot,
  ZoomOutByKeyboard,
} from '@utils';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import {
  verifyHELMExport,
  verifySVGExport,
} from '@utils/files/receiveFileComparisonData';
import {
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

  test('Case 12: "Create a monomer" option is missing in right-click menu when selection meets conditions', async ({
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

  test('Case 13: IDT alias of CHEM 5TAMRA is displayed wrong', async ({
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

  test('Case 14: Microstructure not removed properly with Redo, duplicates on repeated Undo/Redo in Sequence mode', async ({
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

  test('Case 15: Export to SVG Documets works wrong for unsplite nucleotides with dash symbole (-) in alias', async ({
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

  test('Case 16: Save to SDF button is missed on Salts and Solvents tab in Structure Library dialog', async ({
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
  });

  test('Case 17: Undo after deleting RNA preset connected to benzene ring leaves undeletable artifacts in Flex, Snake, and Sequence modes', async ({
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
});
