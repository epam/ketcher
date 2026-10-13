import { fromPaste } from 'application/editor/actions/paste';
import { Render } from 'application/render';
import type { RenderOptions } from 'application/render/render.types';
import { ReStruct } from 'application/render/restruct';
import {
  Atom,
  Fragment,
  Image,
  RxnArrow,
  RxnArrowMode,
  RxnPlus,
  SGroup,
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

function createStructWithContractedGroup(
  xs: number[],
  outsideXs: number[] = [],
) {
  const struct = new Struct();
  const fragmentId = struct.frags.add(new Fragment());
  const sgroup = new SGroup(SGroup.TYPES.SUP);
  sgroup.data.name = 'R';
  sgroup.data.expanded = false;
  xs.forEach((x) => {
    const atomId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(x, 0), fragment: fragmentId }),
    );
    sgroup.atoms.push(atomId);
  });
  struct.sgroups.add(sgroup);
  outsideXs.forEach((x) => {
    struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(x, 0), fragment: fragmentId }),
    );
  });
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

  it('includes the text box in the pasted content center', () => {
    const struct = createStructWithAtomAt(new Vec2(0, 0));
    struct.texts.add(
      new Text({
        content: '',
        position: new Vec2(0, 4),
        pos: [new Vec2(0, 4), new Vec2(0, 6), new Vec2(6, 6), new Vec2(6, 4)],
      }),
    );
    const restruct = createRestruct();

    fromPaste(restruct, struct, new Vec2(10, 10));

    expect(getPastedAtomPosition(restruct)).toEqual(new Vec2(7, 7));
  });

  it('takes the text box down from the anchor whichever way pos goes', () => {
    const struct = createStructWithAtomAt(new Vec2(0, 0));
    // After KET v2 import pos goes up from the anchor
    struct.texts.add(
      new Text({
        content: '',
        position: new Vec2(0, 4),
        pos: [new Vec2(0, 4), new Vec2(0, 2), new Vec2(6, 2), new Vec2(6, 4)],
      }),
    );
    const restruct = createRestruct();

    fromPaste(restruct, struct, new Vec2(10, 10));

    expect(getPastedAtomPosition(restruct)).toEqual(new Vec2(7, 7));
  });

  it('includes a reaction plus in the pasted content center', () => {
    const struct = createStructWithAtomAt(new Vec2(0, 0));
    struct.rxnPluses.add(new RxnPlus({ pp: new Vec2(4, 2) }));
    const restruct = createRestruct();

    fromPaste(restruct, struct, new Vec2(10, 10));

    expect(getPastedAtomPosition(restruct)).toEqual(new Vec2(8, 9));
  });

  it('places a lone image under the point', () => {
    const struct = new Struct();
    struct.images.add(new Image('', new Vec2(3, 4), new Vec2(1, 2)));
    const restruct = createRestruct();

    fromPaste(restruct, struct, new Vec2(10, 10));

    const [image] = Array.from(restruct.molecule.images.values());
    expect(image.center()).toEqual(new Vec2(10, 10));
  });

  it('places a lone contracted group by its label position', () => {
    const struct = createStructWithContractedGroup([0, 1, 5]);
    const restruct = createRestruct();

    fromPaste(restruct, struct, new Vec2(10, 10));

    expect(getPastedAtomPosition(restruct)).toEqual(new Vec2(8, 10));
  });

  it('places a molecule with one contracted group by the group label', () => {
    const struct = createStructWithContractedGroup([0, 1], [5]);
    const restruct = createRestruct();

    fromPaste(restruct, struct, new Vec2(10, 10));

    expect(getPastedAtomPosition(restruct)).toEqual(new Vec2(9.5, 10));
  });

  it('counts a contracted group by its label, not its hidden atoms', () => {
    const struct = createStructWithContractedGroup([0, 1], [5]);
    struct.rxnArrows.add(
      new RxnArrow({
        mode: RxnArrowMode.OpenAngle,
        pos: [new Vec2(6, 0), new Vec2(7, 0)],
      }),
    );
    const restruct = createRestruct();

    fromPaste(restruct, struct, new Vec2(10, 10));

    expect(getPastedAtomPosition(restruct)).toEqual(new Vec2(6.25, 10));
  });

  it('centers a contracted group with an arrow by the whole content', () => {
    const struct = createStructWithContractedGroup([0, 1, 5]);
    struct.rxnArrows.add(
      new RxnArrow({
        mode: RxnArrowMode.OpenAngle,
        pos: [new Vec2(6, 0), new Vec2(7, 0)],
      }),
    );
    const restruct = createRestruct();

    fromPaste(restruct, struct, new Vec2(10, 10));

    expect(getPastedAtomPosition(restruct)).toEqual(new Vec2(5.5, 10));
  });
});
