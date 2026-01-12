/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { expect, Page } from '@playwright/test';
import { test } from '@fixtures';
import { pasteFromClipboardAndOpenAsNewProject } from '@utils/files/readFile';
import { MonomerType, shiftCanvas } from '@utils/index';
import { CreateMonomerDialog } from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import {
  NucleotideNaturalAnalogue,
  MonomerType as MonomerTypeInDropdown,
} from '@tests/pages/constants/createMonomerDialog/Constants';
import { NucleotidePresetSection } from '@tests/pages/molecules/canvas/createMonomer/NucleotidePresetSection';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import { Sugar } from '@tests/pages/constants/monomers/Sugars';
import { Base } from '@tests/pages/constants/monomers/Bases';
import { Phosphate } from '@tests/pages/constants/monomers/Phosphates';
import { Preset } from '@tests/pages/constants/monomers/Presets';
import { NotificationMessageBanner } from '@tests/pages/molecules/canvas/createMonomer/NotificationMessageBanner';
import { ErrorMessage } from '@tests/pages/constants/notificationMessageBanner/Constants';
import { NucleotidePresetTab } from '@tests/pages/molecules/canvas/createMonomer/constants/nucleiotidePresetSection/Constants';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { ConfirmationMessageDialog } from '@tests/pages/molecules/canvas/ConfirmationMessageDialog';

let page: Page;

test.beforeAll(async ({ initMoleculesCanvas }) => {
  page = await initMoleculesCanvas();
});

test.afterAll(async ({ closePage }) => {
  await closePage();
});

test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

test.describe('Hidden components in nucleotide preset wizard', () => {
  test('Components saved but hidden in Library', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/8857
     * Description: Create nucleotide preset with Sugar/Base/Phosphate filled
     *  and check that only preset is visible in Library, components are hidden.
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Press "Create Monomer" button
     *      4. Fill in Preset name with test data
     *      5. Fill in Sugar, Base, and Phosphate tabs with test data (only mandatory fields)
     *      6. Press "Submit" button
     *      7. Open Macromolecules canvas
     *
     * Version 3.12
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    const dialog = CreateMonomerDialog(page);
    const presetSection = NucleotidePresetSection(page);

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);
    await presetSection.setName(Preset.Preset.alias);
    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      symbol: Sugar.Sugar.alias,
      name: 'Sugar Test monomer',
      HELMAlias: 'SugAlias',
    });
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      symbol: Base.Base.alias,
      name: 'Base Test monomer',
      naturalAnalogue: NucleotideNaturalAnalogue.A,
      HELMAlias: 'BaseAlias',
    });
    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
      symbol: Phosphate.Phosphate.alias,
      name: 'Phosphate Test monomer',
      HELMAlias: 'PhosAlias',
    });
    await dialog.submit();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    expect(await Library(page).isMonomerExist(Preset.Preset)).toBeTruthy();
    expect(await Library(page).isMonomerExist(Sugar.Sugar)).toBeFalsy();
    expect(await Library(page).isMonomerExist(Base.Base)).toBeFalsy();
    expect(await Library(page).isMonomerExist(Phosphate.Phosphate)).toBeFalsy();
  });

  test('Nucleotide preset can be added to canvas after creation', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/8857
     * Description: Create a nucleotide preset and add it to canvas from library in macro mode.
     * Case:
     *      1. Open Macromolecules canvas
     *      2. Check that preset does not exist in library
     *      3. Open Molecules canvas
     *      4. Load molecule on canvas
     *      5. Press "Create Monomer" button
     *      6. Fill in Preset name with test data
     *      7. Fill in Sugar, Base, and Phosphate tabs with test data (only mandatory fields)
     *      8. Press "Submit" button
     *      9. Open Macromolecules canvas
     *      10. Clear canvas
     *      11. Add created preset to canvas from library
     *
     * Version 3.12
     */
    const presetData = Preset.PresetWithDefaultComponents;

    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    await expect(Library(page).isMonomerExist(presetData)).resolves.toBeFalsy();

    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    const dialog = CreateMonomerDialog(page);
    const presetSection = NucleotidePresetSection(page);

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);
    await presetSection.setName(presetData.alias);
    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
    });
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
    });
    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
    });
    await dialog.submit();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await CommonTopLeftToolbar(page).clearCanvas();
    await Library(page).dragMonomerOnCanvas(presetData, {
      x: 0,
      y: 0,
      fromCenter: true,
    });

    const sugarLocator = getMonomerLocator(page, {
      monomerAlias: presetData.sugar.alias,
    });
    const baseLocator = getMonomerLocator(page, {
      monomerAlias: presetData.base?.alias,
    });
    const phosphateLocator = getMonomerLocator(page, {
      monomerAlias: presetData.phosphate?.alias,
    });

    expect(await sugarLocator.count()).toBe(1);
    expect(await baseLocator.count()).toBe(1);
    expect(await phosphateLocator.count()).toBe(1);
  });

  test('Nucleotide preset can be created with default values of components', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/8775
     * Description: Create a nucleotide preset with default values of components fields
     *  and check that they added to canvas and represented as monomers with appropriate properties in macromolecules mode.
     * Case:
     *      1. Open Macromolecules canvas
     *      2. Open Molecules canvas
     *      3. Load molecule on canvas
     *      4. Press "Create Monomer" button
     *      5. Fill in Preset name with test data
     *      6. Fill in Sugar, Base, and Phosphate tabs with test data (only mandatory fields)
     *      7. Press "Submit" button
     *      8. Open Macromolecules canvas
     *
     * Version 3.12
     */
    const presetData = Preset.PresetWithDefaultComponents;

    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    const dialog = CreateMonomerDialog(page);
    const presetSection = NucleotidePresetSection(page);

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);
    await presetSection.setName(presetData.alias);
    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
    });
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
    });
    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
    });
    await dialog.submit();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    const sugarLocator = getMonomerLocator(page, {
      monomerAlias: presetData.sugar.alias,
      monomerType: MonomerType.Sugar,
    });
    const baseLocator = getMonomerLocator(page, {
      monomerAlias: presetData.base?.alias,
      monomerType: MonomerType.Base,
      naturalAnalogue: 'X',
    });
    const phosphateLocator = getMonomerLocator(page, {
      monomerAlias: presetData.phosphate?.alias,
      monomerType: MonomerType.Phosphate,
    });

    expect(await sugarLocator.count()).toBe(1);
    expect(await baseLocator.count()).toBe(1);
    expect(await phosphateLocator.count()).toBe(1);
  });

  test('Using of non-unique aliases for components do not block preset creation; library items remain visible', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/8857
     * Description: Use existing/duplicate aliases for Sugar/Base/Phosphate while creating a preset.
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Press "Create Monomer" button
     *      4. Fill in Preset name with test data
     *      4. Fill in Sugar, Base, and Phosphate tabs with data which already exist in library (only mandatory fields)
     *      5. Press "Submit" button
     *
     * Version 3.12
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    const dialog = CreateMonomerDialog(page);
    const presetSection = NucleotidePresetSection(page);

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);
    await presetSection.setName(Preset.Preset.alias);
    // Use known library aliases to simulate non-unique codes
    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      symbol: Sugar.R.alias,
      name: 'Sugar Name',
    });
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      symbol: Base.A.alias,
      name: 'Base Name',
      naturalAnalogue: NucleotideNaturalAnalogue.A,
    });
    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
      symbol: Phosphate.P.alias,
      name: 'Phosphate Name',
    });

    await dialog.submit();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    expect(
      await Library(page).isMonomerExist({
        ...Preset.A,
        alias: Preset.Preset.alias,
      }),
    ).toBeTruthy();
    expect(await Library(page).isMonomerExist(Sugar.R)).toBeTruthy();
    expect(await Library(page).isMonomerExist(Base.A)).toBeTruthy();
    expect(await Library(page).isMonomerExist(Phosphate.P)).toBeTruthy();
  });

  test('Formatting checks enforced for component properties', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/8857
     * Description: Set invalid formatted symbols for Sugar/Base/Phosphate components and check validation on submit.
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Press "Create Monomer" button
     *      4. Fill in Preset name with test data
     *      4. Fill in Sugar, Base, and Phosphate tabs with invalid data (only mandatory fields)
     *      5. Press "Submit" button
     *
     * Version 3.12
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    const dialog = CreateMonomerDialog(page);
    const presetSection = NucleotidePresetSection(page);

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);
    await presetSection.setName('PresetInvalidComponents');

    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      symbol: '<invalid name>',
      name: 'Sugar Name',
    });
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      symbol: '<invalid name>',
      name: 'Base Name',
      naturalAnalogue: NucleotideNaturalAnalogue.A,
    });
    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
      symbol: '<invalid name>',
      name: 'Phosphate Name',
    });

    await dialog.submit();

    expect(
      await NotificationMessageBanner(
        page,
        ErrorMessage.invalidSymbol,
      ).getNotificationMessage(),
    ).toEqual(
      'The monomer code must consist only of uppercase and lowercase letters, numbers, hyphens (-), underscores (_), and asterisks (*).',
    );

    // Verify tab and field error states are shown for components
    await presetSection.openTab(NucleotidePresetTab.Sugar);
    await expect(presetSection.sugarTab.symbolEditbox).toHaveClass(
      /inputError/,
    );
    await expect(page.getByTestId(NucleotidePresetTab.Sugar)).toHaveClass(
      /errorTab/,
    );

    await presetSection.openTab(NucleotidePresetTab.Base);
    await expect(presetSection.baseTab.symbolEditbox).toHaveClass(/inputError/);
    await expect(page.getByTestId(NucleotidePresetTab.Base)).toHaveClass(
      /errorTab/,
    );

    await presetSection.openTab(NucleotidePresetTab.Phosphate);
    await expect(presetSection.phosphateTab.symbolEditbox).toHaveClass(
      /inputError/,
    );
    await expect(page.getByTestId(NucleotidePresetTab.Phosphate)).toHaveClass(
      /errorTab/,
    );

    await dialog.discard();
  });
});

test.describe('Wizard exit confirmation for nucleotide preset', () => {
  test('Shows confirmation message after successful preset creation', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/8464
     * Description: Create a nucleotide preset and check success message on exit.
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Press "Create Monomer" button
     *      4. Fill in Preset name with test data
     *      4. Fill in Sugar, Base, and Phosphate tabs with test data (only mandatory fields)
     *      5. Press "Submit" button
     *
     * Version 3.12
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    const dialog = CreateMonomerDialog(page);
    const presetSection = NucleotidePresetSection(page);

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);
    await presetSection.setName(Preset.Preset.alias);
    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
    });
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
    });
    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
    });
    await dialog.submit();

    await expect(
      page.getByText('The preset was successfully added to the library'),
    ).toBeVisible();
  });
});

test.describe('Type change confirmation for Nucleotide (preset)', () => {
  test('Confirm warning appears when changing type after Nucleotide (preset)', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/8248
     * Description: Start preset creation, fill fields, pick another type and check confirmation dialog appears.
     *
     * Case:
     *      1. Open Molecules canvas and load molecule
     *      2. Open wizard and select Nucleotide (preset)
     *      3. Fill Preset name and Sugar minimal fields
     *      4. Open Type drop-down, pick another type (e.g. Sugar)
     *      5. Verify modal title, message, and buttons "Cancel" (default) and "Yes"
     *
     * Version 3.12
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    const dialog = CreateMonomerDialog(page);
    const presetSection = NucleotidePresetSection(page);
    const confirmModal = ConfirmationMessageDialog(page);

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);
    await presetSection.setName('Preset');
    await presetSection.setupSugar({ atomIds: [2, 3], bondIds: [2] });
    await dialog.selectType(MonomerTypeInDropdown.Sugar);

    await expect(confirmModal.confirmationModalWindow).toBeVisible();
    await expect(
      confirmModal.confirmationModalWindow.getByText(
        'Changing the type will result in a loss of inputted data. Do you wish to proceed?',
      ),
    ).toBeVisible();

    // Close modal to not affect other tests
    if (await confirmModal.confirmationModalWindow.isVisible()) {
      await confirmModal.ok();
    }
    await dialog.discard();
  });

  test('Type change: press Yes, then select Nucleotide (preset) again and verify fields cleared', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/8248
     * Description: Start preset creation, fill fields, pick another type, press Yes, then select preset again and check fields are reset.
     *
     * Case:
     *      1. Open Molecules canvas and load molecule
     *      2. Open wizard and select Nucleotide (preset)
     *      3. Fill Preset name and Sugar minimal fields
     *      4. Pick another type -> confirm modal -> press Yes
     *      5. Select Nucleotide (preset) again
     *      6. Verify Preset and component fields are cleared
     *
     * Version 3.12
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    const dialog = CreateMonomerDialog(page);
    const presetSection = NucleotidePresetSection(page);
    const confirmModal = ConfirmationMessageDialog(page);

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);
    await presetSection.setName('Preset');
    await presetSection.setupSugar({ atomIds: [2, 3], bondIds: [2] });
    await dialog.selectType(MonomerTypeInDropdown.Sugar);
    await confirmModal.ok();
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);
    await presetSection.openTab(NucleotidePresetTab.Preset);

    await expect(presetSection.presetTab.nameEditbox).toHaveValue('');

    await presetSection.openTab(NucleotidePresetTab.Sugar);

    await expect(presetSection.sugarTab.symbolEditbox).toHaveValue('');

    await presetSection.openTab(NucleotidePresetTab.Base);

    await expect(presetSection.baseTab.symbolEditbox).toHaveValue('');

    await presetSection.openTab(NucleotidePresetTab.Phosphate);

    await expect(presetSection.phosphateTab.symbolEditbox).toHaveValue('');

    await dialog.discard();
  });

  test('Type change: press Cancel, verify fields remain intact', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/8248
     * Description: Start preset creation, fill fields, pick another type, press Cancel and verify data persists.
     *
     * Case:
     *      1. Open Molecules canvas and load molecule
     *      2. Open wizard and select Nucleotide (preset)
     *      3. Fill Preset name and Sugar minimal fields
     *      4. Pick another type -> confirm modal -> press Cancel
     *      5. Verify current type is still Nucleotide (preset)
     *      6. Verify Preset and component fields are not cleared
     *
     * Version 3.12
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    const dialog = CreateMonomerDialog(page);
    const presetSection = NucleotidePresetSection(page);
    const confirmModal = ConfirmationMessageDialog(page);

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);
    await presetSection.setName('Preset');
    await presetSection.setupSugar({ atomIds: [1, 2], bondIds: [1] });
    await dialog.selectType(MonomerTypeInDropdown.Base);
    await confirmModal.cancel();

    await presetSection.openTab(NucleotidePresetTab.Preset);
    await expect(presetSection.presetTab.nameEditbox).toHaveValue('Preset');

    await presetSection.openTab(NucleotidePresetTab.Sugar);

    await expect(dialog.typeCombobox).toContainText('Nucleotide (preset)');

    await presetSection.openTab(NucleotidePresetTab.Sugar);

    await expect(presetSection.sugarTab.symbolEditbox).toHaveValue('PresetS');

    await presetSection.openTab(NucleotidePresetTab.Base);

    await expect(presetSection.baseTab.symbolEditbox).toHaveValue('PresetB');

    await presetSection.openTab(NucleotidePresetTab.Phosphate);

    await expect(presetSection.phosphateTab.symbolEditbox).toHaveValue(
      'PresetP',
    );

    await dialog.discard();
  });
});
