import { Action } from 'application/editor/actions/action';
import { CipLabelMove } from 'application/editor/operations/CipLabelMove';
import { Render, ReStruct } from 'application/render';
import type { RenderOptions } from 'application/render';
import { Atom, Bond, Struct, Vec2 } from 'domain/entities';
import { AtomCIP, BondCIP } from 'domain/entities/types';

function buildReStruct() {
  const render = new Render(
    document as unknown as HTMLElement,
    {
      microModeScale: 20,
    } as RenderOptions,
  );
  const struct = new Struct();
  const atomId = struct.atoms.add(
    new Atom({ label: 'C', pp: new Vec2(0, 0), fragment: 0, cip: AtomCIP.R }),
  );
  const endId = struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(1, 0) }));
  const bondId = struct.bonds.add(
    new Bond({
      begin: atomId,
      end: endId,
      type: Bond.PATTERN.TYPE.DOUBLE,
      cip: BondCIP.E,
    }),
  );
  return { restruct: new ReStruct(struct, render), atomId, bondId };
}

const move = (restruct: ReStruct, owner: 'atoms' | 'bonds', id: number) => {
  const action = new Action();
  action.addOp(new CipLabelMove(owner, id, new Vec2(1, 2)));
  return action.perform(restruct);
};

describe('CipLabelMove', () => {
  it('moves the label of an atom, and undo and redo restore it', () => {
    const { restruct, atomId } = buildReStruct();
    const atom = restruct.molecule.atoms.get(atomId);

    const undo = move(restruct, 'atoms', atomId);
    expect(atom?.cipLabelOffset).toEqual(new Vec2(1, 2));

    const redo = undo.perform(restruct);
    expect(atom?.cipLabelOffset).toEqual(new Vec2(0, 0));
    redo.perform(restruct);
    expect(atom?.cipLabelOffset).toEqual(new Vec2(1, 2));
  });

  it('moves the label of a bond', () => {
    const { restruct, bondId } = buildReStruct();

    move(restruct, 'bonds', bondId);

    expect(restruct.molecule.bonds.get(bondId)?.cipLabelOffset).toEqual(
      new Vec2(1, 2),
    );
  });

  it('is a dummy for a zero move, so a click leaves no undo step', () => {
    const { restruct, atomId } = buildReStruct();
    const action = new Action();
    action.addOp(new CipLabelMove('atoms', atomId, new Vec2()), restruct);

    expect(action.isDummy(restruct)).toBe(true);
  });

  it('does not copy the offset to a cloned atom', () => {
    const { restruct, atomId } = buildReStruct();
    move(restruct, 'atoms', atomId);

    const atom = restruct.molecule.atoms.get(atomId) as Atom;

    expect(atom.clone().cipLabelOffset).toBeUndefined();
  });
});
