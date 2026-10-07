import { fromSgroupDeletion } from 'application/editor/actions/sgroup';
import { MacromoleculesConverter } from 'application/editor/MacromoleculesConverter';
import { Render } from 'application/render';
import type { RenderOptions } from 'application/render/render.types';
import { ReStruct } from 'application/render/restruct';
import {
  Atom,
  Bond,
  SGroup,
  SGroupAttachmentPoint,
  Struct,
  Vec2,
} from 'domain/entities';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { MonomerMicromolecule } from 'domain/entities/monomerMicromolecule';
import { Peptide } from 'domain/entities/Peptide';
import { getAttachmentPointStereoBond } from 'domain/helpers/getAttachmentPointStereoBond';
import { peptideMonomerItem } from '../../mock-data';

jest.mock('domain/helpers/getAttachmentPointStereoBond', () => ({
  getAttachmentPointStereoBond: jest.fn(),
}));

const createMonomerSGroup = (struct: Struct, atomId: number) => {
  // A realistic (non-empty) internal struct is required: the converter only
  // populates its atom-id map for a monomer while iterating its own atoms
  // (MacromoleculesConverter.ts:203-213), so an empty struct silently breaks
  // the round trip back to Molecules mode regardless of the fix under test.
  const monomerStruct = new Struct();
  monomerStruct.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) }));
  const monomer = new Peptide({
    ...peptideMonomerItem,
    struct: monomerStruct,
    attachmentPoints: [
      { label: 'R1', attachmentAtom: 0, leavingGroup: { atoms: [] } },
      { label: 'R2', attachmentAtom: 0, leavingGroup: { atoms: [] } },
    ],
  });
  monomer.monomerItem.expanded = true;
  const sgroup = new MonomerMicromolecule(SGroup.TYPES.SUP, monomer);
  const sgroupId = struct.sgroups.add(sgroup);
  sgroup.id = sgroupId;
  sgroup.data.expanded = true;
  const atom = struct.atoms.get(atomId);
  sgroup.pp = atom ? new Vec2(atom.pp) : new Vec2();
  struct.atomAddToSGroup(sgroupId, atomId);
  return sgroupId;
};

const addAttachmentPoint = (
  struct: Struct,
  sgroupId: number,
  atomId: number,
  attachmentPointNumber: number,
) => {
  const sgroup = struct.sgroups.get(sgroupId);
  if (!sgroup) {
    return;
  }
  sgroup.addAttachmentPoint(
    new SGroupAttachmentPoint(
      atomId,
      undefined,
      undefined,
      attachmentPointNumber,
    ),
  );
};

// Regression test for https://github.com/epam/ketcher/issues/11310:
// ungrouping ("Remove Grouping") one side of a monomer-to-monomer bond in
// Molecules mode, then round-tripping through the Macro/Micro converter,
// must keep the surviving monomer connected to the now-expanded molecule.
describe('MacromoleculesConverter.convertStructToDrawingEntities', () => {
  afterEach(() => {
    (getAttachmentPointStereoBond as jest.Mock).mockReset();
  });

  it('reconnects a monomer to a molecule atom via the correct attachment point after the other side was ungrouped', () => {
    const struct = new Struct();
    const atom1Id = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(0, 0) }),
    );
    const atom2Id = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(1, 0) }),
    );
    const bondId = struct.bonds.add(
      new Bond({
        begin: atom1Id,
        end: atom2Id,
        type: Bond.PATTERN.TYPE.SINGLE,
        beginSuperatomAttachmentPointNumber: 2,
        endSuperatomAttachmentPointNumber: 1,
      }),
    );
    struct.bondInitHalfBonds(bondId);
    struct.initNeighbors();

    const firstMonomerSGroupId = createMonomerSGroup(struct, atom1Id);
    const secondMonomerSGroupId = createMonomerSGroup(struct, atom2Id);
    addAttachmentPoint(struct, firstMonomerSGroupId, atom1Id, 2);
    addAttachmentPoint(struct, secondMonomerSGroupId, atom2Id, 1);

    const options = {
      scale: 40,
      width: 100,
      height: 100,
    } as unknown as RenderOptions;
    const render = new Render(document as unknown as HTMLElement, options);
    const restruct = new ReStruct(struct, render);

    // "Remove Grouping" on the first monomer only, leaving the second
    // monomer's superatom intact — same as the reported repro steps.
    fromSgroupDeletion(restruct, firstMonomerSGroupId);

    const drawingEntitiesManager = new DrawingEntitiesManager();
    MacromoleculesConverter.convertStructToDrawingEntities(
      struct,
      drawingEntitiesManager,
    );

    const monomer = [...drawingEntitiesManager.monomers.values()][0];
    expect(monomer).toBeDefined();
    expect(drawingEntitiesManager.monomerToAtomBonds.size).toBe(1);
    const [monomerToAtomBond] = [
      ...drawingEntitiesManager.monomerToAtomBonds.values(),
    ];
    // attachmentPointsToBonds is pre-populated with `null` for every valid
    // AP (see BaseMonomer.getAttachmentPointDict), so `toBeDefined()` alone
    // would pass even for an AP the bond was never actually assigned to —
    // assert identity with the created bond instead.
    expect(monomer.attachmentPointsToBonds.R1).toBe(monomerToAtomBond);
    expect(monomer.attachmentPointsToBonds.R2).toBeNull();

    // Full round trip: convert back to Molecules mode and confirm the bond
    // (and the molecule atom's recalculated implicit H) survives intact.
    const { struct: convertedStruct, conversionErrorMessage } =
      MacromoleculesConverter.convertDrawingEntitiesToStruct(
        drawingEntitiesManager,
        new Struct(),
      );

    expect(conversionErrorMessage).toBeFalsy();
    expect(convertedStruct.bonds.size).toBe(1);
    convertedStruct.atoms.forEach((atom) => {
      // Each atom in this minimal fixture has exactly one explicit bond
      // (the reconnected cross-bond), so it should carry exactly 3 implicit
      // hydrogens — not the 4 of a fully disconnected atom.
      expect(atom.implicitH).toBe(3);
    });
  });

  // Regression test for the implicit-hydrogen fallout of the same bug:
  // Editor.switchToMicromolecules() passes the *existing* Molecules-mode
  // Struct instance back into convertDrawingEntitiesToStruct rather than a
  // fresh one, so it can already carry half-bonds from before the mode
  // switch. struct.findConnectedComponents() only rebuilds half-bonds/
  // neighbors when struct.halfBonds is empty, so without clearing it first,
  // every bond added during this conversion (including the reconnected
  // cross-bond) was silently left out of atom.neighbors, undercounting
  // valence and hiding the "C" label on a fully-substituted carbon.
  it('recalculates neighbors and implicit H for a reused (non-empty halfBonds) target struct', () => {
    const struct = new Struct();
    const alphaCId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(0, 0) }),
    );
    const carbonylCId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(1, 0) }),
    );
    const oId = struct.atoms.add(new Atom({ label: 'O', pp: new Vec2(1, -1) }));
    const atom2Id = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(2, 0) }),
    );

    const internalBond1 = struct.bonds.add(
      new Bond({
        begin: alphaCId,
        end: carbonylCId,
        type: Bond.PATTERN.TYPE.SINGLE,
      }),
    );
    const internalBond2 = struct.bonds.add(
      new Bond({
        begin: carbonylCId,
        end: oId,
        type: Bond.PATTERN.TYPE.DOUBLE,
      }),
    );
    const crossBondId = struct.bonds.add(
      new Bond({
        begin: carbonylCId,
        end: atom2Id,
        type: Bond.PATTERN.TYPE.SINGLE,
        beginSuperatomAttachmentPointNumber: 2,
        endSuperatomAttachmentPointNumber: 1,
      }),
    );
    struct.bondInitHalfBonds(internalBond1);
    struct.bondInitHalfBonds(internalBond2);
    struct.bondInitHalfBonds(crossBondId);
    struct.initNeighbors();

    const firstMonomerSGroupId = createMonomerSGroup(struct, carbonylCId);
    struct.atomAddToSGroup(firstMonomerSGroupId, alphaCId);
    struct.atomAddToSGroup(firstMonomerSGroupId, oId);
    const secondMonomerSGroupId = createMonomerSGroup(struct, atom2Id);
    addAttachmentPoint(struct, firstMonomerSGroupId, carbonylCId, 2);
    addAttachmentPoint(struct, secondMonomerSGroupId, atom2Id, 1);

    const options = {
      scale: 40,
      width: 100,
      height: 100,
    } as unknown as RenderOptions;
    const render = new Render(document as unknown as HTMLElement, options);
    const restruct = new ReStruct(struct, render);

    fromSgroupDeletion(restruct, firstMonomerSGroupId);

    const drawingEntitiesManager = new DrawingEntitiesManager();
    MacromoleculesConverter.convertStructToDrawingEntities(
      struct,
      drawingEntitiesManager,
    );

    // A struct that already has an unrelated bond (and therefore non-empty
    // halfBonds) before the conversion runs, mimicking the reused Struct
    // instance switchToMicromolecules() passes in.
    const reusedStruct = new Struct();
    const dummyA = reusedStruct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(0, 0) }),
    );
    const dummyB = reusedStruct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(1, 0) }),
    );
    const dummyBondId = reusedStruct.bonds.add(
      new Bond({ begin: dummyA, end: dummyB, type: Bond.PATTERN.TYPE.SINGLE }),
    );
    reusedStruct.bondInitHalfBonds(dummyBondId);
    reusedStruct.initNeighbors();
    expect(reusedStruct.halfBonds.size).toBeGreaterThan(0);

    const { struct: convertedStruct } =
      MacromoleculesConverter.convertDrawingEntitiesToStruct(
        drawingEntitiesManager,
        reusedStruct,
      );

    const rebuiltCarbonylC = [...convertedStruct.atoms.values()].find(
      (atom) => atom.label === 'C' && atom.neighbors.length === 3,
    );
    expect(rebuiltCarbonylC).toBeDefined();
    expect(rebuiltCarbonylC?.implicitH).toBe(0);
  });
});
