import { fromPaste } from 'application/editor/actions/paste';
import { fromFragmentDeletion } from 'application/editor/actions/erase';
import {
  fromSeveralSgroupAddition,
  fromSgroupDeletion,
} from 'application/editor/actions/sgroup';
import { Render, ReStruct } from 'application/render';
import {
  Atom,
  Bond,
  Fragment,
  SGroup,
  SGroupBracketType,
  Struct,
  Vec2,
} from 'domain/entities';

function sourceWithSameAtomGroups(groupCount: number): Struct {
  const struct = new Struct();
  const fragment = struct.frags.add(new Fragment());
  const atoms = [
    struct.atoms.add(new Atom({ label: 'C', fragment, pp: new Vec2(0, 0) })),
    struct.atoms.add(new Atom({ label: 'C', fragment, pp: new Vec2(1, 0) })),
  ];
  const bond = new Bond({ begin: atoms[0], end: atoms[1], type: 1 });
  const bondId = struct.bonds.add(bond);
  struct.bondInitHalfBonds(bondId, bond);
  struct.initNeighbors();

  const types = [SGroup.TYPES.SRU, SGroup.TYPES.MUL, SGroup.TYPES.COP];
  const brackets = [
    SGroupBracketType.Round,
    SGroupBracketType.Curly,
    SGroupBracketType.Square,
  ];
  for (let index = 0; index < groupCount; index++) {
    const group = new SGroup(types[index]);
    group.id = struct.sgroups.add(group);
    group.data.bracketType = brackets[index];
    atoms.forEach((atomId) => struct.atomAddToSGroup(group.id, atomId));
    struct.sGroupForest.insert(group);
  }
  return struct;
}

function createRestruct(struct: Struct): ReStruct {
  const render = new Render(document as unknown as HTMLElement, {
    width: 100,
    height: 100,
  });
  return new ReStruct(struct, render);
}

describe('S-group lifecycle history', () => {
  it('drops stored positions only on a displaced copy and leaves the source intact', () => {
    const source = sourceWithSameAtomGroups(1);
    const sourceGroup = [...source.sgroups.values()][0];
    const brackets = {
      opening: {
        type: SGroupBracketType.Round,
        position: { start: { x: -1, y: 1 }, end: { x: -1, y: 1 } },
      },
      closing: {
        type: SGroupBracketType.Round,
        position: { start: { x: 2, y: -1 }, end: { x: 2, y: 1 } },
      },
    };
    sourceGroup.data.brackets = brackets;
    const struct = new Struct();
    const restruct = createRestruct(struct);

    const [undo] = fromPaste(restruct, source, new Vec2(5, 0));
    const pastedGroup = [...struct.sgroups.values()][0];
    expect(sourceGroup.data.brackets).toEqual(brackets);
    expect(pastedGroup.data.brackets).toEqual({
      opening: { type: SGroupBracketType.Round },
      closing: { type: SGroupBracketType.Round },
    });
    const redo = undo.perform(restruct);
    redo.perform(restruct);
    expect([...struct.sgroups.values()][0].data.brackets).toEqual({
      opening: { type: SGroupBracketType.Round },
      closing: { type: SGroupBracketType.Round },
    });
  });

  it('restores positioned groups after deleting and undoing the whole fragment', () => {
    const struct = sourceWithSameAtomGroups(1);
    const group = [...struct.sgroups.values()][0];
    const brackets = {
      opening: {
        position: { start: { x: -1, y: -1 }, end: { x: -1, y: 1 } },
      },
      closing: {
        position: { start: { x: 2, y: -1 }, end: { x: 2, y: 1 } },
      },
    };
    group.data.brackets = brackets;
    const restruct = createRestruct(struct);
    let undo = fromFragmentDeletion(restruct, {
      atoms: [...struct.atoms.keys()],
    });

    for (let cycle = 0; cycle < 2; cycle++) {
      const redo = undo.perform(restruct);
      expect([...struct.sgroups.values()][0].data.brackets).toEqual(brackets);
      undo = redo.perform(restruct);
      expect(struct.sgroups.size).toBe(0);
    }
  });

  it.each([
    [2, false],
    [3, false],
    [2, true],
    [3, true],
  ])(
    'restores %i groups and their hierarchy after undo/redo (existing structure: %s)',
    (groupCount, hasExistingStructure) => {
      const source = sourceWithSameAtomGroups(groupCount);
      const struct = hasExistingStructure ? source.clone() : new Struct();
      const restruct = createRestruct(struct);
      const originalIds = new Set(struct.sgroups.keys());
      const [undo] = fromPaste(restruct, source, new Vec2(5, 0));
      const pastedIds = [...struct.sgroups.keys()].filter(
        (id) => !originalIds.has(id),
      );
      const pastedTypes = pastedIds.map((id) => struct.sgroups.get(id)?.type);
      const pastedStyles = pastedIds.map(
        (id) => struct.sgroups.get(id)?.data.bracketType,
      );
      const pastedParents = pastedIds.map((id) =>
        struct.sGroupForest.parent.get(id),
      );
      const pastedAtoms = pastedIds.map((id) =>
        [...(struct.sgroups.get(id)?.atoms ?? [])].sort((a, b) => a - b),
      );

      expect(pastedIds).toHaveLength(groupCount);
      expect(pastedParents).toEqual([
        -1,
        ...pastedIds.slice(0, groupCount - 1),
      ]);
      let undoAction = undo;
      for (let cycle = 0; cycle < 2; cycle++) {
        const redo = undoAction.perform(restruct);
        expect(struct.sgroups.size).toBe(originalIds.size);
        undoAction = redo.perform(restruct);

        expect(
          [...struct.sgroups.keys()].filter((id) => !originalIds.has(id)),
        ).toEqual(pastedIds);
        expect(pastedIds.map((id) => struct.sgroups.get(id)?.type)).toEqual(
          pastedTypes,
        );
        expect(
          pastedIds.map((id) => struct.sgroups.get(id)?.data.bracketType),
        ).toEqual(pastedStyles);
        expect(
          pastedIds.map((id) =>
            [...(struct.sgroups.get(id)?.atoms ?? [])].sort((a, b) => a - b),
          ),
        ).toEqual(pastedAtoms);
        expect(
          pastedIds.map((id) => struct.sGroupForest.parent.get(id)),
        ).toEqual(pastedParents);
        expect(struct.sGroupForest.getSGroupsBFS()).toEqual(
          expect.arrayContaining(pastedIds),
        );
        for (let index = 1; index < pastedIds.length; index++) {
          expect(
            struct.sGroupForest.children.get(pastedIds[index - 1]),
          ).toContain(pastedIds[index]);
        }
      }
    },
  );

  it('does not reorder unrelated DATA groups through undo and redo', () => {
    const struct = sourceWithSameAtomGroups(0);
    const restruct = createRestruct(struct);
    const undo = fromSeveralSgroupAddition(
      restruct,
      SGroup.TYPES.DAT,
      [...struct.atoms.keys()],
      { fieldName: 'values', fieldValue: ['first', 'second'] },
    );
    const before = [...struct.sgroups.values()].map((group) => ({
      id: group.id,
      value: group.data.fieldValue,
    }));

    expect(before.map(({ value }) => value)).toEqual(['first', 'second']);
    const redo = undo.perform(restruct);
    redo.perform(restruct);

    expect(
      [...struct.sgroups.values()].map((group) => ({
        id: group.id,
        value: group.data.fieldValue,
      })),
    ).toEqual(before);
  });

  it('retains DATA groups alongside pasted nested groups through undo and redo', () => {
    const source = sourceWithSameAtomGroups(2);
    const dataGroup = new SGroup(SGroup.TYPES.DAT);
    dataGroup.id = source.sgroups.add(dataGroup);
    dataGroup.data.fieldName = 'note';
    dataGroup.data.fieldValue = 'value';
    for (const id of source.atoms.keys()) {
      source.atomAddToSGroup(dataGroup.id, id);
    }
    source.sGroupForest.insert(dataGroup, -1, []);
    const struct = new Struct();
    const restruct = createRestruct(struct);
    const [undo] = fromPaste(restruct, source, new Vec2(5, 0));
    const before = [...struct.sgroups.values()].map((group) => ({
      id: group.id,
      type: group.type,
      bracket: group.data.bracketType,
      value: group.data.fieldValue,
    }));

    expect(before.map(({ type }) => type)).toEqual(['SRU', 'MUL', 'DAT']);
    const redo = undo.perform(restruct);
    redo.perform(restruct);

    expect(
      [...struct.sgroups.values()].map((group) => ({
        id: group.id,
        type: group.type,
        bracket: group.data.bracketType,
        value: group.data.fieldValue,
      })),
    ).toEqual(before);
    expect(struct.sGroupForest.getSGroupsBFS()).toEqual([0, 2, 1]);
  });

  it('preserves DATA group order when deleting and restoring nested groups', () => {
    const struct = sourceWithSameAtomGroups(2);
    for (const value of ['first', 'second']) {
      const group = new SGroup(SGroup.TYPES.DAT);
      group.id = struct.sgroups.add(group);
      group.data.fieldName = 'note';
      group.data.fieldValue = value;
      for (const atomId of struct.atoms.keys()) {
        struct.atomAddToSGroup(group.id, atomId);
      }
      struct.sGroupForest.insert(group, -1, []);
    }

    const restruct = createRestruct(struct);
    const before = [...struct.sgroups.values()].map((group) => ({
      id: group.id,
      type: group.type,
      value: group.data.fieldValue,
    }));
    let undo = fromFragmentDeletion(restruct, {
      atoms: [...struct.atoms.keys()],
    });

    for (let cycle = 0; cycle < 2; cycle++) {
      const redo = undo.perform(restruct);
      expect(
        [...struct.sgroups.values()].map((group) => ({
          id: group.id,
          type: group.type,
          value: group.data.fieldValue,
        })),
      ).toEqual(before);
      expect(struct.sGroupForest.parent.get(1)).toBe(0);
      expect(struct.sGroupForest.children.get(0)).toContain(1);
      undo = redo.perform(restruct);
    }
  });

  it('restores a parent created after its child without changing pool order', () => {
    const struct = sourceWithSameAtomGroups(0);
    const atoms = [...struct.atoms.keys()];
    const child = new SGroup(SGroup.TYPES.SRU);
    child.id = struct.sgroups.add(child);
    struct.atomAddToSGroup(child.id, atoms[0]);
    struct.sGroupForest.insert(child);
    const parent = new SGroup(SGroup.TYPES.MUL);
    parent.id = struct.sgroups.add(parent);
    atoms.forEach((atomId) => struct.atomAddToSGroup(parent.id, atomId));
    struct.sGroupForest.insert(parent);

    expect([...struct.sgroups.keys()]).toEqual([child.id, parent.id]);
    expect(struct.sGroupForest.getSGroupsBFS()).toEqual([parent.id, child.id]);
    const restruct = createRestruct(struct);
    let undo = fromFragmentDeletion(restruct, { atoms });

    for (let cycle = 0; cycle < 2; cycle++) {
      const redo = undo.perform(restruct);
      expect([...struct.sgroups.keys()]).toEqual([child.id, parent.id]);
      expect(struct.sGroupForest.getSGroupsBFS()).toEqual([
        parent.id,
        child.id,
      ]);
      expect(struct.sGroupForest.parent.get(child.id)).toBe(parent.id);
      expect(struct.sGroupForest.children.get(parent.id)).toContain(child.id);
      undo = redo.perform(restruct);
    }
  });

  it.each([
    [2, 0],
    [3, 0],
    [3, 1],
  ])(
    'restores the original hierarchy of %i nested groups after removing group %i',
    (groupCount, deletedIndex) => {
      const struct = sourceWithSameAtomGroups(groupCount);
      const restruct = createRestruct(struct);
      const ids = [...struct.sgroups.keys()];
      const originalTypes = [...struct.sgroups.values()].map(
        (group) => group.type,
      );
      let undo = fromSgroupDeletion(restruct, ids[deletedIndex]);

      for (let cycle = 0; cycle < 2; cycle++) {
        const redo = undo.perform(restruct);
        expect(struct.sGroupForest.getSGroupsBFS()).toEqual(ids);
        const clone = struct.clone();
        expect([...clone.sgroups.values()].map((group) => group.type)).toEqual(
          originalTypes,
        );
        expect(clone.sGroupForest.getSGroupsBFS()).toEqual(ids);
        for (let index = 1; index < ids.length; index++) {
          expect(struct.sGroupForest.parent.get(ids[index])).toBe(
            ids[index - 1],
          );
          expect(struct.sGroupForest.children.get(ids[index - 1])).toContain(
            ids[index],
          );
        }
        undo = redo.perform(restruct);
      }
    },
  );

  it('keeps DATA order while cloning a restored same-atom hierarchy', () => {
    const struct = sourceWithSameAtomGroups(2);
    for (const value of ['first', 'second']) {
      const group = new SGroup(SGroup.TYPES.DAT);
      group.id = struct.sgroups.add(group);
      group.data.fieldName = 'note';
      group.data.fieldValue = value;
      for (const atomId of struct.atoms.keys()) {
        struct.atomAddToSGroup(group.id, atomId);
      }
      struct.sGroupForest.insert(group, -1, []);
    }

    const restruct = createRestruct(struct);
    fromSgroupDeletion(restruct, 0).perform(restruct);
    const clone = struct.clone();
    const groups = [...clone.sgroups.values()];
    const parent = groups.find((group) => group.type === SGroup.TYPES.SRU);
    const child = groups.find((group) => group.type === SGroup.TYPES.MUL);

    expect(groups.filter((group) => group.type === SGroup.TYPES.DAT)).toEqual([
      expect.objectContaining({
        data: expect.objectContaining({ fieldValue: 'first' }),
      }),
      expect.objectContaining({
        data: expect.objectContaining({ fieldValue: 'second' }),
      }),
    ]);
    expect(parent).toBeDefined();
    expect(child).toBeDefined();
    expect(clone.sGroupForest.parent.get(child?.id ?? -1)).toBe(parent?.id);
  });

  it.each([2, 3])(
    'restores %i same-atom groups after deleting and undoing the structure',
    (groupCount) => {
      const struct = sourceWithSameAtomGroups(groupCount);
      const restruct = createRestruct(struct);
      const before = [...struct.sgroups.values()].map((group) => ({
        id: group.id,
        type: group.type,
        bracket: group.data.bracketType,
        atoms: [...group.atoms].sort((a, b) => a - b),
      }));
      let undo = fromFragmentDeletion(restruct, {
        atoms: [...struct.atoms.keys()],
      });

      for (let cycle = 0; cycle < 2; cycle++) {
        expect(struct.sgroups.size).toBe(0);
        const redo = undo.perform(restruct);
        expect(
          [...struct.sgroups.values()].map((group) => ({
            id: group.id,
            type: group.type,
            bracket: group.data.bracketType,
            atoms: [...group.atoms].sort((a, b) => a - b),
          })),
        ).toEqual(before);
        expect(struct.sGroupForest.getSGroupsBFS()).toEqual(
          before.map(({ id }) => id),
        );
        for (let index = 1; index < before.length; index++) {
          expect(struct.sGroupForest.parent.get(before[index].id)).toBe(
            before[index - 1].id,
          );
          expect(
            struct.sGroupForest.children.get(before[index - 1].id),
          ).toContain(before[index].id);
        }
        undo = redo.perform(restruct);
      }
      expect(struct.sgroups.size).toBe(0);
    },
  );
});
