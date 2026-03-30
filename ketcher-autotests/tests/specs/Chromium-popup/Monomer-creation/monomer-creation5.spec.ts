/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Page, expect } from '@playwright/test';
import { test } from '@fixtures';
import { pasteFromClipboardAndOpenAsNewProject } from '@utils/files/readFile';
import {
  pasteFromClipboardByKeyboard,
  selectAllStructuresOnCanvas,
  takeElementScreenshot,
} from '@utils/canvas';
import {
  clickOnCanvas,
  dragMouseTo,
  moveMouseAway,
  shiftCanvas,
} from '@utils/index';
import {
  createMonomer,
  CreateMonomerDialog,
  ModificationTypeDropdown,
} from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import {
  AminoAcidNaturalAnalogue,
  ModificationType,
  MonomerType,
  NucleotideNaturalAnalogue,
} from '@tests/pages/constants/createMonomerDialog/Constants';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import {
  AttachmentPoint,
  getMonomerLocator,
} from '@utils/macromolecules/monomer';
import { MonomerPreviewTooltip } from '@tests/pages/macromolecules/canvas/MonomerPreviewTooltip';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { NotificationMessageBanner } from '@tests/pages/molecules/canvas/createMonomer/NotificationMessageBanner';
import { ErrorMessage } from '@tests/pages/constants/notificationMessageBanner/Constants';
import { Base } from '@tests/pages/constants/monomers/Bases';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import {
  MicroAtomOption,
  MicroBondOption,
  ModifyAminoAcidsOption,
  MonomerOption,
} from '@tests/pages/constants/contextMenu/Constants';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { Sugar } from '@tests/pages/constants/monomers/Sugars';
import { Phosphate } from '@tests/pages/constants/monomers/Phosphates';
import { Nucleotide } from '@tests/pages/constants/monomers/Nucleotides';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { ErrorMessageDialog } from '@tests/pages/common/ErrorMessageDialog';
import {
  MicroBondDataIds,
  MicroBondType,
} from '@tests/pages/constants/bondSelectionTool/Constants';
import { PeriodicTableElement } from '@tests/pages/constants/periodicTableDialog/Constants';
import { BottomToolbar } from '@tests/pages/molecules/BottomToolbar';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { AtomPropertiesDialog } from '@tests/pages/molecules/canvas/AtomPropertiesDialog';
import { BondPropertiesDialog } from '@tests/pages/molecules/canvas/BondPropertiesDialog';
import { PeriodicTableDialog } from '@tests/pages/molecules/canvas/PeriodicTableDialog';
import { StructureLibraryDialog } from '@tests/pages/molecules/canvas/StructureLibraryDialog';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { getBondLocator } from '@utils/macromolecules/polymerBond';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { MoleculesTopToolbar } from '@tests/pages/molecules/MoleculesTopToolbar';

let page: Page;
test.beforeAll(async ({ initMoleculesCanvas }) => {
  page = await initMoleculesCanvas();
});
test.afterAll(async ({ closePage }) => {
  await closePage();
});
test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

test(`1. Check that the user can set one modification type for amino acids by clicking on + Add modification type in the attributes window`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8436
   * Description: 1. Check that the user can set one modification type for amino acids by clicking on + Add modification type in the attributes window
   *              2. Check that the user can choose a modification type from a drop-down menu, or can enter a new modification type in the input field.
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Press Create Monomer button
   *      4. Set mandatory fields in Create Monomer dialog for amino acid monomer
   *      5. Set modification type by clicking on + Add modification type and selecting Citrullination type from dropdown
   *      6. Press Submit button
   *      7. Switch to Macromolecules mode
   *      8. Verify that the created monomer is present on the canvas
   *      9. Hover the monomer and open the tooltip
   *     10. Verify that the modification type is displayed in the tooltip
   *
   * Version 3.10
   */
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C%91%92%93C.[*:2]%91.[*:1]%92.[*:3]%93 |$;;_R2;_R1;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);

  await createMonomer(page, {
    type: MonomerType.AminoAcid,
    symbol: Peptide.Peptide.alias,
    name: 'Peptide Test monomer',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
    modificationTypes: [
      {
        dropdown: ModificationTypeDropdown.First,
        type: ModificationType.Citrullination,
      },
    ],
  });

  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
  const monomerOnCanvas = getMonomerLocator(page, Peptide.Peptide);
  await expect(monomerOnCanvas).toBeVisible();

  // shifting canvas to make tooltip appear fully
  await shiftCanvas(page, -150, 50);

  await monomerOnCanvas.hover();
  await MonomerPreviewTooltip(page).waitForBecomeVisible();
  expect(await MonomerPreviewTooltip(page).getModificationTypes()).toEqual(
    'Citrullination',
  );
});

test(`2. Check that the user can set few modification types for amino acids by clicking on + Add modification type in the attributes window`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8436
   * Description: 1. Check that the user can few modification types for amino acids by clicking on + Add modification type in the attributes window
   *              2. Check that the user can choose a modification type from a drop-down menu, or can enter a new modification type in the input field.
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Press Create Monomer button
   *      4. Set mandatory fields in Create Monomer dialog for amino acid monomer
   *      5. Set modification type by clicking on + Add modification type and selecting Citrullination type from dropdown and adding one more modification type Phosphorylation
   *      6. Press Submit button
   *      7. Switch to Macromolecules mode
   *      8. Verify that the created monomer is present on the canvas
   *      9. Hover the monomer and open the tooltip
   *     10. Verify that the modification type is displayed in the tooltip
   *
   * Version 3.10
   */
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C%91%92%93C.[*:2]%91.[*:1]%92.[*:3]%93 |$;;_R2;_R1;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);

  await createMonomer(page, {
    type: MonomerType.AminoAcid,
    symbol: Peptide.Peptide2.alias,
    name: 'Peptide2 Test monomer',
    naturalAnalogue: AminoAcidNaturalAnalogue.D,
    modificationTypes: [
      {
        dropdown: ModificationTypeDropdown.First,
        type: ModificationType.Citrullination,
      },
      {
        dropdown: ModificationTypeDropdown.Second,
        type: ModificationType.Phosphorylation,
      },
    ],
  });

  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
  const monomerOnCanvas = getMonomerLocator(page, Peptide.Peptide2);
  await expect(monomerOnCanvas).toBeVisible();

  // shifting canvas to make tooltip appear fully
  await shiftCanvas(page, -150, 50);

  await monomerOnCanvas.hover();
  await MonomerPreviewTooltip(page).waitForBecomeVisible();
  expect(await MonomerPreviewTooltip(page).getModificationTypes()).toEqual(
    'Citrullination, Phosphorylation',
  );
});

test(`3. Verify that the modifications in the drop-down are organized the same way as in the context menu - Natural Amino Acid first, all others alphabetically`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8436
   * Description: Verify that the modifications in the drop-down are organized the same way as in the context menu - Natural Amino Acid first, all others alphabetically
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Press Create Monomer button
   *      4. Set mandatory fields in Create Monomer dialog for amino acid monomer
   *      5. Set modification type by clicking on + Add modification type and click to open the dropdown
   *      6. Take screenshot to verify that the modifications in the drop-down are organized the same way as in the
   *         context menu - Natural Amino Acid first, all others alphabetically
   *
   * Version 3.10
   */
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C%91%92%93C.[*:2]%91.[*:1]%92.[*:3]%93 |$;;_R2;_R1;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);

  const createMonomerDialog = CreateMonomerDialog(page);
  await LeftToolbar(page).createMonomer();
  await createMonomerDialog.selectType(MonomerType.AminoAcid);
  await createMonomerDialog.expandModificationSection();
  await createMonomerDialog.addModificationType();
  await createMonomerDialog.modificationSection.modificationTypeDropdown1.click();
  await takeElementScreenshot(
    page,
    page.getByTestId(ModificationType.NaturalAminoAcid).locator('..'),
  );
  await clickOnCanvas(page, 0, 0);
  await createMonomerDialog.discard();
});

test(`4. Check that the option + Add modification type only appears after monomer type Amino acid is chosen`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8436
   * Description: Check that the option + Add modification type only appears after monomer type Amino acid is chosen
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Press Create Monomer button
   *      4. Set type in Create Monomer dialog to any other than Amino Acid
   *      5. Verify that the option + Add modification type does not appear
   *
   * Version 3.10
   */
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C%91%92%93C.[*:2]%91.[*:1]%92.[*:3]%93 |$;;_R2;_R1;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);

  const createMonomerDialog = CreateMonomerDialog(page);
  await LeftToolbar(page).createMonomer();
  await createMonomerDialog.selectType(MonomerType.Sugar);
  await expect(createMonomerDialog.modificationSection).not.toBeVisible();
  await createMonomerDialog.selectType(MonomerType.Base);
  await expect(createMonomerDialog.modificationSection).not.toBeVisible();
  await createMonomerDialog.selectType(MonomerType.Phosphate);
  await expect(createMonomerDialog.modificationSection).not.toBeVisible();
  await createMonomerDialog.selectType(MonomerType.NucleotideMonomer);
  await expect(createMonomerDialog.modificationSection).not.toBeVisible();
  await createMonomerDialog.selectType(MonomerType.CHEM);
  await expect(createMonomerDialog.modificationSection).not.toBeVisible();
  await createMonomerDialog.discard();
});

test(`5. Check that the modification type must be unique for one natural analogue`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8436
   * Description: 1. Check that the modification type must be unique for one natural analogue
   *              2. Check that if the modification type is not unique for one natural analogue, the modification type
   *                 field is highlighted red, until the check is performed again by clicking on Submit
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Press Create Monomer button
   *      4. Set type in Create Monomer dialog to Amino Acid
   *      5. Set modification type by clicking on + Add modification type and selecting Citrullination type from dropdown twice
   *      6. Fill all other mandatory fields
   *      7. Press Submit button
   *      8. Verify error message "Only one amino acid within a natural analogue can have the same modification type."
   *         is displayed near the modification type dropdowns
   *
   * Version 3.10
   */
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C%91%92%93C.[*:2]%91.[*:1]%92.[*:3]%93 |$;;_R2;_R1;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);

  await createMonomer(page, {
    type: MonomerType.AminoAcid,
    symbol: Peptide.Peptide.alias,
    name: 'Peptide Test monomer',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
    modificationTypes: [
      {
        dropdown: ModificationTypeDropdown.First,
        type: ModificationType.Citrullination,
      },
      {
        dropdown: ModificationTypeDropdown.Second,
        type: ModificationType.Citrullination,
      },
    ],
  });
  expect(
    await NotificationMessageBanner(
      page,
      ErrorMessage.symbolExists,
    ).getNotificationMessage(),
  ).toEqual(
    'Only one amino acid within a natural analogue can have the same modification type.',
  );

  await takeElementScreenshot(
    page,
    CreateMonomerDialog(
      page,
    ).modificationSection.modificationTypeDropdown1.locator('../../..'),
  );
  await CreateMonomerDialog(page).discard();
});

test(`6. Check that if the user changes the monomer type after they've entered a modification type, the the modification type is set to blank, the option + Add modification type disappears, and no modification type is saved`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8436
   * Description: Check that if the user changes the monomer type after they've entered a modification type,
   *              the the modification type is set to blank, the option + Add modification type disappears,
   *              and no modification type is saved
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Press Create Monomer button
   *      4. Set type in Create Monomer dialog to Amino Acid
   *      5. Set modification type by clicking on + Add modification type and selecting Citrullination type from dropdown
   *      6. Fill all other mandatory fields
   *      7. Change monomer type to Base
   *      8. Verify that the option + Add modification type disappears
   *      9. Press Submit button
   *     10. Switch to Macromolecules mode
   *     11. Verify that the created monomer is present on the canvas
   *     12. Hover the monomer and open the tooltip
   *     13. Verify that no modification type is displayed in the tooltip
   *
   * Version 3.10
   */
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C%91%92%93C.[*:2]%91.[*:1]%92.[*:3]%93 |$;;_R2;_R1;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);

  await LeftToolbar(page).createMonomer();

  const createMonomerDialog = CreateMonomerDialog(page);
  await createMonomerDialog.selectType(MonomerType.AminoAcid);
  await createMonomerDialog.selectModificationType({
    dropdown: ModificationTypeDropdown.First,
    type: ModificationType.Citrullination,
  });
  await createMonomerDialog.setSymbol(Base.Base.alias);
  await createMonomerDialog.setName('Base Test monomer');
  await createMonomerDialog.selectType(MonomerType.Base);
  await createMonomerDialog.selectNaturalAnalogue(NucleotideNaturalAnalogue.A);

  expect(createMonomerDialog.modificationSection).not.toBeVisible();

  await createMonomerDialog.submit({ ignoreWarning: true });

  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
  const monomerOnCanvas = getMonomerLocator(page, Base.Base);
  await expect(monomerOnCanvas).toBeVisible();

  // shifting canvas to make tooltip appear fully
  await shiftCanvas(page, -150, 50);

  await monomerOnCanvas.hover();
  await MonomerPreviewTooltip(page).waitForBecomeVisible();
  expect(await MonomerPreviewTooltip(page).getModificationTypes()).toEqual('');
});

test(`7. Check that the user can remove a modification type after it is set`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8436
   * Description: Check that the user can remove a modification type after it is set
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Press Create Monomer button
   *      4. Set type in Create Monomer dialog to Amino Acid
   *      5. Set modification type by clicking on + Add modification type and selecting Citrullination type from dropdown
   *      6. Remove the modification type
   *      7. Verify that the modification type section is collapsed
   *
   * Version 3.10
   */
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C%91%92%93C.[*:2]%91.[*:1]%92.[*:3]%93 |$;;_R2;_R1;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);

  await LeftToolbar(page).createMonomer();

  const createMonomerDialog = CreateMonomerDialog(page);
  await createMonomerDialog.selectType(MonomerType.AminoAcid);
  await createMonomerDialog.selectModificationType({
    dropdown: ModificationTypeDropdown.First,
    type: ModificationType.Citrullination,
  });
  await takeElementScreenshot(
    page,
    createMonomerDialog.modificationSection.locator('..'),
  );
  await createMonomerDialog.deleteModificationType(
    ModificationTypeDropdown.First,
  );
  await takeElementScreenshot(
    page,
    createMonomerDialog.modificationSection.locator('..'),
  );
  await createMonomerDialog.discard();
});

test(`8. Verify that the modification type section in the attributes panel can be expanded and collapsed`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8436
   * Description: Verify that the modification type section in the attributes panel can be expanded and collapsed
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Press Create Monomer button
   *      4. Set type in Create Monomer dialog to Amino Acid
   *      5. Expand the modification type section
   *      6. Take screenshot of the expanded modification type section
   *      7. Collapse the modification type section
   *      8. Take screenshot of the collapsed modification type section
   *
   * Version 3.10
   */
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C%91%92%93C.[*:2]%91.[*:1]%92.[*:3]%93 |$;;_R2;_R1;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);

  await LeftToolbar(page).createMonomer();

  const createMonomerDialog = CreateMonomerDialog(page);
  await createMonomerDialog.selectType(MonomerType.AminoAcid);
  await createMonomerDialog.expandModificationSection();
  await takeElementScreenshot(
    page,
    createMonomerDialog.modificationSection.locator('..'),
  );
  await createMonomerDialog.collapseModificationSection();
  await takeElementScreenshot(
    page,
    createMonomerDialog.modificationSection.locator('..'),
  );
  await createMonomerDialog.discard();
});

test(`9. Check that if a monomer with a new modification type is saved, that new modification type should appear as an option for future monomers`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8436
   * Description: Check that if a monomer with a new modification type is saved, that new modification type should appear as an option for future monomers
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Press Create Monomer button
   *      4. Create amino acid monomer with custom modification type
   *      5. Switch to Macromolecules mode
   *      6. Clear the canvas
   *      7. Add the natural analogue of the created monomer from the library to the canvas
   *      8. Open context menu on the created monomer
   *      9. Verify that the custom modification type is present in the Modify Amino Acids submenu
   *      10. Click on the custom modification type
   *      11. Verify that the monomer got converted to one custom modification type is created to
   *
   * Version 3.10
   */
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C%91%92%93C.[*:2]%91.[*:1]%92.[*:3]%93 |$;;_R2;_R1;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);

  await createMonomer(page, {
    type: MonomerType.AminoAcid,
    symbol: Peptide.Peptide.alias,
    name: 'Peptide Test monomer',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
    modificationTypes: [
      {
        dropdown: ModificationTypeDropdown.First,
        customModification: 'Custom Modification',
      },
    ],
  });
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
  await CommonTopLeftToolbar(page).clearCanvas();
  await Library(page).clickMonomerAutochain(Peptide.A);
  const monomerOnCanvas = getMonomerLocator(page, Peptide.A);
  await ContextMenu(page, monomerOnCanvas).hover(
    MonomerOption.ModifyAminoAcids,
  );
  const customModification = page.getByTestId(
    ModifyAminoAcidsOption.CustomModification,
  );
  await expect(customModification).toBeVisible();
  await customModification.click();

  await expect(getMonomerLocator(page, Peptide.Peptide)).toBeVisible();
});

test(`10. Check that the user can set a HELM alias for amino acids by clicking on + Add HELM alias in the attributes window. The user can enter a string for the HELM alias`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8436
   * Description: Check that the user can set a HELM alias for amino acids by clicking on + Add HELM alias in the attributes window. The user can enter a string for the HELM alias
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Press Create Monomer button
   *      4. Set mandatory fields in Create Monomer dialog for amino acid monomer
   *      5. Set HELM alias by clicking on + Add HELM alias and add custom HELM alias to the input field
   *      6. Press Submit button
   *      7. Switch to Macromolecules mode
   *      8. Verify that the created monomer is present on the canvas
   *      9. Hover the monomer and open the tooltip
   *     10. Verify that the HELM alias is displayed in the tooltip
   *
   * Version 3.10
   */
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C%91%92%93C.[*:2]%91.[*:1]%92.[*:3]%93 |$;;_R2;_R1;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);

  await createMonomer(page, {
    type: MonomerType.AminoAcid,
    symbol: Peptide.Peptide3.alias,
    name: 'Peptide3 Test monomer',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
    HELMAlias: 'CustomHELMAliasPeptide',
  });

  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
  const monomerOnCanvas = getMonomerLocator(page, Peptide.Peptide3);
  await expect(monomerOnCanvas).toBeVisible();

  // shifting canvas to make tooltip appear fully
  await shiftCanvas(page, -150, 50);

  await monomerOnCanvas.hover();
  await MonomerPreviewTooltip(page).waitForBecomeVisible();
  expect(await MonomerPreviewTooltip(page).getHELMAlias()).toEqual(
    'CustomHELMAliasPeptide',
  );
});

test(`11. Check that the user can set a HELM alias for sugars by clicking on + Add HELM alias in the attributes window. The user can enter a string for the HELM alias`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8436
   * Description: Check that the user can set a HELM alias for sugars by clicking on + Add HELM alias in the attributes window. The user can enter a string for the HELM alias
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Press Create Monomer button
   *      4. Set mandatory fields in Create Monomer dialog for sugar monomer
   *      5. Set HELM alias by clicking on + Add HELM alias and add custom HELM alias to the input field
   *      6. Press Submit button
   *      7. Switch to Macromolecules mode
   *      8. Verify that the created monomer is present on the canvas
   *      9. Hover the monomer and open the tooltip
   *     10. Verify that the HELM alias is displayed in the tooltip
   *
   * Version 3.10
   */
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C%91%92%93C.[*:2]%91.[*:1]%92.[*:3]%93 |$;;_R2;_R1;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);

  await createMonomer(page, {
    type: MonomerType.Sugar,
    symbol: Sugar.Sugar.alias,
    name: 'Sugar Test monomer',
    HELMAlias: 'CustomHELMAliasSugar',
  });

  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
  const monomerOnCanvas = getMonomerLocator(page, Sugar.Sugar);
  await expect(monomerOnCanvas).toBeVisible();

  // shifting canvas to make tooltip appear fully
  await shiftCanvas(page, -150, 50);

  await monomerOnCanvas.hover();
  await MonomerPreviewTooltip(page).waitForBecomeVisible();
  expect(await MonomerPreviewTooltip(page).getHELMAlias()).toEqual(
    'CustomHELMAliasSugar',
  );
});

test(`12. Check that the user can set a HELM alias for bases by clicking on + Add HELM alias in the attributes window. The user can enter a string for the HELM alias`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8436
   * Description: Check that the user can set a HELM alias for bases by clicking on + Add HELM alias in the attributes window. The user can enter a string for the HELM alias
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Press Create Monomer button
   *      4. Set mandatory fields in Create Monomer dialog for base monomer
   *      5. Set HELM alias by clicking on + Add HELM alias and add custom HELM alias to the input field
   *      6. Press Submit button
   *      7. Switch to Macromolecules mode
   *      8. Verify that the created monomer is present on the canvas
   *      9. Hover the monomer and open the tooltip
   *     10. Verify that the HELM alias is displayed in the tooltip
   *
   * Version 3.10
   */
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C%91%92%93C.[*:2]%91.[*:1]%92.[*:3]%93 |$;;_R2;_R1;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);

  await createMonomer(page, {
    type: MonomerType.Base,
    symbol: Base.Base.alias,
    name: 'Base Test monomer',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
    HELMAlias: 'CustomHELMAliasBase',
  });

  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
  const monomerOnCanvas = getMonomerLocator(page, Base.Base);
  await expect(monomerOnCanvas).toBeVisible();

  // shifting canvas to make tooltip appear fully
  await shiftCanvas(page, -150, 50);

  await monomerOnCanvas.hover();
  await MonomerPreviewTooltip(page).waitForBecomeVisible();
  expect(await MonomerPreviewTooltip(page).getHELMAlias()).toEqual(
    'CustomHELMAliasBase',
  );
});

test(`13. Check that the user can set a HELM alias for  phosphates by clicking on + Add HELM alias in the attributes window. The user can enter a string for the HELM alias`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8436
   * Description: Check that the user can set a HELM alias for  phosphates by clicking on + Add HELM alias in the attributes window. The user can enter a string for the HELM alias
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Press Create Monomer button
   *      4. Set mandatory fields in Create Monomer dialog for phosphate monomer
   *      5. Set HELM alias by clicking on + Add HELM alias and add custom HELM alias to the input field
   *      6. Press Submit button
   *      7. Switch to Macromolecules mode
   *      8. Verify that the created monomer is present on the canvas
   *      9. Hover the monomer and open the tooltip
   *     10. Verify that the HELM alias is displayed in the tooltip
   *
   * Version 3.10
   */
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C%91%92%93C.[*:2]%91.[*:1]%92.[*:3]%93 |$;;_R2;_R1;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);

  await createMonomer(page, {
    type: MonomerType.Phosphate,
    symbol: Phosphate.Phosphate.alias,
    name: 'Phosphate Test monomer',
    HELMAlias: 'CustomHELMAliasPhosphate',
  });

  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
  const monomerOnCanvas = getMonomerLocator(page, Phosphate.Phosphate);
  await expect(monomerOnCanvas).toBeVisible();

  // shifting canvas to make tooltip appear fully
  await shiftCanvas(page, -150, 50);

  await monomerOnCanvas.hover();
  await MonomerPreviewTooltip(page).waitForBecomeVisible();
  expect(await MonomerPreviewTooltip(page).getHELMAlias()).toEqual(
    'CustomHELMAliasPhosphate',
  );
});

test(`14. Check that the option + Add HELM alias appears only after monomer type Amino acid, Base, Sugar, or Phosphate is chosen`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8436
   * Description: Check that the option + Add HELM alias appears only after monomer type Amino acid, Base, Sugar, or Phosphate is chosen
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Press Create Monomer button
   *      4. Set all possible type in Create Monomer dialog one by one
   *      5. Verify that the option + Add HELM alias appears only after monomer type Amino acid, Base, Sugar, or Phosphate is chosen
   *
   * Version 3.10
   */
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C%91%92%93C.[*:2]%91.[*:1]%92.[*:3]%93 |$;;_R2;_R1;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);

  const createMonomerDialog = CreateMonomerDialog(page);
  await LeftToolbar(page).createMonomer();
  await createMonomerDialog.selectType(MonomerType.AminoAcid);
  await expect(createMonomerDialog.aliasesSection).toBeVisible();
  await createMonomerDialog.selectType(MonomerType.Sugar);
  await expect(createMonomerDialog.aliasesSection).toBeVisible();
  await createMonomerDialog.selectType(MonomerType.Base);
  await expect(createMonomerDialog.aliasesSection).toBeVisible();
  await createMonomerDialog.selectType(MonomerType.Phosphate);
  await expect(createMonomerDialog.aliasesSection).toBeVisible();
  await createMonomerDialog.selectType(MonomerType.NucleotideMonomer);
  await expect(createMonomerDialog.aliasesSection).not.toBeVisible();
  await createMonomerDialog.selectType(MonomerType.CHEM);
  await expect(createMonomerDialog.aliasesSection).not.toBeVisible();
  await createMonomerDialog.discard();
});

test(`15. Check that the HELM symbol must be a string of uppercase and lowercase letters, numbers, hyphens (-), underscores (_), and asterisks (*) (spaces prohibited)`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8436
   * Description: Check that the HELM symbol must be a string of uppercase and lowercase letters, numbers, hyphens (-), underscores (_), and asterisks (*) (spaces prohibited)
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Press Create Monomer button
   *      4. Set mandatory fields in Create Monomer dialog for phosphate monomer
   *      5. Set HELM alias by clicking on + Add HELM alias and add custom HELM alias to the input field
   *      6. Press Submit button
   *      7. Switch to Macromolecules mode
   *      8. Verify that the created monomer is present on the canvas
   *      9. Hover the monomer and open the tooltip
   *     10. Verify that the HELM alias is displayed in the tooltip
   *
   * Version 3.10
   */
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C%91%92%93C.[*:2]%91.[*:1]%92.[*:3]%93 |$;;_R2;_R1;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);

  await createMonomer(page, {
    type: MonomerType.Phosphate,
    symbol: Phosphate.Phosphate2.alias,
    name: 'Phosphate Test monomer',
    HELMAlias: 'ABCdef-123_*',
  });

  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
  const monomerOnCanvas = getMonomerLocator(page, Phosphate.Phosphate2);
  await expect(monomerOnCanvas).toBeVisible();

  // shifting canvas to make tooltip appear fully
  await shiftCanvas(page, -150, 50);

  await monomerOnCanvas.hover();
  await MonomerPreviewTooltip(page).waitForBecomeVisible();
  expect(await MonomerPreviewTooltip(page).getHELMAlias()).toEqual(
    'ABCdef-123_*',
  );
});

test(`16. Check add prohibited HELM symbols`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8436
   * Description: Check add prohibited HELM symbols
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Press Create Monomer button
   *      4. Set type in Create Monomer dialog to Amino Acid
   *      5. Set HELM symbols with prohibited characters (e.g. space, @, $, etc.)
   *      6. Fill all other mandatory fields
   *      7. Press Submit button
   *      8. Verify error message "The HELM alias must consist only of uppercase and lowercase
   *         letters, numbers, hyphens (-), underscores (_), and asterisks (*)." is displayed
   *         near the modification type dropdowns
   *
   * Version 3.10
   */
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C%91%92%93C.[*:2]%91.[*:1]%92.[*:3]%93 |$;;_R2;_R1;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);

  await createMonomer(page, {
    type: MonomerType.AminoAcid,
    symbol: Peptide.Peptide.alias,
    name: 'Peptide Test monomer',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
    HELMAlias: '$#@',
  });
  expect(
    await NotificationMessageBanner(
      page,
      ErrorMessage.invalidHELMAlias,
    ).getNotificationMessage(),
  ).toEqual(
    'The HELM alias must consist only of uppercase and lowercase letters, numbers, hyphens (-), underscores (_), and asterisks (*).',
  );

  await takeElementScreenshot(
    page,
    CreateMonomerDialog(page).aliasesSection.helmAliasEditbox.locator(
      '../../..',
    ),
  );
  await CreateMonomerDialog(page).discard();
});

test(`17. Check that the HELM alias string must be unique for one HELM class (peptides, RNA, CHEM), both as the symbol and as the HELM Alias`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8436
   * Description: Check that the HELM alias string must be unique for one HELM class (peptides, RNA, CHEM), both as the symbol and as the HELM Alias
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Press Create Monomer button
   *      4. Set type in Create Monomer dialog to Amino Acid
   *      5. Set HELM symbols that already exist as symbols or HELM aliases for the same HELM class
   *      6. Fill all other mandatory fields
   *      7. Press Submit button
   *      8. Verify error message "The HELM alias must be unique amongst peptide or RNA monomers." is displayed
   *
   * Version 3.10
   */
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C%91%92%93C.[*:2]%91.[*:1]%92.[*:3]%93 |$;;_R2;_R1;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);

  await createMonomer(page, {
    type: MonomerType.AminoAcid,
    symbol: Peptide.Peptide.alias,
    name: 'Peptide Test monomer',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
    HELMAlias: '1Nal',
  });
  expect(
    await NotificationMessageBanner(
      page,
      ErrorMessage.notUniqueHELMAlias,
    ).getNotificationMessage(),
  ).toEqual('The HELM alias must be unique amongst peptide or RNA monomers.');

  await takeElementScreenshot(
    page,
    CreateMonomerDialog(page).aliasesSection.helmAliasEditbox.locator(
      '../../..',
    ),
  );
  await CreateMonomerDialog(page).discard();
});

test(`18. Check when the HELM alias string NOT unique for one HELM class (peptides, RNA, CHEM), both as the symbol and as the HELM Alias`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8436
   * Description: Check when the HELM alias string NOT unique for one HELM class (peptides, RNA, CHEM), both as the symbol and as the HELM Alias
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Press Create Monomer button
   *      4. Set type in Create Monomer dialog to Base
   *      5. Set HELM symbols that already exist as symbols for different HELM class
   *      6. Fill all other mandatory fields
   *      7. Press Submit button
   *      8. Switch to Macromolecules mode
   *      9. Verify that the created monomer is present on the canvas
   *
   * Version 3.10
   */
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C%91%92%93C.[*:2]%91.[*:1]%92.[*:3]%93 |$;;_R2;_R1;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);

  await createMonomer(page, {
    type: MonomerType.Base,
    symbol: Base.Base.alias,
    name: 'Base Test monomer',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
    HELMAlias: '1Nal',
  });

  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
  const monomerOnCanvas = getMonomerLocator(page, Base.Base);
  await expect(monomerOnCanvas).toBeVisible();

  // shifting canvas to make tooltip appear fully
  await shiftCanvas(page, -150, 50);

  await monomerOnCanvas.hover();
  await MonomerPreviewTooltip(page).waitForBecomeVisible();
  expect(await MonomerPreviewTooltip(page).getHELMAlias()).toEqual('1Nal');
});

test(`19. Check if an issue with the HELM alias exists the HELM alias field is highlighted red until the issue is fixed and the user clicks on Submit again`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8436
   * Description: Check if an issue with the HELM alias exists the HELM alias field is highlighted red until the issue is fixed and the user clicks on Submit again
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Press Create Monomer button
   *      4. Set type in Create Monomer dialog to Amino Acid
   *      5. Set HELM symbols that already exist as symbols or HELM aliases for the same HELM class
   *      6. Fill all other mandatory fields
   *      7. Press Submit button
   *      8. Verify error message "The HELM alias must be unique amongst peptide or RNA monomers." is displayed
   *      9. Change the monomer type to Nucleotide
   *     10. Verify that the HELM alias field is hidden
   *     11. Set all mandatory fields for Nucleotide monomer
   *     12. Press Submit button
   *     13. Switch to Macromolecules mode
   *     14. Verify that the created monomer is present on the canvas
   *     15. Hover the monomer and open the tooltip
   *     16. Verify that no HELM alias is displayed in the tooltip
   *
   * Version 3.10
   */
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C%91%92%93C.[*:2]%91.[*:1]%92.[*:3]%93 |$;;_R2;_R1;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);

  await createMonomer(page, {
    type: MonomerType.AminoAcid,
    symbol: Nucleotide.Nucleotide.alias,
    name: 'Nucleotide Test monomer',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
    HELMAlias: '1Nal',
  });
  expect(
    await NotificationMessageBanner(
      page,
      ErrorMessage.notUniqueHELMAlias,
    ).getNotificationMessage(),
  ).toEqual('The HELM alias must be unique amongst peptide or RNA monomers.');

  const createMonomerDialog = CreateMonomerDialog(page);
  await createMonomerDialog.selectType(MonomerType.NucleotideMonomer);
  await expect(createMonomerDialog.aliasesSection).not.toBeVisible();
  await createMonomerDialog.selectNaturalAnalogue(NucleotideNaturalAnalogue.A);
  await createMonomerDialog.submit({ ignoreWarning: true });

  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
  const monomerOnCanvas = getMonomerLocator(page, Nucleotide.Nucleotide);
  await expect(monomerOnCanvas).toBeVisible();

  // shifting canvas to make tooltip appear fully
  await shiftCanvas(page, -150, 50);

  await monomerOnCanvas.hover();
  await MonomerPreviewTooltip(page).waitForBecomeVisible();
  expect(await MonomerPreviewTooltip(page).getHELMAlias()).toEqual(null);
});

test(`20. Check that the user can remove a HELM alias after it is set`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8436
   * Description: Check that the user can remove a HELM alias after it is set
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Press Create Monomer button
   *      4. Set type in Create Monomer dialog to Amino Acid
   *      5. Set HELM symbols that already exist as symbols or HELM aliases for the same HELM class
   *      6. Fill all other mandatory fields
   *      7. Press Submit button
   *      8. Verify error message "The HELM alias must be unique amongst peptide or RNA monomers." is displayed
   *      9. Remove the HELM alias
   *     10. Set all other mandatory fields for Nucleotide monomer
   *
   * Version 3.10
   */
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C%91%92%93C.[*:2]%91.[*:1]%92.[*:3]%93 |$;;_R2;_R1;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);

  await createMonomer(page, {
    type: MonomerType.AminoAcid,
    symbol: Peptide.Peptide.alias,
    name: 'Peptide Test monomer',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
    HELMAlias: '1Nal',
  });
  expect(
    await NotificationMessageBanner(
      page,
      ErrorMessage.notUniqueHELMAlias,
    ).getNotificationMessage(),
  ).toEqual('The HELM alias must be unique amongst peptide or RNA monomers.');

  const createMonomerDialog = CreateMonomerDialog(page);
  await createMonomerDialog.clearHELMAlias();
  await createMonomerDialog.submit({ ignoreWarning: true });

  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
  const monomerOnCanvas = getMonomerLocator(page, Peptide.Peptide);
  await expect(monomerOnCanvas).toBeVisible();

  // shifting canvas to make tooltip appear fully
  await shiftCanvas(page, -150, 50);

  await monomerOnCanvas.hover();
  await MonomerPreviewTooltip(page).waitForBecomeVisible();
  expect(await MonomerPreviewTooltip(page).getHELMAlias()).toEqual(null);
});

test(`21. Check that the HELM alias section in the attributes panel can be expanded and collapsed`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8436
   * Description: Check that the HELM alias section in the attributes panel can be expanded and collapsed
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Press Create Monomer button
   *      4. Set type in Create Monomer dialog to Amino Acid
   *      5. Expand HELM alias section
   *      6. Take screenshot of the HELM alias section
   *      7. Collapse HELM alias section
   *      8. Take screenshot of the collapsed HELM alias section
   *
   * Version 3.10
   */
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C%91%92%93C.[*:2]%91.[*:1]%92.[*:3]%93 |$;;_R2;_R1;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);

  await LeftToolbar(page).createMonomer();

  const createMonomerDialog = CreateMonomerDialog(page);
  await createMonomerDialog.selectType(MonomerType.AminoAcid);
  await createMonomerDialog.expandAliasesSection();
  await takeElementScreenshot(
    page,
    createMonomerDialog.aliasesSection.locator('..'),
  );
  await createMonomerDialog.collapseAliasesSection();
  await takeElementScreenshot(
    page,
    createMonomerDialog.aliasesSection.locator('..'),
  );
  await createMonomerDialog.discard();
});

test(`22. Check that hovering over R1 for sugars give 5' on the tooltip preview`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8583
   * Description: 1. Check that hovering over R1 for sugars give 5' on the tooltip preview
   *              2. Check that hovering over R2 for sugars give 3' on the tooltip preview
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Press Create Monomer button
   *      4. Set type in Create Monomer dialog to Sugar
   *      5. Hover over R1 in the structure preview
   *      6. Take screenshot to validate that 5' is shown in the tooltip
   *      7. Hover over R2 in the structure preview
   *      8. Take screenshot to validate that 3' is shown in the tooltip
   *
   * IMPORTANT NOTE: Screenshots are incorrect due to bug: https://github.com/epam/ketcher/issues/8584
   * Version 3.10
   */
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C%91%92%93C.[*:2]%91.[*:1]%92.[*:3]%93 |$;;_R2;_R1;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);

  await LeftToolbar(page).createMonomer();

  const createMonomerDialog = CreateMonomerDialog(page);
  await createMonomerDialog.selectType(MonomerType.Sugar);
  // shifting canvas to make tooltip appear fully
  await shiftCanvas(page, -150, 50);
  const attachmentPointR1 = page.getByTestId(AttachmentPoint.R1).first();
  await attachmentPointR1.hover({ force: true });
  await createMonomerDialog.waitForTerminalIndicatorTooltip({
    state: 'visible',
  });
  await takeElementScreenshot(page, attachmentPointR1, { padding: 50 });
  await moveMouseAway(page);
  await createMonomerDialog.waitForTerminalIndicatorTooltip({
    state: 'hidden',
  });
  const attachmentPointR2 = page.getByTestId(AttachmentPoint.R2).first();
  await attachmentPointR2.hover({ force: true });
  await createMonomerDialog.waitForTerminalIndicatorTooltip({
    state: 'visible',
  });
  await takeElementScreenshot(page, attachmentPointR2, { padding: 50 });
  await createMonomerDialog.discard();
});

test(`23. Check that hovering over R1 for phosphates give 5' on the tooltip preview`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8583
   * Description: 1. Check that hovering over R1 for phosphates give 5' on the tooltip preview
   *              2. Check that hovering over R2 for phosphates give 3' on the tooltip preview
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Press Create Monomer button
   *      4. Set type in Create Monomer dialog to Phosphate
   *      5. Hover over R1 in the structure preview
   *      6. Take screenshot to validate that 5' is shown in the tooltip
   *      7. Hover over R2 in the structure preview
   *      8. Take screenshot to validate that 3' is shown in the tooltip
   *
   * IMPORTANT NOTE: Screenshots are incorrect due to bug: https://github.com/epam/ketcher/issues/8584
   * Version 3.10
   */
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C%91%92%93C.[*:2]%91.[*:1]%92.[*:3]%93 |$;;_R2;_R1;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);

  await LeftToolbar(page).createMonomer();

  const createMonomerDialog = CreateMonomerDialog(page);
  await createMonomerDialog.selectType(MonomerType.Phosphate);
  // shifting canvas to make tooltip appear fully
  await shiftCanvas(page, -150, 50);
  const attachmentPointR1 = page.getByTestId(AttachmentPoint.R1).first();
  await attachmentPointR1.hover({ force: true });
  await createMonomerDialog.waitForTerminalIndicatorTooltip({
    state: 'visible',
  });
  await takeElementScreenshot(page, attachmentPointR1, { padding: 50 });
  await moveMouseAway(page);
  await createMonomerDialog.waitForTerminalIndicatorTooltip({
    state: 'hidden',
  });
  const attachmentPointR2 = page.getByTestId(AttachmentPoint.R2).first();
  await attachmentPointR2.hover({ force: true });
  await createMonomerDialog.waitForTerminalIndicatorTooltip({
    state: 'visible',
  });
  await takeElementScreenshot(page, attachmentPointR2, { padding: 50 });
  await createMonomerDialog.discard();
});

test(`23. Check that hovering over R1 for nucleotides give 5' on the tooltip preview`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8583
   * Description: 1. Check that hovering over R1 for nucleotides give 5' on the tooltip preview
   *              2. Check that hovering over R2 for nucleotides give 3' on the tooltip preview
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Press Create Monomer button
   *      4. Set type in Create Monomer dialog to Nucleotide
   *      5. Hover over R1 in the structure preview
   *      6. Take screenshot to validate that 5' is shown in the tooltip
   *      7. Hover over R2 in the structure preview
   *      8. Take screenshot to validate that 3' is shown in the tooltip
   *
   * IMPORTANT NOTE: Screenshots are incorrect due to bug: https://github.com/epam/ketcher/issues/8584
   * Version 3.10
   */
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C%91%92%93C.[*:2]%91.[*:1]%92.[*:3]%93 |$;;_R2;_R1;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);

  await LeftToolbar(page).createMonomer();

  const createMonomerDialog = CreateMonomerDialog(page);
  await createMonomerDialog.selectType(MonomerType.NucleotideMonomer);
  // shifting canvas to make tooltip appear fully
  await shiftCanvas(page, -150, 50);
  const attachmentPointR1 = page.getByTestId(AttachmentPoint.R1).first();
  await attachmentPointR1.hover({ force: true });
  await createMonomerDialog.waitForTerminalIndicatorTooltip({
    state: 'visible',
  });
  await takeElementScreenshot(page, attachmentPointR1, { padding: 50 });
  await moveMouseAway(page);
  await createMonomerDialog.waitForTerminalIndicatorTooltip({
    state: 'hidden',
  });
  const attachmentPointR2 = page.getByTestId(AttachmentPoint.R2).first();
  await attachmentPointR2.hover({ force: true });
  await createMonomerDialog.waitForTerminalIndicatorTooltip({
    state: 'visible',
  });
  await takeElementScreenshot(page, attachmentPointR2, { padding: 50 });
  await createMonomerDialog.discard();
});

test(`24. Verify that options/toolbar icons are now enabled for atoms in create monomer wizard: in the right-click menu, only options Edit and Delete are enabled`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that options/toolbar icons are now enabled for atoms in create monomer wizard: in the right-click menu, only options Edit and Delete are enabled
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. r-click on a terminal atom on canvas
   *      6. Verify that context menu option Edit and Delete are enabled
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'BrCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(page, 500, 250);

  const targetAtom = getAtomLocator(page, { atomLabel: 'Br' }).first();

  await ContextMenu(page, targetAtom).open();

  await expect(page.getByTestId(MicroAtomOption.Edit)).toBeEnabled();
  await expect(page.getByTestId(MicroAtomOption.Delete)).toBeEnabled();

  await clickOnCanvas(page, 0, 0);
  await CreateMonomerDialog(page).discard();
});

test(`25. Verify that right-click menu Delete option works correct for atoms in Create Monomer Wizard`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that right-click menu Delete option works correct for atoms in Create Monomer Wizard
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. r-click on a terminal atom on canvas and click Delete
   *      6. Verify that atom got deleted
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'BrCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(page, 500, 250);

  const targetAtom = getAtomLocator(page, { atomLabel: 'Br' }).first();

  await ContextMenu(page, targetAtom).click(MicroAtomOption.Delete);

  await expect(targetAtom).not.toBeVisible();

  await clickOnCanvas(page, 0, 0);
  await CreateMonomerDialog(page).discard();
});

test(`26. Verify that in create monomer wizard: In the right-click menu, Edit option, users can edit only single atom properties`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that in create monomer wizard: In the right-click menu, Edit option, users can edit only single atom properties
   *              (query specific, reaction flags, custom queries, and non-single atom properties are still disabled)
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. r-click on a terminal atom on canvas and click Edit
   *      6. Verify that Atom properties dialog opens and only single atom properties are editable
   *      7. Verify that query specific, reaction flags, custom queries, and non-single atom properties are disabled
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'BrCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(page, 500, 250);

  const targetAtom = getAtomLocator(page, { atomLabel: 'Br' }).first();

  await ContextMenu(page, targetAtom).click(MicroAtomOption.Edit);

  await expect(AtomPropertiesDialog(page).window).toBeVisible();

  const generalSection =
    AtomPropertiesDialog(page).generalSection.getByRole('button');
  await expect(generalSection).toBeEnabled();

  const querySpecificSection =
    AtomPropertiesDialog(page).querySpecificSection.getByRole('button');
  await expect(querySpecificSection).toBeDisabled();

  const reactionFlagsSection =
    AtomPropertiesDialog(page).reactionFlagsSection.getByRole('button');
  await expect(reactionFlagsSection).toBeDisabled();

  const customQueryCheckbox =
    AtomPropertiesDialog(page).customQueryCheckbox.locator('../../..');
  await expect(customQueryCheckbox).toHaveAttribute('aria-disabled', 'true');

  const customQueryTextArea =
    AtomPropertiesDialog(page).customQueryTextArea.locator('../..');
  await expect(customQueryTextArea).toHaveAttribute('aria-disabled', 'true');

  await AtomPropertiesDialog(page).cancel();
  await CreateMonomerDialog(page).discard();
});

test(`27. Verify that in create monomer wizard: for bonds in the right-click menu, options Edit, Different bond types, Change direction, and Delete are enabled`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that in create monomer wizard: for bonds in the right-click menu, options Edit, Different
   *              bond types, Change direction, and Delete are enabled
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. r-click on one of the bonds on canvas
   *      6. Verify that Edit, Different bond types, Change direction, and Delete are enabled
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'BrCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(page, 500, 250);

  const targetBond = getBondLocator(page, {}).first();

  await ContextMenu(page, targetBond).open();

  await Promise.all([
    expect(page.getByTestId(MicroBondOption.Edit)).toBeEnabled(),
    expect(page.getByTestId(MicroBondOption.Single)).toBeEnabled(),
    expect(page.getByTestId(MicroBondOption.SingleUp)).toBeEnabled(),
    expect(page.getByTestId(MicroBondOption.SingleDown)).toBeEnabled(),
    expect(page.getByTestId(MicroBondOption.SingleUpDown)).toBeEnabled(),
    expect(page.getByTestId(MicroBondOption.Double)).toBeEnabled(),
    expect(page.getByTestId(MicroBondOption.DoubleCisTrans)).toBeEnabled(),
    expect(page.getByTestId(MicroBondOption.Triple)).toBeEnabled(),
    expect(page.getByTestId(MicroBondOption.Hydrogen)).toBeEnabled(),
    expect(page.getByTestId(MicroBondOption.Dative)).toBeEnabled(),
    expect(page.getByTestId(MicroBondOption.Delete)).toBeEnabled(),
  ]);

  await clickOnCanvas(page, 0, 0);
  await CreateMonomerDialog(page).discard();
});

test(`28. Verify that in create monomer wizard: in the right-click menu, Edit option, users can edit only the Type`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that in create monomer wizard: in the right-click menu, Edit option, users can edit only the Type
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. r-click on a terminal atom on canvas and click Edit
   *      6. Verify users can edit only the Type
   *      7. Verify that other controls are disabled
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'BrCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(page, 500, 250);

  const targetBond = getBondLocator(page, {}).first();

  await ContextMenu(page, targetBond).click(MicroBondOption.Edit);

  await expect(BondPropertiesDialog(page).window).toBeVisible();

  const bondTypeDropdown = BondPropertiesDialog(page).bondTypeDropdown;
  await expect(bondTypeDropdown).toBeEnabled();

  const bondTopologyDropdown = BondPropertiesDialog(page).bondTopologyDropdown;
  await expect(bondTopologyDropdown).toBeDisabled();

  const bondReactingCenterDropdown =
    BondPropertiesDialog(page).bondReactingCenterDropdown;
  await expect(bondReactingCenterDropdown).toBeDisabled();

  const bondCustomQueryCheckbox =
    BondPropertiesDialog(page).bondCustomQueryCheckbox.locator('../../..');
  await expect(bondCustomQueryCheckbox).toHaveAttribute(
    'aria-disabled',
    'true',
  );

  const bondCustomQueryText =
    BondPropertiesDialog(page).bondCustomQueryText.locator('../..');
  await expect(bondCustomQueryText).toHaveAttribute('aria-disabled', 'true');

  await BondPropertiesDialog(page).cancel();
  await CreateMonomerDialog(page).discard();
});

test(`29. Verify that in create monomer wizard: on the right toolbar, Elements and the Periodic table are enabled`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that in create monomer wizard: on the right toolbar, Elements and the Periodic table are enabled
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Verify on the right toolbar, Elements and the Periodic table are enabled
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'BrCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  await Promise.all([
    expect(RightToolbar(page).hydrogenButton).toBeEnabled(),
    expect(RightToolbar(page).carbonButton).toBeEnabled(),
    expect(RightToolbar(page).nitrogenButton).toBeEnabled(),
    expect(RightToolbar(page).oxygenButton).toBeEnabled(),
    expect(RightToolbar(page).sulfurButton).toBeEnabled(),
    expect(RightToolbar(page).phosphorusButton).toBeEnabled(),
    expect(RightToolbar(page).fluorineButton).toBeEnabled(),
    expect(RightToolbar(page).chlorineButton).toBeEnabled(),
    expect(RightToolbar(page).bromineButton).toBeEnabled(),
    expect(RightToolbar(page).iodineButton).toBeEnabled(),
    expect(RightToolbar(page).periodicTableButton).toBeEnabled(),

    expect(RightToolbar(page).anyAtomButton).toBeDisabled(),
    expect(RightToolbar(page).extendedTableButton).toBeDisabled(),
  ]);

  await CreateMonomerDialog(page).discard();
});

test(`30. Verify that in create monomer wizard: in the periodic table, only Single atoms are allowed (List and Not list options are disabled)`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that in create monomer wizard: in the periodic table, only Single atoms are allowed (List and Not list options are disabled)
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Open Periodic table
   *      6. Verify that only Single atoms are allowed (List and Not list options are disabled)
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'BrCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  await RightToolbar(page).periodicTable();

  await Promise.all([
    expect(PeriodicTableDialog(page).singleRadioButton).toBeChecked(),
    expect(PeriodicTableDialog(page).listRadioButton).toBeDisabled(),
    expect(PeriodicTableDialog(page).notListRadioButton).toBeDisabled(),
  ]);

  await PeriodicTableDialog(page).cancel();
  await CreateMonomerDialog(page).discard();
});

test(`31. Verify that in create monomer wizard: it is possible to change atom using Periodic table`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that in create monomer wizard: it is possible to change atom using Periodic table
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Open Periodic table and select atom (e.g., Nh)
   *      6. Click on Br atom on canvas
   *      7. Verify that Br atom got changed to Nh
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'BrCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(page, 500, 250);

  const targetAtom = getAtomLocator(page, { atomLabel: 'Br' }).first();

  await RightToolbar(page).periodicTable();
  await PeriodicTableDialog(page).addElements([PeriodicTableElement.Nh]);

  await targetAtom.click({ force: true });

  await expect(getAtomLocator(page, { atomLabel: 'Nh' }).first()).toBeVisible();

  await CreateMonomerDialog(page).discard();
});

test(`32. Verify that in create monomer wizard: it is possible to change atom using Elements from toolbar`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that in create monomer wizard: it is possible to change atom using Elements from toolbar
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Select atom from toolbar (e.g., N)
   *      6. Click on Br atom on canvas
   *      7. Verify that Br atom got changed to Nh
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'BrCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(page, 500, 250);

  const targetAtom = getAtomLocator(page, { atomLabel: 'Br' }).first();

  await RightToolbar(page).clickAtom(Atom.Nitrogen);

  await targetAtom.click({ force: true });

  await expect(getAtomLocator(page, { atomLabel: 'N' }).first()).toBeVisible();

  await CreateMonomerDialog(page).discard();
});

test(`33. Verify that in create monomer wizard: on the bottom toolbar, everything is now enabled`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that in create monomer wizard: on the bottom toolbar, everything is now enabled
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Verify that in create monomer wizard: on the bottom toolbar, everything is now enabled
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'BrCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  await Promise.all([
    expect(BottomToolbar(page).benzeneButton).toBeEnabled(),
    expect(BottomToolbar(page).cyclopentadieneButton).toBeEnabled(),
    expect(BottomToolbar(page).cyclohexaneButton).toBeEnabled(),
    expect(BottomToolbar(page).cyclopentaneButton).toBeEnabled(),
    expect(BottomToolbar(page).cyclopropaneButton).toBeEnabled(),
    expect(BottomToolbar(page).cyclobutaneButton).toBeEnabled(),
    expect(BottomToolbar(page).cycloheptaneButton).toBeEnabled(),
    expect(BottomToolbar(page).cyclooctaneButton).toBeEnabled(),
    expect(BottomToolbar(page).structureLibraryButton).toBeEnabled(),
  ]);

  await CreateMonomerDialog(page).discard();
});

test(`34. Verify that in create monomer wizard: it is possible to put molecules on the canvas from bottom toolbar`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that in create monomer wizard: it is possible to put molecules on the canvas from bottom toolbar
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Click on Benzene from the bottom toolbar and put them on the canvas
   *      5. Take screenshot to validate its appearance
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'CNC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(page, 600, 250);

  const targetAtom = getAtomLocator(page, { atomLabel: 'N' }).first();
  await BottomToolbar(page).benzene();

  await targetAtom.click({ force: true });

  await takeElementScreenshot(
    page,
    getAtomLocator(page, { atomLabel: 'C', atomValence: 5 }),
    { padding: 75 },
  );

  await CreateMonomerDialog(page).discard();
});

test(`35. Verify that in create monomer wizard: in the Structure library, the Functional Groups section and the option Save to SDF are disabled`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that in create monomer wizard: in the Structure library, the Functional Groups section and the option Save to SDF are disabled
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Open Structure library
   *      6. Verify that the Functional Groups section and the option Save to SDF are disabled
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'CNC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  await BottomToolbar(page).structureLibrary();

  await expect(StructureLibraryDialog(page).functionalGroupTab).toBeDisabled();
  await expect(StructureLibraryDialog(page).saveToSdfButton).toBeDisabled();

  await StructureLibraryDialog(page).closeWindow();
  await CreateMonomerDialog(page).discard();
});

test(`36. Verify that in create monomer wizard: on the left toolbar, Erase, Bond tool, Chain, Charge plus, and Charge minus are now enabled`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that in create monomer wizard: on the left toolbar, Erase, Bond tool, Chain, Charge plus, and Charge minus are now enabled
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Verify that on the left toolbar, Erase, Bond tool, Chain, Charge plus, and Charge minus are now enabled
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'BrCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  await Promise.all([
    expect(CommonLeftToolbar(page).eraseButton).toBeEnabled(),
    expect(CommonLeftToolbar(page).bondSelectionDropdownButton).toBeEnabled(),
    expect(LeftToolbar(page).chainButton).toBeEnabled(),
    expect(LeftToolbar(page).chargePlusButton).toBeEnabled(),
    expect(LeftToolbar(page).chargeMinusButton).toBeEnabled(),
  ]);

  await CreateMonomerDialog(page).discard();
});

test(`37. Verify that in create monomer wizard: user can delete atoms and bonds with Erase button`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that in create monomer wizard: user can delete atoms and bonds with Erase button
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Press Erase button and delete atom and bond
   *      5. Verify that atom and bond got deleted
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'BrCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  const targetAtom = getAtomLocator(page, { atomLabel: 'Br' }).first();
  const targetBond = getBondLocator(page, {});
  await CommonLeftToolbar(page).erase();

  await targetBond.first().click({ force: true });
  await targetAtom.click({ force: true });

  await expect(targetAtom).not.toBeVisible();
  expect(await targetBond.count()).toBe(1);

  await CreateMonomerDialog(page).discard();
});

test(`38. Verify that in create monomer wizard: user can add bonds to molecule and modify bonds using Bond tool`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that in create monomer wizard: user can add bonds to molecule and modify bonds using Bond tool
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Press Single Bond from Bond tool and click on existing bond to change its type
   *      6. Verify that bond type got changed
   *      7. Press Single Bond from Bond tool and click on existing atom to add a bond
   *      8. Take screenshot to validate its appearance
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'BrCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(page, 500, 250);

  const targetAtom = getAtomLocator(page, { atomLabel: 'Br' }).first();
  const targetSingleBond = getBondLocator(page, {
    bondType: MicroBondDataIds.Single,
  });
  const targetDoubleBond = getBondLocator(page, {
    bondType: MicroBondDataIds.Double,
  });
  await CommonLeftToolbar(page).bondTool(MicroBondType.Single);

  await targetSingleBond.first().click({ force: true });
  await expect(targetDoubleBond.first()).toBeVisible();

  await targetAtom.click({ force: true });

  await takeElementScreenshot(page, targetAtom, { padding: 80 });

  await CreateMonomerDialog(page).discard();
});

test(`39. Verify that in create monomer wizard: user can add bonds using Chain tool`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that in create monomer wizard: user can add bonds using Chain tool
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Press Chain button
   *      6. Draw two bonds starting from existing atom
   *      7. Take screenshot to validate its appearance
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'BrCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(page, 500, 250);

  const targetAtom = getAtomLocator(page, { atomLabel: 'Br' }).first();
  await LeftToolbar(page).chain();

  await targetAtom.hover({ force: true });
  await dragMouseTo(page, 500, 350);

  await takeElementScreenshot(page, targetAtom, { padding: 80 });

  await CreateMonomerDialog(page).discard();
});

test(`40. Verify that in create monomer wizard: user can use Charge plus and Charge minus tools to charge atoms on the canvas`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that in create monomer wizard: user can use Charge plus and Charge minus tools to charge atoms on the canvas
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Press Charge plus button and click on atom to add positive charge
   *      6. Verify that atom charge got changed
   *      7. Press Charge minus button and click on existing atom to add negative charge
   *      8. Verify that atom charge got changed
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'BrCN');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(page, 500, 250);

  const targetAtomBr = getAtomLocator(page, { atomLabel: 'Br' }).first();
  const targetAtomN = getAtomLocator(page, { atomLabel: 'N' }).first();
  await LeftToolbar(page).chargePlus();

  await targetAtomBr.click({ force: true });
  await expect(targetAtomBr).toHaveAttribute('data-atomCharge', '1');

  await LeftToolbar(page).chargeMinus();

  await targetAtomN.click({ force: true });
  await expect(targetAtomN).toHaveAttribute('data-atomCharge', '-1');

  await CreateMonomerDialog(page).discard();
});

test(`41. Verify that in create monomer wizard: user can use Copy, Paste, Cut buttons and they works correct`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that in create monomer wizard: user can use Copy, Paste, Cut buttons and they works correct
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Select all structure and press Cut button
   *      6. Verify that molecule got removed from canvas
   *      7. Press Paste button and verify that Error message dialog appears
   *      8. Close Error message dialog and paste molecule using keyboard shortcut
   *      9. Verify that molecule got pasted on canvas
   *      10. Select all structure and press Copy button
   *      11. Select all structure and erase it from canvas
   *      12. Verify that molecule got removed from canvas
   *      13. Paste molecule using keyboard shortcut
   *      14. Verify that molecule got pasted on canvas
   *      15. Discard created monomer
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'BrCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(page, 500, 250);

  const targetAtom = getAtomLocator(page, { atomLabel: 'Br' }).first();
  const targetBond = getBondLocator(page, {}).first();

  await selectAllStructuresOnCanvas(page);
  await MoleculesTopToolbar(page).cut();

  await expect(targetAtom).not.toBeVisible();
  await expect(targetBond).not.toBeVisible();

  await MoleculesTopToolbar(page).paste();
  await expect(ErrorMessageDialog(page).window).toBeVisible();
  await ErrorMessageDialog(page).close();

  await pasteFromClipboardByKeyboard(page);
  await clickOnCanvas(page, 0, 0, { from: 'canvasCenter' });

  await expect(targetAtom).toBeVisible();
  await expect(targetBond).toBeVisible();

  await selectAllStructuresOnCanvas(page);
  await MoleculesTopToolbar(page).copy();
  await selectAllStructuresOnCanvas(page);
  await CommonLeftToolbar(page).erase();

  await expect(targetAtom).not.toBeVisible();
  await expect(targetBond).not.toBeVisible();

  await pasteFromClipboardByKeyboard(page);
  await clickOnCanvas(page, 0, 0, { from: 'canvasCenter' });

  await expect(targetAtom).toBeVisible();
  await expect(targetBond).toBeVisible();

  await CreateMonomerDialog(page).discard();
});
