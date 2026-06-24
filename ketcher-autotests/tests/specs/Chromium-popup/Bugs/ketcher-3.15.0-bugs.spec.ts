/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */

import { expect, Page, test } from '@fixtures';
import {
  clickOnCanvas,
  dragMouseTo,
  openFileAndAddToCanvasAsNewProject,
  pasteFromClipboardAndOpenAsNewProject,
  selectAllStructuresOnCanvas,
  takeEditorScreenshot,
} from '@utils';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import {
  CreateMonomerDialog,
  selectAtomAndBonds,
} from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import { MonomerType } from '@tests/pages/constants/createMonomerDialog/Constants';
import { NucleotidePresetSection } from '@tests/pages/molecules/canvas/createMonomer/NucleotidePresetSection';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { MonomerWizardOption } from '@tests/pages/constants/contextMenu/Constants';
import { ConfirmationMessageDialog } from '@tests/pages/molecules/canvas/ConfirmationMessageDialog';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';

let page: Page;

test.describe('Bugs: ketcher-3.15.0', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });

  test.afterEach(async ({ MoleculesCanvas: _ }) => {});

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1: It is not possible to save only the sugar and phosphate in the Nucleotide (preset) type', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9962
     * Bug: https://github.com/epam/ketcher/issues/9130
     * Version: 3.15.0
     * Description:
     * System should allow creation of Nucleotide (preset) type monomers with only
     * sugar and phosphate components. Previously, the system would reject this with
     * an error: "Structure of rna preset component contains issues. Please adjust the structure."
     * Valid preset combinations: sugar+base, sugar+phosphate, sugar+base+phosphate
     *
     * Scenario:
     * 1. Go to Molecules mode (clean canvas)
     * 2. Add SMILES: CCCCCC to canvas
     * 3. Open Create monomer dialog
     * 4. Select Nucleotide (preset) type
     * 5. Add preset name
     * 6. Select half of the structure and mark as Sugar
     * 7. Select the other half and mark as Phosphate
     * 8. Submit the monomer creation
     *
     * Expected Result:
     * - Preset is created successfully without errors
     * - Sugar+Phosphate preset combination is accepted
     */

    // Step 1-2: Add SMILES to canvas
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    // Step 3: Click Create monomer button
    await LeftToolbar(page).createMonomer();

    // Step 4: Choose Nucleotide (preset) type on the Attributes panel
    const dialog = CreateMonomerDialog(page);
    const presetSection = NucleotidePresetSection(page);
    await dialog.selectType(MonomerType.NucleotidePreset);

    // Step 5: Add name for Preset
    await presetSection.setName('TestPreset_S_P');

    await CommonLeftToolbar(page).handTool();
    await page.mouse.move(600, 200);
    await dragMouseTo(page, 450, 250);

    // Step 6: Select first half of structure and mark as Sugar
    await presetSection.setupSugar({
      atomIds: [0, 1, 2],
      bondIds: [0, 1],
    });

    // Step 7: Select second half of structure and mark as Phosphate
    await presetSection.setupPhosphate({
      atomIds: [3, 4, 5],
      bondIds: [3, 4],
    });

    // Step 8: Submit and verify successful creation
    const monomerCreationWizard = page.locator(
      '[data-testid="monomer-creation-wizard"]',
    );

    await dialog.submit();

    await expect(monomerCreationWizard).toBeHidden();
  });

  test('Case 2: The "Mark as a..." option is displayed after switching to another type in the Attributes panel', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9962
     * Bug: https://github.com/epam/ketcher/issues/9132
     * Version: 3.15.0
     * Description:
     * The "Mark as a..." context menu option should only be visible for Nucleotide (preset) type.
     * When switching to other monomer types (e.g., Base), the "Mark as a..." option should not appear
     * in the context menu, as it's only applicable for preset type monomers.
     *
     * Scenario:
     * 1. Go to Molecules mode (clean canvas)
     * 2. Add SMILES: C(C)CC(C)CCCC(C)CCC to canvas
     * 3. Open Create monomer dialog
     * 4. Select Nucleotide (preset) type
     * 5. Switch to Base type in the dialog
     * 6. Confirm the type change (click Yes in modal)
     * 7. Select part of the molecule
     * 8. Open context menu on the selection
     *
     * Expected Result:
     * - "Mark as a..." option is NOT visible in the context menu for Base type
     * - Context menu appears without the "Mark as a..." option
     */

    // Step 1-2: Add SMILES to canvas
    await pasteFromClipboardAndOpenAsNewProject(page, 'C(C)CC(C)CCCC(C)CCC');

    // Step 3: Click Create monomer button
    await LeftToolbar(page).createMonomer();

    // Step 4: Choose Nucleotide (preset) type
    const dialog = CreateMonomerDialog(page);
    await dialog.selectType(MonomerType.NucleotidePreset);

    // Step 5: Switch to Base type
    await dialog.selectType(MonomerType.Base);

    // Step 6: Confirm the type change in modal
    const confirmDialog = ConfirmationMessageDialog(page);
    if (await confirmDialog.isVisible()) {
      await confirmDialog.ok();
    }

    // Step 7: Select part of the molecule
    await CommonLeftToolbar(page).handTool();
    await page.mouse.move(600, 200);
    await dragMouseTo(page, 450, 250);
    await selectAtomAndBonds(page, {
      atomIds: [4, 5, 6, 7, 8, 9],
      bondIds: [3, 4, 5, 6, 7, 8],
    });

    const targetAtom = getAtomLocator(page, { atomId: 6 });

    // Check "Mark as..." options are NOT visible
    expect(
      await ContextMenu(page, targetAtom).isOptionVisible(
        MonomerWizardOption.MarkAs,
      ),
    ).toBe(false);
    await dialog.discard();
  });

  test('Case 3: Structure selection after moving the entire Structure is incorrect', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9962
     * Bug: https://github.com/epam/ketcher/issues/9140
     * Version: 3.15.0
     * Description:
     * After moving an entire structure on the canvas, the selection is displayed inaccurately
     *
     * Scenario:
     * 1. Go to Molecules mode (clean canvas)
     * 2. Open KET file with Structure with ONE monomer
     * 3. Select part of the structure
     * 4. Select the entire structure and move it to a new position (for example, move it 100 pixels to the left)
     * 5. Try to select the same part of the structure again
     *
     * Expected Result:
     * The selection after moving the entire structure should be displayed in the same way like it was before moving.
     */

    // Step 1-2: Load a KET file and add to canvas
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Chromium-popup/Bugs/ketcher-3.15.0-bugs/structure selection after moving the entire structure is incorrect.ket',
    );

    // Step 3: Select part of the structure
    await CommonLeftToolbar(page).areaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await page.mouse.move(370, 140);
    await dragMouseTo(page, 550, 300);

    // Step 4: Select entire structure and move it
    await selectAllStructuresOnCanvas(page);
    await getAtomLocator(page, { atomId: 8 }).click({
      force: true,
    });

    await dragMouseTo(page, 640, 250);

    // Step 5: Try to select the same part again
    await clickOnCanvas(page, 200, 200);
    await CommonLeftToolbar(page).areaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await page.mouse.move(670, 200);
    await dragMouseTo(page, 850, 410);

    await takeEditorScreenshot(page);
  });
});
