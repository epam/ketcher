// Y3 tests: SAP membership invariants under atom merge.

import { Atom } from 'domain/entities/atom';
import { Bond } from 'domain/entities/bond';
import { Struct } from 'domain/entities/struct';
import { SuperAttachmentPoint } from 'domain/entities/superAttachmentPoint';
import { SuperAPAtomsChange } from 'application/editor/operations/sap';
import { Vec2 } from 'domain/entities/vec2';

function buildLinearChain(n: number) {
  const struct = new Struct();
  const fid = struct.frags.add(null);
  const ids: number[] = [];
  for (let i = 0; i < n; i++) {
    ids.push(
      struct.atoms.add(
        new Atom({ label: 'C', pp: new Vec2(i, 0), fragment: fid }),
      ),
    );
  }
  for (let i = 0; i < n - 1; i++) {
    struct.bonds.add(
      new Bond({
        begin: ids[i],
        end: ids[i + 1],
        type: Bond.PATTERN.TYPE.SINGLE,
      }),
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const restruct = { molecule: struct } as any;
  return { struct, restruct, ids };
}

describe('SuperAPAtomsChange (op-level Y2 guard)', () => {
  it('refuses to update atoms when an incoming atom belongs to a different SAP', () => {
    const { struct, restruct, ids } = buildLinearChain(6);
    const sapA = struct.superAttachmentPoints.add(
      new SuperAttachmentPoint({ atoms: [ids[0], ids[1]] }),
    );
    struct.superAttachmentPoints.add(
      new SuperAttachmentPoint({ atoms: [ids[3], ids[4]] }),
    );
    const op = new SuperAPAtomsChange(sapA, [ids[0], ids[1], ids[3]]);
    op.perform(restruct);
    // Mutation refused — atoms unchanged.
    expect(struct.superAttachmentPoints.get(sapA)?.atoms).toEqual([
      ids[0],
      ids[1],
    ]);
  });

  it('allows an unrelated atoms-list change', () => {
    const { struct, restruct, ids } = buildLinearChain(5);
    const sapA = struct.superAttachmentPoints.add(
      new SuperAttachmentPoint({ atoms: [ids[0], ids[1]] }),
    );
    const op = new SuperAPAtomsChange(sapA, [ids[0], ids[1], ids[2]]);
    op.perform(restruct);
    expect(struct.superAttachmentPoints.get(sapA)?.atoms).toEqual([
      ids[0],
      ids[1],
      ids[2],
    ]);
  });
});
