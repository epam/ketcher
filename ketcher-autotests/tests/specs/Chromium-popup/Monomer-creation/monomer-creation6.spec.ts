/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Page, expect } from '@playwright/test';
import { test } from '@fixtures';
import { pasteFromClipboardAndOpenAsNewProject } from '@utils/files/readFile';
import { selectAllStructuresOnCanvas } from '@utils/canvas';
import { clickOnCanvas } from '@utils/index';
import { createMonomer } from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import {
  AminoAcidNaturalAnalogue,
  MonomerType,
} from '@tests/pages/constants/createMonomerDialog/Constants';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { NotificationMessageBanner } from '@tests/pages/molecules/canvas/createMonomer/NotificationMessageBanner';
import { ErrorMessage } from '@tests/pages/constants/notificationMessageBanner/Constants';

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
   *      5. Set modification type by clicking on + Add modification type and selecting Citrullination type from dropdown
   *      6. Press Submit button
   *      7. Switch to Macromolecules mode
   *      8. Verify that the created monomer is present on the canvas
   *      9. Hover the monomer and open the tooltip
   *     10. Verify that the modification type is displayed in the tooltip
   *
   * Version 3.10
   */
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C%91%92C.[*:2]%91.[*:1]%92 |$;;_R2;_R1$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);

  await createMonomer(
    page,
    {
      type: MonomerType.AminoAcid,
      symbol: Peptide.Peptide.alias,
      name: 'Peptide Test monomer',
      naturalAnalogue: AminoAcidNaturalAnalogue.A,
    },
    false,
  );

  expect(
    await NotificationMessageBanner(
      page,
      ErrorMessage.notUniqueHELMAlias,
    ).getNotificationMessage(),
  ).toEqual('The HELM alias must be unique amongst peptide or RNA monomers.');
});
