import ReFrag from 'application/render/restruct/refrag';
import { LayerMap } from 'application/render/restruct/generalEnumTypes';
import { uniteHoverPaths } from 'application/render/restruct/hoverPath';
import type { Render } from 'application/render/raphaelRender';
import type { Fragment } from 'domain/entities/fragment';

jest.mock('application/render/restruct/hoverPath', () => ({
  uniteHoverPaths: jest.fn(() => 'M 0 0 L 1 0 L 1 1 Z'),
}));

it('draws the hover of a fragment as one united path using hoverStyle', () => {
  const frag = new ReFrag({} as Fragment);
  const atomPlates = new Map<number, object>();
  const atoms = new Map<number, unknown>();
  [
    { aid: 1, fragment: 0 },
    { aid: 2, fragment: 0 },
    { aid: 3, fragment: 1 },
  ].forEach(({ aid, fragment }) => {
    const plate = { id: `atom-${aid}` };
    atomPlates.set(aid, plate);
    atoms.set(aid, {
      a: { fragment },
      makeHoverPlate: jest.fn(() => plate),
    });
  });
  const bondPlate = { id: 'bond-1' };
  const bond = {
    b: { begin: 1, end: 2 },
    makeHoverPlate: jest.fn(() => bondPlate),
  };
  const hoverPath = { attr: jest.fn() };
  hoverPath.attr.mockReturnValue(hoverPath);
  const hoverStyle = { stroke: '#0097A8', fill: '#CCFFDD' };
  const render = {
    ctab: {
      frags: { keyOf: (item: unknown) => (item === frag ? 0 : null) },
      atoms,
      bonds: new Map([[1, bond]]),
      getBondEndpoint: (aid: number) => atoms.get(aid),
      addReObjectPath: jest.fn(),
    },
    paper: {
      path: jest.fn(() => hoverPath),
      setStart: jest.fn(),
      setFinish: jest.fn(() => ({})),
    },
    options: { hoverStyle },
  } as unknown as Render;

  frag.setHover(true, render);

  expect(uniteHoverPaths).toHaveBeenCalledWith([
    atomPlates.get(1),
    atomPlates.get(2),
    bondPlate,
  ]);
  expect(render.paper.path).toHaveBeenCalledWith('M 0 0 L 1 0 L 1 1 Z');
  expect(hoverPath.attr).toHaveBeenCalledWith(hoverStyle);
  expect(render.ctab.addReObjectPath).toHaveBeenCalledWith(
    LayerMap.hovering,
    frag.visel,
    hoverPath,
  );
});
