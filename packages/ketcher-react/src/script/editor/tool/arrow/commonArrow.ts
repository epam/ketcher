import { Tool } from '../Tool';
import Editor from '../../Editor';
import {
  Vec2,
  RxnArrowMode,
  Action,
  fromArrowResizing,
  fromMultipleMove,
  MULTITAIL_ARROW_KEY,
  MULTITAIL_ARROW_TOOL_NAME,
  CoordinateTransformation,
  fromMultitailArrowMove,
} from 'ketcher-core';
import { ArrowAddTool } from './arrow.types';
import { ReactionArrowAddTool } from './reactionArrowAdd';
import { MultitailArrowAddTool } from './multitailArrowAdd';
import { ClosestItemWithMap } from '../../shared/closest.types';
import assert from 'assert';
import { handleMovingPosibilityCursor } from '../../utils';

type ReactionArrowClosestItem = ClosestItemWithMap<Vec2, 'rxnArrows'>;
type MultitailArrowClosestItem = ClosestItemWithMap<
  unknown,
  typeof MULTITAIL_ARROW_TOOL_NAME
>;

interface CommonArrowDragContext {
  originalPosition: Vec2;
  action: Action | null;
  closestItem: ReactionArrowClosestItem | MultitailArrowClosestItem;
}

export class CommonArrowTool implements Tool {
  private dragContext: CommonArrowDragContext | 'add' | null = null;
  private addTool: ArrowAddTool;

  constructor(
    private readonly editor: Editor,
    mode: RxnArrowMode | typeof MULTITAIL_ARROW_TOOL_NAME,
  ) {
    this.editor.selection(null);
    this.addTool =
      mode === MULTITAIL_ARROW_TOOL_NAME
        ? new MultitailArrowAddTool(this.editor)
        : new ReactionArrowAddTool(this.editor, mode);
  }

  private get render() {
    return this.editor.render;
  }

  private get reStruct() {
    return this.render.ctab;
  }

  private updateResizingState(
    closestItem: CommonArrowDragContext['closestItem'],
    isResizing: boolean,
  ) {
    if (closestItem.map === 'rxnArrows') {
      const reArrow = this.reStruct.rxnArrows.get(closestItem.id);
      assert(reArrow != null);
      reArrow.isResizing = isResizing;
    }
  }

  mousedown(event: MouseEvent) {
    const closestItem = this.editor.findItem(event, [
      'rxnArrows',
      MULTITAIL_ARROW_KEY,
    ]) as ReactionArrowClosestItem | MultitailArrowClosestItem;

    if (closestItem) {
      this.dragContext = {
        originalPosition: CoordinateTransformation.pageToModel(
          event,
          this.editor.render,
        ),
        action: null,
        closestItem,
      };
      this.editor.hover(null);
      this.editor.selection({ [closestItem.map]: [closestItem.id] });
    } else {
      this.dragContext = 'add';
      this.addTool.mousedown(event);
      this.editor.selection(null);
    }
  }

  mousemove(event: PointerEvent) {
    if (!this.dragContext) {
      const items = this.editor.findItem(event, [
        'rxnArrows',
        MULTITAIL_ARROW_KEY,
      ]);
      this.editor.hover(items, null, event);
      handleMovingPosibilityCursor(
        items,
        this.editor.render.paper.canvas,
        this.editor.render.options.movingStyle.cursor as string,
      );
      return;
    }
    if (this.dragContext === 'add') {
      return this.addTool.mousemove(event);
    }
    const current = CoordinateTransformation.pageToModel(event, this.render);
    const offset = current.sub(this.dragContext.originalPosition);

    const { action, closestItem } = this.dragContext;
    if (action) {
      action.perform(this.reStruct);
    }
    if (closestItem.map === 'rxnArrows') {
      if (!closestItem.ref) {
        this.dragContext.action = fromMultipleMove(
          this.reStruct,
          this.editor.selection() || {},
          offset,
        );
      } else {
        this.updateResizingState(closestItem, true);
        const isSnappingEnabled = !event.ctrlKey;
        this.dragContext.action = fromArrowResizing(
          this.reStruct,
          closestItem.id,
          offset,
          current,
          closestItem.ref,
          isSnappingEnabled,
        );
      }
    } else {
      this.dragContext.action = fromMultitailArrowMove(
        this.reStruct,
        closestItem.id,
        offset,
      );
    }
    this.editor.update(this.dragContext.action, true);
  }

  mouseup(event: MouseEvent) {
    try {
      if (!this.dragContext) return;
      if (this.dragContext === 'add') {
        return this.addTool.mouseup(event);
      }

      const { action, closestItem } = this.dragContext;
      if (closestItem.map === 'rxnArrows' && action) {
        this.updateResizingState(closestItem, false);
      }
      if (action) {
        this.editor.update(true);
        this.editor.update(action);
      }
    } finally {
      this.dragContext = null;
    }
  }
}
