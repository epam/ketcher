import { Vec2, type RenderOptions, type ReStruct } from 'ketcher-core';
import type { Editor } from '../../Editor';
import closest from '../../shared/closest';
import { CipLabelMoveTool } from './cipLabelMoveTool';

const mockPointer = { position: new Vec2(0, 0) };
const mockPerformPreview = jest.fn();
const mockMoveAction = { perform: mockPerformPreview };

jest.mock('ketcher-core', () => ({
  ...jest.requireActual('ketcher-core'),
  CoordinateTransformation: { pageToModel: () => mockPointer.position },
  fromCipLabelMove: jest.fn(() => mockMoveAction),
}));

const { fromCipLabelMove } = jest.requireMock('ketcher-core');

const SCALE = 20;
const options = {
  microModeScale: SCALE,
  hoverStyle: { stroke: '#0097a8' },
} as unknown as RenderOptions;

// Label rectangle at canvas (40, 40)-(60, 50), which is model (2, 2)-(3, 2.5).
const labelRectangle = (attr = jest.fn()) => ({
  getBBox: () => ({ x: 40, y: 40, width: 20, height: 10 }),
  attr,
});

const restructWith = ({
  atoms = [],
  bonds = [],
}: {
  atoms?: Array<[number, unknown]>;
  bonds?: Array<[number, unknown]>;
}) =>
  ({
    atoms: new Map(atoms),
    bonds: new Map(bonds),
  }) as unknown as ReStruct;

describe('closest.cipLabel', () => {
  it('finds the CIP label of an atom under the pointer', () => {
    const restruct = restructWith({
      atoms: [[3, { cip: { rectangle: labelRectangle() } }]],
    });

    expect(closest.cipLabel(restruct, new Vec2(2.5, 2.2), options)).toEqual({
      owner: 'atoms',
      id: 3,
    });
  });

  it('finds the CIP label of a bond under the pointer', () => {
    const restruct = restructWith({
      bonds: [[7, { cip: { rectangle: labelRectangle() } }]],
    });

    expect(closest.cipLabel(restruct, new Vec2(2.5, 2.2), options)).toEqual({
      owner: 'bonds',
      id: 7,
    });
  });

  it('finds nothing next to the label or on atoms without a CIP label', () => {
    const restruct = restructWith({
      atoms: [
        [1, { cip: { rectangle: labelRectangle() } }],
        [2, {}],
      ],
    });

    expect(closest.cipLabel(restruct, new Vec2(3.5, 2.2), options)).toBeNull();
    expect(closest.cipLabel(restruct, new Vec2(2.5, 3), options)).toBeNull();
  });
});

describe('CipLabelMoveTool', () => {
  const event = {} as PointerEvent;
  const overLabel = new Vec2(2.5, 2.25);

  const setup = () => {
    const attr = jest.fn();
    const restruct = restructWith({
      atoms: [[1, { cip: { rectangle: labelRectangle(attr) } }]],
    });
    const editor = {
      render: {
        ctab: restruct,
        options,
        paper: {
          canvas: document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
        },
      },
      update: jest.fn(),
    } as unknown as Editor;
    return { attr, editor, tool: new CipLabelMoveTool(editor) };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPointer.position = new Vec2(0, 0);
  });

  it('does not start a drag away from a label', () => {
    const { tool } = setup();

    expect(tool.mousedown(event)).toBe(false);
    expect(tool.isDragging()).toBe(false);
    expect(tool.mouseup()).toBe(false);
  });

  it('moves the label by the pointer distance and commits one history step', () => {
    const { editor, tool } = setup();
    mockPointer.position = overLabel;

    expect(tool.mousedown(event)).toBe(true);
    mockPointer.position = new Vec2(3.5, 1.25);
    tool.mousemove(event);
    mockPointer.position = new Vec2(4.5, 1.25);
    tool.mousemove(event);
    tool.mouseup();

    expect(fromCipLabelMove).toHaveBeenLastCalledWith(
      editor.render.ctab,
      'atoms',
      1,
      new Vec2(2, -1),
    );
    expect(mockPerformPreview).toHaveBeenCalledTimes(1);
    expect(editor.update).toHaveBeenNthCalledWith(1, mockMoveAction, true);
    expect(editor.update).toHaveBeenNthCalledWith(2, mockMoveAction, true);
    expect(editor.update).toHaveBeenLastCalledWith(mockMoveAction);
    expect(tool.isDragging()).toBe(false);
  });

  it('leaves no history step when the label was only clicked', () => {
    const { editor, tool } = setup();
    mockPointer.position = overLabel;

    tool.mousedown(event);
    tool.mouseup();

    expect(editor.update).not.toHaveBeenCalled();
  });

  it('highlights the hovered label and restores it when the pointer leaves', () => {
    const { attr, editor, tool } = setup();
    attr.mockReturnValueOnce('none').mockReturnValueOnce(1);
    const canvas = editor.render.paper.canvas;
    mockPointer.position = overLabel;

    expect(tool.hover(event)).toBe(true);
    expect(canvas.getAttribute('cursor')).toBe('move');
    mockPointer.position = new Vec2(10, 10);
    expect(tool.hover(event)).toBe(false);

    expect(canvas.getAttribute('cursor')).toBeNull();
    expect(attr).toHaveBeenLastCalledWith({
      stroke: 'none',
      'stroke-width': 1,
    });
  });
});
