import { CanvasLoad } from 'application/editor/operations/CanvasLoad';
import { Render } from 'application/render';
import { ReStruct } from 'application/render/restruct';
import type { RenderOptions } from 'application/render/render.types';
import { Struct } from 'domain/entities';

describe('CanvasLoad', () => {
  let restruct: ReStruct;
  let render: Render;
  let setMolecule: jest.SpyInstance;
  let clearVisels: jest.SpyInstance;

  beforeEach(() => {
    const options = {
      scale: 40,
      width: 100,
      height: 100,
    } as unknown as RenderOptions;
    render = new Render(document as unknown as HTMLElement, options);
    restruct = new ReStruct(new Struct(), render);
    setMolecule = jest
      .spyOn(render, 'setMolecule')
      .mockImplementation(() => undefined);
    clearVisels = jest.spyOn(restruct, 'clearVisels');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('clears the drawn elements of the current structure before rendering the new one', () => {
    const newStruct = new Struct();

    new CanvasLoad(newStruct).execute(restruct);

    expect(setMolecule).toHaveBeenCalledWith(newStruct, true);
    expect(clearVisels.mock.invocationCallOrder[0]).toBeLessThan(
      setMolecule.mock.invocationCallOrder[0],
    );
  });

  it('loads the previous structure back when inverted', () => {
    const oldStruct = restruct.molecule;
    const newStruct = new Struct();
    const load = new CanvasLoad(newStruct);

    load.execute(restruct);
    const restructWithNewStruct = new ReStruct(newStruct, render);
    load.invert().execute(restructWithNewStruct);

    expect(setMolecule).toHaveBeenLastCalledWith(oldStruct, true);
  });

  it('only clears the drawn elements when no structure is given', () => {
    new CanvasLoad().execute(restruct);

    expect(clearVisels).toHaveBeenCalledTimes(1);
    expect(setMolecule).not.toHaveBeenCalled();
  });

  it('throws when the structure is already the current one', () => {
    expect(() => new CanvasLoad(restruct.molecule).execute(restruct)).toThrow(
      'Unexpected data.struct loaded is equal to the restruct.molecule current',
    );
    expect(clearVisels).not.toHaveBeenCalled();
  });
});
