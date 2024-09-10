import {
  Vec2,
  CoordinateTransformation,
  RxnArrowMode,
  Action,
  fromArrowAddition,
  fromArrowDeletion,
  fromArrowResizing,
} from 'ketcher-core';
import { Editor } from '../../Editor';
import assert from 'assert';
import { ArrowAddTool } from './arrow.types';

interface BaseDragContext {
  p0: Vec2;
}

interface InitialDragContext extends BaseDragContext {
  p0: Vec2;
  action: null;
  itemId: null;
}

interface DragContextInProgress extends BaseDragContext {
  action: Action;
  itemId: number;
}

type ReactionArrowDragContext = InitialDragContext | DragContextInProgress;

export class ReactionArrowAddTool implements ArrowAddTool {
  static MIN_LENGTH = 1.5;
  static DEFAULT_LENGTH = 2;

  private dragCtx: ReactionArrowDragContext | null = null;

  // eslint-disable-next-line no-useless-constructor
  constructor(private editor: Editor, private mode: RxnArrowMode) {}

  private get render() {
    return this.editor.render;
  }

  private get reStruct() {
    return this.render.ctab;
  }

  mousedown(event: MouseEvent) {
    this.dragCtx = {
      p0: CoordinateTransformation.pageToModel(event, this.render),
      action: null,
      itemId: null,
    };
  }

  mousemove(event: MouseEvent) {
    if (!this.dragCtx) return;
    const current = CoordinateTransformation.pageToModel(event, this.render);
    const diff = current.sub(this.dragCtx.p0);
    if (!this.dragCtx.action) {
      const action = fromArrowAddition(
        this.reStruct,
        [this.dragCtx.p0, this.dragCtx.p0],
        this.mode,
      );
      // TODO: need to rework  actions/operations logic
      this.dragCtx = {
        ...this.dragCtx,
        itemId: action.operations[0].data.id,
        action,
      };
      this.editor.update(this.dragCtx.action, true);
    } else {
      this.dragCtx.action.perform(this.reStruct);
    }

    this.updateResizingState(this.dragCtx.itemId, true);
    const isSnappingEnabled = !event.ctrlKey;
    this.dragCtx.action = fromArrowResizing(
      this.reStruct,
      this.dragCtx.itemId,
      diff,
      current,
      null,
      isSnappingEnabled,
    );
    this.editor.update(this.dragCtx.action, true);
  }

  mouseup(event: MouseEvent) {
    if (!this.dragCtx) return;
    if (this.dragCtx.action) {
      this.dragCtx = this.addNewArrowWithDragging(this.dragCtx);
      this.editor.update(this.dragCtx.action);
    } else {
      this.addNewArrowWithClicking(event);
    }
    this.dragCtx = null;
  }

  private getArrowWithMinimalLengthEnd(start: Vec2, end: Vec2 | null): Vec2 {
    if (!end) {
      return new Vec2(start.x + ReactionArrowAddTool.DEFAULT_LENGTH, start.y);
    }
    const length = Vec2.dist(start, end);
    return length < ReactionArrowAddTool.MIN_LENGTH
      ? new Vec2(
          Vec2.findSecondPoint(
            start,
            ReactionArrowAddTool.DEFAULT_LENGTH,
            Vec2.oxAngleForVector(start, end),
          ),
        )
      : end;
  }

  private addNewArrowWithDragging(
    dragContext: DragContextInProgress,
  ): DragContextInProgress {
    const item = this.reStruct.molecule.rxnArrows.get(dragContext.itemId);
    assert(item != null);
    let [p0, p1] = item.pos;
    p1 = this.getArrowWithMinimalLengthEnd(p0, p1);
    this.editor.update(
      fromArrowDeletion(this.reStruct, dragContext.itemId),
      true,
    );
    return {
      ...dragContext,
      action: fromArrowAddition(this.reStruct, [p0, p1], this.mode),
    };
  }

  private addNewArrowWithClicking(event) {
    const ci = this.editor.findItem(event, ['rxnArrows']);
    const p0 = this.render.page2obj(event);

    if (!ci) {
      const pos = [p0, this.getArrowWithMinimalLengthEnd(p0, null)];
      this.editor.update(fromArrowAddition(this.reStruct, pos, this.mode));
    }
  }

  private updateResizingState(arrowId: number, isResizing: boolean) {
    const reArrow = this.reStruct.rxnArrows.get(arrowId);
    assert(reArrow != null);
    reArrow.isResizing = isResizing;
  }
}
