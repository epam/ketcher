import { CoreEditor } from 'application/editor';
import { polymerEditorTheme } from '../../../mock-data';
import { createPolymerEditorCanvas } from '../../../helpers/dom';
import ZoomTool from 'application/editor/tools/Zoom';

describe('Zoom Tool', () => {
  let canvas: SVGSVGElement;
  let button;
  const zoomed = jest.fn();

  beforeEach(() => {
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
      });
    });

    it('should not create scrollbar rects when canvas has no children', () => {
      const drawnStructures = canvas.querySelector('.drawn-structures')!;
      while (drawnStructures.firstChild) {
        drawnStructures.removeChild(drawnStructures.firstChild);
      }

      ZoomTool.instance.drawScrollBars();

      const scrollbarRects = canvas.querySelectorAll(
        'rect[data-testid$="-bar"]',
      );
      expect(scrollbarRects.length).toBe(0);
    });
  });
});
