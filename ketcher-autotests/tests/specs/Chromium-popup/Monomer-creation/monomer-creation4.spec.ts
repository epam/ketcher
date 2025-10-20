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
import { AttachmentPoint } from '@utils/macromolecules/monomer';

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
    'VmpDRDAxMDAEAwIBAAAAAAAAAAAAAAAAAAAAAAUIBAAAAB4AGggCAAMAGwgCAAQAAAEkAAAAAgACAOn9BQBBcmlhbAMA6f0PAFRpbWVzIE5ldyBSb21hbgADMgAIAP///////wAAAAAAAP//AAAAAP////8AAAAA//8AAAAA/////wAAAAD/////AAD//wGAAAAAABAIAgABAA8IAgABAAQCEAAAIBUBbqJZAAAgygCKXcUBA4AEAAAABIAFAAAAAAIIAAAAPAAAAAAAAAAEgAYAAAAAAggAAAAtAOH6GQAAAASABwAAAAACCAAAAB4AwvUzAAAABIAIAAAAAAIIAAAALQCk8E0AAAAEgAkAAAAAAggAAAAeAITrZwAAAASACgAAAAACCAAAAC0AZeaBAAAABIALAAAAAAIIAAAAHgBH4ZsAAAAEgAwAAAAAAggAAAAtALfetQAAAASADQAAAAACCAAAAB4AmdnPAAAABIAOAAAAAAIIAAAALQB61OkAAAAEgA8AAAAAAggAAAAeAFzPAwEwBAEABzEEEAAOAAAAGQAAABAAAAAFAAAARgQBAAIAAASAEAAAAAACCAAAAC0APModATAEAQAHMQQQAA8AAAAaAAAAGwAAAAUAAABGBAEAAgAABIARAAAAAAIIAAAAAADC9TMAAAAEgBIAAAAAAggAAABLAKTwTQAAAASAEwAAAAACCAAAAAAAhOtnAAAABIAUAAAAAAIIAAAASwBl5oEAAAAEgBUAAAAAAggAAAAAAEfhmwAAAASAFgAAAAACCAAAAEsAt961AAAABIAXAAAAAAIIAAAAAACZ2c8AAAAEgBgAAAAAAggAAABLAHrU6QAAAASAGQAAAAACCAAAAAAAXM8DAQAABIAaAAAAAAIIAAAASwA8yh0BAAAEgBsAAAAAAggAAAAeABzFNwEwBAEABzEEEAAQAAAAHAAAAB0AAAAFAAAARgQBAAIAAASAHAAAAAACCAAAAAAAHMU3AQAABIAdAAAAAAIIAAAALQD8v1EBMAQBAAcxBBAAGwAAAB4AAAAfAAAABQAAAEYEAQACAAAEgB4AAAAAAggAAABLAOa/UQEAAASAHwAAAAAEAgAHADMEAwAAAEEAAggAFAAeABy7awEGgAAAAAAAAggAFAAeABy7awEjCAEAAAAHDgABAAAAAwBgAMgAAABSMQAAAAAFgCAAAAAEBgQABQAAAAUGBAAGAAAAAAYCAAQAAAAFgCEAAAAEBgQABgAAAAUGBAAHAAAAAAAFgCIAAAAEBgQABwAAAAUGBAAIAAAAAAAFgCMAAAAEBgQACAAAAAUGBAAJAAAAAAAFgCQAAAAEBgQACQAAAAUGBAAKAAAAAAAFgCUAAAAEBgQACgAAAAUGBAALAAAAAAAFgCYAAAAEBgQACwAAAAUGBAAMAAAAAAAFgCcAAAAEBgQADAAAAAUGBAANAAAAAAAFgCgAAAAEBgQADQAAAAUGBAAOAAAAAAAFgCkAAAAEBgQADgAAAAUGBAAPAAAAAAAFgCoAAAAEBgQADwAAAAUGBAAQAAAAAAAFgCsAAAAEBgQABwAAAAUGBAARAAAAAAYCAAIAAAAFgCwAAAAEBgQACAAAAAUGBAASAAAAAAYCAP//AAAFgC0AAAAEBgQACQAAAAUGBAATAAAAAAYCAIAAAQYCAAEAAgYCAAEAAAAFgC4AAAAEBgQACgAAAAUGBAAUAAAAAAYCAAMAAAAFgC8AAAAEBgQACwAAAAUGBAAVAAAAAAYCAIEAAAAFgDAAAAAEBgQADAAAAAUGBAAWAAAAAAYCAIIAAAAFgDEAAAAEBgQADQAAAAUGBAAXAAAAAAYCAAAQAAAFgDIAAAAEBgQADgAAAAUGBAAYAAAAAAYCAABAAAAFgDMAAAAEBgQADwAAAAUGBAAZAAAAAQYCAAYAAAAFgDQAAAAEBgQAEAAAAAUGBAAaAAAAAQYCAAMAAAAFgDUAAAAEBgQAEAAAAAUGBAAbAAAAAAAFgDYAAAAEBgQAGwAAAAUGBAAcAAAAAQYCAAgAAAAFgDcAAAAEBgQAGwAAAAUGBAAdAAAAAAAFgDgAAAAEBgQAHQAAAAUGBAAeAAAAAAYCAAIAAQYCAAgAAAAFgDkAAAAEBgQAHQAAAAUGBAAfAAAAAAAHgAAAAAAEAhAAAAAAABy7awEAAAAAHLtrAQAKAgAHAAcKAgALAD0KAgAAAAaAAAAAAAACCAAAAAAAHLtrAQEHAQABCAcBAAAABxIAAQAAAAMAYADIAAAAQ2hpcmFsAAAAAAAAAAAAAAAA',
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

test(`5. Check that after the option "Mark as leaving group" is clicked`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8268
   * Description: Check that after the option "Mark as leaving group" is clicked, an attachment point
   *              with the following attributes is made: The LGA is the atom that was r-clicked, The AA
   *              is the atom that the LGA is connected to, The R-number is the lowest free R-number,
   *              or R1 (if all R-numbers are already occupied)
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. r-click on a potential LGA on canvas
   *      6. Take a screenshot to verify that the AA is the atom that the LGA is connected to, The R-number
   *         is the lowest free R-number,
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C%91%92%93C.[*:2]%91.[*:1]%92.[*:3]%93 |$;;_R2;_R1;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(500, 260, page);

  const targetAtom = getAtomLocator(page, { atomLabel: 'C' });
  await ContextMenu(page, targetAtom).click(
    ConnectionPointOption.MarkAsLeavingGroup,
  );

  await takeElementScreenshot(page, targetAtom, { padding: 100 });

  await CreateMonomerDialog(page).discard();
});

test(`6. Check that right clicking on a potential AA on canvas, shows an option in the right-click menu: "Mark as connection point" (see mockups)`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8268
   * Description: Check that right clicking on a potential AA on canvas, shows an option in the right-click menu: "Mark as connection point" (see mockups)
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. r-click on a potential AA on canvas
   *      6. Verify that context menu contains option "Mark as connection point"
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'CCNCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(500, 250, page);

  const targetAtom = getAtomLocator(page, { atomLabel: 'N' }).first();

  await ContextMenu(page, targetAtom).open();

  await expect(
    page.getByTestId(ConnectionPointOption.MarkAsConnectionPoint),
  ).toBeVisible();

  await CreateMonomerDialog(page).discard();
});

test(`7. Check that right clicking on a non potential AA on canvas, not shows an option in the right-click menu: "Mark as connection point" (for non-potential-AAs the option is disabled) (see mockups)`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8268
   * Description: Check that right clicking on a non potential AA on canvas, not shows an option in the right-click menu: "Mark as connection point" (for non-potential-AAs the option is disabled) (see mockups)
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. r-click on a non potential AA on canvas
   *      6. Verify that context menu does not contain option "Mark as connection point"
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'CCBrCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(500, 250, page);

  const targetAtom = getAtomLocator(page, { atomLabel: 'Br' }).first();

  await ContextMenu(page, targetAtom).open();

  await expect(
    page.getByTestId(ConnectionPointOption.MarkAsConnectionPoint),
  ).not.toBeVisible();

  await CreateMonomerDialog(page).discard();
});

test(`8. Check that potential AA is every atom that is connected to a potential LGA and/or every atom that has implicit hydrogens`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8268
   * Description: Check that potential AA is every atom that is connected to a potential LGA and/or every atom that has implicit hydrogens
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. r-click on a potential AA on canvas
   *      6. Verify that context menu does contain option "Mark as connection point"
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'N(CC)([H])CN(C)CN(N)CN(O)CN(F)CN(CC)Cl',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(500, 250, page);

  const targetAtoms = getAtomLocator(page, { atomLabel: 'N' });
  for (const targetAtom of await targetAtoms.all()) {
    await ContextMenu(page, targetAtom).open();
    await expect(
      page.getByTestId(ConnectionPointOption.MarkAsConnectionPoint),
    ).toBeVisible();
    await clickOnCanvas(page, 0, 0);
  }

  await CreateMonomerDialog(page).discard();
});

test(`9. Check that after the option "Mark as connection point" is clicked, an attachment point with the following attributes is made: The attachment atom is the atom that was r-clicked.`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8268
   * Description: Check that potential AA is every atom that is connected to a potential LGA and/or every atom that has implicit hydrogens
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. r-click on a potential AA on canvas
   *      6. Click "Mark as connection point" option
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'N(CC)([H])CN(C)CN(Br)CN(O)CN(F)CN(CC)Cl',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(550, 350, page);

  const targetAtoms = getAtomLocator(page, { atomLabel: 'N' });
  for (const targetAtom of await targetAtoms.all()) {
    await ContextMenu(page, targetAtom).click(
      ConnectionPointOption.MarkAsConnectionPoint,
    );
    await takeElementScreenshot(page, targetAtom, { padding: 50 });
  }

  await CreateMonomerDialog(page).discard();
});

test(`10. Check that after the option ""Mark as connection point"" is clicked, an attachment point with the following attributes is made: The R-number is the lowest free R-number`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8268
   * Description: Check that after the option ""Mark as connection point"" is clicked, an attachment point with the following attributes is
   *              made: The R-number is the lowest free R-number, or R1 (if all R-numbers are already occupied)
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. r-click on a potential AA on canvas
   *      6. Click "Mark as connection point" option
   *      7. Validate that the R-number is the lowest free R-number (R1)
   *      8. r-click on another potential AA and click "Mark as connection point" option
   *      9. Validate that the R-number is the lowest free R-number (R2)
   *      10. r-click on another potential AA and click "Mark as connection point" option
   *      11. Validate that the R-number is the lowest free R-number (R4)
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'N(CN(CC%91CN(CC%92CN(Cl)CC)O)C)([H])CC.[*:3]%91.[*:5]%92 |$;;;;;;;;;;;;;;;;;;;_R3;_R5$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(550, 350, page);

  const targetAtoms = getAtomLocator(page, { atomLabel: 'N' });
  await ContextMenu(page, targetAtoms.nth(0)).click(
    ConnectionPointOption.MarkAsConnectionPoint,
  );
  const attachmentPointR1 = page.getByTestId(AttachmentPoint.R1).first();
  expect(attachmentPointR1).toBeVisible();

  await ContextMenu(page, targetAtoms.nth(1)).click(
    ConnectionPointOption.MarkAsConnectionPoint,
  );
  const attachmentPointR2 = page.getByTestId(AttachmentPoint.R3).first();
  expect(attachmentPointR2).toBeVisible();

  await ContextMenu(page, targetAtoms.nth(2)).click(
    ConnectionPointOption.MarkAsConnectionPoint,
  );
  const attachmentPointR4 = page.getByTestId(AttachmentPoint.R4).first();
  expect(attachmentPointR4).toBeVisible();

  await CreateMonomerDialog(page).discard();
});

test(`11. Check that if the potential AA is not attached to any potential LGAs, a previously implicit hydrogen should be drawn and set as an LGA`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8268
   * Description: Check that if the potential AA is not attached to any potential LGAs, a previously implicit hydrogen
   *              should be drawn and set as an LGA
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. r-click on a potential AA on canvas
   *      6. Click "Mark as connection point" option
   *      7. Take screenshot to validate that implicit hydrogen is drawn and set as LGA
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'C(NCC)C');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(550, 250, page);

  const targetAtom = getAtomLocator(page, { atomLabel: 'N' }).first();
  await ContextMenu(page, targetAtom).click(
    ConnectionPointOption.MarkAsConnectionPoint,
  );
  await takeElementScreenshot(page, targetAtom, { padding: 50 });

  await CreateMonomerDialog(page).discard();
});

test(`12. Check that right-clicking on that label, gives a menu with two options "Edit attachment point" and "Remove assignment" (see mockups)`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8268
   * Description: Check that right-clicking on that label, gives a menu with two options "Edit attachment point" and "Remove assignment" (see mockups)
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. r-click on a potential AA on canvas
   *      6. Click "Mark as connection point" option
   *      7. r-click on the created attachment point label
   *      8. Verify that context menu contains options "Edit attachment point" and "Remove assignment"
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'C(NCC)C');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(550, 250, page);

  const targetAtom = getAtomLocator(page, { atomLabel: 'N' }).first();
  await ContextMenu(page, targetAtom).click(
    ConnectionPointOption.MarkAsConnectionPoint,
  );

  const attachmentPointR1 = page.getByTestId(AttachmentPoint.R1).first();
  await ContextMenu(page, attachmentPointR1).open();

  await expect(
    page.getByTestId(ConnectionPointOption.EditConnectionPoint),
  ).toBeVisible();
  await expect(
    page.getByTestId(ConnectionPointOption.RemoveAssignment),
  ).toBeVisible();

  await CreateMonomerDialog(page).discard();
});

test(`13. Check that clicking on "Remove assignment", deleted that AP - the LGA and the AA stop being a part of that AP (they are not deleted)" (see mockups)`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8268
   * Description: Check that clicking on "Remove assignment", deleted that AP - the LGA and the AA stop being a part of that AP (they are not deleted)
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. r-click on a potential AA on canvas
   *      6. Click "Mark as connection point" option
   *      7. r-click on the created attachment point label
   *      8. Verify that context menu contains options "Edit attachment point" and "Remove assignment"
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'C(NCC)C');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(550, 250, page);

  const targetAtom = getAtomLocator(page, { atomLabel: 'N' }).first();
  await ContextMenu(page, targetAtom).click(
    ConnectionPointOption.MarkAsConnectionPoint,
  );

  const attachmentPointR1 = page.getByTestId(AttachmentPoint.R1).first();
  await ContextMenu(page, attachmentPointR1).click(
    ConnectionPointOption.RemoveAssignment,
  );

  await expect(attachmentPointR1).not.toBeVisible();

  await CreateMonomerDialog(page).discard();
});
