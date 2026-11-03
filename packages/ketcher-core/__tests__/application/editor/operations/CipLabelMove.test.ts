import { Action } from 'application/editor/actions/action';
import { fromCipLabelMove } from 'application/editor/actions/cipLabel';
import { CipLabelMove } from 'application/editor/operations/CipLabelMove';
import { Render, ReStruct } from 'application/render';
import type { RenderOptions } from 'application/render';
import { Atom, Bond, Struct, Vec2 } from 'domain/entities';
import { AtomCIP, BondCIP } from 'domain/entities/types';

function buildReStruct() {
  const options = {
    microModeScale: 20,
    width: 100,
    height: 100,
  } as RenderOptions;
  const render = new Render(document as unknown as HTMLElement, options);
  const struct = new Struct();
  const beginId = struct.atoms.add(
    new Atom({ label: 'C', pp: new Vec2(0, 0), fragment: 0, cip: AtomCIP.R }),
  );
  const endId = struct.atoms.add(
    new Atom({ label: 'C', pp: new Vec2(1, 0), fragment: 0 }),
  );
  const bondId = struct.bonds.add(
    new Bond({
      begin: beginId,
      end: endId,
      type: Bond.PATTERN.TYPE.DOUBLE,
      cip: BondCIP.E,
    }),
  );
  return { restruct: new ReStruct(struct, render), beginId, bondId };
}

describe('CipLabelMove', () => {
  it('moves the label of an atom and undo puts it back', () => {
    const { restruct, beginId } = buildReStruct();
    const atom = restruct.molecule.atoms.get(beginId);

    const undo = fromCipLabelMove(restruct, 'atoms', beginId, new Vec2(1, 2));

    expect(atom?.cipLabelOffset).toEqual(new Vec2(1, 2));
    const redo = undo.perform(restruct);
    expect(atom?.cipLabelOffset).toEqual(new Vec2(0, 0));
    redo.perform(restruct);
    expect(atom?.cipLabelOffset).toEqual(new Vec2(1, 2));
  });

  it('moves the label of a bond', () => {
    const { restruct, bondId } = buildReStruct();

    fromCipLabelMove(restruct, 'bonds', bondId, new Vec2(-1, 0.5));

    expect(restruct.molecule.bonds.get(bondId)?.cipLabelOffset).toEqual(
      new Vec2(-1, 0.5),
    );
  });

  it('adds up consecutive moves', () => {
    const { restruct, beginId } = buildReStruct();

    fromCipLabelMove(restruct, 'atoms', beginId, new Vec2(1, 0));
    fromCipLabelMove(restruct, 'atoms', beginId, new Vec2(0, 2));

    expect(restruct.molecule.atoms.get(beginId)?.cipLabelOffset).toEqual(
      new Vec2(1, 2),
    );
  });

  it('is a dummy operation for a zero move, so a click leaves no undo step', () => {
    const { restruct } = buildReStruct();
    const action = new Action();
    action.addOp(new CipLabelMove('atoms', 0, new Vec2(0, 0)), restruct);

    expect(action.isDummy(restruct)).toBe(true);
  });

  it('does nothing when the owner no longer exists', () => {
    const { restruct } = buildReStruct();

    expect(() =>
      fromCipLabelMove(restruct, 'atoms', 999, new Vec2(1, 1)),
    ).not.toThrow();
  });

  it('does not copy the offset to a cloned atom', () => {
    const { restruct, beginId } = buildReStruct();
    fromCipLabelMove(restruct, 'atoms', beginId, new Vec2(1, 2));

    const atom = restruct.molecule.atoms.get(beginId) as Atom;

    expect(atom.clone().cipLabelOffset).toBeUndefined();
  });
});
