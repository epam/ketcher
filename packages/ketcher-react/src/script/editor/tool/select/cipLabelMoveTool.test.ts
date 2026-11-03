import { Vec2, type RenderOptions, type ReStruct } from 'ketcher-core';
import type { Editor } from '../../Editor';
import closest from '../../shared/closest';
import { CipLabelMoveTool } from './cipLabelMoveTool';

const mockPointer = { position: new Vec2(0, 0) };
const mockAction = { perform: jest.fn() };

jest.mock('ketcher-core', () => ({
  ...jest.requireActual('ketcher-core'),
  CoordinateTransformation: { pageToModel: () => mockPointer.position },
  Action: jest.fn(() => ({
    addOp: jest.fn(),
    perform: () => mockAction,
  })),
  CipLabelMove: jest.fn(),
}));

const { CipLabelMove } = jest.requireMock('ketcher-core');

const options = { microModeScale: 20 } as RenderOptions;

// Label rectangle at canvas (40, 40)-(60, 50), which is model (2, 2)-(3, 2.5)
const label = () => ({
  cip: {
    rectangle: { getBBox: () => ({ x: 40, y: 40, width: 20, height: 10 }) },
  },
});

describe('closest.cipLabel', () => {
  it('finds the label of an atom or a bond under the pointer, and nothing next to it', () => {
    const restruct = {
      atoms: new Map([[3, label()]]),
      bonds: new Map([[7, label()]]),
    } as unknown as ReStruct;
    const noLabel = { atoms: new Map([[1, {}]]), bonds: new Map() };

    expect(
      closest.cipLabel(restruct, new Vec2(2.5, 2.2), options),
    ).toMatchObject({ owner: 'atoms', id: 3 });
    expect(
      closest.cipLabel(
        { ...restruct, atoms: new Map() } as unknown as ReStruct,
        new Vec2(2.5, 2.2),
        options,
      ),
    ).toMatchObject({ owner: 'bonds', id: 7 });
    expect(closest.cipLabel(restruct, new Vec2(3.5, 2.2), options)).toBeNull();
    expect(
      closest.cipLabel(
        noLabel as unknown as ReStruct,
        new Vec2(2.5, 2.2),
        options,
      ),
    ).toBeNull();
  });
});

describe('CipLabelMoveTool', () => {
  const event = {} as PointerEvent;

  const setup = () => {
    const editor = {
      render: {
        ctab: { atoms: new Map([[1, label()]]), bonds: new Map() },
        options,
      },
      update: jest.fn(),
    } as unknown as Editor;
    return { editor, tool: new CipLabelMoveTool(editor) };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPointer.position = new Vec2(2.5, 2.25);
  });

  it('moves the label by the pointer distance and commits one history step', () => {
    const { editor, tool } = setup();

    expect(tool.mousedown(event)).toBe(true);
    mockPointer.position = new Vec2(4.5, 1.25);
    tool.mousemove(event);
    tool.mouseup();

    expect(CipLabelMove).toHaveBeenCalledWith('atoms', 1, new Vec2(2, -1));
    expect(editor.update).toHaveBeenNthCalledWith(1, mockAction, true);
    expect(editor.update).toHaveBeenLastCalledWith(mockAction);
    expect(tool.isDragging()).toBe(false);
  });

  it('does not start a drag away from a label, and a click leaves no history step', () => {
    const { editor, tool } = setup();

    mockPointer.position = new Vec2(10, 10);
    expect(tool.mousedown(event)).toBe(false);

    mockPointer.position = new Vec2(2.5, 2.25);
    tool.mousedown(event);
    tool.mouseup();
    expect(editor.update).not.toHaveBeenCalled();
  });
});
