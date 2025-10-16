/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Page, expect } from '@playwright/test';
import { test } from '@fixtures';
import { pasteFromClipboardAndOpenAsNewProject } from '@utils/files/readFile';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import {
  selectAllStructuresOnCanvas,
  takeElementScreenshot,
} from '@utils/canvas';
import { clickOnCanvas, dragMouseTo } from '@utils/index';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { ConnectionPointOption } from '@tests/pages/constants/contextMenu/Constants';
import { CreateMonomerDialog } from '@tests/pages/molecules/canvas/CreateMonomerDialog';

let page: Page;
test.beforeAll(async ({ initMoleculesCanvas }) => {
  page = await initMoleculesCanvas();
});
test.afterAll(async ({ closePage }) => {
  await closePage();
});
test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

test(`1. Verify that right clicking on a potential LGA on canvas, shows an option in the right-click menu: "Mark as leaving group" (see mockups)`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8268
   * Description: Verify that right clicking on a potential LGA on canvas, shows an option in the right-click menu: "Mark as leaving group" (see mockups)
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. r-click on a potential LGA on canvas
   *      6. Verify that context menu contains option "Mark as leaving group"
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(500, 250, page);

  const targetAtom = getAtomLocator(page, { atomLabel: 'C' }).first();

  await ContextMenu(page, targetAtom).open();

  await expect(
    page.getByTestId(ConnectionPointOption.MarkAsLeavingGroup),
  ).toBeVisible();

  await CreateMonomerDialog(page).discard();
});

test(`2. Check that potential LGA is every atom that has one and only one simple-single bond to another atom in the structure, and is not already an LGA`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8268
   * Description: Check that potential LGA is every atom that has one and only one simple-single bond to another
   *              atom in the structure, and is not already an LGA
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. r-click on a potential LGA on canvas
   *      6. Verify that context menu contains option "Mark as leaving group"
   *      7. Repeat steps 5-6 for every atom in the structure that has one and only one simple-single bond
   *         to another atom in the structure, and is not already an LGA
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'CBr(C)C');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(500, 250, page);

  const targetAtoms = getAtomLocator(page, { atomLabel: 'C' });
  for (const targetAtom of await targetAtoms.all()) {
    await ContextMenu(page, targetAtom).open();
    await expect(
      page.getByTestId(ConnectionPointOption.MarkAsLeavingGroup),
    ).toBeVisible();
    await clickOnCanvas(page, 0, 0);
  }

  await CreateMonomerDialog(page).discard();
});

test(`3. Check that non potential LGA is every atom that has any another kind of bond ( Double, Triple, etc.) to another atom in the structure, and is not already an LGA`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8268
   * Description: Check that non potential LGA is every atom that has any another kind of bond ( Double, Triple, etc.)
   *              to another atom in the structure, and is not already an LGA
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. r-click on a potential LGA on canvas
   *      6. Verify that context menu contains option "Mark as leaving group"
   *      7. Repeat steps 5-6 for every atom in the structure that has one and only one simple-single bond
   *         to another atom in the structure, and is not already an LGA
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(
    page,
    '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',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(600, 260, page);

  const targetAtoms = getAtomLocator(page, { atomLabel: 'C' });
  for (const targetAtom of await targetAtoms.all()) {
    await ContextMenu(page, targetAtom).open();
    await expect(
      page.getByTestId(ConnectionPointOption.MarkAsLeavingGroup),
    ).not.toBeVisible();
    await clickOnCanvas(page, 0, 0);
  }

  await CreateMonomerDialog(page).discard();
});

test(`4. Verify that both potential AAs and potential LGAs are marked on hover only with a dashed teal outline (see mockups)`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8268
   * Description: Verify that both potential AAs and potential LGAs are marked on hover only with a dashed teal outline (see mockups)
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Hover over a potential LGA on canvas
   *      6. Take a screenshot
   *      7. Repeat steps 5-6 for every atom in the structure that has one and only one simple-single bond
   *      6. Verify that context menu contains option "Mark as leaving group"
   *      7. Repeat steps 5-6 for every atom in the structure that has one and only one simple-single bond
   *         to another atom in the structure, and is not already an LGA
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'NP(C)=S');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(600, 260, page);

  const atoms = ['N', 'P', 'C', 'S'];
  for (const atom of atoms) {
    const targetAtom = getAtomLocator(page, { atomLabel: atom }).first();
    await targetAtom.hover();
    await takeElementScreenshot(page, targetAtom, { padding: 25 });
  }
  await CreateMonomerDialog(page).discard();
});
