import { CoreEditor } from 'application/editor';
import { polymerEditorTheme } from '../../../mock-data';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../helpers/dom';
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
      renderersContainer: createRenderersManager(polymerEditorTheme),
    });
    canvas.dispatchEvent(
      new WheelEvent('wheel', { deltaY: 60, ctrlKey: true }),
    );
    expect(zoomed).toHaveBeenCalled();
  });
});
