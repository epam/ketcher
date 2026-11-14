import {
  AttachmentGroup,
  Atom,
  Bond,
  Box2Abs,
  Render,
  ReStruct,
  Scale,
  SGroup,
  SGroupAttachmentPoint,
  Struct,
  Vec2,
  type RenderOptions,
} from 'ketcher-core';
import closest from './closest';

function buildReStruct(struct = new Struct()) {
  const options = {
    microModeScale: 20,
    width: 100,
    height: 100,
  } as RenderOptions;
  const render = new Render(document as unknown as HTMLElement, options);
  return new ReStruct(struct, render);
}

// Regression test for https://github.com/epam/ketcher/issues/346:
// findCloseMerge (closest.merge) must skip a bond whose atom was already
// deleted by an earlier merge in the same batch, not throw.
describe('closest.merge (findCloseMerge): stale bond references', () => {
  it('does not throw when a selected bond references an already-deleted atom', () => {
    const restruct = buildReStruct();
    const struct = restruct.molecule;

    const beginId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(0, 0), fragment: 0 }),
    );
    const endId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(1, 0), fragment: 0 }),
    );
    const bondId = struct.bonds.add(
      new Bond({ begin: beginId, end: endId, type: Bond.PATTERN.TYPE.SINGLE }),
    );

    // Bond still present, but one of its atoms was already merged away.
    struct.atoms.delete(endId);

    expect(() =>
      closest.merge(
        restruct,
        { atoms: [], bonds: [bondId] },
        restruct.render.options,
        [],
      ),
    ).not.toThrow();
  });
});

function buildOverlappingGroups() {
  const struct = new Struct();
  const [sourceAtomId, movingAtomId, stationaryAtomId] = Array.from(
    { length: 3 },
    () => struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) })),
  );
  const [movingGroupId, stationaryGroupId] = [
    movingAtomId,
    stationaryAtomId,
  ].map((atomId, index) => {
    const group = new SGroup(SGroup.TYPES.SUP);
    group.data.name = index === 0 ? 'Unknown' : 'Stationary';
    group.data.expanded = false;
    group.id = struct.sgroups.add(group);
    struct.atomAddToSGroup(group.id, atomId);
    group.addAttachmentPoint(
      new SGroupAttachmentPoint(atomId, undefined, undefined, 1),
    );
    return group.id;
  });
  struct.bindSGroupsToFunctionalGroups();

  const restruct = buildReStruct(struct);
  restruct.render.ctab = restruct;
  restruct.recalculateVisibleAtomsAndBonds();
  // The rendered labels overlap the source atom, as in the issue's KET.
  for (const atom of restruct.atoms.values()) {
    atom.visel.boundingBox = new Box2Abs(-5, -5, 5, 5);
  }

  return {
    restruct,
    sourceAtomId,
    movingAtomId,
    stationaryAtomId,
    movingGroupId,
    stationaryGroupId,
  };
}

describe('closest: overlapping functional groups (#12091)', () => {
  it('does not merge an atom into a group within the same selection', () => {
    const { restruct, sourceAtomId, movingAtomId, stationaryAtomId } =
      buildOverlappingGroups();

    const result = closest.merge(
      restruct,
      { atoms: [sourceAtomId, movingAtomId, stationaryAtomId], bonds: [] },
      restruct.render.options,
      undefined,
      [sourceAtomId, movingAtomId, stationaryAtomId],
    );

    expect(result.atomToFunctionalGroup).toEqual(new Map());
  });

  it.each([false, true])(
    'finds an unselected group when it precedes the selected group: %s',
    (stationaryFirst) => {
      const { restruct, sourceAtomId, movingAtomId, stationaryGroupId } =
        buildOverlappingGroups();
      if (stationaryFirst) {
        restruct.sgroups = new Map([...restruct.sgroups].reverse());
      }

      const result = closest.merge(
        restruct,
        { atoms: [sourceAtomId, movingAtomId], bonds: [] },
        restruct.render.options,
        undefined,
        [sourceAtomId, movingAtomId],
      );

      expect(result.atomToFunctionalGroup).toEqual(
        new Map([[sourceAtomId, stationaryGroupId]]),
      );
    },
  );

  it('preserves ordinary merge picking when no paste exclusions are supplied', () => {
    const { restruct, sourceAtomId, movingAtomId, movingGroupId } =
      buildOverlappingGroups();

    const result = closest.merge(
      restruct,
      { atoms: [sourceAtomId, movingAtomId], bonds: [] },
      restruct.render.options,
    );

    expect(result.atomToFunctionalGroup).toEqual(
      new Map([[sourceAtomId, movingGroupId]]),
    );
  });

  it('finds a functional group during ordinary picking', () => {
    const { restruct, movingGroupId } = buildOverlappingGroups();

    expect(
      closest.item(
        restruct,
        new Vec2(0, 0),
        ['functionalGroups'],
        null,
        restruct.render.options,
      ),
    ).toMatchObject({ map: 'functionalGroups', id: movingGroupId });
  });

  it('continues picking after a skipped functional group with ID zero', () => {
    const { restruct, movingGroupId, stationaryGroupId } =
      buildOverlappingGroups();

    expect(
      closest.item(
        restruct,
        new Vec2(0, 0),
        ['functionalGroups'],
        { map: 'functionalGroups', id: movingGroupId },
        restruct.render.options,
      ),
    ).toMatchObject({ map: 'functionalGroups', id: stationaryGroupId });
  });

  it('keeps the closest atom when picking atoms and functional groups together', () => {
    const { restruct, sourceAtomId } = buildOverlappingGroups();

    expect(
      closest.item(
        restruct,
        new Vec2(0, 0),
        ['atoms', 'functionalGroups'],
        null,
        restruct.render.options,
      ),
    ).toMatchObject({ map: 'atoms', id: sourceAtomId });
  });
});

describe('closest.item', () => {
  it('prioritizes an Attachment Group marker that coincides with a member atom', () => {
    const options = {
      microModeScale: 20,
      width: 100,
      height: 100,
    } as RenderOptions;
    const struct = new Struct();
    const atomIds = [0, 1, 2].map((x) =>
      struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(x, 0) })),
    );
    const attachmentGroup = new AttachmentGroup({ atomIds });
    attachmentGroup.recalculatePosition(struct.atoms);
    const attachmentGroupId = struct.addAttachmentGroup(attachmentGroup);
    const render = new Render(document as unknown as HTMLElement, options);
    const restruct = new ReStruct(struct, render);
    restruct.recalculateVisibleAtomsAndBonds();

    expect(
      closest.item(
        restruct,
        attachmentGroup.pp,
        ['atoms', 'attachmentGroups'],
        null,
        options,
      ),
    ).toMatchObject({ map: 'attachmentGroups', id: attachmentGroupId });
  });

  it('finds a haptic-connected Attachment Group marker without treating it as an atom', () => {
    const options = {
      microModeScale: 20,
      width: 100,
      height: 100,
    } as RenderOptions;
    const struct = new Struct();
    const memberAtomIds = [-1, 1].map((x) =>
      struct.atoms.add(
        new Atom({ label: 'C', pp: new Vec2(x, 0), fragment: 0 }),
      ),
    );
    const centralAtomId = struct.atoms.add(
      new Atom({ label: 'Fe', pp: new Vec2(0, 2), fragment: 0 }),
    );
    const attachmentGroup = new AttachmentGroup({ atomIds: memberAtomIds });
    attachmentGroup.recalculatePosition(struct.atoms);
    const attachmentGroupId = struct.addAttachmentGroup(attachmentGroup);
    const hapticBondId = struct.bonds.add(
      new Bond({
        begin: attachmentGroupId,
        end: centralAtomId,
        type: Bond.PATTERN.TYPE.HAPTIC,
      }),
    );
    struct.initHalfBonds();
    struct.initNeighbors();
    struct.updateHalfBonds([
      ...struct.atoms.keys(),
      ...struct.attachmentGroups.keys(),
    ]);

    const render = new Render(document as unknown as HTMLElement, options);
    const restruct = new ReStruct(struct, render);
    restruct.recalculateVisibleAtomsAndBonds();
    const markerCanvasPosition = Scale.modelToCanvas(
      attachmentGroup.pp,
      options,
    );
    const bond = restruct.visibleBonds.get(hapticBondId)!;
    jest
      .spyOn(bond, 'getSelectionPoints')
      .mockReturnValue([
        markerCanvasPosition.add(new Vec2(-1, -1)),
        markerCanvasPosition.add(new Vec2(-1, 1)),
        markerCanvasPosition.add(new Vec2(1, 1)),
        markerCanvasPosition.add(new Vec2(1, -1)),
      ]);

    expect(
      closest.item(restruct, attachmentGroup.pp, null, null, options),
    ).toMatchObject({ map: 'attachmentGroups', id: attachmentGroupId });
  });
});
