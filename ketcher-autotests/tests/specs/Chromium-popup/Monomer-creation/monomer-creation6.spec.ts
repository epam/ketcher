/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Page, expect } from '@playwright/test';
import { test } from '@fixtures';
import { pasteFromClipboardAndOpenAsNewProject } from '@utils/files/readFile';
import {
  selectAllStructuresOnCanvas,
  takeEditorScreenshot,
} from '@utils/canvas';
import { clickOnCanvas, shiftCanvas } from '@utils/index';
import { CreateMonomerDialog } from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import {
  AminoAcidNaturalAnalogue,
  MonomerType,
  NucleotideNaturalAnalogue,
} from '@tests/pages/constants/createMonomerDialog/Constants';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { WarningMessageDialog } from '@tests/pages/molecules/canvas/createMonomer/WarningDialog';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';

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
   *      2. Load molecule on canvas (R1 = H, R2 = H)
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
  await createMonomerDialog.setSymbol('TempAminoAcid1');
  await createMonomerDialog.setName('TempAminoAcid1');
  await createMonomerDialog.selectNaturalAnalogue(AminoAcidNaturalAnalogue.A);

  await RightToolbar(page).clickAtom(Atom.Oxygen);

  await getAtomLocator(page, { atomLabel: 'H' }).first().click({ force: true });
  await getAtomLocator(page, { atomLabel: 'H' }).first().click({ force: true });

  await createMonomerDialog.submit();

  await expect(WarningMessageDialog(page).window).toBeVisible();
  expect(await WarningMessageDialog(page).getWarningMessage()).toContain(
    'Amino acid monomers typically have a hydrogen as the leaving group for R1, and a hydroxyl as a leaving group for R2. Do you wish to proceed with the current attachment points?',
  );
  await WarningMessageDialog(page).cancel();
  await createMonomerDialog.discard();
});

test(`2. Check warning messages on Amino acid monomer if R2 attachment point with a leaving group is not equal OH`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8587
   * Description: Check warning messages on Amino acid monomer if R2 attachment point with a leaving group is not equal OH
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas (R1 = H, R2 = H)
   *      3. Press Create Monomer button
   *      4. Set mandatory fields in Create Monomer dialog for amino acid monomer
   *      5. Press Submit button
   *      6. Verify that warning message dialog is opened
   *      7. Verify that the correct warning message is displayed in the dialog
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
  await createMonomerDialog.setSymbol('TempAminoAcid1');
  await createMonomerDialog.setName('TempAminoAcid1');
  await createMonomerDialog.selectNaturalAnalogue(AminoAcidNaturalAnalogue.A);

  await createMonomerDialog.submit();

  await expect(WarningMessageDialog(page).window).toBeVisible();
  expect(await WarningMessageDialog(page).getWarningMessage()).toContain(
    'Amino acid monomers typically have a hydrogen as the leaving group for R1, and a hydroxyl as a leaving group for R2. Do you wish to proceed with the current attachment points?',
  );
  await WarningMessageDialog(page).cancel();
  await createMonomerDialog.discard();
});

test(`3. Check warning messages on Sugar monomer if R1 attachment point with a leaving group is not equal H`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8587
   * Description: Check warning messages on Sugar monomer if R1 attachment point with a leaving group is not equal H
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas (R1 = H, R2 = H, R3 = H)
   *      3. Press Create Monomer button
   *      4. Set mandatory fields in Create Monomer dialog for amino acid monomer
   *      5. Set R1 and R3 attachment point with a leaving group not equal H (e.g. O atom)
   *      6. Press Submit button
   *      7. Verify that warning message dialog is opened
   *      8. Verify that the correct warning message is displayed in the dialog
   *
   * Version 3.10
   */
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    '[*:1]CC%91C%92.[*:2]%92.[*:3]%91 |$_R1;;;;_R2;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // shifting canvas to make tooltip appear fully
  await shiftCanvas(page, -150, 50);

  const createMonomerDialog = CreateMonomerDialog(page);
  await createMonomerDialog.selectType(MonomerType.Sugar);
  await createMonomerDialog.setSymbol('TempSugar1');
  await createMonomerDialog.setName('TempSugar1');

  await RightToolbar(page).clickAtom(Atom.Oxygen);
  await getAtomLocator(page, { atomLabel: 'H' }).first().click({ force: true });
  await getAtomLocator(page, { atomLabel: 'H' }).nth(1).click({ force: true });
  // (R1 = OH, R2 = H, R3 = OH)

  await createMonomerDialog.submit();

  await expect(WarningMessageDialog(page).window).toBeVisible();
  expect(await WarningMessageDialog(page).getWarningMessage()).toContain(
    'Sugar monomers typically have a hydrogen as the leaving group for R1 and R2, and a hydroxyl as a leaving group for R3. Do you wish to proceed with the current attachment points?',
  );

  await WarningMessageDialog(page).cancel();
  await createMonomerDialog.discard();
});

test(`4. Check warning messages on Sugar monomer if R2 attachment point with a leaving group is not equal H`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8587
   * Description: Check warning messages on Sugar monomer if R2 attachment point with a leaving group is not equal H
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas (R1 = H, R2 = H, R3 = H)
   *      3. Press Create Monomer button
   *      4. Set mandatory fields in Create Monomer dialog for amino acid monomer
   *      5. Set R2 and R3 attachment point with a leaving group not equal H (e.g. O atom)
   *      6. Press Submit button
   *      7. Verify that warning message dialog is opened
   *      8. Verify that the correct warning message is displayed in the dialog
   *
   * Version 3.10
   */
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    '[*:1]CC%91C%92.[*:2]%92.[*:3]%91 |$_R1;;;;_R2;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // shifting canvas to make tooltip appear fully
  await shiftCanvas(page, -150, 50);

  const createMonomerDialog = CreateMonomerDialog(page);
  await createMonomerDialog.selectType(MonomerType.Sugar);
  await createMonomerDialog.setSymbol('TempSugar1');
  await createMonomerDialog.setName('TempSugar1');

  await RightToolbar(page).clickAtom(Atom.Oxygen);
  await getAtomLocator(page, { atomLabel: 'H' }).nth(1).click({ force: true });
  await getAtomLocator(page, { atomLabel: 'H' }).nth(1).click({ force: true });
  // (R1 = H, R2 = OH, R3 = OH)

  await createMonomerDialog.submit();

  await expect(WarningMessageDialog(page).window).toBeVisible();
  expect(await WarningMessageDialog(page).getWarningMessage()).toContain(
    'Sugar monomers typically have a hydrogen as the leaving group for R1 and R2, and a hydroxyl as a leaving group for R3. Do you wish to proceed with the current attachment points?',
  );

  await WarningMessageDialog(page).cancel();
  await createMonomerDialog.discard();
});

test(`5. Check warning messages on Sugar monomer if R3 attachment point with a leaving group is not equal OH`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8587
   * Description: Check warning messages on Sugar monomer if R3 attachment point with a leaving group is not equal OH
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas (R1 = H, R2 = H, R3 = H)
   *      3. Press Create Monomer button
   *      4. Set mandatory fields in Create Monomer dialog for amino acid monomer
   *      5. Press Submit button
   *      6. Verify that warning message dialog is opened
   *      7. Verify that the correct warning message is displayed in the dialog
   *
   * Version 3.10
   */
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    '[*:1]CC%91C%92.[*:2]%92.[*:3]%91 |$_R1;;;;_R2;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // shifting canvas to make tooltip appear fully
  await shiftCanvas(page, -150, 50);

  const createMonomerDialog = CreateMonomerDialog(page);
  await createMonomerDialog.selectType(MonomerType.Sugar);
  await createMonomerDialog.setSymbol('TempSugar1');
  await createMonomerDialog.setName('TempSugar1');

  // (R1 = H, R2 = H, R3 = H)

  await createMonomerDialog.submit();

  await expect(WarningMessageDialog(page).window).toBeVisible();
  expect(await WarningMessageDialog(page).getWarningMessage()).toContain(
    'Sugar monomers typically have a hydrogen as the leaving group for R1 and R2, and a hydroxyl as a leaving group for R3. Do you wish to proceed with the current attachment points?',
  );

  await WarningMessageDialog(page).cancel();
  await createMonomerDialog.discard();
});

test(`6. Check warning messages on Base monomer if R1 attachment point with a leaving group is not equal OH`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8587
   * Description: Check warning messages on Base monomer if R1 attachment point with a leaving group is not equal OH
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas (R1 = H)
   *      3. Press Create Monomer button
   *      4. Set mandatory fields in Create Monomer dialog for amino acid monomer
   *      5. Press Submit button
   *      6. Verify that warning message dialog is opened
   *      7. Verify that the correct warning message is displayed in the dialog
   *
   * Version 3.10
   */
  await pasteFromClipboardAndOpenAsNewProject(page, '[*:1]CC |$_R1;;$|');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // shifting canvas to make tooltip appear fully
  await shiftCanvas(page, -150, 50);

  const createMonomerDialog = CreateMonomerDialog(page);
  await createMonomerDialog.selectType(MonomerType.Base);
  await createMonomerDialog.setSymbol('TempBase1');
  await createMonomerDialog.setName('TempBase1');
  await createMonomerDialog.selectNaturalAnalogue(NucleotideNaturalAnalogue.A);

  // (R1 = H)

  await createMonomerDialog.submit();

  await expect(WarningMessageDialog(page).window).toBeVisible();
  expect(await WarningMessageDialog(page).getWarningMessage()).toContain(
    'Base monomers typically have a hydroxyl as the leaving group for R1. Do you wish to proceed with the current attachment points?',
  );

  await WarningMessageDialog(page).cancel();
  await createMonomerDialog.discard();
});

test(`7. Check warning messages on Phosphate monomer if R1 attachment point with a leaving group is not equal OH`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8587
   * Description: Check warning messages on Phosphate monomer if R1 attachment point with a leaving group is not equal OH
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas (R1 = H, R2 = H)
   *      3. Press Create Monomer button
   *      4. Set mandatory fields in Create Monomer dialog for phosphate monomer
   *      5. Set R2 attachment point with a leaving group not equal H (e.g. O atom)
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
  await createMonomerDialog.selectType(MonomerType.Phosphate);
  await createMonomerDialog.setSymbol('TempPhosphate1');
  await createMonomerDialog.setName('TempPhosphate1');

  await RightToolbar(page).clickAtom(Atom.Oxygen);

  await getAtomLocator(page, { atomLabel: 'H' }).nth(1).click({ force: true });
  // (R1 = H, R2 = OH)

  await createMonomerDialog.submit();

  await expect(WarningMessageDialog(page).window).toBeVisible();
  expect(await WarningMessageDialog(page).getWarningMessage()).toContain(
    'Phosphate monomers typically have a hydroxyl as the leaving group for R1 and R2. Do you wish to proceed with the current attachment points?',
  );
  await WarningMessageDialog(page).cancel();
  await createMonomerDialog.discard();
});

test(`8. Check warning messages on Phosphate monomer if R2 attachment point with a leaving group is not equal OH`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8587
   * Description: Check warning messages on Phosphate monomer if R2 attachment point with a leaving group is not equal OH
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas (R1 = H, R2 = H)
   *      3. Press Create Monomer button
   *      4. Set mandatory fields in Create Monomer dialog for phosphate monomer
   *      5. Set R1 attachment point with a leaving group not equal H (e.g. O atom)
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
  await createMonomerDialog.selectType(MonomerType.Phosphate);
  await createMonomerDialog.setSymbol('TempPhosphate1');
  await createMonomerDialog.setName('TempPhosphate1');

  await RightToolbar(page).clickAtom(Atom.Oxygen);

  await getAtomLocator(page, { atomLabel: 'H' }).first().click({ force: true });
  // (R1 = OH, R2 = H)

  await createMonomerDialog.submit();

  await expect(WarningMessageDialog(page).window).toBeVisible();
  expect(await WarningMessageDialog(page).getWarningMessage()).toContain(
    'Phosphate monomers typically have a hydroxyl as the leaving group for R1 and R2. Do you wish to proceed with the current attachment points?',
  );
  await WarningMessageDialog(page).cancel();
  await createMonomerDialog.discard();
});

test(`9. Check warning messages on Nucleotide monomer if R1 attachment point with a leaving group is not equal H`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8587
   * Description: Check warning messages on Nucleotide monomer if R1 attachment point with a leaving group is not equal H
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas (R1 = H, R2 = H)
   *      3. Press Create Monomer button
   *      4. Set mandatory fields in Create Monomer dialog for nucleotide monomer
   *      5. Set R2 attachment point with a leaving group not equal H (e.g. O atom)
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
  await createMonomerDialog.selectType(MonomerType.Nucleotide);
  await createMonomerDialog.setSymbol('TempNucleotide1');
  await createMonomerDialog.setName('TempNucleotide1');
  await createMonomerDialog.selectNaturalAnalogue(NucleotideNaturalAnalogue.A);

  await RightToolbar(page).clickAtom(Atom.Oxygen);

  await getAtomLocator(page, { atomLabel: 'H' }).first().click({ force: true });
  await getAtomLocator(page, { atomLabel: 'H' }).first().click({ force: true });
  // (R1 = OH, R2 = OH)

  await createMonomerDialog.submit();

  await expect(WarningMessageDialog(page).window).toBeVisible();
  expect(await WarningMessageDialog(page).getWarningMessage()).toContain(
    'Nucleotide monomers typically have a hydrogen as the leaving group for R1, and a hydroxyl as a leaving group for R2. Do you wish to proceed with the current attachment points?',
  );
  await WarningMessageDialog(page).cancel();
  await createMonomerDialog.discard();
});

test(`10. Check warning messages on Nucleotide monomer if R2 attachment point with a leaving group is not equal OH`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8587
   * Description: Check warning messages on Nucleotide monomer if R2 attachment point with a leaving group is not equal OH
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas (R1 = H, R2 = H)
   *      3. Press Create Monomer button
   *      4. Set mandatory fields in Create Monomer dialog for phosphate monomer
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
  await createMonomerDialog.selectType(MonomerType.Nucleotide);
  await createMonomerDialog.setSymbol('TempNucleotide1');
  await createMonomerDialog.setName('TempNucleotide1');
  await createMonomerDialog.selectNaturalAnalogue(NucleotideNaturalAnalogue.A);

  // (R1 = H, R2 = H)

  await createMonomerDialog.submit();

  await expect(WarningMessageDialog(page).window).toBeVisible();
  expect(await WarningMessageDialog(page).getWarningMessage()).toContain(
    'Nucleotide monomers typically have a hydrogen as the leaving group for R1, and a hydroxyl as a leaving group for R2. Do you wish to proceed with the current attachment points?',
  );
  await WarningMessageDialog(page).cancel();
  await createMonomerDialog.discard();
});

test(`11. Verify that clicking on "Yes" saves the monomer as is IF there are no other error messages triggered`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8587
   * Description: Verify that clicking on "Yes" saves the monomer as is IF there are no other error messages triggered
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas (R1 = H, R2 = H)
   *      3. Press Create Monomer button
   *      4. Set mandatory fields in Create Monomer dialog for phosphate monomer
   *      6. Press Submit button
   *      7. Press Yes button in the warning message dialog
   *      8. Verify that the monomer is created and added to the monomer library
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
  await createMonomerDialog.selectType(MonomerType.Nucleotide);
  await createMonomerDialog.setSymbol('TempNucleotide1');
  await createMonomerDialog.setName('TempNucleotide1');
  await createMonomerDialog.selectNaturalAnalogue(NucleotideNaturalAnalogue.A);

  // (R1 = H, R2 = H)

  await createMonomerDialog.submit();

  await WarningMessageDialog(page).ok();
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
  const monomerOnCanvas = getMonomerLocator(page, {
    monomerAlias: 'TempNucleotide1',
  });
  await expect(monomerOnCanvas).toBeVisible();
});

test(`12. Verify that clicking on "Cancel" returns the user to the monomer creation wizard`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8587
   * Description: Verify that clicking on "Cancel" returns the user to the monomer creation wizard
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas (R1 = H, R2 = H)
   *      3. Press Create Monomer button
   *      4. Set mandatory fields in Create Monomer dialog for phosphate monomer
   *      6. Press Submit button
   *      7. Press Cancel button in the warning message dialog
   *      8. Take screenshot to validate that we are in the Create Monomer dialog
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
  await createMonomerDialog.selectType(MonomerType.Nucleotide);
  await createMonomerDialog.setSymbol('TempNucleotide2');
  await createMonomerDialog.setName('TempNucleotide2');
  await createMonomerDialog.selectNaturalAnalogue(NucleotideNaturalAnalogue.A);

  // (R1 = H, R2 = H)

  await createMonomerDialog.submit();

  await WarningMessageDialog(page).cancel();
  await takeEditorScreenshot(page);
  await createMonomerDialog.discard();
});

test(`13. Verify that Clicking on X returns the user to the monomer creation wizard`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8587
   * Description: Verify that Clicking on X returns the user to the monomer creation wizard
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas (R1 = H, R2 = H)
   *      3. Press Create Monomer button
   *      4. Set mandatory fields in Create Monomer dialog for phosphate monomer
   *      6. Press Submit button
   *      7. Press Cancel button in the warning message dialog
   *      8. Take screenshot to validate that we are in the Create Monomer dialog
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
  await createMonomerDialog.selectType(MonomerType.Nucleotide);
  await createMonomerDialog.setSymbol('TempNucleotide2');
  await createMonomerDialog.setName('TempNucleotide2');
  await createMonomerDialog.selectNaturalAnalogue(NucleotideNaturalAnalogue.A);

  // (R1 = H, R2 = H)

  await createMonomerDialog.submit();

  await WarningMessageDialog(page).closeWindow();
  await takeEditorScreenshot(page);
  await createMonomerDialog.discard();
});
