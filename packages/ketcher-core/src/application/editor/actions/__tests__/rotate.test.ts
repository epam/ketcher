import { fromFlip, fromRotate } from '../rotate';
import { Struct } from 'domain/entities/struct';
import { Vec2 } from 'domain/entities/vec2';
import { RxnPlus } from 'domain/entities/rxnPlus';
import { Text } from 'domain/entities/text';
import { SGroup } from 'domain/entities/sgroup';
import { Fragment } from 'domain/entities/fragment';
import { Atom } from 'domain/entities/atom';
import { MonomerMicromolecule } from 'domain/entities/monomerMicromolecule';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import type { ReStruct } from 'application/render';
import type { FlipDirection } from '../../shared/utils.types';

/**
Regression tests for https://github.com/epam/ketcher/issues/6170

`fromRotate` used to dereference `.pp`/`.position` on pool entries looked
up by id from the (possibly stale) editor selection without checking
whether the entry still exists in the current Struct. If the selection
held on to an id of an item that no longer exists (deleted, replaced,
or a race between struct mutation and selection state), this threw:
`TypeError: Cannot read properties of undefined (reading 'pp')`.

`fromRotate` itself takes untyped params (see the `// eslint-disable-line`
on its declaration), so plain duck-typed fixtures are passed directly
without needing type casts.
*/
describe('fromRotate: stale selection ids', () => {
  const center = new Vec2(0, 0);
  const angle = Math.PI / 4;

  it('does not throw when selection.rxnPluses references a non-existent id', () => {
    const struct = new Struct();
    const restruct = { molecule: struct };
    const selection = { rxnPluses: [999] };

    expect(() => fromRotate(restruct, selection, center, angle)).not.toThrow();
  });

  it('does not throw when selection.texts references a non-existent id', () => {
    const struct = new Struct();
    const restruct = { molecule: struct };
    const selection = { texts: [999] };

    expect(() => fromRotate(restruct, selection, center, angle)).not.toThrow();
  });

  it('does not throw when selection.sgroupData references a non-existent id', () => {
    const struct = new Struct();
    const restruct = { molecule: struct };
    const selection = { sgroupData: [999] };

    expect(() => fromRotate(restruct, selection, center, angle)).not.toThrow();
  });

  it('does not throw when selection.sgroupData references an sgroup with no position', () => {
    const struct = new Struct();
    const sgroup = new SGroup('DAT');
    // sgroup.pp is null by default (not yet positioned)
    const sgid = struct.sgroups.add(sgroup);
    const restruct = { molecule: struct };
    const selection = { sgroupData: [sgid] };

    expect(() => fromRotate(restruct, selection, center, angle)).not.toThrow();
  });

  it('does not throw when selection.enhancedFlags references a non-existent fragment id', () => {
    const struct = new Struct();
    const restruct = { molecule: struct };
    const selection = { enhancedFlags: [999] };

    expect(() => fromRotate(restruct, selection, center, angle)).not.toThrow();
  });

  it('does not throw when selection.atoms references a non-existent id (already-fixed case)', () => {
    const struct = new Struct();
    const restruct = { molecule: struct };
    const selection = { atoms: [999] };

    expect(() => fromRotate(restruct, selection, center, angle)).not.toThrow();
  });

  // These exercise the full `action.perform(restruct)` path (not just the
  // guard), so they need just enough of a ReStruct-shaped render layer for
  // the operations' `execute()` to run. This confirms the guard only skips
  // missing entries and doesn't swallow legitimate ones.
  const renderOptions = { microModeScale: 1 };
  const fakeVisel = () => ({ translate: () => undefined });

  it('still moves a valid rxnPlus (guard does not swallow real entries)', () => {
    const struct = new Struct();
    const rxnPlus = new RxnPlus({ pp: new Vec2(1, 1) });
    const plusId = struct.rxnPluses.add(rxnPlus);
    const restruct = {
      molecule: struct,
      rxnPluses: new Map([[plusId, { visel: fakeVisel() }]]),
      render: { options: renderOptions },
      markItem: () => undefined,
    };
    const selection = { rxnPluses: [plusId] };

    expect(() => fromRotate(restruct, selection, center, angle)).not.toThrow();
    expect(rxnPlus.pp).not.toEqual(new Vec2(1, 1));
  });

  it('still moves a valid text', () => {
    const struct = new Struct();
    const text = new Text({
      content: '',
      position: new Vec2(1, 1),
      pos: [new Vec2(0, 1), new Vec2(1, 1), new Vec2(1, 0), new Vec2(0, 0)],
    });
    const textId = struct.texts.add(text);
    const restruct = {
      molecule: struct,
      texts: new Map([
        [textId, { visel: fakeVisel(), getReferencePoints: () => [] }],
      ]),
      render: { options: renderOptions },
      markItem: () => undefined,
    };
    const selection = { texts: [textId] };

    expect(() => fromRotate(restruct, selection, center, angle)).not.toThrow();
    expect(text.position).not.toEqual(new Vec2(1, 1));
  });

  it('still moves a valid enhanced flag (fragment)', () => {
    const struct = new Struct();
    const fragment = new Fragment([], new Vec2(1, 1));
    const fragId = struct.frags.add(fragment);
    const restruct = {
      molecule: struct,
      markItem: () => undefined,
    };
    const selection = { enhancedFlags: [fragId] };

    expect(() => fromRotate(restruct, selection, center, angle)).not.toThrow();
    expect(fragment.stereoFlagPosition).not.toEqual(new Vec2(1, 1));
  });
});

/**
 * Helpers for building MonomerMicromolecule fixtures.
 *
 * MonomerMicromolecule only reads `monomer.monomerItem.expanded` in its
 * constructor, so a minimal cast to `BaseMonomer` is safe here.
 */
type MockMonomerItem = {
  expanded: boolean;
  transformation?: { flip?: FlipDirection };
};

function makeMonomerSGroup(
  struct: Struct,
  atomPositions: Vec2[],
  expanded: boolean,
) {
  const mockMonomer: { monomerItem: MockMonomerItem } = {
    monomerItem: { expanded },
  };
  const sGroup = new MonomerMicromolecule(
    SGroup.TYPES.SUP,
    mockMonomer as unknown as BaseMonomer,
  );
  sGroup.pp = new Vec2(2, 0); // non-zero so rotation/flip visibly moves it
  const sGroupId = struct.sgroups.add(sGroup);
  sGroup.id = sGroupId; // Pool.add returns the ID but does not set it on the object

  const atomIds = atomPositions.map((pos) => {
    const atom = new Atom({ label: 'C', pp: pos });
    const atomId = struct.atoms.add(atom);
    sGroup.atoms.push(atomId);
    atom.sgs.add(sGroupId);
    return atomId;
  });

  return { sGroupId, atomIds, sGroup, mockMonomer };
}

describe('fromRotate: collapsed MonomerMicromolecule', () => {
  const center = new Vec2(0, 0);
  const angle = Math.PI / 2;
  // Minimal restruct for tests: satisfies AtomMove/SGroupDataMove.execute without a render layer
  const restruct = (struct: Struct): ReStruct =>
    ({
      molecule: struct,
      atoms: new Map(),
      getBondEndpoint: () => undefined,
      markItem: () => undefined,
    }) as unknown as ReStruct;

  it('translates (does not individually rotate) atoms of a collapsed monomer when no expanded monomer is in the selection', () => {
    const struct = new Struct();
    const { atomIds, sGroup } = makeMonomerSGroup(
      struct,
      [new Vec2(1, 0)],
      false,
    );
    const atom = struct.atoms.get(atomIds[0])!;
    const relativeBefore = Vec2.diff(atom.pp, sGroup.pp!);
    const { x: origX, y: origY } = atom.pp;

    fromRotate(restruct(struct), { atoms: atomIds }, center, angle);

    // The atom still moves (rigid-body translation, following the monomer)...
    expect(
      Math.abs(atom.pp.x - origX) + Math.abs(atom.pp.y - origY),
    ).toBeGreaterThan(0.1);
    // ...but its position relative to the sgroup is unchanged, i.e. it was
    // translated together with the monomer rather than individually rotated.
    const relativeAfter = Vec2.diff(atom.pp, sGroup.pp!);
    expect(relativeAfter.x).toBeCloseTo(relativeBefore.x);
    expect(relativeAfter.y).toBeCloseTo(relativeBefore.y);
  });

  it('moves atoms of an expanded monomer', () => {
    const struct = new Struct();
    const { atomIds } = makeMonomerSGroup(struct, [new Vec2(1, 0)], true);
    const atom = struct.atoms.get(atomIds[0])!;
    const { x: origX, y: origY } = atom.pp;

    fromRotate(restruct(struct), { atoms: atomIds }, center, angle);

    // After 90° rotation (1,0) → (0,1): x should change
    expect(
      Math.abs(atom.pp.x - origX) + Math.abs(atom.pp.y - origY),
    ).toBeGreaterThan(0.1);
  });

  it('still moves sgroup pp for a collapsed monomer', () => {
    const struct = new Struct();
    const { atomIds, sGroup } = makeMonomerSGroup(
      struct,
      [new Vec2(1, 0)],
      false,
    );
    const { x: origX, y: origY } = sGroup.pp!;

    fromRotate(restruct(struct), { atoms: atomIds }, center, angle);

    expect(
      Math.abs(sGroup.pp!.x - origX) + Math.abs(sGroup.pp!.y - origY),
    ).toBeGreaterThan(0.1);
  });

  it('rotates every monomer atom individually in a mixed selection (at least one expanded monomer present)', () => {
    const struct = new Struct();
    const { atomIds: collapsedAtomIds, sGroup: collapsedSGroup } =
      makeMonomerSGroup(struct, [new Vec2(1, 0)], false);
    const { atomIds: expandedAtomIds } = makeMonomerSGroup(
      struct,
      [new Vec2(3, 0)],
      true,
    );

    const atomCollapsed = struct.atoms.get(collapsedAtomIds[0])!;
    const atomExpanded = struct.atoms.get(expandedAtomIds[0])!;
    const relativeBefore = Vec2.diff(atomCollapsed.pp, collapsedSGroup.pp!);
    const { x: ex, y: ey } = atomExpanded.pp;

    fromRotate(
      restruct(struct),
      { atoms: [...collapsedAtomIds, ...expandedAtomIds] },
      center,
      angle,
    );

    // Since an expanded monomer is present, the collapsed monomer's atom is
    // now rotated individually too (its position relative to its sgroup
    // changes), instead of being translated as a rigid body.
    const relativeAfter = Vec2.diff(atomCollapsed.pp, collapsedSGroup.pp!);
    expect(
      Math.abs(relativeAfter.x - relativeBefore.x) +
        Math.abs(relativeAfter.y - relativeBefore.y),
    ).toBeGreaterThan(0.1);
    expect(
      Math.abs(atomExpanded.pp.x - ex) + Math.abs(atomExpanded.pp.y - ey),
    ).toBeGreaterThan(0.1);
  });
});

describe('fromFlip: collapsed MonomerMicromolecule', () => {
  const center = new Vec2(0, 0);
  const restruct = (struct: Struct): ReStruct =>
    ({
      molecule: struct,
      atoms: new Map(),
      getBondEndpoint: () => undefined,
      markItem: () => undefined,
    }) as unknown as ReStruct;

  it('translates (does not individually flip) atoms of a collapsed monomer when no expanded monomer is in the selection', () => {
    const struct = new Struct();
    const { atomIds, sGroup } = makeMonomerSGroup(
      struct,
      [new Vec2(1, 0)],
      false,
    );
    const atom = struct.atoms.get(atomIds[0])!;
    const relativeBefore = Vec2.diff(atom.pp, sGroup.pp!);
    const { x: origX, y: origY } = atom.pp;

    fromFlip(restruct(struct), { atoms: atomIds }, 'horizontal', center);

    // The atom still moves (rigid-body translation, following the monomer)...
    expect(
      Math.abs(atom.pp.x - origX) + Math.abs(atom.pp.y - origY),
    ).toBeGreaterThan(0.1);
    // ...but its position relative to the sgroup is unchanged, i.e. it was
    // translated together with the monomer rather than individually flipped.
    const relativeAfter = Vec2.diff(atom.pp, sGroup.pp!);
    expect(relativeAfter.x).toBeCloseTo(relativeBefore.x);
    expect(relativeAfter.y).toBeCloseTo(relativeBefore.y);
  });

  it('does not store flip transformation for a collapsed monomer', () => {
    const struct = new Struct();
    const { atomIds, mockMonomer } = makeMonomerSGroup(
      struct,
      [new Vec2(1, 0)],
      false,
    );

    fromFlip(restruct(struct), { atoms: atomIds }, 'horizontal', center);

    expect(mockMonomer.monomerItem.transformation).toBeUndefined();
  });

  it('moves atoms and stores flip transformation for an expanded monomer', () => {
    const struct = new Struct();
    const { atomIds, mockMonomer } = makeMonomerSGroup(
      struct,
      [new Vec2(1, 0)],
      true,
    );
    const atom = struct.atoms.get(atomIds[0])!;
    const { x: origX, y: origY } = atom.pp;

    fromFlip(restruct(struct), { atoms: atomIds }, 'horizontal', center);

    expect(
      Math.abs(atom.pp.x - origX) + Math.abs(atom.pp.y - origY),
    ).toBeGreaterThan(0.1);
    expect(mockMonomer.monomerItem.transformation?.flip).toBe('horizontal');
  });

  it('flips every monomer atom individually in a mixed selection (at least one expanded monomer present)', () => {
    const struct = new Struct();
    const { atomIds: collapsedAtomIds, mockMonomer: collapsedM } =
      makeMonomerSGroup(struct, [new Vec2(1, 0)], false);
    const { atomIds: expandedAtomIds, mockMonomer: expandedM } =
      makeMonomerSGroup(struct, [new Vec2(3, 0)], true);

    const atomCollapsed = struct.atoms.get(collapsedAtomIds[0])!;
    const atomExpanded = struct.atoms.get(expandedAtomIds[0])!;
    const { x: cx, y: cy } = atomCollapsed.pp;
    const { x: ex, y: ey } = atomExpanded.pp;

    fromFlip(
      restruct(struct),
      { atoms: [...collapsedAtomIds, ...expandedAtomIds] },
      'horizontal',
      center,
    );

    expect(
      Math.abs(atomCollapsed.pp.x - cx) + Math.abs(atomCollapsed.pp.y - cy),
    ).toBeGreaterThan(0.1);
    expect(
      Math.abs(atomExpanded.pp.x - ex) + Math.abs(atomExpanded.pp.y - ey),
    ).toBeGreaterThan(0.1);
    expect(collapsedM.monomerItem.transformation?.flip).toBe('horizontal');
    expect(expandedM.monomerItem.transformation?.flip).toBe('horizontal');
  });
});
