import type Editor from '../Editor';
import PasteTool from './paste';
import {
  getPointerPositionOnCanvas,
  placePastedContentUnderPointer,
} from './pasteUnderPointer';

const createEditor = (
  lastCursorPosition: { x: number; y: number },
  tool: unknown = null,
) =>
  ({
    lastCursorPosition,
    tool: jest.fn(() => tool),
    render: {
      clientArea: {
        getBoundingClientRect: () => ({
          x: 100,
          y: 50,
          width: 800,
          height: 600,
        }),
      },
    },
  }) as unknown as Editor;

const createPasteTool = () => {
  const pasteTool = Object.create(PasteTool.prototype);
  pasteTool.mousemove = jest.fn();
  return pasteTool;
};

describe('getPointerPositionOnCanvas', () => {
  it('converts the position over the canvas to client coordinates', () => {
    expect(
      getPointerPositionOnCanvas(createEditor({ x: 200, y: 120 })),
    ).toEqual({ clientX: 300, clientY: 170 });
  });

  it('accepts the canvas edges', () => {
    expect(
      getPointerPositionOnCanvas(createEditor({ x: 800, y: 600 })),
    ).toEqual({ clientX: 900, clientY: 650 });
  });

  it('is null before the pointer has moved over the canvas', () => {
    expect(getPointerPositionOnCanvas(createEditor({ x: 0, y: 0 }))).toBeNull();
  });

  it.each([
    ['left of', { x: -5, y: 10 }],
    ['above', { x: 10, y: -5 }],
    ['right of', { x: 801, y: 10 }],
    ['below', { x: 10, y: 601 }],
  ])('is null when the pointer is %s the canvas', (_name, position) => {
    expect(getPointerPositionOnCanvas(createEditor(position))).toBeNull();
  });
});

describe('placePastedContentUnderPointer', () => {
  let animationFrames: FrameRequestCallback[];

  beforeEach(() => {
    animationFrames = [];
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      animationFrames.push(cb);
      return animationFrames.length;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('moves the paste preview to the position', () => {
    const pasteTool = createPasteTool();

    placePastedContentUnderPointer(createEditor({ x: 1, y: 1 }, pasteTool), {
      clientX: 30,
      clientY: 40,
    });

    const [moveEvent] = pasteTool.mousemove.mock.calls[0];
    expect(moveEvent.clientX).toBe(30);
    expect(moveEvent.clientY).toBe(40);
    expect(animationFrames).toHaveLength(0);
  });

  it('waits for the paste tool and gives up after a few frames', () => {
    const editor = createEditor({ x: 1, y: 1 });

    placePastedContentUnderPointer(editor, { clientX: 1, clientY: 1 });
    while (animationFrames.length > 0) {
      animationFrames.shift()?.(0);
    }

    expect(editor.tool).toHaveBeenCalledTimes(11);
  });

  it('moves the preview once the tool becomes active', () => {
    const pasteTool = createPasteTool();
    const editor = createEditor({ x: 1, y: 1 });
    (editor.tool as jest.Mock)
      .mockReturnValueOnce(null)
      .mockReturnValue(pasteTool);

    placePastedContentUnderPointer(editor, { clientX: 5, clientY: 6 });
    animationFrames.shift()?.(0);

    expect(pasteTool.mousemove).toHaveBeenCalledTimes(1);
  });
});
