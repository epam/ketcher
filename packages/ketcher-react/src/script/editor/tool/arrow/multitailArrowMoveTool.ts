import {
  ArrowMoveTool,
  CommonArrowDragContext,
  MultitailArrowClosestItem,
} from './arrow.types';
import {
  CoordinateTransformation,
  MultitailArrowRefName,
  fromMultitailArrowHeadTailMove,
  fromMultitailArrowHeadTailsResize,
  fromMultitailArrowMove,
  Action,
} from 'ketcher-core';
import { ArrowTool } from './arrowTool';

export class MultitailArrowMoveTool
  extends ArrowTool
  implements ArrowMoveTool<MultitailArrowClosestItem>
{
  mousedown(event: PointerEvent, closestItem: MultitailArrowClosestItem) {
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
    dragContext: CommonArrowDragContext<MultitailArrowClosestItem>,
  ): Action {
    const { closestItem, originalPosition } = dragContext;
    const current = CoordinateTransformation.pageToModel(event, this.render);
    const offset = current.sub(originalPosition);
    const ref = closestItem.ref;
    if (ref && ref.name !== MultitailArrowRefName.SPINE) {
      if (ref.isLine) {
        return fromMultitailArrowHeadTailMove(
          this.reStruct,
          closestItem.id,
          ref,
          offset.y,
        );
      } else {
        return fromMultitailArrowHeadTailsResize(
          this.reStruct,
          dragContext.closestItem.id,
          ref,
          offset.x,
        );
      }
    } else {
      return fromMultitailArrowMove(this.reStruct, closestItem.id, offset);
    }
  }

  mouseup(
    event: PointerEvent,
    dragContext: CommonArrowDragContext<MultitailArrowClosestItem>,
  ) {
    const { action, closestItem } = dragContext;
    if (
      action &&
      closestItem.ref &&
      closestItem.ref.isLine &&
      closestItem.ref.name === 'tails'
    ) {
      const current = CoordinateTransformation.pageToModel(event, this.render);
      const offset = current.sub(dragContext.originalPosition);
      action.perform(this.reStruct);
      return fromMultitailArrowHeadTailMove(
        this.reStruct,
        closestItem.id,
        closestItem.ref,
        offset.y,
        true,
      );
    }
    return action;
  }
}
