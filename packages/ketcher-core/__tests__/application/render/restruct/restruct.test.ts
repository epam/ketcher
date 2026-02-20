import { ReSimpleObject, ReStruct, Render } from 'application/render';
import { RenderOptions } from 'application/render/render.types';
import { SimpleObjectMode, Struct, Vec2 } from 'domain/entities';

describe('show selection', () => {
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
  const reSimpleObject = new ReSimpleObject(ellipse);
  reSimpleObject.showPoints = jest.fn();
  reSimpleObject.hidePoints = jest.fn();
  const option = {
    microModeScale: 20,
    width: 100,
    height: 100,
  } as RenderOptions;
  const render = new Render(document as unknown as HTMLElement, option);
  const restruct = new ReStruct(new Struct(), render);
  it('should show selection simple objects correctly when selected', () => {
    restruct.showItemSelection(reSimpleObject, true);
    expect(reSimpleObject.showPoints).toHaveBeenCalled();
  });
  it('should show selection simple objects correctly when unselected', () => {
    restruct.showItemSelection(reSimpleObject, false);
    expect(reSimpleObject.hidePoints).toHaveBeenCalled();
  });
});

describe('CIP label background on selection toggle', () => {
  const option = {
    microModeScale: 20,
    width: 100,
    height: 100,
  } as RenderOptions;
  const render = new Render(document as unknown as HTMLElement, option);
  const restruct = new ReStruct(new Struct(), render);
  const cipAttrMock = jest.fn();
  const selectionPlate = {
    show: jest.fn(),
    hide: jest.fn(),
    removed: false,
  };
  const cipItem = {
    selectionPlate,
    cip: { rectangle: { attr: cipAttrMock } },
  };

  it('restores CIP label background after deselection', () => {
    restruct.showItemSelection(cipItem, true);
    restruct.showItemSelection(cipItem, false);

    expect(cipAttrMock).toHaveBeenCalledWith({
      fill: '#7f7',
      stroke: '#7f7',
    });
    expect(cipAttrMock).toHaveBeenLastCalledWith({
      fill: '#fff',
      stroke: '#fff',
    });
  });
});
