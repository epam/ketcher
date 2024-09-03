import {
  ArrowMoveTool,
  CommonArrowDragContext,
  ReactionArrowClosestItem,
} from './arrow.types';
import {
  CoordinateTransformation,
  fromArrowResizing,
  fromMultipleMove,
} from 'ketcher-core';
import assert from 'assert';
import { ArrowTool } from './arrowTool';

export class ReactionArrowMoveTool
  extends ArrowTool
  implements ArrowMoveTool<ReactionArrowClosestItem>
{
  private updateResizingState(
    closestItem: ReactionArrowClosestItem,
    isResizing: boolean,
  ) {
    if (closestItem.map === 'rxnArrows') {
      const reArrow = this.reStruct.rxnArrows.get(closestItem.id);
      assert(reArrow != null);
      reArrow.isResizing = isResizing;
    }
  }

  mousedown(event: PointerEvent, closestItem: ReactionArrowClosestItem) {
    return {
      originalPosition: CoordinateTransformation.pageToModel(
        event,
        this.editor.render,
      ),
      action: null,
      closestItem,
    };
  }

  mousemove(
    event: PointerEvent,
    dragContext: CommonArrowDragContext<ReactionArrowClosestItem>,
  ) {
    const { closestItem, originalPosition } = dragContext;
    const current = CoordinateTransformation.pageToModel(event, this.render);
    const offset = this.getOffset(event, originalPosition);
    if (!closestItem.ref) {
      return fromMultipleMove(
        this.reStruct,
        this.editor.selection() || {},
        offset,
      );
    } else {
      this.updateResizingState(closestItem, true);
      const isSnappingEnabled = !event.ctrlKey;
      return fromArrowResizing(
        this.reStruct,
        closestItem.id,
        offset,
        current,
        closestItem.ref,
        isSnappingEnabled,
      );
    }
  }

  mouseup(
    _event: PointerEvent,
    dragContext: CommonArrowDragContext<ReactionArrowClosestItem>,
  ) {
    if (dragContext.action) {
      this.updateResizingState(dragContext.closestItem, false);
    }
    return dragContext.action;
  }
}
