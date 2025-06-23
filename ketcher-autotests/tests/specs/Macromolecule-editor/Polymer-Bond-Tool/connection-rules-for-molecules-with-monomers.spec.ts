/* eslint-disable no-magic-numbers */
import { Chem } from '@constants/monomers/Chem';
import { Peptides } from '@constants/monomers/Peptides';
import { test } from '@playwright/test';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import {
  MicroAtomOption,
  MicroBondOption,
} from '@tests/pages/constants/contextMenu/Constants';
import { Library } from '@tests/pages/macromolecules/Library';
import { drawBenzeneRing } from '@tests/pages/molecules/BottomToolbar';
import {
  addSingleMonomerToCanvas,
  BondType,
  getAtomByIndex,
  openFileAndAddToCanvasAsNewProject,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { addSuperatomAttachmentPoint } from '@utils/canvas/atoms/superatomAttachmentPoints';
import { getBondByIndex } from '@utils/canvas/bonds';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
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

    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await Library(page).switchToPeptidesTab();
    const firstAlanine = await addSingleMonomerToCanvas(
      page,
      Peptides.A,
      100,
      200,
      0,
    );
    const secondAlanine = await addSingleMonomerToCanvas(
      page,
      Peptides.A,
      300,
      200,
      1,
    );
    const thirdAlanine = await addSingleMonomerToCanvas(
      page,
      Peptides.A,
      500,
      200,
      2,
    );

    const molecule = getMonomerLocator(page, Chem.F1);

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
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
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
      page,
      'KET/molecule-connected-to-monomers.ket',
    );
    const point = await getAtomByIndex(page, { label: 'C' }, 10);
    await ContextMenu(page, point).click(MicroAtomOption.Delete);
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await takeEditorScreenshot(page);
  });

  test(`Delete connection between monomer and molecule`, async ({ page }) => {
    /*
     *  Github ticket: https://github.com/epam/ketcher/issues/4532
     *  Description: Allow connection of molecule with monomer
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/molecule-connected-to-monomers.ket',
    );
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 18);
    await ContextMenu(page, point).click(MicroBondOption.Delete);
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await takeEditorScreenshot(page);
  });
});
