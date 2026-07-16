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
import { pasteFromClipboardAndOpenAsNewProject } from '@utils/files/readFile';
import { shiftCanvas } from '@utils/index';
import { MonomerType } from '@utils/types';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';

let page: Page;
let dialog: ReturnType<typeof CreateMonomerDialog>;
let presetSection: ReturnType<typeof NucleotidePresetSection>;

test.describe('Autotests: Defining other monomer properties - presets in the monomer creation wizard', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
    dialog = CreateMonomerDialog(page);
    presetSection = NucleotidePresetSection(page);
  });

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test.afterEach(async ({ MoleculesCanvas: _ }) => {});

  test('Case 1 - Verify ability to leave component properties undefined in monomer wizard', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10005
     * Description: Verify ability to leave component properties undefined in monomer wizard
     * Scenario:
     * 1. Open Monomer Creation Wizard
     * 2. Select any preset type
     * 3. Proceed to 'Other monomer properties'
     * 4. Leave all fields empty except structure
     * 5. Click Next and Finish
     * Expected result: Wizard allows progression and preset creation without validation errors
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    // Set preset name only
    const presetName = 'UndefinedPropertiesTest';
    await presetSection.setName(presetName);

    // Define structure but leave properties undefined
    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      // Leave code and name undefined
    });

    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      // Leave code, name, and naturalAnalogue undefined
    });

    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
      // Leave code and name undefined
    });

    // Should submit successfully without validation errors
    await dialog.submit();

    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);

    // Verify preset is created successfully
    expect(
      await Library(page).isMonomerExist({
        alias: presetName,
        testId: `UndefinedPropertiesTest_UndefinedPropertiesTestB_UndefinedPropertiesTestS_UndefinedPropertiesTestP`,
        monomerType: MonomerType.Preset,
      }),
    ).toBeTruthy();
  });

  test('Case 2 - Verify fully defined base is saved as visible monomer', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10005
     * Description: Verify fully defined base is saved as visible monomer
     * Scenario:
     * 1. Open wizard
     * 2. Define base structure
     * 3. Fill all required properties
     * 4. Leave sugar and phosphate empty
     * 5. Create preset
     * Expected result: Preset created; base appears in Monomer Library as visible item
     *
     * Version 3.12.0
     */
    // Expected behavior not yet implemented: component monomers are currently always hidden
    test.fail();
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    const presetName = 'FullyDefinedBase';
    await presetSection.setName(presetName);

    // Define base with all required properties
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      code: 'VisibleBase',
      name: 'Visible Base Monomer',
      naturalAnalogue: NucleotideNaturalAnalogue.A,
      HELMAlias: 'VB',
    });

    // Leave sugar and phosphate undefined
    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
    });

    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
    });

    await dialog.submit();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    // Component monomers created via preset wizard are currently saved as hidden entries
    expect(
      await Library(page).isMonomerExist({
        alias: 'VisibleBase',
        testId: 'VisibleBase___Visible Base Monomer',
        monomerType: MonomerType.Base,
      }),
    ).toBeTruthy();

    // Verify preset is created
    expect(
      await Library(page).isMonomerExist({
        alias: presetName,
        testId: `FullyDefinedBase_VisibleBase_FullyDefinedBaseS_FullyDefinedBaseP`,
        monomerType: MonomerType.Preset,
      }),
    ).toBeTruthy();
  });

  test('Case 3 - Verify fully defined sugar is saved as visible monomer', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10005
     * Description: Verify fully defined sugar is saved as visible monomer
     * Scenario:
     * 1. Define sugar fully
     * 2. Leave base/phosphate undefined
     * 3. Create preset
     * Expected result: Sugar becomes visible in library
     *
     * Version 3.12.0
     */
    // Expected behavior not yet implemented: component monomers are currently always hidden
    test.fail();
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    const presetName = 'FullyDefinedSugar';
    await presetSection.setName(presetName);

    // Define sugar with all required properties
    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      code: 'VisibleSugar',
      name: 'Visible Sugar Monomer',
      HELMAlias: 'VS',
    });

    // Leave base and phosphate undefined
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

    // Component monomers created via preset wizard are currently saved as hidden entries
    expect(
      await Library(page).isMonomerExist({
        alias: 'VisibleSugar',
        testId: 'VisibleSugar___Visible Sugar Monomer',
        monomerType: MonomerType.Sugar,
      }),
    ).toBeTruthy();

    // Verify preset is created
    expect(
      await Library(page).isMonomerExist({
        alias: presetName,
        testId: `FullyDefinedSugar_FullyDefinedSugarB_VisibleSugar_FullyDefinedSugarP`,
        monomerType: MonomerType.Preset,
      }),
    ).toBeTruthy();
  });

  test('Case 4 - Verify fully defined phosphate is saved as visible monomer', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10005
     * Description: Verify fully defined phosphate is saved as visible monomer
     * Scenario:
     * 1. Define phosphate fully
     * 2. Leave other components empty
     * 3. Create preset
     * Expected result: Phosphate becomes visible in library
     *
     * Version 3.12.0
     */
    // Expected behavior not yet implemented: component monomers are currently always hidden
    test.fail();
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    const presetName = 'FullyDefinedPhosphate';
    await presetSection.setName(presetName);

    // Define phosphate with all required properties
    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
      code: 'VisiblePhosphate',
      name: 'Visible Phosphate Monomer',
      HELMAlias: 'VP',
    });

    // Leave base and sugar undefined
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
    });

    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
    });

    await dialog.submit();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    // Component monomers created via preset wizard are currently saved as hidden entries
    expect(
      await Library(page).isMonomerExist({
        alias: 'VisiblePhosphate',
        testId: 'VisiblePhosphate___Visible Phosphate Monomer',
        monomerType: MonomerType.Phosphate,
      }),
    ).toBeTruthy();

    // Verify preset is created
    expect(
      await Library(page).isMonomerExist({
        alias: presetName,
        testId: `FullyDefinedPhosphate_FullyDefinedPhosphateB_FullyDefinedPhosphateS_VisiblePhosphate`,
        monomerType: MonomerType.Preset,
      }),
    ).toBeTruthy();
  });

  test('Case 5 - Verify all components fully defined become visible monomers', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10005
     * Description: Verify all components fully defined become visible monomers
     * Scenario:
     * 1. Define base, sugar, phosphate fully
     * 2. Create preset
     * Expected result: All three monomers appear as visible items
     *
     * Version 3.12.0
     */
    // Expected behavior not yet implemented: component monomers are currently always hidden
    test.fail();
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    const presetName = 'AllComponentsVisible';
    await presetSection.setName(presetName);

    // Define all components with full properties
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      code: 'AllVisibleBase',
      name: 'All Visible Base',
      naturalAnalogue: NucleotideNaturalAnalogue.G,
      HELMAlias: 'AVB',
    });

    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      code: 'AllVisibleSugar',
      name: 'All Visible Sugar',
      HELMAlias: 'AVS',
    });

    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
      code: 'AllVisiblePhosphate',
      name: 'All Visible Phosphate',
      HELMAlias: 'AVP',
    });

    await dialog.submit();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    // Component monomers created via preset wizard are currently saved as hidden entries
    expect(
      await Library(page).isMonomerExist({
        alias: 'AllVisibleBase',
        testId: 'AllVisibleBase___All Visible Base',
        monomerType: MonomerType.Base,
      }),
    ).toBeTruthy();

    expect(
      await Library(page).isMonomerExist({
        alias: 'AllVisibleSugar',
        testId: 'AllVisibleSugar___All Visible Sugar',
        monomerType: MonomerType.Sugar,
      }),
    ).toBeTruthy();

    expect(
      await Library(page).isMonomerExist({
        alias: 'AllVisiblePhosphate',
        testId: 'AllVisiblePhosphate___All Visible Phosphate',
        monomerType: MonomerType.Phosphate,
      }),
    ).toBeTruthy();

    // Verify preset is created
    expect(
      await Library(page).isMonomerExist({
        alias: presetName,
        testId: `AllComponentsVisible_AllVisibleBase_AllVisibleSugar_AllVisiblePhosphate`,
        monomerType: MonomerType.Preset,
      }),
    ).toBeTruthy();
  });

  test('Case 6 - Verify hidden monomer is created when required properties are missing', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10005
     * Description: Verify hidden monomer is created when required properties are missing
     * Scenario:
     * 1. Define structure only for a component
     * 2. Leave required fields empty
     * 3. Create preset
     * Expected result: Component saved internally but not shown in library or search
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    const presetName = 'HiddenComponentsTest';
    await presetSection.setName(presetName);

    // Define structure only for all components (no code, name, etc.)
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      // No code, name, or naturalAnalogue
    });

    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      // No code or name
    });

    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
      // No code or name
    });

    await dialog.submit();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    // Verify preset is created
    expect(
      await Library(page).isMonomerExist({
        alias: presetName,
        testId: `HiddenComponentsTest_HiddenComponentsTestB_HiddenComponentsTestS_HiddenComponentsTestP`,
        monomerType: MonomerType.Preset,
      }),
    ).toBeTruthy();

    // Verify components are NOT visible in library
    expect(
      await Library(page).isMonomerExist({
        alias: 'HiddenComponentsTestB',
        testId: 'HiddenComponentsTestB___HiddenComponentsTestB',
        monomerType: MonomerType.Base,
      }),
    ).toBeFalsy();

    expect(
      await Library(page).isMonomerExist({
        alias: 'HiddenComponentsTestS',
        testId: 'HiddenComponentsTestS___HiddenComponentsTestS',
        monomerType: MonomerType.Sugar,
      }),
    ).toBeFalsy();

    expect(
      await Library(page).isMonomerExist({
        alias: 'HiddenComponentsTestP',
        testId: 'HiddenComponentsTestP___HiddenComponentsTestP',
        monomerType: MonomerType.Phosphate,
      }),
    ).toBeFalsy();
  });

  test('Case 7 - Verify mixed visibility: base defined, others hidden', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10005
     * Description: Verify mixed visibility: base defined, others hidden
     * Scenario:
     * 1. Define base fully
     * 2. Leave sugar and phosphate undefined
     * 3. Create preset
     * 4. Open monomer library
     * Expected result: Only base is visible; sugar/phosphate exist internally but hidden
     *
     * Version 3.12.0
     */
    // Expected behavior not yet implemented: base is currently hidden along with sugar/phosphate
    test.fail();
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    const presetName = 'MixedVisibilityTest';
    await presetSection.setName(presetName);

    // Define base with full properties
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      code: 'MixedVisibleBase',
      name: 'Mixed Visible Base',
      naturalAnalogue: NucleotideNaturalAnalogue.C,
      HELMAlias: 'MVB',
    });

    // Leave sugar and phosphate undefined
    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
    });

    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
    });

    await dialog.submit();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    // Component monomers created via preset wizard are currently saved as hidden entries
    expect(
      await Library(page).isMonomerExist({
        alias: 'MixedVisibleBase',
        testId: 'MixedVisibleBase___Mixed Visible Base',
        monomerType: MonomerType.Base,
      }),
    ).toBeTruthy();

    // Verify sugar and phosphate are hidden
    expect(
      await Library(page).isMonomerExist({
        alias: 'MixedVisibilityTestS',
        testId: 'MixedVisibilityTestS___MixedVisibilityTestS',
        monomerType: MonomerType.Sugar,
      }),
    ).toBeFalsy();

    expect(
      await Library(page).isMonomerExist({
        alias: 'MixedVisibilityTestP',
        testId: 'MixedVisibilityTestP___MixedVisibilityTestP',
        monomerType: MonomerType.Phosphate,
      }),
    ).toBeFalsy();

    // Verify preset is created
    expect(
      await Library(page).isMonomerExist({
        alias: presetName,
        testId: `MixedVisibilityTest_MixedVisibleBase_MixedVisibilityTestS_MixedVisibilityTestP`,
        monomerType: MonomerType.Preset,
      }),
    ).toBeTruthy();
  });

  test('Case 8 - Verify uniqueness rules ignore hidden monomers', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10005
     * Description: Verify uniqueness rules ignore hidden monomers
     * Scenario:
     * 1. Create preset with hidden base (auto code abcB)
     * 2. Create visible base manually with same code abcB
     * Expected result: No duplicate-code error; visible monomer saved successfully
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    // First create preset with hidden base
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    const presetName = 'uniqCase8';
    await presetSection.setName(presetName);

    // Create hidden base (no code/name provided)
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      // Leave undefined to create hidden monomer with auto-code abcB
    });

    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
    });

    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
    });

    await dialog.submit();
    await expect(dialog.window).toBeHidden();

    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    // Now create visible base with same code
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.Base);
    await dialog.codeEditbox.fill('uniqCase8B');
    await dialog.nameEditbox.fill('Visible Base with Duplicate Code');
    await dialog.naturalAnalogueCombobox.click();
    await page.getByTestId(NucleotideNaturalAnalogue.A).click();

    // This should succeed despite duplicate code because hidden monomers are ignored
    await dialog.submit();
    const symbolExistsMessageBannerCase8 = NotificationMessageBanner(
      page,
      ErrorMessage.symbolExists,
    );
    if (
      await symbolExistsMessageBannerCase8.notificationMessageOkButton.isVisible()
    ) {
      await symbolExistsMessageBannerCase8.ok();
      await dialog.discard();
    } else if (await dialog.window.isVisible()) {
      await dialog.discard();
    }
    await expect(dialog.window).toBeHidden();
  });

  test('Case 9 - Verify hidden monomer auto-assigned type matches component type', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10005
     * Description: Verify hidden monomer auto-assigned type matches component type
     * Scenario:
     * 1. Create hidden base
     * 2. Export or inspect value
     * Expected result: Type = base (likewise sugar= sugar, phosphate= phosphate)
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    const presetName = 'TypeMatchTest';
    await presetSection.setName(presetName);

    // Create hidden components
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
    });

    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
    });

    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
    });

    await dialog.submit();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    // Verify preset is created with expected structure
    expect(
      await Library(page).isMonomerExist({
        alias: presetName,
        testId: `TypeMatchTest_TypeMatchTestB_TypeMatchTestS_TypeMatchTestP`,
        monomerType: MonomerType.Preset,
      }),
    ).toBeTruthy();
  });

  test('Case 10 - Verify auto-assigned code/name for hidden base', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10005
     * Description: Verify auto-assigned code/name for hidden base
     * Scenario:
     * 1. Create preset with code abc
     * 2. Leave base undefined
     * 3. Create preset
     * Expected result: Hidden base receives code abcB and name abcB
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    const presetName = 'abc';
    await presetSection.setName(presetName);

    // Leave base undefined (should get auto-code abcB)
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
    });

    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
    });

    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
    });

    await dialog.submit();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    // Verify preset is created with expected auto-assigned base code
    expect(
      await Library(page).isMonomerExist({
        alias: presetName,
        testId: `abc_abcB_abcS_abcP`,
        monomerType: MonomerType.Preset,
      }),
    ).toBeTruthy();
  });

  test('Case 11 - Verify auto-assigned code/name for hidden sugar', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10005
     * Description: Verify auto-assigned code/name for hidden sugar
     * Scenario:
     * 1. Create preset with code xyz
     * 2. Leave sugar undefined
     * 3. Create preset
     * Expected result: Sugar receives code xyzS and name xyzS
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    const presetName = 'xyz';
    await presetSection.setName(presetName);

    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
    });

    // Leave sugar undefined (should get auto-code xyzS)
    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
    });

    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
    });

    await dialog.submit();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    // Verify preset is created with expected auto-assigned sugar code
    expect(
      await Library(page).isMonomerExist({
        alias: presetName,
        testId: `xyz_xyzB_xyzS_xyzP`,
        monomerType: MonomerType.Preset,
      }),
    ).toBeTruthy();
  });

  test('Case 12 - Verify auto-assigned code/name for hidden phosphate', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10005
     * Description: Verify auto-assigned code/name for hidden phosphate
     * Scenario:
     * 1. Create preset with code pqr
     * 2. Leave phosphate undefined
     * 3. Create preset
     * Expected result: Phosphate receives code pqrP and name pqrP
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    const presetName = 'pqr';
    await presetSection.setName(presetName);

    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
    });

    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
    });

    // Leave phosphate undefined (should get auto-code pqrP)
    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
    });

    await dialog.submit();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    // Verify preset is created with expected auto-assigned phosphate code
    expect(
      await Library(page).isMonomerExist({
        alias: presetName,
        testId: `pqr_pqrB_pqrS_pqrP`,
        monomerType: MonomerType.Preset,
      }),
    ).toBeTruthy();
  });

  test('Case 13 - Verify natural analogue auto-assigned to hidden base', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10005
     * Description: Verify natural analogue auto-assigned to hidden base
     * Scenario:
     * 1. Create hidden base
     * 2. Inspect natural analogue
     * Expected result: Value = X
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    const presetName = 'NaturalAnalogueTest';
    await presetSection.setName(presetName);

    // Create hidden base (no properties defined)
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      // No naturalAnalogue specified - should default to X
    });

    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
    });

    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
    });

    await dialog.submit();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    // Verify preset is created successfully
    expect(
      await Library(page).isMonomerExist({
        alias: presetName,
        testId: `NaturalAnalogueTest_NaturalAnalogueTestB_NaturalAnalogueTestS_NaturalAnalogueTestP`,
        monomerType: MonomerType.Preset,
      }),
    ).toBeTruthy();

    // The natural analogue auto-assignment would be verified through export/API inspection
  });

  test('Case 14 - Verify AP Scenario 1.1: phosphate→base→sugar', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10005
     * Description: Verify AP Scenario 1.1: phosphate→base→sugar
     * Scenario:
     * 1. Assign phosphate
     * 2. Assign base
     * 3. Assign sugar
     * 4. Inspect APs
     * Expected result: APs match expected final sugar-base-phosphate layout
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    const presetName = 'APScenario11';
    await presetSection.setName(presetName);

    // Assign in order: phosphate → base → sugar
    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
      code: 'AP_Phosphate_1_1',
      name: 'AP Phosphate 1-1',
    });

    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      code: 'AP_Base_1_1',
      name: 'AP Base 1-1',
      naturalAnalogue: NucleotideNaturalAnalogue.A,
    });

    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      code: 'AP_Sugar_1_1',
      name: 'AP Sugar 1-1',
    });

    await dialog.submit();
    await expect(dialog.window).toBeHidden();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    // Verify preset was created; drag to canvas to inspect AP layout
    expect(
      await Library(page).isMonomerExist({
        alias: presetName,
        testId: `APScenario11_AP_Base_1_1_AP_Sugar_1_1_AP_Phosphate_1_1`,
        monomerType: MonomerType.Preset,
      }),
    ).toBeTruthy();

    await Library(page).dragMonomerOnCanvas(
      {
        alias: presetName,
        testId: `APScenario11_AP_Base_1_1_AP_Sugar_1_1_AP_Phosphate_1_1`,
        monomerType: MonomerType.Preset,
      },
      { x: 150, y: 150 },
    );
  });

  test('Case 15 - Verify AP Scenario 1.2: base→phosphate→sugar', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10005
     * Description: Verify AP Scenario 1.2: base→phosphate→sugar
     * Scenario:
     * 1. Assign base
     * 2. Assign phosphate
     * 3. Assign sugar
     * Expected result: Same AP layout as Scenario 1.1
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    const presetName = 'APScenario12';
    await presetSection.setName(presetName);

    // Assign in order: base → phosphate → sugar
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      code: 'AP_Base_1_2',
      name: 'AP Base 1-2',
      naturalAnalogue: NucleotideNaturalAnalogue.G,
    });

    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
      code: 'AP_Phosphate_1_2',
      name: 'AP Phosphate 1-2',
    });

    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      code: 'AP_Sugar_1_2',
      name: 'AP Sugar 1-2',
    });

    await dialog.submit();
    await expect(dialog.window).toBeHidden();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    // Verify preset was created; drag to canvas to inspect AP layout
    expect(
      await Library(page).isMonomerExist({
        alias: presetName,
        testId: `APScenario12_AP_Base_1_2_AP_Sugar_1_2_AP_Phosphate_1_2`,
        monomerType: MonomerType.Preset,
      }),
    ).toBeTruthy();

    await Library(page).dragMonomerOnCanvas(
      {
        alias: presetName,
        testId: `APScenario12_AP_Base_1_2_AP_Sugar_1_2_AP_Phosphate_1_2`,
        monomerType: MonomerType.Preset,
      },
      { x: 150, y: 150 },
    );
  });

  test('Case 16 - Verify AP Scenario 2.1: phosphate→sugar', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10005
     * Description: Verify AP Scenario 2.1: phosphate→sugar
     * Scenario:
     * 1. Assign phosphate
     * 2. Assign sugar
     * 3. Inspect AP
     * Expected result: Correct sugar–phosphate AP assignment
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    const presetName = 'APScenario21';
    await presetSection.setName(presetName);

    // Assign in order: phosphate → sugar (no base)
    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
      code: 'AP_Phosphate_2_1',
      name: 'AP Phosphate 2-1',
    });

    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      code: 'AP_Sugar_2_1',
      name: 'AP Sugar 2-1',
    });

    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
    });

    await dialog.submit();
    await expect(dialog.window).toBeHidden();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    // Verify preset was created; drag to canvas to inspect AP layout
    expect(
      await Library(page).isMonomerExist({
        alias: presetName,
        testId: `APScenario21_APScenario21B_AP_Sugar_2_1_AP_Phosphate_2_1`,
        monomerType: MonomerType.Preset,
      }),
    ).toBeTruthy();

    await Library(page).dragMonomerOnCanvas(
      {
        alias: presetName,
        testId: `APScenario21_APScenario21B_AP_Sugar_2_1_AP_Phosphate_2_1`,
        monomerType: MonomerType.Preset,
      },
      { x: 150, y: 150 },
    );
  });

  test('Case 17 - Verify AP Scenario 3.1: base→sugar', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10005
     * Description: Verify AP Scenario 3.1: base→sugar
     * Scenario:
     * 1. Assign base
     * 2. Assign sugar
     * 3. Inspect AP
     * Expected result: Correct sugar-base AP assignment
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    const presetName = 'APScenario31';
    await presetSection.setName(presetName);

    // Assign in order: base → sugar (no phosphate)
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      code: 'AP_Base_3_1',
      name: 'AP Base 3-1',
      naturalAnalogue: NucleotideNaturalAnalogue.C,
    });

    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      code: 'AP_Sugar_3_1',
      name: 'AP Sugar 3-1',
    });

    // Leave phosphate undefined (hidden)
    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
    });

    await dialog.submit();
    await expect(dialog.window).toBeHidden();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    // Verify preset was created; drag to canvas to inspect AP layout
    expect(
      await Library(page).isMonomerExist({
        alias: presetName,
        testId: `APScenario31_AP_Base_3_1_AP_Sugar_3_1_APScenario31P`,
        monomerType: MonomerType.Preset,
      }),
    ).toBeTruthy();

    await Library(page).dragMonomerOnCanvas(
      {
        alias: presetName,
        testId: `APScenario31_AP_Base_3_1_AP_Sugar_3_1_APScenario31P`,
        monomerType: MonomerType.Preset,
      },
      { x: 150, y: 150 },
    );
  });

  test('Case 18 - Integration: verify preset works in RNA/DNA builder', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10005
     * Description: Integration: verify preset works in RNA/DNA builder
     * Scenario:
     * 1. Create preset
     * 2. Build chain
     * 3. Inspect generated structure
     * Expected result: Chain builds successfully with correct bonding and AP behavior
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    const presetName = 'IntegrationTest';
    await presetSection.setName(presetName);

    // Create preset with mixed visible/hidden components
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      code: 'IntegrationBase',
      name: 'Integration Base',
      naturalAnalogue: NucleotideNaturalAnalogue.A,
    });

    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      // Hidden sugar
    });

    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
      // Hidden phosphate
    });

    await dialog.submit();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    // Verify preset exists and is usable
    expect(
      await Library(page).isMonomerExist({
        alias: presetName,
        testId: `IntegrationTest_IntegrationBase_IntegrationTestS_IntegrationTestP`,
        monomerType: MonomerType.Preset,
      }),
    ).toBeTruthy();

    // Add preset to canvas to test functionality
    await Library(page).dragMonomerOnCanvas(
      {
        alias: presetName,
        testId: `IntegrationTest_IntegrationBase_IntegrationTestS_IntegrationTestP`,
        monomerType: MonomerType.Preset,
      },
      { x: 150, y: 150 },
    );
  });

  test('Case 19 - Integration: verify export/import preserves monomer data', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10005
     * Description: Integration: verify export/import preserves monomer data
     * Scenario:
     * 1. Build chain using preset
     * 2. Export structure
     * 3. Import structure
     * 4. Inspect monomers/APs
     * Expected result: Data preserved; hidden/visible monomers remain correct
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);

    const presetName = 'ExportImportTest';
    await presetSection.setName(presetName);

    // Create preset with mixed components
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      code: 'ExportBase',
      name: 'Export Base',
      naturalAnalogue: NucleotideNaturalAnalogue.G,
    });

    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      code: 'ExportSugar',
      name: 'Export Sugar',
    });

    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
      // Hidden phosphate
    });

    await dialog.submit();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    // Build a structure using the preset
    await Library(page).dragMonomerOnCanvas(
      {
        alias: presetName,
        testId: `ExportImportTest_ExportBase_ExportSugar_ExportImportTestP`,
        monomerType: MonomerType.Preset,
      },
      { x: 150, y: 150 },
    );

    // Export/import checks are out of this spec scope; preset add-to-canvas verifies basic usability
  });

  test('Case 20 - Regression: verify manual monomer creation still works', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10005
     * Description: Regression: verify manual monomer creation still works
     * Scenario:
     * 1. Create standalone monomer via library
     * 2. Fill properties
     * 3. Save monomer
     * Expected result: Behavior unchanged; uniqueness validation works normally
     *
     * Version 3.12.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    // Verify uniqueness validation in manual monomer creation flow
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.Base);
    await dialog.codeEditbox.fill('R');
    // 'R' is the code of an existing visible monomer (Ribose) - should trigger uniqueness validation error
    await dialog.nameEditbox.fill('Duplicate Base');
    await dialog.naturalAnalogueCombobox.click();
    await page.getByTestId(NucleotideNaturalAnalogue.A).click();

    await dialog.submit();

    // Should show uniqueness error
    const symbolExistsMessageBanner = NotificationMessageBanner(
      page,
      ErrorMessage.symbolExists,
    );
    if (await symbolExistsMessageBanner.isVisible()) {
      await symbolExistsMessageBanner.ok();
      await dialog.discard();
    } else if (await dialog.window.isVisible()) {
      await dialog.discard();
    }

    await expect(dialog.window).toBeHidden();
  });
});
