import { CoreEditor } from 'application/editor';
import { polymerEditorTheme } from '../../../mock-data';
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
  } as DOMRect);

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
    window.SVGElement.prototype.getBBox = () =>
      ({
        width: 20,
        height: 30,
      } as DOMRect);
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
      theme: polymerEditorTheme,
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
      // eslint-disable-next-line no-new
      new CoreEditor({
        theme: polymerEditorTheme,
        canvas,
        renderersContainer: createRenderersManager(polymerEditorTheme),
      });
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
