import { Atom } from 'domain/entities/atom';
import { Struct } from 'domain/entities/struct';
import { SuperAttachmentPoint } from 'domain/entities/superAttachmentPoint';
import { Vec2 } from 'domain/entities/vec2';
import {
  SuperAPAdd,
  SuperAPAtomsChange,
  SuperAPDelete,
} from 'application/editor/operations/sap';

// SAP operations only read `restruct.molecule` — full ReStruct construction
// requires Raphael, so we use a minimal stub that satisfies the type.
function makeReStruct() {
  const struct = new Struct();
  const fid = struct.frags.add(null);
  const ids: number[] = [];
  for (let i = 0; i < 5; i++) {
    ids.push(
      struct.atoms.add(
        new Atom({ label: 'C', pp: new Vec2(i, 0), fragment: fid }),
      ),
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const restruct = { molecule: struct } as any;
  return { struct, restruct, ids };
}

describe('SAP operations', () => {
  describe('SuperAPAdd', () => {
    it('adds a SAP to the struct and assigns an id', () => {
      const { struct, restruct, ids } = makeReStruct();
      const op = new SuperAPAdd(ids.slice(0, 3));
      const inverted = op.perform(restruct);

      expect(struct.superAttachmentPoints.size).toBe(1);
      const [sapId, sap] = [...struct.superAttachmentPoints.entries()][0];
      expect(sap.atoms).toEqual(ids.slice(0, 3));
      expect(op.sapId).toBe(sapId);
      expect(inverted).toBeInstanceOf(SuperAPDelete);
    });

    it('round-trips: perform → invert.perform leaves the struct empty of SAPs', () => {
      const { struct, restruct, ids } = makeReStruct();
      const op = new SuperAPAdd(ids.slice(0, 3));
      const inverted = op.perform(restruct);
      inverted.perform(restruct);
      expect(struct.superAttachmentPoints.size).toBe(0);
    });

    it('computes the bounding-box center on add', () => {
      const { struct, restruct, ids } = makeReStruct();
      const op = new SuperAPAdd(ids.slice(0, 3));
      op.perform(restruct);
      const sap = [...struct.superAttachmentPoints.values()][0];
      // atoms at x=0..2, y=0 → bbox center (1, 0)
      expect(sap.pp.x).toBe(1);
      expect(sap.pp.y).toBe(0);
    });
  });

  describe('SuperAPDelete', () => {
    it('removes the SAP and round-trips back via SuperAPAdd', () => {
      const { struct, restruct, ids } = makeReStruct();
      const sapId = struct.superAttachmentPoints.add(
        new SuperAttachmentPoint({ atoms: ids.slice(0, 3) }),
      );

      const op = new SuperAPDelete(sapId);
      const inverted = op.perform(restruct);
      expect(struct.superAttachmentPoints.size).toBe(0);

      inverted.perform(restruct);
      expect(struct.superAttachmentPoints.size).toBe(1);
      const recreated = [...struct.superAttachmentPoints.values()][0];
      expect(recreated.atoms).toEqual(ids.slice(0, 3));
    });
  });

  describe('SuperAPAtomsChange', () => {
    it('updates atoms and recomputes pp; round-trips back to original', () => {
      const { struct, restruct, ids } = makeReStruct();
      const sapId = struct.superAttachmentPoints.add(
        new SuperAttachmentPoint({ atoms: ids.slice(0, 3) }),
      );
      struct.superAttachmentPoints.get(sapId)!.recomputeCenter(struct);
      const originalPP = struct.superAttachmentPoints.get(sapId)!.pp;
      expect(originalPP.x).toBe(1);

      const op = new SuperAPAtomsChange(sapId, ids.slice(2, 5));
      const inverted = op.perform(restruct);

      const sap = struct.superAttachmentPoints.get(sapId)!;
      expect(sap.atoms).toEqual(ids.slice(2, 5));
      expect(sap.pp.x).toBe(3); // atoms at x=2..4 → bbox center 3

      inverted.perform(restruct);
      const restored = struct.superAttachmentPoints.get(sapId)!;
      expect(restored.atoms).toEqual(ids.slice(0, 3));
      expect(restored.pp.x).toBe(1);
    });
  });
});
