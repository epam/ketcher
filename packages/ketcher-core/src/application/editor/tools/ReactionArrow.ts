import type { CoreEditor } from 'application/editor/Editor';
import { EditorHistory } from 'application/editor/internal';
import type { BaseTool } from 'application/editor/tools/Tool';
import { Coordinates } from 'application/editor/shared/coordinates';
import type { RxnArrow } from 'domain/entities/CoreRxnArrow';
import type { RxnArrowMode } from 'domain/entities/rxnArrow';
import { Vec2 } from 'domain/entities/vec2';
import type { ToolName } from 'application/editor/tools/types';
import assert from 'assert';

class ReactionArrow implements BaseTool {
  static readonly MIN_LENGTH = 0.5;
  static readonly DEFAULT_LENGTH = 1;
  static readonly DRAG_THRESHOLD = 0.01;

  private readonly history: EditorHistory;
  private readonly mode: RxnArrowMode;
  private p0: Vec2 | null = null;
  private arrow?: RxnArrow;
  private isDragging = false;

  constructor(
    private readonly editor: CoreEditor,
    options: { toolName: ToolName; mode: RxnArrowMode },
  ) {
    this.history = EditorHistory.getInstance(this.editor);
    this.mode = options.mode;
  }

  public mousedown() {
    this.p0 = Coordinates.canvasToModel(this.editor.lastCursorPositionOfCanvas);
    this.arrow = undefined;
    this.isDragging = false;
  }

  public mousemove(event: MouseEvent) {
    if (!this.p0) {
      return;
    }

    const current = Coordinates.canvasToModel(
      this.editor.lastCursorPositionOfCanvas,
    );
    const diff = Vec2.diff(current, this.p0);

    if (diff.length() > ReactionArrow.DRAG_THRESHOLD) {
      this.isDragging = true;
    }

    if (!this.isDragging) {
      return;
    }

    if (!this.arrow) {
      const addCommand = this.editor.drawingEntitiesManager.addRxnArrow(
        this.mode,
        [this.p0, this.p0],
      );
      addCommand.execute(this.editor.renderersContainer);
      this.arrow = addCommand.operations[0].rxnArrow;
    }

    assert(this.arrow);

    const resizeCommand = this.editor.drawingEntitiesManager.resizeRxnArrow(
      this.arrow,
      1,
      current,
      { isSnappingEnabled: !event.ctrlKey },
    );
    this.editor.renderersContainer.update(resizeCommand);
  }

  public mouseup() {
    if (!this.p0) {
      return;
    }

    if (this.arrow && this.isDragging) {
      const end = this.getArrowWithMinimalLengthEnd(
        this.p0,
        this.arrow.endPosition,
      );
      const deleteCommand = this.editor.drawingEntitiesManager.deleteRxnArrow(
        this.arrow,
      );
      deleteCommand.execute(this.editor.renderersContainer);

      const addCommand = this.editor.drawingEntitiesManager.addRxnArrow(
        this.mode,
        [this.p0, end],
      );
      this.history.update(addCommand);
      addCommand.execute(this.editor.renderersContainer);
    } else if (!this.arrow) {
      const end = this.getArrowWithMinimalLengthEnd(this.p0, null);
      const addCommand = this.editor.drawingEntitiesManager.addRxnArrow(
        this.mode,
        [this.p0, end],
      );
      this.history.update(addCommand);
      addCommand.execute(this.editor.renderersContainer);
    }

    this.p0 = null;
    this.arrow = undefined;
    this.isDragging = false;
  }

  public destroy() {
    if (this.arrow) {
      const deleteCommand = this.editor.drawingEntitiesManager.deleteRxnArrow(
        this.arrow,
      );
      this.editor.renderersContainer.update(deleteCommand);
    }
    this.p0 = null;
    this.arrow = undefined;
    this.isDragging = false;
  }

  private getArrowWithMinimalLengthEnd(start: Vec2, end: Vec2 | null): Vec2 {
    if (!end) {
      return new Vec2(start.x + ReactionArrow.DEFAULT_LENGTH, start.y);
    }

    const length = Vec2.dist(start, end);

    return length < ReactionArrow.MIN_LENGTH
      ? new Vec2(
          Vec2.findSecondPoint(
            start,
            ReactionArrow.DEFAULT_LENGTH,
            Vec2.oxAngleForVector(start, end),
          ),
        )
      : end;
  }
}

export { ReactionArrow };
