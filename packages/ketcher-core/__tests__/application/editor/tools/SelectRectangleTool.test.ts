import { CoreEditor, FlexMode } from 'application/editor';
import { PeptideRenderer } from 'application/render/renderers/PeptideRenderer';
import {
  getFinishedPolymerBond,
  peptideMonomerItem,
  polymerEditorTheme,
} from '../../../mock-data';
import { createPolymerEditorCanvas } from '../../../helpers/dom';
import { SelectRectangle } from 'application/editor/tools/SelectRectangle';
import { Vec2 } from 'domain/entities/vec2';
import { BaseMonomerRenderer } from 'application/render/renderers';

jest.mock('d3', () => {
  return {
    brush() {
      return {
        on() {},
      };
    },
    select() {
      return {
        call() {
          return this;
        },
        insert() {
          return this;
        },
        select() {
          return this;
        },
        attr() {
          return this;
        },
        style() {
          return this;
        },
        on() {
          return this;
        },
        append() {
          return this;
        },
        data() {
          return this;
        },
        text() {
          return this;
        },
        node() {
          return {
            getBBox() {
              return {};
            },
            getBoundingClientRect() {
              return {};
            },
          };
        },
      };
    },
    ZoomTransform: jest.fn().mockImplementation(() => {
      return { invertX() {}, invertY() {} };
    }),
    zoom() {
      return {
        scaleExtent() {
          return this;
        },
        wheelDelta() {
          return this;
        },
        filter() {
          return this;
        },
        on() {
          return this;
        },
      };
    },
  };
});

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('Select Rectangle Tool', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should select drawing entity on mousedown', () => {
    createPolymerEditorCanvas();

    const polymerBond = getFinishedPolymerBond(0, 0, 10, 10);
    const event = {
      target: {
        __data__: polymerBond.renderer,
      },
    };
    const selectRectangleTool = new SelectRectangle(
      new CoreEditor({
        theme: polymerEditorTheme,
        canvas: createPolymerEditorCanvas(),
        mode: new FlexMode(),
      }),
    );

    expect(polymerBond.selected).toBeFalsy();
    selectRectangleTool.mousedown(event);
    expect(polymerBond.selected).toBeTruthy();
  });

  it('should initiate the render of peptide mousedown', () => {
    const canvas: SVGSVGElement = createPolymerEditorCanvas();
    const mode = new FlexMode();
    const editor: CoreEditor = new CoreEditor({
      canvas,
      theme: polymerEditorTheme,
      mode,
    });
    const onShow = jest.fn();
    jest.spyOn(PeptideRenderer.prototype, 'show').mockImplementation(onShow);
    editor.events.selectMonomer.dispatch(peptideMonomerItem);
    canvas.dispatchEvent(new Event('mouseover', { bubbles: true }));
    expect(onShow).toHaveBeenCalled();
  });

  it('should move selected entity', () => {
    const canvas: SVGSVGElement = createPolymerEditorCanvas();
    const mode = new FlexMode();
    const editor = new CoreEditor({
      theme: polymerEditorTheme,
      canvas,
      mode,
    });
    const onMove = jest.fn();

    jest
      .spyOn(BaseMonomerRenderer.prototype, 'moveSelection')
      .mockImplementation(onMove);
    jest
      .spyOn(PeptideRenderer.prototype, 'drawSelection')
      .mockImplementation(() => {});
    jest
      .spyOn(BaseMonomerRenderer.prototype, 'redrawEnumeration')
      .mockImplementation(() => {});
    jest
      .spyOn(BaseMonomerRenderer.prototype, 'reDrawChainBeginning')
      .mockImplementation(() => {});
    const fn = jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((func) => {
        func(0);
        return 0;
      });

    const modelChanges = editor.drawingEntitiesManager.addMonomer(
      peptideMonomerItem,
      new Vec2(0, 0),
    );
    editor.renderersContainer.update(modelChanges);

    const peptide = Array.from(editor.drawingEntitiesManager.monomers)[0][1];
    const selectRectangleTool = new SelectRectangle(editor);

    const initialPosition = peptide.position;
    const event = {
      target: {
        __data__: peptide.renderer,
      },
      pageX: initialPosition.x,
      pageY: initialPosition.y,
    };

    editor.drawingEntitiesManager.selectDrawingEntity(peptide);
    selectRectangleTool.mousedown(event);
    editor.lastCursorPositionOfCanvas.x = initialPosition.x + 100;
    editor.lastCursorPositionOfCanvas.y = initialPosition.y + 100;

    selectRectangleTool.mousemove();
    selectRectangleTool.mouseup(event);

    expect(onMove).toHaveBeenCalled();
    fn.mockRestore();
  });
});
