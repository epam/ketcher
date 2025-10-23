/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Page, expect } from '@playwright/test';
import { test } from '@fixtures';
import { pasteFromClipboardAndOpenAsNewProject } from '@utils/files/readFile';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import {
  pasteFromClipboardByKeyboard,
  selectAllStructuresOnCanvas,
  takeElementScreenshot,
} from '@utils/canvas';
import { clickOnCanvas, dragMouseTo } from '@utils/index';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import {
  MicroAtomOption,
  MicroBondOption,
} from '@tests/pages/constants/contextMenu/Constants';
import { CreateMonomerDialog } from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import { AtomPropertiesDialog } from '@tests/pages/molecules/canvas/AtomPropertiesDialog';
import { getBondLocator } from '@utils/macromolecules/polymerBond';
import { BondPropertiesDialog } from '@tests/pages/molecules/canvas/BondPropertiesDialog';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { PeriodicTableDialog } from '@tests/pages/molecules/canvas/PeriodicTableDialog';
import { PeriodicTableElement } from '@tests/pages/constants/periodicTableDialog/Constants';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { BottomToolbar } from '@tests/pages/molecules/BottomToolbar';
import { StructureLibraryDialog } from '@tests/pages/molecules/canvas/StructureLibraryDialog';
import {
  MicroBondDataIds,
  MicroBondType,
} from '@tests/pages/constants/bondSelectionTool/Constants';
import { TopLeftToolbar } from '@tests/pages/molecules/TopLeftToolbar';
import { ErrorMessageDialog } from '@tests/pages/common/ErrorMessageDialog';

let page: Page;
test.beforeAll(async ({ initMoleculesCanvas }) => {
  page = await initMoleculesCanvas();
});
test.afterAll(async ({ closePage }) => {
  await closePage();
});
test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

test(`1. Verify that options/toolbar icons are now enabled for atoms in create monomer wizard: in the right-click menu, only options Edit and Delete are enabled`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that options/toolbar icons are now enabled for atoms in create monomer wizard: in the right-click menu, only options Edit and Delete are enabled
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. r-click on a terminal atom on canvas
   *      6. Verify that context menu option Edit and Delete are enabled
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'BrCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(500, 250, page);

  const targetAtom = getAtomLocator(page, { atomLabel: 'Br' }).first();

  await ContextMenu(page, targetAtom).open();

  await expect(page.getByTestId(MicroAtomOption.Edit)).toBeEnabled();
  await expect(page.getByTestId(MicroAtomOption.Delete)).toBeEnabled();

  await clickOnCanvas(page, 0, 0);
  await CreateMonomerDialog(page).discard();
});

test(`2. Verify that right-click menu Delete option works correct for atoms in Create Monomer Wizard`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that right-click menu Delete option works correct for atoms in Create Monomer Wizard
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. r-click on a terminal atom on canvas and click Delete
   *      6. Verify that atom got deleted
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'BrCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(500, 250, page);

  const targetAtom = getAtomLocator(page, { atomLabel: 'Br' }).first();

  await ContextMenu(page, targetAtom).click(MicroAtomOption.Delete);

  await expect(targetAtom).not.toBeVisible();

  await clickOnCanvas(page, 0, 0);
  await CreateMonomerDialog(page).discard();
});

test(`3. Verify that in create monomer wizard: In the right-click menu, Edit option, users can edit only single atom properties`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that in create monomer wizard: In the right-click menu, Edit option, users can edit only single atom properties
   *              (query specific, reaction flags, custom queries, and non-single atom properties are still disabled)
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. r-click on a terminal atom on canvas and click Edit
   *      6. Verify that Atom properties dialog opens and only single atom properties are editable
   *      7. Verify that query specific, reaction flags, custom queries, and non-single atom properties are disabled
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'BrCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(500, 250, page);

  const targetAtom = getAtomLocator(page, { atomLabel: 'Br' }).first();

  await ContextMenu(page, targetAtom).click(MicroAtomOption.Edit);

  await expect(AtomPropertiesDialog(page).window).toBeVisible();

  const generalSection =
    AtomPropertiesDialog(page).generalSection.getByRole('button');
  await expect(generalSection).toBeEnabled();

  const querySpecificSection =
    AtomPropertiesDialog(page).querySpecificSection.getByRole('button');
  await expect(querySpecificSection).toBeDisabled();

  const reactionFlagsSection =
    AtomPropertiesDialog(page).reactionFlagsSection.getByRole('button');
  await expect(reactionFlagsSection).toBeDisabled();

  const customQueryCheckbox =
    AtomPropertiesDialog(page).customQueryCheckbox.locator('../../..');
  await expect(customQueryCheckbox).toHaveAttribute('aria-disabled', 'true');

  const customQueryTextArea =
    AtomPropertiesDialog(page).customQueryTextArea.locator('../..');
  await expect(customQueryTextArea).toHaveAttribute('aria-disabled', 'true');

  await AtomPropertiesDialog(page).cancel();
  await CreateMonomerDialog(page).discard();
});

test(`4. Verify that in create monomer wizard: for bonds in the right-click menu, options Edit, Different bond types, Change direction, and Delete are enabled`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that in create monomer wizard: for bonds in the right-click menu, options Edit, Different
   *              bond types, Change direction, and Delete are enabled
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. r-click on one of the bonds on canvas
   *      6. Verify that Edit, Different bond types, Change direction, and Delete are enabled
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'BrCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(500, 250, page);

  const targetBond = getBondLocator(page, {}).first();

  await ContextMenu(page, targetBond).open();

  await Promise.all([
    expect(page.getByTestId(MicroBondOption.Edit)).toBeEnabled(),
    expect(page.getByTestId(MicroBondOption.Single)).toBeEnabled(),
    expect(page.getByTestId(MicroBondOption.SingleUp)).toBeEnabled(),
    expect(page.getByTestId(MicroBondOption.SingleDown)).toBeEnabled(),
    expect(page.getByTestId(MicroBondOption.SingleUpDown)).toBeEnabled(),
    expect(page.getByTestId(MicroBondOption.Double)).toBeEnabled(),
    expect(page.getByTestId(MicroBondOption.DoubleCisTrans)).toBeEnabled(),
    expect(page.getByTestId(MicroBondOption.Triple)).toBeEnabled(),
    expect(page.getByTestId(MicroBondOption.Hydrogen)).toBeEnabled(),
    expect(page.getByTestId(MicroBondOption.Dative)).toBeEnabled(),
    expect(page.getByTestId(MicroBondOption.Delete)).toBeEnabled(),
  ]);

  await clickOnCanvas(page, 0, 0);
  await CreateMonomerDialog(page).discard();
});

test(`5. Verify that in create monomer wizard: in the right-click menu, Edit option, users can edit only the Type`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that in create monomer wizard: in the right-click menu, Edit option, users can edit only the Type
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. r-click on a terminal atom on canvas and click Edit
   *      6. Verify users can edit only the Type
   *      7. Verify that other controls are disabled
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'BrCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(500, 250, page);

  const targetBond = getBondLocator(page, {}).first();

  await ContextMenu(page, targetBond).click(MicroBondOption.Edit);

  await expect(BondPropertiesDialog(page).window).toBeVisible();

  const bondTypeDropdown = BondPropertiesDialog(page).bondTypeDropdown;
  await expect(bondTypeDropdown).toBeEnabled();

  const bondTopologyDropdown = BondPropertiesDialog(page).bondTopologyDropdown;
  await expect(bondTopologyDropdown).toBeDisabled();

  const bondReactingCenterDropdown =
    BondPropertiesDialog(page).bondReactingCenterDropdown;
  await expect(bondReactingCenterDropdown).toBeDisabled();

  const bondCustomQueryCheckbox =
    BondPropertiesDialog(page).bondCustomQueryCheckbox.locator('../../..');
  await expect(bondCustomQueryCheckbox).toHaveAttribute(
    'aria-disabled',
    'true',
  );

  const bondCustomQueryText =
    BondPropertiesDialog(page).bondCustomQueryText.locator('../..');
  await expect(bondCustomQueryText).toHaveAttribute('aria-disabled', 'true');

  await BondPropertiesDialog(page).cancel();
  await CreateMonomerDialog(page).discard();
});

test(`6. Verify that in create monomer wizard: on the right toolbar, Elements and the Periodic table are enabled`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that in create monomer wizard: on the right toolbar, Elements and the Periodic table are enabled
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Verify on the right toolbar, Elements and the Periodic table are enabled
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'BrCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  await Promise.all([
    expect(RightToolbar(page).hydrogenButton).toBeEnabled(),
    expect(RightToolbar(page).carbonButton).toBeEnabled(),
    expect(RightToolbar(page).nitrogenButton).toBeEnabled(),
    expect(RightToolbar(page).oxygenButton).toBeEnabled(),
    expect(RightToolbar(page).sulfurButton).toBeEnabled(),
    expect(RightToolbar(page).phosphorusButton).toBeEnabled(),
    expect(RightToolbar(page).fluorineButton).toBeEnabled(),
    expect(RightToolbar(page).chlorineButton).toBeEnabled(),
    expect(RightToolbar(page).bromineButton).toBeEnabled(),
    expect(RightToolbar(page).iodineButton).toBeEnabled(),
    expect(RightToolbar(page).periodicTableButton).toBeEnabled(),

    expect(RightToolbar(page).anyAtomButton).toBeDisabled(),
    expect(RightToolbar(page).extendedTableButton).toBeDisabled(),
  ]);

  await CreateMonomerDialog(page).discard();
});

test(`7. Verify that in create monomer wizard: in the periodic table, only Single atoms are allowed (List and Not list options are disabled)`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that in create monomer wizard: in the periodic table, only Single atoms are allowed (List and Not list options are disabled)
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Open Periodic table
   *      6. Verify that only Single atoms are allowed (List and Not list options are disabled)
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'BrCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  await RightToolbar(page).periodicTable();

  await Promise.all([
    expect(PeriodicTableDialog(page).singleRadioButton).toBeChecked(),
    expect(PeriodicTableDialog(page).listRadioButton).toBeDisabled(),
    expect(PeriodicTableDialog(page).notListRadioButton).toBeDisabled(),
  ]);

  await PeriodicTableDialog(page).cancel();
  await CreateMonomerDialog(page).discard();
});

test(`8. Verify that in create monomer wizard: it is possible to change atom using Periodic table`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that in create monomer wizard: it is possible to change atom using Periodic table
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Open Periodic table and select atom (e.g., Nh)
   *      6. Click on Br atom on canvas
   *      7. Verify that Br atom got changed to Nh
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'BrCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(500, 250, page);

  const targetAtom = getAtomLocator(page, { atomLabel: 'Br' }).first();

  await RightToolbar(page).periodicTable();
  await PeriodicTableDialog(page).addElements([PeriodicTableElement.Nh]);

  await targetAtom.click({ force: true });

  await expect(getAtomLocator(page, { atomLabel: 'Nh' }).first()).toBeVisible();

  await CreateMonomerDialog(page).discard();
});

test(`9. Verify that in create monomer wizard: it is possible to change atom using Elements from toolbar`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that in create monomer wizard: it is possible to change atom using Elements from toolbar
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Select atom from toolbar (e.g., N)
   *      6. Click on Br atom on canvas
   *      7. Verify that Br atom got changed to Nh
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'BrCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(500, 250, page);

  const targetAtom = getAtomLocator(page, { atomLabel: 'Br' }).first();

  await RightToolbar(page).clickAtom(Atom.Nitrogen);

  await targetAtom.click({ force: true });

  await expect(getAtomLocator(page, { atomLabel: 'N' }).first()).toBeVisible();

  await CreateMonomerDialog(page).discard();
});

test(`10. Verify that in create monomer wizard: on the bottom toolbar, everything is now enabled`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that in create monomer wizard: on the bottom toolbar, everything is now enabled
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Verify that in create monomer wizard: on the bottom toolbar, everything is now enabled
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'BrCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  await Promise.all([
    expect(BottomToolbar(page).benzeneButton).toBeEnabled(),
    expect(BottomToolbar(page).cyclopentadieneButton).toBeEnabled(),
    expect(BottomToolbar(page).cyclohexaneButton).toBeEnabled(),
    expect(BottomToolbar(page).cyclopentaneButton).toBeEnabled(),
    expect(BottomToolbar(page).cyclopropaneButton).toBeEnabled(),
    expect(BottomToolbar(page).cyclobutaneButton).toBeEnabled(),
    expect(BottomToolbar(page).cycloheptaneButton).toBeEnabled(),
    expect(BottomToolbar(page).cyclooctaneButton).toBeEnabled(),
    expect(BottomToolbar(page).structureLibraryButton).toBeEnabled(),
  ]);

  await CreateMonomerDialog(page).discard();
});

test(`11. Verify that in create monomer wizard: it is possible to put molecules on the canvas from bottom toolbar`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that in create monomer wizard: it is possible to put molecules on the canvas from bottom toolbar
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Click on Benzene from the bottom toolbar and put them on the canvas
   *      5. Take screenshot to validate its appearance
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'CNC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(600, 250, page);

  const targetAtom = getAtomLocator(page, { atomLabel: 'N' }).first();
  await BottomToolbar(page).Benzene();

  await targetAtom.click({ force: true });

  await takeElementScreenshot(
    page,
    getAtomLocator(page, { atomLabel: 'C', atomValence: 5 }),
    { padding: 75 },
  );

  await CreateMonomerDialog(page).discard();
});

test(`12. Verify that in create monomer wizard: in the Structure library, the Functional Groups section and the option Save to SDF are disabled`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that in create monomer wizard: in the Structure library, the Functional Groups section and the option Save to SDF are disabled
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Open Structure library
   *      6. Verify that the Functional Groups section and the option Save to SDF are disabled
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'CNC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  await BottomToolbar(page).StructureLibrary();

  await expect(StructureLibraryDialog(page).functionalGroupTab).toBeDisabled();
  await expect(StructureLibraryDialog(page).saveToSdfButton).toBeDisabled();

  await StructureLibraryDialog(page).close();
  await CreateMonomerDialog(page).discard();
});

test(`13. Verify that in create monomer wizard: on the left toolbar, Erase, Bond tool, Chain, Charge plus, and Charge minus are now enabled`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that in create monomer wizard: on the left toolbar, Erase, Bond tool, Chain, Charge plus, and Charge minus are now enabled
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Verify that on the left toolbar, Erase, Bond tool, Chain, Charge plus, and Charge minus are now enabled
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'BrCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  await Promise.all([
    expect(CommonLeftToolbar(page).eraseButton).toBeEnabled(),
    expect(CommonLeftToolbar(page).bondSelectionDropdownButton).toBeEnabled(),
    expect(LeftToolbar(page).chainButton).toBeEnabled(),
    expect(LeftToolbar(page).chargePlusButton).toBeEnabled(),
    expect(LeftToolbar(page).chargeMinusButton).toBeEnabled(),
  ]);

  await CreateMonomerDialog(page).discard();
});

test(`14. Verify that in create monomer wizard: user can delete atoms and bonds with Erase button`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that in create monomer wizard: user can delete atoms and bonds with Erase button
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Press Erase button and delete atom and bond
   *      5. Verify that atom and bond got deleted
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'BrCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  const targetAtom = getAtomLocator(page, { atomLabel: 'Br' }).first();
  const targetBond = getBondLocator(page, {});
  await CommonLeftToolbar(page).erase();

  await targetBond.first().click({ force: true });
  await targetAtom.click({ force: true });

  await expect(targetAtom).not.toBeVisible();
  expect(await targetBond.count()).toBe(1);

  await CreateMonomerDialog(page).discard();
});

test(`15. Verify that in create monomer wizard: user can add bonds to molecule and modify bonds using Bond tool`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that in create monomer wizard: user can add bonds to molecule and modify bonds using Bond tool
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Press Single Bond from Bond tool and click on existing bond to change its type
   *      6. Verify that bond type got changed
   *      7. Press Single Bond from Bond tool and click on existing atom to add a bond
   *      8. Take screenshot to validate its appearance
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'BrCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(500, 250, page);

  const targetAtom = getAtomLocator(page, { atomLabel: 'Br' }).first();
  const targetSingleBond = getBondLocator(page, {
    bondType: MicroBondDataIds.Single,
  });
  const targetDoubleBond = getBondLocator(page, {
    bondType: MicroBondDataIds.Double,
  });
  await CommonLeftToolbar(page).selectBondTool(MicroBondType.Single);

  await targetSingleBond.first().click({ force: true });
  expect(targetDoubleBond.first()).toBeVisible();

  await targetAtom.click({ force: true });

  await takeElementScreenshot(page, targetAtom, { padding: 80 });

  await CreateMonomerDialog(page).discard();
});

test(`16. Verify that in create monomer wizard: user can add bonds using Chain tool`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that in create monomer wizard: user can add bonds using Chain tool
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Press Chain button
   *      6. Draw two bonds starting from existing atom
   *      7. Take screenshot to validate its appearance
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'BrCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(500, 250, page);

  const targetAtom = getAtomLocator(page, { atomLabel: 'Br' }).first();
  await LeftToolbar(page).chain();

  await targetAtom.hover({ force: true });
  await dragMouseTo(500, 350, page);

  await takeElementScreenshot(page, targetAtom, { padding: 80 });

  await CreateMonomerDialog(page).discard();
});

test(`17. Verify that in create monomer wizard: user can use Charge plus and Charge minus tools to charge atoms on the canvas`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that in create monomer wizard: user can use Charge plus and Charge minus tools to charge atoms on the canvas
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Press Charge plus button and click on atom to add positive charge
   *      6. Verify that atom charge got changed
   *      7. Press Charge minus button and click on existing atom to add negative charge
   *      8. Verify that atom charge got changed
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'BrCN');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(500, 250, page);

  const targetAtomBr = getAtomLocator(page, { atomLabel: 'Br' }).first();
  const targetAtomN = getAtomLocator(page, { atomLabel: 'N' }).first();
  await LeftToolbar(page).chargePlus();

  await targetAtomBr.click({ force: true });
  expect(targetAtomBr).toHaveAttribute('data-atomCharge', '1');

  await LeftToolbar(page).chargeMinus();

  await targetAtomN.click({ force: true });
  expect(targetAtomN).toHaveAttribute('data-atomCharge', '-1');

  await CreateMonomerDialog(page).discard();
});

test(`18. Verify that in create monomer wizard: user can use Copy, Paste, Cut buttons and they works correct`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that in create monomer wizard: user can use Copy, Paste, Cut buttons and they works correct
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Select all structure and press Cut button
   *      6. Verify that molecule got removed from canvas
   *      7. Press Paste button and verify that Error message dialog appears
   *      8. Close Error message dialog and paste molecule using keyboard shortcut
   *      9. Verify that molecule got pasted on canvas
   *      10. Select all structure and press Copy button
   *      11. Select all structure and erase it from canvas
   *      12. Verify that molecule got removed from canvas
   *      13. Paste molecule using keyboard shortcut
   *      14. Verify that molecule got pasted on canvas
   *      15. Discard created monomer
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'BrCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(500, 250, page);

  const targetAtom = getAtomLocator(page, { atomLabel: 'Br' }).first();
  const targetBond = getBondLocator(page, {}).first();

  await selectAllStructuresOnCanvas(page);
  await TopLeftToolbar(page).cut();

  expect(targetAtom).not.toBeVisible();
  expect(targetBond).not.toBeVisible();

  await TopLeftToolbar(page).paste();
  expect(ErrorMessageDialog(page).window).toBeVisible();
  await ErrorMessageDialog(page).close();

  await pasteFromClipboardByKeyboard(page);
  await clickOnCanvas(page, 0, 0, { from: 'canvasCenter' });

  await expect(targetAtom).toBeVisible();
  await expect(targetBond).toBeVisible();

  await selectAllStructuresOnCanvas(page);
  await TopLeftToolbar(page).copy();
  await selectAllStructuresOnCanvas(page);
  await CommonLeftToolbar(page).erase();

  expect(targetAtom).not.toBeVisible();
  expect(targetBond).not.toBeVisible();

  await pasteFromClipboardByKeyboard(page);
  await clickOnCanvas(page, 0, 0, { from: 'canvasCenter' });

  await expect(targetAtom).toBeVisible();
  await expect(targetBond).toBeVisible();

  await CreateMonomerDialog(page).discard();
});
