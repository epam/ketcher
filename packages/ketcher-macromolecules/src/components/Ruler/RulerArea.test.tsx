import { act, render, screen } from '@testing-library/react';
import { ZoomTransform } from 'd3';
import { useSelector } from 'react-redux';

import { RootSizeContext } from '../../contexts';

import { RulerArea } from './RulerArea';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

jest.mock('hooks', () => ({
  useLayoutMode: () => 'sequence-layout-mode',
}));

jest.mock('../../hooks/useZoomTransform', () => ({
  useZoomTransform: () => ({
    applyX: (value: number) => value,
    invertX: (value: number) => value,
  }),
}));

jest.mock('./RulerInput', () => ({
  __esModule: true,
  default: ({ offsetX }: { offsetX: number }) => (
    <input data-testid="ruler-input" data-offset-x={offsetX} />
  ),
}));

const mockRulerHandleProps: {
  current?: {
    onDragStart: (event: unknown) => void;
    onDrag: (event: unknown) => void;
    onDragEnd: (event: unknown) => void;
  };
} = {};

jest.mock('./RulerHandle', () => ({
  __esModule: true,
  default: (props: typeof mockRulerHandleProps.current) => {
    mockRulerHandleProps.current = props;
    return null;
  },
}));

jest.mock('./RulerScale', () => ({
  __esModule: true,
  default: () => null,
}));

describe('RulerArea', () => {
  it('moves a persisted ruler input into view when the editor becomes visible', () => {
    let canvasContainerWidth = 0;
    const canvasContainer = document.createElement('div');
    Object.defineProperty(canvasContainer, 'clientWidth', {
      get: () => canvasContainerWidth,
    });
    const canvas = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg',
    );
    canvasContainer.appendChild(canvas);

    const editor = {
      canvas,
      events: {
        setEditorLineLength: { dispatch: jest.fn() },
        toggleLineLengthHighlighting: { dispatch: jest.fn() },
      },
    };

    (useSelector as unknown as jest.Mock).mockImplementation((selector) => {
      const selectorName = selector.name;

      if (selectorName === 'selectEditorLineLength') {
        return {
          'sequence-layout-mode': 210,
          'snake-layout-mode': 30,
          'flex-layout-mode': 30,
        };
      }

      return editor;
    });

    const { rerender } = render(
      <RootSizeContext.Provider value={{ width: 0, height: 0 }}>
        <RulerArea />
      </RootSizeContext.Provider>,
    );

    expect(screen.getByTestId('ruler-input')).toHaveAttribute(
      'data-offset-x',
      '4460',
    );

    canvasContainerWidth = 900;
    rerender(
      <RootSizeContext.Provider value={{ width: 1200, height: 800 }}>
        <RulerArea />
      </RootSizeContext.Provider>,
    );

    expect(screen.getByTestId('ruler-input')).toHaveAttribute(
      'data-offset-x',
      '865',
    );
  });

  describe('dragging the slider', () => {
    const lineLength = 30;
    // Sequence mode places a line length of 30 at 40 + 3 * 210
    const sliderPosition = 670;
    const visibleWidth = 900;

    const renderDraggableRuler = () => {
      const canvasContainer = document.createElement('div');
      Object.defineProperty(canvasContainer, 'clientWidth', {
        get: () => visibleWidth,
      });
      const canvas = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg',
      );
      canvasContainer.appendChild(canvas);

      const zoomTool = {
        zoomTransform: new ZoomTransform(1, 0, 0),
        scrollBy: jest.fn(),
      };
      const editor = {
        canvas,
        zoomTool,
        events: {
          setEditorLineLength: { dispatch: jest.fn() },
          toggleLineLengthHighlighting: { dispatch: jest.fn() },
        },
      };

      (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
        selector.name === 'selectEditorLineLength'
          ? {
              'sequence-layout-mode': lineLength,
              'snake-layout-mode': lineLength,
              'flex-layout-mode': lineLength,
            }
          : editor,
      );

      render(
        <RootSizeContext.Provider value={{ width: 1200, height: 800 }}>
          <RulerArea />
        </RootSizeContext.Provider>,
      );

      const dragTo = (clientX: number) => {
        act(() => {
          mockRulerHandleProps.current?.onDragStart({
            sourceEvent: { clientX: sliderPosition },
          });
        });
        act(() => {
          mockRulerHandleProps.current?.onDrag({ sourceEvent: { clientX } });
        });
      };

      const releaseAt = (clientX: number) => {
        act(() => {
          mockRulerHandleProps.current?.onDragEnd({ sourceEvent: { clientX } });
        });
      };

      return { zoomTool, dragTo, releaseAt };
    };

    it('scrolls the canvas to keep the slider visible when it is dragged beyond the right edge', () => {
      const { zoomTool, dragTo } = renderDraggableRuler();

      dragTo(1000);

      // The slider and the input next to it (10px away, 35px wide) end at the edge
      expect(zoomTool.scrollBy).toHaveBeenCalledWith(
        visibleWidth - (1000 + 10 + 35),
        0,
      );
    });

    it('scrolls the canvas when the released slider snaps beyond the right edge', () => {
      const { zoomTool, dragTo, releaseAt } = renderDraggableRuler();

      dragTo(850);
      expect(zoomTool.scrollBy).not.toHaveBeenCalled();

      // 39.5 monomers round to 40, which Sequence mode places at 40 + 4 * 210
      releaseAt(850);

      expect(zoomTool.scrollBy).toHaveBeenCalledWith(
        visibleWidth - (880 + 10 + 35),
        0,
      );
    });

    it('does not scroll the canvas while the slider stays within the visible area', () => {
      const { zoomTool, dragTo } = renderDraggableRuler();

      dragTo(700);

      expect(zoomTool.scrollBy).not.toHaveBeenCalled();
    });
  });
});
