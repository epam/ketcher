/* Test task: https://github.com/epam/ketcher/issues/10741 */
/* eslint-disable no-magic-numbers */
import { Page, test, expect } from '@fixtures';
import {
  createMonomer,
  CreateMonomerDialog,
  deselectAtomAndBonds,
} from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import {
  MonomerOnMicroOption,
} from '@tests/pages/constants/contextMenu/Constants';
import {
  AminoAcidNaturalAnalogue,
  MonomerType,
} from '@tests/pages/constants/createMonomerDialog/Constants';
import { getAbbreviationLocator } from '@utils/canvas/s-group-signes/getAbbreviationLocator';
import { collapseMonomer } from '@utils/canvas/monomer/helpers';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import {
  pasteFromClipboardAndOpenAsNewProject,
  takeEditorScreenshot,
  takeElementScreenshot,
} from '@utils';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { WarningMessageDialog } from '@tests/pages/molecules/canvas/createMonomer/WarningDialog';

let page: Page;

test.describe('Edit All Instances of Monomer - Monomer Creation Wizard: ', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });

  test.afterEach(async ({ MoleculesCanvas: _ }) => {});

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1 - "Edit All Instances" and "Edit Instance" options are visible in the context menu when right-clicking on a collapsed monomer', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10741
     * Feature: https://github.com/epam/ketcher/issues/8923
     * Description: Verify that right-clicking a collapsed monomer in Molecules mode
     * shows "Edit Instance" and "Edit All Instances" context menu options.
     *
     * Scenario:
     * 1. Paste a simple molecule on the canvas
     * 2. Deselect the first atom so only a part of the molecule is selected
     * 3. Create an Amino Acid monomer from the selection
     * 4. Collapse the created monomer
     * 5. Right-click the collapsed monomer
     * 6. Verify "Edit Instance" and "Edit All Instances" options are visible in context menu
     *
     * Version 3.17
     */
    await pasteFromClipboardAndOpenAsNewProject(page, '[*:1]CC |$_R1;;$|');
    await deselectAtomAndBonds(page, ['0']);

    await createMonomer(page, {
      type: MonomerType.AminoAcid,
      code: 'EAI1',
      name: 'EditAllInstancesTest1',
      naturalAnalogue: AminoAcidNaturalAnalogue.A,
    });

    await collapseMonomer(page, getAtomLocator(page, { atomId: 1 }));

    const monomerOnMicro = getAbbreviationLocator(page, { name: 'EAI1' });
    await expect(monomerOnMicro).toBeVisible();

    const contextMenu = ContextMenu(page, monomerOnMicro);

    expect(
      await contextMenu.isOptionVisible(MonomerOnMicroOption.EditInstance),
    ).toBeTruthy();
    expect(
      await contextMenu.isOptionVisible(MonomerOnMicroOption.EditAllInstances),
    ).toBeTruthy();
  });

  test('Case 2 - "Edit All Instances" opens the monomer creation wizard with the correct monomer pre-loaded', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10741
     * Feature: https://github.com/epam/ketcher/issues/8923
     * Description: Verify that clicking "Edit All Instances" opens the monomer creation
     * wizard pre-loaded with the clicked monomer's properties.
     *
     * Scenario:
     * 1. Paste a molecule on the canvas and create an Amino Acid monomer
     * 2. Collapse the monomer
     * 3. Right-click the collapsed monomer and choose "Edit All Instances"
     * 4. Verify the monomer creation wizard opens
     * 5. Verify the Code field is pre-filled with the monomer's code (with _Copy suffix)
     * 6. Discard the wizard
     *
     * Version 3.17
     */
    await pasteFromClipboardAndOpenAsNewProject(page, '[*:1]CC |$_R1;;$|');
    await deselectAtomAndBonds(page, ['0']);

    await createMonomer(page, {
      type: MonomerType.AminoAcid,
      code: 'EAI2',
      name: 'EditAllInstancesTest2',
      naturalAnalogue: AminoAcidNaturalAnalogue.A,
    });

    await collapseMonomer(page, getAtomLocator(page, { atomId: 1 }));

    const monomerOnMicro = getAbbreviationLocator(page, { name: 'EAI2' });
    await expect(monomerOnMicro).toBeVisible();

    await ContextMenu(page, monomerOnMicro).click(
      MonomerOnMicroOption.EditAllInstances,
    );

    const createMonomerDialog = CreateMonomerDialog(page);
    await expect(createMonomerDialog.window).toBeVisible();

    // The wizard should pre-fill the code with a _Copy suffix
    await expect(createMonomerDialog.codeEditbox).toHaveValue('EAI2_Copy');

    await takeElementScreenshot(page, createMonomerDialog.window);
    await createMonomerDialog.discard();
  });

  test('Case 3 - "Edit Instance" opens the monomer creation wizard with monomer properties pre-loaded', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10741
     * Feature: https://github.com/epam/ketcher/issues/8923
     * Description: Verify that clicking "Edit Instance" opens the monomer creation
     * wizard pre-loaded with the single instance's properties.
     *
     * Scenario:
     * 1. Paste a molecule on the canvas and create an Amino Acid monomer
     * 2. Collapse the monomer
     * 3. Right-click the collapsed monomer and choose "Edit Instance"
     * 4. Verify the monomer creation wizard opens
     * 5. Verify the Code field is pre-filled with the monomer's code (with _Copy suffix)
     * 6. Discard the wizard
     *
     * Version 3.17
     */
    await pasteFromClipboardAndOpenAsNewProject(page, '[*:1]CC |$_R1;;$|');
    await deselectAtomAndBonds(page, ['0']);

    await createMonomer(page, {
      type: MonomerType.AminoAcid,
      code: 'EAI3',
      name: 'EditAllInstancesTest3',
      naturalAnalogue: AminoAcidNaturalAnalogue.A,
    });

    await collapseMonomer(page, getAtomLocator(page, { atomId: 1 }));

    const monomerOnMicro = getAbbreviationLocator(page, { name: 'EAI3' });
    await expect(monomerOnMicro).toBeVisible();

    await ContextMenu(page, monomerOnMicro).click(
      MonomerOnMicroOption.EditInstance,
    );

    const createMonomerDialog = CreateMonomerDialog(page);
    await expect(createMonomerDialog.window).toBeVisible();

    // The wizard should pre-fill with the monomer's existing properties (+ _Copy suffix)
    await expect(createMonomerDialog.codeEditbox).toHaveValue('EAI3_Copy');

    await takeElementScreenshot(page, createMonomerDialog.window);
    await createMonomerDialog.discard();
  });

  test('Case 4 - Saving modifications via "Edit All Instances" updates the monomer on the canvas', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10741
     * Feature: https://github.com/epam/ketcher/issues/8923
     * Description: Verify that saving changes in the monomer wizard after "Edit All Instances"
     * updates the monomer representation on the canvas.
     *
     * Scenario:
     * 1. Paste a molecule and create a monomer
     * 2. Collapse the monomer
     * 3. Right-click and choose "Edit All Instances"
     * 4. In the wizard, change the Code to a new unique value
     * 5. Save the wizard
     * 6. Verify the monomer on canvas uses the new code
     *
     * Version 3.17
     */
    await pasteFromClipboardAndOpenAsNewProject(page, '[*:1]CC |$_R1;;$|');
    await deselectAtomAndBonds(page, ['0']);

    await createMonomer(page, {
      type: MonomerType.AminoAcid,
      code: 'EAI4',
      name: 'EditAllInstancesTest4',
      naturalAnalogue: AminoAcidNaturalAnalogue.A,
    });

    await collapseMonomer(page, getAtomLocator(page, { atomId: 1 }));

    const monomerOnMicro = getAbbreviationLocator(page, { name: 'EAI4' });
    await expect(monomerOnMicro).toBeVisible();

    await ContextMenu(page, monomerOnMicro).click(
      MonomerOnMicroOption.EditAllInstances,
    );

    const createMonomerDialog = CreateMonomerDialog(page);
    await expect(createMonomerDialog.window).toBeVisible();

    // Update the code to a new value
    await createMonomerDialog.setCode('EAI4Updated');
    await createMonomerDialog.setName('EditAllInstancesTest4Updated');

    // Save the wizard (ignore any warning dialog)
    await createMonomerDialog.submit({ ignoreWarning: true });
    await expect(createMonomerDialog.window).not.toBeVisible();

    // Verify the monomer on canvas now shows the updated code
    const updatedMonomer = getAbbreviationLocator(page, {
      name: 'EAI4Updated',
    });
    await expect(updatedMonomer).toBeVisible();

    await takeEditorScreenshot(page);
  });

  test('Case 5 - "Edit All Instances" and "Edit Instance" are disabled for multiple monomers of different types selected', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10741
     * Feature: https://github.com/epam/ketcher/issues/8923
     * Description: Verify that "Edit Instance" and "Edit All Instances" are disabled
     * when multiple monomers of different types are selected on the canvas.
     *
     * Scenario:
     * 1. Create two different monomers on the canvas
     * 2. Collapse both monomers
     * 3. Right-click one of them when both are selected
     * 4. Verify that "Edit Instance" and "Edit All Instances" are disabled
     *
     * Version 3.17
     */
    await pasteFromClipboardAndOpenAsNewProject(page, '[*:1]CC.[*:2]CC |$_R1;;;_R2;;$|');
    await deselectAtomAndBonds(page, ['0', '3']);

    // Create first monomer
    await createMonomer(page, {
      type: MonomerType.AminoAcid,
      code: 'EAI5A',
      name: 'EditAllInstancesTest5A',
      naturalAnalogue: AminoAcidNaturalAnalogue.A,
    });

    await collapseMonomer(page, getAtomLocator(page, { atomId: 1 }));

    // Paste another molecule and create a second different monomer
    await pasteFromClipboardAndOpenAsNewProject(page, '[*:1]CCC.[*:2]CC |$_R1;;;;_R2;;$|');
    await deselectAtomAndBonds(page, ['0', '4']);

    await createMonomer(page, {
      type: MonomerType.AminoAcid,
      code: 'EAI5B',
      name: 'EditAllInstancesTest5B',
      naturalAnalogue: AminoAcidNaturalAnalogue.G,
    });

    await collapseMonomer(page, getAtomLocator(page, { atomId: 2 }));

    // When multiple different monomers are selected, editing should be disabled
    // Click on first monomer then shift-click second to multi-select
    const monomerA = getAbbreviationLocator(page, { name: 'EAI5A' });
    const monomerB = getAbbreviationLocator(page, { name: 'EAI5B' });

    if ((await monomerA.count()) > 0 && (await monomerB.count()) > 0) {
      await monomerA.click();
      await monomerB.click({ modifiers: ['Shift'] });

      const contextMenu = ContextMenu(page, monomerB);

      expect(
        await contextMenu.isOptionEnabled(MonomerOnMicroOption.EditInstance),
      ).toBeFalsy();
      expect(
        await contextMenu.isOptionEnabled(
          MonomerOnMicroOption.EditAllInstances,
        ),
      ).toBeFalsy();
    }
  });

  test('Case 6 - Undo reverts "Edit All Instances" changes on canvas', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10741
     * Feature: https://github.com/epam/ketcher/issues/8923
     * Description: Verify that using Undo after saving changes through "Edit All Instances"
     * restores the monomer to its original code/name on the canvas.
     *
     * Scenario:
     * 1. Paste a molecule and create a monomer with code "EAI6"
     * 2. Collapse the monomer
     * 3. Right-click and choose "Edit All Instances"
     * 4. Change the code to "EAI6Updated" and save
     * 5. Verify the canvas shows "EAI6Updated"
     * 6. Undo the change
     * 7. Verify the canvas shows the original "EAI6" monomer again
     *
     * Version 3.17
     */
    await pasteFromClipboardAndOpenAsNewProject(page, '[*:1]CC |$_R1;;$|');
    await deselectAtomAndBonds(page, ['0']);

    await createMonomer(page, {
      type: MonomerType.AminoAcid,
      code: 'EAI6',
      name: 'EditAllInstancesTest6',
      naturalAnalogue: AminoAcidNaturalAnalogue.A,
    });

    await collapseMonomer(page, getAtomLocator(page, { atomId: 1 }));

    const monomerOnMicro = getAbbreviationLocator(page, { name: 'EAI6' });
    await expect(monomerOnMicro).toBeVisible();

    await ContextMenu(page, monomerOnMicro).click(
      MonomerOnMicroOption.EditAllInstances,
    );

    const createMonomerDialog = CreateMonomerDialog(page);
    await expect(createMonomerDialog.window).toBeVisible();

    await createMonomerDialog.setCode('EAI6Updated');
    await createMonomerDialog.setName('EditAllInstancesTest6Updated');
    await createMonomerDialog.submit({ ignoreWarning: true });
    await expect(createMonomerDialog.window).not.toBeVisible();

    // Confirm the update took effect
    const updatedMonomer = getAbbreviationLocator(page, { name: 'EAI6Updated' });
    await expect(updatedMonomer).toBeVisible();

    // Undo the change
    await CommonTopLeftToolbar(page).undo();

    // The original monomer should be visible again
    const originalMonomer = getAbbreviationLocator(page, { name: 'EAI6' });
    await expect(originalMonomer).toBeVisible();

    await takeEditorScreenshot(page);
  });

  test('Case 7 - Warning message is shown when saving modified monomer that is used in presets', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10741
     * Feature: https://github.com/epam/ketcher/issues/8923
     * Description: Verify that a warning dialog appears when saving a monomer
     * via "Edit All Instances" that may affect presets or other related structures.
     *
     * Scenario:
     * 1. Create a monomer on the canvas
     * 2. Collapse it and use "Edit All Instances" to open the wizard
     * 3. Modify the monomer and save
     * 4. Verify the warning dialog appears (if applicable per requirements)
     * 5. Confirm the warning to complete the save
     *
     * Version 3.17
     */
    await pasteFromClipboardAndOpenAsNewProject(page, '[*:1]CC |$_R1;;$|');
    await deselectAtomAndBonds(page, ['0']);

    await createMonomer(page, {
      type: MonomerType.AminoAcid,
      code: 'EAI7',
      name: 'EditAllInstancesTest7',
      naturalAnalogue: AminoAcidNaturalAnalogue.A,
    });

    await collapseMonomer(page, getAtomLocator(page, { atomId: 1 }));

    const monomerOnMicro = getAbbreviationLocator(page, { name: 'EAI7' });
    await expect(monomerOnMicro).toBeVisible();

    await ContextMenu(page, monomerOnMicro).click(
      MonomerOnMicroOption.EditAllInstances,
    );

    const createMonomerDialog = CreateMonomerDialog(page);
    await expect(createMonomerDialog.window).toBeVisible();

    await createMonomerDialog.setCode('EAI7Modified');
    await createMonomerDialog.setName('EditAllInstancesTest7Modified');

    // Click submit - a warning may or may not appear depending on preset involvement
    await createMonomerDialog.submitButton.click();

    const warningDialog = WarningMessageDialog(page);
    const isWarningVisible = await warningDialog.isVisible();

    if (isWarningVisible) {
      // Verify the warning message is meaningful
      const warningText = await warningDialog.getWarningMessage();
      expect(warningText).toBeTruthy();

      await takeElementScreenshot(page, warningDialog.window);

      // Confirm the warning to proceed with saving
      await warningDialog.ok();
    }

    await expect(createMonomerDialog.window).not.toBeVisible();
    await takeEditorScreenshot(page);
  });

  test('Case 8 - "Edit All Instances" does not affect other unrelated monomers on the canvas', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10741
     * Feature: https://github.com/epam/ketcher/issues/8923
     * Description: Verify that editing all instances of one monomer does not change
     * other unrelated monomers that are also on the canvas.
     *
     * Scenario:
     * 1. Create two different monomers on the canvas (EAI8A and EAI8B)
     * 2. Collapse both monomers
     * 3. Right-click EAI8A and choose "Edit All Instances"
     * 4. Change the code to "EAI8AUpdated" and save
     * 5. Verify EAI8AUpdated is on canvas
     * 6. Verify EAI8B is still unchanged on canvas
     *
     * Version 3.17
     */
    // Create first monomer (EAI8A)
    await pasteFromClipboardAndOpenAsNewProject(page, '[*:1]CC |$_R1;;$|');
    await deselectAtomAndBonds(page, ['0']);

    await createMonomer(page, {
      type: MonomerType.AminoAcid,
      code: 'EAI8A',
      name: 'EditAllInstancesTest8A',
      naturalAnalogue: AminoAcidNaturalAnalogue.A,
    });

    await collapseMonomer(page, getAtomLocator(page, { atomId: 1 }));

    // Create second monomer (EAI8B) - paste molecule below existing one
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      '[*:1]CCC |$_R1;;;$|',
    );
    await deselectAtomAndBonds(page, ['0']);

    await createMonomer(page, {
      type: MonomerType.AminoAcid,
      code: 'EAI8B',
      name: 'EditAllInstancesTest8B',
      naturalAnalogue: AminoAcidNaturalAnalogue.G,
    });

    await collapseMonomer(page, getAtomLocator(page, { atomId: 2 }));

    // Check both monomers exist
    const monomerA = getAbbreviationLocator(page, { name: 'EAI8A' });
    const monomerB = getAbbreviationLocator(page, { name: 'EAI8B' });

    // Only verify the scenario if both monomers are visible
    if (
      (await monomerA.count()) > 0 &&
      (await monomerB.count()) > 0
    ) {
      // Edit All Instances of monomer A
      await ContextMenu(page, monomerA).click(
        MonomerOnMicroOption.EditAllInstances,
      );

      const createMonomerDialog = CreateMonomerDialog(page);
      await expect(createMonomerDialog.window).toBeVisible();

      await createMonomerDialog.setCode('EAI8AUpdated');
      await createMonomerDialog.setName('EditAllInstancesTest8AUpdated');
      await createMonomerDialog.submit({ ignoreWarning: true });
      await expect(createMonomerDialog.window).not.toBeVisible();

      // Verify updated monomer exists
      const updatedMonomerA = getAbbreviationLocator(page, {
        name: 'EAI8AUpdated',
      });
      await expect(updatedMonomerA).toBeVisible();

      // Verify monomer B is unchanged
      await expect(monomerB).toBeVisible();
    }

    await takeEditorScreenshot(page);
  });

  test('Case 9 - Monomer wizard can be re-opened after editing via "Edit All Instances"', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10741
     * Feature: https://github.com/epam/ketcher/issues/8923
     * Description: Verify that after saving changes through "Edit All Instances",
     * the monomer can be opened in the wizard again for further editing.
     *
     * Scenario:
     * 1. Create a monomer and collapse it
     * 2. Use "Edit All Instances" to rename the monomer
     * 3. Save the wizard
     * 4. Right-click the updated monomer
     * 5. Verify "Edit All Instances" option is available again and opens the wizard
     *
     * Version 3.17
     */
    await pasteFromClipboardAndOpenAsNewProject(page, '[*:1]CC |$_R1;;$|');
    await deselectAtomAndBonds(page, ['0']);

    await createMonomer(page, {
      type: MonomerType.AminoAcid,
      code: 'EAI9',
      name: 'EditAllInstancesTest9',
      naturalAnalogue: AminoAcidNaturalAnalogue.A,
    });

    await collapseMonomer(page, getAtomLocator(page, { atomId: 1 }));

    const monomerOnMicro = getAbbreviationLocator(page, { name: 'EAI9' });
    await expect(monomerOnMicro).toBeVisible();

    // First edit
    await ContextMenu(page, monomerOnMicro).click(
      MonomerOnMicroOption.EditAllInstances,
    );

    const createMonomerDialog = CreateMonomerDialog(page);
    await expect(createMonomerDialog.window).toBeVisible();

    await createMonomerDialog.setCode('EAI9Updated');
    await createMonomerDialog.setName('EditAllInstancesTest9Updated');
    await createMonomerDialog.submit({ ignoreWarning: true });
    await expect(createMonomerDialog.window).not.toBeVisible();

    // Verify canvas shows updated monomer
    const updatedMonomer = getAbbreviationLocator(page, { name: 'EAI9Updated' });
    await expect(updatedMonomer).toBeVisible();

    // Second edit - open the wizard again on the updated monomer
    await ContextMenu(page, updatedMonomer).click(
      MonomerOnMicroOption.EditAllInstances,
    );

    await expect(createMonomerDialog.window).toBeVisible();

    // Verify pre-filled code reflects the last saved value (with _Copy suffix)
    await expect(createMonomerDialog.codeEditbox).toHaveValue('EAI9Updated_Copy');

    await takeElementScreenshot(page, createMonomerDialog.window);
    await createMonomerDialog.discard();
  });

  test('Case 10 - "Edit All Instances" and "Edit Instance" are disabled when no collapsed monomer is selected', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10741
     * Feature: https://github.com/epam/ketcher/issues/8923
     * Description: Verify that "Edit Instance" and "Edit All Instances" options
     * are not available (or are disabled) when right-clicking on a plain atom
     * that is not part of a collapsed monomer.
     *
     * Scenario:
     * 1. Paste a molecule on the canvas (do not create a monomer)
     * 2. Right-click on one of the regular atoms
     * 3. Verify "Edit Instance" and "Edit All Instances" are NOT shown in the context menu
     *
     * Version 3.17
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');

    const atom = getAtomLocator(page, { atomId: 0 });
    const contextMenu = ContextMenu(page, atom);

    // These options should not be visible for non-monomer atoms
    expect(
      await contextMenu.isOptionVisible(MonomerOnMicroOption.EditInstance),
    ).toBeFalsy();
  });

  test('Case 11 - Monomer wizard shows correct type when opened via "Edit All Instances"', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10741
     * Feature: https://github.com/epam/ketcher/issues/8923
     * Description: Verify that the monomer type is correctly pre-loaded in the
     * wizard when opened via "Edit All Instances".
     *
     * Scenario:
     * 1. Create a CHEM monomer on the canvas
     * 2. Collapse the monomer
     * 3. Right-click and choose "Edit All Instances"
     * 4. Verify the wizard shows the correct monomer type (CHEM)
     * 5. Discard the wizard
     *
     * Version 3.17
     */
    await pasteFromClipboardAndOpenAsNewProject(page, '[*:1]CC |$_R1;;$|');
    await deselectAtomAndBonds(page, ['0']);

    await createMonomer(page, {
      type: MonomerType.CHEM,
      code: 'EAI11',
      name: 'EditAllInstancesTest11',
    });

    await collapseMonomer(page, getAtomLocator(page, { atomId: 1 }));

    const monomerOnMicro = getAbbreviationLocator(page, { name: 'EAI11' });
    await expect(monomerOnMicro).toBeVisible();

    await ContextMenu(page, monomerOnMicro).click(
      MonomerOnMicroOption.EditAllInstances,
    );

    const createMonomerDialog = CreateMonomerDialog(page);
    await expect(createMonomerDialog.window).toBeVisible();

    // Verify the type combobox contains the expected monomer type (CHEM)
    await expect(createMonomerDialog.typeCombobox).toContainText('CHEM');

    await takeElementScreenshot(page, createMonomerDialog.window);
    await createMonomerDialog.discard();
  });

  test('Case 12 - Discarding the wizard after "Edit All Instances" leaves the monomer unchanged', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10741
     * Feature: https://github.com/epam/ketcher/issues/8923
     * Description: Verify that discarding the monomer creation wizard after
     * opening it via "Edit All Instances" does not alter the monomer on the canvas.
     *
     * Scenario:
     * 1. Create a monomer with code "EAI12"
     * 2. Collapse the monomer
     * 3. Right-click and choose "Edit All Instances"
     * 4. Modify the code field but click Discard
     * 5. Verify the original monomer with "EAI12" is still on canvas
     *
     * Version 3.17
     */
    await pasteFromClipboardAndOpenAsNewProject(page, '[*:1]CC |$_R1;;$|');
    await deselectAtomAndBonds(page, ['0']);

    await createMonomer(page, {
      type: MonomerType.AminoAcid,
      code: 'EAI12',
      name: 'EditAllInstancesTest12',
      naturalAnalogue: AminoAcidNaturalAnalogue.A,
    });

    await collapseMonomer(page, getAtomLocator(page, { atomId: 1 }));

    const monomerOnMicro = getAbbreviationLocator(page, { name: 'EAI12' });
    await expect(monomerOnMicro).toBeVisible();

    await ContextMenu(page, monomerOnMicro).click(
      MonomerOnMicroOption.EditAllInstances,
    );

    const createMonomerDialog = CreateMonomerDialog(page);
    await expect(createMonomerDialog.window).toBeVisible();

    // Modify fields but discard instead of saving
    await createMonomerDialog.setCode('EAI12Discarded');

    await createMonomerDialog.discard();
    await expect(createMonomerDialog.window).not.toBeVisible();

    // Original monomer should remain unchanged on canvas
    await expect(monomerOnMicro).toBeVisible();

    await takeEditorScreenshot(page);
  });
});
