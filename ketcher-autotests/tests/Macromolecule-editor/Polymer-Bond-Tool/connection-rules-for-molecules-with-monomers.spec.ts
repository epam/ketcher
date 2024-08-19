/* eslint-disable no-magic-numbers */
import { test } from '@playwright/test';
import {
  addSingleMonomerToCanvas,
  BondType,
  clickOnAtom,
  clickOnBond,
  drawBenzeneRing,
  openFileAndAddToCanvasAsNewProject,
  takeEditorScreenshot,
  turnOnMacromoleculesEditor,
  turnOnMicromoleculesEditor,
  waitForPageInit,
} from '@utils';
import { addSuperatomAttachmentPoint } from '@utils/canvas/atoms/superatomAttachmentPoints';
import { bondTwoMonomersPointToPoint } from '@utils/macromolecules/polymerBond';

test.describe('Connection rules for molecules with monomers: ', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test(`Check that it is possible to establish connection between monomers and molecule`, async ({
    page,
  }) => {
    /*
     *  Github ticket: https://github.com/epam/ketcher/issues/4532
     *  Description: Allow connection of molecule with monomer
     */
    await drawBenzeneRing(page);
    await addSuperatomAttachmentPoint(page, 'C', 0);
    await addSuperatomAttachmentPoint(page, 'C', 1);
    await addSuperatomAttachmentPoint(page, 'C', 1);
    await addSuperatomAttachmentPoint(page, 'C', 2);
    await addSuperatomAttachmentPoint(page, 'C', 3);
    await takeEditorScreenshot(page);

    await turnOnMacromoleculesEditor(page);
    const firstAlanine = await addSingleMonomerToCanvas(
      page,
      'A___Alanine',
      'A',
      100,
      200,
      0,
    );
    const secondAlanine = await addSingleMonomerToCanvas(
      page,
      'A___Alanine',
      'A',
      300,
      200,
      1,
    );
    const thirdAlanine = await addSingleMonomerToCanvas(
      page,
      'A___Alanine',
      'A',
      500,
      200,
      2,
    );

    const molecule = page.getByText('F1').locator('..').first();

    await bondTwoMonomersPointToPoint(page, molecule, firstAlanine, 'R2', 'R1');
    await bondTwoMonomersPointToPoint(
      page,
      molecule,
      secondAlanine,
      'R3',
      'R1',
    );
    await bondTwoMonomersPointToPoint(page, molecule, thirdAlanine, 'R4', 'R2');

    await takeEditorScreenshot(page);
    await turnOnMicromoleculesEditor(page);
    await takeEditorScreenshot(page);
  });

  test(`Delete molecule attachment point with connection between monomer and molecule`, async ({
    page,
  }) => {
    /*
     *  Github ticket: https://github.com/epam/ketcher/issues/4532
     *  Description: Allow connection of molecule with monomer
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/molecule-connected-to-monomers.ket',
      page,
    );
    await clickOnAtom(page, 'C', 10, 'right');
    await page.getByText('Delete').click();
    await takeEditorScreenshot(page);
    await turnOnMacromoleculesEditor(page);
    await takeEditorScreenshot(page);
    await turnOnMicromoleculesEditor(page);
    await takeEditorScreenshot(page);
  });

  test(`Delete connection between monomer and molecule`, async ({ page }) => {
    /*
     *  Github ticket: https://github.com/epam/ketcher/issues/4532
     *  Description: Allow connection of molecule with monomer
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/molecule-connected-to-monomers.ket',
      page,
    );
    await clickOnBond(page, BondType.SINGLE, 18, 'right');
    await page.getByText('Delete').click();
    await takeEditorScreenshot(page);
    await turnOnMacromoleculesEditor(page);
    await takeEditorScreenshot(page);
    await turnOnMicromoleculesEditor(page);
    await takeEditorScreenshot(page);
  });
});
