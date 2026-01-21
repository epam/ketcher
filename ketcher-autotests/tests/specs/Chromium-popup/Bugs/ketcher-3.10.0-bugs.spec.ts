/* eslint-disable no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */
import { test, expect } from '@fixtures';
import { Page } from '@playwright/test';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import {
  ConnectionPointOption,
  MonomerOption,
} from '@tests/pages/constants/contextMenu/Constants';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { Library } from '@tests/pages/macromolecules/Library';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import {
  createMonomer,
  CreateMonomerDialog,
  deselectAtomAndBonds,
  ModificationTypeDropdown,
} from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import {
  MacroFileType,
  selectAllStructuresOnCanvas,
  takeEditorScreenshot,
  takeElementScreenshot,
} from '@utils/canvas';
import {
  openFileAndAddToCanvas,
  openFileAndAddToCanvasMacro,
  pasteFromClipboardAndAddToCanvas,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  pasteFromClipboardAndOpenAsNewProject,
} from '@utils/files';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import {
  AminoAcidNaturalAnalogue,
  ModificationType,
  MonomerType,
  NucleotideNaturalAnalogue,
} from '@tests/pages/constants/createMonomerDialog/Constants';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { MonomerPreviewTooltip } from '@tests/pages/macromolecules/canvas/MonomerPreviewTooltip';
import { OpenStructureDialog } from '@tests/pages/common/OpenStructureDialog';
import { PasteFromClipboardDialog } from '@tests/pages/common/PasteFromClipboardDialog';
import { ErrorMessage } from '@tests/pages/constants/notificationMessageBanner/Constants';
import { NotificationMessageBanner } from '@tests/pages/molecules/canvas/createMonomer/NotificationMessageBanner';
import { drawBenzeneRing } from '@tests/pages/molecules/BottomToolbar';
import {
  resetSelection,
  rotateToCoordinates,
} from '@tests/specs/Structure-Creating-&-Editing/Actions-With-Structures/Rotation/utils';
import {
  verifyPNGExport,
  verifySVGExport,
} from '@utils/files/receiveFileComparisonData';
import {
  clickInTheMiddleOfTheScreen,
  getCoordinatesOfTheMiddleOfTheScreen,
} from '@utils/index';
import { updateMonomersLibrary } from '@utils/library/updateLibrary';
import { Mode } from '@tests/pages/constants/commonTopRightToolbar/Constants';
import { Chem } from '@tests/pages/constants/monomers/Chem';
import {
  resetSettingsValuesToDefault,
  setSettingsOption,
} from '@tests/pages/molecules/canvas/SettingsDialog';
import { StereochemistrySetting } from '@tests/pages/constants/settingsDialog/Constants';
import { DragoGhostElement } from '@tests/pages/macromolecules/canvas/DragonGhostElement';
import { Base } from '@tests/pages/constants/monomers/Bases';
import { Phosphate } from '@tests/pages/constants/monomers/Phosphates';
import { AmbiguousMonomerPreviewTooltip } from '@tests/pages/macromolecules/canvas/AmbiguousMonomerPreviewTooltip';
import { AttachmentPointsDialog } from '@tests/pages/macromolecules/canvas/AttachmentPointsDialog';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
import { ErrorMessageDialog } from '@tests/pages/common/ErrorMessageDialog';
import { Sugar } from '@tests/pages/constants/monomers/Sugars';

let page: Page;

test.describe('Ketcher-3.10 Bugs', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });
  test.beforeEach(async ({ MoleculesCanvas: _ }) => {});
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });
  test('1.Macro: Wrong tooltip for "minimize window" button (shows "expand window")', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/3742
     * Bug: https://github.com/epam/ketcher/issues/3580
     * Description: Macro: Wrong tooltip for "minimize window" button (shows "expand window")
     * Scenario:
     * 1. Open Ketcher
     * 2. Switch to Macromolecules flex mode
     * 3. Load from HELM: CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$$$$V2.0
     * 4. Select Single Bound tool
     * 5. Start to connect one monomer to another using center-to-center way
     * 6.Expand windows "minimize button" shows "minimize window"
     *
     * Version 3.10.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
    });
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$$$$V2.0',
    );
    const firstMonomer = getMonomerLocator(page, { monomerId: 2 });
    const secondMonomer = getMonomerLocator(page, { monomerId: 3 });
    await bondTwoMonomers(page, firstMonomer, secondMonomer);
    await AttachmentPointsDialog(page).isVisible();
    await AttachmentPointsDialog(page).expandWindow();
    expect(AttachmentPointsDialog(page).expandWindowButton).toHaveAttribute(
      'title',
      'Minimize window',
    );
    await AttachmentPointsDialog(page).expandWindow();
    expect(AttachmentPointsDialog(page).expandWindowButton).toHaveAttribute(
      'title',
      'Expand window',
    );
    await AttachmentPointsDialog(page).cancel();
  });
  test('2.The Arrange as a Ring option should be inactive(disabled), when fewer than three monomers are selected. ', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8369
     * Bug: https://github.com/epam/ketcher/issues/7970
     * Description:  Circular layout option is active even when structure does not meet minimal closure requirements
     * Scenario:
     * 1. Go to Macromolecules mode - Flex canvas (empty)
     * 2. Load from HELM: PEPTIDE1{A}|PEPTIDE2{A}$$$$V2.0
     * 3. Select all structures on the canvas
     * 4. Open context menu on any monomer
     * 5. Verify arrange in a ring option is disabled
     *
     * Version 3.10.0
     */

    const arrangeAsARing = page.getByTestId(MonomerOption.ArrangeAsARing);
    const anyMonomer = getMonomerLocator(page, {}).first();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
      goToPeptides: true,
    });
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A}|PEPTIDE2{A}$$$$V2.0',
    );
    await selectAllStructuresOnCanvas(page);
    await ContextMenu(page, anyMonomer).open();
    await ContextMenu(page, anyMonomer).contextMenuBody.waitFor({
      state: 'visible',
    });
    await expect(arrangeAsARing).toHaveAttribute('aria-disabled', 'true');
  });
  test('3.Context menu incorrectly allows “Arrange as a Ring” even when selection criteria are not met', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8368
     * Bug: https://github.com/epam/ketcher/issues/7970
     * Description:  The Circular layout option in the right-click context menu becomes available even
     *  when the selection does not satisfy the conditions described in the requirements.
     * Scenario:
     * 1. Go to Macromolecules mode - Flex canvas (empty)
     * 2. Open a structure that includes small molecules or does not form a valid closed structure
     * 3. Select all structures on the canvas
     * 4. Open context menu on any monomer
     * 5. Verify "arrange in a ring" option is disabled
     *
     * Version 3.10.0
     */
    const arrangeAsARing = page.getByTestId(MonomerOption.ArrangeAsARing);
    const anyMonomer = getMonomerLocator(page, { monomerId: 90 }).first();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
      goToPeptides: true,
    });
    await openFileAndAddToCanvasMacro(
      page,
      'KET/Chromium-popup/Bugs/ketcher-3.10.0-bugs/micro-macro-structures.ket',
    );
    await selectAllStructuresOnCanvas(page);
    await ContextMenu(page, anyMonomer).open();
    await ContextMenu(page, anyMonomer).contextMenuBody.waitFor({
      state: 'visible',
    });
    await expect(arrangeAsARing).toHaveAttribute('aria-disabled', 'true');
  });
  test('4.Undo does not revert "Arrange as a ring" - structure disappears, ghost bonds remain and cause console errors', async () => {
    /*
     * Test case:https://github.com/epam/ketcher/issues/8367
     * Bug: https://github.com/epam/ketcher/issues/7970
     * Description:  After using the "Arrange as a ring" function from the context menu,
     *  performing an Undo operation does not revert the changes made by the "Arrange as a ring" function.
     * Scenario:
     * 1. Go to Macromolecules mode - Sequence canvas (empty)
     * 2. Load from HELM monomer chain
     * 3. Switch to Flex mode
     * 4. Select all structures on the canvas
     * 5. Open context menu on any monomer
     * 6. Click "Arrange as a ring"
     * 7. Perform Undo operation
     * 8. Verify that structure is reverted back to the state before "Arrange as a ring" action
     *
     * Version 3.10.0
     */
    const arrangeAsARing = page.getByTestId(MonomerOption.ArrangeAsARing);
    const anyMonomer = getMonomerLocator(page, {}).first();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: false,
    });
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{r(A)p.r(A)p.r(A)p.r(A)}|RNA2{r(U)p.r(U)p.r(U)p.r(U)}$RNA1,RNA2,11:pair-2:pair|RNA1,RNA2,8:pair-5:pair|RNA1,RNA2,5:pair-8:pair|RNA1,RNA2,2:pair-11:pair$$$V2.0',
    );
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await selectAllStructuresOnCanvas(page);
    await ContextMenu(page, anyMonomer).open();
    await expect(arrangeAsARing).toHaveAttribute('aria-disabled', 'false');
    await arrangeAsARing.click();
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
  });
  test('5."Arrange as a ring" in Snake mode should not be available in the context menu.', async () => {
    /*
     * Test case:https://github.com/epam/ketcher/issues/8366
     * Bug: https://github.com/epam/ketcher/issues/7970
     * Description:  The "Arrange as a ring" option is available in the context menu when using the Snake layout mode.
     * Scenario:
     * 1. Go to Macromolecules mode - Sequence canvas (empty)
     * 2. Load from HELM monomer chain
     * 3. Ensure Snake layout mode is selected
     * 4. Select all structures on the canvas
     * 5. Open context menu on any monomer
     * 6. Verify "arrange in a ring" option is disabled
     *
     * Version 3.10.0
     */
    const arrangeAsARing = page.getByTestId(MonomerOption.ArrangeAsARing);
    const anyMonomer = getMonomerLocator(page, {}).first();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: false,
    });
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{r(A)p.r(A)p.r(A)}|RNA2{r(U)p.r(U)p.r(U)}$RNA1,RNA2,8:pair-2:pair|RNA1,RNA2,5:pair-5:pair|RNA1,RNA2,2:pair-8:pair$$$V2.0',
    );
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await selectAllStructuresOnCanvas(page);
    await ContextMenu(page, anyMonomer).open();
    await expect(arrangeAsARing).toHaveAttribute('aria-disabled', 'true');
  });
  test('6.No limit on the number of added modification fields; new fields extend beyond the visible wizard area and shift action buttons', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8337
     * Bug: https://github.com/epam/ketcher/issues/7633
     * Description:  TThere is no restriction on how many modification type fields can be added in the monomer creation wizard.
     * Scenario:
     * 1. Open file with benzene ring structure and add to canvas
     * 2. Open Macromolecules editor
     * 3.Set Type = Amino acid.
     * 4.Choose a Natural analogue (e.g., A).
     * 5.Click + Add modification type repeatedly (5 times).
     * 6. Verify that "add modification type" button is disabled after adding 5 modification fields.
     * 7. Verify that action buttons are visible.
     *
     * Version 3.10.0
     */
    const createMonomerDialog = CreateMonomerDialog(page);
    await openFileAndAddToCanvasMacro(
      page,
      'KET/Chromium-popup/Bugs/ketcher-3.10.0-bugs/benzene-ring.ket',
    );
    await deselectAtomAndBonds(page);
    await expect(LeftToolbar(page).createMonomerButton).toBeEnabled();
    await LeftToolbar(page).createMonomer();
    await createMonomerDialog.selectType(MonomerType.AminoAcid);
    await createMonomerDialog.selectNaturalAnalogue(
      NucleotideNaturalAnalogue.A,
    );
    for (let i = 0; i < 5; i++) {
      await createMonomerDialog.addModificationType();
    }
    const addModificationTypeButton =
      createMonomerDialog.modificationSection.addModificationTypeButton;
    await expect(addModificationTypeButton).toBeDisabled();
    await expect(createMonomerDialog.discardButton).toBeVisible();
    await expect(createMonomerDialog.submitButton).toBeVisible();
    await createMonomerDialog.discard();
  });
  test('7.Duplicate modification types per natural analogue show wrong error message', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7633
     * Bug: https://github.com/epam/ketcher/issues/8333
     *
     * Description: When a user adds the same modification type twice for the same Natural analogue
     *  (Amino acid), clicking Submit shows the message “Modification types must be unique.” instead
     * of the exact wording required by the spec.
     * Scenario:
     * 1. Open file with benzene ring structure and add to canvas
     * 2. Open Create Monomer Wizard
     * 3. Set Type = Amino acid.
     * 4. Assign a Symbol (e.g., CHEM2).
     * 4. Choose a Natural analogue (e.g., A).
     * 5. Add modification type (e.g., Phosphorylation).
     * 6. Add the same modification type again (e.g., Phosphorylation).
     * 7. Click Submit.
     * 8. Verify error message text.
     *
     * Version 3.10.0
     */
    const createMonomerDialog = CreateMonomerDialog(page);
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      'C1C=CC=CC%91=1.[*:1]%91 |$;;;;;;_R1$|',
    );
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).createMonomer();
    await createMonomerDialog.selectType(MonomerType.AminoAcid);
    await createMonomerDialog.setSymbol('CHEM2');
    await createMonomerDialog.selectNaturalAnalogue(
      NucleotideNaturalAnalogue.A,
    );
    for (let i = 0; i < 2; i++) {
      await createMonomerDialog.addModificationType();
    }
    await createMonomerDialog.selectModificationType({
      dropdown: ModificationTypeDropdown.First,
      type: ModificationType.Citrullination,
    });
    await createMonomerDialog.selectModificationType({
      dropdown: ModificationTypeDropdown.Second,
      type: ModificationType.Citrullination,
    });
    await createMonomerDialog.submit();
    expect(
      await NotificationMessageBanner(
        page,
        ErrorMessage.symbolExists,
      ).getNotificationMessage(),
    ).toEqual(
      'Only one amino acid within a natural analogue can have the same modification type.',
    );
    await createMonomerDialog.discard();
  });
  test('8.Modification list overflows tooltip boundaries when three or more modification types are added.', async () => {
    /*
     * Test case:https://github.com/epam/ketcher/issues/7633
     * Bug:https://github.com/epam/ketcher/issues/8335
     *
     * Description: When a monomer with three or more modification types is created in the
     *  wizard and then viewed in Macromolecule mode, the modification list inside the tooltip
     *  extends beyond the tooltip boundaries.
     * Scenario:
     */
    const targetAtom = getAtomLocator(page, { atomLabel: 'C' }).first();
    const createMonomerDialog = CreateMonomerDialog(page);
    await openFileAndAddToCanvasMacro(
      page,
      'KET/Chromium-popup/Bugs/ketcher-3.10.0-bugs/benzene-ring.ket',
    );
    await deselectAtomAndBonds(page);
    await expect(LeftToolbar(page).createMonomerButton).toBeEnabled();
    await LeftToolbar(page).createMonomer();
    await createMonomerDialog.selectType(MonomerType.AminoAcid);
    await createMonomerDialog.setSymbol('CHEM1');
    await createMonomerDialog.selectNaturalAnalogue(
      NucleotideNaturalAnalogue.A,
    );
    for (let i = 0; i < 3; i++) {
      await createMonomerDialog.addModificationType();
    }
    await createMonomerDialog.selectModificationType({
      dropdown: ModificationTypeDropdown.First,
      type: ModificationType.Citrullination,
    });
    await createMonomerDialog.selectModificationType({
      dropdown: ModificationTypeDropdown.Second,
      type: ModificationType.Hydroxylation,
    });
    await createMonomerDialog.selectModificationType({
      dropdown: ModificationTypeDropdown.Third,
      type: ModificationType.Phosphorylation,
    });
    await ContextMenu(page, targetAtom).click(
      ConnectionPointOption.MarkAsConnectionPoint,
    );
    await createMonomerDialog.submit();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    const monomerOnCanvas = getMonomerLocator(page, {
      monomerAlias: 'CHEM1',
    });
    await expect(monomerOnCanvas).toBeVisible();
    await monomerOnCanvas.hover();
    await MonomerPreviewTooltip(page).waitForBecomeVisible();
    await takeElementScreenshot(page, MonomerPreviewTooltip(page).window, {
      padding: 5,
    });
  });
  test('9.Ketcher crashes completely when switching from Wizard mode to Macro mode', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7633
     * Bug: https://github.com/epam/ketcher/issues/8334
     * Description: When the user switches from the Create Monomer Wizard to Macromolecule mode,
     *  the entire application crashes.The screen becomes completely white, and the console
     *  displays a TypeError.
     * Scenario:
     * 1. Open file with benzene ring structure and add to canvas
     * 2. Open Create Monomer Wizard
     * 3. Switch to Macromolecule mode
     * 4. Verify that Ketcher is not crashed
     *
     * Version 3.10.0
     */
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        test.fail(
          msg.type() === 'error',
          `There is error in console: ${msg.text}`,
        );
      }
    });
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      'C1C=CC=CC%91=1.[*:1]%91 |$;;;;;;_R1$|',
    );
    await deselectAtomAndBonds(page);
    await LeftToolbar(page).createMonomer();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await expect(CommonTopLeftToolbar(page).undoButton).toBeEnabled();
    const rnaPresetGroup = page.getByTestId('rna-preset-group');
    expect(rnaPresetGroup).toBeVisible();
  });
  test('10.“+ Add modification type” option appears only after selecting Natural analogue instead of monomer type Amino acid', async () => {
    /*
     * Test case:https://github.com/epam/ketcher/issues/7633
     * Bug: https://github.com/epam/ketcher/issues/8330
     * Description: “+ Add modification type” option appears only after selecting a Natural analogue from the drop-down,
     *  instead of when the monomer type Amino acid is chosen.
     *
     * Scenario:
     * 1. Open file with benzene ring structure and add to canvas
     * 2. Open Create Monomer Wizard
     * 3. Set Type = Amino acid.
     * 4. Verify that "+ Add modification type" button is visible
     *
     * Version 3.10.0
     */
    const createMonomerDialog = CreateMonomerDialog(page);
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      'C1C=CC=CC%91=1.[*:1]%91 |$;;;;;;_R1$|',
    );
    await LeftToolbar(page).createMonomer();
    await createMonomerDialog.selectType(MonomerType.AminoAcid);
    await expect(createMonomerDialog.modificationSection).toBeVisible();
    await createMonomerDialog.discard();
  });
  test('11.Modification drop-down list is not ordered as required (Natural Amino Acid first, others alphabetically)', async () => {
    /*
     * Test case:https://github.com/epam/ketcher/issues/7633
     * Bug: https://github.com/epam/ketcher/issues/8328
     * Description:When creating a monomer and opening the Modification drop-down list in the Attributes panel, the items are
     *  not ordered correctly . The list currently displays modification types without prioritizing Natural Amino Acid first
     *  and without proper alphabetical order for the rest.
     * Scenario:
     * 1. Open file with benzene ring structure and add to canvas
     * 2. Open Create Monomer Wizard
     * 3. Set Type = Amino acid.
     * 4. Choose a Natural analogue (e.g., A).
     * 5. Open Modification type drop-down list
     * 6. Verify the order of items in the list
     *
     * Version 3.10.0
     */
    const createMonomerDialog = CreateMonomerDialog(page);
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      'C1C=CC=CC%91=1.[*:1]%91 |$;;;;;;_R1$|',
    );
    await LeftToolbar(page).createMonomer();
    await createMonomerDialog.selectType(MonomerType.AminoAcid);
    await createMonomerDialog.selectNaturalAnalogue(
      NucleotideNaturalAnalogue.A,
    );
    await createMonomerDialog.addModificationType();
    const modificationTypeDropdown =
      createMonomerDialog.modificationSection.modificationTypeDropdown1;
    await modificationTypeDropdown.click();
    const dropdownMenu = page.locator('[role="listbox"]');
    await dropdownMenu.waitFor({ state: 'visible' });
    await takeElementScreenshot(page, dropdownMenu);
    await createMonomerDialog.discard();
  });
  test('12.AxoLabs option format in format selection combobox shown as AXO-LABS, and option "Kate Format shows KET', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7748 , https://github.com/epam/ketcher/issues/4467
     * Bug: https://github.com/epam/ketcher/issues/8036
     * Description: In the format selection combobox, the AxoLabs option is incorrectly displayed as AXO-LABS (all uppercase).
     * Scenario:
     * 1. Open Ketcher
     * 2. Open format selection combobox
     * 3. Verify AxoLabs option format is shown as AxoLabs
     *
     * Version 3.10.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
    });
    await CommonTopLeftToolbar(page).openFile();
    await OpenStructureDialog(page).pasteFromClipboard();
    await PasteFromClipboardDialog(page).selectContentType(
      MacroFileType.AxoLabs,
    );
    await expect(PasteFromClipboardDialog(page).contentTypeSelector).toHaveText(
      'AxoLabs',
    );
    await PasteFromClipboardDialog(page).selectContentType(
      MacroFileType.KetFormat,
    );
    await expect(PasteFromClipboardDialog(page).contentTypeSelector).toHaveText(
      'Ket Format',
    );
    await OpenStructureDialog(page).closeWindow();
  });
  test('13.For non-potential-AAs the related context menu option (Mark as connection point,) should be disabled', async () => {
    /*
     * Test case:https://github.com/epam/ketcher/issues/7730
     * Bug: https://github.com/epam/ketcher/issues/7997
     * Description: Mark as connection point option is present in context menu and active
     * Scenario:
     * 1. Open Molecules mode (clean canvas)
     * 2. Load structure from clipboard: [*:1]CCCCCC |$_R1;;;;;;$|
     * 3. Select whole structure
     * 4. Press Create monomer button
     * 5. Call context menu for atom that already attachment atom (try to create SECOND attachment point for the same atom)
     *
     * Version 3.10.0
     *
     */
    const targetAtom = getAtomLocator(page, { atomLabel: 'C' }).first();
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      '[*:1]CCCCCC |$_R1;;;;;;$|',
    );
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).createMonomer();
    await ContextMenu(page, targetAtom).open();
    await expect(
      page.getByTestId(ConnectionPointOption.MarkAsConnectionPoint),
    ).toBeEnabled();
    await CreateMonomerDialog(page).discard();
  });
  test('14.Molecule rotation causes error in console: Uncaught TypeError: Cannot read properties of undefined', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/2090
     * Bug: https://github.com/epam/ketcher/issues/7887
     * Description: When attempting to rotate a molecule on the canvas using the Rotate tool,
     *  an error occurs in the console: Uncaught TypeError: Cannot read properties of undefined.
     * Scenario:
     * 1. Open Ketcher
     * 2. Place on the canvas Benzene ring from bottom toolbar
     * 3. Select element
     * 4.Drag rotation handle and rotate molecule to the right (or left)
     *
     * Version 3.10.0
     */
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        test.fail(
          msg.type() === 'error',
          `There is error in console: ${msg.text}`,
        );
      }
    });
    await drawBenzeneRing(page);
    await selectAllStructuresOnCanvas(page);
    await rotateToCoordinates(page, { x: 10, y: 20 });
    await resetSelection(page);
  });
  test('15.System throws error to console after every monomer creation', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7885
     * Bug: https://github.com/epam/ketcher/issues/7441
     * Description: After creating a monomer using the Create Monomer wizard, console throws an error.
     * Scenario:
     * 1. Open Ketcher
     * 2. Load structure from Extended SMILES: [*:1]C |$_R1;$|
     * 3. Select whole structure
     * 4. Press Create monomer button
     * 5. In Create Monomer dialog set:
     * - Type: Amino Acid
     * - Natural Analogue: A
     * 6. Click Submit
     * 7. Verify no errors in console
     *
     * Version 3.10.0
     */
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        test.fail(
          msg.type() === 'error',
          `There is error in console: ${msg.text}`,
        );
      }
    });
    await pasteFromClipboardAndOpenAsNewProject(page, '[*:1]CC |$_R1;;$|');
    await selectAllStructuresOnCanvas(page);
    await createMonomer(page, {
      type: MonomerType.AminoAcid,
      symbol: 'RNA',
      name: 'GLY',
      naturalAnalogue: AminoAcidNaturalAnalogue.A,
    });
  });
  test('16.System replace few spaces in monomer name to one space on monomer preview', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7746
     * Bug: https://github.com/epam/ketcher/issues/6552
     * Description: System replace few spaces in monomer name to one space on monomer preview
     * Scenario:
     * 1. Open Ketcher, molecules mode
     * 2.Click on "100%" zoom control in the top right corner and change value to "350%"
     * 3.Paste to clipboard and load SMILES: BrBr
     * 4. With Rectangle selector select left Br atom and bond element]
     * 5.Click the "Create a monomer" button
     * 6. In the Create Monomer dialog set:
     * - Type: CHEM
     * - Symbol: LongName
     * - Name: 1 2  3   4    5     6       End
     * 7. Click Submit
     * 8. Change to Macromolecules mode
     * 9.Hover the mouse over the monomer on the canvas.
     *
     * Version 3.10.0
     */
    const monomerName = '1 2  3   4    5     6       End';
    await pasteFromClipboardAndAddToCanvas(page, 'BrBrBr');
    await await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).areaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await deselectAtomAndBonds(page, ['5']);
    await createMonomer(page, {
      type: MonomerType.CHEM,
      symbol: 'LongName',
      name: monomerName,
    });
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
    });
    const monomerOnCanvas = getMonomerLocator(page, {
      monomerAlias: 'LongName',
    });
    await expect(monomerOnCanvas).toBeVisible();
    await monomerOnCanvas.hover();
    await MonomerPreviewTooltip(page).waitForBecomeVisible();
    expect(await MonomerPreviewTooltip(page).getTitleText()).toBe(monomerName);
  });
  test('17.Dropdown for switching between Macro and Micro modes does not appear in fullscreen mode', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7553
     * Description: When the editor is in fullscreen mode, it becomes impossible to switch between macromolecule
     *  and micromolecule modes, because the mode selection dropdown does not appear. This issue is reproducible
     *  both in development and production environments.
     * Scenario:
     * 1. Open Ketcher
     * 2. Switch to fullscreen mode
     * 3. Verify mode selection dropdown is present
     *
     * Version 3.10.0
     */
    const macroOption = page.getByTestId(Mode.Macromolecules);
    const modeSelectionDropdown =
      CommonTopRightToolbar(page).ketcherModeSwitcherCombobox;
    const macromoleculesCanvas = page.locator('#polymer-editor-canvas');
    await expect(modeSelectionDropdown).toBeVisible();
    await CommonTopRightToolbar(page).fullScreenButton.click();
    await modeSelectionDropdown.click();
    await expect(macroOption).toBeVisible();
    await macroOption.click();
    await expect(macromoleculesCanvas).toBeVisible();
  });
  test('18."Ghost image" of CHEM is white (different from "ghost image" of other monomer types)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7421
     * Bug: https://github.com/epam/ketcher/issues/6404
     * Description: "Ghost image" of CHEM is white (different from "ghost image" of other monomer types)
     * Scenario:
     * 1. Open Ketcher
     * 2. Switch to Macromolecules flex mode
     * 3.In the Library on the right panel, click the "CHEM" tab
     * 4.Click and hold any CHEM item in the Library, then drag the cursor over the Canvas without dropping it
     * 5. Verify the "ghost image" of CHEM is correct (not white)
     *
     * Version 3.10.0
     */
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
    });
    await Library(page).switchToCHEMTab();
    await CommonLeftToolbar(page).handToolButton.click();
    await Library(page).hoverMonomer(Chem.A6OH);
    await page.mouse.down();
    await page.mouse.move(x, y);
    const ghostImage = DragoGhostElement(page).dragonGhostElement;
    await takeElementScreenshot(page, ghostImage, { padding: 5 });
    await page.mouse.up();
  });
  test('19.PNG and SVG exported images should be identical to how the canvas looks like in case of Chiral label', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/5570
     * Description: When exporting structures containing chiral labels as PNG or SVG images, there shouldn't be chiral flag.
     * Scenario:
     * 1. Open Ketcher molecules mode
     * 2. Go to Settings - Stereochemistry tab
     * 3. Switch off Show the Stereo flags (click Apply)
     * 4. Load from file exported SVG and PNG images with chiral labels
     * 5. Save canvas to PNG/SVG
     * 6. Compare images
     *
     * Version 3.10.0
     */
    await resetSettingsValuesToDefault(page);
    await setSettingsOption(page, StereochemistrySetting.ShowTheStereoFlags);
    await openFileAndAddToCanvas(
      page,
      'KET/Chromium-popup/Bugs/ketcher-3.10.0-bugs/PNGandSVGexpertedImages.ket',
    );
    const chiralLabel = page.getByText('ABS').first();
    await expect(chiralLabel).not.toBeVisible();
    await verifyPNGExport(page);
    await verifySVGExport(page);
  });
  test('20.Percentages for mixed bases is not sorted from biggest to smallest in tooltip', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/5520
     * Description: After pasting from clpboard, components are not sorted by percentages from biggest to smallest in tooltip
     * Scenario:
     * 1. Open Ketcher molecules mode
     * 2. Switch to macromolecules flex mode
     * 3. Load using paste from clipboard way following HELM:
     *  RNA1{[menoe2]([nobn6p]+[m2nprn]:1+[nC6n2G]:2+[nC6n8A]:3)[m2nen]}$$$$V2.0
     * 4.Expect that components are sorted by percentages from biggest to smallest in tooltip
     *
     * Version 3.10.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
    });
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[menoe2]([nobn6p]+[m2nprn]:1+[nC6n2G]:2+[nC6n8A]:3)[m2nen]}$$$$V2.0',
    );
    const baseMonomer = getMonomerLocator(page, {
      monomerAlias: '%',
    });
    await baseMonomer.hover();
    await AmbiguousMonomerPreviewTooltip(page).isVisible();
    await takeElementScreenshot(
      page,
      AmbiguousMonomerPreviewTooltip(page).window,
    );
  });
  test('21.All monomers from SDF loaded via updateMonomersLibrary appear in Base group instead of their correct classes', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8418
     * Bug: https://github.com/epam/ketcher/issues/7674
     * Description:When importing multiple monomers in a single SDF record using the API
     * await ketcher.updateMonomersLibrary(sdfString, { format: 'sdf' });
     * Ketcher places all monomers into the Base group, even if their SGROUP and TEMPLATE classes are defined correctly as  * SUGAR, PHOSPHATE, and BASE.
     * Scenario:
     * 1. Open Ketcher
     * 2. Switch to Macromolecules flex mode
     * 3. Load from HELM: CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$$$$V2.0
     * 4. Select Single Bound tool
     * 5. Start to connect one monomer to another using center-to-center way
     * 6.Expand windows "minimize button" shows "minimize window"
     *
     * Version 3.10.0
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, max-len
    const sdf =
      // eslint-disable-next-line max-len
      '\nGenerated by WebMolKit\n\n  0  0  0     0  0            999 V3000\nM  V30 BEGIN CTAB\nM  V30 COUNTS 3 2 0 0 1\nM  V30 BEGIN ATOM\nM  V30 1 sAargh 0.0000 0.0000 0.0000 0 CLASS=SUGAR SEQID=1 ATTCHORD=(4 2 Cx 3 Br)\nM  V30 2 Aargh 0.0000 -1.5000 0.0000 0 CLASS=BASE SEQID=1 ATTCHORD=(2 1 Al)\nM  V30 3 pAargh 1.5000 0.0000 0.0000 0 CLASS=PHOSPHATE SEQID=1 ATTCHORD=(2 1 Al)\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 1 1 2\nM  V30 2 1 1 3\nM  V30 END BOND\nM  V30 END CTAB\nM  V30 BEGIN TEMPLATE\nM  V30 TEMPLATE 1 SUGAR/sAargh/sAargh/ NATREPLACE=SUGAR/A\nM  V30 BEGIN CTAB\nM  V30 COUNTS 14 14 4 0 1\nM  V30 BEGIN ATOM\nM  V30 1 C 6.8788 -8.9823 0.0000 0\nM  V30 2 C 8.1754 -9.7373 0.0000 0\nM  V30 3 C 7.8574 -11.2030 0.0000 0\nM  V30 4 C 6.3654 -11.3536 0.0000 0\nM  V30 5 O 5.7612 -9.9809 0.0000 0\nM  V30 6 O 8.8564 -12.3227 0.0000 0\nM  V30 7 N 9.5483 -9.1332 0.0000 0\nM  V30 8 C 5.6091 -12.6491 0.0000 0\nM  V30 9 O 4.1097 -12.6425 0.0000 0\nM  V30 10 C 10.7581 -10.0199 0.0000 0\nM  V30 11 C 9.7114 -7.6420 0.0000 0\nM  V30 12 H 3.3540 -13.9385 0.0000 0\nM  V30 13 H 10.1105 -13.1457 0.0000 0\nM  V30 14 H 6.7276 -7.4896 0.0000 0\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 1 1 5\nM  V30 2 1 5 4\nM  V30 3 1 4 3\nM  V30 4 1 3 2\nM  V30 5 1 2 1\nM  V30 6 1 3 6 CFG=3\nM  V30 7 1 2 7 CFG=1\nM  V30 8 1 4 8 CFG=1\nM  V30 9 1 8 9\nM  V30 10 1 1 14\nM  V30 11 1 6 13\nM  V30 12 1 7 10\nM  V30 13 1 7 11\nM  V30 14 1 9 12\nM  V30 END BOND\nM  V30 BEGIN SGROUP\nM  V30 1 SUP 0 LABEL=sAargh ATOMS=(11 1 2 3 4 5 6 7 8 9 10 11) XBONDS=(2 14 11) CLASS=SUGAR NATREPLACE=SUGAR/A SAP=(3 9 12 Al) SAP=(3 6 13 Br) SAP=(3 1 14 Cx)\nM  V30 2 SUP 0 LABEL=H ATOMS=(1 12) XBONDS=(1 14) CLASS=LGRP\nM  V30 3 SUP 0 LABEL=H ATOMS=(1 13) XBONDS=(1 11) CLASS=LGRP\nM  V30 4 SUP 0 LABEL=H ATOMS=(1 14) XBONDS=(1 10) CLASS=LGRP\nM  V30 END SGROUP\nM  V30 END CTAB\nM  V30 TEMPLATE 2 BASE/Aargh/Aargh/ NATREPLACE=BASE/A\nM  V30 BEGIN CTAB\nM  V30 COUNTS 12 13 2 0 1\nM  V30 BEGIN ATOM\nM  V30 1 N 8.8306 -8.3027 0.0000 0\nM  V30 2 C 7.3394 -8.1401 0.0000 0\nM  V30 3 C 6.7345 -6.7672 0.0000 0\nM  V30 4 C 7.6210 -5.5572 0.0000 0\nM  V30 5 N 9.1121 -5.7198 0.0000 0\nM  V30 6 C 9.7168 -7.0923 0.0000 0\nM  V30 7 N 5.2426 -6.9184 0.0000 0\nM  V30 8 C 4.9258 -8.3852 0.0000 0\nM  V30 9 N 6.2209 -9.1404 0.0000 0\nM  V30 10 N 7.0163 -4.1847 0.0000 0\nM  V30 11 F 11.2079 -7.2549 0.0000 0\nM  V30 12 H 6.3721 -10.6329 0.0000 0\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 2 6 1\nM  V30 2 1 1 2\nM  V30 3 2 2 3\nM  V30 4 1 3 4\nM  V30 5 2 4 5\nM  V30 6 1 5 6\nM  V30 7 1 2 9\nM  V30 8 1 9 8\nM  V30 9 2 8 7\nM  V30 10 1 7 3\nM  V30 11 1 4 10\nM  V30 12 1 12 9\nM  V30 13 1 6 11\nM  V30 END BOND\nM  V30 BEGIN SGROUP\nM  V30 1 SUP 0 LABEL=Aargh ATOMS=(11 1 2 3 4 5 6 7 8 9 10 11) XBONDS=(1 12) CLASS=BASE NATREPLACE=BASE/A SAP=(3 9 12 Al)\nM  V30 2 SUP 0 LABEL=H ATOMS=(1 12) XBONDS=(1 12) CLASS=LGRP\nM  V30 END SGROUP\nM  V30 END CTAB\nM  V30 TEMPLATE 3 PHOSPHATE/pAargh/pAargh/ NATREPLACE=PHOSPHATE/A\nM  V30 BEGIN CTAB\nM  V30 COUNTS 5 4 3 0 1\nM  V30 BEGIN ATOM\nM  V30 1 P 9.0768 -12.2211 0.0000 0\nM  V30 2 S 10.4167 -11.5466 0.0000 0\nM  V30 3 O 8.9913 -13.7184 0.0000 0\nM  V30 4 O 7.8228 -11.3981 0.0000 0\nM  V30 5 O 10.3309 -13.0440 0.0000 0\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 2 1 2\nM  V30 2 1 1 3\nM  V30 3 1 1 5\nM  V30 4 1 4 1\nM  V30 END BOND\nM  V30 BEGIN SGROUP\nM  V30 1 SUP 0 LABEL=pAargh ATOMS=(3 1 2 3) XBONDS=(2 4 3) CLASS=PHOSPHATE NATREPLACE=PHOSPHATE/A SAP=(3 1 4 Al) SAP=(3 1 5 Br)\nM  V30 2 SUP 0 LABEL=O ATOMS=(1 4) XBONDS=(1 4) CLASS=LGRP\nM  V30 3 SUP 0 LABEL=O ATOMS=(1 5) XBONDS=(1 3) CLASS=LGRP\nM  V30 END SGROUP\nM  V30 END CTAB\nM  V30 END TEMPLATE\nM  END\n>  <type>\nmonomerGroupTemplate\n\n$$$$\n';

    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: false,
    });
    const error = await updateMonomersLibrary(page, sdf);
    expect(error).toBeNull();
    expect(await Library(page).isMonomerExist(Phosphate.pAargh)).toBeTruthy();
    expect(await Library(page).isMonomerExist(Sugar.sAargh)).toBeTruthy();
    expect(await Library(page).isMonomerExist(Base.Aargh)).toBeTruthy();
  });
  test('22.System throws wrong error, when symbols without brackets cannot be interpreted', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8414
     * Bug: https://github.com/epam/Indigo/issues/3152
     * Description:
     * Scenario:
     * 1. Open Ketcher
     * 2. Open structure dialog, paste from clipboard
     * 3. Choose AxoLabs format option
     * 4. load  to structure dialog: "5'-zzz-3'"
     * 5. Add to canvas throws correct error message
     *
     * Version 3.10.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
    });
    await CommonTopLeftToolbar(page).openFile();
    await OpenStructureDialog(page).pasteFromClipboard();
    await PasteFromClipboardDialog(page).fillTextArea("5'-zzz-3'");
    await PasteFromClipboardDialog(page).selectContentType(
      MacroFileType.AxoLabs,
    );
    await PasteFromClipboardDialog(page).addToCanvas({
      errorMessageExpected: true,
    });
    const errorMessage = await ErrorMessageDialog(page).getErrorMessage();
    expect(errorMessage).toContain(
      // eslint-disable-next-line max-len
      `Convert error! Given string could not be loaded as (query or plain) molecule or reaction, see the error messages: 'SEQUENCE loader: The following string cannot be interpreted as an AxoLabs string: zz'`,
    );
    await ErrorMessageDialog(page).close();
    await OpenStructureDialog(page).closeWindow();
  });
});
