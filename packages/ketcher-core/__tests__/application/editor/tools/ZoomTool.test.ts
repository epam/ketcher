import { CoreEditor } from 'application/editor';
import { coreEditorTheme, polymerEditorTheme } from '../../../mock-data';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../helpers/dom';
import ZoomTool from 'application/editor/tools/Zoom';

const makeRect = (left: number, top: number, width: number, height: number) =>
  ({
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
  }) as DOMRect;

const mockGetBoundingClientRect = (element: Element, rect: DOMRect) => {
  Object.defineProperty(element, 'getBoundingClientRect', {
    value: () => rect,
    configurable: true,
  });
};

describe('Zoom Tool', () => {
  let canvas: SVGSVGElement;
  let button;
  const zoomed = jest.fn();

  beforeEach(() => {
    document.body.innerHTML = '';
    zoomed.mockClear();
    globalThis.SVGElement.prototype.getBBox = () =>
      ({
        width: 20,
        height: 30,
      }) as DOMRect;
    canvas = createPolymerEditorCanvas();
    Object.defineProperty(canvas, 'width', {
      value: {
        baseVal: {
          value: 100,
        },
      },
    });
    Object.defineProperty(canvas, 'height', {
      value: {
        baseVal: {
          value: 100,
        },
      },
    });
    button = document.createElement('button');
    button.setAttribute('class', 'zoom-in');
    document.body.appendChild(button);
  });

  it('should zoom in when scroll mouse wheel up and press CTRL', () => {
    jest.spyOn(ZoomTool.prototype, 'zoomAction').mockImplementation(zoomed);

    // @ts-expect-error TS6133: Instantiated for side effects (singleton registration)
    const _editor = new CoreEditor({
      theme: coreEditorTheme,
      canvas,
      renderersContainer: createRenderersManager(polymerEditorTheme),
    });
    canvas.dispatchEvent(
      new WheelEvent('wheel', { deltaY: 60, ctrlKey: true }),
    );
    expect(zoomed).toHaveBeenCalled();
  });

  describe('drawScrollBars', () => {
    beforeEach(() => {
      jest.spyOn(ZoomTool.prototype, 'zoomAction').mockImplementation(zoomed);
      // @ts-expect-error TS6133: Instantiated for side effects (singleton registration)
      const _editor = new CoreEditor({
        theme: coreEditorTheme,
        canvas,
        renderersContainer: createRenderersManager(polymerEditorTheme),
      });
    });

    it.each([
      ['translated empty canvas', makeRect(52, 40, 0, 0), []],
      ['content within the viewport', makeRect(60, 60, 80, 80), []],
      ['content above the viewport', makeRect(60, 40, 80, 80), ['vertical']],
      ['content below the viewport', makeRect(60, 140, 80, 80), ['vertical']],
      [
        'content left of the viewport',
        makeRect(40, 60, 80, 80),
        ['horizontal'],
      ],
      [
        'content right of the viewport',
        makeRect(140, 60, 80, 80),
        ['horizontal'],
      ],
      [
        'horizontal line outside the viewport',
        makeRect(60, 40, 80, 0),
        ['vertical'],
      ],
      [
        'vertical line outside the viewport',
        makeRect(40, 60, 0, 80),
        ['horizontal'],
      ],
    ])(
      'should show only overflowing axes for %s',
      (_, bounds, expectedBars) => {
        const drawnStructures = canvas.querySelector(
          '.drawn-structures',
        ) as SVGGElement;
        mockGetBoundingClientRect(canvas, makeRect(50, 54, 100, 100));
        mockGetBoundingClientRect(drawnStructures, bounds);

        ZoomTool.instance.drawScrollBars();

        expect(
          Array.from(canvas.querySelectorAll('rect[data-testid$="-bar"]')).map(
            (bar) => bar.getAttribute('data-testid'),
          ),
        ).toEqual(expectedBars.map((axis) => `${axis}-bar`));
      },
    );

    it('should remove existing scrollbars after the canvas becomes empty', () => {
      const drawnStructures = canvas.querySelector(
        '.drawn-structures',
      ) as SVGGElement;
      mockGetBoundingClientRect(canvas, makeRect(50, 54, 100, 100));
      mockGetBoundingClientRect(drawnStructures, makeRect(40, 40, 200, 200));
      ZoomTool.instance.drawScrollBars();
      expect(canvas.querySelectorAll('rect[data-testid$="-bar"]')).toHaveLength(
        2,
      );

      mockGetBoundingClientRect(drawnStructures, makeRect(52, 40, 0, 0));
      ZoomTool.instance.drawScrollBars();

      expect(canvas.querySelectorAll('rect[data-testid$="-bar"]')).toHaveLength(
        0,
      );
    });

    it('should remove scrollbar rects when canvas returns to initial position', () => {
      const drawnStructures = canvas.querySelector(
        '.drawn-structures',
      ) as SVGGElement;
      drawnStructures.appendChild(
        document.createElementNS('http://www.w3.org/2000/svg', 'g'),
      );

      mockGetBoundingClientRect(canvas, makeRect(0, 0, 100, 100));
      mockGetBoundingClientRect(drawnStructures, makeRect(-20, 0, 140, 100));

      ZoomTool.instance.drawScrollBars();

      expect(canvas.querySelectorAll('rect[data-testid$="-bar"]').length).toBe(
        1,
      );

      mockGetBoundingClientRect(drawnStructures, makeRect(0, 0, 100, 100));

      ZoomTool.instance.drawScrollBars();

      expect(canvas.querySelectorAll('rect[data-testid$="-bar"]').length).toBe(
        0,
      );
    });
  });
});
