/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-magic-numbers */
/* eslint-disable max-len */
import { Page, test, expect } from '@fixtures';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { CreateMonomerDialog } from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import { NucleotidePresetSection } from '@tests/pages/molecules/canvas/createMonomer/NucleotidePresetSection';
import {
  MonomerType as MonomerTypeInDropdown,
  NucleotideNaturalAnalogue,
} from '@tests/pages/constants/createMonomerDialog/Constants';
import { NotificationMessageBanner } from '@tests/pages/molecules/canvas/createMonomer/NotificationMessageBanner';
import { ErrorMessage } from '@tests/pages/constants/notificationMessageBanner/Constants';
import { NucleotidePresetTab } from '@tests/pages/molecules/canvas/createMonomer/constants/nucleiotidePresetSection/Constants';
import { pasteFromClipboardAndOpenAsNewProject } from '@utils/files/readFile';
import { shiftCanvas } from '@utils/index';
import { Sugar } from '@tests/pages/constants/monomers/Sugars';
import { Base } from '@tests/pages/constants/monomers/Bases';
import { Phosphate } from '@tests/pages/constants/monomers/Phosphates';
import { MonomerType } from '@utils/types';
import { RNASection } from '@tests/pages/constants/library/Constants';

let page: Page;
let dialog: ReturnType<typeof CreateMonomerDialog>;
let presetSection: ReturnType<typeof NucleotidePresetSection>;

test.describe('Monomer saving - presets in the monomer creation wizard: ', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
    dialog = CreateMonomerDialog(page);
    presetSection = NucleotidePresetSection(page);
  });

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test.afterEach(async ({ MoleculesCanvas: _ }) => {});

  test('Case 1 - Verify that all monomers composing a preset are saved as hidden entries in the monomer library', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10012
     * Description: Create nucleotide preset with new Sugar/Base/Phosphate components
     * and verify that component monomers are saved internally but hidden from UI
     *
     * Scenario:
     * 1. Open Molecules canvas
     * 2. Load structure on canvas
     * 3. Open Monomer Creation Wizard
     * 4. Select 'Nucleotide (preset)'
     * 5. Define Base, Sugar, and Phosphate components as new monomers (don't reuse existing)
     * 6. Complete required fields and save preset
     * 7. Switch to Macromolecules mode
     * 8. Verify preset is visible in library
     * 9. Verify component monomers are not visible in library (hidden)
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    // Set preset name
    const presetName = 'HiddenTestPreset';
    await presetSection.setName(presetName);

    // Define new Sugar component (not existing in library)
    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      code: 'HiddenSugar',
      name: 'Hidden Sugar Test Monomer',
      HELMAlias: 'HSugar',
    });

    // Define new Base component (not existing in library)
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      code: 'HiddenBase',
      name: 'Hidden Base Test Monomer',
      naturalAnalogue: NucleotideNaturalAnalogue.A,
      HELMAlias: 'HBase',
    });

    // Define new Phosphate component (not existing in library)
    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
      code: 'HiddenPhosphate',
      name: 'Hidden Phosphate Test Monomer',
      HELMAlias: 'HPhos',
    });

    await dialog.submit();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    // Verify preset is visible in library
    expect(
      await Library(page).isMonomerExist({
        alias: presetName,
        testId: `HiddenTestPreset_HiddenBase_HiddenSugar_HiddenPhosphate`,
        monomerType: MonomerType.Preset,
      }),
    ).toBeTruthy();

    // Verify component monomers are hidden from UI
    expect(
      await Library(page).isMonomerExist({
        alias: 'HiddenSugar',
        testId: 'HiddenSugar___Hidden Sugar Test Monomer',
        monomerType: MonomerType.Sugar,
      }),
    ).toBeFalsy();

    expect(
      await Library(page).isMonomerExist({
        alias: 'HiddenBase',
        testId: 'HiddenBase___Hidden Base Test Monomer',
        monomerType: MonomerType.Base,
      }),
    ).toBeFalsy();

    expect(
      await Library(page).isMonomerExist({
        alias: 'HiddenPhosphate',
        testId: 'HiddenPhosphate___Hidden Phosphate Test Monomer',
        monomerType: MonomerType.Phosphate,
      }),
    ).toBeFalsy();
  });

  test('Case 2 - Verify that presets composed only of existing visible monomers do not create additional visible monomer entries', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10012
     * Description: Create preset using existing visible monomers and verify
     * no new visible monomer entries are created
     *
     * Scenario:
     * 1. Switch to Macromolecules mode to check existing monomer count
     * 2. Switch back to Molecules canvas
     * 3. Create preset using existing visible monomers for components
     * 4. Save preset
     * 5. Switch to Macromolecules mode
     * 6. Verify preset is visible
     * 7. Verify original monomers are still visible (no additional entries)
     *
     * Version 3.12.0
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    // Check that standard monomers exist
    const existsR = await Library(page).isMonomerExist(Sugar.R);
    const existsA = await Library(page).isMonomerExist(Base.A);
    const existsP = await Library(page).isMonomerExist(Phosphate.P);

    expect(existsR).toBeTruthy();
    expect(existsA).toBeTruthy();
    expect(existsP).toBeTruthy();

    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    const presetName = 'ExistingComponentsPreset';
    await presetSection.setName(presetName);

    // Use existing library aliases
    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      code: Sugar.R.alias,
      name: 'Existing Sugar Name',
    });

    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      code: Base.A.alias,
      name: 'Existing Base Name',
      naturalAnalogue: NucleotideNaturalAnalogue.A,
    });

    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
      code: Phosphate.P.alias,
      name: 'Existing Phosphate Name',
    });

    await dialog.submit();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    // Verify preset is visible
    expect(
      await Library(page).isMonomerExist({
        alias: presetName,
        testId: `ExistingComponentsPreset_A_R_P`,
        monomerType: MonomerType.Preset,
      }),
    ).toBeTruthy();

    // Verify original monomers are still visible (not duplicated)
    expect(await Library(page).isMonomerExist(Sugar.R)).toBeTruthy();
    expect(await Library(page).isMonomerExist(Base.A)).toBeTruthy();
    expect(await Library(page).isMonomerExist(Phosphate.P)).toBeTruthy();
  });

  test('Case 3 - Verify that hidden monomer properties are not checked for uniqueness against visible monomers', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10012
     * Description: Create hidden monomer with same code/name as existing visible monomer
     * and verify no uniqueness error is raised
     *
     * Scenario:
     * 1. Load structure on canvas
     * 2. Create preset with hidden monomer using same code/name as existing visible monomer
     * 3. Verify preset saves successfully without uniqueness errors
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    const presetName = 'DuplicateCodePreset';
    await presetSection.setName(presetName);

    // Use same code as existing visible monomer
    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      code: Sugar.R.alias,
      name: 'Duplicate Sugar Name',
    });

    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      code: Base.A.alias,
      name: 'Duplicate Base Name',
      naturalAnalogue: NucleotideNaturalAnalogue.A,
    });

    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
      code: Phosphate.P.alias,
      name: 'Duplicate Phosphate Name',
    });

    // Should submit successfully without uniqueness error
    await dialog.submit();

    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    expect(
      await Library(page).isMonomerExist({
        alias: presetName,
        testId: `DuplicateCodePreset_A_R_P`,
        monomerType: MonomerType.Preset,
      }),
    ).toBeTruthy();
  });

  test('Case 4 - Verify that hidden monomer properties are not checked for uniqueness across different presets', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10012
     * Description: Create two presets with hidden monomers having same codes/names
     * and verify both save successfully without uniqueness errors
     *
     * Scenario:
     * 1. Create first preset with specific hidden monomer codes/names
     * 2. Create second preset with same hidden monomer codes/names
     * 3. Verify both presets save successfully without uniqueness errors
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    // Create first preset
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    const preset1Name = 'FirstPreset';
    await presetSection.setName(preset1Name);

    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      code: 'DuplicateCode',
      name: 'Duplicate Name',
    });

    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      code: 'DuplicateBase',
      name: 'Duplicate Base',
      naturalAnalogue: NucleotideNaturalAnalogue.A,
    });

    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
      code: 'DuplicatePhosphate',
      name: 'Duplicate Phosphate',
    });

    await dialog.submit();

    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    expect(
      await Library(page).isMonomerExist({
        alias: preset1Name,
        testId: `FirstPreset_DuplicateBase_DuplicateCode_DuplicatePhosphate`,
        monomerType: MonomerType.Preset,
      }),
    ).toBeTruthy();

    // Create second preset with same codes/names
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    const preset2Name = 'SecondPreset';
    await presetSection.setName(preset2Name);

    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      code: 'DuplicateCode',
      name: 'Duplicate Name',
    });

    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      code: 'DuplicateBase',
      name: 'Duplicate Base',
      naturalAnalogue: NucleotideNaturalAnalogue.A,
    });

    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
      code: 'DuplicatePhosphate',
      name: 'Duplicate Phosphate',
    });

    // Should submit successfully without uniqueness error
    await dialog.submit();

    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await Library(page).switchToRNATab();
    await Library(page).openRNASection(RNASection.Presets);
    await Library(page).rnaBuilder.expand();

    // The second preset should also be saved without uniqueness errors.
    expect(
      await Library(page).isMonomerExist({
        alias: preset2Name,
        testId: `SecondPreset_DuplicateBase_DuplicateCode_DuplicatePhosphate`,
        monomerType: MonomerType.Preset,
      }),
    ).toBeTruthy();
  });

  test('Case 5 - Verify that hidden monomer properties are still validated for formatting', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10012
     * Description: Enter invalid characters in hidden monomer properties
     * and verify formatting validation error blocks saving
     *
     * Scenario:
     * 1. Load structure on canvas
     * 2. Create preset with invalid characters in hidden monomer properties
     * 3. Attempt to save
     * 4. Verify formatting validation error appears and blocks saving
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    await presetSection.setName('FormatTestPreset');

    // Use invalid characters in component codes
    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      code: '<InvalidSugar>',
      name: 'Format Test Sugar',
    });

    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      code: '<InvalidBase>',
      name: 'Format Test Base',
      naturalAnalogue: NucleotideNaturalAnalogue.A,
    });

    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
      code: '<InvalidPhosphate>',
      name: 'Format Test Phosphate',
    });

    await dialog.submit();

    // Verify formatting error message appears
    expect(
      await NotificationMessageBanner(
        page,
        ErrorMessage.invalidSymbol,
      ).getNotificationMessage(),
    ).toEqual(
      'The monomer code must consist only of uppercase and lowercase letters, numbers, hyphens (-), underscores (_), and asterisks (*).',
    );

    // Verify error states on tabs
    await presetSection.openTab(NucleotidePresetTab.Sugar);
    await expect(presetSection.sugarTab.codeEditbox).toHaveClass(/inputError/);
    await expect(page.getByTestId(NucleotidePresetTab.Sugar)).toHaveClass(
      /errorTab/,
    );

    await presetSection.openTab(NucleotidePresetTab.Base);
    await expect(presetSection.baseTab.codeEditbox).toHaveClass(/inputError/);
    await expect(page.getByTestId(NucleotidePresetTab.Base)).toHaveClass(
      /errorTab/,
    );

    await presetSection.openTab(NucleotidePresetTab.Phosphate);
    await expect(presetSection.phosphateTab.codeEditbox).toHaveClass(
      /inputError/,
    );
    await expect(page.getByTestId(NucleotidePresetTab.Phosphate)).toHaveClass(
      /errorTab/,
    );

    await dialog.discard();
  });

  test('Case 6 - Verify that fixing formatting issues allows preset to be saved', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10012
     * Description: Correct formatting errors and verify preset saves successfully after correction
     *
     * Scenario:
     * 1. Create preset with invalid formatting (from previous scenario)
     * 2. Fix formatting errors in all component properties
     * 3. Verify preset saves successfully after correction
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    const presetName = 'FixedFormatPreset';
    await presetSection.setName(presetName);

    // First set invalid codes
    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      code: '<InvalidSugar>',
      name: 'Format Fix Sugar',
    });

    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      code: '<InvalidBase>',
      name: 'Format Fix Base',
      naturalAnalogue: NucleotideNaturalAnalogue.A,
    });

    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
      code: '<InvalidPhosphate>',
      name: 'Format Fix Phosphate',
    });

    // Try to submit (should fail)
    await dialog.submit();

    // Verify error exists
    expect(
      await NotificationMessageBanner(
        page,
        ErrorMessage.invalidSymbol,
      ).getNotificationMessage(),
    ).toEqual(
      'The monomer code must consist only of uppercase and lowercase letters, numbers, hyphens (-), underscores (_), and asterisks (*).',
    );

    // Fix the formatting errors
    await presetSection.openTab(NucleotidePresetTab.Sugar);
    await presetSection.sugarTab.codeEditbox.fill('ValidSugar');

    await presetSection.openTab(NucleotidePresetTab.Base);
    await presetSection.baseTab.codeEditbox.fill('ValidBase');

    await presetSection.openTab(NucleotidePresetTab.Phosphate);
    await presetSection.phosphateTab.codeEditbox.fill('ValidPhosphate');

    // Now submit should succeed
    await dialog.submit();

    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    expect(
      await Library(page).isMonomerExist({
        alias: presetName,
        testId: `FixedFormatPreset_ValidBase_ValidSugar_ValidPhosphate`,
        monomerType: MonomerType.Preset,
      }),
    ).toBeTruthy();
  });

  test('Case 7 - Verify that visible monomer creation still enforces uniqueness while hidden monomers do not', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10012
     * Description: Test uniqueness validation for visible monomers vs hidden monomers
     *
     * Scenario:
     * 1. Create visible monomer with existing code (should fail)
     * 2. Create preset with hidden monomer using same code (should succeed)
     * 3. Verify different behavior between visible and hidden monomers
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    // First try to create visible monomer with existing code
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.Sugar);
    await dialog.codeEditbox.fill(Sugar.R.alias);
    await dialog.nameEditbox.fill('Duplicate Visible Sugar');

    await dialog.submit();
    const symbolExistsMessageBanner = NotificationMessageBanner(
      page,
      ErrorMessage.symbolExists,
    );
    expect(await symbolExistsMessageBanner.isVisible()).toBeTruthy();
    await dialog.discard();

    // Now create preset with hidden monomer using same code - should succeed
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    const presetName = 'UniquenessTestPreset';
    await presetSection.setName(presetName);

    // Use existing code in hidden component - should work
    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      code: Sugar.R.alias,
      name: 'Hidden Sugar with Duplicate Code',
    });

    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      code: 'UniquenessTestBase',
      name: 'Uniqueness Test Base',
      naturalAnalogue: NucleotideNaturalAnalogue.A,
    });

    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
      code: 'UniquenessTestPhosphate',
      name: 'Uniqueness Test Phosphate',
    });

    // This should succeed because hidden monomers bypass uniqueness checks
    await dialog.submit();

    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    expect(
      await Library(page).isMonomerExist({
        alias: presetName,
        testId: `UniquenessTestPreset_UniquenessTestBase_R_UniquenessTestPhosphate`,
        monomerType: MonomerType.Preset,
      }),
    ).toBeTruthy();
  });

  test('Case 8 - Verify that hidden monomers created with a preset are not selectable as components', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10012
     * Description: Create preset with hidden monomers and verify hidden monomers
     * don't appear in component selection UI
     *
     * Scenario:
     * 1. Create preset with hidden monomers
     * 2. Save preset successfully
     * 3. Try to create another preset and verify hidden monomers don't appear
     *    in component selection UI
     * 4. Verify only visible monomers appear in selection dropdowns
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    // Create preset with hidden components
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    const presetName = 'SelectabilityTestPreset';
    await presetSection.setName(presetName);

    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      code: 'HiddenSelectSugar',
      name: 'Hidden Selectable Sugar',
    });

    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      code: 'HiddenSelectBase',
      name: 'Hidden Selectable Base',
      naturalAnalogue: NucleotideNaturalAnalogue.A,
    });

    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
      code: 'HiddenSelectPhosphate',
      name: 'Hidden Selectable Phosphate',
    });

    await dialog.submit();

    // Now switch to macro mode to verify preset exists but components are hidden
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    expect(
      await Library(page).isMonomerExist({
        alias: presetName,
        testId: `SelectabilityTestPreset_HiddenSelectBase_HiddenSelectSugar_HiddenSelectPhosphate`,
        monomerType: MonomerType.Preset,
      }),
    ).toBeTruthy();

    // Verify hidden components are not selectable in library
    expect(
      await Library(page).isMonomerExist({
        alias: 'HiddenSelectSugar',
        testId: `HiddenSelectSugar___Hidden Selectable Sugar`,
        monomerType: MonomerType.Sugar,
      }),
    ).toBeFalsy();

    expect(
      await Library(page).isMonomerExist({
        alias: 'HiddenSelectBase',
        testId: `HiddenSelectBase___Hidden Selectable Base`,
        monomerType: MonomerType.Base,
      }),
    ).toBeFalsy();

    expect(
      await Library(page).isMonomerExist({
        alias: 'HiddenSelectPhosphate',
        testId: `HiddenSelectPhosphate___Hidden Selectable Phosphate`,
        monomerType: MonomerType.Phosphate,
      }),
    ).toBeFalsy();

    // Try to create another preset and use visible monomers as components.
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    await presetSection.setName('SelectabilityVisiblePreset');
    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      code: Sugar.R.alias,
      name: 'Visible Sugar Component',
    });

    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      code: Base.A.alias,
      name: 'Visible Base Component',
      naturalAnalogue: NucleotideNaturalAnalogue.A,
    });

    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
      code: Phosphate.P.alias,
      name: 'Visible Phosphate Component',
    });

    await dialog.submit();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    expect(
      await Library(page).isMonomerExist({
        alias: presetName,
        testId: `SelectabilityVisiblePreset_A_R_P`,
        monomerType: MonomerType.Preset,
      }),
    ).toBeTruthy();

    // Hidden components from the first preset remain unavailable in UI.
    expect(
      await Library(page).isMonomerExist({
        alias: 'HiddenSelectSugar',
        testId: `HiddenSelectSugar___Hidden Selectable Sugar`,
        monomerType: MonomerType.Sugar,
      }),
    ).toBeFalsy();

    expect(
      await Library(page).isMonomerExist({
        alias: 'HiddenSelectBase',
        testId: `HiddenSelectBase___Hidden Selectable Base`,
        monomerType: MonomerType.Base,
      }),
    ).toBeFalsy();

    expect(
      await Library(page).isMonomerExist({
        alias: 'HiddenSelectPhosphate',
        testId: `HiddenSelectPhosphate___Hidden Selectable Phosphate`,
        monomerType: MonomerType.Phosphate,
      }),
    ).toBeFalsy();
  });
});
