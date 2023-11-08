import { CoreEditor } from 'application/editor';
import { polymerEditorTheme } from '../../../mock-data';
import { createPolymerEditorCanvas } from '../../../helpers/dom';
import ZoomTool from 'application/editor/tools/Zoom';
import { select } from 'd3';

describe('Zoom Tool', () => {
  let canvas: SVGSVGElement;
  let button;
  const zoomed = jest.fn();

  beforeEach(() => {
    window.SVGElement.prototype.getBBox = () => ({
      width: 20,
      height: 30,
    });
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

  ['zoom-in', 'zoom-out', 'zoom-reset'].forEach((name) => {
    it(`should zoom in when press element with class name ${name}`, () => {
      jest.spyOn(ZoomTool.prototype, 'initMenuZoom').mockImplementation(() => {
        select(`.${name}`).on('click', zoomed);
      });
      // eslint-disable-next-line no-new
      new CoreEditor({
        theme: polymerEditorTheme,
        canvas,
      });
      const zoomInBtn = document.getElementsByClassName(`${name}`)[0];
      zoomInBtn?.dispatchEvent(new MouseEvent('click'));
      expect(zoomed).toHaveBeenCalled();
    });
  });

  it('should zoom in when scroll mouse wheel up and press CTRL', () => {
    jest.spyOn(ZoomTool.prototype, 'zoomAction').mockImplementation(zoomed);

    // eslint-disable-next-line no-new
    new CoreEditor({
      theme: polymerEditorTheme,
      canvas,
    });
    canvas.dispatchEvent(
      new WheelEvent('wheel', { deltaY: 60, ctrlKey: true }),
    );
    expect(zoomed).toHaveBeenCalled();
  });
});
