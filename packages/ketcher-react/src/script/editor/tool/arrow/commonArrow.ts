import { Tool } from '../Tool';
import Editor from '../../Editor';
import {
  MULTITAIL_ARROW_KEY,
  MULTITAIL_ARROW_TOOL_NAME,
  RxnArrowMode,
} from 'ketcher-core';
import {
  ArrowAddTool,
  ArrowMoveTool,
  CommonArrowDragContext,
  MultitailArrowClosestItem,
  ReactionArrowClosestItem,
} from './arrow.types';
import { ReactionArrowAddTool } from './reactionArrowAdd';
import { MultitailArrowAddTool } from './multitailArrowAdd';
import { handleMovingPosibilityCursor } from '../../utils';
import { MultitailArrowMoveTool } from './multitailArrowMoveTool';
import { ArrowTool } from './arrowTool';
import { ReactionArrowMoveTool } from './reactionArrowMoveTool';
import { getItemCursor } from '../../utils/getItemCursor';

export class CommonArrowTool extends ArrowTool implements Tool {
  static isDragContextMultitail(
    dragContext: CommonArrowDragContext<
      MultitailArrowClosestItem | ReactionArrowClosestItem
    >,
  ): dragContext is CommonArrowDragContext<MultitailArrowClosestItem> {
    return dragContext.closestItem.map === MULTITAIL_ARROW_KEY;
  }

  static isDragContextReaction(
    dragContext: CommonArrowDragContext<
      MultitailArrowClosestItem | ReactionArrowClosestItem
    >,
  ): dragContext is CommonArrowDragContext<ReactionArrowClosestItem> {
    return dragContext.closestItem.map === 'rxnArrows';
  }

  private dragContext:
    | CommonArrowDragContext<
        MultitailArrowClosestItem | ReactionArrowClosestItem
      >
    | 'add'
    | null = null;

  private addTool: ArrowAddTool;
  private multitailMoveTool: ArrowMoveTool<MultitailArrowClosestItem>;
  private reactionMoveTool: ArrowMoveTool<ReactionArrowClosestItem>;

  constructor(
    editor: Editor,
    mode: RxnArrowMode | typeof MULTITAIL_ARROW_TOOL_NAME,
  ) {
    super(editor);
    this.multitailMoveTool = new MultitailArrowMoveTool(this.editor);
    this.reactionMoveTool = new ReactionArrowMoveTool(this.editor);
    this.editor.selection(null);
    this.addTool =
      mode === MULTITAIL_ARROW_TOOL_NAME
        ? new MultitailArrowAddTool(this.editor)
        : new ReactionArrowAddTool(this.editor, mode);
  }

  mousedown(event: PointerEvent) {
    const closestItem = this.editor.findItem(event, [
      'rxnArrows',
      MULTITAIL_ARROW_KEY,
    ]) as ReactionArrowClosestItem | MultitailArrowClosestItem;

    if (closestItem) {
      this.dragContext =
        closestItem.map === MULTITAIL_ARROW_KEY
          ? this.multitailMoveTool.mousedown(event, closestItem)
          : this.reactionMoveTool.mousedown(event, closestItem);

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
      const closestItem = this.editor.findItem(event, [
        'rxnArrows',
        MULTITAIL_ARROW_KEY,
      ]) as ReactionArrowClosestItem | MultitailArrowClosestItem;
      this.editor.hover(closestItem, null, event);
      handleMovingPosibilityCursor(
        closestItem,
        this.render.paper.canvas,
        getItemCursor(this.render, closestItem),
      );
      return;
    }
    if (this.dragContext === 'add') {
      return this.addTool.mousemove(event);
    }

    if (this.dragContext.action) {
      this.dragContext.action.perform(this.reStruct);
    }
    if (CommonArrowTool.isDragContextMultitail(this.dragContext)) {
      this.dragContext.action = this.multitailMoveTool.mousemove(
        event,
        this.dragContext,
      );
    } else {
      // Otherwise build fails during prod build but not dev
      const dragContext = this
        .dragContext as CommonArrowDragContext<ReactionArrowClosestItem>;
      dragContext.action = this.reactionMoveTool.mousemove(event, dragContext);
    }
    if (this.dragContext.action) {
      this.editor.update(this.dragContext.action, true);
    }
  }

  mouseup(event: PointerEvent) {
    try {
      if (!this.dragContext) return;
      if (this.dragContext === 'add') {
        return this.addTool.mouseup(event);
      }
      if (CommonArrowTool.isDragContextMultitail(this.dragContext)) {
        this.dragContext.action = this.multitailMoveTool.mouseup(
          event,
          this.dragContext,
        );
      } else {
        // Otherwise build fails during prod build but not dev
        const dragContext = this
          .dragContext as CommonArrowDragContext<ReactionArrowClosestItem>;
        dragContext.action = this.reactionMoveTool.mouseup(event, dragContext);
      }
      const { action } = this.dragContext;
      if (action) {
        this.editor.update(true);
        this.editor.update(action);
      }
    } finally {
      this.dragContext = null;
    }
  }
}
