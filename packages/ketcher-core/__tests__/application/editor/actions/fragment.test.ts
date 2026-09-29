import { fromMultipleMove } from 'application/editor/actions/fragment';
import type { ReStruct } from 'application/render';
import { Atom, SGroup, Struct, Vec2 } from 'domain/entities';

const createSGroupStruct = (expanded: boolean) => {
  const struct = new Struct();
  const firstAtomId = struct.atoms.add(
    new Atom({ label: 'C', pp: new Vec2(0, 0) }),
  );
  const secondAtomId = struct.atoms.add(
    new Atom({ label: 'C', pp: new Vec2(2, 0) }),
  );
  const sgroup = new SGroup(SGroup.TYPES.SUP);
  sgroup.data.expanded = expanded;
  const sgroupId = struct.sgroups.add(sgroup);
  sgroup.id = sgroupId;
  struct.atomAddToSGroup(sgroupId, firstAtomId);
  struct.atomAddToSGroup(sgroupId, secondAtomId);

  const restruct = {
    molecule: struct,
    atoms: new Map(),
    bonds: new Map(),
    reloops: new Map(),
    markItem: jest.fn(),
  } as unknown as ReStruct;

  return {
    struct,
    restruct,
    sgroup,
    sgroupId,
    firstAtomId,
    secondAtomId,
  };
};

describe('fromMultipleMove', () => {
  it('moves a contracted S-group label without changing hidden atom geometry', () => {
    const { struct, restruct, sgroup, firstAtomId, secondAtomId } =
      createSGroupStruct(false);

    const undoAction = fromMultipleMove(
      restruct,
      {
        atoms: [firstAtomId, secondAtomId],
        bonds: [],
        sgroupData: [],
      },
      new Vec2(3, 4),
    );

    expect(struct.atoms.get(firstAtomId)?.pp).toEqual(new Vec2(0, 0));
    expect(struct.atoms.get(secondAtomId)?.pp).toEqual(new Vec2(2, 0));
    expect(sgroup.getContractedPosition(struct).position).toEqual(
      new Vec2(4, 4),
    );
    expect(sgroup.contractedLabelMoved).toBe(true);

    undoAction.perform(restruct);

    expect(sgroup.pp).toBeNull();
    expect(sgroup.contractedLabelMoved).toBe(false);
    expect(sgroup.getContractedPosition(struct).position).toEqual(
      new Vec2(1, 0),
    );
  });

  it('continues moving atoms when an S-group is expanded', () => {
    const { struct, restruct, firstAtomId, secondAtomId } =
      createSGroupStruct(true);

    fromMultipleMove(
      restruct,
      {
        atoms: [firstAtomId, secondAtomId],
        bonds: [],
        sgroupData: [],
      },
      new Vec2(3, 4),
    );

    expect(struct.atoms.get(firstAtomId)?.pp).toEqual(new Vec2(3, 4));
    expect(struct.atoms.get(secondAtomId)?.pp).toEqual(new Vec2(5, 4));
  });

  it('does not treat a stored S-group data position as a moved abbreviation', () => {
    const { struct, sgroup } = createSGroupStruct(false);
    sgroup.pp = new Vec2(8, 9);

    expect(sgroup.getContractedPosition(struct).position).toEqual(
      new Vec2(1, 0),
    );
  });

  it('moves a stored label from its displayed center and restores its data position on undo', () => {
    const { struct, restruct, sgroup, firstAtomId, secondAtomId } =
      createSGroupStruct(false);
    sgroup.pp = new Vec2(8, 9);

    const undoAction = fromMultipleMove(
      restruct,
      { atoms: [firstAtomId, secondAtomId], bonds: [], sgroupData: [] },
      new Vec2(3, 4),
    );

    expect(sgroup.getContractedPosition(struct).position).toEqual(
      new Vec2(4, 4),
    );
    undoAction.perform(restruct);
    expect(sgroup.pp).toEqual(new Vec2(8, 9));
    expect(sgroup.getContractedPosition(struct).position).toEqual(
      new Vec2(1, 0),
    );
  });

  it('moves contracted S-group atoms during whole-structure translation', () => {
    const { struct, restruct, sgroup, sgroupId, firstAtomId, secondAtomId } =
      createSGroupStruct(false);

    fromMultipleMove(
      restruct,
      {
        atoms: [firstAtomId, secondAtomId],
        bonds: [],
        sgroups: [sgroupId],
        sgroupData: [],
      },
      new Vec2(3, 4),
    );

    expect(struct.atoms.get(firstAtomId)?.pp).toEqual(new Vec2(3, 4));
    expect(struct.atoms.get(secondAtomId)?.pp).toEqual(new Vec2(5, 4));
    expect(sgroup.getContractedPosition(struct).position).toEqual(
      new Vec2(4, 4),
    );
    expect(sgroup.pp).toBeNull();
  });

  it('moves an explicit contracted label during whole-structure translation', () => {
    const { struct, restruct, sgroup, sgroupId, firstAtomId, secondAtomId } =
      createSGroupStruct(false);
    sgroup.pp = new Vec2(8, 9);

    fromMultipleMove(
      restruct,
      {
        atoms: [firstAtomId, secondAtomId],
        bonds: [],
        sgroups: [sgroupId],
        sgroupData: [],
      },
      new Vec2(3, 4),
    );

    expect(struct.atoms.get(firstAtomId)?.pp).toEqual(new Vec2(3, 4));
    expect(struct.atoms.get(secondAtomId)?.pp).toEqual(new Vec2(5, 4));
    expect(sgroup.pp).toEqual(new Vec2(11, 13));
  });

  it('does not move a selected group whose hidden atoms are absent from the move', () => {
    const { restruct, sgroup, sgroupId } = createSGroupStruct(false);
    sgroup.pp = new Vec2(8, 9);

    fromMultipleMove(
      restruct,
      { atoms: [], bonds: [], sgroups: [sgroupId], sgroupData: [] },
      new Vec2(3, 4),
    );

    expect(sgroup.pp).toEqual(new Vec2(8, 9));
  });

  it('moves the complete contracted S-group when only some atoms are selected', () => {
    const { struct, restruct, sgroup, firstAtomId, secondAtomId } =
      createSGroupStruct(false);
    sgroup.data.absolute = false;

    const undoAction = fromMultipleMove(
      restruct,
      {
        atoms: [firstAtomId],
        bonds: [],
        sgroups: [],
        sgroupData: [],
      },
      new Vec2(3, 4),
    );

    expect(struct.atoms.get(firstAtomId)?.pp).toEqual(new Vec2(3, 4));
    expect(struct.atoms.get(secondAtomId)?.pp).toEqual(new Vec2(5, 4));
    expect(sgroup.pp).toBeNull();
    expect(sgroup.getContractedPosition(struct).position).toEqual(
      new Vec2(4, 4),
    );

    undoAction.perform(restruct);

    expect(struct.atoms.get(firstAtomId)?.pp).toEqual(new Vec2(0, 0));
    expect(struct.atoms.get(secondAtomId)?.pp).toEqual(new Vec2(2, 0));
    expect(sgroup.pp).toBeNull();
    expect(sgroup.getContractedPosition(struct).position).toEqual(
      new Vec2(1, 0),
    );
  });
});
