import { fromPaste } from 'application/editor/actions/paste';
import { Render } from 'application/render';
import type { RenderOptions } from 'application/render/render.types';
import { ReStruct } from 'application/render/restruct';
import {
  Atom,
  Fragment,
  RxnArrow,
  RxnArrowMode,
  SimpleObject,
  SimpleObjectMode,
  Struct,
  Text,
  Vec2,
} from 'domain/entities';

function createRestruct() {
  const options = {
    scale: 40,
    width: 100,
    height: 100,
  } as unknown as RenderOptions;
  const render = new Render(document as unknown as HTMLElement, options);
  return new ReStruct(new Struct(), render);
}

function createStructWithAtomAt(position: Vec2) {
  const struct = new Struct();
  const fragmentId = struct.frags.add(new Fragment());
  struct.atoms.add(
    new Atom({ label: 'C', pp: position, fragment: fragmentId }),
  );
  return struct;
}

function getPastedAtomPosition(restruct: ReStruct) {
  const [atom] = Array.from(restruct.molecule.atoms.values());
  return atom.pp;
}

describe('fromPaste', () => {
  it('places the center of atoms and arrows together under the point', () => {
    const struct = createStructWithAtomAt(new Vec2(0, 0));
    struct.rxnArrows.add(
      new RxnArrow({
        mode: RxnArrowMode.OpenAngle,
        pos: [new Vec2(4, 0), new Vec2(6, 0)],
      }),
    );
    const restruct = createRestruct();

    fromPaste(restruct, struct, new Vec2(10, 10));

    expect(getPastedAtomPosition(restruct)).toEqual(new Vec2(7, 10));
  });

  it('includes text in the pasted content center', () => {
    const struct = createStructWithAtomAt(new Vec2(0, 0));
    struct.texts.add(
      new Text({ content: '', position: new Vec2(0, 4), pos: [] }),
    );
    const restruct = createRestruct();

    fromPaste(restruct, struct, new Vec2(10, 10));

    expect(getPastedAtomPosition(restruct)).toEqual(new Vec2(10, 8));
  });

  it('includes the whole extent of an ellipse in the pasted content center', () => {
    const struct = createStructWithAtomAt(new Vec2(0, 0));
    struct.simpleObjects.add(
      new SimpleObject({
        mode: SimpleObjectMode.ellipse,
        pos: [new Vec2(2, 0), new Vec2(6, 2)],
      }),
    );
    const restruct = createRestruct();

    fromPaste(restruct, struct, new Vec2(10, 10));

    expect(getPastedAtomPosition(restruct)).toEqual(new Vec2(7, 9));
  });

  it('places a lone atom under the point', () => {
    const struct = createStructWithAtomAt(new Vec2(3, 5));
    const restruct = createRestruct();

    fromPaste(restruct, struct, new Vec2(10, 10));

    expect(getPastedAtomPosition(restruct)).toEqual(new Vec2(10, 10));
  });
});
