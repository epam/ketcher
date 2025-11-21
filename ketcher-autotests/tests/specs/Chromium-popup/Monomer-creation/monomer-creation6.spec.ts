/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Page, expect } from '@playwright/test';
import { test } from '@fixtures';
import { pasteFromClipboardAndOpenAsNewProject } from '@utils/files/readFile';
import { selectAllStructuresOnCanvas } from '@utils/canvas';
import { clickOnCanvas, shiftCanvas } from '@utils/index';
import { CreateMonomerDialog } from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import {
  AminoAcidNaturalAnalogue,
  MonomerType,
} from '@tests/pages/constants/createMonomerDialog/Constants';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { WarningMessageDialog } from '@tests/pages/molecules/canvas/createMonomer/WarningDialog';

let page: Page;
test.beforeAll(async ({ initMoleculesCanvas }) => {
  page = await initMoleculesCanvas();
});
test.afterAll(async ({ closePage }) => {
  await closePage();
});
test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

test(`1. Check warning messages on Amino acid monomer if R1 attachment point with a leaving group is not equal H`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8587
   * Description: Check warning messages on Amino acid monomer if R1 attachment point with a leaving group is not equal H
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Press Create Monomer button
   *      4. Set mandatory fields in Create Monomer dialog for amino acid monomer
   *      5. Set R1 and R2 attachment point with a leaving group not equal H (e.g. O atom)
   *      6. Press Submit button
   *      7. Verify that warning message dialog is opened
   *      8. Verify that the correct warning message is displayed in the dialog
   *
   * Version 3.10
   */
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    '[*:1]CCC%91.[*:2]%91 |$_R1;;;;_R2$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // shifting canvas to make tooltip appear fully
  await shiftCanvas(page, -150, 50);

  const createMonomerDialog = CreateMonomerDialog(page);
  await createMonomerDialog.selectType(MonomerType.AminoAcid);
  await createMonomerDialog.setSymbol('Temp AminoAcid1');
  await createMonomerDialog.setName('Temp AminoAcid1');
  await createMonomerDialog.selectNaturalAnalogue(AminoAcidNaturalAnalogue.A);

  await RightToolbar(page).clickAtom(Atom.Oxygen);

  await getAtomLocator(page, { atomLabel: 'H' }).first().click({ force: true });
  await getAtomLocator(page, { atomLabel: 'H' }).first().click({ force: true });

  await createMonomerDialog.submit();

  expect(WarningMessageDialog(page).window).toBeVisible();
  expect(await WarningMessageDialog(page).getWarningMessage()).toContain(
    'Amino acid monomers typically have a hydrogen as the leaving group for R1, and a hydroxyl as a leaving group for R2. Do you wish to proceed with the current attachment points?',
  );
});
