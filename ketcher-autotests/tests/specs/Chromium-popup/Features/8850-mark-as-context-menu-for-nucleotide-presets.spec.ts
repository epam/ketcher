/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-magic-numbers */
import { expect, Page } from '@playwright/test';
import { test } from '@fixtures';
import {
  CreateMonomerDialog,
  selectAtomAndBonds,
} from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { MonomerType } from '@tests/pages/constants/createMonomerDialog/Constants';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { MonomerWizardOption } from '@tests/pages/constants/contextMenu/Constants';
import { clickOnCanvas, shiftCanvas } from '@utils/clicks';
import { takeElementScreenshot } from '@utils/canvas/helpers';
import { NucleotidePresetTab } from '@tests/pages/molecules/canvas/createMonomer/constants/nucleiotidePresetSection/Constants';
import { pasteFromClipboardAndOpenAsNewProject } from '@utils/files/readFile';

let page: Page;
let dialog: ReturnType<typeof CreateMonomerDialog>;

test.describe('Mark as... related cases: ', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
    dialog = CreateMonomerDialog(page);
  });

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

  test('Case 1 - Verify "Mark as a..." context menu option is available for Nucleotide (preset) with continuous selection', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10006
     * Description: Verify that "Mark as a..." context menu option is visible and enabled
     * for continuous selection when monomer type is "Nucleotide (preset)"
     *
     * Scenario:
     * 1. Open Monomer Creation Wizard
     * 2. Set monomer type to 'Nucleotide (preset)'
     * 3. On the canvas inside the wizard, select a continuous fragment intended as a preset component
     * 4. Right-click on the selection to open the context menu
     * 5. Expected result: 'Mark as a...' option is visible and enabled in the context menu
     *
     * Version 3.12
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerType.NucleotidePreset);

    // Select a continuous fragment (two connected atoms)
    await selectAtomAndBonds(page, { atomIds: [0, 1], bondIds: [0] });

    // Right-click to open context menu and verify "Mark as a..." is visible and enabled
    const contextMenu = ContextMenu(page, getAtomLocator(page, { atomId: 0 }));

    expect(
      await contextMenu.isOptionVisible(MonomerWizardOption.MarkAs),
    ).toBeTruthy();
    expect(
      await contextMenu.isOptionEnabled(MonomerWizardOption.MarkAs),
    ).toBeTruthy();

    await dialog.discard();
  });

  test('Case 2 - Verify "Mark as a..." is not visible for non-preset monomer types', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10006
     * Description: Verify that "Mark as a..." context menu option is NOT visible
     * for monomer types other than "Nucleotide (preset)"
     *
     * Scenario:
     * 1. Open Monomer Creation Wizard
     * 2. Set monomer type to a type other than 'Nucleotide (preset)' (e.g., 'CHEM')
     * 3. Select any continuous fragment on the canvas
     * 4. Right-click on the selection to open the context menu
     * 5. Expected result: Context menu does NOT contain the 'Mark as a...' option
     *
     * Version 3.12
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerType.CHEM);

    // Select a continuous fragment
    await selectAtomAndBonds(page, { atomIds: [0, 1], bondIds: [0] });

    // Verify "Mark as a..." is not visible for non-preset types
    const contextMenu = ContextMenu(page, getAtomLocator(page, { atomId: 0 }));
    expect(
      await contextMenu.isOptionVisible(MonomerWizardOption.MarkAs),
    ).toBeFalsy();

    await dialog.discard();
  });

  test('Case 3 - Verify "Mark as a..." context menu has Base, Sugar, and Phosphate sub-options', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10006
     * Description: Verify that "Mark as a..." context menu has proper submenu with
     * Base, Sugar, and Phosphate options
     *
     * Scenario:
     * 1. Open Monomer Creation Wizard
     * 2. Set monomer type to 'Nucleotide (preset)'
     * 3. Select a continuous fragment
     * 4. Right-click to open context menu
     * 5. Hover over 'Mark as a...' entry
     * 6. Expected result: A submenu appears with three options: 'Base', 'Sugar', and 'Phosphate'
     *
     * Version 3.12
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerType.NucleotidePreset);

    // Select a continuous fragment
    await selectAtomAndBonds(page, { atomIds: [0, 1], bondIds: [0] });

    // Right-click and hover over "Mark as a..." to reveal submenu
    const contextMenu = ContextMenu(page, getAtomLocator(page, { atomId: 0 }));
    await contextMenu.hover(MonomerWizardOption.MarkAs);

    // Verify submenu options are visible
    expect(
      await page.getByTestId(MonomerWizardOption.Base).isVisible(),
    ).toBeTruthy();
    expect(
      await page.getByTestId(MonomerWizardOption.Sugar).isVisible(),
    ).toBeTruthy();
    expect(
      await page.getByTestId(MonomerWizardOption.Phosphate).isVisible(),
    ).toBeTruthy();

    // Take screenshot of the submenu
    await takeElementScreenshot(page, dialog.window);

    // Close menu by pressing Escape
    await page.keyboard.press('Escape');
    await dialog.discard();
  });

  test('Case 4 - Verify "Mark as a..." is disabled for non-continuous selection', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10006
     * Description: Verify that "Mark as a..." context menu option is disabled
     * when selection is non-continuous (not connected fragments)
     *
     * Scenario:
     * 1. Open Monomer Creation Wizard
     * 2. Set monomer type to 'Nucleotide (preset)'
     * 3. Select two or more non-connected fragments (non-continuous selection)
     * 4. Right-click to open context menu
     * 5. Expected result: 'Mark as a...' entry is present but disabled (greyed out / not clickable)
     *
     * Version 3.12
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerType.NucleotidePreset);

    // Select non-continuous atoms (atoms 0 and 3 are not directly connected)
    await selectAtomAndBonds(page, { atomIds: [0, 3], bondIds: [] });

    // Verify "Mark as a..." is visible but disabled for non-continuous selection
    const contextMenu = ContextMenu(page, getAtomLocator(page, { atomId: 0 }));
    expect(
      await contextMenu.isOptionVisible(MonomerWizardOption.MarkAs),
    ).toBeTruthy();
    expect(
      await contextMenu.isOptionEnabled(MonomerWizardOption.MarkAs),
    ).toBeFalsy();

    // Take screenshot showing disabled state
    await contextMenu.open();
    await takeElementScreenshot(page, dialog.window);

    await page.keyboard.press('Escape');
    await dialog.discard();
  });

  test('Case 5 - Verify "Mark as a..." becomes enabled when switching back to continuous selection', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10006
     * Description: Verify that "Mark as a..." context menu option becomes enabled again
     * when switching from non-continuous to continuous selection
     *
     * Scenario:
     * 1. Open Monomer Creation Wizard with 'Nucleotide (preset)' type
     * 2. Select non-continuous fragments (verify "Mark as a..." is disabled)
     * 3. Clear the selection and select a continuous fragment
     * 4. Right-click to open context menu
     * 5. Expected result: 'Mark as a...' entry becomes enabled again
     *
     * Version 3.12
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerType.NucleotidePreset);

    // First select non-continuous atoms to verify disabled state
    await selectAtomAndBonds(page, { atomIds: [0, 3], bondIds: [] });
    const contextMenu1 = ContextMenu(page, getAtomLocator(page, { atomId: 0 }));
    expect(
      await contextMenu1.isOptionEnabled(MonomerWizardOption.MarkAs),
    ).toBeFalsy();

    // Clear selection by clicking on empty canvas
    await clickOnCanvas(page, 200, 200);

    // Now select continuous atoms
    await selectAtomAndBonds(page, { atomIds: [0, 1], bondIds: [0] });

    // Verify "Mark as a..." is now enabled
    const contextMenu2 = ContextMenu(page, getAtomLocator(page, { atomId: 0 }));
    expect(
      await contextMenu2.isOptionEnabled(MonomerWizardOption.MarkAs),
    ).toBeTruthy();

    await dialog.discard();
  });

  test('Case 6 - Verify marking a fragment as Base via context menu opens Base tab and assigns structure', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10006
     * Description: Verify that selecting "Mark as a... > Base" opens the Base tab
     * and assigns the selected structure to the Base component
     *
     * Scenario:
     * 1. Open Monomer Creation Wizard with 'Nucleotide (preset)' type
     * 2. Select a continuous fragment that should serve as Base
     * 3. Right-click and choose 'Mark as a... > Base'
     * 4. Observe wizard tabs and Base component section
     * 5. Expected result: Base tab becomes active/open; selected fragment is assigned as Base structure
     *
     * Version 3.12
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerType.NucleotidePreset);

    // Select a continuous fragment for Base
    await selectAtomAndBonds(page, { atomIds: [0, 1], bondIds: [0] });

    // Mark as Base via context menu
    const contextMenu = ContextMenu(page, getAtomLocator(page, { atomId: 0 }));
    await contextMenu.click([
      MonomerWizardOption.MarkAs,
      MonomerWizardOption.Base,
    ]);

    // Verify Base tab is now active and visible
    expect(
      await dialog.nucleotidePresetSection.isTabOpened(
        NucleotidePresetTab.Base,
      ),
    ).toBeTruthy();
    await expect(
      dialog.nucleotidePresetSection.baseTab.codeEditbox,
    ).toBeVisible();

    // Take screenshot of the Base tab
    await takeElementScreenshot(page, dialog.window);

    await dialog.discard();
  });

  test('Case 7 - Verify marking a fragment as Sugar via context menu opens Sugar tab and assigns structure', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10006
     * Description: Verify that selecting "Mark as a... > Sugar" opens the Sugar tab
     * and assigns the selected structure to the Sugar component
     *
     * Scenario:
     * 1. Open Monomer Creation Wizard with 'Nucleotide (preset)' type
     * 2. Select a continuous fragment that should serve as Sugar
     * 3. Right-click and choose 'Mark as a... > Sugar'
     * 4. Observe wizard tabs and Sugar component section
     * 5. Expected result: Sugar tab becomes active/open; selected fragment is assigned as Sugar structure
     *
     * Version 3.12
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerType.NucleotidePreset);

    // Select a continuous fragment for Sugar
    await selectAtomAndBonds(page, { atomIds: [2, 3], bondIds: [2] });

    // Mark as Sugar via context menu
    const contextMenu = ContextMenu(page, getAtomLocator(page, { atomId: 2 }));
    await contextMenu.click([
      MonomerWizardOption.MarkAs,
      MonomerWizardOption.Sugar,
    ]);

    // Verify Sugar tab is now active and visible
    expect(
      await dialog.nucleotidePresetSection.isTabOpened(
        NucleotidePresetTab.Sugar,
      ),
    ).toBeTruthy();
    await expect(
      dialog.nucleotidePresetSection.sugarTab.codeEditbox,
    ).toBeVisible();

    // Take screenshot of the Sugar tab
    await takeElementScreenshot(page, dialog.window);

    await dialog.discard();
  });

  test('Case 8 - Verify marking a fragment as Phosphate via context menu opens Phosphate tab and assigns structure', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10006
     * Description: Verify that selecting "Mark as a... > Phosphate" opens the Phosphate tab
     * and assigns the selected structure to the Phosphate component
     *
     * Scenario:
     * 1. Open Monomer Creation Wizard with 'Nucleotide (preset)' type
     * 2. Select a continuous fragment that should serve as Phosphate
     * 3. Right-click and choose 'Mark as a... > Phosphate'
     * 4. Observe wizard tabs and Phosphate component section
     * 5. Expected result: Phosphate tab becomes active/open; selected fragment is assigned as Phosphate structure
     *
     * Version 3.12
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerType.NucleotidePreset);

    // Select a continuous fragment for Phosphate
    await selectAtomAndBonds(page, { atomIds: [4, 5], bondIds: [4] });

    // Mark as Phosphate via context menu
    const contextMenu = ContextMenu(page, getAtomLocator(page, { atomId: 4 }));
    await contextMenu.click([
      MonomerWizardOption.MarkAs,
      MonomerWizardOption.Phosphate,
    ]);

    // Verify Phosphate tab is now active and visible
    expect(
      await dialog.nucleotidePresetSection.isTabOpened(
        NucleotidePresetTab.Phosphate,
      ),
    ).toBeTruthy();
    await expect(
      dialog.nucleotidePresetSection.phosphateTab.codeEditbox,
    ).toBeVisible();

    // Take screenshot of the Phosphate tab
    await takeElementScreenshot(page, dialog.window);

    await dialog.discard();
  });

  test('Case 9 - Verify user can set component structure using dedicated button in Attributes panel for continuous selection', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10006
     * Description: Verify that user can assign components using dedicated controls/buttons
     * in the Attributes panel when continuous selection is made
     *
     * Scenario:
     * 1. Open Monomer Creation Wizard with 'Nucleotide (preset)' type
     * 2. Select a continuous fragment on canvas
     * 3. In the Attributes panel, locate dedicated control/button to mark selection as Base/Sugar/Phosphate
     * 4. Click the appropriate button (e.g., 'Mark as Base')
     * 5. Expected result: Selected fragment is assigned to chosen component and corresponding tab reflects the structure
     *
     * Version 3.12
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerType.NucleotidePreset);

    // Select a continuous fragment
    await selectAtomAndBonds(page, { atomIds: [0, 1], bondIds: [0] });

    await dialog.nucleotidePresetSection.openTab(NucleotidePresetTab.Base);
    const setAsBaseButton =
      dialog.nucleotidePresetSection.baseTab.maskAsBaseButton;

    // If the button exists, click it and verify the assignment
    await setAsBaseButton.click();

    // Take screenshot of current state
    await takeElementScreenshot(page, dialog.window);

    await dialog.discard();
  });

  test.fail(
    'Case 10 - Verify dedicated Attributes panel button is disabled for non-continuous selection',
    async () => {
      // Works wrong because of https://github.com/epam/ketcher/issues/9121
      /*
       * Test task: https://github.com/epam/ketcher/issues/10006
       * Description: Verify that dedicated Attributes panel buttons are disabled
       * when selection is non-continuous
       *
       * Scenario:
       * 1. Open Monomer Creation Wizard with 'Nucleotide (preset)' type
       * 2. Select non-continuous fragments on canvas
       * 3. Check Attributes panel controls/buttons for component assignment
       * 4. Expected result: Dedicated buttons are disabled for non-continuous selection
       *
       * Version 3.12
       */
      await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
      await LeftToolbar(page).createMonomer();
      await shiftCanvas(page, -150, 50);
      await dialog.selectType(MonomerType.NucleotidePreset);

      // Select non-continuous atoms
      await selectAtomAndBonds(page, { atomIds: [0, 3], bondIds: [] });

      // Look for dedicated Attributes panel buttons
      const setAsBaseButton =
        dialog.nucleotidePresetSection.baseTab.maskAsBaseButton;

      // If the button exists, verify it's disabled
      await dialog.nucleotidePresetSection.openTab(NucleotidePresetTab.Base);
      expect(await setAsBaseButton.isEnabled()).toBeFalsy();

      // Take screenshot of current state
      await takeElementScreenshot(page, dialog.window);

      await dialog.discard();
    },
  );

  test('Case 11 - Verify multiple components can be defined sequentially using "Mark as a..." on different selections', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10006
     * Description: Verify that Base, Sugar, and Phosphate components can be defined
     * sequentially using "Mark as a..." context menu, and all retain their assignments
     *
     * Scenario:
     * 1. Open Monomer Creation Wizard with 'Nucleotide (preset)' type
     * 2. Select first fragment and mark as Base
     * 3. Select second fragment and mark as Sugar
     * 4. Select third fragment and mark as Phosphate
     * 5. Expected result: All three components retain their assignments and can be verified in respective tabs
     *
     * Version 3.12
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerType.NucleotidePreset);

    // Define Base component
    await selectAtomAndBonds(page, { atomIds: [0, 1], bondIds: [0] });
    const contextMenuBase = ContextMenu(
      page,
      getAtomLocator(page, { atomId: 0 }),
    );
    await contextMenuBase.click([
      MonomerWizardOption.MarkAs,
      MonomerWizardOption.Base,
    ]);

    // Define Sugar component
    await selectAtomAndBonds(page, { atomIds: [2, 3], bondIds: [2] });
    const contextMenuSugar = ContextMenu(
      page,
      getAtomLocator(page, { atomId: 2 }),
    );
    await contextMenuSugar.click([
      MonomerWizardOption.MarkAs,
      MonomerWizardOption.Sugar,
    ]);

    // Define Phosphate component
    await selectAtomAndBonds(page, { atomIds: [4, 5], bondIds: [4] });
    const contextMenuPhosphate = ContextMenu(
      page,
      getAtomLocator(page, { atomId: 4 }),
    );
    await contextMenuPhosphate.click([
      MonomerWizardOption.MarkAs,
      MonomerWizardOption.Phosphate,
    ]);

    // Verify all components are properly assigned by checking each tab

    // Check Base tab
    await dialog.nucleotidePresetSection.openTab(NucleotidePresetTab.Base);
    await expect(
      dialog.nucleotidePresetSection.baseTab.codeEditbox,
    ).toBeVisible();
    await expect(
      dialog.nucleotidePresetSection.baseTab.codeEditbox,
    ).toHaveValue('');

    // Check Sugar tab
    await dialog.nucleotidePresetSection.openTab(NucleotidePresetTab.Sugar);
    await expect(
      dialog.nucleotidePresetSection.sugarTab.codeEditbox,
    ).toBeVisible();
    await expect(
      dialog.nucleotidePresetSection.sugarTab.codeEditbox,
    ).toHaveValue('');

    // Check Phosphate tab
    await dialog.nucleotidePresetSection.openTab(NucleotidePresetTab.Phosphate);
    await expect(
      dialog.nucleotidePresetSection.phosphateTab.codeEditbox,
    ).toBeVisible();
    await expect(
      dialog.nucleotidePresetSection.phosphateTab.codeEditbox,
    ).toHaveValue('');

    // Take final screenshot showing all components defined
    await takeElementScreenshot(page, dialog.window);

    await dialog.discard();
  });
});
