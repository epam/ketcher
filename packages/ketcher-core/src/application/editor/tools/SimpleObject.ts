import type { CoreEditor } from 'application/editor/Editor';
import { EditorHistory } from 'application/editor/EditorHistory';
import { Coordinates } from 'application/editor/shared/coordinates';
import type { BaseTool } from 'application/editor/tools/Tool';
import { ToolName } from 'application/editor/tools/types';
import { makeCircleFromEllipse } from 'application/render/renderers/simpleObjectGeometry';
import { SimpleObjectMode } from 'domain/entities/simpleObject';
import { Vec2 } from 'domain/entities/vec2';

const MIN_CANVAS_SIZE = 2;

const TOOL_MODES: Partial<Record<ToolName, SimpleObjectMode>> = {
  [ToolName.shapeRectangle]: SimpleObjectMode.rectangle,
  [ToolName.shapeEllipse]: SimpleObjectMode.ellipse,
  [ToolName.shapeLine]: SimpleObjectMode.line,
};

export class SimpleObjectTool implements BaseTool {
  private readonly mode: SimpleObjectMode;
  private startCanvasPosition: Vec2 | undefined;

  constructor(
    private readonly editor: CoreEditor,
    ...arguments_: unknown[]
  ) {
    const [options] = arguments_ as [{ toolName: ToolName }?];
    this.mode =
      (options && TOOL_MODES[options.toolName]) ?? SimpleObjectMode.rectangle;
  }

  public mousedown() {
    this.startCanvasPosition = new Vec2(this.editor.lastCursorPositionOfCanvas);
  }

  public mousemove(event: MouseEvent) {
    if (!this.startCanvasPosition) {
      return;
    }

    this.editor.transientDrawingView.showSimpleObjectPreview({
      mode: this.mode,
      start: this.startCanvasPosition,
      end: this.getCanvasEnd(this.startCanvasPosition, event.shiftKey),
    });
    this.editor.transientDrawingView.update();
  }

  public mouseup(event: MouseEvent) {
    const start = this.startCanvasPosition;
    this.startCanvasPosition = undefined;
    this.clearPreview();

    if (start) {
      const end = this.getCanvasEnd(start, event.shiftKey);

      if (Vec2.diff(end, start).length() >= MIN_CANVAS_SIZE) {
        const command = this.editor.drawingEntitiesManager.addSimpleObject(
          this.mode,
          Coordinates.canvasToModel(start),
          Coordinates.canvasToModel(end),
        );
        this.editor.renderersContainer.update(command);
        EditorHistory.getInstance(this.editor).update(command);
      }
    }

    this.editor.events.selectTool.dispatch([ToolName.selectRectangle]);
  }

  public destroy() {
    this.clearPreview();
  }

  private getCanvasEnd(start: Vec2, isShiftPressed: boolean): Vec2 {
    const end = new Vec2(this.editor.lastCursorPositionOfCanvas);

    if (!isShiftPressed || this.mode === SimpleObjectMode.line) {
      return end;
    }

    return makeCircleFromEllipse(start, end);
  }

  private clearPreview() {
    this.editor.transientDrawingView.hideSimpleObjectPreview();
    this.editor.transientDrawingView.update();
  }
}
