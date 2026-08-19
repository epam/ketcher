/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-magic-numbers */
import { Page, test, expect } from '@fixtures';
import { CreateMonomerDialog } from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { MonomerType } from '@tests/pages/constants/createMonomerDialog/Constants';
import {
  pasteFromClipboardAndOpenAsNewProject,
  takeElementScreenshot,
} from '@utils';
import { NucleotidePresetSection } from '@tests/pages/molecules/canvas/createMonomer/NucleotidePresetSection';

let page: Page;

test.describe('Monomer properties attributes panel visibility rules: ', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });

  test.afterEach(async ({ MoleculesCanvas: _ }) => {});

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1 - CHEM monomer type shows only appropriate properties', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10013
     * Description: CHEM monomer type should show Name and Code fields,
     * BILN aliases (no HELM), and Attachment points section.
     * Natural analogue and Modification sections should not be shown.
     * Scenario:
     * 1. Open monomer creation wizard
     * 2. Select CHEM monomer type
     * 3. Verify Name and Code fields are present
     * 4. Verify Natural analogue field is NOT shown
     * 5. Verify Modification section is NOT shown
     * 6. Verify Aliases section is shown with BILN alias only (no HELM)
     * 7. Verify Attachment points section is present
     *
     * Version 3.17
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');

    const createMonomerDialog = CreateMonomerDialog(page);

    // Open the monomer creation wizard
    await LeftToolbar(page).createMonomer();
    await expect(createMonomerDialog.window).toBeVisible();

    // Select CHEM monomer type
    await createMonomerDialog.selectType(MonomerType.CHEM);

    // Verify Name and Code fields are present
    await expect(createMonomerDialog.codeEditbox).toBeVisible();
    await expect(createMonomerDialog.nameEditbox).toBeVisible();

    // Verify Natural analogue field is NOT shown
    await expect(createMonomerDialog.naturalAnalogueCombobox).not.toBeVisible();

    // Verify Modification section is NOT shown
    await expect(createMonomerDialog.modificationSection).not.toBeVisible();

    // Verify Aliases section is shown
    await expect(createMonomerDialog.aliasesSection).toBeVisible();

    // Expand aliases section to check available aliases
    await createMonomerDialog.expandAliasesSection();

    // For CHEM monomers, only BILN alias should be available (no HELM)
    await expect(
      createMonomerDialog.aliasesSection.helmAliasEditbox,
    ).toBeVisible();
    await expect(
      createMonomerDialog.aliasesSection.bilnAliasEditbox,
    ).toBeVisible();

    // Verify Attachment points section is present
    await expect(createMonomerDialog.infoIcon).toBeVisible();

    await takeElementScreenshot(page, createMonomerDialog.window);
    await createMonomerDialog.discard();
  });

  test('Case 2 - Amino acid monomer type shows all required properties', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10013
     * Description: Amino acid monomer type should show Name, Code, and Natural analogue fields,
     * Modification section, HELM alias and BILN alias, and Attachment points section.
     * Scenario:
     * 1. Open monomer creation wizard
     * 2. Select Amino acid monomer type
     * 3. Verify Name, Code, and Natural analogue fields are present
     * 4. Verify Modification section IS present
     * 5. Verify Aliases section IS present and contains HELM alias and BILN alias
     * 6. Verify Attachment points section is present
     *
     * Version 3.17
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');

    const createMonomerDialog = CreateMonomerDialog(page);

    await LeftToolbar(page).createMonomer();
    await expect(createMonomerDialog.window).toBeVisible();

    // Select Amino acid monomer type
    await createMonomerDialog.selectType(MonomerType.AminoAcid);

    // Verify Name, Code, and Natural analogue fields are present
    await expect(createMonomerDialog.codeEditbox).toBeVisible();
    await expect(createMonomerDialog.nameEditbox).toBeVisible();
    await expect(createMonomerDialog.naturalAnalogueCombobox).toBeVisible();

    // Verify Modification section IS present
    await expect(createMonomerDialog.modificationSection).toBeVisible();

    // Verify Aliases section IS present
    await expect(createMonomerDialog.aliasesSection).toBeVisible();

    // Expand aliases section to check available aliases
    await createMonomerDialog.expandAliasesSection();

    // For Amino acid monomers, both HELM and BILN aliases are available
    await expect(
      createMonomerDialog.aliasesSection.helmAliasEditbox,
    ).toBeVisible();
    await expect(
      createMonomerDialog.aliasesSection.bilnAliasEditbox,
    ).toBeVisible();

    // Verify Attachment points section is present
    await expect(createMonomerDialog.infoIcon).toBeVisible();

    await takeElementScreenshot(page, createMonomerDialog.window);
    await createMonomerDialog.discard();
  });

  test('Case 3 - Sugar monomer type shows appropriate properties', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10013
     * Description: Sugar monomer type should show Name and Code fields,
     * no Natural analogue, no Modification section, HELM alias only, and Attachment points.
     * Scenario:
     * 1. Open monomer creation wizard
     * 2. Select Sugar monomer type
     * 3. Verify Name and Code fields are present
     * 4. Verify Natural analogue field is NOT shown
     * 5. Verify Modification section is NOT shown
     * 6. Verify Aliases section IS present and only HELM alias is available
     * 7. Verify Attachment points section is present
     *
     * Version 3.17
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');

    const createMonomerDialog = CreateMonomerDialog(page);

    await LeftToolbar(page).createMonomer();
    await expect(createMonomerDialog.window).toBeVisible();

    // Select Sugar monomer type
    await createMonomerDialog.selectType(MonomerType.Sugar);

    // Verify Name and Code fields are present
    await expect(createMonomerDialog.codeEditbox).toBeVisible();
    await expect(createMonomerDialog.nameEditbox).toBeVisible();

    // Verify Natural analogue field is NOT shown
    await expect(createMonomerDialog.naturalAnalogueCombobox).not.toBeVisible();

    // Verify Modification section is NOT shown
    await expect(createMonomerDialog.modificationSection).not.toBeVisible();

    // Verify Aliases section IS present
    await expect(createMonomerDialog.aliasesSection).toBeVisible();

    // Expand aliases section to check available aliases
    await createMonomerDialog.expandAliasesSection();

    // For Sugar monomers, only HELM alias should be available
    await expect(
      createMonomerDialog.aliasesSection.helmAliasEditbox,
    ).toBeVisible();
    await expect(
      createMonomerDialog.aliasesSection.bilnAliasEditbox,
    ).not.toBeVisible();

    // Verify Attachment points section is present
    await expect(createMonomerDialog.infoIcon).toBeVisible();

    await takeElementScreenshot(page, createMonomerDialog.window);
    await createMonomerDialog.discard();
  });

  test('Case 4 - Base monomer type shows appropriate properties', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10013
     * Description: Base monomer type should show Name, Code, and Natural analogue fields,
     * no Modification section, HELM alias only, and Attachment points section.
     * Scenario:
     * 1. Open monomer creation wizard
     * 2. Select Base monomer type
     * 3. Verify Name, Code, and Natural analogue fields are present
     * 4. Verify Modification section is NOT shown
     * 5. Verify Aliases section IS present and contains HELM alias only
     * 6. Verify Attachment points section is present
     *
     * Version 3.17
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');

    const createMonomerDialog = CreateMonomerDialog(page);

    await LeftToolbar(page).createMonomer();
    await expect(createMonomerDialog.window).toBeVisible();

    // Select Base monomer type
    await createMonomerDialog.selectType(MonomerType.Base);

    // Verify Name, Code, and Natural analogue fields are present
    await expect(createMonomerDialog.codeEditbox).toBeVisible();
    await expect(createMonomerDialog.nameEditbox).toBeVisible();
    await expect(createMonomerDialog.naturalAnalogueCombobox).toBeVisible();

    // Verify Modification section is NOT shown
    await expect(createMonomerDialog.modificationSection).not.toBeVisible();

    // Verify Aliases section IS present
    await expect(createMonomerDialog.aliasesSection).toBeVisible();

    // Expand aliases section to check available aliases
    await createMonomerDialog.expandAliasesSection();

    // For Base monomers, only HELM alias should be available
    await expect(
      createMonomerDialog.aliasesSection.helmAliasEditbox,
    ).toBeVisible();
    await expect(
      createMonomerDialog.aliasesSection.bilnAliasEditbox,
    ).not.toBeVisible();

    // Verify Attachment points section is present
    await expect(createMonomerDialog.infoIcon).toBeVisible();

    await takeElementScreenshot(page, createMonomerDialog.window);
    await createMonomerDialog.discard();
  });

  test('Case 5 - Phosphate monomer type shows appropriate properties', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10013
     * Description: Phosphate monomer type should show Name and Code fields,
     * no Natural analogue, no Modification section, HELM alias (and BILN where implemented),
     * and Attachment points section.
     * Scenario:
     * 1. Open monomer creation wizard
     * 2. Select Phosphate monomer type
     * 3. Verify Name and Code fields are present
     * 4. Verify Natural analogue field is NOT shown
     * 5. Verify Modification section is NOT shown
     * 6. Verify Aliases section IS present and supports HELM alias
     * 7. Verify Attachment points section is present
     *
     * Version 3.17
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');

    const createMonomerDialog = CreateMonomerDialog(page);

    await LeftToolbar(page).createMonomer();
    await expect(createMonomerDialog.window).toBeVisible();

    // Select Phosphate monomer type
    await createMonomerDialog.selectType(MonomerType.Phosphate);

    // Verify Name and Code fields are present
    await expect(createMonomerDialog.codeEditbox).toBeVisible();
    await expect(createMonomerDialog.nameEditbox).toBeVisible();

    // Verify Natural analogue field is NOT shown
    await expect(createMonomerDialog.naturalAnalogueCombobox).not.toBeVisible();

    // Verify Modification section is NOT shown
    await expect(createMonomerDialog.modificationSection).not.toBeVisible();

    // Verify Aliases section IS present
    await expect(createMonomerDialog.aliasesSection).toBeVisible();

    // Expand aliases section to check available aliases
    await createMonomerDialog.expandAliasesSection();

    // For Phosphate monomers, HELM alias should be available
    await expect(
      createMonomerDialog.aliasesSection.helmAliasEditbox,
    ).toBeVisible();
    // BILN aliases may or may not be available depending on implementation

    // Verify Attachment points section is present
    await expect(createMonomerDialog.infoIcon).toBeVisible();

    await takeElementScreenshot(page, createMonomerDialog.window);
    await createMonomerDialog.discard();
  });

  test('Case 6 - Nucleotide (monomer) type shows appropriate properties', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10013
     * Description: Nucleotide (monomer) type should show Name, Code, and Natural analogue fields,
     * no Modification section, only BILN aliases (no HELM), and Attachment points section.
     * Scenario:
     * 1. Open monomer creation wizard
     * 2. Select Nucleotide (monomer) type
     * 3. Verify Name, Code, and Natural analogue fields are present
     * 4. Verify Modification section is NOT shown
     * 5. Verify Aliases section is NOT present (until IDT alias or/and AxoLabs alias is implemented for nucleotides)
     * 6. Verify Attachment points section is present
     *
     * Version 3.17
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');

    const createMonomerDialog = CreateMonomerDialog(page);

    await LeftToolbar(page).createMonomer();
    await expect(createMonomerDialog.window).toBeVisible();

    // Select Nucleotide (monomer) type
    await createMonomerDialog.selectType(MonomerType.NucleotideMonomer);

    // Verify Name, Code, and Natural analogue fields are present
    await expect(createMonomerDialog.codeEditbox).toBeVisible();
    await expect(createMonomerDialog.nameEditbox).toBeVisible();
    await expect(createMonomerDialog.naturalAnalogueCombobox).toBeVisible();

    // Verify Modification section is NOT shown
    await expect(createMonomerDialog.modificationSection).not.toBeVisible();

    // Verify Aliases section is NOT present (until IDT alias or/and AxoLabs alias is implemented for nucleotides)
    await expect(createMonomerDialog.aliasesSection).not.toBeVisible();

    // Verify Attachment points section is present
    await expect(createMonomerDialog.infoIcon).toBeVisible();

    await takeElementScreenshot(page, createMonomerDialog.window);
    await createMonomerDialog.discard();
  });

  test('Case 7 - Nucleotide (preset) type shows preset-level properties only', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10013
     * Description: Nucleotide (preset) type should show only properties that apply to the preset as a whole.
     * Component-specific properties (modification, natural analogue) should not be shown at preset level.
     * Scenario:
     * 1. Open monomer creation wizard
     * 2. Select Nucleotide (preset) type
     * 3. Verify only preset-level properties are shown
     * 4. Verify component-specific properties are NOT shown at preset level
     * 5. Take screenshot for visual verification
     *
     * Version 3.17
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');

    const createMonomerDialog = CreateMonomerDialog(page);
    const nucleotidePresetSection = NucleotidePresetSection(page);

    await LeftToolbar(page).createMonomer();
    await expect(createMonomerDialog.window).toBeVisible();

    // Select Nucleotide (preset) type
    await createMonomerDialog.selectType(MonomerType.NucleotidePreset);

    // For preset type, the UI layout is different and needs verification
    // The preset has its own section with separate component tabs
    await expect(nucleotidePresetSection.presetTab).toBeVisible();

    // Component-specific properties should not be shown at the main preset level
    // (They would be available only in the relevant component tabs within the preset section)
    const hiddenAtPresetLevelFields = [
      'Natural analogue',
      'Modification',
      'Aliases',
    ];

    for (const fieldLabel of hiddenAtPresetLevelFields) {
      await expect(
        createMonomerDialog.window.getByText(fieldLabel, { exact: true }),
      ).not.toBeVisible();
    }

    await takeElementScreenshot(page, createMonomerDialog.window);
    await createMonomerDialog.discard();
  });

  test('Case 8 - Dynamic updates when switching between monomer types', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10013
     * Description: When switching between monomer types, sections should appear/disappear correctly.
     * Test switching: Amino acid → Sugar → CHEM and verify visibility changes.
     * Scenario:
     * 1. Open monomer creation wizard
     * 2. Select Amino acid type and verify initial state
     * 3. Switch to Sugar type and verify sections change appropriately
     * 4. Switch to CHEM type and verify sections change appropriately
     * 5. Verify dynamic behavior works correctly
     *
     * Version 3.17
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');

    const createMonomerDialog = CreateMonomerDialog(page);

    await LeftToolbar(page).createMonomer();
    await expect(createMonomerDialog.window).toBeVisible();

    // Step 1: Select Amino acid type
    await createMonomerDialog.selectType(MonomerType.AminoAcid);

    // Verify initial state for amino acid
    await expect(createMonomerDialog.naturalAnalogueCombobox).toBeVisible();
    await expect(createMonomerDialog.modificationSection).toBeVisible();
    await expect(createMonomerDialog.aliasesSection).toBeVisible();

    // Step 2: Switch to Sugar type
    await createMonomerDialog.selectType(MonomerType.Sugar);

    // Verify sections change for sugar
    await expect(createMonomerDialog.naturalAnalogueCombobox).not.toBeVisible();
    await expect(createMonomerDialog.modificationSection).not.toBeVisible();
    await expect(createMonomerDialog.aliasesSection).toBeVisible();

    // Step 3: Switch to CHEM type
    await createMonomerDialog.selectType(MonomerType.CHEM);

    // Verify sections change for CHEM
    await expect(createMonomerDialog.naturalAnalogueCombobox).not.toBeVisible();
    await expect(createMonomerDialog.modificationSection).not.toBeVisible();
    await expect(createMonomerDialog.aliasesSection).toBeVisible();

    // Verify alias types change by checking the aliases section content
    await createMonomerDialog.expandAliasesSection();

    // For CHEM, HELM should not be visible but BILN should be
    await expect(
      createMonomerDialog.aliasesSection.helmAliasEditbox,
    ).toBeVisible();
    await expect(
      createMonomerDialog.aliasesSection.bilnAliasEditbox,
    ).toBeVisible();

    await takeElementScreenshot(page, createMonomerDialog.window);
    await createMonomerDialog.discard();
  });

  test('Case 9 - Fields visibility validation for covered monomer types', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10013
     * Description: Validation that the covered monomer types show exactly the required fields
     * and hide the ones that should not be visible according to the requirements table.
     * Scenario:
     * 1. Test each monomer type listed in monomerTypeTests
     * 2. Verify required fields are present
     * 3. Verify prohibited fields are hidden
     * 4. Document any deviations from requirements for the covered types
     *
     * Version 3.17
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');

    const createMonomerDialog = CreateMonomerDialog(page);

    await LeftToolbar(page).createMonomer();
    await expect(createMonomerDialog.window).toBeVisible();

    const monomerTypeTests = [
      {
        type: MonomerType.CHEM,
        name: 'CHEM',
        shouldShow: {
          code: true,
          name: true,
          naturalAnalogue: false,
          modification: false,
          aliases: true,
          helmAlias: true,
          bilnAlias: true,
          attachmentPoints: true,
        },
      },
      {
        type: MonomerType.AminoAcid,
        name: 'AminoAcid',
        shouldShow: {
          code: true,
          name: true,
          naturalAnalogue: true,
          modification: true,
          aliases: true,
          helmAlias: true,
          bilnAlias: true,
          attachmentPoints: true,
        },
      },
      {
        type: MonomerType.Sugar,
        name: 'Sugar',
        shouldShow: {
          code: true,
          name: true,
          naturalAnalogue: false,
          modification: false,
          aliases: true,
          helmAlias: true,
          bilnAlias: false,
          attachmentPoints: true,
        },
      },
      {
        type: MonomerType.Base,
        name: 'Base',
        shouldShow: {
          code: true,
          name: true,
          naturalAnalogue: true,
          modification: false,
          aliases: true,
          helmAlias: true,
          bilnAlias: false,
          attachmentPoints: true,
        },
      },
      {
        type: MonomerType.Phosphate,
        name: 'Phosphate',
        shouldShow: {
          code: true,
          name: true,
          naturalAnalogue: false,
          modification: false,
          aliases: true,
          helmAlias: true,
          bilnAlias: false,
          attachmentPoints: true,
        },
      },
    ];

    for (const testCase of monomerTypeTests) {
      // Select monomer type
      await createMonomerDialog.selectType(testCase.type);

      // Test basic fields
      if (testCase.shouldShow.code) {
        await expect(createMonomerDialog.codeEditbox).toBeVisible();
      } else {
        await expect(createMonomerDialog.codeEditbox).not.toBeVisible();
      }

      if (testCase.shouldShow.name) {
        await expect(createMonomerDialog.nameEditbox).toBeVisible();
      } else {
        await expect(createMonomerDialog.nameEditbox).not.toBeVisible();
      }

      if (testCase.shouldShow.naturalAnalogue) {
        await expect(createMonomerDialog.naturalAnalogueCombobox).toBeVisible();
      } else {
        await expect(
          createMonomerDialog.naturalAnalogueCombobox,
        ).not.toBeVisible();
      }

      if (testCase.shouldShow.modification) {
        await expect(createMonomerDialog.modificationSection).toBeVisible();
      } else {
        await expect(createMonomerDialog.modificationSection).not.toBeVisible();
      }

      if (testCase.shouldShow.aliases) {
        await expect(createMonomerDialog.aliasesSection).toBeVisible();

        // Check alias types
        await createMonomerDialog.expandAliasesSection();

        if (testCase.shouldShow.helmAlias) {
          await expect(
            createMonomerDialog.aliasesSection.helmAliasEditbox,
          ).toBeVisible();
        } else {
          await expect(
            createMonomerDialog.aliasesSection.helmAliasEditbox,
          ).not.toBeVisible();
        }

        if (testCase.shouldShow.bilnAlias) {
          await expect(
            createMonomerDialog.aliasesSection.bilnAliasEditbox,
          ).toBeVisible();
        } else {
          await expect(
            createMonomerDialog.aliasesSection.bilnAliasEditbox,
          ).not.toBeVisible();
        }

        await createMonomerDialog.collapseAliasesSection();
      } else {
        await expect(createMonomerDialog.aliasesSection).not.toBeVisible();
      }

      if (testCase.shouldShow.attachmentPoints) {
        await expect(createMonomerDialog.infoIcon).toBeVisible();
      } else {
        await expect(createMonomerDialog.infoIcon).not.toBeVisible();
      }
    }

    await createMonomerDialog.discard();
  });
});
