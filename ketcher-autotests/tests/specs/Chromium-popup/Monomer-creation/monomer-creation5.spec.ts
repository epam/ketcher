/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Page, expect } from '@playwright/test';
import { test } from '@fixtures';
import { pasteFromClipboardAndOpenAsNewProject } from '@utils/files/readFile';
import {
  selectAllStructuresOnCanvas,
  takeElementScreenshot,
} from '@utils/canvas';
import {
  clickOnCanvas,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
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
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { MonomerPreviewTooltip } from '@tests/pages/macromolecules/canvas/MonomerPreviewTooltip';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { NotificationMessageBanner } from '@tests/pages/molecules/canvas/createMonomer/NotificationMessageBanner';
import { ErrorMessage } from '@tests/pages/constants/notificationMessageBanner/Constants';
import { Base } from '@tests/pages/constants/monomers/Bases';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import {
  ModifyAminoAcidsOption,
  MonomerOption,
} from '@tests/pages/constants/contextMenu/Constants';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { Sugar } from '@tests/pages/constants/monomers/Sugars';
import { Phosphate } from '@tests/pages/constants/monomers/Phosphates';

let page: Page;
test.beforeAll(async ({ initMoleculesCanvas }) => {
  page = await initMoleculesCanvas();
});
test.afterAll(async ({ closePage }) => {
  await closePage();
});
test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

async function shiftCanvas(page: Page, xShift: number, yShift: number) {
  await CommonLeftToolbar(page).handTool();
  const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
  await page.mouse.move(x, y);
  await dragMouseTo(x + xShift, y + yShift, page);
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Rectangle);
}

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
        type: ModificationType.Phosphorylation,
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
  expect(createMonomerDialog.modificationSection).not.toBeVisible();
  await createMonomerDialog.selectType(MonomerType.Base);
  expect(createMonomerDialog.modificationSection).not.toBeVisible();
  await createMonomerDialog.selectType(MonomerType.Phosphate);
  expect(createMonomerDialog.modificationSection).not.toBeVisible();
  await createMonomerDialog.selectType(MonomerType.Nucleotide);
  expect(createMonomerDialog.modificationSection).not.toBeVisible();
  await createMonomerDialog.selectType(MonomerType.CHEM);
  expect(createMonomerDialog.modificationSection).not.toBeVisible();
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
    symbol: Peptide.Peptide.alias,
    name: 'Peptide Test monomer',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
    HELMAlias: 'CustomHELMAliasPeptide',
  });

  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
  const monomerOnCanvas = getMonomerLocator(page, Peptide.Peptide);
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
  expect(createMonomerDialog.aliasesSection).toBeVisible();
  await createMonomerDialog.selectType(MonomerType.Sugar);
  expect(createMonomerDialog.aliasesSection).toBeVisible();
  await createMonomerDialog.selectType(MonomerType.Base);
  expect(createMonomerDialog.aliasesSection).toBeVisible();
  await createMonomerDialog.selectType(MonomerType.Phosphate);
  expect(createMonomerDialog.aliasesSection).toBeVisible();
  await createMonomerDialog.selectType(MonomerType.Nucleotide);
  expect(createMonomerDialog.aliasesSection).not.toBeVisible();
  await createMonomerDialog.selectType(MonomerType.CHEM);
  expect(createMonomerDialog.aliasesSection).not.toBeVisible();
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
    symbol: Phosphate.Phosphate.alias,
    name: 'Phosphate Test monomer',
    HELMAlias: 'ABCdef-123_*',
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
    'ABCdef-123_*',
  );
});
