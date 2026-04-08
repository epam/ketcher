import { CoreEditor, FlexMode } from 'application/editor';
import { ClearTool } from 'application/editor/tools/Clear';
import { EditorHistory } from 'application/editor/EditorHistory';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { polymerEditorTheme, peptideMonomerItem } from '../../../mock-data';
import { createPolymerEditorCanvas } from '../../../helpers/dom';
import { Vec2 } from 'domain/entities';

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
        selectAll() {
          return this;
        },
        text() {
          return this;
        },
        remove() {
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

describe('Clear Tool', () => {
  let canvas: SVGSVGElement;
  let editor: CoreEditor;
  let clearCanvas: () => ClearTool;

  beforeEach(() => {
    DrawingEntity.resetIdCounter();
    canvas = createPolymerEditorCanvas();
    editor = new CoreEditor({
      theme: polymerEditorTheme,
      canvas,
      mode: new FlexMode(),
    });
    clearCanvas = () => new ClearTool(editor);
  });

  afterEach(() => {
    jest.clearAllMocks();
    EditorHistory.getInstance(editor).destroy();
  });

  it('should not call clear on transientDrawingView when canvas is already empty', () => {
    const clearSpy = jest.spyOn(editor.transientDrawingView, 'clear');

    // Try to clear empty canvas - verify hasDrawingEntities is false
    expect(editor.drawingEntitiesManager.hasDrawingEntities).toBe(false);

    clearCanvas();

    // transientDrawingView.clear should not be called because we return early
    expect(clearSpy).not.toHaveBeenCalled();
  });

  it('should verify hasDrawingEntities is true when entities exist', () => {
    // Add a monomer to the canvas
    const modelChanges = editor.drawingEntitiesManager.addMonomer(
      peptideMonomerItem,
      new Vec2(100, 100),
    );
    editor.renderersContainer.update(modelChanges);

    // Verify entities exist
    expect(editor.drawingEntitiesManager.hasDrawingEntities).toBe(true);
  });

  it('should reset drawing entity ids after clear canvas', () => {
    editor.renderersContainer.update(
      editor.drawingEntitiesManager.addMonomer(
        peptideMonomerItem,
        new Vec2(100, 100),
      ),
    );
    editor.renderersContainer.update(
      editor.drawingEntitiesManager.addMonomer(
        peptideMonomerItem,
        new Vec2(200, 100),
      ),
    );

    clearCanvas();

    editor.renderersContainer.update(
      editor.drawingEntitiesManager.addMonomer(
        peptideMonomerItem,
        new Vec2(300, 100),
      ),
    );

    expect(editor.drawingEntitiesManager.monomersArray[0]?.id).toBe(0);
  });

  it('should restore drawing entity id counter after undoing clear canvas', () => {
    editor.renderersContainer.update(
      editor.drawingEntitiesManager.addMonomer(
        peptideMonomerItem,
        new Vec2(100, 100),
      ),
    );
    editor.renderersContainer.update(
      editor.drawingEntitiesManager.addMonomer(
        peptideMonomerItem,
        new Vec2(200, 100),
      ),
    );

    const clearTool = new ClearTool(editor);

    expect(clearTool).toBeInstanceOf(ClearTool);

    EditorHistory.getInstance(editor).undo();

    editor.renderersContainer.update(
      editor.drawingEntitiesManager.addMonomer(
        peptideMonomerItem,
        new Vec2(300, 100),
      ),
    );

    expect(editor.drawingEntitiesManager.monomersArray[2]?.id).toBe(2);
  });
});
