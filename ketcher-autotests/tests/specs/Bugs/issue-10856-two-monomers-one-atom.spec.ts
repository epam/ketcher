/* eslint-disable max-len */
import { Page, test, expect } from '@fixtures';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvasAsNewProjectMacro,
} from '@utils';
import { AttachmentPoint, getMonomerLocator } from '@utils/macromolecules/monomer';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { bondMonomerPointToMoleculeAtom } from '@utils/macromolecules/polymerBond';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';

let page: Page;

test.describe('Issue #10856: Unable to connect two monomers to the same atom', () => {
  test.beforeAll(async ({ initFlexCanvas }) => {
    page = await initFlexCanvas();
  });

  test.beforeEach(async ({ FlexCanvas: _ }) => {});

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Connects two monomers (R2 and R1) to the same O atom', async () => {
    // https://github.com/epam/ketcher/issues/10856
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Bugs/issue-10856-two-monomers-one-atom.ket',
    );

    const oAtom = getAtomLocator(page, { atomLabel: 'O' }).first();

    await bondMonomerPointToMoleculeAtom(
      page,
      getMonomerLocator(page, Peptide.A).first(),
      oAtom,
      AttachmentPoint.R2,
    );

    await bondMonomerPointToMoleculeAtom(
      page,
      getMonomerLocator(page, Peptide.A).nth(1),
      oAtom,
      AttachmentPoint.R1,
    );

    await takeEditorScreenshot(page);

    const monomerToAtomBonds = page.locator('[data-testid="bond"][data-toatomid]');
    await expect(monomerToAtomBonds).toHaveCount(2);
  });
});