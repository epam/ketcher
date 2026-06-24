/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { expect, Page } from '@playwright/test';
import { test } from '@fixtures';
import { pasteFromClipboardAndOpenAsNewProject } from '@utils/files/readFile';
import {
  shiftCanvas,
  clickOnCanvas,
  undoByKeyboard,
  takeElementScreenshot,
} from '@utils/index';
import { CreateMonomerDialog } from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import {
  NucleotideNaturalAnalogue,
  MonomerType as MonomerTypeInDropdown,
} from '@tests/pages/constants/createMonomerDialog/Constants';
import { NucleotidePresetSection } from '@tests/pages/molecules/canvas/createMonomer/NucleotidePresetSection';
import { NucleotidePresetTab } from '@tests/pages/molecules/canvas/createMonomer/constants/nucleiotidePresetSection/Constants';
import { NotificationMessageBanner } from '@tests/pages/molecules/canvas/createMonomer/NotificationMessageBanner';
import { ErrorMessage } from '@tests/pages/constants/notificationMessageBanner/Constants';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MicroBondTool } from '@tests/pages/constants/bondSelectionTool/Constants';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import {
  BottomToolbar,
  drawBenzeneRing,
} from '@tests/pages/molecules/BottomToolbar';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import { getBondLocator } from '@utils/macromolecules/polymerBond';

let page: Page;
let dialog: ReturnType<typeof CreateMonomerDialog>;
let presetSection: ReturnType<typeof NucleotidePresetSection>;

test.beforeAll(async ({ initMoleculesCanvas }) => {
  page = await initMoleculesCanvas();
  dialog = CreateMonomerDialog(page);
  presetSection = NucleotidePresetSection(page);
});

test.afterAll(async ({ closePage }) => {
  await closePage();
});

test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

test.describe('Additions to the structure: ', () => {
  test('Case 1 - Verify that additions connected to Base become part of Base component', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10008
     * Description: Verify that additions connected to Base become part of Base component
     * Scenario:
     * 1. Open Monomer Creation Wizard and select 'Nucleotide (preset)'
     * 2. Define initial preset components (Base, Sugar, Phosphate) using the wizard
     * 3. On the canvas, draw a new atom/bond directly attached to the existing Base structure
     * 4. Open the Base component section in the wizard and inspect its assigned structure
     * 5. Expected: The newly drawn atoms/bonds that are directly connected to the Base structure are included in the Base component structure
     *
     * Version 3.15.0
     */

    // Load initial structure
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    // Open wizard and setup preset
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);
    await presetSection.setName('TestPreset');

    // Define Base, Sugar, and Phosphate components
    await presetSection.setupBase({
      atomIds: [0, 1],
      bondIds: [0],
      code: 'TestB',
      name: 'Test Base',
      naturalAnalogue: NucleotideNaturalAnalogue.A,
    });

    await presetSection.setupSugar({
      atomIds: [2, 3],
      bondIds: [2],
      code: 'TestS',
      name: 'Test Sugar',
    });

    await presetSection.setupPhosphate({
      atomIds: [4, 5],
      bondIds: [4],
      code: 'TestP',
      name: 'Test Phosphate',
    });

    // Add a new bond connected to the Base (atom 0)
    await CommonLeftToolbar(page).bondTool(MicroBondTool.Single);
    const baseAtom = getAtomLocator(page, { atomId: 1 });
    await baseAtom.click({ force: true });

    // Verify the addition is recognized in Base component
    await presetSection.openTab(NucleotidePresetTab.Base);
    await takeElementScreenshot(page, dialog.window);

    await dialog.discard();
  });

  test('Case 2 - Verify that additions connected to Sugar become part of Sugar component', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10008
     * Description: Verify that additions connected to Sugar become part of Sugar component
     * Scenario:
     * 1. With   already defined in the preset wizard
     * 2. Draw a new bond or substituent attached to the Sugar
     * 3. Open the Sugar component section and inspect its structure
     * 4. Expected: The new addition is part of the Sugar component structure
     *
     * Version 3.15.0
     */

    // Load initial structure
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    // Open wizard and setup preset
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);
    await presetSection.setName('TestPreset2');

    // Define components
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

    // Add a bond connected to the Sugar (atom 2)
    await CommonLeftToolbar(page).bondTool(MicroBondTool.Single);
    const sugarAtom = getAtomLocator(page, { atomId: 2 });
    await sugarAtom.click({ force: true });

    // Verify the addition is recognized in Sugar component
    await presetSection.openTab(NucleotidePresetTab.Preset);
    await page.waitForTimeout(200);
    await presetSection.openTab(NucleotidePresetTab.Sugar);
    await takeElementScreenshot(page, dialog.window);

    await dialog.discard();
  });

  test('Case 3 - Verify that additions connected to Phosphate become part of Phosphate component', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10008
     * Description: Verify that additions connected to Phosphate become part of Phosphate component
     * Scenario:
     * 1. With all three components already defined
     * 2. Draw new atoms/bonds directly attached to the Phosphate
     * 3. Open the Phosphate component section and inspect its structure
     * 4. Expected: All newly drawn atoms/bonds attached to Phosphate are included in the Phosphate component structure only
     *
     * Version 3.15.0
     */

    // Load initial structure
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    // Open wizard and setup preset
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);
    await presetSection.setName('TestPreset3');

    // Define components
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

    // Extend the phosphate chain by adding an oxygen
    await CommonLeftToolbar(page).bondTool(MicroBondTool.Single);
    const phosphateAtom = getAtomLocator(page, { atomId: 4 });
    await phosphateAtom.click({ force: true });

    // Verify the addition is recognized in Phosphate component
    await presetSection.openTab(NucleotidePresetTab.Preset);
    await page.waitForTimeout(200);
    await presetSection.openTab(NucleotidePresetTab.Phosphate);
    await takeElementScreenshot(page, dialog.window);

    await dialog.discard();
  });

  test('Case 4 - Verify that unconnected additions do not belong to any component and block preset saving', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10008
     * Description: Verify that unconnected additions do not belong to any component and block preset saving
     * Scenario:
     * 1. Ensure Base, Sugar, and Phosphate are already defined for the preset
     * 2. On the canvas, draw a new structure that is completely unconnected to any of the existing components
     * 3. Attempt to save the preset via the wizard
     * 4. Expected: The unconnected structure is not assigned to Base, Sugar, or Phosphate. Saving the preset fails with an error
     *
     * Version 3.15.0
     */

    // Load initial structure
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    // Open wizard and setup preset
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);
    await presetSection.setName('TestPreset4');

    // Define components
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

    // Draw an isolated benzene ring unconnected to existing structure
    await BottomToolbar(page).clickRing(RingButton.Benzene);
    await clickOnCanvas(page, 200, 200);
    await page.keyboard.press('Escape');

    // Try to save the preset - should fail
    await dialog.submit();

    // Verify error message appears
    const errorBanner = NotificationMessageBanner(
      page,
      ErrorMessage.rnaPresetAtomsOutsideComponents,
    );
    expect(await errorBanner.isVisible()).toBeTruthy();

    await takeElementScreenshot(page, dialog.window);
    await dialog.discard();
  });

  test('Case 5 - Verify that previously unconnected structure becomes part of Base when connected to Base', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10008
     * Description: Verify that previously unconnected structure becomes part of Base when connected to Base
     * Scenario:
     * 1. Start from the scenario with an unconnected structure on the canvas and assigned Base, Sugar, and Phosphate components
     * 2. Connect the unconnected structure to the Base by adding bonds
     * 3. Open the Base component section in the wizard
     * 4. Expected: The previously unconnected structure is now part of the Base component structure
     *
     * Version 3.15.0
     */

    // Load initial structure
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    // Draw an isolated structure first
    await clickOnCanvas(page, 200, 200);
    await RightToolbar(page).clickAtom(Atom.Carbon);
    await clickOnCanvas(page, 250, 200);

    // Open wizard and setup preset
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);
    await presetSection.setName('TestPreset5');

    // Define components from original structure
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

    // Connect the isolated carbon to the Base
    await CommonLeftToolbar(page).bondTool(MicroBondTool.Single);
    const baseAtom = getAtomLocator(page, { atomId: 1 });
    const isolatedAtom = getAtomLocator(page, { atomId: 6 });
    await isolatedAtom.hover();
    await page.mouse.down();
    await baseAtom.hover();
    await page.mouse.up();

    // Verify the connected structure is now part of Base
    await presetSection.openTab(NucleotidePresetTab.Base);
    await takeElementScreenshot(page, dialog.window);

    // Should be able to save now
    await dialog.submit();
  });

  test('Case 6 - Verify that previously unconnected structure becomes part of Sugar when connected to Sugar', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10008
     * Description: Verify that previously unconnected structure becomes part of Sugar when connected to Sugar
     * Scenario:
     * 1. Create an unconnected structure on the canvas with defined Base, Sugar, and Phosphate components
     * 2. Connect this structure only to the Sugar component
     * 3. Expected: The previously unconnected structure becomes part of the Sugar component
     *
     * Version 3.15.0
     */

    // Load initial structure
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    // Draw an isolated structure first
    await clickOnCanvas(page, 200, 200);
    await RightToolbar(page).clickAtom(Atom.Nitrogen);
    await clickOnCanvas(page, 250, 200);

    // Open wizard and setup preset
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);
    await presetSection.setName('TestPreset6');

    // Define components
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

    // Connect the isolated nitrogen to the Sugar
    await CommonLeftToolbar(page).bondTool(MicroBondTool.Single);
    const sugarAtom = getAtomLocator(page, { atomId: 3 });
    const isolatedAtom = getAtomLocator(page, { atomId: 6 });
    await isolatedAtom.hover();
    await page.mouse.down();
    await sugarAtom.hover();
    await page.mouse.up();

    // Verify the connected structure is now part of Sugar
    await presetSection.openTab(NucleotidePresetTab.Preset);
    await page.waitForTimeout(200);
    await presetSection.openTab(NucleotidePresetTab.Sugar);
    await takeElementScreenshot(page, dialog.window);

    await dialog.discard();
  });

  test('Case 7 - Verify behavior when structure connected to one component is subsequently extended to another component', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10008
     * Description: Verify behavior when structure connected to one component is subsequently extended to another component
     * Scenario:
     * 1. Start from the case where a previously unconnected structure has been connected to Base
     * 2. Draw additional bonds from this structure so that it also connects to Sugar
     * 3. Expected: The connecting structure retains its original component marking and saving fails due to multi-component connectivity
     *
     * Version 3.15.0
     */

    // Load initial structure
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    // Draw an isolated structure
    await clickOnCanvas(page, 200, 200);
    await RightToolbar(page).clickAtom(Atom.Carbon);
    await clickOnCanvas(page, 250, 200);

    // Open wizard and setup preset
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);
    await presetSection.setName('TestPreset7');

    // Define components
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

    // First connect the isolated structure to Base
    await CommonLeftToolbar(page).bondTool(MicroBondTool.Single);
    const baseAtom = getAtomLocator(page, { atomId: 1 });
    const isolatedAtom = getAtomLocator(page, { atomId: 6 });
    await isolatedAtom.hover();
    await page.mouse.down();
    await baseAtom.hover();
    await page.mouse.up();

    // Then also connect it to Sugar - creating multi-component connection
    const sugarAtom = getAtomLocator(page, { atomId: 2 });
    await isolatedAtom.hover();
    await page.mouse.down();
    await sugarAtom.hover();
    await page.mouse.up();

    // Try to save - should fail due to multi-component connectivity
    await dialog.submit();

    // Verify error appears
    const errorBanner = NotificationMessageBanner(
      page,
      ErrorMessage.rnaPresetInvalidSugarConnectionBonds,
    );
    expect(await errorBanner.isVisible()).toBeTruthy();

    await takeElementScreenshot(page, dialog.window);
    await dialog.discard();
  });

  test('Case 8 - Verify behavior when part of a component structure is disconnected and reconnected to another component', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10008
     * Description: Verify behavior when part of a component structure is disconnected and reconnected to another component
     * Scenario:
     * 1. With Base, Sugar, and Phosphate defined, select a portion of the Base structure
     * 2. Break bonds to detach this portion from the rest of the Base
     * 3. Connect the detached portion to another component (Sugar)
     * 4. Expected: Preset saving fails due to non-continuous monomer structure and multi-component connectivity
     *
     * Version 3.15.0
     */

    // Load longer chain structure
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCCCC');

    // Open wizard and setup preset
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);
    await presetSection.setName('TestPreset8');

    // Define components with Base having multiple atoms
    await presetSection.setupBase({
      atomIds: [0, 1, 2],
      bondIds: [0, 1],
    });

    await presetSection.setupSugar({
      atomIds: [3, 4],
      bondIds: [3],
    });

    await presetSection.setupPhosphate({
      atomIds: [5, 6, 7],
      bondIds: [5, 6],
    });

    // Break a bond within the Base to make it non-continuous
    await CommonLeftToolbar(page).erase();
    const bondToBreak = getBondLocator(page, { bondId: 1 });
    await bondToBreak.click();

    // Connect the detached Base portion to Sugar
    await CommonLeftToolbar(page).bondTool(MicroBondTool.Single);
    const detachedBaseAtom = getAtomLocator(page, { atomId: 1 });
    const sugarAtom = getAtomLocator(page, { atomId: 3 });
    await detachedBaseAtom.hover();
    await page.mouse.down();
    await sugarAtom.hover();
    await page.mouse.up();

    // Try to save - should fail due to non-continuous structure
    await dialog.submit();

    // Verify error appears
    const errorBanner = NotificationMessageBanner(
      page,
      ErrorMessage.incontinuousStructure,
    );
    expect(await errorBanner.isVisible()).toBeTruthy();

    await takeElementScreenshot(page, dialog.window);
    await dialog.discard();
  });

  test('Case 9 - Verify that adding and removing simple extensions to a component does not break component continuity', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10008
     * Description: Verify that adding and removing simple extensions to a component does not break component continuity
     * Scenario:
     * 1. With Base, Sugar, and Phosphate defined, extend one of the components by adding a short side chain
     * 2. Confirm the side chain is part of the component
     * 3. Delete the added atoms/bonds (undo)
     * 4. Expected: After adding then removing simple extensions, the component structure remains valid and continuous
     *
     * Version 3.15.0
     */

    // Load initial structure
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    // Open wizard and setup preset
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);
    await presetSection.setName('TestPreset9');

    // Define components
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

    // Add a side chain to Base
    await CommonLeftToolbar(page).bondTool(MicroBondTool.Single);
    const baseAtom = getAtomLocator(page, { atomId: 1 });
    await baseAtom.click();

    // Verify addition
    await presetSection.openTab(NucleotidePresetTab.Preset);
    await page.waitForTimeout(200);
    await presetSection.openTab(NucleotidePresetTab.Base);
    await takeElementScreenshot(page, dialog.window);

    // Remove the addition using undo
    await undoByKeyboard(page);

    // Verify structure is still valid and can be saved
    await dialog.submit();
    await expect(dialog.window).not.toBeVisible();
  });

  test('Case 10 - Verify that additions made before components are defined are handled correctly once components are defined', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10008
     * Description: Verify that additions made before components are defined are handled correctly once components are defined
     * Scenario:
     * 1. In the wizard, before marking any component, draw several fragments on the canvas
     * 2. Then define Base, Sugar, and Phosphate components by marking appropriate continuous fragments
     * 3. Attempt to save when some remaining fragments are not assigned to any component
     * 4. Expected: Fragments explicitly used for components become part of their respective components; leftover fragments prevent saving
     *
     * Version 3.15.0
     */

    // Load initial structure
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');

    // Open wizard and setup preset
    await LeftToolbar(page).createMonomer();
    await shiftCanvas(page, -150, 50);
    await dialog.selectType(MonomerTypeInDropdown.NucleotidePreset);
    await presetSection.setName('TestPreset10');

    // Draw several fragments before defining components
    // Fragment 1 - chain for Base
    await RightToolbar(page).clickAtom(Atom.Carbon);
    await clickOnCanvas(page, 100, 100);
    await clickOnCanvas(page, 150, 100);

    // Fragment 2 - chain for Sugar
    await clickOnCanvas(page, 200, 100);
    await clickOnCanvas(page, 250, 100);

    // Fragment 3 - chain for Phosphate
    await clickOnCanvas(page, 300, 100);
    await clickOnCanvas(page, 350, 100);

    // Fragment 4 - isolated unassigned structure
    await drawBenzeneRing(page);

    // Now define components using some of the pre-existing fragments
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

    // Try to save with leftover unassigned benzene ring - should fail
    await dialog.submit();

    // Verify error about unassigned structure
    const errorBanner = NotificationMessageBanner(
      page,
      ErrorMessage.rnaPresetAtomsOutsideComponents,
    );
    expect(await errorBanner.isVisible()).toBeTruthy();

    await takeElementScreenshot(page, dialog.window);
    await dialog.discard();
  });
});
