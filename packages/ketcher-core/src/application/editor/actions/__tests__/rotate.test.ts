import { fromRotate } from '../rotate';
import { Struct } from 'domain/entities/struct';
import { Vec2 } from 'domain/entities/vec2';
import { RxnPlus } from 'domain/entities/rxnPlus';
import { Text } from 'domain/entities/text';
import { SGroup } from 'domain/entities/sgroup';
import { Fragment } from 'domain/entities/fragment';

/**
 * Regression tests for https://github.com/epam/ketcher/issues/6170
 *
 * `fromRotate` used to dereference `.pp`/`.position` on pool entries looked
 * up by id from the (possibly stale) editor selection without checking
 * whether the entry still exists in the current Struct. If the selection
 * held on to an id of an item that no longer exists (deleted, replaced,
 * or a race between struct mutation and selection state), this threw:
 * `TypeError: Cannot read properties of undefined (reading 'pp')`.
 *
 * `fromRotate` itself takes untyped params (see the `// eslint-disable-line`
 * on its declaration), so plain duck-typed fixtures are passed directly
 * without needing type casts.
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
