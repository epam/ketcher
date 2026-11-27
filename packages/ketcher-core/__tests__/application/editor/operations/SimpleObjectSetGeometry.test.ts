import { fromSimpleObjectHandleDrag } from 'application/editor/actions/simpleobject';
import {
  SimpleObjectAdd,
  SimpleObjectSetGeometry,
} from 'application/editor/operations/simpleObject';
import { Render } from 'application/render';
import { ReStruct } from 'application/render/restruct';
import type { RenderOptions } from 'application/render/render.types';
import { SimpleObjectMode, Struct, Vec2 } from 'domain/entities';

const positionsOf = (restruct: ReStruct, id: number) =>
  restruct.molecule.simpleObjects
    .get(id)
    ?.pos.map((point) => [point.x, point.y]);

describe('SimpleObjectSetGeometry', () => {
  let restruct: ReStruct;
  let id: number;

  beforeEach(() => {
    const options = {
      scale: 40,
      width: 100,
      height: 100,
    } as unknown as RenderOptions;
    const render = new Render(document as unknown as HTMLElement, options);
    restruct = new ReStruct(new Struct(), render);

    const add = new SimpleObjectAdd(
      [new Vec2(0, 0), new Vec2(4, 2)],
      SimpleObjectMode.rectangle,
    );
    add.execute(restruct);
    id = add.data.id as number;
  });

  it('sets the geometry and restores it on invert', () => {
    const operation = new SimpleObjectSetGeometry(id, {
      kind: SimpleObjectMode.rectangle,
      start: new Vec2(1, 1),
      end: new Vec2(5, 5),
    });

    operation.execute(restruct);
    expect(positionsOf(restruct, id)).toEqual([
      [1, 1],
      [5, 5],
    ]);

    operation.invert().execute(restruct);
    expect(positionsOf(restruct, id)).toEqual([
      [0, 0],
      [4, 2],
    ]);
  });

  it('is a dummy when the geometry does not change', () => {
    const operation = new SimpleObjectSetGeometry(id, {
      kind: SimpleObjectMode.rectangle,
      start: new Vec2(0, 0),
      end: new Vec2(4, 2),
    });

    expect(operation.isDummy(restruct)).toBe(true);
  });

  it('resizes by a named handle and undoes in one step', () => {
    const inverse = fromSimpleObjectHandleDrag(
      restruct,
      id,
      'bottomRight',
      new Vec2(6, 3),
    );

    expect(positionsOf(restruct, id)).toEqual([
      [0, 0],
      [6, 3],
    ]);

    inverse.perform(restruct);
    expect(positionsOf(restruct, id)).toEqual([
      [0, 0],
      [4, 2],
    ]);
  });

  it('keeps circle snapping for additions that request it', () => {
    const add = new SimpleObjectAdd(
      [new Vec2(0, 0), new Vec2(4, 2)],
      SimpleObjectMode.ellipse,
      true,
    );
    add.execute(restruct);

    expect(positionsOf(restruct, add.data.id as number)).toEqual([
      [0, 0],
      [2, 2],
    ]);
  });
});
