import {
  SGroupAtomAdd,
  SGroupAtomRemove,
} from 'application/editor/operations/sgroup/sgroupAtom';
import type { ReStruct } from 'application/render';
import { Atom, SGroup, Struct, Vec2 } from 'domain/entities';

describe('SGroup atom operations guards', () => {
  it('throws a descriptive error when atom is missing for SGroupAtomAdd', () => {
    const struct = new Struct();
    const sgroupId = struct.sgroups.add(new SGroup(SGroup.TYPES.SUP));
    const restruct = { molecule: struct } as ReStruct;

    expect(() => new SGroupAtomAdd(sgroupId, 1).execute(restruct)).toThrow(
      'OpSGroupAtomAdd: Atom 1 not found',
    );
  });

  it('throws a descriptive error when sgroup is missing for SGroupAtomAdd', () => {
    const struct = new Struct();
    const atomId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(0, 0) }),
    );
    const restruct = { molecule: struct } as ReStruct;

    expect(() => new SGroupAtomAdd(1, atomId).execute(restruct)).toThrow(
      'OpSGroupAtomAdd: S-Group 1 not found',
    );
  });

  it('returns early when either atom or sgroup is missing for SGroupAtomRemove', () => {
    const struct = new Struct();
    const atomId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(0, 0) }),
    );
    const restruct = { molecule: struct } as ReStruct;

    expect(() =>
      new SGroupAtomRemove(1, atomId).execute(restruct),
    ).not.toThrow();
  });
});
