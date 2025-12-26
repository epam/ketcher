/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { test, expect } from '@fixtures';
import { Page } from '@playwright/test';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { MonomerType } from '@tests/pages/constants/createMonomerDialog/Constants';
import { MacromoleculesFileFormatType } from '@tests/pages/constants/fileFormats/macroFileFormats';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { Base } from '@tests/pages/constants/monomers/Bases';
import { Preset } from '@tests/pages/constants/monomers/Presets';
import { Library } from '@tests/pages/macromolecules/Library';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { CalculatedValuesDialog } from '@tests/pages/molecules/canvas/CalculatedValuesDialog';
import {
  CreateMonomerDialog,
  deselectAtomAndBonds,
} from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import { EditAbbreviationDialog } from '@tests/pages/molecules/canvas/EditAbbreviation';
import { StructureCheckDialog } from '@tests/pages/molecules/canvas/StructureCheckDialog';
import {
  addTextBoxToCanvas,
  TextEditorDialog,
} from '@tests/pages/molecules/canvas/TextEditorDialog';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import {
  copyToClipboardByKeyboard,
  MacroFileType,
  pasteFromClipboardByKeyboard,
  selectAllStructuresOnCanvas,
  takeEditorScreenshot,
  takeLeftToolbarMacromoleculeScreenshot,
  takeLeftToolbarScreenshot,
} from '@utils/canvas';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { expandMonomer } from '@utils/canvas/monomer/helpers';
import { getAbbreviationLocator } from '@utils/canvas/s-group-signes/getAbbreviation';
import {
  FileType,
  verifyFileExport,
  verifyHELMExport,
  verifyIDTExport,
  verifySMARTSExport,
  verifySVGExport,
} from '@utils/files/receiveFileComparisonData';
import {
  clickInTheMiddleOfTheScreen,
  clickOnCanvas,
  dragMouseTo,
  keyboardTypeOnCanvas,
  MolFileFormat,
  openFileAndAddToCanvasAsNewProject,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  pasteFromClipboardAndOpenAsNewProject,
  pasteFromClipboardAndOpenAsNewProjectMacro,
  RdfFileFormat,
  readFileContent,
} from '@utils/index';
import {
  AttachmentPoint,
  createRNAAntisenseChain,
  getMonomerLocator,
} from '@utils/macromolecules/monomer';

let page: Page;

test.describe('Ketcher bugs in 3.8.0', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });
  test.afterEach(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
    await CommonTopLeftToolbar(page).clearCanvas();
  });
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1: Copy keyboard shortcut works for text content', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/ketcher/issues/7152
     * Description: Copy keyboard shortcut works for text content
     * Scenario:
     * 1. Go to Molecules mode
     * 2. Press T button and click on canvas to open Text Editor
     * 3. Type some text, select it
     * 4. Press Ctrl+C and than press Ctrl+V
     */
    const pasteText = 'SomeText';
    await addTextBoxToCanvas(page);
    await TextEditorDialog(page).setText(pasteText);
    await TextEditorDialog(page).clickTextEditor();
    await selectAllStructuresOnCanvas(page);
    await takeEditorScreenshot(page);
    await copyToClipboardByKeyboard(page);
    await page.keyboard.press('Backspace');
    await pasteFromClipboardByKeyboard(page);
    await takeEditorScreenshot(page);
  });

  test('Case 2: In Macro mode selection tool not resets to Rectangle when switching between Flex, Snake, and Sequence modes', async ({
    SequenceCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/ketcher/issues/7782
     * Description: In Macro mode selection tool not resets to Rectangle when switching between Flex, Snake, and Sequence modes
     * Scenario:
     * 1. Open Ketcher in Macro mode.
     * 2. Select a non-default selection tool (e.g., Lasso or Fragment).
     * 3. Switch to Flex mode.
     * 4. Switch to Snake mode.
     * 5. Switch to Sequence mode.
     * 6. Observe the active selection tool after each switch.
     */
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
    await takeLeftToolbarMacromoleculeScreenshot(page);
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await takeLeftToolbarMacromoleculeScreenshot(page);
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeLeftToolbarMacromoleculeScreenshot(page);
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await takeLeftToolbarMacromoleculeScreenshot(page);
  });

  test('Case 3: In Sequence mode selection tool not resets to Rectangle when entering or exiting sequence edit mode', async ({
    SequenceCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/ketcher/issues/7784
     * Description: In Sequence mode selection tool not resets to Rectangle when entering or exiting sequence edit mode
     * Scenario:
     * 1. Open Ketcher in Sequence mode.
     * 2. Select Lasso or Fragment tool.
     * 3. Click the plus button to enter sequence edit mode and add a new row.
     * 4. Observe the active selection tool. (If it Rectangle select Lasso or Fragment again)
     * 5. Exit sequence edit mode by clicking on the canvas.
     * 6. Observe the active selection tool again.
     */
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
    await takeLeftToolbarMacromoleculeScreenshot(page);
    await keyboardTypeOnCanvas(page, 'ACGTU');
    await clickOnCanvas(page, 300, 300, { from: 'pageTopLeft' });
    await takeLeftToolbarMacromoleculeScreenshot(page);
  });

  test('Case 4: Clicking toolbar buttons not resets selection tool from Lasso/Fragment to Rectangle', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/ketcher/issues/7785
     * Description: Clicking toolbar buttons not resets selection tool from Lasso/Fragment to Rectangle
     * Scenario:
     * 1. Open Ketcher in Macro mode
     * 2. Select Lasso or Fragment selection tool.
     * 3. Click on any tool from the left toolbar (Hand, Erase, Single bond, etc.).
     * 4. Observe the active selection tool.
     */
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
    await takeLeftToolbarMacromoleculeScreenshot(page);
    await CommonLeftToolbar(page).handTool();
    await takeLeftToolbarMacromoleculeScreenshot(page);
    await CommonLeftToolbar(page).erase();
    await takeLeftToolbarMacromoleculeScreenshot(page);
  });

  test('Case 5: Connection point enumeration is correct if they are already enumerated form range [3-8]', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/ketcher/issues/7814
     * Description: Connection point enumeration is correct if they are already enumerated form range [3-8]
     * Scenario:
     * 1. Molecules mode (clear canvas)
     * 2. Load structure from clipboard: [*:4]C%91.[*:5]%91 |$_R4;;_R5$|
     * 3. Press Create monomer button
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      '[*:4]C%91.[*:5]%91 |$_R4;;_R5$|',
    );
    await clickOnCanvas(page, 300, 300, { from: 'pageTopLeft' });
    await selectAllStructuresOnCanvas(page);
    await expect(LeftToolbar(page).createMonomerButton).toBeEnabled();
    await LeftToolbar(page).createMonomer();
    await takeEditorScreenshot(page);
    await CreateMonomerDialog(page).discard();
  });

  test('Case 6: Selection not remains on original structure after creating Antisense RNA/DNA and can be cleared by canvas click', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/ketcher/issues/7794
     * Description: Selection not remains on original structure after creating Antisense RNA/DNA and can be cleared by canvas click
     * Scenario:
     * 1. Open Ketcher in Macro mode.
     * 2. Place an RNA or DNA structure on the canvas.
     * 3. Create Antisense RNA or Antisense DNA from this structure.
     * 4. Observe that the original structure remains highlighted (selected).
     * 5. Click on an empty area of the canvas.
     */
    await Library(page).clickMonomerAutochain(Preset.MOE_A_P);
    const baseA = getMonomerLocator(page, Base.A).first();
    await createRNAAntisenseChain(page, baseA);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await clickOnCanvas(page, 300, 300, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 7: System not allow to create monomer if atom with many R-groups in the selection', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/ketcher/issues/7813
     * Description: System not allow to create monomer if atom with many R-groups in the selection
     * Scenario:
     * 1. Molecules mode (clear canvas)
     * 2. Open structure
     * 3. Select whole structure
     * 4. Press Create monomer button
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V2000/Bugs/r1-r2-structure.mol',
    );
    await clickOnCanvas(page, 300, 300, { from: 'pageTopLeft' });
    await selectAllStructuresOnCanvas(page);
    await takeLeftToolbarScreenshot(page);
    await expect(LeftToolbar(page).createMonomerButton).toBeDisabled();
  });

  test('Case 8: Connection point enumeration is correct R-groups outside [3-8] range', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/ketcher/issues/7821
     * Description: Connection point enumeration is correct R-groups outside [3-8] range
     * Scenario:
     * 1. Molecules mode (clear canvas)
     * 2. Load structure from clipboard
     * 3. Press Create monomer button
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      '[*:3]C%91CC%92CC%93CC%94CC%95CC%96%97.[*:9]%96.[*:10]%97.[*:8]%95.[*:7]%94.[*:6]%93.[*:5]%92.[*:4]%91 |$_R3;;;;;;;;;;;;_R9;_R10;_R8;_R7;_R6;_R5;_R4$|',
    );
    await clickOnCanvas(page, 300, 300, { from: 'pageTopLeft' });
    await selectAllStructuresOnCanvas(page);
    await expect(LeftToolbar(page).createMonomerButton).toBeEnabled();
    await LeftToolbar(page).createMonomer();
    await takeEditorScreenshot(page);
    await CreateMonomerDialog(page).discard();
  });

  test('Case 9: In Snake mode after Undo bonds not remain on canvas', async ({
    SnakeCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/ketcher/issues/7786
     * Description: In Snake mode after Undo bonds not remain on canvas
     * Scenario:
     * 1. Open Ketcher in Macro mode.
     * 2. Place an RNA or DNA structure on the canvas.
     * 3. Create Antisense RNA or Antisense DNA from this structure.
     * 4. Observe that the original structure remains highlighted (selected).
     * 5. Click on an empty area of the canvas.
     */
    for (let i = 0; i < 4; i++) {
      await Library(page).clickMonomerAutochain(Preset.MOE_A_P);
    }
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    for (let i = 0; i < 3; i++) {
      await CommonTopLeftToolbar(page).undo();
    }
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 10: System not swaps left connection point (R2) and right connection point (R1) if R2 group was created early that R1', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/ketcher/issues/7816
     * Description: System not swaps left connection point (R2) and right connection point (R1) if R2 group was created early that R1
     * Scenario:
     * 1. Open Molecules mode (clean canvas)
     * 2. Load structure from clipboard
     * 3. Select whole structure
     * 4. Press Create monomer button
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      '[*:2]C%91.[*:1]%91 |$_R2;;_R1$|',
    );
    await clickOnCanvas(page, 300, 300, { from: 'pageTopLeft' });
    await selectAllStructuresOnCanvas(page);
    await expect(LeftToolbar(page).createMonomerButton).toBeEnabled();
    await LeftToolbar(page).createMonomer();
    await takeEditorScreenshot(page);
    await CreateMonomerDialog(page).discard();
  });

  test('Case 11: R-label is highlighted so it is clear which attachment point is being edited', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/ketcher/issues/7791
     * Description: R-label is highlighted so it is clear which attachment point is being edited
     * Scenario:
     * 1. Create a structure with 2 or more terminal R-group atoms
     * 2. Select the structure, open the monomer creation wizard, observe the automatically assigned attachment points
     * 3. Click on one of the R-labels, observe edit dialog appeared, move the mouse away
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      '[*:2]C%91.[*:1]%91 |$_R2;;_R1$|',
    );
    await clickOnCanvas(page, 300, 300, { from: 'pageTopLeft' });
    await selectAllStructuresOnCanvas(page);
    await expect(LeftToolbar(page).createMonomerButton).toBeEnabled();
    await LeftToolbar(page).createMonomer();
    const attachmentPointR1 = page.getByTestId(AttachmentPoint.R1).first();
    await ContextMenu(page, attachmentPointR1).open();
    await takeEditorScreenshot(page);
    await CreateMonomerDialog(page).discard();
  });

  test('Case 12: System not changes right connection point (R2) to left one (R1) if no R1 group defined', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/ketcher/issues/7815
     * Description: System not changes right connection point (R2) to left one (R1) if no R1 group defined
     * Scenario:
     * 1. Open Molecules mode (clean canvas)
     * 2. Load structure from clipboard
     * 3. Select whole structure
     * 4. Press Create monomer button
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      'CC%91.[*:2]%91 |$;;_R2$|',
    );
    await clickOnCanvas(page, 300, 300, { from: 'pageTopLeft' });
    await selectAllStructuresOnCanvas(page);
    await expect(LeftToolbar(page).createMonomerButton).toBeEnabled();
    await LeftToolbar(page).createMonomer();
    // to make molecule visible
    await CommonLeftToolbar(page).handTool();
    await page.mouse.move(600, 200);
    await dragMouseTo(550, 250, page);
    await takeEditorScreenshot(page);
    await CreateMonomerDialog(page).discard();
  });

  test('Case 13: Able to assign atom as a leaving group if it is eligable', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/ketcher/issues/7828
     * Description: Able to assign atom as a leaving group if it is eligable
     * Scenario:
     * 1. Open Molecules mode (clean canvas)
     * 2. Load structure from clipboard
     * 3. Select whole structure
     * 4. Press Create monomer button
     * 5. Select any atom eligible for LGA (every atom that has one and only one simple-single bond to another atom in the structure, and is not already an LGA.)
     * 6. Call context menu
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      'CC%91C(C)C(C)C(C)C(C)C(C)C.[*:1]%91 |$;;;;;;;;;;;;;_R1$|',
    );
    await clickOnCanvas(page, 300, 300, { from: 'pageTopLeft' });
    await selectAllStructuresOnCanvas(page);
    await expect(LeftToolbar(page).createMonomerButton).toBeEnabled();
    await LeftToolbar(page).createMonomer();
    // to make molecule visible
    await CommonLeftToolbar(page).handTool();
    await page.mouse.move(600, 200);
    await dragMouseTo(450, 250, page);
    const targetAtom = getAtomLocator(page, { atomLabel: 'C' }).first();
    await ContextMenu(page, targetAtom).open();
    await takeEditorScreenshot(page);
    await CreateMonomerDialog(page).discard();
  });

  test('Case 14: Connection point enumeration is correct R-groups outside [1-8] range', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/ketcher/issues/7817
     * Description: Connection point enumeration is correct R-groups outside [1-8] range
     * Scenario:
     * 1. Open Molecules mode (clean canvas)
     * 2. Load structure from clipboard
     * 3. Select all
     * 4. Press Create monomer button
     */
    await pasteFromClipboardAndOpenAsNewProject(page, '[*:19]C[H] |$_R19;;$|');
    await clickOnCanvas(page, 300, 300, { from: 'pageTopLeft' });
    await selectAllStructuresOnCanvas(page);
    await expect(LeftToolbar(page).createMonomerButton).toBeEnabled();
    await LeftToolbar(page).createMonomer();
    await takeEditorScreenshot(page);
    await CreateMonomerDialog(page).discard();
  });

  test('Case 15: Connection between created monomer and the rest of molecule not lost after monomer creation', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/ketcher/issues/7846
     * Description: Connection between created monomer and the rest of molecule not lost after monomer creation
     * Scenario:
     * 1. Open Molecules mode (clean canvas)
     * 2. Load structure from clipboard
     * 3. Select half of the structure
     * 4. Press Create monomer button
     * 5. Select Type: Sugar
     * 6. Set Symbol: qeg
     * 7. Set Name: gly
     * 8. Press Submit button
     * 9. Switch to Macromolecule mode
     */
    const createMonomerDialog = CreateMonomerDialog(page);
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCCCC');
    await deselectAtomAndBonds(page, ['0'], ['0']);
    await expect(LeftToolbar(page).createMonomerButton).toBeEnabled();
    await LeftToolbar(page).createMonomer();
    await createMonomerDialog.selectType(MonomerType.Sugar);
    await createMonomerDialog.setSymbol('qeg');
    await createMonomerDialog.setName('gly');
    await createMonomerDialog.submit();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 16: Submitting a monomer with R-group used for automatic leaving group assignment not leads to incorrect atom label after saving', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/ketcher/issues/7790
     * Description: Submitting a monomer with R-group used for automatic leaving group assignment not leads to incorrect atom label after saving
     * Scenario:
     * 1. Open Molecules mode (clean canvas)
     * 2. Load structure from clipboard
     * 3. Select all
     * 4. Press Create monomer button
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      'C1%91CCCCC1.[*:1]%91 |$;;;;;;_R1$|',
    );
    await clickOnCanvas(page, 300, 300, { from: 'pageTopLeft' });
    await selectAllStructuresOnCanvas(page);
    await expect(LeftToolbar(page).createMonomerButton).toBeEnabled();
    await LeftToolbar(page).createMonomer();
    // to make molecule visible
    await CommonLeftToolbar(page).handTool();
    await page.mouse.move(600, 200);
    await dragMouseTo(450, 250, page);
    await takeEditorScreenshot(page);
    await CreateMonomerDialog(page).discard();
  });

  test('Case 17: Ctrl+M open monomer creation wizard when selection meets conditions', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/ketcher/issues/7571
     * Description: Ctrl+M open monomer creation wizard when selection meets conditions
     * Scenario:
     * 1. Open Molecules mode (clean canvas)
     * 2. Load structure from clipboard
     * 3. Select all
     * 4. Press Create monomer hotkey Ctrl+M
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      'C1%91CCCCC1.[*:1]%91 |$;;;;;;_R1$|',
    );
    await clickOnCanvas(page, 300, 300, { from: 'pageTopLeft' });
    await selectAllStructuresOnCanvas(page);
    await expect(LeftToolbar(page).createMonomerButton).toBeEnabled();
    await page.keyboard.press('Control+M');
    // to make molecule visible
    await CommonLeftToolbar(page).handTool();
    await page.mouse.move(600, 200);
    await dragMouseTo(450, 250, page);
    await takeEditorScreenshot(page);
    await CreateMonomerDialog(page).discard();
  });

  test('Case 18: Export to SVG work in popup mode', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/ketcher/issues/7509
     * Description: Export to SVG work in popup mode
     * Scenario:
     * 1. Open Ketcher in POPUP mode
     * 2. Toggle to Macro - Flex mode
     * 3. Load from HELM: RNA1{[2-damdA].[5Br-dU].[5hMedC]}$$$$V2.0
     * 4. Export canvas to SVG
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[2-damdA].[5Br-dU].[5hMedC]}$$$$V2.0',
    );
    await verifySVGExport(page);
  });

  test('Case 19: Pressing ? key at Text Editor form while creation text label not opens Macromolecules help link', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/ketcher/issues/7619
     * Description: Pressing ? key at Text Editor form while creation text label not opens Macromolecules help link
     * Scenario:
     * 1. Go to Molecules mode (empty canvas)
     * 2. Click T on the left tool bar
     * 3. Click on the canvas to open Text Editor
     * 4. Press ? key on keyboard
     */
    const pasteText = '?';
    await addTextBoxToCanvas(page);
    await TextEditorDialog(page).setText(pasteText);
    await takeEditorScreenshot(page);
  });

  test('Case 20: Unnecessary leaving groups (R-groups) not appear upon "Removing Abbreviation" of expanded monomer when an attachment point is occupied', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/ketcher/issues/6747
     * Description: Unnecessary leaving groups (R-groups) not appear upon "Removing Abbreviation" of expanded monomer when an attachment point is occupied
     * Scenario:
     * 1. Go to Ketcher macromolecules mode
     * 2. Toggle to Macro - Flex mode
     * 3. Paste the following structures: RNA1{[SGNA](A)P.[SGNA](A)P}|RNA2{[SGNA](A)}|RNA3{[SGNA]}$$$$V2.0
     * 4. Go to small molecules mode and expand SGNA sugars
     * 5. "Remove abbreviation" for SGNA sugars
     * 6. Observe the appearance of leaving groups (R-groups)
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[SGNA](A)P.[SGNA](A)P}|RNA2{[SGNA](A)}|RNA3{[SGNA]}$$$$V2.0',
    );
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await clickInTheMiddleOfTheScreen(page);
    await expandMonomer(
      page,
      getAbbreviationLocator(page, { name: 'SGNA' }).nth(0),
    );
    await expandMonomer(
      page,
      getAbbreviationLocator(page, { name: 'SGNA' }).nth(1),
    );
    await CommonLeftToolbar(page).erase();
    await getAtomLocator(page, { atomLabel: 'O', atomId: 4 }).click({
      force: true,
    });
    await EditAbbreviationDialog(page).removeAbbreviation();
    await getAtomLocator(page, { atomLabel: 'O', atomId: 52 }).click({
      force: true,
    });
    await EditAbbreviationDialog(page).removeAbbreviation();
    await takeEditorScreenshot(page);
  });

  test('Case 21: System can load HELM with inline SMILES if it has r-site star atom without square brackets', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/Indigo/issues/3067
     * Description: System can load HELM with inline SMILES if it has r-site star atom without square brackets
     * Scenario:
     * 1. Go to Ketcher macromolecules mode
     * 2. Toggle to Macro - Flex mode
     * 3. Load from HELM
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{[dF].C.F.[dW].K.T.C.[*N[C@H](CO)[C@@H](C)O|$_R1;;;;;;;$|]}$PEPTIDE1,PEPTIDE1,2:R3-7:R3$$$',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 22: Able to paste FASTA content from clipcoard', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/Indigo/issues/3123
     * Description: Able to paste FASTA content from clipcoard
     * Scenario:
     * 1. Go to Ketcher macromolecules mode
     * 2. Load copy to clipboard folllowing text
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.FASTA,
      '>Sequence1\nAAA',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 23: Export to RDF V2000 work if "star" atom on the canvas', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/Indigo/issues/3071
     * Description: Export to RDF V2000 work if "star" atom on the canvas
     * Scenario:
     * 1. Go to Molecules mode (empty canvas)
     * 2. Load from KET as New Project
     */
    await openFileAndAddToCanvasAsNewProject(page, 'KET/Bugs/Bad Cast.ket');
    await verifyFileExport(
      page,
      'RDF-V2000/Bad Cast-expected.rdf',
      FileType.RDF,
      RdfFileFormat.v2000,
    );
    await takeEditorScreenshot(page);
  });

  test('Case 24: Export to IDT work if R1-only CHEM stays on five prime position', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/Indigo/issues/3169
     * Description: Export to IDT work if R1-only CHEM stays on five prime position
     * Scenario:
     * 1. Switch to Macromolecules mode - Flex canvas (clear canvas)
     * 2. Load from IDT: /56-FAM/A
     * 3. Export canvas to IDT
     */
    await pasteFromClipboardAndOpenAsNewProjectMacro(
      page,
      MacroFileType.IDT,
      '/56-FAM/A',
    );
    await verifyFileExport(page, 'IDT/56-FAM-expected.idt', FileType.IDT);
    await takeEditorScreenshot(page);
  });

  test('Case 25: System loads "star" atoms as "star" atoms', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/Indigo/issues/3080
     * Description: System loads "star" atoms as "star" atoms
     * Scenario:
     * 1. Go to Molecules mode (empty canvas)
     * 2. Load from SMILES: *1C=*C=*C=1 |$star_e;;star_e;;star_e;$|
     * 3. Export canvas to CDXML
     * 4. Load result back
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      '*1C=*C=*C=1 |$star_e;;star_e;;star_e;$|',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDXML/benzene-ring-with-star-atoms-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/benzene-ring-with-star-atoms-expected.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  test('Case 26: Export to HELM works correct for custom monomers imported from HELM with inline SMILES', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/Indigo/issues/3159
     * Description: Export to HELM works correct for custom monomers imported from HELM with inline SMILES
     * Scenario:
     * 1. Go to Ketcher macromolecules mode
     * 2. Toggle to Macro - Flex mode
     * 3. Load from HELM
     * 4. Save canvas to HELM
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[O1[C@@H]%91[C@H](O)[C@H](O%92)[C@H]1CO%93.[*:3]%91.[*:1]%93.[*:2]%92 |$;;;;;;;;;_R3;_R1;_R2$|]p}$$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await verifyHELMExport(
      page,
      'RNA1{[O1[C@H](CO[*:1])[C@@H](O[*:2])[C@@H](O)[C@@H]1[*:3] |$;;;;_R1;;;_R2;;;;_R3$|].p}$$$$V2.0',
    );
  });

  test('Case 27: System saves "star" atoms in Base64 CDX as star atoms', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/Indigo/issues/3082
     * Description: System saves "star" atoms in Base64 CDX as star atoms
     * Scenario:
     * 1. Go to Molecules mode (empty canvas)
     * 2. Load from SMILES: *1C=*C=*C=1 |$star_e;;star_e;;star_e;$|
     * 3. Export canvas to CDX
     * 4. Load result back
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      '*1C=*C=*C=1 |$star_e;;star_e;;star_e;$|',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDX/benzene-ring-with-star-atoms-expected.cdx',
      FileType.CDX,
    );
    const fileContent = await readFileContent(
      'CDX/benzene-ring-with-star-atoms-expected.cdx',
    );
    await pasteFromClipboardAndOpenAsNewProject(page, fileContent);
    await takeEditorScreenshot(page);
  });

  test('Case 28: Saving "star" atoms to SMARTS', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/Indigo/issues/3088
     * Description: Saving "star" atoms to SMARTS should give [*,H]1=[#6]-[*,H]=[#6]-[*,H]=[#6]-1
     * Scenario:
     * 1. Go to Molecules mode (empty canvas)
     * 2. Load from Daylight SMILES: *1C=*C=*C=1
     * 3. Export canvas to SMARTS
     */
    await pasteFromClipboardAndOpenAsNewProject(page, '*1C=*C=*C=1');
    await takeEditorScreenshot(page);
    await verifySMARTSExport(page, '[*,H]1=[#6]-[*,H]=[#6]-[*,H]=[#6]-1');
  });

  test('Case 29: System not replaces "star" atoms with AH atoms in Mol v3000 export result', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/Indigo/issues/3068
     * Description: System not replaces "star" atoms with AH atoms in Mol v3000 export result
     * Scenario:
     * 1. Go to Molecules mode (empty canvas)
     * 2. Load from Mol
     * 3. Export canvas to Mol v3000 and load it back
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V2000/Bugs/benzene-ring-with-star-atoms.mol',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'Molfiles-V3000/Bugs/benzene-ring-with-star-atoms-expected.mol',
      FileType.MOL,
      MolFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V3000/Bugs/benzene-ring-with-star-atoms-expected.mol',
    );
    await takeEditorScreenshot(page);
  });

  test('Case 30: System can load atom properties (Charge, Isotope and Valence) in SMARTS with "star" atom', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/Indigo/issues/3084
     * Description: System can load atom properties (Charge, Isotope and Valence) in SMARTS with "star" atom
     * Scenario:
     * 1. Go to Molecules mode (empty canvas)
     * 2. Load from SMARTS: [15*+1v4]
     */
    await pasteFromClipboardAndOpenAsNewProject(page, '[15*+1v4]');
    await takeEditorScreenshot(page);
    await verifySMARTSExport(page, '[*;+;v4;15]');
  });

  test('Case 31: Indigo functions (Aromatize/Dearomatize, Layout, Clean-Up, Calculate-CIP, Check Structure, Calculate Values, Add/Remove Hydrogens) work for star atom', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/Indigo/issues/3087
     * Description: Indigo functions (Aromatize/Dearomatize, Layout, Clean-Up, Calculate-CIP, Check Structure, Calculate Values, Add/Remove Hydrogens) work for star atom
     * Scenario:
     * 1. Go to Molecules mode (empty canvas)
     * 2. Load from KET
     * 3. Try to use indigo functions: Aromatize/Dearomatize, Layout, Clean-Up, Calculate-CIP, Check Structure, Calculate Values, Add/Remove Hydrogens
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Bugs/Star atom with all regular properties and query specific features.ket',
    );
    await takeEditorScreenshot(page);
    await IndigoFunctionsToolbar(page).aromatize();
    await takeEditorScreenshot(page);
    await IndigoFunctionsToolbar(page).dearomatize();
    await takeEditorScreenshot(page);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
    await IndigoFunctionsToolbar(page).cleanUp();
    await takeEditorScreenshot(page);
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
    await IndigoFunctionsToolbar(page).checkStructure();
    await takeEditorScreenshot(page, {
      mask: [StructureCheckDialog(page).lastCheckInfo],
    });
    await StructureCheckDialog(page).cancel();
    await IndigoFunctionsToolbar(page).calculatedValues();
    await takeEditorScreenshot(page);
    await CalculatedValuesDialog(page).close();
    await IndigoFunctionsToolbar(page).addRemoveExplicitHydrogens();
    await takeEditorScreenshot(page);
  });

  test('Case 32: SMILES - *1C=*C=*C=1 loaded with "star" atoms', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/Indigo/issues/3090
     * Description: SMILES - *1C=*C=*C=1 loaded with "star" atoms
     * Scenario:
     * 1. Go to Molecules mode (empty canvas)
     * 2. Load from Daylight SMILES: *1C=*C=*C=1
     */
    await pasteFromClipboardAndOpenAsNewProject(page, '*1C=*C=*C=1');
    await takeEditorScreenshot(page);
  });

  test('Case 33: Export to IDT work if monomer at the end has no 3 position IDT code', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/Indigo/issues/3148
     * Description: Export to IDT work if monomer at the end has no 3 position IDT code
     * Scenario:
     * 1. Go to Macromolecules mode - Flex canvas (empty)
     * 2. Load from HELM: RNA1{[5Br-dU].[5Br-dU].[5Br-dU]}$$$$V2.0
     * 3. Try to export canvas to IDT
     * 4. Error message appears
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[5Br-dU].[5Br-dU].[5Br-dU]}$$$$V2.0',
    );
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.IDT,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 34: Export to IDT work for baseless preset', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/Indigo/issues/3147
     * Description: Export to IDT work for baseless preset
     * Scenario:
     * 1. Go to Macromolecules mode - Flex canvas (empty)
     * 2. Load from IDT
     * 3. Try to export canvas to IDT
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.IDT,
      '/5dSp//idSp//3dSp/',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await verifyIDTExport(page, '/5dSp//idSp//3dSp/');
  });

  test('Case 35: Export to IDT work for modified phosphates at first 5` position', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/Indigo/issues/3144
     * Description: Export to IDT work for modified phosphates at first 5` position
     * Scenario:
     * 1. Go to Macromolecules mode - Flex canvas (empty)
     * 2. Load from HELM
     * 3. Try to export canvas to IDT
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[AmC6].r(A)p}$$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await verifyIDTExport(page, '/5AmMC6/rA/3Phos/');
  });

  test('Case 36: Can save regular atom properties (Charge, Isotope, Valence and Radical) to CML', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/Indigo/issues/3086
     * Description: Can save regular atom properties (Charge, Isotope, Valence and Radical) to CML
     * Scenario:
     * 1. Go to Molecules mode (empty canvas)
     * 2. Load KET
     * 3. Export canvas to CML
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Bugs/Standard atom properties.ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CML/Standard atom properties-expected.cml',
      FileType.CML,
    );
  });
});
