import { Page, test, expect } from '@fixtures';
import {
  clickInTheMiddleOfTheCanvas,
  MacroFileType,
  openFileAndAddToCanvasAsNewProjectMacro,
  pasteFromClipboardAndAddToCanvas,
  pasteFromClipboardAndOpenAsNewProject,
  pasteFromClipboardAndOpenAsNewProjectMacro,
} from '@utils';

import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { MonomerOnMicroOption } from '@tests/pages/constants/contextMenu/Constants';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';
import { ErrorMessageDialog } from '@tests/pages/common/ErrorMessageDialog';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { getAbbreviationLocator } from '@utils/canvas/s-group-signes/getAbbreviationLocator';

let page: Page;

type AtomState = {
  id: number;
  label: string;
  implicitH: number;
  badConn: boolean;
  sgroupCount: number;
};

type BondState = { id: number; begin: number; end: number; type: number };

async function getBondPixelLength(
  page: Page,
  bond: { begin: number; end: number },
) {
  const bondLocator = page.locator(
    `[data-testid="bond"][data-fromatomid="${bond.begin}"][data-toatomid="${bond.end}"]`,
  );
  const box = await bondLocator.boundingBox();
  if (!box) {
    throw new Error(
      `Expected bond ${bond.begin}-${bond.end} to be visible on canvas`,
    );
  }
  return Math.hypot(box.width, box.height);
}

test.describe('Ketcher bugs in 3.19.0', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });

  test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1: Save oversized macromolecule schema as MDL Molfile V2000 upgrades to V3000', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6142
     * Description: Oversized structures saved via the V2000 option are auto-upgraded to V3000
     * instead of failing with a generic error toast.
     * Scenario:
     * 1. Go to Macro - Flex mode
     * 2. Load schema with many monomers and varied connections
     * 3. Switch to Molecules mode
     * 4. Save as MDL Molfile V2000
     * 5. Verify preview contains V3000 markers and Warnings tab shows upgrade notice
     */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/schema-nucleotide-with-different-monomers.ket',
    );
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.MDLMolfileV2000,
    );

    const preview = await SaveStructureDialog(page).getTextAreaValue();
    expect(preview).toMatch(/M\s+V30|V30 COUNTS/);
    expect(await ErrorMessageDialog(page).isVisible()).toBe(false);

    await SaveStructureDialog(page).switchToWarningsTab();
    const warnings = await SaveStructureDialog(page).getWarningTextAreaValue();
    expect(warnings).toContain('V3000');

    await SaveStructureDialog(page).cancel();
  });

  test('Case 2: Molecule pasted from clipboard loads when it ends with carriage returns', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/3884
     * Description: SMILES is a single-line format, but trailing carriage returns left over
     * by a copy-paste made Indigo read the input as a multi-line molfile/rxnfile, so it
     * failed with "Convert error! ... 'RXN loader: bad header P'" instead of loading it.
     * Scenario:
     * 1. Go to Molecules mode (clean canvas)
     * 2. Open... - Paste from clipboard - paste 'P' followed by several carriage returns
     * 3. Press Open as New Project
     * 4. Verify that the phosphorus atom is loaded and no error message is shown
     * 5. Repeat for the Add to Canvas button
     */
    // a textarea normalizes pasted carriage returns to line feeds
    const smilesWithTrailingCarriageReturns = 'P\n\n\n';

    await pasteFromClipboardAndOpenAsNewProject(
      page,
      smilesWithTrailingCarriageReturns,
    );
    expect(await ErrorMessageDialog(page).isVisible()).toBe(false);
    await expect(getAtomLocator(page, { atomLabel: 'P' })).toHaveCount(1);

    await CommonTopLeftToolbar(page).clearCanvas();

    await pasteFromClipboardAndAddToCanvas(
      page,
      smilesWithTrailingCarriageReturns,
    );
    await clickInTheMiddleOfTheCanvas(page);
    expect(await ErrorMessageDialog(page).isVisible()).toBe(false);
    await expect(getAtomLocator(page, { atomLabel: 'P' })).toHaveCount(1);
  });

  test('Case 3: "Remove Grouping" expands a collapsed monomer before removing its group', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/11312
     * Description: "Remove Grouping" deleted a monomer's S-group without
     * recomputing implicit-hydrogen/valence state on the freed atoms, so the
     * exposed carbonyl carbon kept a stale valence-error flag (red underline),
     * the nitrogen rendered as "N" instead of "NH", and the resulting stray
     * label shortened the bond to a still-collapsed neighboring monomer.
     * Scenario:
     * 1. Go to Macromolecules mode
     * 2. Load from HELM: PEPTIDE1{A.A.A}$$$$V2.0
     * 3. Switch to Molecules mode
     * 4. Right-click the center monomer and select "Remove Grouping"
     * 5. Verify the exposed atoms carry no stale valence-error flag, the
     *    nitrogen shows its implicit hydrogen, and the bond to each
     *    still-collapsed neighbor isn't clipped short
     */
    await pasteFromClipboardAndOpenAsNewProjectMacro(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.A.A}$$$$V2.0',
    );
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();

    const remainingAbbreviations = getAbbreviationLocator(page, { name: 'A' });

    await ContextMenu(page, remainingAbbreviations.nth(1)).click(
      MonomerOnMicroOption.RemoveGrouping,
    );

    // The two outer monomers stay collapsed; only the center one is expanded.
    await expect(remainingAbbreviations).toHaveCount(2);

    const { atoms, bonds } = await page.evaluate(() => {
      const molecule = window.ketcher.editor.render.ctab.molecule;
      const atomEntries = Array.from(molecule.atoms.entries()).map(
        ([id, atom]) => ({
          id,
          label: atom.label,
          implicitH: atom.implicitH,
          badConn: atom.badConn,
          sgroupCount: atom.sgs.size,
        }),
      );
      const bondEntries = Array.from(molecule.bonds.entries()).map(
        ([id, bond]) => ({
          id,
          begin: bond.begin,
          end: bond.end,
          type: bond.type,
        }),
      );
      return { atoms: atomEntries, bonds: bondEntries };
    });

    // The exposed alanine's own atoms are the ones no longer inside any S-group.
    const exposedAtoms = atoms.filter(
      (atom: AtomState) => atom.sgroupCount === 0,
    );
    expect(exposedAtoms).toHaveLength(5); // N, C-alpha, C(=O), O, CH3

    // None of the just-exposed atoms should be left with a stale
    // valence-error flag. (Atoms belonging to the still-collapsed sibling
    // monomers are out of scope: a collapsed abbreviation's internal atoms
    // carry an intentionally unresolved placeholder structure - e.g. the
    // leaving group from its own peptide bond - until that monomer is itself
    // expanded, which this action does not do for its neighbors.)
    const exposedAtomsWithBadConn = exposedAtoms.filter(
      (atom: AtomState) => atom.badConn,
    );
    expect(exposedAtomsWithBadConn).toEqual([]);

    const exposedNitrogenAtoms = exposedAtoms.filter(
      (atom) => atom.label === 'N',
    );
    expect(exposedNitrogenAtoms).toHaveLength(1);
    expect(exposedNitrogenAtoms[0].implicitH).toBe(1);
    await expect(getAtomLocator(page, { atomLabel: 'N' })).toHaveCount(1);

    // The bond(s) crossing into a still-collapsed neighbor shouldn't be
    // clipped shorter than an ordinary bond inside the exposed monomer.
    const exposedIds = new Set(exposedAtoms.map((atom) => atom.id));
    const crossMonomerBonds = bonds.filter(
      (bond: BondState) =>
        exposedIds.has(bond.begin) !== exposedIds.has(bond.end),
    );
    const siblingBond = bonds.find(
      (bond: BondState) =>
        exposedIds.has(bond.begin) &&
        exposedIds.has(bond.end) &&
        bond.type === 1,
    );
    expect(crossMonomerBonds.length).toBeGreaterThan(0);
    if (!siblingBond) {
      throw new Error(
        'Expected to find a sibling single bond inside the exposed monomer',
      );
    }

    const siblingLength = await getBondPixelLength(page, siblingBond);
    for (const bond of crossMonomerBonds) {
      const length = await getBondPixelLength(page, bond);
      expect(length).toBeGreaterThan(siblingLength * 0.7);
    }
  });
});
