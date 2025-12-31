import { CoreEditor, EditorHistory, FlexMode } from 'application/editor';
import { PeptideRenderer } from 'application/render/renderers/PeptideRenderer';
import {
  getFinishedPolymerBond,
  peptideMonomerItem,
  polymerEditorTheme,
} from '../../../mock-data';
import { createPolymerEditorCanvas } from '../../../helpers/dom';
import { SelectRectangle } from 'application/editor/tools/select/SelectRectangle';
import { Vec2 } from 'domain/entities/vec2';
import { RxnArrowMode } from 'domain/entities/rxnArrow';
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
        raise() {
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
    } as MouseEvent;
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
    const fn = jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((func) => {
        func(0);
        return 0;
      });
    // TODO: Probably mock Editor/TransientDrawingView better
    editor.transientDrawingView.update = jest.fn();

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
    } as MouseEvent;

    editor.drawingEntitiesManager.selectDrawingEntity(peptide);
    selectRectangleTool.mousedown(event);
    editor.lastCursorPositionOfCanvas.x = initialPosition.x + 100;
    editor.lastCursorPositionOfCanvas.y = initialPosition.y + 100;

    const moveEvent = new MouseEvent('mousemove');

    selectRectangleTool.mousemove(moveEvent);
    selectRectangleTool.mouseup(event);

    expect(onMove).toHaveBeenCalled();
    fn.mockRestore();
  });

  it('should update history on move even if mouseup target lacks renderer data', () => {
    const canvas: SVGSVGElement = createPolymerEditorCanvas();
    const mode = new FlexMode();
    const editor = new CoreEditor({
      theme: polymerEditorTheme,
      canvas,
      mode,
    });
    const selectRectangleTool = new SelectRectangle(editor);
    editor.transientDrawingView.clear = jest.fn();
    editor.transientDrawingView.update = jest.fn();
    const history = new EditorHistory(editor);
    const arrowAddCommand = editor.drawingEntitiesManager.addRxnArrow(
      RxnArrowMode.OpenAngle,
      [new Vec2(0, 0), new Vec2(1, 0)],
    );

    editor.renderersContainer.update(arrowAddCommand);
    const rxnArrow = Array.from(
      editor.drawingEntitiesManager.rxnArrows.values(),
    )[0];

    rxnArrow.turnOnSelection();
    (selectRectangleTool as any).mode = 'moving';
    (selectRectangleTool as any).mousePositionBeforeMove = new Vec2(0, 0);
    (selectRectangleTool as any).mousePositionAfterMove = new Vec2(10, 0);

    const historyLengthBefore = history.historyStack.length;
    selectRectangleTool.mouseup({ target: {} } as MouseEvent);

    expect(history.historyStack.length).toBe(historyLengthBefore + 1);
    history.destroy();
  });
});
