import { Atom } from 'domain/entities/atom';
import { Struct } from 'domain/entities/struct';
import { SuperAttachmentPoint } from 'domain/entities/superAttachmentPoint';
import { Vec2 } from 'domain/entities/vec2';
import { Bond } from 'domain/entities/bond';
import { HapticBond } from 'domain/entities/HapticBond';
import { fromBondAddition } from 'application/editor/actions/bond';
import {
  fromHapticBondAddition,
  fromSAPAddition,
  fromSAPAtomsChange,
  fromSAPDelete,
} from 'application/editor/actions/sap';

function makeRing() {
  const struct = new Struct();
  const fid = struct.frags.add(null);
  const ids: number[] = [];
  for (let i = 0; i < 5; i++) {
    const angle = (2 * Math.PI * i) / 5;
    ids.push(
      struct.atoms.add(
        new Atom({
          label: 'C',
          pp: new Vec2(Math.cos(angle), Math.sin(angle)),
          fragment: fid,
        }),
      ),
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const restruct = { molecule: struct } as any;
  return { struct, restruct, ids };
}

describe('SAP action helpers', () => {
  it('fromSAPAddition adds a SAP and returns its id', () => {
    const { struct, restruct, ids } = makeRing();
    const { sapId } = fromSAPAddition(restruct, ids);
    expect(struct.superAttachmentPoints.size).toBe(1);
    expect(struct.superAttachmentPoints.get(sapId)?.atoms).toEqual(ids);
  });

  it('fromSAPDelete removes the SAP (cascade lives in eraser path I1)', () => {
    const { struct, restruct, ids } = makeRing();
    const sapId = struct.superAttachmentPoints.add(
      new SuperAttachmentPoint({ atoms: ids }),
    );
    fromSAPDelete(restruct, sapId);
    expect(struct.superAttachmentPoints.size).toBe(0);
  });

  it('fromSAPAtomsChange rejects atoms that belong to a different SAP', () => {
    const { struct, restruct, ids } = makeRing();
    const sapA = struct.superAttachmentPoints.add(
      new SuperAttachmentPoint({ atoms: ids.slice(0, 2) }),
    );
    const sapB = struct.superAttachmentPoints.add(
      new SuperAttachmentPoint({ atoms: ids.slice(2, 4) }),
    );
    // try to expand sapA to include atom that's in sapB
    const action = fromSAPAtomsChange(restruct, sapA, [
      ...ids.slice(0, 2),
      ids[2],
    ]);
    expect(action.operations.length).toBe(0);
    expect(struct.superAttachmentPoints.get(sapA)?.atoms).toEqual(
      ids.slice(0, 2),
    );
    expect(struct.superAttachmentPoints.get(sapB)?.atoms).toEqual(
      ids.slice(2, 4),
    );
  });

  it('fromSAPAtomsChange cascades to delete the SAP if size drops below 2', () => {
    const { struct, restruct, ids } = makeRing();
    const sapId = struct.superAttachmentPoints.add(
      new SuperAttachmentPoint({ atoms: ids.slice(0, 3) }),
    );
    fromSAPAtomsChange(restruct, sapId, [ids[0]]);
    expect(struct.superAttachmentPoints.size).toBe(0);
  });

  describe('fromHapticBondAddition', () => {
    function makeRingWithMetal() {
      const { struct, restruct, ids } = makeRing();
      const sapId = struct.superAttachmentPoints.add(
        new SuperAttachmentPoint({ atoms: ids }),
      );
      const metalId = struct.atoms.add(
        new Atom({ label: 'Fe', pp: new Vec2(5, 5), fragment: 0 }),
      );
      return { struct, restruct, ids, sapId, metalId };
    }

    it('creates a HapticBond instance with begin=metal and sapId=sap', () => {
      const { struct, restruct, sapId, metalId } = makeRingWithMetal();
      const { result } = fromHapticBondAddition(restruct, metalId, sapId);
      expect(result.ok).toBe(true);
      const bond = struct.bonds.get((result as { bondId: number }).bondId)!;
      expect(bond).toBeInstanceOf(HapticBond);
      expect(bond.begin).toBe(metalId);
      expect(bond.end).toBe(-1);
      expect((bond as HapticBond).sapId).toBe(sapId);
      expect(bond.type).toBe(Bond.PATTERN.TYPE.HAPTIC);
    });

    it('rejects when atomId is a SAP member atom (atom must be the metal/central atom)', () => {
      const { restruct, ids, sapId } = makeRingWithMetal();
      const { result } = fromHapticBondAddition(restruct, ids[0], sapId);
      expect(result).toEqual({
        ok: false,
        reason:
          'A haptic bond can be established only between a super-attachment point and a central atom.',
      });
    });

    it('rejects when atomId or sapId is not present in the struct', () => {
      const { restruct, sapId, metalId } = makeRingWithMetal();
      expect(fromHapticBondAddition(restruct, 9999, sapId).result.ok).toBe(
        false,
      );
      expect(fromHapticBondAddition(restruct, metalId, 9999).result.ok).toBe(
        false,
      );
    });

    it('dedupes: a second add for the same (atom, SAP) pair does not create a duplicate', () => {
      const { struct, restruct, sapId, metalId } = makeRingWithMetal();
      fromHapticBondAddition(restruct, metalId, sapId);
      fromHapticBondAddition(restruct, metalId, sapId);
      const hapticBondCount = [...struct.bonds.values()].filter(
        (b) => b.type === Bond.PATTERN.TYPE.HAPTIC,
      ).length;
      expect(hapticBondCount).toBe(1);
    });

    it('round-trips: bond add → invert removes the haptic bond', () => {
      const { struct, restruct, sapId, metalId } = makeRingWithMetal();
      const { action } = fromHapticBondAddition(restruct, metalId, sapId);
      expect(struct.bonds.size).toBe(1);

      // Re-perform the inverted action: invert each captured op.
      // Action.operations holds the inverted ops returned by perform().
      action.operations[0].perform(restruct);
      expect(
        [...struct.bonds.values()].some(
          (b) => b.type === Bond.PATTERN.TYPE.HAPTIC,
        ),
      ).toBe(false);
    });
  });

  describe('fromBondAddition haptic guard (B5)', () => {
    it('aborts when type === HAPTIC and creates no bond', () => {
      const { struct, restruct, ids } = makeRing();
      const sapId = struct.superAttachmentPoints.add(
        new SuperAttachmentPoint({ atoms: ids }),
      );
      const metalId = struct.atoms.add(
        new Atom({ label: 'Fe', pp: new Vec2(5, 5), fragment: 0 }),
      );
      const before = struct.bonds.size;
      const [action] = fromBondAddition(
        restruct,
        { type: Bond.PATTERN.TYPE.HAPTIC },
        metalId,
        ids[0],
      );
      expect(action.operations.length).toBe(0);
      expect(struct.bonds.size).toBe(before);
      expect(struct.superAttachmentPoints.get(sapId)?.atoms.length).toBe(
        ids.length,
      );
    });
  });
});
