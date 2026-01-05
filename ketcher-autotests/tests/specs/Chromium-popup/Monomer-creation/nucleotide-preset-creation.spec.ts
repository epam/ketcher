/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Page, expect } from '@playwright/test';
import { test } from '@fixtures';
import { pasteFromClipboardAndOpenAsNewProject } from '@utils/files/readFile';
import { shiftCanvas, takeEditorScreenshot } from '@utils/index';
import { CreateMonomerDialog } from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import {
  MonomerType,
  NucleotideNaturalAnalogue,
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
     * Description: Create nucleotide preset with Sugar/Base/Phosphate filled.
     * Verify only preset is visible in Library, components are hidden.
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    const dialog = CreateMonomerDialog(page);
    const presetSection = NucleotidePresetSection(page);

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerType.NucleotidePreset);
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
     * Test task: https://github.com/epam/ketcher/issues/8775
     * Description: Create a nucleotide preset with a unique alias. Leave components filled by default values.
     * Switch to macromolecules mode and add this preset from Library onto canvas to check
     *  that even with hidden components it can be added.
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
    await dialog.selectType(MonomerType.NucleotidePreset);
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
    await Library(page).dragMonomerOnCanvas(presetData, {
      x: 0,
      y: 0,
      fromCenter: true,
    });

    await takeEditorScreenshot(page);
  });

  test('Duplicate aliases do not block preset creation; components remain hidden', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/8857
     * Description: Use existing/duplicate aliases for Sugar/Base/Phosphate while creating a preset.
     * Expect Submit succeeds, preset is visible, components are hidden.
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    const dialog = CreateMonomerDialog(page);
    const presetSection = NucleotidePresetSection(page);

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerType.NucleotidePreset);

    const presetAlias = Preset.Preset.alias;
    await presetSection.setName(presetAlias);

    // Use known library aliases to simulate non-unique codes
    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      symbol: Sugar.Sugar.alias,
      name: 'Sugar Name',
    });
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      symbol: Base.Base.alias,
      name: 'Base Name',
      naturalAnalogue: NucleotideNaturalAnalogue.A,
    });
    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
      symbol: Phosphate.Phosphate.alias,
      name: 'Phosphate Name',
    });

    await dialog.submit();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    expect(
      await Library(page).isMonomerExist({
        ...Preset.Preset,
        alias: presetAlias,
      }),
    ).toBeTruthy();
    expect(await Library(page).isMonomerExist(Sugar.Sugar)).toBeFalsy();
    expect(await Library(page).isMonomerExist(Base.Base)).toBeFalsy();
    expect(await Library(page).isMonomerExist(Phosphate.Phosphate)).toBeFalsy();
  });

  test('Formatting checks enforced for component properties', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/8857
     * Description: Set invalid formatted symbols for Sugar/Base/Phosphate components.
     * Expect formatting error message and error states on tabs/fields; preset not submitted.
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    const dialog = CreateMonomerDialog(page);
    const presetSection = NucleotidePresetSection(page);

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerType.NucleotidePreset);
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
