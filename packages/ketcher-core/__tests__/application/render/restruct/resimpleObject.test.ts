import { ReStruct, Render } from 'application/render';
import { RenderOptions } from 'application/render/render.types';
import ReSimpleObject from 'application/render/restruct/resimpleObject';
import { SimpleObjectMode, Struct, Vec2 } from 'domain/entities';

const ellipse = {
  mode: SimpleObjectMode.ellipse,
  pos: [
    new Vec2({
      x: 5.025,
      y: 9.600000000000001,
      z: 0,
    }),
    new Vec2({
      x: 10.05,
      y: 12.200000000000001,
      z: 0,
    }),
  ],
};
const rectangle = {
  mode: SimpleObjectMode.ellipse,
  pos: [
    new Vec2({
      x: 7.2250000000000005,
      y: 10.3,
      z: 0,
    }),
    new Vec2({
      x: 11.100000000000001,
      y: 12.825000000000001,
      z: 0,
    }),
  ],
};
const line = {
  mode: SimpleObjectMode.ellipse,
  pos: [
    new Vec2({
      x: 7.7,
      y: 9.125,
      z: 0,
    }),
    new Vec2({
      x: 11.3,
      y: 12.4,
      z: 0,
    }),
  ],
};
it('should get hover path and style for simple objects correctly', () => {
  [ellipse, rectangle, line].forEach((simpleObject) => {
    const reSimpleObject = new ReSimpleObject(simpleObject);
    const option = { scale: 20, width: 100, height: 100 } as RenderOptions;
    const render = new Render(document as unknown as HTMLElement, option);
    const paths = reSimpleObject.hoverPath(render);
    expect(
      paths.filter((path) => path.path.attrs.fill === '#fff')?.length,
    ).toBeGreaterThanOrEqual(1);
  });
});

it('should get selection plate for simple objects correctly with selection points in a separated set', () => {
  const reSimpleObject = new ReSimpleObject(ellipse);
  const initialPathLength = reSimpleObject.visel.paths.length;
  const option = { scale: 20, width: 100, height: 100 } as RenderOptions;
  const render = new Render(document as unknown as HTMLElement, option);
  const restruct = new ReStruct(new Struct(), render);
  reSimpleObject.makeSelectionPlate(restruct, render.paper, render.options);
  expect(initialPathLength + 1).toEqual(reSimpleObject.visel.paths.length);
});
